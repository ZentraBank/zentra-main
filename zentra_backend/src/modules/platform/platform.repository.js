const db = require("../../config/db");

async function getAllTenants({ limit = 20, offset = 0, status }) {
  let sql = `
    SELECT id, name, slug, domain, status, subscription_status, created_at
    FROM tenants
    WHERE 1 = 1
  `;

  const params = [];

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await db.query(sql, params);
  return rows;
}

async function getTenantById(id) {
  const [rows] = await db.query(
    `SELECT * FROM tenants WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows[0];
}

async function updateTenantStatus({ tenantId, status }) {
  const [result] = await db.query(
    `UPDATE tenants SET status = ? WHERE id = ?`,
    [status, tenantId]
  );

  return result.affectedRows > 0;
}

async function updateTenantSubscriptionStatus({ tenantId, subscriptionStatus }) {
  const [result] = await db.query(
    `UPDATE tenants SET subscription_status = ? WHERE id = ?`,
    [subscriptionStatus, tenantId]
  );

  return result.affectedRows > 0;
}

async function getGlobalAnalytics() {
  const [[tenants]] = await db.query(`
    SELECT 
      COUNT(*) AS total_tenants,
      SUM(status = 'active') AS active_tenants,
      SUM(status = 'suspended') AS suspended_tenants,
      SUM(subscription_status = 'active') AS subscribed_tenants
    FROM tenants
  `);

  const [[users]] = await db.query(`
    SELECT COUNT(*) AS total_users FROM users
  `);

  const [[accounts]] = await db.query(`
    SELECT 
      COUNT(*) AS total_accounts,
      COALESCE(SUM(balance), 0) AS total_platform_balance
    FROM accounts
  `);

  const [[transactions]] = await db.query(`
    SELECT 
      COUNT(*) AS total_transactions,
      COALESCE(SUM(amount), 0) AS total_transaction_volume
    FROM transactions
    WHERE status = 'successful'
  `);

  const [[chats]] = await db.query(`
    SELECT 
      COUNT(*) AS total_conversations,
      SUM(status = 'open') AS open_conversations
    FROM conversations
  `);

  return {
    tenants,
    users,
    accounts,
    transactions,
    chats,
  };
}

async function getTenantAnalyticsBreakdown() {
  const [rows] = await db.query(`
    SELECT 
      t.id,
      t.name,
      t.slug,
      t.domain,
      t.status,
      t.subscription_status,
      COUNT(DISTINCT u.id) AS total_users,
      COUNT(DISTINCT a.id) AS total_accounts,
      COALESCE(SUM(DISTINCT a.balance), 0) AS total_balance,
      COUNT(DISTINCT tr.id) AS total_transactions
    FROM tenants t
    LEFT JOIN users u ON u.tenant_id = t.id
    LEFT JOIN accounts a ON a.tenant_id = t.id
    LEFT JOIN transactions tr ON tr.tenant_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);

  return rows;
}

module.exports = {
  getAllTenants,
  getTenantById,
  updateTenantStatus,
  updateTenantSubscriptionStatus,
  getGlobalAnalytics,
  getTenantAnalyticsBreakdown,
};