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
  await db.query(
    `INSERT INTO cards
     (id,tenant_id,user_id,account_id,card_type,card_brand,masked_pan,
      pan_last4,expiry_month,expiry_year,status,is_virtual,daily_spend_limit,
      issued_at,activated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,'active',?,?,NOW(),NOW())`,
    [id,input.tenantId,input.userId,input.accountId,input.cardType,
     input.cardBrand,input.maskedPan,input.panLast4,input.expiryMonth,
     input.expiryYear,input.isVirtual,input.dailySpendLimit]
  );
  return findById({ tenantId: input.tenantId, cardId: id });
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

const createEvent = ({ tenantId, cardId, userId, actorUserId, eventType, metadata=null }) =>
  db.query(
    `INSERT INTO card_events
     (id,tenant_id,card_id,user_id,actor_user_id,event_type,metadata)
     VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(),tenantId,cardId,userId,actorUserId,eventType,
     metadata ? JSON.stringify(metadata) : null]
  );

module.exports = {
  findAccountById,countActiveCardsByUser,maskedPanExists,
  findById,findByUser,create,updateStatus,createEvent
};
