const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../src/config/db");

const TENANT_SLUG =
  process.env.BOOTSTRAP_TENANT_SLUG || "zentra-bank";
const ADMIN_NAME =
  process.env.BOOTSTRAP_ADMIN_NAME || "Tenant Administrator";
const ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD;

async function one(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
}

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required"
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("Admin password must contain at least 12 characters");
  }

  const tenant = await one(
    "SELECT id FROM tenants WHERE slug = ? LIMIT 1",
    [TENANT_SLUG]
  );

  if (!tenant) throw new Error(`Tenant "${TENANT_SLUG}" was not found`);

  const role = await one(
    `SELECT id FROM roles
     WHERE tenant_id = ? AND code = 'tenant_admin' LIMIT 1`,
    [tenant.id]
  );

  if (!role) throw new Error("Run seed:auth before bootstrapping admin");

  const email = ADMIN_EMAIL.trim().toLowerCase();

  let user = await one(
    "SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
    [email]
  );

  if (!user) {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await db.query(
      `INSERT INTO users
       (id, tenant_id, full_name, email, password_hash, role, status, kyc_status)
       VALUES (?, ?, ?, ?, ?, 'tenant_admin', 'active', 'not_started')`,
      [id, tenant.id, ADMIN_NAME, email, passwordHash]
    );

    user = { id };
  }

  await db.query(
    `INSERT INTO tenant_memberships
     (id, tenant_id, user_id, role_id, status)
     VALUES (?, ?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), status = 'active'`,
    [randomUUID(), tenant.id, user.id, role.id]
  );

  console.log(`Tenant admin ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (typeof db.end === "function") await db.end();
  });
