require("dotenv").config();

const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../src/config/db");

const permissions = [
  "platform.dashboard.read",
  "platform.tenants.create",
  "platform.tenants.read",
  "platform.tenants.update",
  "platform.tenants.features.manage",
  "platform.administrators.create",
  "platform.administrators.read",
  "platform.administrators.update",
  "platform.administrators.suspend",
  "platform.administrators.permissions.manage",
  "platform.subscriptions.read",
  "platform.subscriptions.create",
  "platform.subscriptions.update",
  "platform.subscriptions.cancel",
  "platform.users.read",
  "platform.accounts.read",
  "platform.transactions.read",
  "platform.audit_logs.read",
  "platform.notifications.read",
  "platform.notifications.create",
  "platform.settings.read",
  "platform.settings.manage",
];

const run = async () => {
  const email =
    process.env.FIRST_SUPERADMIN_EMAIL?.trim().toLowerCase();

  const password =
    process.env.FIRST_SUPERADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "FIRST_SUPERADMIN_EMAIL and FIRST_SUPERADMIN_PASSWORD are required in Backend/.env."
    );
  }

  if (password.length < 12) {
    throw new Error(
      "FIRST_SUPERADMIN_PASSWORD must be at least 12 characters."
    );
  }

  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `
        SELECT id
        FROM platform_users
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );

    if (existing.length > 0) {
      throw new Error(
        "A platform user with this email already exists."
      );
    }

    const userId = randomUUID();

    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS || 12)
    );

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
        )
        VALUES (?, ?, ?, ?, ?, 'platform_superadmin', 'active')
      `,
      [
        userId,
        email,
        passwordHash,
        process.env.FIRST_SUPERADMIN_FIRST_NAME || "Platform",
        process.env.FIRST_SUPERADMIN_LAST_NAME || "Administrator",
      ]
    );

    for (const permissionCode of permissions) {
      await connection.query(
        `
          INSERT INTO platform_user_permissions (
            id,
            platform_user_id,
            permission_code,
            granted_by
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          randomUUID(),
          userId,
          permissionCode,
          userId,
        ]
      );
    }

    await connection.commit();

    console.log(
      `Created first platform superadmin: ${email}`
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await db.closeDatabaseConnection();
  }
};

run().catch((error) => {
  console.error(
    "Unable to create first platform superadmin:",
    error.message
  );
  process.exit(1);
});
