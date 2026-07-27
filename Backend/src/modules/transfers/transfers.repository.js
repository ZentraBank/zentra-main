const { randomUUID } = require("crypto");
const db = require("../../config/db");

const findAccountForUpdate = async ({ connection, accountId, tenantId }) => {
  const [rows] = await connection.query(
    `SELECT * FROM accounts WHERE id = ? AND tenant_id = ? LIMIT 1 FOR UPDATE`,
    [accountId, tenantId]
  );
  return rows[0] || null;
};

const findAccountByNumberForUpdate = async ({ connection, accountNumber, tenantId }) => {
  const [rows] = await connection.query(
    `SELECT * FROM accounts WHERE account_number = ? AND tenant_id = ? LIMIT 1 FOR UPDATE`,
    [accountNumber, tenantId]
  );
  return rows[0] || null;
};

const debitAccount = async ({ connection, accountId, tenantId, amount }) => {
  const [result] = await connection.query(
    `UPDATE accounts SET balance = balance - ?
     WHERE id = ? AND tenant_id = ? AND balance >= ? AND status = 'active'`,
    [amount, accountId, tenantId, amount]
  );
  return result.affectedRows === 1;
};

const creditAccount = async ({ connection, accountId, tenantId, amount }) => {
  const [result] = await connection.query(
    `UPDATE accounts SET balance = balance + ?
     WHERE id = ? AND tenant_id = ? AND status = 'active'`,
    [amount, accountId, tenantId]
  );
  return result.affectedRows === 1;
};

const createTransfer = async ({ connection, tenantId, userId, sourceAccountId,
  destinationAccountId, destinationAccountNumber, amount, currency,
  description, status, reference }) => {
  const id = randomUUID();
  await connection.query(
    `INSERT INTO transfers
     (id, tenant_id, user_id, source_account_id, destination_account_id,
      destination_account_number, amount, currency, description, status, reference)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, tenantId, userId, sourceAccountId, destinationAccountId,
     destinationAccountNumber, amount, currency, description, status, reference]
  );
  return id;
};

const createLedgerEntry = async ({ connection, tenantId, accountId, transferId,
  entryType, amount, balanceAfter, description }) => {
  await connection.query(
    `INSERT INTO account_ledger_entries
     (id, tenant_id, account_id, transfer_id, entry_type, amount, balance_after, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), tenantId, accountId, transferId, entryType, amount, balanceAfter, description]
  );
};

const findById = async ({ transferId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT t.*, sa.account_number AS source_account_number,
            da.account_name AS destination_account_name
     FROM transfers t
     LEFT JOIN accounts sa ON sa.id = t.source_account_id
     LEFT JOIN accounts da ON da.id = t.destination_account_id
     WHERE t.id = ? AND t.tenant_id = ? LIMIT 1`,
    [transferId, tenantId]
  );
  return rows[0] || null;
};

const findByUser = async ({ userId, tenantId, limit, offset }) => {
  const [rows] = await db.query(
    `SELECT * FROM transfers
     WHERE user_id = ? AND tenant_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, tenantId, limit, offset]
  );
  return rows;
};

const getDailyCompletedTotal = async ({ userId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transfers
     WHERE user_id = ? AND tenant_id = ? AND status = 'completed'
       AND created_at >= CURRENT_DATE()
       AND created_at < CURRENT_DATE() + INTERVAL 1 DAY`,
    [userId, tenantId]
  );
  return Number(rows[0]?.total || 0);
};

module.exports = { findAccountForUpdate, findAccountByNumberForUpdate,
  debitAccount, creditAccount, createTransfer, createLedgerEntry,
  findById, findByUser, getDailyCompletedTotal };
