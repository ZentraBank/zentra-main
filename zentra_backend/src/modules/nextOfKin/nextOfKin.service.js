const repo =
  require("./nextOfKin.repository");

const {
  storePrivateFile,
  readPrivateFile,
} = require(
  "../../services/private-file.service"
);

const notificationsService =
  require(
    "../notifications/notifications.service"
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

const notifyTenantReviewers =
  async ({
    tenantId,
    title,
    message,
    priority = "normal",
    actionUrl,
    metadata,
  }) => {
    const reviewers =
      await repo.findTenantClaimReviewers({
        tenantId,
      });

    await Promise.all(
      reviewers.map(
        (reviewer) =>
          notificationsService.notifyUser({
            tenantId,

            userId:
              reviewer.user_id,

            notificationType:
              "next_of_kin",

            title,
            message,
            priority,
            actionUrl,
            metadata,
          })
      )
    );
  };

const safeNotify =
  async (
    callback
  ) => {
    try {
      await callback();
    } catch (error) {
      console.error(
        "[next_of_kin] Notification failed:",
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Upload POD document
|--------------------------------------------------------------------------
*/

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
      Number(
        record.size_bytes
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Create client POD claim
|--------------------------------------------------------------------------
*/

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
   * Do not expose whether the supplied
   * account exists.
   */
  if (
    !account ||
    account.status !==
      "active"
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

  let claim;

  try {
    await connection.beginTransaction();

    claim =
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
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const result = {
    ...claim,

    documents:
      await repo.findClaimDocuments({
        tenantId:
          auth.tenantId,

        claimId:
          claim.id,
      }),
  };

  /*
   * Notification failure should not cause
   * a successfully submitted claim to fail.
   */

  await safeNotify(
    async () => {
      await notificationsService.notifyUser({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        notificationType:
          "next_of_kin",

        title:
          "POD claim submitted",

        message:
          "Your POD claim has been submitted successfully and is awaiting review.",

        priority:
          "normal",

        actionUrl:
          `/nok/claims/${claim.id}`,

        metadata: {
          claimId:
            claim.id,

          status:
            claim.status,
        },
      });
    }
  );

  await safeNotify(
    async () => {
      await notifyTenantReviewers({
        tenantId:
          auth.tenantId,

        title:
          "New POD claim submitted",

        message:
          `${claim.beneficiary_name} submitted a new next-of-kin claim for ${claim.deceased_name}.`,

        priority:
          "normal",

        actionUrl:
          `/nok/${claim.id}`,

        metadata: {
          claimId:
            claim.id,

          status:
            claim.status,

          claimantUserId:
            claim.claimant_user_id,
        },
      });
    }
  );

  return result;
};

/*
|--------------------------------------------------------------------------
| Client claim list
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Client claim details
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Client additional information response
|--------------------------------------------------------------------------
*/

const submitAdditionalInformation =
  async ({
    auth,
    claimId,
    body,
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

    if (
      claim.status !==
      "more_information_required"
    ) {
      throw httpError(
        422,
        "Additional information is not currently required for this claim"
      );
    }

    const documents =
      Array.isArray(
        body.documents
      )
        ? body.documents
        : [];

    const uniqueFileIds =
      new Set();

    for (
      const document
      of documents
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
          "One or more additional documents are invalid"
        );
      }
    }

    const connection =
      await repo.db.pool.getConnection();

    let updated;

    try {
      await connection.beginTransaction();

      updated =
        await repo.submitAdditionalInformation({
          connection,

          tenantId:
            auth.tenantId,

          claimId,

          currentStatus:
            claim.status,

          message:
            body.message.trim(),
        });

      if (!updated) {
        throw httpError(
          409,
          "The POD claim was updated by another request. Refresh and try again."
        );
      }

      for (
        const document
        of documents
      ) {
        await repo.createClaimDocument({
          connection,

          tenantId:
            auth.tenantId,

          claimId,

          fileId:
            document.fileId,

          documentType:
            document.documentType,
        });
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const result = {
      ...updated,

      documents:
        await repo.findClaimDocuments({
          tenantId:
            auth.tenantId,

          claimId,
        }),
    };

    await safeNotify(
      async () => {
        await notificationsService.notifyUser({
          tenantId:
            auth.tenantId,

          userId:
            auth.userId,

          notificationType:
            "next_of_kin",

          title:
            "Additional information submitted",

          message:
            "Your additional POD claim information has been submitted and the claim is back under review.",

          priority:
            "normal",

          actionUrl:
            `/nok/claims/${claimId}`,

          metadata: {
            claimId,

            status:
              "under_review",
          },
        });
      }
    );

    await safeNotify(
      async () => {
        await notifyTenantReviewers({
          tenantId:
            auth.tenantId,

          title:
            "POD additional information received",

          message:
            `${claim.beneficiary_name} submitted additional information for a POD claim.`,

          priority:
            "high",

          actionUrl:
            `/nok/${claimId}`,

          metadata: {
            claimId,

            status:
              "under_review",

            claimantUserId:
              auth.userId,
          },
        });
      }
    );

    return result;
  };

/*
|--------------------------------------------------------------------------
| Tenant claim list
|--------------------------------------------------------------------------
*/

const listClaims = async ({
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
      repo.findClaimsByTenant({
        tenantId:
          auth.tenantId,

        status:
          query.status || null,

        limit:
          pageSize,

        offset,
      }),

      repo.countClaimsByTenant({
        tenantId:
          auth.tenantId,

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

/*
|--------------------------------------------------------------------------
| Tenant claim details
|--------------------------------------------------------------------------
*/

const getClaim = async ({
  auth,
  claimId,
}) => {
  const claim =
    await repo.findClaimById({
      tenantId:
        auth.tenantId,

      claimId,
    });

  if (!claim) {
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

/*
|--------------------------------------------------------------------------
| Tenant secure claim document
|--------------------------------------------------------------------------
*/

const getClaimFile = async ({
  auth,
  claimId,
  fileId,
}) => {
  const claim =
    await repo.findClaimById({
      tenantId:
        auth.tenantId,

      claimId,
    });

  if (!claim) {
    throw httpError(
      404,
      "POD claim not found"
    );
  }

  const file =
    await repo.findClaimFile({
      tenantId:
        auth.tenantId,

      claimId,

      fileId,
    });

  if (
    !file ||
    file.module !==
      "next_of_kin" ||
    file.status !==
      "active"
  ) {
    throw httpError(
      404,
      "POD claim document not found"
    );
  }

  let buffer;

  try {
    buffer =
      await readPrivateFile({
        storagePath:
          file.storage_path,
      });
  } catch (error) {
    if (
      error?.code ===
      "ENOENT"
    ) {
      throw httpError(
        404,
        "POD claim document file not found"
      );
    }

    throw error;
  }

  return {
    buffer,

    mimeType:
      file.mime_type,

    originalName:
      file.original_name,

    sizeBytes:
      Number(
        file.size_bytes
      ),

    documentType:
      file.document_type,
  };
};

/*
|--------------------------------------------------------------------------
| Tenant claim status update
|--------------------------------------------------------------------------
*/

const updateClaimStatus = async ({
  auth,
  claimId,
  body,
}) => {
  const claim =
    await repo.findClaimById({
      tenantId:
        auth.tenantId,

      claimId,
    });

  if (!claim) {
    throw httpError(
      404,
      "POD claim not found"
    );
  }

  const allowedTransitions = {
    draft: [
      "submitted",
      "cancelled",
    ],

    submitted: [
      "under_review",
      "more_information_required",
      "approved",
      "rejected",
    ],

    under_review: [
      "more_information_required",
      "approved",
      "rejected",
    ],

    more_information_required: [
      "under_review",
      "approved",
      "rejected",
    ],

    approved: [
      "completed",
    ],

    rejected: [],

    completed: [],

    cancelled: [],
  };

  const allowed =
    allowedTransitions[
      claim.status
    ] || [];

  if (
    !allowed.includes(
      body.status
    )
  ) {
    throw httpError(
      422,
      `POD claim cannot move from ${claim.status} to ${body.status}`
    );
  }

  if (
    body.status ===
      "rejected" &&
    !body.rejectionReason?.trim()
  ) {
    throw httpError(
      422,
      "A rejection reason is required when rejecting a POD claim"
    );
  }

  if (
    body.status ===
      "more_information_required" &&
    !body.moreInformationRequest?.trim()
  ) {
    throw httpError(
      422,
      "Please specify the additional information required"
    );
  }

  const updated =
    await repo.updateClaimStatus({
      tenantId:
        auth.tenantId,

      claimId,

      currentStatus:
        claim.status,

      status:
        body.status,

      rejectionReason:
        body.status ===
        "rejected"
          ? body.rejectionReason.trim()
          : null,

      moreInformationRequest:
        body.status ===
        "more_information_required"
          ? body.moreInformationRequest.trim()
          : null,
    });

  if (!updated) {
    throw httpError(
      409,
      "The POD claim was updated by another request. Refresh and try again."
    );
  }

  const result = {
    ...updated,

    documents:
      await repo.findClaimDocuments({
        tenantId:
          auth.tenantId,

        claimId,
      }),
  };

  const clientNotification =
    {
      under_review: {
        title:
          "POD claim under review",

        message:
          "Your POD claim is now under review.",

        priority:
          "normal",
      },

      more_information_required: {
        title:
          "More information required",

        message:
          body.moreInformationRequest,

        priority:
          "high",
      },

      approved: {
        title:
          "POD claim approved",

        message:
          "Your POD claim has been approved.",

        priority:
          "normal",
      },

      rejected: {
        title:
          "POD claim rejected",

        message:
          body.rejectionReason,

        priority:
          "high",
      },

      completed: {
        title:
          "POD claim completed",

        message:
          "Your POD claim has been completed.",

        priority:
          "normal",
      },
    }[
      updated.status
    ];

  if (clientNotification) {
    await safeNotify(
      async () => {
        await notificationsService.notifyUser({
          tenantId:
            auth.tenantId,

          userId:
            updated.claimant_user_id,

          notificationType:
            "next_of_kin",

          title:
            clientNotification.title,

          message:
            clientNotification.message,

          priority:
            clientNotification.priority,

          actionUrl:
            `/nok/claims/${updated.id}`,

          metadata: {
            claimId:
              updated.id,

            status:
              updated.status,
          },
        });
      }
    );
  }

  /*
   * Send tenant-side activity notification too.
   * This includes all reviewers other than the
   * reviewer who performed the current action.
   */

  await safeNotify(
    async () => {
      const reviewers =
        await repo.findTenantClaimReviewers({
          tenantId:
            auth.tenantId,
        });

      const messages = {
        under_review:
          "A POD claim has been moved into review.",

        more_information_required:
          "Additional information has been requested for a POD claim.",

        approved:
          "A POD claim has been approved.",

        rejected:
          "A POD claim has been rejected.",

        completed:
          "A POD claim has been marked as completed.",
      };

      const tenantMessage =
        messages[
          updated.status
        ];

      if (!tenantMessage) {
        return;
      }

      await Promise.all(
        reviewers
          .filter(
            (reviewer) =>
              reviewer.user_id !==
              auth.userId
          )
          .map(
            (reviewer) =>
              notificationsService.notifyUser({
                tenantId:
                  auth.tenantId,

                userId:
                  reviewer.user_id,

                notificationType:
                  "next_of_kin",

                title:
                  "POD claim updated",

                message:
                  tenantMessage,

                priority:
                  updated.status ===
                    "rejected" ||
                  updated.status ===
                    "more_information_required"
                    ? "high"
                    : "normal",

                actionUrl:
                  `/nok/${updated.id}`,

                metadata: {
                  claimId:
                    updated.id,

                  status:
                    updated.status,

                  claimantUserId:
                    updated.claimant_user_id,
                },
              })
          )
      );
    }
  );


  return result;
};


module.exports = {
  uploadFile,
  createClaim,

  listMine,
  getMine,

  submitAdditionalInformation,

  listClaims,
  getClaim,
  getClaimFile,
  updateClaimStatus,
 
};