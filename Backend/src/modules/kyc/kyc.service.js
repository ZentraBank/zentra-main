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
  submit,
  listPending,
  review,
};
