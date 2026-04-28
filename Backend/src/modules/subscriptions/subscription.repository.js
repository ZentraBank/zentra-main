const db = require("../../config/db");

async function createRequest({ tenantId, planName, amount, currency, paymentReference, paymentNote }) {
  const [result] = await db.query(
    `INSERT INTO subscriptions
     (tenant_id, plan_name, amount, currency, payment_reference, payment_note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tenantId, planName, amount, currency || "USDT", paymentReference || null, paymentNote || null]
  );

  return result.insertId;
}

async function getCurrentByTenant(tenantId) {
  const [rows] = await db.query(
    `SELECT *
     FROM subscriptions
     WHERE tenant_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [tenantId]
  );

  return rows[0];
}

async function getAllRequests(tenantId) {
  const [rows] = await db.query(
    `SELECT s.*, t.name AS tenant_name, t.slug AS tenant_slug
     FROM subscriptions s
     JOIN tenants t ON t.id = s.tenant_id
     WHERE s.tenant_id = ?
     ORDER BY s.created_at DESC`,
    [tenantId]
  );

  return rows;
}

async function findByIdAndTenant({ id, tenantId }) {
  const [rows] = await db.query(
    `SELECT * FROM subscriptions WHERE id = ? AND tenant_id = ? LIMIT 1`,
    [id, tenantId]
  );

  return rows[0];
}

async function approve({ id, tenantId, approvedBy, startsAt, endsAt }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE subscriptions
       SET status = 'approved', approved_by = ?, starts_at = ?, ends_at = ?
       WHERE id = ? AND tenant_id = ?`,
      [approvedBy, startsAt, endsAt, id, tenantId]
    );

    await connection.query(
      `UPDATE tenants
       SET subscription_status = 'active'
       WHERE id = ?`,
      [tenantId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function reject({ id, tenantId, approvedBy }) {
  await db.query(
    `UPDATE subscriptions
     SET status = 'rejected', approved_by = ?
     WHERE id = ? AND tenant_id = ?`,
    [approvedBy, id, tenantId]
  );
}

module.exports = {
  createRequest,
  getCurrentByTenant,
  getAllRequests,
  findByIdAndTenant,
  approve,
  reject,
};