const path =
  require("path");

const repo =
  require("./nextOfKin.repository");

const {
  storePrivateFile,
} = require(
  "../../services/private-file.service"
);

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

const uploadFile = async ({
  auth,
  documentType,
  file,
}) => {
  const stored =
    await storePrivateFile({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,

      module:
        "next_of_kin",

      documentType,

      file,
    });

  const record =
    await repo.createPrivateFileRecord({
      id:
        stored.id,

      tenantId:
        auth.tenantId,

      userId:
        auth.userId,

      module:
        "next_of_kin",

      documentType,

      originalName:
        stored.originalName,

      storedName:
        stored.storedName,

      mimeType:
        stored.mimeType,

      sizeBytes:
        stored.sizeBytes,

      storagePath:
        stored.storagePath,
    });

  return {
    fileId:
      record.id,

    documentType:
      record.document_type,

    originalName:
      record.original_name,

    mimeType:
      record.mime_type,

    sizeBytes:
      Number(record.size_bytes),
  };
};

const createClaim = async ({
  auth,
  body,
}) => {
  const account =
    await repo.findAccountByNumber({
      tenantId:
        auth.tenantId,

      accountNumber:
        body.deceasedAccountNumber,
    });

  /*
   * We intentionally do not expose whether the account
   * exists to the customer in the response.
   */
  if (
    !account ||
    account.status !== "active"
  ) {
    throw httpError(
      422,
      "The POD claim could not be submitted with the supplied information"
    );
  }

  const requiredTypes =
    new Set([
      "death_certificate",
      "claimant_id_front",
      "claimant_id_back",
    ]);

  const submittedTypes =
    new Set(
      body.documents.map(
        (item) =>
          item.documentType
      )
    );

  for (
    const requiredType
    of requiredTypes
  ) {
    if (
      !submittedTypes.has(
        requiredType
      )
    ) {
      throw httpError(
        422,
        `Missing required document: ${requiredType}`
      );
    }
  }

  const uniqueFileIds =
    new Set();

  for (
    const document
    of body.documents
  ) {
    if (
      uniqueFileIds.has(
        document.fileId
      )
    ) {
      throw httpError(
        422,
        "The same file cannot be attached more than once"
      );
    }

    uniqueFileIds.add(
      document.fileId
    );

    const file =
      await repo.findPrivateFileById({
        tenantId:
          auth.tenantId,

        fileId:
          document.fileId,
      });

    if (
      !file ||
      file.user_id !==
        auth.userId ||
      file.module !==
        "next_of_kin" ||
      file.document_type !==
        document.documentType
    ) {
      throw httpError(
        422,
        "One or more claim documents are invalid"
      );
    }
  }

  const connection =
    await repo.db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const claim =
      await repo.createClaim({
        connection,

        tenantId:
          auth.tenantId,

        claimantUserId:
          auth.userId,

        body,
      });

    for (
      const document
      of body.documents
    ) {
      await repo.createClaimDocument({
        connection,

        tenantId:
          auth.tenantId,

        claimId:
          claim.id,

        fileId:
          document.fileId,

        documentType:
          document.documentType,
      });
    }

    await connection.commit();

    return {
      ...claim,

      documents:
        await repo.findClaimDocuments({
          tenantId:
            auth.tenantId,

          claimId:
            claim.id,
        }),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listMine = async ({
  auth,
  query,
}) => {
  const page =
    Number(query.page) > 0
      ? Number(query.page)
      : 1;

  const pageSize =
    Number(query.pageSize) > 0
      ? Math.min(
          Number(query.pageSize),
          100
        )
      : 20;

  const offset =
    (page - 1) *
    pageSize;

  const [
    claims,
    total,
  ] =
    await Promise.all([
      repo.findClaimsByUser({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        status:
          query.status || null,

        limit:
          pageSize,

        offset,
      }),

      repo.countClaimsByUser({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        status:
          query.status || null,
      }),
    ]);

  return {
    claims,

    pagination: {
      page,
      pageSize,
      total,

      totalPages:
        Math.ceil(
          total / pageSize
        ),
    },
  };
};

const getMine = async ({
  auth,
  claimId,
}) => {
  const claim =
    await repo.findClaimById({
      tenantId:
        auth.tenantId,

      claimId,
    });

  if (
    !claim ||
    claim.claimant_user_id !==
      auth.userId
  ) {
    throw httpError(
      404,
      "POD claim not found"
    );
  }

  return {
    ...claim,

    documents:
      await repo.findClaimDocuments({
        tenantId:
          auth.tenantId,

        claimId,
      }),
  };
};

module.exports = {
  uploadFile,
  createClaim,
  listMine,
  getMine,
};