const { randomUUID } = require("crypto");
const db = require("../../config/db");

const upsertRiskProfile = async ({
  tenantId,
  userId,
  body,
  reviewedBy,
}) => {
  await db.query(
    `
      INSERT INTO customer_risk_profiles (
        id,
        tenant_id,
        user_id,
        risk_score,
        risk_level,
        customer_type,
        occupation,
        industry,
        expected_monthly_volume,
        expected_monthly_count,
        country_of_residence,
        nationality,
        pep_status,
        sanctions_status,
        source_of_funds,
        source_of_wealth,
        last_reviewed_at,
        next_review_at,
        reviewed_by,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        risk_score = VALUES(risk_score),
        risk_level = VALUES(risk_level),
        customer_type = VALUES(customer_type),
        occupation = VALUES(occupation),
        industry = VALUES(industry),
        expected_monthly_volume = VALUES(expected_monthly_volume),
        expected_monthly_count = VALUES(expected_monthly_count),
        country_of_residence = VALUES(country_of_residence),
        nationality = VALUES(nationality),
        pep_status = VALUES(pep_status),
        sanctions_status = VALUES(sanctions_status),
        source_of_funds = VALUES(source_of_funds),
        source_of_wealth = VALUES(source_of_wealth),
        last_reviewed_at = NOW(),
        next_review_at = VALUES(next_review_at),
        reviewed_by = VALUES(reviewed_by),
        metadata = VALUES(metadata)
    `,
    [
      randomUUID(),
      tenantId,
      userId,
      body.riskScore,
      body.riskLevel,
      body.customerType,
      body.occupation || null,
      body.industry || null,
      body.expectedMonthlyVolume ?? null,
      body.expectedMonthlyCount ?? null,
      body.countryOfResidence || null,
      body.nationality || null,
      body.pepStatus,
      body.sanctionsStatus,
      body.sourceOfFunds || null,
      body.sourceOfWealth || null,
      body.nextReviewAt || null,
      reviewedBy,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findRiskProfile({
    tenantId,
    userId,
  });
};

const findRiskProfile = async ({
  tenantId,
  userId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM customer_risk_profiles
      WHERE tenant_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [tenantId, userId]
  );

  return rows[0] || null;
};

const findScreeningByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM compliance_screenings
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const searchWatchlistEntries = async ({
  subjectName,
  limit,
}) => {
  const tokens =
    subjectName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const conditions = [];
  const values = [];

  for (const token of tokens) {
    conditions.push(
      "LOWER(primary_name) LIKE ?"
    );
    values.push(
      `%${token.toLowerCase()}%`
    );
  }

  if (!conditions.length) {
    return [];
  }

  const [rows] = await db.query(
    `
      SELECT
        e.*,
        w.list_type,
        w.name AS watchlist_name,
        w.source AS watchlist_source
      FROM compliance_watchlist_entries e
      INNER JOIN compliance_watchlists w
        ON w.id = e.watchlist_id
      WHERE e.status = 'active'
        AND w.status = 'active'
        AND (
          ${conditions.join(" OR ")}
        )
      ORDER BY e.primary_name ASC
      LIMIT ?
    `,
    [
      ...values,
      limit,
    ]
  );

  return rows;
};

const createScreening = async ({
  tenantId,
  userId,
  body,
  status,
  highestMatchScore,
  matchCount,
  screenedBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO compliance_screenings (
        id,
        tenant_id,
        user_id,
        screening_type,
        subject_name,
        date_of_birth,
        country_code,
        identification_number,
        idempotency_key,
        status,
        highest_match_score,
        match_count,
        screened_by,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId || null,
      body.screeningType,
      body.subjectName,
      body.dateOfBirth || null,
      body.countryCode || null,
      body.identificationNumber || null,
      body.idempotencyKey,
      status,
      highestMatchScore,
      matchCount,
      screenedBy || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return id;
};

const createScreeningMatch = ({
  tenantId,
  screeningId,
  match,
}) =>
  db.query(
    `
      INSERT INTO compliance_screening_matches (
        id,
        tenant_id,
        screening_id,
        watchlist_entry_id,
        name_match_score,
        date_of_birth_match,
        country_match,
        identification_match,
        overall_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      screeningId,
      match.watchlistEntryId,
      match.nameMatchScore,
      match.dateOfBirthMatch,
      match.countryMatch,
      match.identificationMatch,
      match.overallScore,
    ]
  );

const findScreeningById = async ({
  tenantId,
  screeningId,
}) => {
  const [screenings] = await db.query(
    `
      SELECT *
      FROM compliance_screenings
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, screeningId]
  );

  if (!screenings[0]) {
    return null;
  }

  const [matches] = await db.query(
    `
      SELECT
        m.*,
        e.primary_name,
        e.aliases,
        e.source_reference,
        w.name AS watchlist_name,
        w.source AS watchlist_source,
        w.list_type
      FROM compliance_screening_matches m
      INNER JOIN compliance_watchlist_entries e
        ON e.id = m.watchlist_entry_id
      INNER JOIN compliance_watchlists w
        ON w.id = e.watchlist_id
      WHERE m.tenant_id = ?
        AND m.screening_id = ?
      ORDER BY m.overall_score DESC
    `,
    [tenantId, screeningId]
  );

  return {
    screening: screenings[0],
    matches,
  };
};

const createMonitoringRule = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO transaction_monitoring_rules (
        id,
        tenant_id,
        code,
        name,
        description,
        event_type,
        rule_type,
        configuration,
        severity,
        score,
        priority,
        status,
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
      body.ruleType,
      JSON.stringify(body.configuration),
      body.severity,
      body.score,
      body.priority,
      body.status,
      createdBy,
    ]
  );

  return findMonitoringRuleById({
    tenantId,
    ruleId: id,
  });
};

const findMonitoringRuleById = async ({
  tenantId,
  ruleId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM transaction_monitoring_rules
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, ruleId]
  );

  return rows[0] || null;
};

const findActiveMonitoringRules = async ({
  tenantId,
  eventType,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM transaction_monitoring_rules
      WHERE tenant_id = ?
        AND event_type = ?
        AND status = 'active'
      ORDER BY priority ASC, created_at ASC
    `,
    [tenantId, eventType]
  );

  return rows;
};

const countRecentTransactions = async ({
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

const sumRecentTransactions = async ({
  tenantId,
  userId,
  eventType,
  hours,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS total
      FROM risk_events
      WHERE tenant_id = ?
        AND user_id = ?
        AND event_type = ?
        AND created_at >=
          DATE_SUB(
            NOW(),
            INTERVAL ? HOUR
          )
    `,
    [
      tenantId,
      userId,
      eventType,
      hours,
    ]
  );

  return Number(rows[0].total);
};

const createAlert = async ({
  tenantId,
  userId,
  sourceType,
  sourceId,
  alertType,
  severity,
  score,
  title,
  description,
  matchedRules,
  evidence,
}) => {
  const id = randomUUID();
  const reference =
    `AML-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO compliance_alerts (
        id,
        tenant_id,
        user_id,
        source_type,
        source_id,
        alert_reference,
        alert_type,
        severity,
        score,
        title,
        description,
        matched_rules,
        evidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId || null,
      sourceType,
      sourceId || null,
      reference,
      alertType,
      severity,
      score,
      title,
      description || null,
      matchedRules
        ? JSON.stringify(matchedRules)
        : null,
      evidence
        ? JSON.stringify(evidence)
        : null,
    ]
  );

  return findAlertById({
    tenantId,
    alertId: id,
  });
};

const findAlertById = async ({
  tenantId,
  alertId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM compliance_alerts
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, alertId]
  );

  return rows[0] || null;
};

const listAlerts = async ({
  tenantId,
  status,
  severity,
  limit,
  offset,
}) => {
  const conditions = ["tenant_id = ?"];
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
      FROM compliance_alerts
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

const updateAlert = async ({
  tenantId,
  alertId,
  body,
}) => {
  await db.query(
    `
      UPDATE compliance_alerts
      SET
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        resolution_note = COALESCE(?, resolution_note)
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.status ?? null,
      body.assignedTo ?? null,
      body.resolutionNote ?? null,
      tenantId,
      alertId,
    ]
  );

  return findAlertById({
    tenantId,
    alertId,
  });
};

const createCase = async ({
  tenantId,
  userId,
  body,
  createdBy,
}) => {
  const id = randomUUID();
  const reference =
    `CASE-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO compliance_cases (
        id,
        tenant_id,
        user_id,
        case_reference,
        title,
        description,
        priority,
        assigned_to,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId || null,
      reference,
      body.title,
      body.description || null,
      body.priority,
      body.assignedTo || null,
      createdBy,
    ]
  );

  for (
    const alertId
    of body.alertIds
  ) {
    await db.query(
      `
        INSERT INTO compliance_case_alerts (
          compliance_case_id,
          compliance_alert_id,
          linked_by
        ) VALUES (?, ?, ?)
      `,
      [
        id,
        alertId,
        createdBy,
      ]
    );
  }

  return findCaseById({
    tenantId,
    caseId: id,
  });
};

const findCaseById = async ({
  tenantId,
  caseId,
}) => {
  const [cases] = await db.query(
    `
      SELECT *
      FROM compliance_cases
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, caseId]
  );

  if (!cases[0]) {
    return null;
  }

  const [alerts] = await db.query(
    `
      SELECT a.*
      FROM compliance_alerts a
      INNER JOIN compliance_case_alerts ca
        ON ca.compliance_alert_id = a.id
      WHERE ca.compliance_case_id = ?
      ORDER BY a.created_at ASC
    `,
    [caseId]
  );

  return {
    case: cases[0],
    alerts,
  };
};

const updateCase = async ({
  tenantId,
  caseId,
  body,
  actorUserId,
}) => {
  await db.query(
    `
      UPDATE compliance_cases
      SET
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        assigned_to = COALESCE(?, assigned_to),
        decision = COALESCE(?, decision),
        decision_reason = COALESCE(?, decision_reason),
        closed_by = CASE
          WHEN ? = 'closed'
          THEN ?
          ELSE closed_by
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
      body.decision ?? null,
      body.decisionReason ?? null,
      body.status ?? null,
      actorUserId,
      body.status ?? null,
      tenantId,
      caseId,
    ]
  );

  return findCaseById({
    tenantId,
    caseId,
  });
};

const createSar = async ({
  tenantId,
  caseId,
  body,
  preparedBy,
}) => {
  const id = randomUUID();
  const reference =
    `SAR-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO suspicious_activity_reports (
        id,
        tenant_id,
        compliance_case_id,
        report_reference,
        jurisdiction,
        report_type,
        narrative,
        subject_details,
        transaction_summary,
        supporting_evidence,
        prepared_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      caseId,
      reference,
      body.jurisdiction,
      body.reportType,
      body.narrative,
      JSON.stringify(
        body.subjectDetails
      ),
      body.transactionSummary
        ? JSON.stringify(
            body.transactionSummary
          )
        : null,
      body.supportingEvidence
        ? JSON.stringify(
            body.supportingEvidence
          )
        : null,
      preparedBy,
    ]
  );

  const [rows] = await db.query(
    `
      SELECT *
      FROM suspicious_activity_reports
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, id]
  );

  return rows[0];
};

module.exports = {
  upsertRiskProfile,
  findRiskProfile,
  findScreeningByIdempotency,
  searchWatchlistEntries,
  createScreening,
  createScreeningMatch,
  findScreeningById,
  createMonitoringRule,
  findMonitoringRuleById,
  findActiveMonitoringRules,
  countRecentTransactions,
  sumRecentTransactions,
  createAlert,
  findAlertById,
  listAlerts,
  updateAlert,
  createCase,
  findCaseById,
  updateCase,
  createSar,
};
