const db = require("../../config/db");
const repo = require("./platform-subscriptions.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getPlan = async (planId) => {
  const plan = await repo.findPlanById(planId);

  if (!plan) {
    throw httpError(404, "Subscription plan not found.");
  }

  return {
    ...plan,
    features: await repo.listPlanFeatures(planId),
  };
};

const createPlan = async ({
  auth,
  body,
}) => {
  const existing =
    await repo.findPlanByCode(body.code);

  if (existing) {
    throw httpError(
      409,
      "A subscription plan with this code already exists."
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const planId = await repo.createPlan({
      connection,
      body,
      actorUserId: auth.userId,
    });

    await repo.replacePlanFeatures({
      connection,
      planId,
      features: body.features || [],
    });

    await connection.commit();

    return getPlan(planId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updatePlanFeatures = async ({
  planId,
  features,
}) => {
  const plan = await repo.findPlanById(planId);

  if (!plan) {
    throw httpError(404, "Subscription plan not found.");
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await repo.replacePlanFeatures({
      connection,
      planId,
      features,
    });

    await connection.commit();

    return getPlan(planId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const changeTenantPlan = async ({
  auth,
  tenantId,
  planId,
  action,
  reason,
}) => {
  const subscription =
    await repo.findTenantSubscription(tenantId);

  if (!subscription) {
    throw httpError(
      404,
      "Tenant subscription not found."
    );
  }

  const plan = await repo.findPlanById(planId);

  if (!plan || plan.status !== "active") {
    throw httpError(
      409,
      "The selected subscription plan is not active."
    );
  }

  if (subscription.plan_id === planId) {
    throw httpError(
      409,
      "The tenant is already using this subscription plan."
    );
  }

  const updated =
    await repo.updateTenantSubscription({
      tenantId,
      subscriptionId: subscription.id,
      planId,
    });

  await repo.createSubscriptionHistory({
    tenantId,
    subscriptionId: subscription.id,
    previousPlanId: subscription.plan_id,
    newPlanId: planId,
    action,
    previousStatus: subscription.status,
    newStatus: subscription.status,
    reason,
    actorUserId: auth.userId,
  });

  return updated;
};

const changeTenantSubscriptionStatus = async ({
  auth,
  tenantId,
  status,
  action,
  reason,
}) => {
  const subscription =
    await repo.findTenantSubscription(tenantId);

  if (!subscription) {
    throw httpError(
      404,
      "Tenant subscription not found."
    );
  }

  const transitions = {
    active: ["suspended", "cancelled", "expired"],
    suspended: ["active", "cancelled"],
    cancelled: ["active"],
    expired: ["active"],
    past_due: ["active", "suspended", "cancelled"],
  };

  if (
    !(transitions[subscription.status] || []).includes(status)
  ) {
    throw httpError(
      409,
      `Cannot change subscription from ${subscription.status} to ${status}.`
    );
  }

  const updated =
    await repo.updateTenantSubscription({
      tenantId,
      subscriptionId: subscription.id,
      status,
    });

  await repo.createSubscriptionHistory({
    tenantId,
    subscriptionId: subscription.id,
    previousPlanId: subscription.plan_id,
    newPlanId: subscription.plan_id,
    action,
    previousStatus: subscription.status,
    newStatus: status,
    reason,
    actorUserId: auth.userId,
  });

  return updated;
};

const renewTenantSubscription = async ({
  auth,
  tenantId,
  expiresAt,
  reason,
}) => {
  const subscription =
    await repo.findTenantSubscription(tenantId);

  if (!subscription) {
    throw httpError(
      404,
      "Tenant subscription not found."
    );
  }

  const updated =
    await repo.updateTenantSubscription({
      tenantId,
      subscriptionId: subscription.id,
      status: "active",
      renewedAt: new Date(),
      expiresAt,
    });

  await repo.createSubscriptionHistory({
    tenantId,
    subscriptionId: subscription.id,
    previousPlanId: subscription.plan_id,
    newPlanId: subscription.plan_id,
    action: "renewed",
    previousStatus: subscription.status,
    newStatus: "active",
    reason,
    actorUserId: auth.userId,
  });

  return updated;
};

module.exports = {
  createPlan,
  getPlan,
  updatePlanFeatures,
  changeTenantPlan,
  changeTenantSubscriptionStatus,
  renewTenantSubscription,

  listPlans: ({ query }) =>
    repo.listPlans({
      page: Number(query.page || 1),
      limit: Math.min(
        Number(query.limit || 20),
        100
      ),
      search: query.search,
      status: query.status,
    }),

  updatePlan: async ({
    auth,
    planId,
    body,
  }) => {
    const plan = await repo.findPlanById(planId);

    if (!plan) {
      throw httpError(
        404,
        "Subscription plan not found."
      );
    }

    return repo.updatePlan({
      planId,
      body,
      actorUserId: auth.userId,
    });
  },

  getTenantSubscription: async ({
    tenantId,
  }) => {
    const subscription =
      await repo.findTenantSubscription(tenantId);

    if (!subscription) {
      throw httpError(
        404,
        "Tenant subscription not found."
      );
    }

    return {
      subscription,
      override:
        await repo.getTenantOverride({
          tenantId,
          subscriptionId: subscription.id,
        }),
      history:
        await repo.listTenantSubscriptionHistory({
          tenantId,
          limit: 100,
        }),
    };
  },

  upsertTenantOverride: async ({
    auth,
    tenantId,
    body,
  }) => {
    const subscription =
      await repo.findTenantSubscription(tenantId);

    if (!subscription) {
      throw httpError(
        404,
        "Tenant subscription not found."
      );
    }

    await repo.upsertTenantOverride({
      tenantId,
      subscriptionId: subscription.id,
      body,
      actorUserId: auth.userId,
    });

    return repo.getTenantOverride({
      tenantId,
      subscriptionId: subscription.id,
    });
  },
};
