const bcrypt = require("bcryptjs");

const db = require("../../config/db");
const repo = require("./superadmin.repository");

const httpError = (
  statusCode,
  message
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createTenant = async ({
  auth,
  body,
  requestContext,
}) => {
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    /*
     * 1. Create tenant
     */
    const tenantId =
      await repo.createTenant({
        connection,
        body,
        createdBy: auth.userId,
      });

    /*
     * 2. Create the tenant's system roles
     * and attach the appropriate permissions.
     */
    await repo.createTenantSystemRoles({
      connection,
      tenantId,
    });

    await repo.createTenantSubscriptionPlans({
  connection,
  tenantId,
});

const selectedPlan =
  await repo.findTenantPlanByCode({
    connection,
    tenantId,
    planCode: body.planCode,
  });

if (!selectedPlan) {
  throw httpError(
    500,
    `Subscription plan "${body.planCode}" was not created for the tenant.`
  );
}

    /*
     * 3. Hash the tenant owner's password.
     *
     * Password hashing belongs in the
     * service layer, not the repository.
     */
    const ownerPasswordHash =
      await bcrypt.hash(
        body.ownerPassword,
        12
      );

    /*
     * 4. Create owner + tenant membership.
     */
    const owner =
      await repo.createTenantOwner({
        connection,
        tenantId,
        body: {
          ...body,
          ownerPasswordHash,
        },
      });

    /*
     * 5. Create the subscription only
     * when a plan was supplied.
     */
    let subscriptionId = null;

    subscriptionId =
  await repo.createSubscription({
    connection,
    tenantId,
    userId: owner.userId,
    planId: selectedPlan.id,
  });

    /*
     * 6. Platform audit log.
     */
    await repo.createAuditLog({
      actorUserId: auth.userId,
      actionCode:
        "platform.tenant.created",
      tenantId,
      entityType: "tenant",
      entityId: tenantId,
      newValues: {
  code: body.code,
  name: body.name,
  ownerUserId: owner.userId,
  membershipId: owner.membershipId,
  planCode: selectedPlan.code,
  planId: selectedPlan.id,
  subscriptionId,
},
      requestContext,
      connection,
    });

    await connection.commit();

    return {
      tenantId,

      ownerUserId:
        owner.userId,

      membershipId:
        owner.membershipId,

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
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] =
      await connection.query(
        `
          SELECT *
          FROM tenants
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [tenantId]
      );

    const tenant = rows[0];

    if (!tenant) {
      throw httpError(
        404,
        "Tenant not found."
      );
    }

    const transitions = {
      pending: [
        "active",
        "suspended",
        "terminated",
      ],

      active: [
        "suspended",
        "terminated",
      ],

      suspended: [
        "active",
        "terminated",
      ],

      terminated: [],
    };

    const allowedTransitions =
      transitions[tenant.status] || [];

    if (
      !allowedTransitions.includes(
        status
      )
    ) {
      throw httpError(
        409,
        `Cannot change tenant from ${tenant.status} to ${status}.`
      );
    }

    await connection.query(
      `
        UPDATE tenants
        SET status = ?
        WHERE id = ?
      `,
      [status, tenantId]
    );

    if (status === "active") {
      await connection.query(
        `
          UPDATE users u

          INNER JOIN tenant_memberships tm
            ON tm.user_id = u.id

          INNER JOIN roles r
            ON r.id = tm.role_id

          SET u.status = 'active'

          WHERE tm.tenant_id = ?
            AND r.code = 'tenant_admin'
            AND u.deleted_at IS NULL
        `,
        [tenantId]
      );
    }

    if (
      status === "suspended" ||
      status === "terminated"
    ) {
      await connection.query(
        `
          UPDATE users u

          INNER JOIN tenant_memberships tm
            ON tm.user_id = u.id

          INNER JOIN roles r
            ON r.id = tm.role_id

          SET u.status = 'suspended'

          WHERE tm.tenant_id = ?
            AND r.code = 'tenant_admin'
            AND u.deleted_at IS NULL
        `,
        [tenantId]
      );
    }

    await repo.createAuditLog({
      actorUserId:
        auth.userId,

      actionCode:
        `platform.tenant.${status}`,

      tenantId,

      entityType:
        "tenant",

      entityId:
        tenantId,

      oldValues: {
        status:
          tenant.status,
      },

      newValues: {
        status,
      },

      requestContext,
      connection,
    });

    await connection.commit();

    return {
      ...tenant,
      status,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateTenantFeatures = async ({
  auth,
  tenantId,
  features,
  reason,
  requestContext,
}) => {
  const tenant =
    await repo.findTenantById(
      tenantId
    );

  if (!tenant) {
    throw httpError(
      404,
      "Tenant not found."
    );
  }

  for (
    const [
      featureCode,
      isEnabled,
    ] of Object.entries(features)
  ) {
    await repo.upsertFeatureOverride({
      tenantId,
      featureCode,
      isEnabled,
      reason,
      actorUserId:
        auth.userId,
    });
  }

  await repo.createAuditLog({
    actorUserId:
      auth.userId,

    actionCode:
      "platform.tenant.features_updated",

    tenantId,

    entityType:
      "tenant",

    entityId:
      tenantId,

    newValues: {
      features,
      reason:
        reason || null,
    },

    requestContext,
  });

  return repo.listFeatureOverrides(
    tenantId
  );
};

const getDashboard = () =>
  repo.getDashboardMetrics();

const listTenants = ({
  query,
}) =>
  repo.listTenants({
    page:
      Number(query.page || 1),

    limit:
      Math.min(
        Number(query.limit || 20),
        100
      ),

    search:
      query.search,

    status:
      query.status,
  });

const getTenant = async ({
  tenantId,
}) => {
  const tenant =
    await repo.findTenantById(
      tenantId
    );

  if (!tenant) {
    throw httpError(
      404,
      "Tenant not found."
    );
  }

  const [
    featureOverrides,
    administrators,
  ] = await Promise.all([
    repo.listFeatureOverrides(
      tenantId
    ),

    repo.listTenantAdministrators(
      tenantId
    ),
  ]);

  return {
    tenant,
    featureOverrides,
    administrators,
  };
};

const listTenantAdministrators = ({
  tenantId,
}) =>
  repo.listTenantAdministrators(
    tenantId
  );

const listAuditLogs = ({
  query,
}) =>
  repo.listAuditLogs({
    limit:
      Math.min(
        Number(query.limit || 50),
        200
      ),
  });

module.exports = {
  createTenant,
  updateTenantStatus,
  updateTenantFeatures,

  getDashboard,
  listTenants,
  getTenant,

  listTenantAdministrators,
  listAuditLogs,
};