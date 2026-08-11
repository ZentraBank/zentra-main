const { randomUUID } = require("crypto");
const db = require("../src/config/db");

const TENANT_SLUG =
  process.env.MIGRATION_TENANT_SLUG || "zentra-bank";
const DEFAULT_ROLE =
  process.env.MIGRATION_DEFAULT_ROLE || "customer";
const DEFAULT_PLAN =
  process.env.MIGRATION_DEFAULT_PLAN || "bronze";
const SUBSCRIPTION_DAYS = Number(
  process.env.MIGRATION_SUBSCRIPTION_DAYS || 30
);

async function one(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
}

async function main() {
  const tenant = await one(
    "SELECT id, slug FROM tenants WHERE slug = ? LIMIT 1",
    [TENANT_SLUG]
  );

  if (!tenant) throw new Error(`Tenant "${TENANT_SLUG}" was not found`);

  const defaultPlan = await one(
    `SELECT id, code FROM subscription_plans
     WHERE tenant_id = ? AND code = ? AND is_active = TRUE LIMIT 1`,
    [tenant.id, DEFAULT_PLAN]
  );

  if (!defaultPlan) {
    throw new Error(`Plan "${DEFAULT_PLAN}" was not found`);
  }


  const [users] = await db.query(
    `SELECT u.id, u.email
     FROM users u
     LEFT JOIN tenant_memberships tm
       ON tm.user_id = u.id AND tm.tenant_id = ?
     WHERE tm.id IS NULL`,
    [tenant.id]
  );

  const roleCode = DEFAULT_ROLE;

  const role = await one(
    `SELECT id, code FROM roles
     WHERE tenant_id = ? AND code = ? LIMIT 1`,
    [tenant.id, roleCode]
  );

  if (!role) throw new Error(`Role "${roleCode}" was not found`);

  for (const user of users) {
    await db.query(
      `INSERT INTO tenant_memberships
       (id, tenant_id, user_id, role_id, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [randomUUID(), tenant.id, user.id, role.id]
    );

    if (role.code === "customer") {
      const current = await one(
        `SELECT id FROM user_subscriptions
         WHERE tenant_id = ? AND user_id = ? AND status = 'active'
         LIMIT 1`,
        [tenant.id, user.id]
      );

      if (!current) {
        const startsAt = new Date();
        const expiresAt = new Date(
          startsAt.getTime() +
            SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000
        );

        await db.query(
          `INSERT INTO user_subscriptions
           (id, tenant_id, user_id, plan_id, status, starts_at, expires_at)
           VALUES (?, ?, ?, ?, 'active', ?, ?)`,
          [
            randomUUID(),
            tenant.id,
            user.id,
            defaultPlan.id,
            startsAt,
            expiresAt,
          ]
        );
      }
    }

    console.log(`Migrated ${user.email} as ${role.code}`);
  }

  console.log(`Migration complete: ${users.length} user(s)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (typeof db.end === "function") await db.end();
  });