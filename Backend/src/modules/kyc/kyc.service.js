const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const repo =
  require("./kyc.repository");

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const createOrUpdate = async ({
  auth,
  body,
}) => {
  const existing =
    await repo.findByUser({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,
    });

  if (
    existing &&
    ["submitted", "under_review", "approved"]
      .includes(existing.status)
  ) {
    throw httpError(
      409,
      `KYC profile cannot be edited while status is ${existing.status}`
    );
  }

  const duplicate =
    await repo.identityExists({
      tenantId:
        auth.tenantId,

      identityType:
        body.identityType,

      identityNumber:
        body.identityNumber,

      excludeProfileId:
        existing?.id || null,
    });

  if (duplicate) {
    throw httpError(
      409,
      "This identity document is already in use"
    );
  }

  const profile =
    existing
      ? await repo.update({
          tenantId:
            auth.tenantId,

          profileId:
            existing.id,

          body,
        })
      : await repo.create({
          tenantId:
            auth.tenantId,

          userId:
            auth.userId,

          body,
        });

  await repo.createEvent({
    tenantId:
      auth.tenantId,

    profileId:
      profile.id,

    userId:
      auth.userId,

    actorUserId:
      auth.userId,

    eventType:
      existing
        ? "kyc_profile_updated"
        : "kyc_profile_created",
  });

  return profile;
};

const getMine = async ({
  auth,
}) => {
  const profile =
    await repo.findByUser({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,
    });

  if (!profile) {
    throw httpError(
      404,
      "KYC profile not found"
    );
  }

  const documents =
    await repo.listDocuments({
      tenantId:
        auth.tenantId,

      profileId:
        profile.id,
    });

  return {
    ...profile,
    documents,
  };
};

const addDocument = async ({
  auth,
  body,
}) => {
  const profile =
    await repo.findByUser({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,
    });

  if (!profile) {
    throw httpError(
      404,
      "Create your KYC profile before uploading documents"
    );
  }

  if (
    ["submitted", "under_review", "approved"]
      .includes(profile.status)
  ) {
    throw httpError(
      409,
      `Documents cannot be changed while KYC status is ${profile.status}`
    );
  }

  const documentId =
    await repo.addDocument({
      tenantId:
        auth.tenantId,

      profileId:
        profile.id,

      userId:
        auth.userId,

      documentType:
        body.documentType,

      fileUrl:
        body.fileUrl,

      fileName:
        body.fileName,

      mimeType:
        body.mimeType,
    });

  await repo.createEvent({
    tenantId:
      auth.tenantId,

    profileId:
      profile.id,

    userId:
      auth.userId,

    actorUserId:
      auth.userId,

    eventType:
      "kyc_document_uploaded",

    metadata: {
      documentId,
      documentType:
        body.documentType,
    },
  });

  return {
    documentId,
  };
};

const uploadDocumentFile = async ({ auth, body, request }) => {
  const profile = await repo.findByUser({
    tenantId: auth.tenantId,
    userId: auth.userId,
  });

  if (!profile) {
    throw httpError(404, "Create your KYC profile before uploading documents");
  }

  if (["submitted", "under_review", "approved"].includes(profile.status)) {
    throw httpError(409, `Documents cannot be changed while KYC status is ${profile.status}`);
  }

  const raw = body.base64Data.includes(",")
    ? body.base64Data.split(",").pop()
    : body.base64Data;
  const buffer = Buffer.from(raw, "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
    throw httpError(413, "KYC documents must be 5 MB or smaller");
  }

  const extByMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  const extension = extByMime[body.mimeType];
  const storedName = `${crypto.randomUUID()}.${extension}`;
  const relativeDir = path.join("kyc", String(auth.tenantId), String(auth.userId));
  const uploadRoot = path.resolve(process.cwd(), "uploads");
  const targetDir = path.join(uploadRoot, relativeDir);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, storedName), buffer, { flag: "wx" });

  const baseUrl = `${request.protocol}://${request.get("host")}`;
  const fileUrl = `${baseUrl}/uploads/${relativeDir.split(path.sep).join("/")}/${storedName}`;

  const result = await addDocument({
    auth,
    body: {
      documentType: body.documentType,
      fileUrl,
      fileName: body.fileName,
      mimeType: body.mimeType,
    },
  });

  return { ...result, fileUrl, fileName: body.fileName, mimeType: body.mimeType };
};

const submit = async ({
  auth,
}) => {
  const profile =
    await repo.findByUser({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,
    });

  if (!profile) {
    throw httpError(
      404,
      "KYC profile not found"
    );
  }

  if (
    !["draft", "rejected"]
      .includes(profile.status)
  ) {
    throw httpError(
      409,
      `KYC cannot be submitted while status is ${profile.status}`
    );
  }

  const documents =
    await repo.listDocuments({
      tenantId:
        auth.tenantId,

      profileId:
        profile.id,
    });

  const types =
    new Set(
      documents.map(
        (item) =>
          item.document_type
      )
    );

  const required = [
    "identity_front",
    "selfie",
    "proof_of_address",
  ];

  const missing =
    required.filter(
      (type) =>
        !types.has(type)
    );

  if (missing.length) {
    throw httpError(
      422,
      `Missing required KYC documents: ${missing.join(", ")}`
    );
  }

  const submitted =
    await repo.submit({
      tenantId:
        auth.tenantId,

      profileId:
        profile.id,
    });

  await repo.createEvent({
    tenantId:
      auth.tenantId,

    profileId:
      profile.id,

    userId:
      auth.userId,

    actorUserId:
      auth.userId,

    eventType:
      "kyc_submitted",
  });

  return submitted;
};

const listPending = ({
  auth,
  query,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listPending({
    tenantId:
      auth.tenantId,

    status:
      query.status,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

const review = async ({
  auth,
  profileId,
  body,
}) => {
  const profile =
    await repo.findById({
      tenantId:
        auth.tenantId,

      profileId,
    });

  if (!profile) {
    throw httpError(
      404,
      "KYC profile not found"
    );
  }

  if (
    !["submitted", "under_review"]
      .includes(profile.status)
  ) {
    throw httpError(
      409,
      `KYC cannot be reviewed while status is ${profile.status}`
    );
  }

  if (
    body.status === "rejected" &&
    !body.rejectionReason
  ) {
    throw httpError(
      422,
      "A rejection reason is required"
    );
  }

  const updated =
    await repo.setReviewStatus({
      tenantId:
        auth.tenantId,

      profileId,

      reviewerId:
        auth.userId,

      status:
        body.status,

      riskLevel:
        body.riskLevel,

      rejectionReason:
        body.rejectionReason,
    });

  await repo.createEvent({
    tenantId:
      auth.tenantId,

    profileId,

    userId:
      profile.user_id,

    actorUserId:
      auth.userId,

    eventType:
      `kyc_${body.status}`,

    metadata: {
      riskLevel:
        body.riskLevel || null,

      rejectionReason:
        body.rejectionReason || null,
    },
  });

  return updated;
};

module.exports = {
  createOrUpdate,
  getMine,
  addDocument,
  uploadDocumentFile,
  submit,
  listPending,
  review,
};
