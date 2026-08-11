const db = require("../../config/db");
const repo = require("./superadmin.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createTenant = async ({ auth, body, requestContext }) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const tenantId = await repo.createTenant({
      connection,
      body,
      createdBy: auth.userId,
    });

    const ownerUserId = await repo.createTenantOwner({
      connection,
      tenantId,
      body,
    });

    const subscriptionId = await repo.createSubscription({
      connection,
      tenantId,
      planId: body.planId,
    });

    await repo.createAuditLog({
      actorUserId: auth.userId,
      actionCode: "platform.tenant.created",
      tenantId,
      entityType: "tenant",
      entityId: tenantId,
      newValues: {
        code: body.code,
        name: body.name,
        ownerUserId,
        subscriptionId,
      },
      requestContext,
      connection,
    });

    await connection.commit();

    return {
      tenantId,
      ownerUserId,
      subscriptionId,
      status: "pending",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateTenantStatus = async ({
  auth,
  tenantId,
  status,
  requestContext,
}) => {
  const tenant = await repo.findTenantById(tenantId);

  if (!tenant) throw httpError(404, "Tenant not found.");

  const transitions = {
    pending: ["active", "suspended", "terminated"],
    active: ["suspended", "terminated"],
    suspended: ["active", "terminated"],
    terminated: [],
  };

  if (!(transitions[tenant.status] || []).includes(status)) {
    throw httpError(
      409,
      `Cannot change tenant from ${tenant.status} to ${status}.`
    );
  }

  const updated = await repo.updateTenantStatus({ tenantId, status });

  await repo.createAuditLog({
    actorUserId: auth.userId,
    actionCode: `platform.tenant.${status}`,
    tenantId,
    entityType: "tenant",
    entityId: tenantId,
    oldValues: { status: tenant.status },
    newValues: { status },
    requestContext,
  });

  return updated;
};

const updateTenantFeatures = async ({
  auth,
  tenantId,
  features,
  reason,
  requestContext,
}) => {
  const tenant = await repo.findTenantById(tenantId);
  if (!tenant) throw httpError(404, "Tenant not found.");

  for (const [featureCode, isEnabled] of Object.entries(features)) {
    await repo.upsertFeatureOverride({
      tenantId,
      featureCode,
      isEnabled,
      reason,
      actorUserId: auth.userId,
    });
  }

  await repo.createAuditLog({
    actorUserId: auth.userId,
    actionCode: "platform.tenant.features_updated",
    tenantId,
    entityType: "tenant",
    entityId: tenantId,
    newValues: { features, reason: reason || null },
    requestContext,
  });

  return repo.listFeatureOverrides(tenantId);
};

module.exports = {
  createTenant,
  updateTenantStatus,
  updateTenantFeatures,
  getDashboard: () => repo.getDashboardMetrics(),
  listTenants: ({ query }) =>
    repo.listTenants({
      page: Number(query.page || 1),
      limit: Math.min(Number(query.limit || 20), 100),
      search: query.search,
      status: query.status,
    }),
  getTenant: async ({ tenantId }) => {
    const tenant = await repo.findTenantById(tenantId);
    if (!tenant) throw httpError(404, "Tenant not found.");

    return {
      tenant,
      featureOverrides: await repo.listFeatureOverrides(tenantId),
    };
  },
  listTenantAdministrators: ({ tenantId }) =>
    repo.listTenantAdministrators(tenantId),
  listAuditLogs: ({ query }) =>
    repo.listAuditLogs({
      limit: Math.min(Number(query.limit || 50), 200),
    }),
};
