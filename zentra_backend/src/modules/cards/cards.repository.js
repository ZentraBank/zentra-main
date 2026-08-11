const { randomUUID } = require("crypto");
const db = require("../../config/db");

const one = async (sql, params = []) => {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
};

const findAccountById = ({ accountId, tenantId }) =>
  one(`SELECT id,user_id,tenant_id,account_number,account_name,currency,status
       FROM accounts WHERE id=? AND tenant_id=? LIMIT 1`,
      [accountId, tenantId]);

const countActiveCardsByUser = async ({ tenantId, userId }) => {
  const row = await one(
    `SELECT COUNT(*) total FROM cards
     WHERE tenant_id=? AND user_id=?
       AND status NOT IN ('inactive','expired')`,
    [tenantId, userId]
  );
  return Number(row?.total || 0);
};

const maskedPanExists = async ({ tenantId, maskedPan }) =>
  Boolean(await one(
    `SELECT id FROM cards WHERE tenant_id=? AND masked_pan=? LIMIT 1`,
    [tenantId, maskedPan]
  ));

const findById = ({ tenantId, cardId }) =>
  one(`SELECT c.*,a.account_number,a.account_name,a.currency
       FROM cards c JOIN accounts a ON a.id=c.account_id
       WHERE c.id=? AND c.tenant_id=? LIMIT 1`,
      [cardId, tenantId]);

const findByUser = async ({ tenantId, userId }) => {
  const [rows] = await db.query(
    `SELECT c.*,a.account_number,a.account_name,a.currency
     FROM cards c JOIN accounts a ON a.id=c.account_id
     WHERE c.tenant_id=? AND c.user_id=?
     ORDER BY c.created_at DESC`,
    [tenantId, userId]
  );
  return rows;
};

const create = async (input) => {
  const id = randomUUID();
  const executor = input.connection || db;

  await executor.query(
    `
      INSERT INTO cards (
        id,
        tenant_id,
        user_id,
        account_id,
        card_type,
        card_brand,
        masked_pan,
        pan_last4,
        expiry_month,
        expiry_year,
        status,
        is_virtual,
        daily_spend_limit,
        issued_at,
        activated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        'active', ?, ?, NOW(), NOW()
      )
    `,
    [
      id,
      input.tenantId,
      input.userId,
      input.accountId,
      input.cardType,
      input.cardBrand,
      input.maskedPan,
      input.panLast4,
      input.expiryMonth,
      input.expiryYear,
      input.isVirtual,
      input.dailySpendLimit,
    ]
  );

  if (input.connection) {
    const [rows] = await input.connection.query(
      `
        SELECT
          c.*,
          a.account_number,
          a.account_name,
          a.currency
        FROM cards c
        INNER JOIN accounts a
          ON a.id = c.account_id
        WHERE c.id = ?
          AND c.tenant_id = ?
        LIMIT 1
      `,
      [id, input.tenantId]
    );

    return rows[0] || null;
  }

  return findById({
    tenantId: input.tenantId,
    cardId: id,
  });
};

const updateStatus = async ({ tenantId, cardId, status }) => {
  await db.query(
    `UPDATE cards
     SET status=?, deactivated_at=IF(?='inactive',NOW(),deactivated_at)
     WHERE id=? AND tenant_id=?`,
    [status,status,cardId,tenantId]
  );
  return findById({ tenantId, cardId });
};

const updateDailySpendLimit = async ({
  tenantId,
  cardId,
  dailySpendLimit,
}) => {
  await db.query(
    `
      UPDATE cards
      SET daily_spend_limit = ?
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      dailySpendLimit,
      cardId,
      tenantId,
    ]
  );

  return findById({
    tenantId,
    cardId,
  });
};

const createEvent = ({
  connection = null,
  tenantId,
  cardId,
  userId,
  actorUserId,
  eventType,
  metadata = null,
}) => {
  const executor = connection || db;

  return executor.query(
    `
      INSERT INTO card_events (
        id,
        tenant_id,
        card_id,
        user_id,
        actor_user_id,
        event_type,
        metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      cardId,
      userId,
      actorUserId,
      eventType,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );
};
  const createPurchaseRequest = async ({
  tenantId,
  userId,
  accountId,
  cardType,
  cardBrand,
  price,
  currency,
  paymentMethod,
  paymentReference = null,
  paymentProofUrl = null,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO card_purchase_requests (
        id,
        tenant_id,
        user_id,
        account_id,
        card_type,
        card_brand,
        price,
        currency,
        payment_method,
        payment_reference,
        payment_proof_url,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      id,
      tenantId,
      userId,
      accountId,
      cardType,
      cardBrand,
      price,
      currency,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
    ]
  );

  return findPurchaseRequestById({
    tenantId,
    requestId: id,
  });
};

const findPurchaseRequestById = ({
  tenantId,
  requestId,
}) =>
  one(
    `
      SELECT
        cpr.*,
        a.account_number,
        a.account_name,
        a.currency AS account_currency,
        CONCAT_WS(
          ' ',
          u.first_name,
          u.middle_name,
          u.last_name
        ) AS customer_name,
        u.email AS customer_email
      FROM card_purchase_requests cpr
      INNER JOIN accounts a
        ON a.id = cpr.account_id
      INNER JOIN users u
        ON u.id = cpr.user_id
      WHERE cpr.id = ?
        AND cpr.tenant_id = ?
      LIMIT 1
    `,
    [requestId, tenantId]
  );

const findPurchaseRequestsByUser = async ({
  tenantId,
  userId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        cpr.*,
        a.account_number,
        a.account_name,
        a.currency AS account_currency
      FROM card_purchase_requests cpr
      INNER JOIN accounts a
        ON a.id = cpr.account_id
      WHERE cpr.tenant_id = ?
        AND cpr.user_id = ?
      ORDER BY cpr.created_at DESC
    `,
    [tenantId, userId]
  );

  return rows;
};

const findPurchaseRequestsByTenant = async ({
  tenantId,
  status = null,
  limit = 50,
  offset = 0,
}) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  const safeOffset = Math.max(
    Number(offset) || 0,
    0
  );

  const params = [tenantId];
  let statusFilter = "";

  if (status) {
    statusFilter = "AND cpr.status = ?";
    params.push(status);
  }

  params.push(safeLimit, safeOffset);

  const [rows] = await db.query(
    `
      SELECT
        cpr.*,
        a.account_number,
        a.account_name,
        a.currency AS account_currency,
        CONCAT_WS(
          ' ',
          u.first_name,
          u.middle_name,
          u.last_name
        ) AS customer_name,
        u.email AS customer_email
      FROM card_purchase_requests cpr
      INNER JOIN accounts a
        ON a.id = cpr.account_id
      INNER JOIN users u
        ON u.id = cpr.user_id
      WHERE cpr.tenant_id = ?
        ${statusFilter}
      ORDER BY cpr.created_at DESC
      LIMIT ?
      OFFSET ?
    `,
    params
  );

  return rows;
};

const countPurchaseRequestsByTenant = async ({
  tenantId,
  status = null,
}) => {
  const params = [tenantId];
  let statusFilter = "";

  if (status) {
    statusFilter = "AND status = ?";
    params.push(status);
  }

  const row = await one(
    `
      SELECT COUNT(*) AS total
      FROM card_purchase_requests
      WHERE tenant_id = ?
        ${statusFilter}
    `,
    params
  );

  return Number(row?.total || 0);
};

const findPendingPurchaseRequestForUpdate = async ({
  connection,
  tenantId,
  requestId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT
        cpr.*,
        a.account_number,
        a.account_name,
        a.currency AS account_currency,
        a.status AS account_status
      FROM card_purchase_requests cpr
      INNER JOIN accounts a
        ON a.id = cpr.account_id
      WHERE cpr.id = ?
        AND cpr.tenant_id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [requestId, tenantId]
  );

  return rows[0] || null;
};

const approvePurchaseRequest = async ({
  connection,
  tenantId,
  requestId,
  reviewedBy,
  issuedCardId,
}) => {
  const [result] = await connection.query(
    `
      UPDATE card_purchase_requests
      SET
        status = 'approved',
        issued_card_id = ?,
        reviewed_by = ?,
        reviewed_at = NOW(),
        rejection_reason = NULL
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'pending'
    `,
    [
      issuedCardId,
      reviewedBy,
      requestId,
      tenantId,
    ]
  );

  return result.affectedRows === 1;
};

const rejectPurchaseRequest = async ({
  connection,
  tenantId,
  requestId,
  reviewedBy,
  rejectionReason,
}) => {
  const [result] = await connection.query(
    `
      UPDATE card_purchase_requests
      SET
        status = 'rejected',
        reviewed_by = ?,
        reviewed_at = NOW(),
        rejection_reason = ?
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'pending'
    `,
    [
      reviewedBy,
      rejectionReason,
      requestId,
      tenantId,
    ]
  );

  return result.affectedRows === 1;
};

const cancelPurchaseRequest = async ({
  tenantId,
  userId,
  requestId,
}) => {
  const [result] = await db.query(
    `
      UPDATE card_purchase_requests
      SET status = 'cancelled'
      WHERE id = ?
        AND tenant_id = ?
        AND user_id = ?
        AND status = 'pending'
    `,
    [requestId, tenantId, userId]
  );

  return result.affectedRows === 1;
};
module.exports = {
  findAccountById,
  countActiveCardsByUser,
  maskedPanExists,
  findById,
  findByUser,
  create,
   updateStatus,
    updateDailySpendLimit,
    createEvent,
  createEvent,

  createPurchaseRequest,
  findPurchaseRequestById,
  findPurchaseRequestsByUser,
  findPurchaseRequestsByTenant,
  countPurchaseRequestsByTenant,
  findPendingPurchaseRequestForUpdate,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  cancelPurchaseRequest,
};
