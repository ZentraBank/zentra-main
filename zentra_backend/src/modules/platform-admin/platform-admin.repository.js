const { randomUUID } = require("crypto");
const db = require("../../config/db");

const listUsers = async ({
  page,
  limit,
  search,
  role,
  status,
}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push(
      "(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)"
    );

    const term = `%${search}%`;
    values.push(term, term, term);
  }

  if (role) {
    conditions.push("role_code = ?");
    values.push(role);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

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
      ${where}
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
    `,
    [...values, limit, offset]
  );

  const [countRows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM platform_users
      ${where}
    `,
    values
  );

  const total = Number(countRows[0]?.total || 0);

  return {
    rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(
        1,
        Math.ceil(total / limit)
      ),
    },
  };
};

const findById = async (userId) => {
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

const findByEmail = async (email) => {
  const [rows] = await db.query(
    `
      SELECT id
      FROM platform_users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const create = async ({
  connection,
  email,
  firstName,
  lastName,
  roleCode,
  passwordHash,
  status,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO platform_users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        role_code,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      email,
      passwordHash,
      firstName,
      lastName,
      roleCode,
      status,
    ]
  );

  return id;
};

const replacePermissions = async ({
  connection,
  platformUserId,
  permissions = [],
  grantedBy,
}) => {
  const requestedPermissions = [
    ...new Set(
      permissions
        .filter(
          (permission) =>
            typeof permission === "string"
        )
        .map((permission) => permission.trim())
        .filter(Boolean)
    ),
  ];

  if (requestedPermissions.length > 0) {
    const placeholders =
      requestedPermissions
        .map(() => "?")
        .join(", ");

    const [validRows] =
      await connection.query(
        `
          SELECT code
          FROM permissions
          WHERE code IN (${placeholders})
            AND code LIKE 'platform.%'
        `,
        requestedPermissions
      );

    const validPermissions = new Set(
      validRows.map((row) => row.code)
    );

    const invalidPermissions =
      requestedPermissions.filter(
        (permission) =>
          !validPermissions.has(permission)
      );

    if (invalidPermissions.length > 0) {
      const error = new Error(
        `Invalid platform permissions: ${invalidPermissions.join(
          ", "
        )}`
      );

      error.statusCode = 400;
      throw error;
    }
  }

  await connection.query(
    `
      DELETE FROM platform_user_permissions
      WHERE platform_user_id = ?
    `,
    [platformUserId]
  );

  if (requestedPermissions.length === 0) {
    return;
  }

  const values = [];
  const placeholders = [];

  for (const permissionCode of requestedPermissions) {
    placeholders.push("(?, ?, ?, ?)");

    values.push(
      randomUUID(),
      platformUserId,
      permissionCode,
      grantedBy
    );
  }

  await connection.query(
    `
      INSERT INTO platform_user_permissions (
        id,
        platform_user_id,
        permission_code,
        granted_by
      )
      VALUES ${placeholders.join(", ")}
    `,
    values
  );
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

const listAvailablePermissions = async () => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        name,
        code,
        description,
        module
      FROM permissions
      WHERE code LIKE 'platform.%'
      ORDER BY
        module ASC,
        code ASC
    `
  );

  return rows;
};

const update = async ({
  userId,
  firstName,
  lastName,
  roleCode,
}) => {
  await db.query(
    `
      UPDATE platform_users
      SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        role_code = COALESCE(?, role_code)
      WHERE id = ?
    `,
    [
      firstName || null,
      lastName || null,
      roleCode || null,
      userId,
    ]
  );

  return findById(userId);
};

const updateStatus = async ({
  userId,
  status,
}) => {
  await db.query(
    `
      UPDATE platform_users
      SET status = ?
      WHERE id = ?
    `,
    [status, userId]
  );

  return findById(userId);
};

module.exports = {
  listUsers,
  findById,
  findByEmail,
  create,
  replacePermissions,
  listPermissions,
  update,
  updateStatus,
  listAvailablePermissions,
};
