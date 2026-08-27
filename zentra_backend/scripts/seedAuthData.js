const { randomUUID } = require("crypto");
const db = require("../src/config/db");

const TENANT_SLUG = process.env.SEED_TENANT_SLUG || "zentra-bank";

const permissions = [
  ["Accounts Read", "accounts.read", "accounts"],
  ["Accounts Create", "accounts.create", "accounts"],
  ["Accounts Manage", "accounts.manage", "accounts"],
  ["Transfers Read", "transfers.read", "transfers"],
  ["Transfers Create", "transfers.create", "transfers"],
  ["Transfers Approve", "transfers.approve", "transfers"],
  ["Cards Read", "cards.read", "cards"],
  ["Cards Create", "cards.create", "cards"],
  ["Cards Manage", "cards.manage", "cards"],
  ["Subscriptions Read", "subscriptions.read", "subscriptions"],
  ["Subscriptions Manage", "subscriptions.manage", "subscriptions"],
  ["Users Read", "users.read", "users"],
  ["Users Manage", "users.manage", "users"],
  ["Notifications Read", "notifications.read", "notifications"],
  ["Notifications Manage", "notifications.manage", "notifications"],
  [
  "Notification Templates Read",
  "notifications.templates.read",
  "notifications",
],
[
  "Tenant Settings Read",
  "tenant.settings.read",
  "tenant",
],
[
  "Tenant Settings Manage",
  "tenant.settings.manage",
  "tenant",
],
[
  "Tenant Domains Read",
  "tenant.domains.read",
  "tenant",
],
[
  "Tenant Domains Manage",
  "tenant.domains.manage",
  "tenant",
],
[
  "Platform Domains Read",
  "platform.domains.read",
  "platform",
],
[
  "Platform Domains Manage",
  "platform.domains.manage",
  "platform",
],
[
  "Notification Templates Manage",
  "notifications.templates.manage",
  "notifications",
],
[
  "Notifications Send",
  "notifications.send",
  "notifications",
],
[
  "Notifications Broadcast",
  "notifications.broadcast",
  "notifications",
],
  ["Donations Read", "donations.read", "donations"],
  ["Donations Create", "donations.create", "donations"],
  ["Donations Approve", "donations.approve", "donations"],
  ["Investments Read", "investments.read", "investments"],
  ["Investments Create", "investments.create", "investments"],
  ["Investments Approve", "investments.approve", "investments"],
  ["Audit Logs Read", "audit_logs.read", "audit"],

];

const roles = [
  {
    name: "Customer",
    code: "customer",
    permissions: [
      "accounts.read", "transfers.read", "transfers.create",
      "cards.read", "subscriptions.read", "notifications.read",
      "donations.read", "donations.create",
      "investments.read", "investments.create"
    ],
  },
  {
    name: "Support Agent",
    code: "support_agent",
    permissions: [
      "accounts.read", "transfers.read", "cards.read",
      "subscriptions.read", "users.read", "notifications.read",
      "donations.read", "investments.read"
    ],
  },
  {
    name: "Account Manager",
    code: "account_manager",
    permissions: [
      "accounts.read", "accounts.manage", "transfers.read",
      "transfers.approve", "cards.read", "cards.manage",
      "users.read", "notifications.read", "notifications.manage",
      "donations.read", "donations.approve",
      "investments.read", "investments.approve"
    ],
  },
  {
    name: "Tenant Admin",
    code: "tenant_admin",
    permissions: permissions.map(([, code]) => code),
  },
];

const plans = [
  {
    name: "Bronze",
    code: "bronze",
    price: 40,
    features: {
      transfer_limit: 10000,
      daily_transfer_limit: 25000,
      virtual_cards: false,
      international_transfers: false,
      number_of_accounts: 1,
      priority_support: false,
      donation_access: true,
      investment_access: false,
    },
  },
  {
    name: "Gold",
    code: "gold",
    price: 80,
    features: {
      transfer_limit: 100000,
      daily_transfer_limit: 250000,
      virtual_cards: true,
      international_transfers: false,
      number_of_accounts: 3,
      priority_support: true,
      donation_access: true,
      investment_access: true,
    },
  },
  {
    name: "Diamond",
    code: "diamond",
    price: 120,
    features: {
      transfer_limit: 1000000,
      daily_transfer_limit: 2500000,
      virtual_cards: true,
      international_transfers: true,
      number_of_accounts: 10,
      priority_support: true,
      donation_access: true,
      investment_access: true,
    },
  },
];

async function one(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
}

async function main() {
  const tenant = await one(
    "SELECT id, slug FROM tenants WHERE slug = ? LIMIT 1",
    [TENANT_SLUG]
  );

  if (!tenant) {
    throw new Error(`Tenant "${TENANT_SLUG}" was not found`);
  }

  const permissionIds = new Map();

  for (const [name, code, module] of permissions) {
    let row = await one(
      "SELECT id FROM permissions WHERE code = ? LIMIT 1",
      [code]
    );

    if (!row) {
      const id = randomUUID();
      await db.query(
        "INSERT INTO permissions (id, name, code, module) VALUES (?, ?, ?, ?)",
        [id, name, code, module]
      );
      row = { id };
    }

    permissionIds.set(code, row.id);
  }

  for (const role of roles) {
    let row = await one(
      "SELECT id FROM roles WHERE tenant_id = ? AND code = ? LIMIT 1",
      [tenant.id, role.code]
    );

    if (!row) {
      const id = randomUUID();
      await db.query(
        `INSERT INTO roles
         (id, tenant_id, name, code, is_system_role, is_active)
         VALUES (?, ?, ?, ?, TRUE, TRUE)`,
        [id, tenant.id, role.name, role.code]
      );
      row = { id };
    }

    for (const code of role.permissions) {
      await db.query(
        `INSERT IGNORE INTO role_permissions (role_id, permission_id)
         VALUES (?, ?)`,
        [row.id, permissionIds.get(code)]
      );
    }
  }

  for (const plan of plans) {
    let row = await one(
      `SELECT id FROM subscription_plans
       WHERE tenant_id = ? AND code = ? LIMIT 1`,
      [tenant.id, plan.code]
    );

    if (!row) {
      const id = randomUUID();
      await db.query(
        `INSERT INTO subscription_plans
         (id, tenant_id, name, code, price, currency, billing_interval, is_active)
         VALUES (?, ?, ?, ?, ?, 'USD', 'monthly', TRUE)`,
        [id, tenant.id, plan.name, plan.code, plan.price]
      );
      row = { id };
    }

    for (const [featureKey, rawValue] of Object.entries(plan.features)) {
      const feature = await one(
        `SELECT id FROM plan_features
         WHERE plan_id = ? AND feature_key = ? LIMIT 1`,
        [row.id, featureKey]
      );

      const enabled =
        typeof rawValue === "boolean" ? rawValue : true;
      const value = JSON.stringify(rawValue);

      if (feature) {
        await db.query(
          `UPDATE plan_features
           SET is_enabled = ?, feature_value = ?
           WHERE id = ?`,
          [enabled, value, feature.id]
        );
      } else {
        await db.query(
          `INSERT INTO plan_features
           (id, plan_id, feature_key, is_enabled, feature_value)
           VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), row.id, featureKey, enabled, value]
        );
      }
    }
  }

  console.log(`Auth data seeded for ${tenant.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (typeof db.end === "function") await db.end();
  });
