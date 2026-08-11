const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createRail = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO payment_rails (
        id,
        tenant_id,
        code,
        name,
        rail_type,
        currency,
        country_code,
        settlement_mode,
        cutoff_time,
        timezone,
        minimum_amount,
        maximum_amount,
        settlement_ledger_account_id,
        clearing_ledger_account_id,
        fee_ledger_account_id,
        status,
        metadata,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.railType,
      body.currency,
      body.countryCode || null,
      body.settlementMode,
      body.cutoffTime || null,
      body.timezone,
      body.minimumAmount ?? null,
      body.maximumAmount ?? null,
      body.settlementLedgerAccountId,
      body.clearingLedgerAccountId,
      body.feeLedgerAccountId || null,
      body.status,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
      createdBy,
    ]
  );

  return findRailById({
    tenantId,
    railId: id,
  });
};

const findRailById = async ({
  tenantId,
  railId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM payment_rails
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, railId]
  );

  return rows[0] || null;
};

const listRails = async ({
  tenantId,
  status,
  railType,
}) => {
  const conditions = ["tenant_id = ?"];
  const values = [tenantId];

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (railType) {
    conditions.push("rail_type = ?");
    values.push(railType);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM payment_rails
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
    `,
    values
  );

  return rows;
};

const findInstructionByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM payment_instructions
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const createInstruction = async ({
  tenantId,
  userId,
  body,
}) => {
  const id = randomUUID();
  const reference =
    `PAY-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO payment_instructions (
        id,
        tenant_id,
        rail_id,
        user_id,
        source_account_id,
        source_ledger_account_id,
        destination_ledger_account_id,
        idempotency_key,
        payment_reference,
        external_reference,
        direction,
        payment_type,
        amount,
        fee_amount,
        currency,
        debtor_name,
        debtor_account_reference,
        debtor_bank_code,
        creditor_name,
        creditor_account_reference,
        creditor_bank_code,
        narration,
        requested_execution_date,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.railId,
      userId,
      body.sourceAccountId,
      body.sourceLedgerAccountId,
      body.destinationLedgerAccountId || null,
      body.idempotencyKey,
      reference,
      body.externalReference || null,
      body.direction,
      body.paymentType,
      body.amount,
      body.feeAmount || 0,
      body.currency,
      body.debtorName || null,
      body.debtorAccountReference || null,
      body.debtorBankCode || null,
      body.creditorName,
      body.creditorAccountReference,
      body.creditorBankCode || null,
      body.narration || null,
      body.requestedExecutionDate || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findInstructionById({
    tenantId,
    instructionId: id,
  });
};

const findInstructionById = async ({
  tenantId,
  instructionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM payment_instructions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, instructionId]
  );

  return rows[0] || null;
};

const listInstructions = async ({
  tenantId,
  userId,
  status,
  railId,
  limit,
  offset,
}) => {
  const conditions = ["tenant_id = ?"];
  const values = [tenantId];

  if (userId) {
    conditions.push("user_id = ?");
    values.push(userId);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (railId) {
    conditions.push("rail_id = ?");
    values.push(railId);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM payment_instructions
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

const updateInstructionStatus = async ({
  tenantId,
  instructionId,
  newStatus,
  fields = {},
}) => {
  const existing =
    await findInstructionById({
      tenantId,
      instructionId,
    });

  if (!existing) {
    return null;
  }

  await db.query(
    `
      UPDATE payment_instructions
      SET
        status = ?,
        risk_decision =
          COALESCE(?, risk_decision),
        compliance_decision =
          COALESCE(?, compliance_decision),
        approval_request_id =
          COALESCE(?, approval_request_id),
        clearing_batch_id =
          COALESCE(?, clearing_batch_id),
        settlement_batch_id =
          COALESCE(?, settlement_batch_id),
        hold_id =
          COALESCE(?, hold_id),
        ledger_journal_id =
          COALESCE(?, ledger_journal_id),
        settlement_journal_id =
          COALESCE(?, settlement_journal_id),
        reversal_journal_id =
          COALESCE(?, reversal_journal_id),
        external_reference =
          COALESCE(?, external_reference),
        submitted_at = CASE
          WHEN ? = 'submitted'
          THEN NOW()
          ELSE submitted_at
        END,
        accepted_at = CASE
          WHEN ? = 'accepted'
          THEN NOW()
          ELSE accepted_at
        END,
        cleared_at = CASE
          WHEN ? = 'cleared'
          THEN NOW()
          ELSE cleared_at
        END,
        settled_at = CASE
          WHEN ? = 'settled'
          THEN NOW()
          ELSE settled_at
        END,
        failed_at = CASE
          WHEN ? = 'failed'
          THEN NOW()
          ELSE failed_at
        END,
        failure_code =
          COALESCE(?, failure_code),
        failure_message =
          COALESCE(?, failure_message)
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      newStatus,
      fields.riskDecision ?? null,
      fields.complianceDecision ?? null,
      fields.approvalRequestId ?? null,
      fields.clearingBatchId ?? null,
      fields.settlementBatchId ?? null,
      fields.holdId ?? null,
      fields.ledgerJournalId ?? null,
      fields.settlementJournalId ?? null,
      fields.reversalJournalId ?? null,
      fields.externalReference ?? null,
      newStatus,
      newStatus,
      newStatus,
      newStatus,
      newStatus,
      fields.failureCode ?? null,
      fields.failureMessage ?? null,
      tenantId,
      instructionId,
    ]
  );

  await addStatusEvent({
    tenantId,
    instructionId,
    previousStatus:
      existing.status,
    newStatus,
    actorUserId:
      fields.actorUserId || null,
    actorType:
      fields.actorType || "system",
    note:
      fields.note || null,
    metadata:
      fields.metadata || null,
  });

  return findInstructionById({
    tenantId,
    instructionId,
  });
};

const addStatusEvent = ({
  tenantId,
  instructionId,
  previousStatus,
  newStatus,
  actorUserId,
  actorType,
  note,
  metadata,
}) =>
  db.query(
    `
      INSERT INTO payment_status_events (
        id,
        tenant_id,
        payment_instruction_id,
        previous_status,
        new_status,
        actor_user_id,
        actor_type,
        note,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      instructionId,
      previousStatus || null,
      newStatus,
      actorUserId || null,
      actorType,
      note || null,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

const createClearingBatch = async ({
  tenantId,
  railId,
  body,
}) => {
  const id = randomUUID();
  const reference =
    `CLR-${body.clearingDate}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO clearing_batches (
        id,
        tenant_id,
        rail_id,
        batch_reference,
        clearing_date,
        direction,
        currency,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      railId,
      reference,
      body.clearingDate,
      body.direction,
      body.currency,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findClearingBatchById({
    tenantId,
    batchId: id,
  });
};

const findClearingBatchById = async ({
  tenantId,
  batchId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM clearing_batches
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, batchId]
  );

  return rows[0] || null;
};

const addInstructionToBatch = async ({
  tenantId,
  batchId,
  instructionId,
}) => {
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    const [payments] =
      await connection.query(
        `
          SELECT *
          FROM payment_instructions
          WHERE tenant_id = ?
            AND id = ?
          FOR UPDATE
        `,
        [tenantId, instructionId]
      );

    const payment =
      payments[0];

    if (!payment) {
      throw new Error(
        "Payment instruction not found"
      );
    }

    await connection.query(
      `
        UPDATE payment_instructions
        SET
          clearing_batch_id = ?,
          status = 'queued'
        WHERE tenant_id = ?
          AND id = ?
      `,
      [
        batchId,
        tenantId,
        instructionId,
      ]
    );

    await connection.query(
      `
        UPDATE clearing_batches
        SET
          item_count = item_count + 1,
          total_amount =
            total_amount + ?
        WHERE tenant_id = ?
          AND id = ?
          AND status = 'open'
      `,
      [
        payment.amount,
        tenantId,
        batchId,
      ]
    );

    await connection.commit();

    return findInstructionById({
      tenantId,
      instructionId,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const closeClearingBatch = async ({
  tenantId,
  batchId,
}) => {
  await db.query(
    `
      UPDATE clearing_batches
      SET
        status = 'closed',
        closed_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'open'
    `,
    [tenantId, batchId]
  );

  return findClearingBatchById({
    tenantId,
    batchId,
  });
};

const createSettlementBatch = async ({
  tenantId,
  railId,
  body,
  totals,
}) => {
  const id = randomUUID();
  const reference =
    `STL-${body.settlementDate}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO settlement_batches (
        id,
        tenant_id,
        rail_id,
        settlement_reference,
        settlement_date,
        gross_debit_amount,
        gross_credit_amount,
        net_settlement_amount,
        currency,
        status,
        calculated_at,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'calculated', NOW(), ?)
    `,
    [
      id,
      tenantId,
      railId,
      reference,
      body.settlementDate,
      totals.grossDebitAmount,
      totals.grossCreditAmount,
      totals.netSettlementAmount,
      body.currency,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findSettlementBatchById({
    tenantId,
    settlementBatchId: id,
  });
};

const findSettlementBatchById = async ({
  tenantId,
  settlementBatchId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM settlement_batches
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, settlementBatchId]
  );

  return rows[0] || null;
};

const aggregateForSettlement = async ({
  tenantId,
  railId,
  settlementDate,
  currency,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN direction = 'outbound'
              THEN amount + fee_amount
              ELSE 0
            END
          ),
          0
        ) AS gross_debit_amount,

        COALESCE(
          SUM(
            CASE
              WHEN direction = 'inbound'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS gross_credit_amount
      FROM payment_instructions
      WHERE tenant_id = ?
        AND rail_id = ?
        AND currency = ?
        AND status = 'cleared'
        AND DATE(cleared_at) = ?
    `,
    [
      tenantId,
      railId,
      currency,
      settlementDate,
    ]
  );

  const grossDebitAmount =
    Number(
      rows[0].gross_debit_amount
    );

  const grossCreditAmount =
    Number(
      rows[0].gross_credit_amount
    );

  return {
    grossDebitAmount,
    grossCreditAmount,
    netSettlementAmount:
      Number(
        (
          grossDebitAmount -
          grossCreditAmount
        ).toFixed(2)
      ),
  };
};

const markSettlementPosted = async ({
  tenantId,
  settlementBatchId,
  journalId,
}) => {
  await db.query(
    `
      UPDATE settlement_batches
      SET
        status = 'posted',
        ledger_journal_id = ?,
        posted_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      journalId,
      tenantId,
      settlementBatchId,
    ]
  );

  await db.query(
    `
      UPDATE payment_instructions
      SET
        status = 'settled',
        settlement_batch_id = ?,
        settlement_journal_id = ?,
        settled_at = NOW()
      WHERE tenant_id = ?
        AND rail_id = (
          SELECT rail_id
          FROM settlement_batches
          WHERE id = ?
        )
        AND status = 'cleared'
        AND DATE(cleared_at) = (
          SELECT settlement_date
          FROM settlement_batches
          WHERE id = ?
        )
    `,
    [
      settlementBatchId,
      journalId,
      tenantId,
      settlementBatchId,
      settlementBatchId,
    ]
  );

  return findSettlementBatchById({
    tenantId,
    settlementBatchId,
  });
};

module.exports = {
  createRail,
  findRailById,
  listRails,
  findInstructionByIdempotency,
  createInstruction,
  findInstructionById,
  listInstructions,
  updateInstructionStatus,
  addStatusEvent,
  createClearingBatch,
  findClearingBatchById,
  addInstructionToBatch,
  closeClearingBatch,
  createSettlementBatch,
  findSettlementBatchById,
  aggregateForSettlement,
  markSettlementPosted,
};
