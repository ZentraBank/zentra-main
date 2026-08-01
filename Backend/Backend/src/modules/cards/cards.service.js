const crypto = require("crypto");
const repo = require("./cards.repository");

const httpError = (statusCode, message) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

const featureNumber = (auth, key, fallback = null) => {
  const feature = auth.planFeatures?.[key];
  if (!feature?.enabled) {
    if (fallback !== null) return fallback;
    throw httpError(403, `Your plan does not include ${key}`);
  }
  const value = Number(feature.value);
  if (!Number.isFinite(value)) {
    if (fallback !== null) return fallback;
    throw httpError(500, `Invalid ${key} configuration`);
  }
  return value;
};

const makeMaskedPan = async (tenantId) => {
  for (let i = 0; i < 10; i += 1) {
    const last4 = crypto.randomInt(1000, 10000).toString();
    const maskedPan = `5399 **** **** ${last4}`;
    if (!(await repo.maskedPanExists({ tenantId, maskedPan }))) {
      return { maskedPan, panLast4: last4 };
    }
  }
  throw httpError(500, "Unable to generate a unique card number");
};

const createCard = async ({ auth, body }) => {
  if (!auth.subscriptionId || !auth.planId) {
    throw httpError(403, "An active subscription is required");
  }

  const account = await repo.findAccountById({
    tenantId: auth.tenantId,
    accountId: body.accountId
  });

  if (!account || account.user_id !== auth.userId) {
    throw httpError(404, "Account not found");
  }
  if (account.status !== "active") {
    throw httpError(403, "Cards require an active account");
  }

  const isVirtual = ["virtual","cryptocurrency"].includes(body.cardType);
  if (isVirtual && !auth.planFeatures?.virtual_cards?.enabled) {
    throw httpError(403, "Your plan does not include virtual cards");
  }

  const limit = featureNumber(auth, "number_of_cards", 1);
  const count = await repo.countActiveCardsByUser({
    tenantId: auth.tenantId,
    userId: auth.userId
  });
  if (count >= limit) {
    throw httpError(403, `Your plan allows a maximum of ${limit} card${limit === 1 ? "" : "s"}`);
  }

  const { maskedPan, panLast4 } = await makeMaskedPan(auth.tenantId);
  const now = new Date();
  const card = await repo.create({
    tenantId: auth.tenantId,
    userId: auth.userId,
    accountId: account.id,
    cardType: body.cardType,
    cardBrand: body.cardBrand,
    maskedPan,
    panLast4,
    expiryMonth: now.getMonth() + 1,
    expiryYear: now.getFullYear() + 4,
    isVirtual,
    dailySpendLimit: featureNumber(auth, "card_daily_spend_limit", 500)
  });

  await repo.createEvent({
    tenantId: auth.tenantId,
    cardId: card.id,
    userId: auth.userId,
    actorUserId: auth.userId,
    eventType: "card_issued",
    metadata: { cardType: card.card_type, accountId: account.id }
  });

  return card;
};

const listOwnCards = ({ auth }) =>
  repo.findByUser({ tenantId: auth.tenantId, userId: auth.userId });

const getOwnCard = async ({ auth, cardId }) => {
  const card = await repo.findById({ tenantId: auth.tenantId, cardId });
  if (!card || card.user_id !== auth.userId) {
    throw httpError(404, "Card not found");
  }
  return card;
};

const customerTransitions = { active: ["frozen"], frozen: ["active"] };
const adminTransitions = {
  pending: ["active","inactive"],
  active: ["frozen","blocked","inactive"],
  frozen: ["active","blocked","inactive"],
  blocked: ["active","inactive"],
  inactive: [],
  expired: []
};

const changeOwnStatus = async ({ auth, cardId, status }) => {
  const card = await getOwnCard({ auth, cardId });
  if (!(customerTransitions[card.status] || []).includes(status)) {
    throw httpError(409, `A customer cannot change a ${card.status} card to ${status}`);
  }
  const updated = await repo.updateStatus({
    tenantId: auth.tenantId, cardId, status
  });
  await repo.createEvent({
    tenantId: auth.tenantId, cardId, userId: card.user_id,
    actorUserId: auth.userId, eventType: `card_${status}`
  });
  return updated;
};

const changeStatusAsAdmin = async ({ auth, cardId, status, reason }) => {
  const card = await repo.findById({ tenantId: auth.tenantId, cardId });
  if (!card) throw httpError(404, "Card not found");
  if (!(adminTransitions[card.status] || []).includes(status)) {
    throw httpError(409, `Cannot change a ${card.status} card to ${status}`);
  }
  const updated = await repo.updateStatus({
    tenantId: auth.tenantId, cardId, status
  });
  await repo.createEvent({
    tenantId: auth.tenantId, cardId, userId: card.user_id,
    actorUserId: auth.userId, eventType: `card_${status}`,
    metadata: reason ? { reason } : null
  });
  return updated;
};

module.exports = {
  createCard,listOwnCards,getOwnCard,changeOwnStatus,changeStatusAsAdmin
};
