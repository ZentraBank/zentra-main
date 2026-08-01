const { randomUUID } = require("crypto");
const db = require("../../config/db");

const findById = async ({ accountId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT * FROM accounts WHERE id = ? AND tenant_id = ? LIMIT 1`,
    [accountId, tenantId]
  );
  return rows[0] || null;
};

const findByUser = async ({ userId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT * FROM accounts
     WHERE user_id = ? AND tenant_id = ?
     ORDER BY created_at DESC`,
    [userId, tenantId]
  );
  return rows;
};

const countByUser = async ({ userId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) total FROM accounts
     WHERE user_id = ? AND tenant_id = ? AND status <> 'closed'`,
    [userId, tenantId]
  );
  return Number(rows[0]?.total || 0);
};

const existsByNumber = async ({ accountNumber, tenantId }) => {
  const [rows] = await db.query(
    `SELECT id FROM accounts
     WHERE account_number = ? AND tenant_id = ? LIMIT 1`,
    [accountNumber, tenantId]
  );
  return Boolean(rows[0]);
};

const create = async (input) => {
  const id = randomUUID();
  await db.query(
    `INSERT INTO accounts
     (id, user_id, tenant_id, account_number, account_name,
      account_type, currency, balance, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
    [id, input.userId, input.tenantId, input.accountNumber,
     input.accountName, input.accountType, input.currency]
  );
  return findById({ accountId: id, tenantId: input.tenantId });
};

const updateStatus = async ({ accountId, tenantId, status }) => {
  await db.query(
    `UPDATE accounts SET status = ?
     WHERE id = ? AND tenant_id = ?`,
    [status, accountId, tenantId]
  );
  return findById({ accountId, tenantId });
};

module.exports = {
  findById, findByUser, countByUser,
  existsByNumber, create, updateStatus
};
