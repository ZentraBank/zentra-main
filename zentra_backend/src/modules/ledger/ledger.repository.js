const { randomUUID } = require("crypto");
const db = require("../../config/db");

const findLedgerAccountById = async ({
  connection = db,
  tenantId,
  ledgerAccountId,
  forUpdate = false,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM ledger_accounts
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
      ${forUpdate ? "FOR UPDATE" : ""}
    `,
    [ledgerAccountId, tenantId]
  );

  return rows[0] || null;
};

const findLedgerAccountByOwner = async ({
  connection = db,
  tenantId,
  ownerType,
  ownerId,
  currency,
  forUpdate = false,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM ledger_accounts
      WHERE tenant_id = ?
        AND owner_type = ?
        AND owner_id <=> ?
        AND currency = ?
      LIMIT 1
      ${forUpdate ? "FOR UPDATE" : ""}
    `,
    [
      tenantId,
      ownerType,
      ownerId || null,
      currency,
    ]
  );

  return rows[0] || null;
};

const createLedgerAccount = async ({
  tenantId,
  ownerType,
  ownerId,
  code,
  name,
  currency,
  normalBalance,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO ledger_accounts (
        id,
        tenant_id,
        owner_type,
        owner_id,
        code,
        name,
        currency,
        normal_balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      ownerType,
      ownerId || null,
      code,
      name,
      currency,
      normalBalance,
    ]
  );

  return findLedgerAccountById({
    tenantId,
    ledgerAccountId: id,
  });
};

const findJournalByIdempotencyKey = async ({
  connection = db,
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM ledger_journals
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const findJournalById = async ({
  connection = db,
  tenantId,
  journalId,
  forUpdate = false,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM ledger_journals
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
      ${forUpdate ? "FOR UPDATE" : ""}
    `,
    [tenantId, journalId]
  );

  return rows[0] || null;
};

const createJournal = async ({
  connection = db,
  tenantId,
  reference,
  idempotencyKey,
  transactionType,
  description,
  sourceType,
  sourceId,
  postedBy,
  metadata,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO ledger_journals (
        id,
        tenant_id,
        reference,
        idempotency_key,
        transaction_type,
        description,
        source_type,
        source_id,
        posted_by,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      reference,
      idempotencyKey,
      transactionType,
      description || null,
      sourceType || null,
      sourceId || null,
      postedBy || null,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

  return id;
};

const createEntry = ({
  connection = db,
  tenantId,
  journalId,
  ledgerAccountId,
  entryType,
  amount,
  currency,
  description,
}) =>
  connection.query(
    `
      INSERT INTO ledger_entries (
        id,
        tenant_id,
        journal_id,
        ledger_account_id,
        entry_type,
        amount,
        currency,
        description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      journalId,
      ledgerAccountId,
      entryType,
      amount,
      currency,
      description || null,
    ]
  );

const markJournalPosted = ({
  connection = db,
  tenantId,
  journalId,
}) =>
  connection.query(
    `
      UPDATE ledger_journals
      SET
        status = 'posted',
        posted_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [tenantId, journalId]
  );

const markJournalReversed = ({
  connection = db,
  tenantId,
  journalId,
  reversalJournalId,
  reversedBy,
}) =>
  connection.query(
    `
      UPDATE ledger_journals
      SET
        status = 'reversed',
        reversal_journal_id = ?,
        reversed_by = ?,
        reversed_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      reversalJournalId,
      reversedBy,
      tenantId,
      journalId,
    ]
  );

const listJournalEntries = async ({
  connection = db,
  tenantId,
  journalId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT
        le.*,
        la.code AS ledger_account_code,
        la.name AS ledger_account_name,
        la.normal_balance
      FROM ledger_entries le
      INNER JOIN ledger_accounts la
        ON la.id = le.ledger_account_id
      WHERE le.tenant_id = ?
        AND le.journal_id = ?
      ORDER BY le.created_at ASC
    `,
    [tenantId, journalId]
  );

  return rows;
};

const getLedgerAccountBalance = async ({
  connection = db,
  tenantId,
  ledgerAccountId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT
        la.id,
        la.code,
        la.name,
        la.currency,
        la.normal_balance,
        COALESCE(
          SUM(
            CASE
              WHEN le.entry_type = 'debit'
              THEN le.amount
              ELSE 0
            END
          ),
          0
        ) AS debit_total,
        COALESCE(
          SUM(
            CASE
              WHEN le.entry_type = 'credit'
              THEN le.amount
              ELSE 0
            END
          ),
          0
        ) AS credit_total
      FROM ledger_accounts la
      LEFT JOIN ledger_entries le
        ON le.ledger_account_id = la.id
      LEFT JOIN ledger_journals lj
        ON lj.id = le.journal_id
        AND lj.status = 'posted'
      WHERE la.tenant_id = ?
        AND la.id = ?
      GROUP BY
        la.id,
        la.code,
        la.name,
        la.currency,
        la.normal_balance
    `,
    [tenantId, ledgerAccountId]
  );

  return rows[0] || null;
};

const createHold = async ({
  tenantId,
  accountId,
  reference,
  amount,
  currency,
  reason,
  expiresAt,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO account_holds (
        id,
        tenant_id,
        account_id,
        reference,
        amount,
        currency,
        reason,
        expires_at,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      accountId,
      reference,
      amount,
      currency,
      reason || null,
      expiresAt || null,
      createdBy || null,
    ]
  );

  return findHoldById({
    tenantId,
    holdId: id,
  });
};

const findHoldById = async ({
  connection = db,
  tenantId,
  holdId,
  forUpdate = false,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM account_holds
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
      ${forUpdate ? "FOR UPDATE" : ""}
    `,
    [tenantId, holdId]
  );

  return rows[0] || null;
};

const getActiveHoldTotal = async ({
  connection = db,
  tenantId,
  accountId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT
        COALESCE(SUM(amount), 0)
          AS held_amount
      FROM account_holds
      WHERE tenant_id = ?
        AND account_id = ?
        AND status = 'active'
        AND (
          expires_at IS NULL
          OR expires_at > NOW()
        )
    `,
    [tenantId, accountId]
  );

  return Number(
    rows[0].held_amount
  );
};

const releaseHold = async ({
  connection = db,
  tenantId,
  holdId,
  releasedBy,
}) => {
  await connection.query(
    `
      UPDATE account_holds
      SET
        status = 'released',
        released_by = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'active'
    `,
    [
      releasedBy || null,
      tenantId,
      holdId,
    ]
  );

  return findHoldById({
    connection,
    tenantId,
    holdId,
  });
};

const captureHold = async ({
  connection = db,
  tenantId,
  holdId,
  journalId,
}) => {
  await connection.query(
    `
      UPDATE account_holds
      SET
        status = 'captured',
        captured_journal_id = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'active'
    `,
    [
      journalId,
      tenantId,
      holdId,
    ]
  );

  return findHoldById({
    connection,
    tenantId,
    holdId,
  });
};

const expireHolds = async ({
  tenantId,
}) => {
  const [result] = await db.query(
    `
      UPDATE account_holds
      SET status = 'expired'
      WHERE tenant_id = ?
        AND status = 'active'
        AND expires_at IS NOT NULL
        AND expires_at <= NOW()
    `,
    [tenantId]
  );

  return result.affectedRows;
};

const listJournals = async ({
  tenantId,
  status,
  transactionType,
  limit,
  offset,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];
  const values = [tenantId];

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (transactionType) {
    conditions.push(
      "transaction_type = ?"
    );
    values.push(transactionType);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM ledger_journals
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

module.exports = {
  db,
  findLedgerAccountById,
  findLedgerAccountByOwner,
  createLedgerAccount,
  findJournalByIdempotencyKey,
  findJournalById,
  createJournal,
  createEntry,
  markJournalPosted,
  markJournalReversed,
  listJournalEntries,
  getLedgerAccountBalance,
  createHold,
  findHoldById,
  getActiveHoldTotal,
  releaseHold,
  captureHold,
  expireHolds,
  listJournals,
};
