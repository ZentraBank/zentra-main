const { randomUUID } = require("crypto");
const db = require("../../config/db");

/*
|--------------------------------------------------------------------------
| Account queries
|--------------------------------------------------------------------------
*/

const findAccountForUpdate = async ({
  connection,
  accountId,
  tenantId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM accounts
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [accountId, tenantId]
  );

  return rows[0] || null;
};

const findAccountByNumberForUpdate = async ({
  connection,
  accountNumber,
  tenantId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM accounts
      WHERE account_number = ?
        AND tenant_id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [accountNumber, tenantId]
  );

  return rows[0] || null;
};

const debitAccount = async ({
  connection,
  accountId,
  tenantId,
  amount,
}) => {
  const [result] = await connection.query(
    `
      UPDATE accounts
      SET
        balance = balance - ?,
        updated_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
        AND balance >= ?
        AND status = 'active'
    `,
    [amount, accountId, tenantId, amount]
  );

  return result.affectedRows === 1;
};

const creditAccount = async ({
  connection,
  accountId,
  tenantId,
  amount,
}) => {
  const [result] = await connection.query(
    `
      UPDATE accounts
      SET
        balance = balance + ?,
        updated_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'active'
    `,
    [amount, accountId, tenantId]
  );

  return result.affectedRows === 1;
};

/*
|--------------------------------------------------------------------------
| Transfer creation
|--------------------------------------------------------------------------
*/

const createTransfer = async ({
  connection,
  tenantId,
  userId,
  sourceAccountId,
  destinationAccountId,
  destinationAccountNumber,
  transferType = "internal",
  destinationAccountName = null,
  destinationBankName = null,
  destinationBankCode = null,
  settlementMode = "internal",
  isSimulated = false,
  amount,
  currency,
  description,
  status,
  reference,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO transfers (
        id,
        tenant_id,
        user_id,
        source_account_id,
        destination_account_id,
        destination_account_number,
        transfer_type,
        destination_account_name,
        destination_bank_name,
        destination_bank_code,
        settlement_mode,
        is_simulated,
        amount,
        currency,
        description,
        status,
        reference,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      id,
      tenantId,
      userId,
      sourceAccountId,
      destinationAccountId,
      destinationAccountNumber,
      transferType,
      destinationAccountName,
      destinationBankName,
      destinationBankCode,
      settlementMode,
      isSimulated,
      amount,
      currency,
      description,
      status,
      reference,
    ]
  );

  return id;
};

const createLedgerEntry = async ({
  connection,
  tenantId,
  accountId,
  transferId,
  entryType,
  amount,
  balanceAfter,
  description,
}) => {
  await connection.query(
    `
      INSERT INTO account_ledger_entries (
        id,
        tenant_id,
        account_id,
        transfer_id,
        entry_type,
        amount,
        balance_after,
        description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      accountId,
      transferId,
      entryType,
      amount,
      balanceAfter,
      description,
    ]
  );
};

/*
|--------------------------------------------------------------------------
| Shared transfer queries
|--------------------------------------------------------------------------
*/

const transferSelect = `
SELECT
  t.*,

  sa.account_number AS source_account_number,
  sa.account_name AS source_account_name,
  sa.currency AS source_account_currency,
  sa.status AS source_account_status,

  da.account_number AS destination_account_number_resolved,
  da.account_name AS destination_account_name_resolved,
  da.currency AS destination_account_currency,
  da.status AS destination_account_status,

  u.id AS client_id,
  CONCAT_WS(
    ' ',
    u.first_name,
    u.middle_name,
    u.last_name
  ) AS client_name,
  u.email AS client_email,
  u.phone AS client_phone,
  u.avatar_url AS client_avatar_url

FROM transfers t

LEFT JOIN accounts sa
  ON sa.id = t.source_account_id
 AND sa.tenant_id = t.tenant_id

LEFT JOIN accounts da
  ON da.id = t.destination_account_id
 AND da.tenant_id = t.tenant_id

LEFT JOIN users u
  ON u.id = t.user_id
 AND u.deleted_at IS NULL
`;

const findById = async ({
  transferId,
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      ${transferSelect}

      WHERE t.id = ?
        AND t.tenant_id = ?

      LIMIT 1
    `,
    [transferId, tenantId]
  );

  return rows[0] || null;
};

const findByIdForUpdate = async ({
  connection,
  transferId,
  tenantId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM transfers
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [transferId, tenantId]
  );

  return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Client transfer queries
|--------------------------------------------------------------------------
*/

const findByUser = async ({
  userId,
  tenantId,
  limit,
  offset,
}) => {
  const [rows] = await db.query(
    `
      ${transferSelect}

      WHERE t.user_id = ?
        AND t.tenant_id = ?

      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [userId, tenantId, limit, offset]
  );

  return rows;
};

const countByUser = async ({
  userId,
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM transfers
      WHERE user_id = ?
        AND tenant_id = ?
    `,
    [userId, tenantId]
  );

  return Number(rows[0]?.total || 0);
};

/*
|--------------------------------------------------------------------------
| Tenant administrator transfer queries
|--------------------------------------------------------------------------
*/

const findByTenant = async ({
  tenantId,
  limit,
  offset,
}) => {
  const [rows] = await db.query(
    `
      ${transferSelect}

      WHERE t.tenant_id = ?

      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [tenantId, limit, offset]
  );

  return rows;
};

const countByTenant = async ({
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM transfers
      WHERE tenant_id = ?
    `,
    [tenantId]
  );

  return Number(rows[0]?.total || 0);
};

/*
|--------------------------------------------------------------------------
| Safe transfer metadata update
|--------------------------------------------------------------------------
|
| Completed financial values must not be edited directly here.
| Amount, currency, source account and destination account changes require
| a separate correction or reversal transaction.
|--------------------------------------------------------------------------
*/

const updateDescription = async ({
  connection,
  transferId,
  tenantId,
  description,
}) => {
  const [result] = await connection.query(
    `
      UPDATE transfers
      SET
        description = ?,
        updated_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
    `,
    [description, transferId, tenantId]
  );

  return result.affectedRows === 1;
};

/*
|--------------------------------------------------------------------------
| Transfer limits
|--------------------------------------------------------------------------
*/

const getDailyCompletedTotal = async ({
  userId,
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transfers
      WHERE user_id = ?
        AND tenant_id = ?
        AND status = 'completed'
        AND created_at >= CURRENT_DATE()
        AND created_at < CURRENT_DATE() + INTERVAL 1 DAY
    `,
    [userId, tenantId]
  );

  return Number(rows[0]?.total || 0);
};

module.exports = {
  findAccountForUpdate,
  findAccountByNumberForUpdate,
  debitAccount,
  creditAccount,

  createTransfer,
  createLedgerEntry,

  findById,
  findByIdForUpdate,

  findByUser,
  countByUser,

  findByTenant,
  countByTenant,

  updateDescription,

  getDailyCompletedTotal,
};