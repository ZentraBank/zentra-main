const repo = require("./subscriptions.repository");

const httpError = (statusCode, message) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

const listPlans = ({ tenantId }) => repo.listPlans({ tenantId });

const getMine = async ({ tenantId, userId }) => ({
  subscription: await repo.findActiveSubscription({ tenantId, userId }),
  openRequest: await repo.findOpenRequest({ tenantId, userId })
});

const startUpgrade = async ({ tenantId, userId, planCode }) => {
  const plan = await repo.findPlanByCode({ tenantId, planCode });
  if (!plan) throw httpError(404, "Subscription plan not found");

  const open = await repo.findOpenRequest({ tenantId, userId });
  if (open) throw httpError(409, "You already have an open subscription request");

  const active = await repo.findActiveSubscription({ tenantId, userId });
  if (active?.plan_id === plan.id) {
    throw httpError(409, "You are already subscribed to this plan");
  }

  return repo.createRequest({ tenantId, userId, planId: plan.id });
};

const submitProof = async ({ auth, requestId, body }) => {
  const request = await repo.findRequestById({
    tenantId: auth.tenantId, requestId
  });

  if (!request || request.user_id !== auth.userId) {
    throw httpError(404, "Subscription request not found");
  }

  const updated = await repo.submitProof({
    tenantId: auth.tenantId,
    userId: auth.userId,
    requestId,
    paymentReference: body.paymentReference,
    paymentProofUrl: body.paymentProofUrl,
    paymentNote: body.paymentNote
  });

  if (!updated) throw httpError(409, "Payment proof cannot be submitted");

  return repo.findRequestById({ tenantId: auth.tenantId, requestId });
};

const listPending = ({ tenantId, page, pageSize }) =>
  repo.listPending({
    tenantId,
    limit: Math.min(pageSize, 100),
    offset: (page - 1) * Math.min(pageSize, 100)
  });

const approve = async ({ auth, requestId, durationDays }) => {
  const connection = await repo.db.getConnection();

  try {
    await connection.beginTransaction();

    const request = await repo.findRequestById({
      tenantId: auth.tenantId,
      requestId,
      connection,
      forUpdate: true
    });

    if (!request) throw httpError(404, "Subscription request not found");
    if (request.status !== "payment_submitted") {
      throw httpError(409, "Only submitted payments can be approved");
    }

    await repo.expireActive({
      connection,
      tenantId: auth.tenantId,
      userId: request.user_id
    });

    const startsAt = new Date();
    const expiresAt = new Date(
      startsAt.getTime() + durationDays * 86400000
    );

    await repo.createSubscription({
      connection,
      tenantId: auth.tenantId,
      userId: request.user_id,
      planId: request.plan_id,
      startsAt,
      expiresAt
    });

    await repo.approveRequest({
      connection,
      tenantId: auth.tenantId,
      requestId,
      reviewerUserId: auth.userId
    });

    await connection.commit();
    return repo.findRequestById({ tenantId: auth.tenantId, requestId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const reject = async ({ auth, requestId, reason }) => {
  const request = await repo.findRequestById({
    tenantId: auth.tenantId, requestId
  });
  if (!request) throw httpError(404, "Subscription request not found");

  const ok = await repo.rejectRequest({
    tenantId: auth.tenantId,
    requestId,
    reviewerUserId: auth.userId,
    reason
  });

  if (!ok) throw httpError(409, "Only submitted payments can be rejected");
  return repo.findRequestById({ tenantId: auth.tenantId, requestId });
};

module.exports = {
  listPlans, getMine, startUpgrade,
  submitProof, listPending, approve, reject
};
