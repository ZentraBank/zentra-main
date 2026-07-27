const { randomUUID } = require("crypto");
const db = require("../../config/db");

const one = async (sql, params = [], connection = db) => {
  const [rows] = await connection.query(sql, params);
  return rows[0] || null;
};

const listPlans = async ({ tenantId }) => {
  const [rows] = await db.query(
    `SELECT id, name, code, price, currency, billing_interval
     FROM subscription_plans
     WHERE tenant_id = ? AND is_active = TRUE
     ORDER BY price ASC`,
    [tenantId]
  );
  return rows;
};

const findPlanByCode = ({ tenantId, planCode }) =>
  one(
    `SELECT * FROM subscription_plans
     WHERE tenant_id = ? AND code = ? AND is_active = TRUE LIMIT 1`,
    [tenantId, planCode]
  );

const findActiveSubscription = ({ tenantId, userId }) =>
  one(
    `SELECT us.*, sp.name plan_name, sp.code plan_code
     FROM user_subscriptions us
     JOIN subscription_plans sp ON sp.id = us.plan_id
     WHERE us.tenant_id = ? AND us.user_id = ?
       AND us.status = 'active'
       AND (us.expires_at IS NULL OR us.expires_at > NOW())
     ORDER BY us.created_at DESC LIMIT 1`,
    [tenantId, userId]
  );

const findOpenRequest = ({ tenantId, userId }) =>
  one(
    `SELECT * FROM subscription_requests
     WHERE tenant_id = ? AND user_id = ?
       AND status IN ('pending_payment','payment_submitted')
     ORDER BY created_at DESC LIMIT 1`,
    [tenantId, userId]
  );

const findRequestById = ({ tenantId, requestId, connection = db, forUpdate = false }) =>
  one(
    `SELECT sr.*, sp.name plan_name, sp.code plan_code,
            sp.price plan_price, sp.currency plan_currency
     FROM subscription_requests sr
     JOIN subscription_plans sp ON sp.id = sr.plan_id
     WHERE sr.id = ? AND sr.tenant_id = ?
     LIMIT 1 ${forUpdate ? "FOR UPDATE" : ""}`,
    [requestId, tenantId],
    connection
  );

const createRequest = async ({ tenantId, userId, planId }) => {
  const id = randomUUID();
  await db.query(
    `INSERT INTO subscription_requests
     (id, tenant_id, user_id, plan_id, status)
     VALUES (?, ?, ?, ?, 'pending_payment')`,
    [id, tenantId, userId, planId]
  );
  return findRequestById({ tenantId, requestId: id });
};

const submitProof = async (input) => {
  const [result] = await db.query(
    `UPDATE subscription_requests
     SET status='payment_submitted',
         payment_reference=?, payment_proof_url=?, payment_note=?
     WHERE id=? AND tenant_id=? AND user_id=?
       AND status='pending_payment'`,
    [input.paymentReference, input.paymentProofUrl, input.paymentNote,
     input.requestId, input.tenantId, input.userId]
  );
  return result.affectedRows === 1;
};

const listPending = async ({ tenantId, limit, offset }) => {
  const [rows] = await db.query(
    `SELECT sr.*, sp.name plan_name, sp.code plan_code,
            sp.price plan_price, u.email user_email, u.full_name user_name
     FROM subscription_requests sr
     JOIN subscription_plans sp ON sp.id = sr.plan_id
     JOIN users u ON u.id = sr.user_id
     WHERE sr.tenant_id=? AND sr.status='payment_submitted'
     ORDER BY sr.created_at ASC LIMIT ? OFFSET ?`,
    [tenantId, limit, offset]
  );
  return rows;
};

const expireActive = ({ connection, tenantId, userId }) =>
  connection.query(
    `UPDATE user_subscriptions
     SET status='expired', expires_at=COALESCE(expires_at, NOW())
     WHERE tenant_id=? AND user_id=? AND status='active'`,
    [tenantId, userId]
  );

const createSubscription = async ({ connection, tenantId, userId, planId, startsAt, expiresAt }) => {
  const id = randomUUID();
  await connection.query(
    `INSERT INTO user_subscriptions
     (id, tenant_id, user_id, plan_id, status, starts_at, expires_at)
     VALUES (?, ?, ?, ?, 'active', ?, ?)`,
    [id, tenantId, userId, planId, startsAt, expiresAt]
  );
  return id;
};

const approveRequest = ({ connection, tenantId, requestId, reviewerUserId }) =>
  connection.query(
    `UPDATE subscription_requests
     SET status='approved', reviewed_by=?, reviewed_at=NOW(),
         rejection_reason=NULL
     WHERE id=? AND tenant_id=?`,
    [reviewerUserId, requestId, tenantId]
  );

const rejectRequest = async ({ tenantId, requestId, reviewerUserId, reason }) => {
  const [result] = await db.query(
    `UPDATE subscription_requests
     SET status='rejected', reviewed_by=?, reviewed_at=NOW(),
         rejection_reason=?
     WHERE id=? AND tenant_id=? AND status='payment_submitted'`,
    [reviewerUserId, reason, requestId, tenantId]
  );
  return result.affectedRows === 1;
};

module.exports = {
  db, listPlans, findPlanByCode, findActiveSubscription,
  findOpenRequest, findRequestById, createRequest,
  submitProof, listPending, expireActive,
  createSubscription, approveRequest, rejectRequest
};
