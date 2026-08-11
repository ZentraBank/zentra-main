const crypto = require("crypto");
const db = require("../../config/db");
const repo = require("./cards.repository");
const notifications = require(
  "../notifications/notifications.repository"
);

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/*
|--------------------------------------------------------------------------
| Card catalogue
|--------------------------------------------------------------------------
|
| The backend owns card prices. Never trust a price sent by the frontend.
|
*/

const CARD_PRODUCTS = {
  virtual: {
    price: 10,
    currency: "GBP",
    isVirtual: true,
  },

  celebrity: {
    price: 20,
    currency: "GBP",
    isVirtual: false,
  },

  cryptocurrency: {
    price: 25,
    currency: "GBP",
    isVirtual: true,
  },

  official: {
    price: 30,
    currency: "GBP",
    isVirtual: false,
  },

  physical: {
    price: 35,
    currency: "GBP",
    isVirtual: false,
  },

  merchant: {
    price: 40,
    currency: "GBP",
    isVirtual: false,
  },
};

const getCardProduct = (cardType) => {
  const product = CARD_PRODUCTS[cardType];

  if (!product) {
    throw httpError(400, "Unsupported card type");
  }

  return product;
};

const featureNumber = (
  auth,
  key,
  fallback = null
) => {
  const feature = auth.planFeatures?.[key];

  if (!feature?.enabled) {
    if (fallback !== null) {
      return fallback;
    }

    throw httpError(
      403,
      `Your plan does not include ${key}`
    );
  }

  const value = Number(feature.value);

  if (!Number.isFinite(value)) {
    if (fallback !== null) {
      return fallback;
    }

    throw httpError(
      500,
      `Invalid ${key} configuration`
    );
  }

  return value;
};

const makeMaskedPan = async (tenantId) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const last4 = crypto
      .randomInt(1000, 10000)
      .toString();

    const maskedPan = `5399 **** **** ${last4}`;

    const exists = await repo.maskedPanExists({
      tenantId,
      maskedPan,
    });

    if (!exists) {
      return {
        maskedPan,
        panLast4: last4,
      };
    }
  }

  throw httpError(
    500,
    "Unable to generate a unique card number"
  );
};

/*
|--------------------------------------------------------------------------
| Direct card issuance
|--------------------------------------------------------------------------
|
| Keep this method for trusted/admin/internal use.
| Customers should normally submit a purchase request instead.
|
*/

const createCard = async ({ auth, body }) => {
  const account = await repo.findAccountById({
    tenantId: auth.tenantId,
    accountId: body.accountId,
  });

  if (!account || account.user_id !== auth.userId) {
    throw httpError(404, "Account not found");
  }

  if (account.status !== "active") {
    throw httpError(
      403,
      "Cards require an active account"
    );
  }

  const product = getCardProduct(body.cardType);

  const cardLimit = featureNumber(
    auth,
    "number_of_cards",
    6
  );

  const existingCardCount =
    await repo.countActiveCardsByUser({
      tenantId: auth.tenantId,
      userId: auth.userId,
    });

  if (existingCardCount >= cardLimit) {
    throw httpError(
      403,
      `Your account allows a maximum of ${cardLimit} card${
        cardLimit === 1 ? "" : "s"
      }`
    );
  }

  const { maskedPan, panLast4 } =
    await makeMaskedPan(auth.tenantId);

  const now = new Date();

  const card = await repo.create({
    tenantId: auth.tenantId,
    userId: auth.userId,
    accountId: account.id,
    cardType: body.cardType,
    cardBrand: body.cardBrand || "Zentra",
    maskedPan,
    panLast4,
    expiryMonth: now.getMonth() + 1,
    expiryYear: now.getFullYear() + 4,
    isVirtual: product.isVirtual,
    dailySpendLimit: featureNumber(
      auth,
      "card_daily_spend_limit",
      500
    ),
  });

  await repo.createEvent({
    tenantId: auth.tenantId,
    cardId: card.id,
    userId: auth.userId,
    actorUserId: auth.userId,
    eventType: "card_issued",
    metadata: {
      cardType: card.card_type,
      accountId: account.id,
      issuanceMode: "direct",
    },
  });

  return card;
};

/*
|--------------------------------------------------------------------------
| Customer card purchase requests
|--------------------------------------------------------------------------
*/

const submitPurchaseRequest = async ({
  auth,
  body,
}) => {
  const account = await repo.findAccountById({
    tenantId: auth.tenantId,
    accountId: body.accountId,
  });

  if (!account || account.user_id !== auth.userId) {
    throw httpError(404, "Account not found");
  }

  if (account.status !== "active") {
    throw httpError(
      403,
      "Cards require an active account"
    );
  }

  const product = getCardProduct(body.cardType);

  const purchaseRequest =
    await repo.createPurchaseRequest({
      tenantId: auth.tenantId,
      userId: auth.userId,
      accountId: account.id,
      cardType: body.cardType,
      cardBrand: body.cardBrand || "Zentra",
      price: product.price,
      currency: product.currency,
      paymentMethod:
        body.paymentMethod || "cryptocurrency",
      paymentReference:
        body.paymentReference || null,
      paymentProofUrl:
        body.paymentProofUrl || null,
    });

  await notifications.create({
    tenantId: auth.tenantId,
    userId: auth.userId,
    notificationType: "card_purchase_submitted",
    title: "Card request submitted",
    message: `Your ${body.cardType} card payment has been submitted for verification.`,
    entityType: "card_purchase_request",
    entityId: purchaseRequest.id,
    priority: "normal",
    actionUrl: `/cards/purchase-status/${purchaseRequest.id}`,
    metadata: {
      cardType: body.cardType,
      price: product.price,
      currency: product.currency,
      status: "pending",
    },
  });

  return purchaseRequest;
};

const listOwnPurchaseRequests = ({ auth }) =>
  repo.findPurchaseRequestsByUser({
    tenantId: auth.tenantId,
    userId: auth.userId,
  });

const getOwnPurchaseRequest = async ({
  auth,
  requestId,
}) => {
  const purchaseRequest =
    await repo.findPurchaseRequestById({
      tenantId: auth.tenantId,
      requestId,
    });

  if (
    !purchaseRequest ||
    purchaseRequest.user_id !== auth.userId
  ) {
    throw httpError(
      404,
      "Card purchase request not found"
    );
  }

  return purchaseRequest;
};

const cancelOwnPurchaseRequest = async ({
  auth,
  requestId,
}) => {
  const purchaseRequest =
    await getOwnPurchaseRequest({
      auth,
      requestId,
    });

  if (purchaseRequest.status !== "pending") {
    throw httpError(
      409,
      `A ${purchaseRequest.status} request cannot be cancelled`
    );
  }

  const cancelled =
    await repo.cancelPurchaseRequest({
      tenantId: auth.tenantId,
      userId: auth.userId,
      requestId,
    });

  if (!cancelled) {
    throw httpError(
      409,
      "Unable to cancel this card request"
    );
  }

  return repo.findPurchaseRequestById({
    tenantId: auth.tenantId,
    requestId,
  });
};

/*
|--------------------------------------------------------------------------
| Tenant-admin purchase request services
|--------------------------------------------------------------------------
*/

const listTenantPurchaseRequests = async ({
  auth,
  status = null,
  page = 1,
  pageSize = 20,
}) => {
  const safePage =
    Number.isInteger(page) && page > 0
      ? page
      : 1;

  const safePageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? Math.min(pageSize, 100)
      : 20;

  const offset =
    (safePage - 1) * safePageSize;

  const [requests, total] =
    await Promise.all([
      repo.findPurchaseRequestsByTenant({
        tenantId: auth.tenantId,
        status,
        limit: safePageSize,
        offset,
      }),

      repo.countPurchaseRequestsByTenant({
        tenantId: auth.tenantId,
        status,
      }),
    ]);

  return {
    requests,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.ceil(
        total / safePageSize
      ),
    },
  };
};

const getTenantPurchaseRequest = async ({
  auth,
  requestId,
}) => {
  const purchaseRequest =
    await repo.findPurchaseRequestById({
      tenantId: auth.tenantId,
      requestId,
    });

  if (!purchaseRequest) {
    throw httpError(
      404,
      "Card purchase request not found"
    );
  }

  return purchaseRequest;
};

const approvePurchaseRequest = async ({
  auth,
  requestId,
}) => {
  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const purchaseRequest =
      await repo.findPendingPurchaseRequestForUpdate({
        connection,
        tenantId: auth.tenantId,
        requestId,
      });

    if (!purchaseRequest) {
      throw httpError(
        404,
        "Pending card purchase request not found"
      );
    }

    if (purchaseRequest.status !== "pending") {
      throw httpError(
        409,
        `This request has already been ${purchaseRequest.status}`
      );
    }

    if (
      purchaseRequest.account_status !== "active"
    ) {
      throw httpError(
        403,
        "The linked account is no longer active"
      );
    }

    const currentCardCount =
      await repo.countActiveCardsByUser({
        tenantId: auth.tenantId,
        userId: purchaseRequest.user_id,
      });

    const defaultCardLimit = 6;

    if (
      currentCardCount >= defaultCardLimit
    ) {
      throw httpError(
        403,
        `This customer already has the maximum of ${defaultCardLimit} cards`
      );
    }

    const product = getCardProduct(
      purchaseRequest.card_type
    );

    const { maskedPan, panLast4 } =
      await makeMaskedPan(auth.tenantId);

    const now = new Date();

    const card = await repo.create({
      connection,
      tenantId: auth.tenantId,
      userId: purchaseRequest.user_id,
      accountId: purchaseRequest.account_id,
      cardType: purchaseRequest.card_type,
      cardBrand:
        purchaseRequest.card_brand ||
        "Zentra",
      maskedPan,
      panLast4,
      expiryMonth: now.getMonth() + 1,
      expiryYear: now.getFullYear() + 4,
      isVirtual: product.isVirtual,
      dailySpendLimit: 500,
    });

    if (!card) {
      throw httpError(
        500,
        "Unable to issue the card"
      );
    }

    const approved =
      await repo.approvePurchaseRequest({
        connection,
        tenantId: auth.tenantId,
        requestId,
        reviewedBy: auth.userId,
        issuedCardId: card.id,
      });

    if (!approved) {
      throw httpError(
        409,
        "Unable to approve this request"
      );
    }

    await repo.createEvent({
      connection,
      tenantId: auth.tenantId,
      cardId: card.id,
      userId: purchaseRequest.user_id,
      actorUserId: auth.userId,
      eventType: "card_issued",
      metadata: {
        cardType:
          purchaseRequest.card_type,
        accountId:
          purchaseRequest.account_id,
        purchaseRequestId:
          purchaseRequest.id,
        approvedBy: auth.userId,
      },
    });

    await notifications.create({
      connection,
      tenantId: auth.tenantId,
      userId: purchaseRequest.user_id,
      notificationType:
        "card_purchase_approved",
      title: "Card request approved",
      message: `Your ${purchaseRequest.card_type} card has been approved and issued.`,
      entityType: "card",
      entityId: card.id,
      priority: "normal",
      actionUrl: `/cards/details/${card.id}`,
      metadata: {
        purchaseRequestId:
          purchaseRequest.id,
        cardType:
          purchaseRequest.card_type,
      },
    });

    await connection.commit();

    return {
      purchaseRequest:
        await repo.findPurchaseRequestById({
          tenantId: auth.tenantId,
          requestId,
        }),
      card: await repo.findById({
        tenantId: auth.tenantId,
        cardId: card.id,
      }),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const rejectPurchaseRequest = async ({
  auth,
  requestId,
  rejectionReason,
}) => {
  const reason =
    typeof rejectionReason === "string"
      ? rejectionReason.trim()
      : "";

  if (!reason) {
    throw httpError(
      400,
      "A rejection reason is required"
    );
  }

  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const purchaseRequest =
      await repo.findPendingPurchaseRequestForUpdate({
        connection,
        tenantId: auth.tenantId,
        requestId,
      });

    if (!purchaseRequest) {
      throw httpError(
        404,
        "Pending card purchase request not found"
      );
    }

    const rejected =
      await repo.rejectPurchaseRequest({
        connection,
        tenantId: auth.tenantId,
        requestId,
        reviewedBy: auth.userId,
        rejectionReason: reason,
      });

    if (!rejected) {
      throw httpError(
        409,
        "Unable to reject this request"
      );
    }

    await notifications.create({
      connection,
      tenantId: auth.tenantId,
      userId: purchaseRequest.user_id,
      notificationType:
        "card_purchase_rejected",
      title: "Card request rejected",
      message: `Your ${purchaseRequest.card_type} card request was rejected: ${reason}`,
      entityType:
        "card_purchase_request",
      entityId: purchaseRequest.id,
      priority: "normal",
      actionUrl: `/cards/purchase-status/${purchaseRequest.id}`,
      metadata: {
        cardType:
          purchaseRequest.card_type,
        rejectionReason: reason,
      },
    });

    await connection.commit();

    return repo.findPurchaseRequestById({
      tenantId: auth.tenantId,
      requestId,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Existing customer card services
|--------------------------------------------------------------------------
*/

const listOwnCards = ({ auth }) =>
  repo.findByUser({
    tenantId: auth.tenantId,
    userId: auth.userId,
  });

const getOwnCard = async ({
  auth,
  cardId,
}) => {
  const card = await repo.findById({
    tenantId: auth.tenantId,
    cardId,
  });

  if (
    !card ||
    card.user_id !== auth.userId
  ) {
    throw httpError(
      404,
      "Card not found"
    );
  }

  return card;
};

const customerTransitions = {
  active: ["frozen"],
  frozen: ["active"],
};

const adminTransitions = {
  pending: ["active", "inactive"],
  active: [
    "frozen",
    "blocked",
    "inactive",
  ],
  frozen: [
    "active",
    "blocked",
    "inactive",
  ],
  blocked: ["active", "inactive"],
  inactive: [],
  expired: [],
};

const changeOwnStatus = async ({
  auth,
  cardId,
  status,
}) => {
  const card = await getOwnCard({
    auth,
    cardId,
  });

  const allowedTransitions =
    customerTransitions[card.status] || [];

  if (
    !allowedTransitions.includes(status)
  ) {
    throw httpError(
      409,
      `A customer cannot change a ${card.status} card to ${status}`
    );
  }

  const updated =
    await repo.updateStatus({
      tenantId: auth.tenantId,
      cardId,
      status,
    });

  await repo.createEvent({
    tenantId: auth.tenantId,
    cardId,
    userId: card.user_id,
    actorUserId: auth.userId,
    eventType: `card_${status}`,
  });

  return updated;
};

const changeOwnLimit = async ({
  auth,
  cardId,
  dailySpendLimit,
}) => {
  const card = await getOwnCard({
    auth,
    cardId,
  });

  if (
    ["blocked", "inactive", "expired"].includes(
      card.status
    )
  ) {
    throw httpError(
      409,
      `A ${card.status} card cannot be modified`
    );
  }

  const maximumLimit = featureNumber(
    auth,
    "card_daily_spend_limit",
    500
  );

  const requestedLimit =
    Number(dailySpendLimit);

  if (
    requestedLimit > maximumLimit
  ) {
    throw httpError(
      403,
      `Your maximum permitted daily spend limit is ${maximumLimit}`
    );
  }

  const updated =
    await repo.updateDailySpendLimit({
      tenantId: auth.tenantId,
      cardId,
      dailySpendLimit: requestedLimit,
    });

  await repo.createEvent({
    tenantId: auth.tenantId,
    cardId,
    userId: card.user_id,
    actorUserId: auth.userId,
    eventType: "card_limit_changed",
    metadata: {
      previousLimit:
        card.daily_spend_limit,
      newLimit: requestedLimit,
    },
  });

  return updated;
};

const changeStatusAsAdmin = async ({
  auth,
  cardId,
  status,
  reason,
}) => {
  const card = await repo.findById({
    tenantId: auth.tenantId,
    cardId,
  });

  if (!card) {
    throw httpError(404, "Card not found");
  }

  const allowedTransitions =
    adminTransitions[card.status] || [];

  if (!allowedTransitions.includes(status)) {
    throw httpError(
      409,
      `Cannot change a ${card.status} card to ${status}`
    );
  }

  const updated =
    await repo.updateStatus({
      tenantId: auth.tenantId,
      cardId,
      status,
    });

  await repo.createEvent({
    tenantId: auth.tenantId,
    cardId,
    userId: card.user_id,
    actorUserId: auth.userId,
    eventType: `card_${status}`,
    metadata: reason
      ? { reason }
      : null,
  });

  return updated;
};

module.exports = {
  createCard,

  submitPurchaseRequest,
  listOwnPurchaseRequests,
  getOwnPurchaseRequest,
  cancelOwnPurchaseRequest,

  listTenantPurchaseRequests,
  getTenantPurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,

  listOwnCards,
  getOwnCard,
  changeOwnStatus,
  changeOwnLimit,
  changeStatusAsAdmin,
};