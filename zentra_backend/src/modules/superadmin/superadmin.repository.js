const { randomUUID } = require("crypto");
const db = require("../../config/db");

const listTenants = async ({
  page,
  limit,
  search,
  status,
}) => {
  const offset = (page - 1) * limit;
  const where = ["deleted_at IS NULL"];
  const values = [];

  if (search) {
    where.push(
      "(name LIKE ? OR slug LIKE ? OR app_name LIKE ?)"
    );

    const term = `%${search}%`;
    values.push(term, term, term);
  }

  if (status) {
    where.push("status = ?");
    values.push(status);
  }

  const clause = `WHERE ${where.join(" AND ")}`;

  const [rows] = await db.query(
    `
      SELECT
        id,
        slug AS code,
        slug,
        name,
        app_name,
        logo_url,
        primary_color,
        status,
        created_at,
        updated_at
      FROM tenants
      ${clause}
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
    `,
    [
      ...values,
      Number(limit),
      Number(offset),
    ]
  );

  const [countRows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM tenants
      ${clause}
    `,
    values
  );

  const total = Number(
    countRows[0]?.total || 0
  );

  return {
    rows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.max(
        1,
        Math.ceil(total / Number(limit))
      ),
    },
  };
};

const findTenantById = async (tenantId) => {
  const [rows] = await db.query(
    "SELECT * FROM tenants WHERE id = ? LIMIT 1",
    [tenantId]
  );

  return rows[0] || null;
};

const createTenant = async ({ connection, body, createdBy }) => {
  const tenantId = randomUUID();

  await connection.query(
    `INSERT INTO tenants
      (id, code, name, app_name, logo_url, primary_color, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      tenantId,
      body.code,
      body.name,
      body.appName,
      body.logoUrl || null,
      body.primaryColor,
      createdBy,
    ]
  );

  return tenantId;
};

const createTenantOwner = async ({ connection, tenantId, body }) => {
  const userId = randomUUID();

  await connection.query(
    `INSERT INTO users
      (id, tenant_id, email, first_name, last_name, user_type, status)
     VALUES (?, ?, ?, ?, ?, 'tenant_admin', 'pending')`,
    [
      userId,
      tenantId,
      body.ownerEmail,
      body.ownerFirstName,
      body.ownerLastName,
    ]
  );

  return userId;
};

const createSubscription = async ({ connection, tenantId, planId }) => {
  const subscriptionId = randomUUID();

  await connection.query(
    `INSERT INTO subscriptions
      (id, tenant_id, plan_id, status, started_at)
     VALUES (?, ?, ?, 'active', NOW())`,
    [subscriptionId, tenantId, planId]
  );

  return subscriptionId;
};

const updateTenantStatus = async ({ tenantId, status }) => {
  await db.query(
    "UPDATE tenants SET status = ? WHERE id = ?",
    [status, tenantId]
  );

  return findTenantById(tenantId);
};

const upsertFeatureOverride = async ({
  tenantId,
  featureCode,
  isEnabled,
  reason,
  actorUserId,
}) => {
  await db.query(
    `INSERT INTO tenant_feature_overrides
      (id, tenant_id, feature_code, is_enabled, override_reason, created_by)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       is_enabled = VALUES(is_enabled),
       override_reason = VALUES(override_reason),
       created_by = VALUES(created_by),
       approved_by = NULL,
       approved_at = NULL`,
    [
      randomUUID(),
      tenantId,
      featureCode,
      isEnabled,
      reason || null,
      actorUserId,
    ]
  );
};

const listFeatureOverrides = async (tenantId) => {
  const [rows] = await db.query(
    `SELECT * FROM tenant_feature_overrides
     WHERE tenant_id = ?
     ORDER BY feature_code`,
    [tenantId]
  );

  return rows;
};

const getDashboardMetrics = async () => {
  const [
    [tenants],
    [users],
    [transactions],
    [subscriptions],
  ] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'active'), 0) AS active,
        COALESCE(SUM(status = 'suspended'), 0) AS suspended,
        COALESCE(SUM(status = 'pending'), 0) AS pending
      FROM tenants
    `),

    db.query(`
      SELECT
        COUNT(DISTINCT u.id) AS total,

        COUNT(
          DISTINCT CASE
            WHEN r.code = 'tenant_admin'
            THEN u.id
          END
        ) AS tenant_administrators,

        COUNT(
          DISTINCT CASE
            WHEN r.code = 'customer'
            THEN u.id
          END
        ) AS customers

      FROM users u

      LEFT JOIN tenant_memberships tm
        ON tm.user_id = u.id

      LEFT JOIN roles r
        ON r.id = tm.role_id

      WHERE u.deleted_at IS NULL
    `),

    db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(amount), 0) AS volume
      FROM transfers
    `),

db.query(`
  SELECT
    COUNT(*) AS total,
    COALESCE(SUM(status = 'active'), 0) AS active,
    COALESCE(SUM(status = 'pending'), 0) AS pending,
    COALESCE(SUM(status = 'expired'), 0) AS expired,
    COALESCE(SUM(status = 'cancelled'), 0) AS cancelled,
    COALESCE(SUM(status = 'suspended'), 0) AS suspended
  FROM user_subscriptions
`)
  ]);

  return {
    tenants: tenants[0] || {
      total: 0,
      active: 0,
      suspended: 0,
      pending: 0,
    },

    users: users[0] || {
      total: 0,
      tenant_administrators: 0,
      customers: 0,
    },

    transactions: transactions[0] || {
      total: 0,
      volume: 0,
    },

subscriptions: subscriptions[0] || {
  total: 0,
  active: 0,
  pending: 0,
  expired: 0,
  cancelled: 0,
  suspended: 0,
},
  };
};

const createAuditLog = async ({
  actorUserId,
  actionCode,
  tenantId,
  entityType,
  entityId,
  oldValues,
  newValues,
  requestContext,
  connection = db,
}) => {
  await connection.query(
    `INSERT INTO platform_audit_logs
      (id, actor_platform_user_id, action_code, tenant_id, entity_type,
       entity_id, old_values, new_values, ip_address, user_agent, request_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      actorUserId,
      actionCode,
      tenantId || null,
      entityType || null,
      entityId || null,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      requestContext?.ipAddress || null,
      requestContext?.userAgent || null,
      requestContext?.requestId || null,
    ]
  );
};

const listTenantAdministrators = async (tenantId) => {
  const [rows] = await db.query(
    `SELECT id, tenant_id, email, first_name, last_name, status, created_at
       FROM users
      WHERE tenant_id = ? AND user_type = 'tenant_admin'
      ORDER BY created_at DESC`,
    [tenantId]
  );

  return rows;
};

const listAuditLogs = async ({ limit }) => {
  const [rows] = await db.query(
    `SELECT * FROM platform_audit_logs
     ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );

  return rows;
};

module.exports = {
  listTenants,
  findTenantById,
  createTenant,
  createTenantOwner,
  createSubscription,
  updateTenantStatus,
  upsertFeatureOverride,
  listFeatureOverrides,
  getDashboardMetrics,
  createAuditLog,
  listTenantAdministrators,
  listAuditLogs,
};
