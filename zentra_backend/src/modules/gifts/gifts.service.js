const repo =
  require("./gifts.repository");

const notificationsService =
  require(
    "../notifications/notifications.service"
  );

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

const safeNotify =
  async (callback) => {
    try {
      await callback();
    } catch (error) {
      console.error(
        "[gifts] Notification failed:",
        error
      );
    }
  };

const notifyTenantManagers =
  async ({
    tenantId,
    title,
    message,
    priority = "normal",
    actionUrl,
    metadata,
  }) => {
    const managers =
      await repo.findTenantGiftManagers({
        tenantId,
      });

    await Promise.all(
      managers.map(
        (manager) =>
          notificationsService.notifyUser({
            tenantId,

            userId:
              manager.user_id,

            notificationType:
              "gift",

            title,
            message,
            priority,
            actionUrl,
            metadata,
          })
      )
    );
  };

/*
|--------------------------------------------------------------------------
| Tenant: create gift
|--------------------------------------------------------------------------
*/

const createGift = async ({
  auth,
  body,
}) => {
  const account =
    await repo.findAccountByNumber({
      tenantId:
        auth.tenantId,

      accountNumber:
        body.accountNumber,
    });

  if (
    !account ||
    account.status !== "active"
  ) {
    throw httpError(
      422,
      "The gift could not be created for the supplied account"
    );
  }

  if (
    account.currency !==
    body.currency
  ) {
    throw httpError(
      422,
      "Gift currency must match the client account currency"
    );
  }

  const expiresAt =
    new Date(
      body.expiresAt
    );

  if (
    Number.isNaN(
      expiresAt.getTime()
    ) ||
    expiresAt <= new Date()
  ) {
    throw httpError(
      422,
      "Gift expiry time must be in the future"
    );
  }

  const gift =
  await repo.createGift({
    tenantId:
      auth.tenantId,

    clientUserId:
      account.user_id,

    clientAccountId:
      account.id,

    createdByUserId:
      auth.userId,

    amount:
      body.amount,

    redemptionFee:
      body.redemptionFee,

    currency:
      body.currency,

    senderName:
      body.senderName,

    message:
      body.message?.trim() ||
      null,

    expiresAt:
      body.expiresAt,
  });

  await safeNotify(
    async () => {
      await notificationsService.notifyUser({
        tenantId:
          auth.tenantId,

        userId:
          gift.client_user_id,

        notificationType:
          "gift",

        title:
          "You received a gift",

        message:
          `${gift.sender_name} sent you a gift of ${gift.currency} ${Number(
            gift.amount
          ).toLocaleString()}.`,

        priority:
          "normal",

        actionUrl:
          `/gift/${gift.id}`,

        metadata: {
          giftId:
            gift.id,

          status:
            gift.status,

          expiresAt:
            gift.expires_at,

          amount:
            Number(
              gift.amount
            ),

          currency:
            gift.currency,
        },
      });
    }
  );

  return gift;
};

/*
|--------------------------------------------------------------------------
| Tenant: list gifts
|--------------------------------------------------------------------------
*/

const listTenant = async ({
  auth,
  query,
}) => {
  await repo.expirePendingGiftsByTenant({
    tenantId:
      auth.tenantId,
  });

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
    gifts,
    total,
  ] =
    await Promise.all([
      repo.findGiftsByTenant({
        tenantId:
          auth.tenantId,

        status:
          query.status ||
          null,

        limit:
          pageSize,

        offset,
      }),

      repo.countGiftsByTenant({
        tenantId:
          auth.tenantId,

        status:
          query.status ||
          null,
      }),
    ]);

  return {
    gifts,

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
| Tenant: gift details
|--------------------------------------------------------------------------
*/

const getTenantGift = async ({
  auth,
  giftId,
}) => {
  const gift =
    await repo.expireGiftIfNeeded({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (!gift) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  return gift;
};

/*
|--------------------------------------------------------------------------
| Tenant: edit pending gift
|--------------------------------------------------------------------------
*/

const updateGift = async ({
  auth,
  giftId,
  body,
}) => {
  const gift =
    await repo.expireGiftIfNeeded({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (!gift) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  if (
    gift.status !==
    "pending"
  ) {
    throw httpError(
      422,
      "Only pending gifts can be edited"
    );
  }

  const accountNumber =
    body.accountNumber ??
    gift.account_number;

  const account =
    await repo.findAccountByNumber({
      tenantId:
        auth.tenantId,

      accountNumber,
    });

  if (
    !account ||
    account.status !==
      "active"
  ) {
    throw httpError(
      422,
      "The selected client account is invalid"
    );
  }

  const currency =
    body.currency ??
    gift.currency;

  if (
    account.currency !==
    currency
  ) {
    throw httpError(
      422,
      "Gift currency must match the client account currency"
    );
  }

  const expiresAt =
    body.expiresAt ??
    gift.expires_at;

  const parsedExpiry =
    new Date(
      expiresAt
    );

  if (
    Number.isNaN(
      parsedExpiry.getTime()
    ) ||
    parsedExpiry <= new Date()
  ) {
    throw httpError(
      422,
      "Gift expiry time must be in the future"
    );
  }

  const updated =
    await repo.updatePendingGift({
      tenantId:
        auth.tenantId,

      giftId,

      currentStatus:
        gift.status,

      clientUserId:
        account.user_id,

      clientAccountId:
        account.id,

      amount:
        body.amount ??
        gift.amount,

      currency,

      senderName:
        body.senderName ??
        gift.sender_name,

      message:
        body.message !==
        undefined
          ? body.message?.trim() ||
            null
          : gift.message,

      redemptionFee:
        body.redemptionFee ??
        gift.redemption_fee,

      expiresAt,
    });

  if (!updated) {
    throw httpError(
      409,
      "The gift was updated by another request. Refresh and try again."
    );
  }

  await safeNotify(
    async () => {
      await notificationsService.notifyUser({
        tenantId:
          auth.tenantId,

        userId:
          updated.client_user_id,

        notificationType:
          "gift",

        title:
          "Pending gift updated",

        message:
          `${updated.sender_name} updated a gift awaiting your response.`,

        priority:
          "normal",

        actionUrl:
          `/gift/${updated.id}`,

        metadata: {
          giftId:
            updated.id,

          status:
            updated.status,

          expiresAt:
            updated.expires_at,
        },
      });
    }
  );

  return updated;
};

/*
|--------------------------------------------------------------------------
| Tenant: cancel gift
|--------------------------------------------------------------------------
*/

const cancelGift = async ({
  auth,
  giftId,
}) => {
  const gift =
    await repo.expireGiftIfNeeded({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (!gift) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  if (
    gift.status !==
    "pending"
  ) {
    throw httpError(
      422,
      "Only pending gifts can be cancelled"
    );
  }

  const updated =
    await repo.cancelGift({
      tenantId:
        auth.tenantId,

      giftId,

      currentStatus:
        gift.status,
    });

  if (!updated) {
    throw httpError(
      409,
      "The gift was updated by another request. Refresh and try again."
    );
  }

  await safeNotify(
    async () => {
      await notificationsService.notifyUser({
        tenantId:
          auth.tenantId,

        userId:
          updated.client_user_id,

        notificationType:
          "gift",

        title:
          "Gift cancelled",

        message:
          `The pending gift of ${updated.currency} ${Number(
            updated.amount
          ).toLocaleString()} has been cancelled.`,

        priority:
          "normal",

        actionUrl:
          `/gift/${updated.id}`,

        metadata: {
          giftId:
            updated.id,

          status:
            updated.status,
        },
      });
    }
  );

  return updated;
};

/*
|--------------------------------------------------------------------------
| Client: list gifts
|--------------------------------------------------------------------------
*/

const listMine = async ({
  auth,
  query,
}) => {
  await repo.expirePendingGiftsByTenant({
    tenantId:
      auth.tenantId,
  });

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
    gifts,
    total,
  ] =
    await Promise.all([
      repo.findGiftsByClient({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        status:
          query.status ||
          null,

        limit:
          pageSize,

        offset,
      }),

      repo.countGiftsByClient({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        status:
          query.status ||
          null,
      }),
    ]);

  return {
    gifts,

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
| Client: gift details
|--------------------------------------------------------------------------
*/

const getMine = async ({
  auth,
  giftId,
}) => {
  const gift =
    await repo.expireGiftIfNeeded({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (
    !gift ||
    gift.client_user_id !==
      auth.userId
  ) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  return gift;
};

/*
|--------------------------------------------------------------------------
| Client: accept / decline
|--------------------------------------------------------------------------
*/

const decideGift = async ({
  auth,
  giftId,
  decision,
}) => {
  const gift =
    await repo.expireGiftIfNeeded({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (
    !gift ||
    gift.client_user_id !==
      auth.userId
  ) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  if (
    gift.status ===
    "expired"
  ) {
    throw httpError(
      422,
      "This gift has expired"
    );
  }

  if (
    gift.status !==
    "pending"
  ) {
    throw httpError(
      422,
      "This gift has already been decided"
    );
  }

  const updated =
    await repo.updateGiftDecision({
      tenantId:
        auth.tenantId,

      giftId,

      userId:
        auth.userId,

      currentStatus:
        gift.status,

      status:
        decision,
    });

  if (!updated) {
    throw httpError(
      409,
      "The gift was updated by another request. Refresh and try again."
    );
  }

  await safeNotify(
    async () => {
      await notifyTenantManagers({
        tenantId:
          auth.tenantId,

        title:
          decision ===
          "accepted"
            ? "Gift accepted"
            : "Gift declined",

        message:
          `${updated.client_first_name} ${updated.client_last_name} ${
            decision ===
            "accepted"
              ? "accepted"
              : "declined"
          } a gift of ${updated.currency} ${Number(
            updated.amount
          ).toLocaleString()}.`,

        priority:
          decision ===
          "declined"
            ? "high"
            : "normal",

        actionUrl:
          `/dashboard/gift/${updated.id}`,

        metadata: {
          giftId:
            updated.id,

          status:
            updated.status,

          clientUserId:
            updated.client_user_id,
        },
      });
    }
  );

  return updated;
};

const submitRedemptionProof = async ({
  auth,
  giftId,
  body,
}) => {
  const gift =
    await repo.findGiftById({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (
    !gift ||
    gift.client_user_id !==
      auth.userId
  ) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  if (
    ![
      "accepted",
      "redemption_rejected",
    ].includes(
      gift.status
    )
  ) {
    throw httpError(
      422,
      "Redemption proof cannot be submitted for this gift"
    );
  }

  const file =
    await repo.findPrivateFileById({
      tenantId:
        auth.tenantId,

      fileId:
        body.fileId,
    });

  if (
    !file ||
    file.user_id !==
      auth.userId ||
    file.module !==
      "gift_redemption" ||
    file.document_type !==
      "redemption_payment_proof"
  ) {
    throw httpError(
      422,
      "The redemption proof file is invalid"
    );
  }

  const expectedFee =
    Number(
      gift.redemption_fee
    );

  const amountPaid =
    Number(
      body.amountPaid
    );

  if (
    Math.abs(
      expectedFee -
        amountPaid
    ) > 0.009
  ) {
    throw httpError(
      422,
      `Amount paid must match the redemption fee of ${gift.currency} ${expectedFee.toFixed(
        2
      )}`
    );
  }

  const proof =
    await repo.saveRedemptionProof({
      tenantId:
        auth.tenantId,

      giftId,

      clientUserId:
        auth.userId,

      fileId:
        body.fileId,

      amountPaid,

      paymentReference:
        body.paymentReference
          ?.trim() ||
        null,

      paymentMethod:
        body.paymentMethod,

      note:
        body.note?.trim() ||
        null,
    });

  const updatedGift =
    await repo.updateGiftRedemptionStatus({
      tenantId:
        auth.tenantId,

      giftId,

      currentStatus:
        gift.status,

      status:
        "redemption_pending_review",
    });

  if (!updatedGift) {
    throw httpError(
      409,
      "The gift was updated by another request. Refresh and try again."
    );
  }

  await safeNotify(
    async () => {
      await notifyTenantManagers({
        tenantId:
          auth.tenantId,

        title:
          "Redemption proof submitted",

        message:
          `${gift.client_first_name} ${gift.client_last_name} submitted payment proof for a gift redemption.`,

        priority:
          "normal",

        actionUrl:
          `/dashboard/gift/${gift.id}`,

        metadata: {
          giftId:
            gift.id,

          proofId:
            proof.id,

          status:
            "redemption_pending_review",
        },
      });
    }
  );

  return {
    gift:
      updatedGift,

    proof,
  };
};
const getMyRedemptionProof = async ({
  auth,
  giftId,
}) => {
  const gift =
    await repo.findGiftById({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (
    !gift ||
    gift.client_user_id !==
      auth.userId
  ) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  const proof =
    await repo.findRedemptionProofByGift({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (!proof) {
    throw httpError(
      404,
      "Redemption proof not found"
    );
  }

  return proof;
};

const getRedemptionProof = async ({
  auth,
  giftId,
}) => {
  const gift =
    await repo.findGiftById({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (!gift) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  const proof =
    await repo.findRedemptionProofByGift({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (!proof) {
    throw httpError(
      404,
      "Redemption proof not found"
    );
  }

  return proof;
};

const reviewRedemptionProof = async ({
  auth,
  giftId,
  body,
}) => {
  const gift =
    await repo.findGiftById({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (!gift) {
    throw httpError(
      404,
      "Gift not found"
    );
  }

  if (
    gift.status !==
    "redemption_pending_review"
  ) {
    throw httpError(
      422,
      "This gift is not awaiting redemption review"
    );
  }

  const proof =
    await repo.findRedemptionProofByGift({
      tenantId:
        auth.tenantId,

      giftId,
    });

  if (
    !proof ||
    proof.status !==
      "submitted"
  ) {
    throw httpError(
      422,
      "No submitted redemption proof is available for review"
    );
  }

  const rejectionReason =
    body.status ===
    "rejected"
      ? body.rejectionReason.trim()
      : null;

  const reviewedProof =
    await repo.reviewRedemptionProof({
      tenantId:
        auth.tenantId,

      giftId,

      status:
        body.status,

      rejectionReason,
    });

  if (!reviewedProof) {
    throw httpError(
      409,
      "This redemption proof was already reviewed. Refresh and try again."
    );
  }

  const nextGiftStatus =
    body.status ===
    "approved"
      ? "processed"
      : "redemption_rejected";

  const updatedGift =
    await repo.updateGiftRedemptionStatus({
      tenantId:
        auth.tenantId,

      giftId,

      currentStatus:
        gift.status,

      status:
        nextGiftStatus,
    });

  if (!updatedGift) {
    throw httpError(
      409,
      "The gift was updated by another request. Refresh and try again."
    );
  }

  await safeNotify(
    async () => {
      if (
        body.status ===
        "approved"
      ) {
        await notificationsService.notifyUser({
          tenantId:
            auth.tenantId,

          userId:
            gift.client_user_id,

          notificationType:
            "gift",

          title:
            "Redemption proof approved",

          message:
            `Your redemption payment proof for the ${gift.currency} ${Number(
              gift.amount
            ).toLocaleString()} gift has been approved.`,

          priority:
            "normal",

          actionUrl:
            `/gift/${gift.id}`,

          metadata: {
            giftId:
              gift.id,

            status:
              "processed",
          },
        });
      } else {
        await notificationsService.notifyUser({
          tenantId:
            auth.tenantId,

          userId:
            gift.client_user_id,

          notificationType:
            "gift",

          title:
            "Redemption proof rejected",

          message:
            `Your redemption payment proof was rejected. ${
              rejectionReason ||
              ""
            }`.trim(),

          priority:
            "high",

          actionUrl:
            `/gift/${gift.id}`,

          metadata: {
            giftId:
              gift.id,

            status:
              "redemption_rejected",

            rejectionReason,
          },
        });
      }
    }
  );

  return {
    gift:
      updatedGift,

    proof:
      reviewedProof,
  };
};
const uploadRedemptionProofFile =
  async ({
    auth,
    giftId,
    file,
  }) => {
    const gift =
      await repo.findGiftById({
        tenantId:
          auth.tenantId,

        giftId,
      });

    if (
      !gift ||
      gift.client_user_id !==
        auth.userId
    ) {
      throw httpError(
        404,
        "Gift not found"
      );
    }

    if (
      ![
        "accepted",
        "redemption_rejected",
      ].includes(
        gift.status
      )
    ) {
      throw httpError(
        422,
        "A redemption proof cannot be uploaded for this gift"
      );
    }

    const stored =
      await storePrivateFile({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        module:
          "gift_redemption",

        documentType:
          "redemption_payment_proof",

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
          "gift_redemption",

        documentType:
          "redemption_payment_proof",

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

      originalName:
        record.original_name,

      mimeType:
        record.mime_type,

      sizeBytes:
        Number(
          record.size_bytes
        ),

      documentType:
        record.document_type,
    };
  };




module.exports = {
  createGift,

  listTenant,
  getTenantGift,
  updateGift,
  cancelGift,

  listMine,
  getMine,
  decideGift,

 uploadRedemptionProofFile,
submitRedemptionProof,
getMyRedemptionProof,
getRedemptionProof,
reviewRedemptionProof,
};