const {
  randomUUID,
} = require("crypto");

const db =
  require("../../config/db");

const createDefinition = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO scheduled_job_definitions (
        id,
        tenant_id,
        code,
        name,
        description,
        queue_name,
        job_name,
        schedule_type,
        cron_expression,
        interval_seconds,
        timezone,
        payload,
        concurrency_limit,
        retry_attempts,
        retry_backoff_ms,
        timeout_ms,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId || null,
      body.code,
      body.name,
      body.description || null,
      body.queueName,
      body.jobName,
      body.scheduleType,
      body.cronExpression || null,
      body.intervalSeconds || null,
      body.timezone || "UTC",
      body.payload
        ? JSON.stringify(body.payload)
        : null,
      body.concurrencyLimit,
      body.retryAttempts,
      body.retryBackoffMs,
      body.timeoutMs,
      body.status,
      createdBy || null,
    ]
  );

  return findDefinitionById({
    tenantId,
    definitionId: id,
    includeGlobal: true,
  });
};

const findDefinitionById = async ({
  tenantId,
  definitionId,
  includeGlobal = false,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM scheduled_job_definitions
      WHERE id = ?
        AND (
          tenant_id = ?
          ${includeGlobal
            ? "OR tenant_id IS NULL"
            : ""}
        )
      LIMIT 1
    `,
    [
      definitionId,
      tenantId || null,
    ]
  );

  return rows[0] || null;
};

const listDefinitions = async ({
  tenantId,
  status,
  queueName,
}) => {
  const conditions = [
    "(tenant_id = ? OR tenant_id IS NULL)",
  ];
  const values = [tenantId];

  if (status) {
    conditions.push(
      "status = ?"
    );
    values.push(status);
  }

  if (queueName) {
    conditions.push(
      "queue_name = ?"
    );
    values.push(queueName);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM scheduled_job_definitions
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
    `,
    values
  );

  return rows;
};

const updateDefinitionStatus = async ({
  tenantId,
  definitionId,
  status,
  updatedBy,
}) => {
  await db.query(
    `
      UPDATE scheduled_job_definitions
      SET
        status = ?,
        updated_by = ?
      WHERE id = ?
        AND (
          tenant_id = ?
          OR tenant_id IS NULL
        )
    `,
    [
      status,
      updatedBy,
      definitionId,
      tenantId,
    ]
  );

  return findDefinitionById({
    tenantId,
    definitionId,
    includeGlobal: true,
  });
};

const markEnqueued = ({
  definitionId,
  nextRunAt,
}) =>
  db.query(
    `
      UPDATE scheduled_job_definitions
      SET
        last_enqueued_at = NOW(),
        next_run_at = ?
      WHERE id = ?
    `,
    [
      nextRunAt || null,
      definitionId,
    ]
  );

const createRun = async ({
  tenantId,
  definitionId,
  queueJobId,
  jobCode,
  jobName,
  triggerType,
  payload,
  triggeredBy,
  correlationId,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO scheduled_job_runs (
        id,
        tenant_id,
        job_definition_id,
        queue_job_id,
        job_code,
        job_name,
        trigger_type,
        payload,
        triggered_by,
        correlation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId || null,
      definitionId || null,
      queueJobId || null,
      jobCode,
      jobName,
      triggerType,
      payload
        ? JSON.stringify(payload)
        : null,
      triggeredBy || null,
      correlationId || null,
    ]
  );

  return id;
};

const markRunProcessing = ({
  runId,
  attemptNumber,
}) =>
  db.query(
    `
      UPDATE scheduled_job_runs
      SET
        status = 'processing',
        attempt_number = ?,
        started_at = NOW()
      WHERE id = ?
    `,
    [
      attemptNumber,
      runId,
    ]
  );

const markRunCompleted = ({
  runId,
  result,
  durationMs,
}) =>
  db.query(
    `
      UPDATE scheduled_job_runs
      SET
        status = 'completed',
        result = ?,
        completed_at = NOW(),
        duration_ms = ?
      WHERE id = ?
    `,
    [
      result
        ? JSON.stringify(result)
        : null,
      durationMs,
      runId,
    ]
  );

const markRunFailed = ({
  runId,
  error,
  durationMs,
  deadLetter,
}) =>
  db.query(
    `
      UPDATE scheduled_job_runs
      SET
        status = ?,
        error_message = ?,
        error_stack = ?,
        completed_at = NOW(),
        duration_ms = ?
      WHERE id = ?
    `,
    [
      deadLetter
        ? "dead_letter"
        : "failed",
      error.message,
      error.stack || null,
      durationMs,
      runId,
    ]
  );

const createDeadLetter = ({
  tenantId,
  runId,
  jobCode,
  payload,
  error,
  retryCount,
}) =>
  db.query(
    `
      INSERT INTO scheduled_job_dead_letters (
        id,
        tenant_id,
        scheduled_job_run_id,
        job_code,
        payload,
        failure_reason,
        failure_stack,
        retry_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId || null,
      runId,
      jobCode,
      payload
        ? JSON.stringify(payload)
        : null,
      error.message,
      error.stack || null,
      retryCount,
    ]
  );

const listRuns = async ({
  tenantId,
  status,
  jobCode,
  limit,
  offset,
}) => {
  const conditions = [
    "(tenant_id = ? OR tenant_id IS NULL)",
  ];
  const values = [tenantId];

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (jobCode) {
    conditions.push("job_code = ?");
    values.push(jobCode);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM scheduled_job_runs
      WHERE ${conditions.join(" AND ")}
      ORDER BY queued_at DESC
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

const acquireLock = async ({
  lockKey,
  ownerId,
  ttlSeconds,
}) => {
  await db.query(
    `
      DELETE FROM scheduled_job_locks
      WHERE expires_at <= NOW()
    `
  );

  try {
    await db.query(
      `
        INSERT INTO scheduled_job_locks (
          lock_key,
          owner_id,
          expires_at
        ) VALUES (
          ?,
          ?,
          DATE_ADD(
            NOW(),
            INTERVAL ? SECOND
          )
        )
      `,
      [
        lockKey,
        ownerId,
        ttlSeconds,
      ]
    );

    return true;
  } catch (error) {
    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return false;
    }

    throw error;
  }
};

const releaseLock = ({
  lockKey,
  ownerId,
}) =>
  db.query(
    `
      DELETE FROM scheduled_job_locks
      WHERE lock_key = ?
        AND owner_id = ?
    `,
    [
      lockKey,
      ownerId,
    ]
  );

const cleanupExpiredLocks = async () => {
  const [result] =
    await db.query(
      `
        DELETE FROM scheduled_job_locks
        WHERE expires_at <= NOW()
      `
    );

  return result.affectedRows;
};

module.exports = {
  createDefinition,
  findDefinitionById,
  listDefinitions,
  updateDefinitionStatus,
  markEnqueued,
  createRun,
  markRunProcessing,
  markRunCompleted,
  markRunFailed,
  createDeadLetter,
  listRuns,
  acquireLock,
  releaseLock,
  cleanupExpiredLocks,
};
