const bcrypt = require("bcryptjs");
const {
  randomBytes,
  createHash,
  randomUUID,
} = require("crypto");

const authRepo = require("../auth/auth.repository");
const accountsRepo = require("../accounts/accounts.repository");


const {
  storePrivateFile,
  readPrivateFile,
} = require(
  "../../services/private-file.service"
);

const generateAccountNumber = require(
  "../../utils/generateAccountNumber"
);

const repo = require("./clients.repository");

const httpError = (
  statusCode,
  message
) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const generateTemporaryPassword = () =>
  `Zb${randomBytes(6).toString("hex")}7`;

const generateInviteCode = () => {
  const raw = randomBytes(5)
    .toString("hex")
    .toUpperCase();

  return `ZB-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 10)}`;
};

const hashInviteCode = (code) =>
  createHash("sha256")
    .update(code)
    .digest("hex");

const buildInviteHint = (code) => {
  const parts = code.split("-");

  return `${parts[0]}-••••-${parts.at(-1)}`;
};

const normalizeInviteEmail = (
  email
) =>
  email
    ? email.trim().toLowerCase()
    : null;

const splitAccountName = ({
  firstName,
  middleName,
  lastName,
}) =>
  [
    firstName,
    middleName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

const createUniqueAccountNumber =
  async (tenantId) => {
    for (
      let attempt = 0;
      attempt < 10;
      attempt += 1
    ) {
      const candidate =
        generateAccountNumber();

      const exists =
        await accountsRepo.existsByNumber({
          accountNumber: candidate,
          tenantId,
        });

      if (!exists) {
        return candidate;
      }
    }

    throw httpError(
      500,
      "Unable to generate a unique account number"
    );
  };

const create = async ({
  tenantId,
  body,
}) => {
  const normalizedEmail =
    body.email.trim().toLowerCase();

  const existing =
    await authRepo.findAnyUserByEmail(
      normalizedEmail
    );

  if (existing) {
    throw httpError(
      409,
      "An account already exists with this email"
    );
  }

  const role =
    await authRepo.findCustomerRole(
      tenantId
    );

  if (!role) {
    throw httpError(
      500,
      "Customer role is not configured for this tenant"
    );
  }

  const passwordWasProvided =
    Boolean(
      body.password &&
        body.password.trim()
    );

  const clientPassword =
    passwordWasProvided
      ? body.password.trim()
      : generateTemporaryPassword();

  const passwordHash =
    await bcrypt.hash(
      clientPassword,
      12
    );

  const created =
    await authRepo.createRegisteredCustomer({
      tenantId,

      roleId: role.id,

      firstName:
        body.firstName.trim(),

      middleName:
        body.middleName?.trim() ||
        null,

      lastName:
        body.lastName.trim(),

      email:
        normalizedEmail,

      phone:
        body.phone?.trim() ||
        null,

      passwordHash,
    });

  let account = null;

  if (body.account) {
    const accountNumber =
      await createUniqueAccountNumber(
        tenantId
      );

    account =
      await accountsRepo.create({
        userId:
          created.userId,

        tenantId,

        accountNumber,

        accountName:
          body.account.accountName?.trim() ||
          splitAccountName(body),

        accountType:
          body.account.accountType ||
          "savings",

        currency:
          body.account.currency ||
          "USD",
      });

    if (
      body.account.status &&
      body.account.status !==
        "active"
    ) {
      account =
        await accountsRepo.updateStatus({
          accountId: account.id,
          tenantId,
          status:
            body.account.status,
        });
    }
  }

  const client =
    await repo.findById({
      tenantId,
      clientId:
        created.userId,
    });

  if (!client) {
    throw httpError(
      500,
      "Client was created but could not be loaded"
    );
  }

  return {
    client,
    account,

    ...(
      passwordWasProvided
        ? {}
        : {
            temporaryPassword:
              clientPassword,
          }
    ),
  };
};

const list = ({
  tenantId,
}) =>
  repo.listByTenant({
    tenantId,
  });

const get = async ({
  tenantId,
  clientId,
}) => {
  const client =
    await repo.findById({
      tenantId,
      clientId,
    });

  if (!client) {
    throw httpError(
      404,
      "Client not found"
    );
  }

  const accounts =
    await accountsRepo.findByUser({
      userId: clientId,
      tenantId,
    });

  return {
    ...client,
    accounts,
  };
};

const uploadAvatar = async ({
  tenantId,
  clientId,
  file,
}) => {
  const client =
    await repo.findById({
      tenantId,
      clientId,
    });

  if (!client) {
    throw httpError(
      404,
      "Client not found"
    );
  }

  const allowedImageTypes =
    new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

  if (
    !allowedImageTypes.has(
      file.mimetype
    )
  ) {
    throw httpError(
      422,
      "Profile picture must be a JPG, PNG or WEBP image"
    );
  }

  const stored =
    await storePrivateFile({
      tenantId,
      userId: clientId,
      module: "client_avatar",
      documentType:
        "profile_picture",
      file,
    });

  const avatarUrl =
    `/api/v1/clients/${clientId}/avatar`;

  const updated =
    await repo.updateAvatar({
      tenantId,
      clientId,
      avatarUrl,
      storagePath:
        stored.storagePath,
      mimeType:
        stored.mimeType,
    });

  if (!updated) {
    throw httpError(
      500,
      "Profile picture was stored but the client profile could not be updated"
    );
  }

  const refreshed =
    await repo.findById({
      tenantId,
      clientId,
    });

  return {
    client: refreshed,

    avatar: {
      url: avatarUrl,
      fileId: stored.id,
      originalName:
        stored.originalName,
      mimeType:
        stored.mimeType,
      sizeBytes: Number(
        stored.sizeBytes
      ),
    },
  };
};

const getAvatar = async ({
  tenantId,
  clientId,
}) => {
  const client =
    await repo.findById({
      tenantId,
      clientId,
    });

  if (!client) {
    throw httpError(
      404,
      "Client not found"
    );
  }

  if (
    !client.avatar_storage_path ||
    !client.avatar_mime_type
  ) {
    throw httpError(
      404,
      "Client profile picture not found"
    );
  }

  const buffer =
    await readPrivateFile({
      storagePath:
        client.avatar_storage_path,
    });

  return {
    buffer,
    mimeType:
      client.avatar_mime_type,
  };
};

const resetPassword = async ({
  tenantId,
  clientId,
  password,
}) => {
  const client =
    await repo.findById({
      tenantId,
      clientId,
    });

  if (!client) {
    throw httpError(
      404,
      "Client not found"
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  const updated =
    await repo.updatePassword({
      tenantId,
      clientId,
      passwordHash,
    });

  if (!updated) {
    throw httpError(
      500,
      "Unable to reset client password"
    );
  }

  return {
    clientId,
    email: client.email,
  };
};

const createInvite = async ({
  tenantId,
  createdByUserId,
  body,
}) => {
  const email =
    normalizeInviteEmail(
      body.email
    );

  const maxUses =
    Number(
      body.maxUses || 1
    );

  if (
    !Number.isInteger(maxUses) ||
    maxUses < 1 ||
    maxUses > 1000
  ) {
    throw httpError(
      422,
      "Invite max uses must be between 1 and 1000"
    );
  }

  let expiresAt = null;

  if (body.expiresAt) {
    const parsed =
      new Date(body.expiresAt);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      throw httpError(
        422,
        "Invite expiry date is invalid"
      );
    }

    if (
      parsed.getTime() <=
      Date.now()
    ) {
      throw httpError(
        422,
        "Invite expiry date must be in the future"
      );
    }

    expiresAt =
      parsed;
  } else {
    expiresAt =
      new Date(
        Date.now() +
          7 *
            24 *
            60 *
            60 *
            1000
      );
  }

  let inviteCode;
  let codeHash;

  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    inviteCode =
      generateInviteCode();

    codeHash =
      hashInviteCode(
        inviteCode
      );

    const existing =
      await repo.findInviteByCodeHash({
        codeHash,
      });

    if (!existing) {
      break;
    }

    inviteCode = null;
    codeHash = null;
  }

  if (
    !inviteCode ||
    !codeHash
  ) {
    throw httpError(
      500,
      "Unable to generate a unique invite code"
    );
  }

  const invite =
    await repo.createInvite({
      id: randomUUID(),

      tenantId,

      createdByUserId,

      codeHash,

      codeHint:
        buildInviteHint(
          inviteCode
        ),

      email,

      maxUses,

      expiresAt,
    });

  if (!invite) {
    throw httpError(
      500,
      "Client invite was created but could not be loaded"
    );
  }

  return {
    ...invite,

    code:
      inviteCode,
  };
};

const listInvites = async ({
  tenantId,
}) => {
  return repo.listInvitesByTenant({
    tenantId,
  });
};

const revokeInvite = async ({
  tenantId,
  inviteId,
}) => {
  const invite =
    await repo.findInviteById({
      tenantId,
      inviteId,
    });

  if (!invite) {
    throw httpError(
      404,
      "Client invite not found"
    );
  }

  if (
    invite.status ===
    "revoked"
  ) {
    throw httpError(
      409,
      "Client invite has already been revoked"
    );
  }

  if (
    invite.status ===
    "expired"
  ) {
    throw httpError(
      409,
      "Expired client invites cannot be revoked"
    );
  }

  if (
    invite.status ===
    "used"
  ) {
    throw httpError(
      409,
      "Used client invites cannot be revoked"
    );
  }

  const revoked =
    await repo.revokeInvite({
      tenantId,
      inviteId,
    });

  if (!revoked) {
    throw httpError(
      409,
      "Client invite can no longer be revoked"
    );
  }

  return repo.findInviteById({
    tenantId,
    inviteId,
  });
};

module.exports = {
  create,
  list,
  get,
  uploadAvatar,
  getAvatar,
  resetPassword,
  createInvite,
  listInvites,
  revokeInvite,
};