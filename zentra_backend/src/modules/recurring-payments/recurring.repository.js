const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createMandate = async ({
  tenantId,
  userId,
  body,
}) => {
  const id = randomUUID();
  const reference =
    `MDT-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO payment_mandates (
        id,
        tenant_id,
        user_id,
        mandate_reference,
        mandate_type,
        creditor_name,
        creditor_reference,
        source_account_id,
        source_ledger_account_id,
        destination_account_id,
        destination_ledger_account_id,
        payment_rail_id,
        currency,
        fixed_amount,
        maximum_amount,
        frequency,
        interval_value,
        interval_unit,
        start_date,
        end_date,
        next_collection_date,
        execution_time,
        timezone,
        holiday_policy,
        insufficient_funds_policy,
        retry_count,
        retry_interval_hours,
        activation_method,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      reference,
      body.mandateType,
      body.creditorName,
      body.creditorReference || null,
      body.sourceAccountId,
      body.sourceLedgerAccountId,
      body.destinationAccountId || null,
      body.destinationLedgerAccountId || null,
      body.paymentRailId || null,
      body.currency,
      body.fixedAmount ?? null,
      body.maximumAmount ?? null,
      body.frequency,
      body.intervalValue ?? null,
      body.intervalUnit || null,
      body.startDate,
      body.endDate || null,
      body.startDate,
      body.executionTime || null,
      body.timezone,
      body.holidayPolicy,
      body.insufficientFundsPolicy,
      body.retryCount,
      body.retryIntervalHours,
      body.activationMethod,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findMandateById({
    tenantId,
    mandateId: id,
  });
};

const findMandateById = async ({
  tenantId,
  mandateId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM payment_mandates
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, mandateId]
  );

  return rows[0] || null;
};

const listMandates = async ({
  tenantId,
  userId,
  status,
  mandateType,
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

  if (mandateType) {
    conditions.push("mandate_type = ?");
    values.push(mandateType);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM payment_mandates
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

const updateMandateStatus = async ({
  tenantId,
  mandateId,
  newStatus,
  actorUserId,
  actorType,
  note,
}) => {
  const current =
    await findMandateById({
      tenantId,
      mandateId,
    });

  if (!current) {
    return null;
  }

  await db.query(
    `
      UPDATE payment_mandates
      SET
        status = ?,
        authorised_at = CASE
          WHEN ? = 'active'
            AND authorised_at IS NULL
          THEN NOW()
          ELSE authorised_at
        END,
        activated_at = CASE
          WHEN ? = 'active'
            AND activated_at IS NULL
          THEN NOW()
          ELSE activated_at
        END,
        paused_at = CASE
          WHEN ? = 'paused'
          THEN NOW()
          ELSE paused_at
        END,
        cancelled_at = CASE
          WHEN ? = 'cancelled'
          THEN NOW()
          ELSE cancelled_at
        END,
        cancellation_reason = CASE
          WHEN ? = 'cancelled'
          THEN ?
          ELSE cancellation_reason
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      newStatus,
      newStatus,
      newStatus,
      newStatus,
      newStatus,
      newStatus,
      note || null,
      tenantId,
      mandateId,
    ]
  );

  await addMandateEvent({
    tenantId,
    mandateId,
    eventType:
      `mandate_${newStatus}`,
    actorUserId,
    actorType,
    previousStatus:
      current.status,
    newStatus,
    note,
  });

  return findMandateById({
    tenantId,
    mandateId,
  });
};

const addMandateEvent = ({
  tenantId,
  mandateId,
  eventType,
  actorUserId,
  actorType,
  previousStatus,
  newStatus,
  note,
  metadata,
}) =>
  db.query(
    `
      INSERT INTO mandate_events (
        id,
        tenant_id,
        payment_mandate_id,
        event_type,
        actor_user_id,
        actor_type,
        previous_status,
        new_status,
        note,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      mandateId,
      eventType,
      actorUserId || null,
      actorType,
      previousStatus || null,
      newStatus || null,
      note || null,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

const createAuthorisation = async ({
  tenantId,
  mandateId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO mandate_authorisations (
        id,
        tenant_id,
        payment_mandate_id,
        authorisation_type,
        authorisation_reference,
        evidence_storage_key,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      mandateId,
      body.authorisationType,
      body.authorisationReference || null,
      body.evidenceStorageKey || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findAuthorisationById({
    tenantId,
    authorisationId: id,
  });
};

const findAuthorisationById = async ({
  tenantId,
  authorisationId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM mandate_authorisations
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, authorisationId]
  );

  return rows[0] || null;
};

const confirmAuthorisation = async ({
  tenantId,
  authorisationId,
  authorisedBy,
}) => {
  await db.query(
    `
      UPDATE mandate_authorisations
      SET
        status = 'confirmed',
        authorised_by = ?,
        authorised_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'pending'
    `,
    [
      authorisedBy,
      tenantId,
      authorisationId,
    ]
  );

  return findAuthorisationById({
    tenantId,
    authorisationId,
  });
};

const createSchedule = async ({
  tenantId,
  mandate,
  scheduledDate,
  amount,
}) => {
  const id = randomUUID();
  const idempotencyKey =
    `mandate:${mandate.id}:${scheduledDate}`;

  await db.query(
    `
      INSERT IGNORE INTO recurring_payment_schedules (
        id,
        tenant_id,
        payment_mandate_id,
        scheduled_date,
        amount,
        currency,
        idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      mandate.id,
      scheduledDate,
      amount,
      mandate.currency,
      idempotencyKey,
    ]
  );

  return findScheduleByIdempotency({
    tenantId,
    idempotencyKey,
  });
};

const findScheduleByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM recurring_payment_schedules
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const findDueSchedules = async ({
  tenantId,
  limit,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        s.*,
        m.user_id,
        m.mandate_type,
        m.creditor_name,
        m.creditor_reference,
        m.source_account_id,
        m.source_ledger_account_id,
        m.destination_account_id,
        m.destination_ledger_account_id,
        m.payment_rail_id,
        m.retry_count,
        m.retry_interval_hours,
        m.insufficient_funds_policy,
        m.next_collection_date,
        m.end_date
      FROM recurring_payment_schedules s
      INNER JOIN payment_mandates m
        ON m.id = s.payment_mandate_id
      WHERE s.tenant_id = ?
        AND m.status = 'active'
        AND (
          s.status = 'scheduled'
          OR (
            s.status = 'retry_scheduled'
            AND s.next_retry_at <= NOW()
          )
        )
        AND s.scheduled_date <= CURRENT_DATE()
      ORDER BY s.scheduled_date ASC
      LIMIT ?
    `,
    [tenantId, limit]
  );

  return rows;
};

const markScheduleProcessing = ({
  tenantId,
  scheduleId,
}) =>
  db.query(
    `
      UPDATE recurring_payment_schedules
      SET
        status = 'processing',
        attempt_count =
          attempt_count + 1
      WHERE tenant_id = ?
        AND id = ?
    `,
    [tenantId, scheduleId]
  );

const markScheduleSucceeded = async ({
  tenantId,
  scheduleId,
  paymentInstructionId,
  ledgerJournalId,
}) => {
  await db.query(
    `
      UPDATE recurring_payment_schedules
      SET
        status = 'succeeded',
        payment_instruction_id = ?,
        ledger_journal_id = ?,
        failure_code = NULL,
        failure_message = NULL,
        next_retry_at = NULL
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      paymentInstructionId || null,
      ledgerJournalId || null,
      tenantId,
      scheduleId,
    ]
  );
};

const markScheduleFailed = async ({
  tenantId,
  scheduleId,
  failureCode,
  failureMessage,
  retryAt,
}) => {
  await db.query(
    `
      UPDATE recurring_payment_schedules
      SET
        status = ?,
        failure_code = ?,
        failure_message = ?,
        next_retry_at = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      retryAt
        ? "retry_scheduled"
        : "failed",
      failureCode || null,
      failureMessage || null,
      retryAt || null,
      tenantId,
      scheduleId,
    ]
  );
};

const updateMandateAfterExecution = async ({
  tenantId,
  mandateId,
  executedDate,
  nextCollectionDate,
  completed,
}) => {
  await db.query(
    `
      UPDATE payment_mandates
      SET
        last_collection_date = ?,
        next_collection_date = ?,
        status = CASE
          WHEN ? = TRUE
          THEN 'completed'
          ELSE status
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      executedDate,
      nextCollectionDate || executedDate,
      completed,
      tenantId,
      mandateId,
    ]
  );
};

module.exports = {
  createMandate,
  findMandateById,
  listMandates,
  updateMandateStatus,
  addMandateEvent,
  createAuthorisation,
  findAuthorisationById,
  confirmAuthorisation,
  createSchedule,
  findScheduleByIdempotency,
  findDueSchedules,
  markScheduleProcessing,
  markScheduleSucceeded,
  markScheduleFailed,
  updateMandateAfterExecution,
};
