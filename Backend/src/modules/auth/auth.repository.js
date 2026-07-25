const { randomUUID } = require("crypto");
const db = require("../../config/db");

/*
Expected database adapter:
  db.query(sql, params) -> mysql2-compatible result.

If your database module exports query directly, replace:
  const [rows] = await db.query(...)
with your project's equivalent.
*/

const findUserByEmailAndTenant = async (email, tenantId) => {
  const [rows] = await db.query(
    `
      SELECT
        u.id,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) AS full_name,
        u.email,
        u.phone,
        u.password_hash,
        u.kyc_status,
        u.status AS user_status,

        tm.id AS membership_id,
        tm.status AS membership_status,

        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code,

        t.id AS tenant_id,
        t.slug AS tenant_slug,

        us.id AS subscription_id,
        us.status AS subscription_status,
        us.starts_at AS subscription_starts_at,
        us.expires_at AS subscription_expires_at,

        sp.id AS plan_id,
        sp.name AS plan_name,
        sp.code AS plan_code

      FROM users u
      INNER JOIN tenant_memberships tm
        ON tm.user_id = u.id
       AND tm.tenant_id = ?
      INNER JOIN roles r
        ON r.id = tm.role_id
       AND r.is_active = TRUE
      INNER JOIN tenants t
        ON t.id = tm.tenant_id
      LEFT JOIN user_subscriptions us
        ON us.user_id = u.id
       AND us.tenant_id = t.id
       AND us.status = 'active'
       AND (us.expires_at IS NULL OR us.expires_at > NOW())
      LEFT JOIN subscription_plans sp
        ON sp.id = us.plan_id
       AND sp.is_active = TRUE
      WHERE LOWER(u.email) = LOWER(?)
      LIMIT 1
    `,
    [tenantId, email]
  );

  return rows[0] || null;
};

const findAuthContextByIdentity = async ({
  userId,
  tenantId,
  membershipId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        u.id,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) AS full_name,
        u.email,
        u.phone,
        u.kyc_status,
        u.status AS user_status,

        tm.id AS membership_id,
        tm.status AS membership_status,

        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code,

        t.id AS tenant_id,
        t.slug AS tenant_slug,

        us.id AS subscription_id,
        us.status AS subscription_status,
        us.starts_at AS subscription_starts_at,
        us.expires_at AS subscription_expires_at,

        sp.id AS plan_id,
        sp.name AS plan_name,
        sp.code AS plan_code

      FROM users u
      INNER JOIN tenant_memberships tm
        ON tm.user_id = u.id
       AND tm.tenant_id = ?
       AND tm.id = ?
      INNER JOIN roles r
        ON r.id = tm.role_id
       AND r.is_active = TRUE
      INNER JOIN tenants t
        ON t.id = tm.tenant_id
      LEFT JOIN user_subscriptions us
        ON us.user_id = u.id
       AND us.tenant_id = t.id
       AND us.status = 'active'
       AND (us.expires_at IS NULL OR us.expires_at > NOW())
      LEFT JOIN subscription_plans sp
        ON sp.id = us.plan_id
       AND sp.is_active = TRUE
      WHERE u.id = ?
      LIMIT 1
    `,
    [tenantId, membershipId, userId]
  );

  return rows[0] || null;
};

const findPermissionsByRoleId = async (roleId) => {
  const [rows] = await db.query(
    `
      SELECT p.id, p.name, p.code, p.module
      FROM role_permissions rp
      INNER JOIN permissions p
        ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.code ASC
    `,
    [roleId]
  );

  return rows;
};

const findPlanFeatures = async (planId) => {
  if (!planId) return [];

  const [rows] = await db.query(
    `
      SELECT feature_key, is_enabled, feature_value
      FROM plan_features
      WHERE plan_id = ?
      ORDER BY feature_key ASC
    `,
    [planId]
  );

  return rows;
};

const createRefreshToken = async ({
  userId,
  tenantId,
  membershipId,
  tokenHash,
  ipAddress,
  userAgent,
  expiresAt,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO refresh_tokens (
        id,
        user_id,
        tenant_id,
        membership_id,
        token_hash,
        ip_address,
        user_agent,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      userId,
      tenantId,
      membershipId,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    ]
  );

  return id;
};

const findActiveRefreshToken = async (tokenHash) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM refresh_tokens
      WHERE token_hash = ?
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};

const revokeRefreshToken = async ({
  tokenId,
  replacedByTokenId = null,
}) => {
  await db.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW(),
          replaced_by_token_id = ?
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [replacedByTokenId, tokenId]
  );
};

module.exports = {
  findUserByEmailAndTenant,
  findAuthContextByIdentity,
  findPermissionsByRoleId,
  findPlanFeatures,
  createRefreshToken,
  findActiveRefreshToken,
  revokeRefreshToken,
};
