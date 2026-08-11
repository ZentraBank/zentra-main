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

module.exports = {
  listByTenant,
  findById,
  updateAvatar,
};