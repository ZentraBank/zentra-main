const subscriptionRepo = require("./subscription.repository");
const auditService = require("../auditLogs/audit.service");

function isAdmin(user) {
  return ["tenant_admin", "super_admin"].includes(user.role);
}

async function requestSubscription({ tenantId, user, plan_name, amount, currency, payment_reference, payment_note }) {
  if (!plan_name || !amount || Number(amount) <= 0) {
    throw new Error("Plan name and valid amount are required");
  }

  const subscriptionId = await subscriptionRepo.createRequest({
    tenantId,
    planName: plan_name,
    amount,
    currency,
    paymentReference: payment_reference,
    paymentNote: payment_note,
  });

  await auditService.logAction({
    tenantId,
    userId: user.id,
    action: "SUBSCRIPTION_REQUESTED",
    entityType: "subscription",
    entityId: subscriptionId,
    metadata: { plan_name, amount, currency: currency || "USDT" },
  });

  return { subscription_id: subscriptionId };
}

async function getCurrentSubscription({ tenantId }) {
  return subscriptionRepo.getCurrentByTenant(tenantId);
}

async function getSubscriptionRequests({ tenantId, user }) {
  if (!isAdmin(user)) {
    throw new Error("Only admins can view subscription requests");
  }

  return subscriptionRepo.getAllRequests(tenantId);
}

async function approveSubscription({ tenantId, user, id }) {
  if (!isAdmin(user)) {
    throw new Error("Only admins can approve subscriptions");
  }

  const subscription = await subscriptionRepo.findByIdAndTenant({ id, tenantId });

  if (!subscription) {
    throw new Error("Subscription request not found");
  }

  if (subscription.status !== "pending") {
    throw new Error("Only pending subscriptions can be approved");
  }

  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);

  await subscriptionRepo.approve({
    id,
    tenantId,
    approvedBy: user.id,
    startsAt,
    endsAt,
  });

  await auditService.logAction({
    tenantId,
    userId: user.id,
    action: "SUBSCRIPTION_APPROVED",
    entityType: "subscription",
    entityId: id,
    metadata: { startsAt, endsAt },
  });

  return true;
}

async function rejectSubscription({ tenantId, user, id }) {
  if (!isAdmin(user)) {
    throw new Error("Only admins can reject subscriptions");
  }

  const subscription = await subscriptionRepo.findByIdAndTenant({ id, tenantId });

  if (!subscription) {
    throw new Error("Subscription request not found");
  }

  if (subscription.status !== "pending") {
    throw new Error("Only pending subscriptions can be rejected");
  }

  await subscriptionRepo.reject({
    id,
    tenantId,
    approvedBy: user.id,
  });

  await auditService.logAction({
    tenantId,
    userId: user.id,
    action: "SUBSCRIPTION_REJECTED",
    entityType: "subscription",
    entityId: id,
    metadata: {},
  });

  return true;
}

module.exports = {
  requestSubscription,
  getCurrentSubscription,
  getSubscriptionRequests,
  approveSubscription,
  rejectSubscription,
};