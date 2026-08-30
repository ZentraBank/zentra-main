const { randomUUID } = require("crypto");
const db = require("../../config/db");

const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        email,
        password_hash,
        first_name,
        last_name,
        role_code,
        status,
        last_login_at,
        created_at
      FROM platform_users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const findUserById = async (userId) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        email,
        first_name,
        last_name,
        role_code,
        status,
        last_login_at,
        created_at,
        updated_at
      FROM platform_users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

const listPermissions = async (platformUserId) => {
  const [rows] = await db.query(
    `
      SELECT permission_code
      FROM platform_user_permissions
      WHERE platform_user_id = ?
      ORDER BY permission_code ASC
    `,
    [platformUserId]
  );

  return rows.map((row) => row.permission_code);
};


const listActiveUsersWithPermission = async (
  permissionCode
) => {
  const [rows] = await db.query(
    `
      SELECT DISTINCT
        pu.id,
        pu.email,
        pu.first_name,
        pu.last_name,
        pu.role_code

      FROM platform_users pu

      WHERE pu.status = 'active'
        AND pu.deleted_at IS NULL

        AND (
          /* Direct permission assigned to this platform user */
          EXISTS (
            SELECT 1
            FROM platform_user_permissions pup
            WHERE pup.platform_user_id = pu.id
              AND pup.permission_code = ?
          )

          OR

          /* Permission inherited from platform role */
          EXISTS (
            SELECT 1
            FROM roles r

            INNER JOIN role_permissions rp
              ON rp.role_id = r.id

            INNER JOIN permissions p
              ON p.id = rp.permission_id

            WHERE r.code = pu.role_code
              AND r.tenant_id IS NULL
              AND r.is_active = 1
              AND p.code = ?
          )
        )

      ORDER BY pu.created_at ASC
    `,
    [
      permissionCode,
      permissionCode,
    ]
  );

  return rows;
};


const updateLastLogin = async (platformUserId) => {
  await db.query(
    `
      UPDATE platform_users
      SET last_login_at = NOW()
      WHERE id = ?
    `,
    [platformUserId]
  );
};

const createRefreshToken = async ({
  platformUserId,
  tokenHash,
  deviceName,
  ipAddress,
  userAgent,
  expiresAt,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO platform_refresh_tokens (
        id,
        platform_user_id,
        token_hash,
        device_name,
        ip_address,
        user_agent,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      platformUserId,
      tokenHash,
      deviceName || null,
      ipAddress || null,
      userAgent || null,
      expiresAt,
    ]
  );

  return id;
};

const findRefreshTokenByHash = async (tokenHash) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM platform_refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};

const rotateRefreshToken = async ({
  oldTokenId,
  newTokenId,
}) => {
  await db.query(
    `
      UPDATE platform_refresh_tokens
      SET
        revoked_at = NOW(),
        replaced_by_token_id = ?
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [newTokenId, oldTokenId]
  );
};

const revokeRefreshToken = async (tokenId) => {
  await db.query(
    `
      UPDATE platform_refresh_tokens
      SET revoked_at = NOW()
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [tokenId]
  );
};

const revokeAllRefreshTokens = async (platformUserId) => {
  await db.query(
    `
      UPDATE platform_refresh_tokens
      SET revoked_at = NOW()
      WHERE platform_user_id = ?
        AND revoked_at IS NULL
    `,
    [platformUserId]
  );
};

const recordLoginAttempt = async ({
  email,
  platformUserId,
  wasSuccessful,
  failureReason,
  ipAddress,
  userAgent,
}) => {
  await db.query(
    `
      INSERT INTO platform_login_attempts (
        id,
        email,
        platform_user_id,
        was_successful,
        failure_reason,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      email,
      platformUserId || null,
      wasSuccessful,
      failureReason || null,
      ipAddress || null,
      userAgent || null,
    ]
  );
};

const countRecentFailedAttempts = async ({
  email,
  minutes = 15,
}) => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM platform_login_attempts
      WHERE email = ?
        AND was_successful = FALSE
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
    `,
    [email, minutes]
  );

  return Number(rows[0]?.total || 0);
};

module.exports = {
  findUserByEmail,
  findUserById,
  listPermissions,
  updateLastLogin,
  createRefreshToken,
  findRefreshTokenByHash,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  recordLoginAttempt,
  countRecentFailedAttempts,
  listActiveUsersWithPermission,
};
