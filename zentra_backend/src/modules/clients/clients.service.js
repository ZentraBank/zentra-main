const bcrypt = require("bcryptjs");
const { randomBytes } = require("crypto");

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

module.exports = {
  create,
  list,
  get,
  uploadAvatar,
  getAvatar,
};