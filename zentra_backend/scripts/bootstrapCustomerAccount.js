const { randomUUID } = require("crypto");
const db = require("../src/config/db");
const generateAccountNumber = require("../src/utils/generateAccountNumber");

const TENANT_SLUG = process.env.BOOTSTRAP_TENANT_SLUG || "zentra-bank";
const EMAIL = process.env.BOOTSTRAP_ACCOUNT_EMAIL || process.env.BOOTSTRAP_ADMIN_EMAIL;
const ACCOUNT_NAME = process.env.BOOTSTRAP_ACCOUNT_NAME;
const ACCOUNT_TYPE = (process.env.BOOTSTRAP_ACCOUNT_TYPE || "wallet").toLowerCase();
const CURRENCY = (process.env.BOOTSTRAP_ACCOUNT_CURRENCY || "USD").toUpperCase();
const OPENING_BALANCE = Number(process.env.BOOTSTRAP_ACCOUNT_BALANCE || 0);

const allowedTypes = new Set(["wallet", "savings", "current", "investment"]);

async function one(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
}

async function createUniqueAccountNumber(tenantId) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const accountNumber = generateAccountNumber();
    const existing = await one(
      "SELECT id FROM accounts WHERE tenant_id = ? AND account_number = ? LIMIT 1",
      [tenantId, accountNumber]
    );
    if (!existing) return accountNumber;
  }
  throw new Error("Unable to generate a unique account number");
}

async function main() {
  if (!EMAIL) {
    throw new Error("BOOTSTRAP_ACCOUNT_EMAIL or BOOTSTRAP_ADMIN_EMAIL is required");
  }
  if (!allowedTypes.has(ACCOUNT_TYPE)) {
    throw new Error(`BOOTSTRAP_ACCOUNT_TYPE must be one of: ${[...allowedTypes].join(", ")}`);
  }
  if (!/^[A-Z]{3}$/.test(CURRENCY)) {
    throw new Error("BOOTSTRAP_ACCOUNT_CURRENCY must be a 3-letter currency code");
  }
  if (!Number.isFinite(OPENING_BALANCE) || OPENING_BALANCE < 0) {
    throw new Error("BOOTSTRAP_ACCOUNT_BALANCE must be a non-negative number");
  }

  const tenant = await one("SELECT id FROM tenants WHERE slug = ? LIMIT 1", [TENANT_SLUG]);
  if (!tenant) throw new Error(`Tenant "${TENANT_SLUG}" was not found`);

  const user = await one(
    `SELECT u.id, u.first_name, u.last_name
     FROM users u
     JOIN tenant_memberships tm ON tm.user_id = u.id
     WHERE tm.tenant_id = ? AND tm.status = 'active' AND LOWER(u.email) = LOWER(?)
     LIMIT 1`,
    [tenant.id, EMAIL.trim()]
  );
  if (!user) throw new Error(`Active tenant user "${EMAIL}" was not found`);

  const existing = await one(
    `SELECT id, account_number, account_name, account_type, currency, balance, status
     FROM accounts WHERE tenant_id = ? AND user_id = ? AND status <> 'closed'
     ORDER BY created_at ASC LIMIT 1`,
    [tenant.id, user.id]
  );

  if (existing) {
    console.log("Account already exists:", existing);
    return;
  }

  const accountNumber = await createUniqueAccountNumber(tenant.id);
  const accountName =
    ACCOUNT_NAME?.trim() || `${user.first_name || "Customer"} ${user.last_name || "Account"}`.trim();

  const id = randomUUID();
  await db.query(
    `INSERT INTO accounts
     (id, tenant_id, user_id, account_number, account_name, account_type, currency, balance, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [id, tenant.id, user.id, accountNumber, accountName, ACCOUNT_TYPE, CURRENCY, OPENING_BALANCE]
  );

  console.log("Account created:", {
    id,
    email: EMAIL.trim().toLowerCase(),
    accountNumber,
    accountName,
    accountType: ACCOUNT_TYPE,
    currency: CURRENCY,
    balance: OPENING_BALANCE,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (typeof db.closeDatabaseConnection === "function") {
      await db.closeDatabaseConnection();
    }
  });
