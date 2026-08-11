const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createRun = async ({
  tenantId,
  runType,
  currency,
  startedBy,
  metadata,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO reconciliation_runs (
        id,
        tenant_id,
        run_type,
        currency,
        started_by,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      runType,
      currency || null,
      startedBy,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

  return findRunById({
    tenantId,
    runId: id,
  });
};

const findRunById = async ({
  tenantId,
  runId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM reconciliation_runs
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, runId]
  );

  return rows[0] || null;
};

const markRunProcessing = ({
  tenantId,
  runId,
}) =>
  db.query(
    `
      UPDATE reconciliation_runs
      SET
        status = 'processing',
        started_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [tenantId, runId]
  );

const completeRun = async ({
  tenantId,
  runId,
  totalRecords,
  matchedRecords,
  mismatchedRecords,
}) => {
  await db.query(
    `
      UPDATE reconciliation_runs
      SET
        status = 'completed',
        total_records = ?,
        matched_records = ?,
        mismatched_records = ?,
        completed_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      totalRecords,
      matchedRecords,
      mismatchedRecords,
      tenantId,
      runId,
    ]
  );

  return findRunById({
    tenantId,
    runId,
  });
};

const failRun = async ({
  tenantId,
  runId,
  reason,
}) => {
  await db.query(
    `
      UPDATE reconciliation_runs
      SET
        status = 'failed',
        failure_reason = ?,
        completed_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      reason,
      tenantId,
      runId,
    ]
  );

  return findRunById({
    tenantId,
    runId,
  });
};

const getLedgerVsAccounts = async ({
  tenantId,
  currency,
}) => {
  const conditions = [
    "a.tenant_id = ?",
  ];
  const values = [tenantId];

  if (currency) {
    conditions.push(
      "a.currency = ?"
    );
    values.push(currency);
  }

  const [rows] = await db.query(
    `
      SELECT
        a.id AS account_id,
        a.account_number,
        a.currency,
        a.balance AS account_balance,
        la.id AS ledger_account_id,
        la.normal_balance,
        COALESCE(
          SUM(
            CASE
              WHEN lj.status = 'posted'
                AND le.entry_type = 'debit'
              THEN le.amount
              ELSE 0
            END
          ),
          0
        ) AS debit_total,
        COALESCE(
          SUM(
            CASE
              WHEN lj.status = 'posted'
                AND le.entry_type = 'credit'
              THEN le.amount
              ELSE 0
            END
          ),
          0
        ) AS credit_total
      FROM accounts a
      LEFT JOIN ledger_accounts la
        ON la.tenant_id = a.tenant_id
        AND la.owner_type = 'customer_account'
        AND la.owner_id = a.id
        AND la.currency = a.currency
      LEFT JOIN ledger_entries le
        ON le.ledger_account_id = la.id
      LEFT JOIN ledger_journals lj
        ON lj.id = le.journal_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY
        a.id,
        a.account_number,
        a.currency,
        a.balance,
        la.id,
        la.normal_balance
      ORDER BY a.created_at ASC
    `,
    values
  );

  return rows;
};

const createItem = ({
  connection = db,
  tenantId,
  runId,
  sourceType,
  sourceId,
  reference,
  currency,
  internalAmount,
  externalAmount,
  differenceAmount,
  status,
  metadata,
}) =>
  connection.query(
    `
      INSERT INTO reconciliation_items (
        id,
        tenant_id,
        reconciliation_run_id,
        source_type,
        source_id,
        reference,
        currency,
        internal_amount,
        external_amount,
        difference_amount,
        status,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      runId,
      sourceType,
      sourceId,
      reference || null,
      currency,
      internalAmount,
      externalAmount,
      differenceAmount,
      status,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

const listRuns = async ({
  tenantId,
  status,
  runType,
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

  if (runType) {
    conditions.push("run_type = ?");
    values.push(runType);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM reconciliation_runs
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return rows;
};

const listItems = async ({
  tenantId,
  runId,
  status,
  limit,
  offset,
}) => {
  const conditions = [
    "tenant_id = ?",
    "reconciliation_run_id = ?",
  ];
  const values = [
    tenantId,
    runId,
  ];

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM reconciliation_items
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return rows;
};

const findItemById = async ({
  tenantId,
  itemId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM reconciliation_items
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, itemId]
  );

  return rows[0] || null;
};

const updateItemStatus = async ({
  tenantId,
  itemId,
  status,
  resolutionNote,
  resolvedBy,
}) => {
  await db.query(
    `
      UPDATE reconciliation_items
      SET
        status = ?,
        resolution_note = ?,
        resolved_by = CASE
          WHEN ? IN ('resolved', 'ignored')
          THEN ?
          ELSE resolved_by
        END,
        resolved_at = CASE
          WHEN ? IN ('resolved', 'ignored')
          THEN NOW()
          ELSE resolved_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      status,
      resolutionNote || null,
      status,
      resolvedBy,
      status,
      tenantId,
      itemId,
    ]
  );

  return findItemById({
    tenantId,
    itemId,
  });
};

module.exports = {
  db,
  createRun,
  findRunById,
  markRunProcessing,
  completeRun,
  failRun,
  getLedgerVsAccounts,
  createItem,
  listRuns,
  listItems,
  findItemById,
  updateItemStatus,
};
