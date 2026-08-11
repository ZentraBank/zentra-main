const { randomUUID } = require("crypto");
const db = require("../../config/db");

const one = async (sql, params = []) => {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
};

const findInternalAccountByNumber = ({ tenantId, accountNumber }) =>
  one(`SELECT id,user_id,tenant_id,account_name,account_number,currency,status
       FROM accounts WHERE tenant_id=? AND account_number=? LIMIT 1`,
      [tenantId, accountNumber]);

const findDuplicate = ({ tenantId, userId, accountNumber, bankCode }) =>
  one(`SELECT id FROM beneficiaries
       WHERE tenant_id=? AND user_id=? AND account_number=?
         AND (bank_code=? OR (bank_code IS NULL AND ? IS NULL))
         AND is_active=TRUE LIMIT 1`,
      [tenantId,userId,accountNumber,bankCode,bankCode]);

const findById = ({ tenantId, beneficiaryId }) =>
  one(`SELECT * FROM beneficiaries WHERE id=? AND tenant_id=? LIMIT 1`,
      [beneficiaryId,tenantId]);

const create = async (input) => {
  const id = randomUUID();
  await db.query(
    `INSERT INTO beneficiaries
     (id,tenant_id,user_id,beneficiary_type,display_name,account_name,
      account_number,bank_name,bank_code,currency,internal_account_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id,input.tenantId,input.userId,input.beneficiaryType,input.displayName,
     input.accountName,input.accountNumber,input.bankName,input.bankCode,
     input.currency,input.internalAccountId]
  );
  return findById({ tenantId: input.tenantId, beneficiaryId: id });
};

const findByUser = async ({ tenantId,userId,search,favouritesOnly,limit,offset }) => {
  const where = ["tenant_id=?","user_id=?","is_active=TRUE"];
  const values = [tenantId,userId];
  if (search) {
    where.push(`(display_name LIKE ? OR account_name LIKE ? OR account_number LIKE ? OR bank_name LIKE ?)`);
    const term = `%${search}%`;
    values.push(term,term,term,term);
  }
  if (favouritesOnly) where.push("is_favourite=TRUE");
  const [rows] = await db.query(
    `SELECT * FROM beneficiaries WHERE ${where.join(" AND ")}
     ORDER BY is_favourite DESC,display_name ASC LIMIT ? OFFSET ?`,
    [...values,limit,offset]
  );
  return rows;
};

const update = async ({ tenantId,beneficiaryId,displayName,isFavourite }) => {
  await db.query(
    `UPDATE beneficiaries
     SET display_name=COALESCE(?,display_name),
         is_favourite=COALESCE(?,is_favourite)
     WHERE id=? AND tenant_id=?`,
    [displayName,isFavourite,beneficiaryId,tenantId]
  );
  return findById({ tenantId, beneficiaryId });
};

const deactivate = async ({ tenantId,beneficiaryId }) => {
  const [result] = await db.query(
    `UPDATE beneficiaries SET is_active=FALSE
     WHERE id=? AND tenant_id=? AND is_active=TRUE`,
    [beneficiaryId,tenantId]
  );
  return result.affectedRows === 1;
};

const createEvent = ({ tenantId,beneficiaryId,userId,actorUserId,eventType,metadata=null }) =>
  db.query(
    `INSERT INTO beneficiary_events
     (id,tenant_id,beneficiary_id,user_id,actor_user_id,event_type,metadata)
     VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(),tenantId,beneficiaryId,userId,actorUserId,eventType,
     metadata ? JSON.stringify(metadata) : null]
  );

module.exports = {
  findInternalAccountByNumber,findDuplicate,findById,create,
  findByUser,update,deactivate,createEvent
};
