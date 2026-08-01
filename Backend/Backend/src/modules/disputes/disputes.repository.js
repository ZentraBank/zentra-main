const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createDispute = async ({
  tenantId,
  userId,
  body,
}) => {
  const id = randomUUID();
  const reference =
    `DSP-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO dispute_cases (
        id,
        tenant_id,
        user_id,
        account_id,
        transaction_id,
        dispute_reference,
        dispute_type,
        reason_code,
        reason_description,
        disputed_amount,
        currency,
        priority,
        due_at,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      body.accountId,
      body.transactionId || null,
      reference,
      body.disputeType,
      body.reasonCode,
      body.reasonDescription || null,
      body.disputedAmount,
      body.currency,
      body.priority,
      body.dueAt || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findDisputeById({
    tenantId,
    disputeId: id,
  });
};

const findDisputeById = async ({
  tenantId,
  disputeId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM dispute_cases
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, disputeId]
  );

  return rows[0] || null;
};

const listDisputes = async ({
  tenantId,
  userId,
  status,
  priority,
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

  if (priority) {
    conditions.push("priority = ?");
    values.push(priority);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM dispute_cases
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

const updateDispute = async ({
  tenantId,
  disputeId,
  body,
}) => {
  await db.query(
    `
      UPDATE dispute_cases
      SET
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        assigned_to = COALESCE(?, assigned_to),
        liability_party = COALESCE(?, liability_party),
        resolution_summary = COALESCE(?, resolution_summary),
        acknowledged_at = CASE
          WHEN ? = 'under_review'
            AND acknowledged_at IS NULL
          THEN NOW()
          ELSE acknowledged_at
        END,
        resolved_at = CASE
          WHEN ? IN (
            'resolved_customer',
            'resolved_merchant'
          )
          THEN NOW()
          ELSE resolved_at
        END,
        closed_at = CASE
          WHEN ? = 'closed'
          THEN NOW()
          ELSE closed_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.status ?? null,
      body.priority ?? null,
      body.assignedTo ?? null,
      body.liabilityParty ?? null,
      body.resolutionSummary ?? null,
      body.status ?? null,
      body.status ?? null,
      body.status ?? null,
      tenantId,
      disputeId,
    ]
  );

  return findDisputeById({
    tenantId,
    disputeId,
  });
};

const addEvent = ({
  tenantId,
  disputeId,
  eventType,
  actorUserId,
  actorType,
  note,
  metadata,
}) =>
  db.query(
    `
      INSERT INTO dispute_events (
        id,
        tenant_id,
        dispute_case_id,
        event_type,
        actor_user_id,
        actor_type,
        note,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      disputeId,
      eventType,
      actorUserId || null,
      actorType,
      note || null,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

const listEvents = async ({
  tenantId,
  disputeId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM dispute_events
      WHERE tenant_id = ?
        AND dispute_case_id = ?
      ORDER BY created_at ASC
    `,
    [tenantId, disputeId]
  );

  return rows;
};

const addEvidence = async ({
  tenantId,
  disputeId,
  body,
  submittedBy,
  submitterType,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO dispute_evidence (
        id,
        tenant_id,
        dispute_case_id,
        evidence_type,
        title,
        description,
        storage_key,
        mime_type,
        file_size_bytes,
        checksum_sha256,
        submitted_by,
        submitter_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      disputeId,
      body.evidenceType,
      body.title,
      body.description || null,
      body.storageKey,
      body.mimeType || null,
      body.fileSizeBytes || null,
      body.checksumSha256 || null,
      submittedBy || null,
      submitterType,
    ]
  );

  return findEvidenceById({
    tenantId,
    evidenceId: id,
  });
};

const findEvidenceById = async ({
  tenantId,
  evidenceId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM dispute_evidence
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, evidenceId]
  );

  return rows[0] || null;
};

const listEvidence = async ({
  tenantId,
  disputeId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM dispute_evidence
      WHERE tenant_id = ?
        AND dispute_case_id = ?
      ORDER BY created_at ASC
    `,
    [tenantId, disputeId]
  );

  return rows;
};

const reviewEvidence = async ({
  tenantId,
  evidenceId,
  body,
  reviewedBy,
}) => {
  await db.query(
    `
      UPDATE dispute_evidence
      SET
        status = ?,
        reviewed_by = ?,
        reviewed_at = NOW(),
        review_note = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.status,
      reviewedBy,
      body.reviewNote || null,
      tenantId,
      evidenceId,
    ]
  );

  return findEvidenceById({
    tenantId,
    evidenceId,
  });
};

const findRefundByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM dispute_refunds
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const createRefund = async ({
  tenantId,
  disputeId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO dispute_refunds (
        id,
        tenant_id,
        dispute_case_id,
        refund_type,
        amount,
        currency,
        customer_ledger_account_id,
        offset_ledger_account_id,
        idempotency_key,
        reason,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      disputeId,
      body.refundType,
      body.amount,
      body.currency,
      body.customerLedgerAccountId,
      body.offsetLedgerAccountId,
      body.idempotencyKey,
      body.reason || null,
      createdBy,
    ]
  );

  return findRefundById({
    tenantId,
    refundId: id,
  });
};

const findRefundById = async ({
  tenantId,
  refundId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM dispute_refunds
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, refundId]
  );

  return rows[0] || null;
};

const markRefundPosted = async ({
  tenantId,
  refundId,
  journalId,
}) => {
  await db.query(
    `
      UPDATE dispute_refunds
      SET
        status = 'posted',
        journal_id = ?,
        posted_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [journalId, tenantId, refundId]
  );

  return findRefundById({
    tenantId,
    refundId,
  });
};

const updateDisputeRefundFields = async ({
  tenantId,
  disputeId,
  refund,
}) => {
  if (
    refund.refund_type ===
    "provisional_credit"
  ) {
    await db.query(
      `
        UPDATE dispute_cases
        SET
          status = 'provisional_credit_issued',
          provisional_credit_amount = ?,
          provisional_credit_journal_id = ?
        WHERE tenant_id = ?
          AND id = ?
      `,
      [
        refund.amount,
        refund.journal_id,
        tenantId,
        disputeId,
      ]
    );
  }

  if (
    [
      "final_refund",
      "partial_refund",
    ].includes(
      refund.refund_type
    )
  ) {
    await db.query(
      `
        UPDATE dispute_cases
        SET
          final_refund_amount = ?,
          final_refund_journal_id = ?,
          status = 'resolved_customer',
          resolved_at = NOW()
        WHERE tenant_id = ?
          AND id = ?
      `,
      [
        refund.amount,
        refund.journal_id,
        tenantId,
        disputeId,
      ]
    );
  }
};

const createChargeback = async ({
  tenantId,
  disputeId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO chargeback_records (
        id,
        tenant_id,
        dispute_case_id,
        network,
        chargeback_reference,
        stage,
        reason_code,
        amount,
        currency,
        filed_at,
        response_due_at,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `,
    [
      id,
      tenantId,
      disputeId,
      body.network || null,
      body.chargebackReference,
      body.stage,
      body.reasonCode,
      body.amount,
      body.currency,
      body.responseDueAt || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  await db.query(
    `
      UPDATE dispute_cases
      SET status = 'chargeback_filed'
      WHERE tenant_id = ?
        AND id = ?
    `,
    [tenantId, disputeId]
  );

  return findChargebackById({
    tenantId,
    chargebackId: id,
  });
};

const findChargebackById = async ({
  tenantId,
  chargebackId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM chargeback_records
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, chargebackId]
  );

  return rows[0] || null;
};

const updateChargeback = async ({
  tenantId,
  chargebackId,
  body,
}) => {
  await db.query(
    `
      UPDATE chargeback_records
      SET
        stage = COALESCE(?, stage),
        outcome = COALESCE(?, outcome),
        outcome_amount = COALESCE(?, outcome_amount),
        responded_at = CASE
          WHEN ? IS NOT NULL
          THEN NOW()
          ELSE responded_at
        END,
        metadata = COALESCE(?, metadata)
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.stage ?? null,
      body.outcome ?? null,
      body.outcomeAmount ?? null,
      body.outcome ?? null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
      tenantId,
      chargebackId,
    ]
  );

  return findChargebackById({
    tenantId,
    chargebackId,
  });
};

module.exports = {
  createDispute,
  findDisputeById,
  listDisputes,
  updateDispute,
  addEvent,
  listEvents,
  addEvidence,
  findEvidenceById,
  listEvidence,
  reviewEvidence,
  findRefundByIdempotency,
  createRefund,
  findRefundById,
  markRefundPosted,
  updateDisputeRefundFields,
  createChargeback,
  findChargebackById,
  updateChargeback,
};
