const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createRule = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO risk_rules (
        id,
        tenant_id,
        code,
        name,
        description,
        event_type,
        condition_type,
        configuration,
        score,
        decision,
        status,
        priority,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.description || null,
      body.eventType,
      body.conditionType,
      JSON.stringify(body.configuration),
      body.score,
      body.decision || null,
      body.status,
      body.priority,
      createdBy,
    ]
  );

  return findRuleById({
    tenantId,
    ruleId: id,
  });
};

const findRuleById = async ({
  tenantId,
  ruleId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM risk_rules
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, ruleId]
  );

  return rows[0] || null;
};

const listRules = async ({
  tenantId,
  eventType,
  status,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];
  const values = [tenantId];

  if (eventType) {
    conditions.push(
      "event_type = ?"
    );
    values.push(eventType);
  }

  if (status) {
    conditions.push(
      "status = ?"
    );
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM risk_rules
      WHERE ${conditions.join(" AND ")}
      ORDER BY priority ASC, created_at ASC
    `,
    values
  );

  return rows;
};

const updateRule = async ({
  tenantId,
  ruleId,
  body,
  updatedBy,
}) => {
  await db.query(
    `
      UPDATE risk_rules
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        configuration = COALESCE(?, configuration),
        score = COALESCE(?, score),
        decision = COALESCE(?, decision),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        updated_by = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.name ?? null,
      body.description ?? null,
      body.configuration
        ? JSON.stringify(body.configuration)
        : null,
      body.score ?? null,
      body.decision ?? null,
      body.status ?? null,
      body.priority ?? null,
      updatedBy,
      tenantId,
      ruleId,
    ]
  );

  return findRuleById({
    tenantId,
    ruleId,
  });
};

const findActiveRules = async ({
  tenantId,
  eventType,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM risk_rules
      WHERE tenant_id = ?
        AND event_type = ?
        AND status = 'active'
      ORDER BY priority ASC, created_at ASC
    `,
    [tenantId, eventType]
  );

  return rows;
};

const findEvaluationByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM risk_evaluations
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const createRiskEvent = async ({
  connection = db,
  tenantId,
  userId,
  body,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO risk_events (
        id,
        tenant_id,
        user_id,
        event_type,
        source_type,
        source_id,
        amount,
        currency,
        ip_address,
        country_code,
        device_fingerprint,
        payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId || null,
      body.eventType,
      body.sourceType || null,
      body.sourceId || null,
      body.amount ?? null,
      body.currency || null,
      body.ipAddress || null,
      body.countryCode || null,
      body.deviceFingerprint || null,
      body.payload
        ? JSON.stringify(body.payload)
        : null,
    ]
  );

  return id;
};

const createEvaluation = async ({
  connection = db,
  tenantId,
  userId,
  riskEventId,
  idempotencyKey,
  totalScore,
  riskLevel,
  decision,
  matchedRules,
  explanation,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO risk_evaluations (
        id,
        tenant_id,
        user_id,
        risk_event_id,
        idempotency_key,
        total_score,
        risk_level,
        decision,
        matched_rules,
        explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId || null,
      riskEventId,
      idempotencyKey,
      totalScore,
      riskLevel,
      decision,
      JSON.stringify(matchedRules),
      JSON.stringify(explanation),
    ]
  );

  return id;
};

const findEvaluationById = async ({
  tenantId,
  evaluationId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM risk_evaluations
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, evaluationId]
  );

  return rows[0] || null;
};

const countRecentEvents = async ({
  tenantId,
  userId,
  eventType,
  minutes,
}) => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS count
      FROM risk_events
      WHERE tenant_id = ?
        AND user_id = ?
        AND event_type = ?
        AND created_at >=
          DATE_SUB(
            NOW(),
            INTERVAL ? MINUTE
          )
    `,
    [
      tenantId,
      userId,
      eventType,
      minutes,
    ]
  );

  return Number(rows[0].count);
};

const findDevice = async ({
  tenantId,
  userId,
  fingerprintHash,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM device_fingerprints
      WHERE tenant_id = ?
        AND user_id = ?
        AND fingerprint_hash = ?
      LIMIT 1
    `,
    [
      tenantId,
      userId,
      fingerprintHash,
    ]
  );

  return rows[0] || null;
};

const upsertDevice = async ({
  tenantId,
  userId,
  body,
}) => {
  const existing =
    await findDevice({
      tenantId,
      userId,
      fingerprintHash:
        body.deviceFingerprint,
    });

  if (existing) {
    await db.query(
      `
        UPDATE device_fingerprints
        SET
          device_name = COALESCE(?, device_name),
          device_type = COALESCE(?, device_type),
          operating_system = COALESCE(?, operating_system),
          browser = COALESCE(?, browser),
          last_ip_address = COALESCE(?, last_ip_address),
          last_country = COALESCE(?, last_country),
          last_seen_at = NOW()
        WHERE tenant_id = ?
          AND id = ?
      `,
      [
        body.deviceName || null,
        body.deviceType || null,
        body.operatingSystem || null,
        body.browser || null,
        body.ipAddress || null,
        body.countryCode || null,
        tenantId,
        existing.id,
      ]
    );

    return findDevice({
      tenantId,
      userId,
      fingerprintHash:
        body.deviceFingerprint,
    });
  }

  const id = randomUUID();

  await db.query(
    `
      INSERT INTO device_fingerprints (
        id,
        tenant_id,
        user_id,
        fingerprint_hash,
        device_name,
        device_type,
        operating_system,
        browser,
        first_ip_address,
        last_ip_address,
        first_country,
        last_country,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      body.deviceFingerprint,
      body.deviceName || null,
      body.deviceType || null,
      body.operatingSystem || null,
      body.browser || null,
      body.ipAddress || null,
      body.ipAddress || null,
      body.countryCode || null,
      body.countryCode || null,
      body.deviceMetadata
        ? JSON.stringify(body.deviceMetadata)
        : null,
    ]
  );

  return findDevice({
    tenantId,
    userId,
    fingerprintHash:
      body.deviceFingerprint,
  });
};

const createFraudCase = async ({
  tenantId,
  userId,
  evaluationId,
  severity,
  title,
  description,
}) => {
  const id = randomUUID();
  const caseReference =
    `FRAUD-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO fraud_cases (
        id,
        tenant_id,
        user_id,
        risk_evaluation_id,
        case_reference,
        title,
        description,
        severity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId || null,
      evaluationId,
      caseReference,
      title,
      description || null,
      severity,
    ]
  );

  return findFraudCaseById({
    tenantId,
    caseId: id,
  });
};

const findFraudCaseById = async ({
  tenantId,
  caseId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fraud_cases
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, caseId]
  );

  return rows[0] || null;
};

const listFraudCases = async ({
  tenantId,
  status,
  severity,
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

  if (severity) {
    conditions.push("severity = ?");
    values.push(severity);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM fraud_cases
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

const updateFraudCase = async ({
  tenantId,
  caseId,
  body,
  actorUserId,
}) => {
  await db.query(
    `
      UPDATE fraud_cases
      SET
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        resolution_note = COALESCE(?, resolution_note),
        resolved_by = CASE
          WHEN ? IN ('resolved', 'dismissed')
          THEN ?
          ELSE resolved_by
        END,
        resolved_at = CASE
          WHEN ? IN ('resolved', 'dismissed')
          THEN NOW()
          ELSE resolved_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.status ?? null,
      body.assignedTo ?? null,
      body.resolutionNote ?? null,
      body.status ?? null,
      actorUserId,
      body.status ?? null,
      tenantId,
      caseId,
    ]
  );

  await db.query(
    `
      INSERT INTO fraud_case_events (
        id,
        tenant_id,
        fraud_case_id,
        event_type,
        actor_user_id,
        note,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      caseId,
      "case_updated",
      actorUserId,
      body.resolutionNote || null,
      JSON.stringify({
        status:
          body.status || null,
        assignedTo:
          body.assignedTo || null,
      }),
    ]
  );

  return findFraudCaseById({
    tenantId,
    caseId,
  });
};

module.exports = {
  db,
  createRule,
  findRuleById,
  listRules,
  updateRule,
  findActiveRules,
  findEvaluationByIdempotency,
  createRiskEvent,
  createEvaluation,
  findEvaluationById,
  countRecentEvents,
  findDevice,
  upsertDevice,
  createFraudCase,
  findFraudCaseById,
  listFraudCases,
  updateFraudCase,
};
