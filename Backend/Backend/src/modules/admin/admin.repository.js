const db = require("../../config/db");

async function getOverviewStats(tenantId) {
  const [[users]] = await db.query(
    `SELECT COUNT(*) AS total_users FROM users WHERE tenant_id = ?`,
    [tenantId]
  );

  const [[accounts]] = await db.query(
    `SELECT COUNT(*) AS total_accounts, COALESCE(SUM(balance), 0) AS total_balance
     FROM accounts
     WHERE tenant_id = ?`,
    [tenantId]
  );

  const [[transactions]] = await db.query(
    `SELECT 
       COUNT(*) AS total_transactions,
       COALESCE(SUM(amount), 0) AS total_transaction_volume
     FROM transactions
     WHERE tenant_id = ? AND status = 'successful'`,
    [tenantId]
  );

  const [[openChats]] = await db.query(
    `SELECT COUNT(*) AS open_conversations
     FROM conversations
     WHERE tenant_id = ? AND status = 'open'`,
    [tenantId]
  );

  return {
    total_users: users.total_users,
    total_accounts: accounts.total_accounts,
    total_balance: accounts.total_balance,
    total_transactions: transactions.total_transactions,
    total_transaction_volume: transactions.total_transaction_volume,
    open_conversations: openChats.open_conversations,
  };
}

async function getTransactionSummary(tenantId) {
  const [rows] = await db.query(
    `SELECT 
       type,
       COUNT(*) AS count,
       COALESCE(SUM(amount), 0) AS volume
     FROM transactions
     WHERE tenant_id = ? AND status = 'successful'
     GROUP BY type`,
    [tenantId]
  );

  return rows;
}

async function getRecentTransactions(tenantId, limit = 10) {
  const [rows] = await db.query(
    `SELECT 
       t.id,
       t.type,
       t.amount,
       t.reference,
       t.description,
       t.status,
       t.created_at,
       a.account_number,
       a.account_name
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE t.tenant_id = ?
     ORDER BY t.created_at DESC
     LIMIT ?`,
    [tenantId, Number(limit)]
  );

  return rows;
}

async function getRecentUsers(tenantId, limit = 10) {
  const [rows] = await db.query(
    `SELECT id, full_name, email, phone, role, kyc_status, created_at
     FROM users
     WHERE tenant_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [tenantId, Number(limit)]
  );

  return rows;
}

module.exports = {
  getOverviewStats,
  getTransactionSummary,
  getRecentTransactions,
  getRecentUsers,
};