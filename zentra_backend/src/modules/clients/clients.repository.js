const db = require("../../config/db");

const listByTenant = async ({ tenantId }) => {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.first_name,
       u.middle_name,
       u.last_name,
       CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) AS full_name,
       u.email,
       u.phone,
       u.avatar_url,
       u.status,
       u.email_verified_at,
       u.created_at,

       tm.id AS membership_id,
       tm.status AS membership_status,

       r.code AS role_code,

       COUNT(a.id) AS account_count

     FROM users u

     INNER JOIN tenant_memberships tm
       ON tm.user_id = u.id
      AND tm.tenant_id = ?

     INNER JOIN roles r
       ON r.id = tm.role_id
      AND r.code = 'customer'

     LEFT JOIN accounts a
       ON a.user_id = u.id
      AND a.tenant_id = tm.tenant_id

     WHERE u.deleted_at IS NULL

     GROUP BY
       u.id,
       u.first_name,
       u.middle_name,
       u.last_name,
       u.email,
       u.phone,
       u.avatar_url,
       u.status,
       u.email_verified_at,
       u.created_at,
       tm.id,
       tm.status,
       r.code

     ORDER BY u.created_at DESC`,
    [tenantId]
  );

  return rows;
};

const findById = async ({
  tenantId,
  clientId,
}) => {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.first_name,
       u.middle_name,
       u.last_name,
       CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) AS full_name,
       u.email,
       u.phone,
       u.avatar_url,
       u.avatar_storage_path,
      u.avatar_mime_type,
       u.status,
       u.email_verified_at,
       u.created_at,

       tm.id AS membership_id,
       tm.status AS membership_status,

       r.code AS role_code

     FROM users u

     INNER JOIN tenant_memberships tm
       ON tm.user_id = u.id
      AND tm.tenant_id = ?

     INNER JOIN roles r
       ON r.id = tm.role_id
      AND r.code = 'customer'

     WHERE u.id = ?
       AND u.deleted_at IS NULL

     LIMIT 1`,
    [
      tenantId,
      clientId,
    ]
  );

  return rows[0] || null;
};

const updateAvatar = async ({
  tenantId,
  clientId,
  avatarUrl,
  storagePath,
  mimeType,
}) => {
  const [result] = await db.query(
    `UPDATE users u

     INNER JOIN tenant_memberships tm
       ON tm.user_id = u.id
      AND tm.tenant_id = ?

     INNER JOIN roles r
       ON r.id = tm.role_id
      AND r.code = 'customer'

     SET u.avatar_url = ?,
         u.avatar_storage_path = ?,
         u.avatar_mime_type = ?,
         u.updated_at = NOW()

     WHERE u.id = ?
       AND u.deleted_at IS NULL`,
    [
      tenantId,
      avatarUrl,
      storagePath,
      mimeType,
      clientId,
    ]
  );

  return result.affectedRows > 0;
};

const updatePassword = async ({
  tenantId,
  clientId,
  passwordHash,
}) => {
  const [result] = await db.query(
    `UPDATE users u

     INNER JOIN tenant_memberships tm
       ON tm.user_id = u.id
      AND tm.tenant_id = ?

     INNER JOIN roles r
       ON r.id = tm.role_id
      AND r.code = 'customer'

     SET u.password_hash = ?,
         u.updated_at = NOW()

     WHERE u.id = ?
       AND u.deleted_at IS NULL`,
    [
      tenantId,
      passwordHash,
      clientId,
    ]
  );

  return result.affectedRows > 0;
};

const findTenantClientById =
  async ({
    tenantId,
    userId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            u.id AS user_id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email

          FROM tenant_memberships tm

          INNER JOIN users u
            ON u.id = tm.user_id

          INNER JOIN roles r
            ON r.id = tm.role_id
           AND r.code = 'customer'

          WHERE tm.tenant_id = ?
            AND tm.user_id = ?
            AND tm.status = 'active'
            AND u.status = 'active'
            AND u.deleted_at IS NULL

          LIMIT 1
        `,
        [
          tenantId,
          userId,
        ]
      );

    return rows[0] || null;
  };


const findTenantClientsByIds =
  async ({
    tenantId,
    userIds,
  }) => {
    if (
      !Array.isArray(userIds) ||
      userIds.length === 0
    ) {
      return [];
    }

    const placeholders =
      userIds
        .map(() => "?")
        .join(", ");

    const [rows] =
      await db.query(
        `
          SELECT DISTINCT
            u.id AS user_id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email

          FROM tenant_memberships tm

          INNER JOIN users u
            ON u.id = tm.user_id

          INNER JOIN roles r
            ON r.id = tm.role_id
           AND r.code = 'customer'

          WHERE tm.tenant_id = ?
            AND tm.user_id IN (
              ${placeholders}
            )
            AND tm.status = 'active'
            AND u.status = 'active'
            AND u.deleted_at IS NULL
        `,
        [
          tenantId,
          ...userIds,
        ]
      );

    return rows;
  };


const findAllTenantClients =
  async ({
    tenantId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT DISTINCT
            u.id AS user_id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email

          FROM tenant_memberships tm

          INNER JOIN users u
            ON u.id = tm.user_id

          INNER JOIN roles r
            ON r.id = tm.role_id
           AND r.code = 'customer'

          WHERE tm.tenant_id = ?
            AND tm.status = 'active'
            AND u.status = 'active'
            AND u.deleted_at IS NULL
        `,
        [
          tenantId,
        ]
      );

    return rows;
  };
const createInvite = async ({
  id,
  tenantId,
  createdByUserId,
  codeHash,
  codeHint,
  email,
  maxUses,
  expiresAt,
}) => {
  await db.query(
    `
      INSERT INTO client_invites (
        id,
        tenant_id,
        created_by_user_id,
        code_hash,
        code_hint,
        email,
        max_uses,
        uses_count,
        expires_at,
        created_at,
        updated_at
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        0,
        ?,
        NOW(),
        NOW()
      )
    `,
    [
      id,
      tenantId,
      createdByUserId,
      codeHash,
      codeHint,
      email,
      maxUses,
      expiresAt,
    ]
  );

  return findInviteById({
    tenantId,
    inviteId: id,
  });
};

const findInviteById = async ({
  tenantId,
  inviteId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        ci.id,
        ci.tenant_id,
        ci.created_by_user_id,
        ci.code_hint,
        ci.email,
        ci.max_uses,
        ci.uses_count,
        ci.expires_at,
        ci.revoked_at,
        ci.last_used_at,
        ci.created_at,
        ci.updated_at,

        t.slug AS tenant_slug,
        t.name AS tenant_name,

        CASE
          WHEN ci.revoked_at IS NOT NULL
            THEN 'revoked'

          WHEN ci.expires_at IS NOT NULL
            AND ci.expires_at <= NOW()
            THEN 'expired'

          WHEN ci.uses_count >= ci.max_uses
            THEN 'used'

          ELSE 'active'
        END AS status

      FROM client_invites ci

      INNER JOIN tenants t
        ON t.id = ci.tenant_id

      WHERE ci.id = ?
        AND ci.tenant_id = ?

      LIMIT 1
    `,
    [
      inviteId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const findInviteByCodeHash = async ({
  codeHash,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        ci.id,
        ci.tenant_id,
        ci.created_by_user_id,
        ci.code_hash,
        ci.code_hint,
        ci.email,
        ci.max_uses,
        ci.uses_count,
        ci.expires_at,
        ci.revoked_at,
        ci.last_used_at,
        ci.created_at,
        ci.updated_at,

        t.slug AS tenant_slug,
        t.name AS tenant_name,

        CASE
          WHEN ci.revoked_at IS NOT NULL
            THEN 'revoked'

          WHEN ci.expires_at IS NOT NULL
            AND ci.expires_at <= NOW()
            THEN 'expired'

          WHEN ci.uses_count >= ci.max_uses
            THEN 'used'

          ELSE 'active'
        END AS status

      FROM client_invites ci

      INNER JOIN tenants t
        ON t.id = ci.tenant_id

      WHERE ci.code_hash = ?

      LIMIT 1
    `,
    [
      codeHash,
    ]
  );

  return rows[0] || null;
};

const listInvitesByTenant = async ({
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        ci.id,
        ci.tenant_id,
        ci.created_by_user_id,
        ci.code_hint,
        ci.email,
        ci.max_uses,
        ci.uses_count,
        ci.expires_at,
        ci.revoked_at,
        ci.last_used_at,
        ci.created_at,
        ci.updated_at,

        CONCAT_WS(
          ' ',
          creator.first_name,
          creator.middle_name,
          creator.last_name
        ) AS created_by_name,

        creator.email AS created_by_email,

        CASE
          WHEN ci.revoked_at IS NOT NULL
            THEN 'revoked'

          WHEN ci.expires_at IS NOT NULL
            AND ci.expires_at <= NOW()
            THEN 'expired'

          WHEN ci.uses_count >= ci.max_uses
            THEN 'used'

          ELSE 'active'
        END AS status

      FROM client_invites ci

      LEFT JOIN users creator
        ON creator.id =
          ci.created_by_user_id

      WHERE ci.tenant_id = ?

      ORDER BY
        ci.created_at DESC
    `,
    [
      tenantId,
    ]
  );

  return rows;
};

const revokeInvite = async ({
  tenantId,
  inviteId,
}) => {
  const [result] = await db.query(
    `
      UPDATE client_invites

      SET revoked_at = NOW(),
          updated_at = NOW()

      WHERE id = ?
        AND tenant_id = ?
        AND revoked_at IS NULL
        AND uses_count < max_uses
        AND (
          expires_at IS NULL
          OR expires_at > NOW()
        )
    `,
    [
      inviteId,
      tenantId,
    ]
  );

  return result.affectedRows > 0;
};

const consumeInvite = async ({
  inviteId,
}) => {
  const [result] = await db.query(
    `
      UPDATE client_invites

      SET uses_count =
            uses_count + 1,
          last_used_at =
            NOW(),
          updated_at =
            NOW()

      WHERE id = ?
        AND revoked_at IS NULL
        AND uses_count < max_uses
        AND (
          expires_at IS NULL
          OR expires_at > NOW()
        )
    `,
    [
      inviteId,
    ]
  );

  return result.affectedRows > 0;
};

module.exports = {
  listByTenant,
  findById,
  updateAvatar,
  updatePassword,
  findTenantClientById,
  findTenantClientsByIds,
  findAllTenantClients,
  createInvite,
  findInviteById,
  findInviteByCodeHash,
  listInvitesByTenant,
  revokeInvite,
  consumeInvite,
};