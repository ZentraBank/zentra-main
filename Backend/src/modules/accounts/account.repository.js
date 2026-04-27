const db = require("../../config/db");

async function findAccountsByUserAndTenant(userId, tenantId) {
  const [rows] = await db.query(
    `SELECT id, tenant_id, user_id, account_number, account_name, balance, currency, status, created_at
     FROM accounts
     WHERE user_id = ? AND tenant_id = ?
     ORDER BY created_at DESC`,
    [userId, tenantId]
  );

  return rows;
}

async function findAccountByIdAndTenant(accountId, tenantId) {
  const [rows] = await db.query(
    `SELECT id, tenant_id, user_id, account_number, account_name, balance, currency, status, created_at
     FROM accounts
     WHERE id = ? AND tenant_id = ?
     LIMIT 1`,
    [accountId, tenantId]
  );

  return rows[0];
}

async function findAccountByNumberAndTenant(accountNumber, tenantId) {
  const [rows] = await db.query(
    `SELECT id, tenant_id, user_id, account_number, account_name, balance, currency, status, created_at
     FROM accounts
     WHERE account_number = ? AND tenant_id = ?
     LIMIT 1`,
    [accountNumber, tenantId]
  );

  return rows[0];
}

module.exports = {
  findAccountsByUserAndTenant,
  findAccountByIdAndTenant,
  findAccountByNumberAndTenant,
};