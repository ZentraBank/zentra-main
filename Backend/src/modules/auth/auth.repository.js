const { query } = require("../../utils/query");

const findUserForLogin = async ({
  email,
  tenantId,
}) => {
  const rows = await query(
    `
      SELECT
        users.id,
        users.first_name,
        users.middle_name,
        users.last_name,
        users.email,
        users.phone,
        users.password_hash,
        users.avatar_url,
        users.status AS user_status,
        users.email_verified_at,
        users.last_login_at,

        tenant_memberships.id AS membership_id,
        tenant_memberships.status AS membership_status,

        roles.id AS role_id,
        roles.name AS role_name,
        roles.code AS role_code,

        tenants.id AS tenant_id,
        tenants.name AS tenant_name,
        tenants.slug AS tenant_slug,
        tenants.status AS tenant_status

      FROM users

      INNER JOIN tenant_memberships
        ON tenant_memberships.user_id = users.id

      INNER JOIN roles
        ON roles.id = tenant_memberships.role_id

      INNER JOIN tenants
        ON tenants.id = tenant_memberships.tenant_id

      WHERE users.email = ?
        AND tenants.id = ?
        AND users.deleted_at IS NULL
      LIMIT 1
    `,
    [
      email,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const findAuthenticationContext = async ({
  userId,
  membershipId,
  tenantId,
}) => {
  const rows = await query(
    `
      SELECT
        users.id,
        users.first_name,
        users.middle_name,
        users.last_name,
        users.email,
        users.phone,
        users.avatar_url,
        users.status AS user_status,
        users.email_verified_at,
        users.last_login_at,

        tenant_memberships.id AS membership_id,
        tenant_memberships.status AS membership_status,

        roles.id AS role_id,
        roles.name AS role_name,
        roles.code AS role_code,
        roles.is_active AS role_is_active,

        tenants.id AS tenant_id,
        tenants.name AS tenant_name,
        tenants.slug AS tenant_slug,
        tenants.status AS tenant_status

      FROM users

      INNER JOIN tenant_memberships
        ON tenant_memberships.user_id = users.id

      INNER JOIN roles
        ON roles.id = tenant_memberships.role_id

      INNER JOIN tenants
        ON tenants.id = tenant_memberships.tenant_id

      WHERE users.id = ?
        AND tenant_memberships.id = ?
        AND tenants.id = ?
        AND users.deleted_at IS NULL
      LIMIT 1
    `,
    [
      userId,
      membershipId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const findUserMembershipByTenant = async ({
  userId,
  tenantId,
}) => {
  const rows = await query(
    `
      SELECT
        users.id,
        users.first_name,
        users.middle_name,
        users.last_name,
        users.email,
        users.phone,
        users.avatar_url,
        users.status AS user_status,
        users.email_verified_at,
        users.last_login_at,

        tenant_memberships.id AS membership_id,
        tenant_memberships.status AS membership_status,

        roles.id AS role_id,
        roles.name AS role_name,
        roles.code AS role_code,
        roles.is_active AS role_is_active,

        tenants.id AS tenant_id,
        tenants.name AS tenant_name,
        tenants.slug AS tenant_slug,
        tenants.status AS tenant_status

      FROM users

      INNER JOIN tenant_memberships
        ON tenant_memberships.user_id = users.id

      INNER JOIN roles
        ON roles.id = tenant_memberships.role_id

      INNER JOIN tenants
        ON tenants.id = tenant_memberships.tenant_id

      WHERE users.id = ?
        AND tenants.id = ?
        AND users.deleted_at IS NULL
      LIMIT 1
    `,
    [
      userId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const findPermissionsByRoleId = async (roleId) => {
  const rows = await query(
    `
      SELECT
        permissions.code,
        permissions.name,
        permissions.module
      FROM role_permissions

      INNER JOIN permissions
        ON permissions.id =
          role_permissions.permission_id

      WHERE role_permissions.role_id = ?

      ORDER BY permissions.code ASC
    `,
    [roleId]
  );

  return rows;
};

const updateLastLogin = async (userId) => {
  return query(
    `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ?
    `,
    [userId]
  );
};

const createRefreshToken = async ({
  id,
  userId,
  tenantId,
  tokenHash,
  expiresAt,
  ipAddress,
  userAgent,
}) => {
  return query(
    `
      INSERT INTO refresh_tokens (
        id,
        user_id,
        tenant_id,
        token_hash,
        expires_at,
        created_by_ip,
        user_agent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      userId,
      tenantId,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    ]
  );
};

const findRefreshTokenByHash = async (tokenHash) => {
  const rows = await query(
    `
      SELECT
        id,
        user_id,
        tenant_id,
        token_hash,
        expires_at,
        revoked_at,
        replaced_by_token_id,
        created_by_ip,
        revoked_by_ip,
        user_agent,
        created_at
      FROM refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};

const revokeRefreshToken = async ({
  tokenId,
  ipAddress,
  replacementTokenId = null,
}) => {
  return query(
    `
      UPDATE refresh_tokens
      SET
        revoked_at = NOW(),
        revoked_by_ip = ?,
        replaced_by_token_id = ?
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [
      ipAddress,
      replacementTokenId,
      tokenId,
    ]
  );
};

const revokeAllUserRefreshTokens = async ({
  userId,
  tenantId,
  ipAddress,
}) => {
  return query(
    `
      UPDATE refresh_tokens
      SET
        revoked_at = NOW(),
        revoked_by_ip = ?
      WHERE user_id = ?
        AND tenant_id = ?
        AND revoked_at IS NULL
    `,
    [
      ipAddress,
      userId,
      tenantId,
    ]
  );
};

module.exports = {
  findUserForLogin,
  findAuthenticationContext,
  findUserMembershipByTenant,
  findPermissionsByRoleId,
  updateLastLogin,
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};