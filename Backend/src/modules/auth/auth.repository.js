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
        'not_started' AS kyc_status,
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
}) => {
  const [rows] = await db.query(
    `
      SELECT
        u.id,
        CONCAT_WS(
          ' ',
          u.first_name,
          u.middle_name,
          u.last_name
        ) AS full_name,
        u.email,
        u.phone,
        'not_started' AS kyc_status,
        u.status AS user_status,

        tm.id AS membership_id,
        tm.status AS membership_status,

        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code,
        r.is_active AS role_is_active,

        t.id AS tenant_id,
        t.slug AS tenant_slug,
        t.status AS tenant_status,

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

      INNER JOIN tenants t
        ON t.id = tm.tenant_id

      LEFT JOIN user_subscriptions us
        ON us.user_id = u.id
       AND us.tenant_id = t.id
       AND us.status = 'active'
       AND (
         us.expires_at IS NULL
         OR us.expires_at > NOW()
       )

      LEFT JOIN subscription_plans sp
        ON sp.id = us.plan_id
       AND sp.is_active = TRUE

      WHERE u.id = ?

      LIMIT 1
    `,
    [tenantId, userId]
  );

  return rows[0] || null;
};

const findPermissionsByRoleId = async (roleId) => {
  const [rows] = await db.query(
    `
      SELECT DISTINCT p.id, p.name, p.code, p.module
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

  // ZentraBank has two refresh-token schema variants in the repository:
  // the tenant-auth migration uses membership_id/ip_address, while the
  // consolidated schema uses created_by_ip without membership_id. Detect the
  // installed schema so login works safely against either database version.
  const [columnRows] = await db.query("SHOW COLUMNS FROM refresh_tokens");
  const availableColumns = new Set(columnRows.map((column) => column.Field));

  const columns = ["id", "user_id", "tenant_id"];
  const values = [id, userId, tenantId];

  if (availableColumns.has("membership_id")) {
    if (!membershipId) {
      throw new Error("A valid tenant membership is required to issue a refresh token");
    }

    columns.push("membership_id");
    values.push(membershipId);
  }

  columns.push("token_hash");
  values.push(tokenHash);

  if (availableColumns.has("created_by_ip")) {
    columns.push("created_by_ip");
    values.push(ipAddress || null);
  } else if (availableColumns.has("ip_address")) {
    columns.push("ip_address");
    values.push(ipAddress || null);
  }

  columns.push("user_agent", "expires_at");
  values.push(userAgent || null, expiresAt);

  const placeholders = columns.map(() => "?").join(", ");

  await db.query(
    `INSERT INTO refresh_tokens (${columns.join(", ")}) VALUES (${placeholders})`,
    values
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

const findAnyUserByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT id, email, password_hash, status FROM users WHERE LOWER(email) = LOWER(?) AND deleted_at IS NULL LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findCustomerRole = async (tenantId) => {
  const [rows] = await db.query(
    `SELECT id FROM roles WHERE code = 'customer' AND is_active = TRUE AND (tenant_id = ? OR tenant_id IS NULL) ORDER BY tenant_id IS NULL ASC LIMIT 1`,
    [tenantId]
  );
  return rows[0] || null;
};

const createVerificationCode = async ({ id, tenantId, userId = null, purpose, destination, codeHash, payloadJson = null, expiresAt }) => {
  await db.query(
    `UPDATE auth_verification_codes SET consumed_at = NOW() WHERE tenant_id = ? AND purpose = ? AND destination = ? AND consumed_at IS NULL`,
    [tenantId, purpose, destination]
  );
  await db.query(
    `INSERT INTO auth_verification_codes (id, tenant_id, user_id, purpose, destination, code_hash, payload_json, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, tenantId, userId, purpose, destination, codeHash, payloadJson ? JSON.stringify(payloadJson) : null, expiresAt]
  );
};

const findActiveVerificationCode = async ({ tenantId, purpose, destination }) => {
  const [rows] = await db.query(
    `SELECT * FROM auth_verification_codes WHERE tenant_id = ? AND purpose = ? AND destination = ? AND consumed_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
    [tenantId, purpose, destination]
  );
  const row = rows[0] || null;
  if (row && typeof row.payload_json === "string") {
    try { row.payload_json = JSON.parse(row.payload_json); } catch { row.payload_json = null; }
  }
  return row;
};

const incrementVerificationAttempts = async (id) => {
  await db.query(`UPDATE auth_verification_codes SET attempts = attempts + 1 WHERE id = ?`, [id]);
};

const consumeVerificationCode = async (id) => {
  await db.query(`UPDATE auth_verification_codes SET consumed_at = NOW() WHERE id = ?`, [id]);
};

const createRegisteredCustomer = async ({ tenantId, roleId, firstName, middleName, lastName, email, phone, passwordHash }) => {
  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();
    const userId = randomUUID();
    const membershipId = randomUUID();
    await connection.query(
      `INSERT INTO users (id, first_name, middle_name, last_name, email, phone, password_hash, status, email_verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [userId, firstName, middleName || null, lastName, email, phone || null, passwordHash]
    );
    await connection.query(
      `INSERT INTO tenant_memberships (id, tenant_id, user_id, role_id, status) VALUES (?, ?, ?, ?, 'active')`,
      [membershipId, tenantId, userId, roleId]
    );
    await connection.commit();
    return { userId, membershipId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updatePassword = async ({ userId, passwordHash }) => {
  await db.query(`UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`, [passwordHash, userId]);
  await db.query(`UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, NOW()) WHERE user_id = ?`, [userId]);
};

module.exports.findAnyUserByEmail = findAnyUserByEmail;
module.exports.findCustomerRole = findCustomerRole;
module.exports.createVerificationCode = createVerificationCode;
module.exports.findActiveVerificationCode = findActiveVerificationCode;
module.exports.incrementVerificationAttempts = incrementVerificationAttempts;
module.exports.consumeVerificationCode = consumeVerificationCode;
module.exports.createRegisteredCustomer = createRegisteredCustomer;
module.exports.updatePassword = updatePassword;
