const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createPurpose = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO privacy_purposes (
        id,
        tenant_id,
        purpose_code,
        purpose_name,
        description,
        lawful_basis,
        data_categories,
        processing_activities,
        retention_policy_id,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.purposeCode,
      body.purposeName,
      body.description || null,
      body.lawfulBasis,
      JSON.stringify(body.dataCategories),
      JSON.stringify(body.processingActivities),
      body.retentionPolicyId || null,
      body.status,
      createdBy,
    ]
  );

  return findPurposeById({
    tenantId,
    purposeId: id,
  });
};

const findPurposeById = async ({
  tenantId,
  purposeId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM privacy_purposes
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, purposeId]
  );

  return rows[0] || null;
};

const findActiveConsent = async ({
  tenantId,
  userId,
  purposeId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM customer_privacy_consents
      WHERE tenant_id = ?
        AND user_id = ?
        AND privacy_purpose_id = ?
        AND status = 'granted'
        AND (
          expires_at IS NULL
          OR expires_at > NOW()
        )
      ORDER BY granted_at DESC
      LIMIT 1
    `,
    [tenantId, userId, purposeId]
  );

  return rows[0] || null;
};

const createConsent = async ({
  tenantId,
  userId,
  body,
}) => {
  const id = randomUUID();
  const reference =
    `PVC-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO customer_privacy_consents (
        id,
        tenant_id,
        user_id,
        privacy_purpose_id,
        consent_reference,
        status,
        consent_version,
        consent_text_hash,
        collection_channel,
        ip_address,
        user_agent,
        granted_at,
        expires_at,
        evidence_storage_key,
        metadata
      ) VALUES (?, ?, ?, ?, ?, 'granted', ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      body.privacyPurposeId,
      reference,
      body.consentVersion,
      body.consentTextHash,
      body.collectionChannel,
      body.ipAddress || null,
      body.userAgent || null,
      body.expiresAt || null,
      body.evidenceStorageKey || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findConsentById({
    tenantId,
    consentId: id,
  });
};

const findConsentById = async ({
  tenantId,
  consentId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM customer_privacy_consents
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, consentId]
  );

  return rows[0] || null;
};

const withdrawConsent = async ({
  tenantId,
  consentId,
  reason,
}) => {
  await db.query(
    `
      UPDATE customer_privacy_consents
      SET
        status = 'withdrawn',
        withdrawn_at = NOW(),
        withdrawal_reason = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'granted'
    `,
    [reason || null, tenantId, consentId]
  );

  return findConsentById({
    tenantId,
    consentId,
  });
};

const createDataSubjectRequest = async ({
  tenantId,
  userId,
  body,
  dueAt,
}) => {
  const id = randomUUID();
  const reference =
    `DSR-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO data_subject_requests (
        id,
        tenant_id,
        user_id,
        request_reference,
        request_type,
        request_channel,
        request_details,
        due_at,
        assigned_to,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId || null,
      reference,
      body.requestType,
      body.requestChannel,
      body.requestDetails || null,
      dueAt,
      body.assignedTo || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findDataSubjectRequestById({
    tenantId,
    requestId: id,
  });
};

const findDataSubjectRequestById = async ({
  tenantId,
  requestId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM data_subject_requests
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, requestId]
  );

  return rows[0] || null;
};

const updateRequestStatus = async ({
  tenantId,
  requestId,
  status,
  approvedBy,
  rejectionReason,
}) => {
  await db.query(
    `
      UPDATE data_subject_requests
      SET
        status = ?,
        approved_by =
          COALESCE(?, approved_by),
        rejection_reason =
          COALESCE(?, rejection_reason),
        completed_at = CASE
          WHEN ? = 'completed'
          THEN NOW()
          ELSE completed_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      status,
      approvedBy || null,
      rejectionReason || null,
      status,
      tenantId,
      requestId,
    ]
  );

  return findDataSubjectRequestById({
    tenantId,
    requestId,
  });
};

const createRequestTasks = async ({
  tenantId,
  requestId,
  tasks,
}) => {
  for (const task of tasks) {
    await db.query(
      `
        INSERT INTO data_subject_request_tasks (
          id,
          tenant_id,
          data_subject_request_id,
          system_name,
          task_type,
          source_reference,
          assigned_to
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        tenantId,
        requestId,
        task.systemName,
        task.taskType,
        task.sourceReference || null,
        task.assignedTo || null,
      ]
    );
  }

  return listRequestTasks({
    tenantId,
    requestId,
  });
};

const listRequestTasks = async ({
  tenantId,
  requestId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM data_subject_request_tasks
      WHERE tenant_id = ?
        AND data_subject_request_id = ?
      ORDER BY created_at ASC
    `,
    [tenantId, requestId]
  );

  return rows;
};

const createRetentionPolicy = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO data_retention_policies (
        id,
        tenant_id,
        policy_code,
        policy_name,
        data_category,
        source_system,
        source_table,
        retention_period_days,
        disposition_action,
        trigger_event,
        trigger_field,
        legal_basis,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.policyCode,
      body.policyName,
      body.dataCategory,
      body.sourceSystem,
      body.sourceTable || null,
      body.retentionPeriodDays,
      body.dispositionAction,
      body.triggerEvent,
      body.triggerField || null,
      body.legalBasis || null,
      body.status,
      createdBy,
    ]
  );

  return findRetentionPolicyById({
    tenantId,
    policyId: id,
  });
};

const findRetentionPolicyById = async ({
  tenantId,
  policyId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM data_retention_policies
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, policyId]
  );

  return rows[0] || null;
};

const createRetentionRun = async ({
  tenantId,
  policyId,
  cutoffAt,
  makerUserId,
}) => {
  const id = randomUUID();
  const reference =
    `RET-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO retention_execution_runs (
        id,
        tenant_id,
        retention_policy_id,
        run_reference,
        cutoff_at,
        maker_user_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      policyId,
      reference,
      cutoffAt,
      makerUserId,
    ]
  );

  return findRetentionRunById({
    tenantId,
    runId: id,
  });
};

const findRetentionRunById = async ({
  tenantId,
  runId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM retention_execution_runs
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, runId]
  );

  return rows[0] || null;
};

const approveRetentionRun = async ({
  tenantId,
  runId,
  checkerUserId,
}) => {
  await db.query(
    `
      UPDATE retention_execution_runs
      SET
        status = 'approved',
        checker_user_id = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'awaiting_approval'
    `,
    [checkerUserId, tenantId, runId]
  );

  return findRetentionRunById({
    tenantId,
    runId,
  });
};

const createLegalHold = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();
  const reference =
    `HLD-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO privacy_legal_holds (
        id,
        tenant_id,
        hold_reference,
        name,
        reason,
        scope_type,
        scope_reference,
        effective_at,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      reference,
      body.name,
      body.reason,
      body.scopeType,
      body.scopeReference,
      body.effectiveAt,
      createdBy,
    ]
  );

  return findLegalHoldById({
    tenantId,
    holdId: id,
  });
};

const findLegalHoldById = async ({
  tenantId,
  holdId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM privacy_legal_holds
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, holdId]
  );

  return rows[0] || null;
};

const releaseLegalHold = async ({
  tenantId,
  holdId,
  releasedBy,
}) => {
  await db.query(
    `
      UPDATE privacy_legal_holds
      SET
        status = 'released',
        released_at = NOW(),
        released_by = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'active'
    `,
    [releasedBy, tenantId, holdId]
  );

  return findLegalHoldById({
    tenantId,
    holdId,
  });
};

const createIncident = async ({
  tenantId,
  body,
  ownerUserId,
}) => {
  const id = randomUUID();
  const reference =
    `PVI-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO privacy_incidents (
        id,
        tenant_id,
        incident_reference,
        title,
        description,
        severity,
        incident_type,
        affected_record_count,
        affected_user_count,
        data_categories,
        discovered_at,
        regulator_notification_required,
        customer_notification_required,
        owner_user_id,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      reference,
      body.title,
      body.description,
      body.severity,
      body.incidentType,
      body.affectedRecordCount ?? null,
      body.affectedUserCount ?? null,
      body.dataCategories
        ? JSON.stringify(body.dataCategories)
        : null,
      body.discoveredAt,
      body.regulatorNotificationRequired,
      body.customerNotificationRequired,
      ownerUserId,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findIncidentById({
    tenantId,
    incidentId: id,
  });
};

const findIncidentById = async ({
  tenantId,
  incidentId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM privacy_incidents
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, incidentId]
  );

  return rows[0] || null;
};

module.exports = {
  createPurpose,
  findPurposeById,
  findActiveConsent,
  createConsent,
  findConsentById,
  withdrawConsent,
  createDataSubjectRequest,
  findDataSubjectRequestById,
  updateRequestStatus,
  createRequestTasks,
  listRequestTasks,
  createRetentionPolicy,
  findRetentionPolicyById,
  createRetentionRun,
  findRetentionRunById,
  approveRetentionRun,
  createLegalHold,
  findLegalHoldById,
  releaseLegalHold,
  createIncident,
  findIncidentById,
};
