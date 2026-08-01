const db = require("../../config/db");

const selectSql = `
  SELECT
    le.id,
    le.tenant_id,
    le.account_id,
    le.transfer_id,
    le.entry_type,
    le.amount,
    le.balance_after,
    le.description,
    le.created_at,
    a.account_number,
    a.account_name,
    a.currency,
    t.reference,
    t.status,
    t.source_account_id,
    t.destination_account_id,
    t.destination_account_number,
    t.transfer_type,
    t.destination_account_name AS transfer_destination_account_name,
    t.destination_bank_name,
    t.destination_bank_code,
    t.settlement_mode,
    t.is_simulated,
    sa.account_name AS source_account_name,
    sa.account_number AS source_account_number,
    da.account_name AS destination_account_name,
    da.account_number AS destination_account_number_resolved
  FROM account_ledger_entries le
  INNER JOIN accounts a
    ON a.id = le.account_id AND a.tenant_id = le.tenant_id
  LEFT JOIN transfers t
    ON t.id = le.transfer_id AND t.tenant_id = le.tenant_id
  LEFT JOIN accounts sa
    ON sa.id = t.source_account_id AND sa.tenant_id = t.tenant_id
  LEFT JOIN accounts da
    ON da.id = t.destination_account_id AND da.tenant_id = t.tenant_id
`;

async function listOwn({ tenantId, userId, accountId, entryType, limit, offset }) {
  const conditions = ["le.tenant_id = ?", "a.user_id = ?"];
  const params = [tenantId, userId];
  if (accountId) { conditions.push("le.account_id = ?"); params.push(accountId); }
  if (entryType) { conditions.push("le.entry_type = ?"); params.push(entryType); }
  const [rows] = await db.query(
    `${selectSql} WHERE ${conditions.join(" AND ")} ORDER BY le.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
}

async function findOwnById({ id, tenantId, userId }) {
  const [rows] = await db.query(
    `${selectSql} WHERE le.id = ? AND le.tenant_id = ? AND a.user_id = ? LIMIT 1`,
    [id, tenantId, userId]
  );
  return rows[0] || null;
}

module.exports = { listOwn, findOwnById };
