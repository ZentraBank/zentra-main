const platformRepo = require("./platform.repository");
const auditService = require("../auditLogs/audit.service");

function ensureSuperAdmin(user) {
  if (!user || user.role !== "super_admin") {
    throw new Error("Only platform super admins can perform this action");
  }
}

async function getTenants({ user, limit, offset, filters }) {
  ensureSuperAdmin(user);

  return platformRepo.getAllTenants({
    limit,
    offset,
    status: filters.status,
  });
}

async function getTenantDetails({ user, tenantId }) {
  ensureSuperAdmin(user);

  const tenant = await platformRepo.getTenantById(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
}

async function suspendTenant({ user, tenantId, currentTenantId }) {
  ensureSuperAdmin(user);

  const tenant = await platformRepo.getTenantById(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await platformRepo.updateTenantStatus({
    tenantId,
    status: "suspended",
  });

  await auditService.logAction({
    tenantId: currentTenantId,
    userId: user.id,
    action: "PLATFORM_TENANT_SUSPENDED",
    entityType: "tenant",
    entityId: tenantId,
    metadata: {
      suspended_tenant_name: tenant.name,
    },
  });

  return true;
}

async function activateTenant({ user, tenantId, currentTenantId }) {
  ensureSuperAdmin(user);

  const tenant = await platformRepo.getTenantById(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await platformRepo.updateTenantStatus({
    tenantId,
    status: "active",
  });

  await auditService.logAction({
    tenantId: currentTenantId,
    userId: user.id,
    action: "PLATFORM_TENANT_ACTIVATED",
    entityType: "tenant",
    entityId: tenantId,
    metadata: {
      activated_tenant_name: tenant.name,
    },
  });

  return true;
}

async function setTenantSubscriptionStatus({
  user,
  tenantId,
  subscription_status,
  currentTenantId,
}) {
  ensureSuperAdmin(user);

  const allowed = ["trial", "active", "expired", "suspended"];

  if (!allowed.includes(subscription_status)) {
    throw new Error("Invalid subscription status");
  }

  const updated = await platformRepo.updateTenantSubscriptionStatus({
    tenantId,
    subscriptionStatus: subscription_status,
  });

  if (!updated) {
    throw new Error("Tenant not found");
  }

  await auditService.logAction({
    tenantId: currentTenantId,
    userId: user.id,
    action: "PLATFORM_TENANT_SUBSCRIPTION_UPDATED",
    entityType: "tenant",
    entityId: tenantId,
    metadata: {
      subscription_status,
    },
  });

  return true;
}

async function getGlobalDashboard({ user }) {
  ensureSuperAdmin(user);

  const [overview, tenant_breakdown] = await Promise.all([
    platformRepo.getGlobalAnalytics(),
    platformRepo.getTenantAnalyticsBreakdown(),
  ]);

  return {
    overview,
    tenant_breakdown,
  };
}

module.exports = {
  getTenants,
  getTenantDetails,
  suspendTenant,
  activateTenant,
  setTenantSubscriptionStatus,
  getGlobalDashboard,
};