const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createThirdParty = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO third_parties (
        id,
        tenant_id,
        third_party_code,
        legal_name,
        trading_name,
        third_party_type,
        country_code,
        registration_number,
        tax_identifier,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
        status,
        criticality,
        service_owner_user_id,
        risk_owner_user_id,
        start_date,
        end_date,
        metadata,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.thirdPartyCode,
      body.legalName,
      body.tradingName || null,
      body.thirdPartyType,
      body.countryCode || null,
      body.registrationNumber || null,
      body.taxIdentifier || null,
      body.primaryContactName || null,
      body.primaryContactEmail || null,
      body.primaryContactPhone || null,
      body.status,
      body.criticality,
      body.serviceOwnerUserId,
      body.riskOwnerUserId || null,
      body.startDate || null,
      body.endDate || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
      createdBy,
    ]
  );

  return findThirdPartyById({
    tenantId,
    thirdPartyId: id,
  });
};

const findThirdPartyById = async ({
  tenantId,
  thirdPartyId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM third_parties
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, thirdPartyId]
  );

  return rows[0] || null;
};

const updateThirdPartyStatus = async ({
  tenantId,
  thirdPartyId,
  status,
  approvedBy,
}) => {
  await db.query(
    `
      UPDATE third_parties
      SET
        status = ?,
        approved_by = CASE
          WHEN ? = 'approved'
          THEN ?
          ELSE approved_by
        END,
        approved_at = CASE
          WHEN ? = 'approved'
          THEN NOW()
          ELSE approved_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      status,
      status,
      approvedBy || null,
      status,
      tenantId,
      thirdPartyId,
    ]
  );

  return findThirdPartyById({
    tenantId,
    thirdPartyId,
  });
};

const createService = async ({
  tenantId,
  thirdPartyId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO third_party_services (
        id,
        tenant_id,
        third_party_id,
        service_code,
        service_name,
        description,
        service_category,
        supports_critical_business_service,
        critical_business_service_id,
        data_access_level,
        personal_data_processed,
        payment_data_processed,
        service_locations,
        subcontracting_allowed,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      thirdPartyId,
      body.serviceCode,
      body.serviceName,
      body.description || null,
      body.serviceCategory,
      body.supportsCriticalBusinessService,
      body.criticalBusinessServiceId || null,
      body.dataAccessLevel,
      body.personalDataProcessed,
      body.paymentDataProcessed,
      body.serviceLocations
        ? JSON.stringify(body.serviceLocations)
        : null,
      body.subcontractingAllowed,
      body.status,
    ]
  );

  return findServiceById({
    tenantId,
    serviceId: id,
  });
};

const findServiceById = async ({
  tenantId,
  serviceId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM third_party_services
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, serviceId]
  );

  return rows[0] || null;
};

const createDueDiligence = async ({
  tenantId,
  thirdPartyId,
  body,
  assessorUserId,
}) => {
  const id = randomUUID();
  const reference =
    `TPD-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO third_party_due_diligence (
        id,
        tenant_id,
        third_party_id,
        assessment_reference,
        assessment_type,
        scope,
        status,
        assessor_user_id,
        started_at,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `,
    [
      id,
      tenantId,
      thirdPartyId,
      reference,
      body.assessmentType,
      JSON.stringify(body.scope),
      body.status,
      assessorUserId,
      body.expiresAt || null,
    ]
  );

  return findDueDiligenceById({
    tenantId,
    assessmentId: id,
  });
};

const findDueDiligenceById = async ({
  tenantId,
  assessmentId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM third_party_due_diligence
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, assessmentId]
  );

  return rows[0] || null;
};

const completeDueDiligence = async ({
  tenantId,
  assessmentId,
  body,
}) => {
  await db.query(
    `
      UPDATE third_party_due_diligence
      SET
        inherent_risk_score = ?,
        control_effectiveness_score = ?,
        residual_risk_score = ?,
        risk_rating = ?,
        status = 'ready_for_review',
        completed_at = NOW(),
        summary = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status IN (
          'draft',
          'in_progress',
          'awaiting_evidence'
        )
    `,
    [
      body.inherentRiskScore,
      body.controlEffectivenessScore,
      body.residualRiskScore,
      body.riskRating,
      body.summary || null,
      tenantId,
      assessmentId,
    ]
  );

  return findDueDiligenceById({
    tenantId,
    assessmentId,
  });
};

const approveDueDiligence = async ({
  tenantId,
  assessmentId,
  reviewerUserId,
  approved,
  rejectionReason,
}) => {
  await db.query(
    `
      UPDATE third_party_due_diligence
      SET
        status = ?,
        reviewer_user_id = ?,
        rejection_reason = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'ready_for_review'
    `,
    [
      approved ? "approved" : "rejected",
      reviewerUserId,
      approved ? null : rejectionReason,
      tenantId,
      assessmentId,
    ]
  );

  return findDueDiligenceById({
    tenantId,
    assessmentId,
  });
};

const createContract = async ({
  tenantId,
  thirdPartyId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO third_party_contracts (
        id,
        tenant_id,
        third_party_id,
        contract_reference,
        contract_name,
        contract_type,
        effective_from,
        effective_to,
        renewal_date,
        auto_renew,
        notice_period_days,
        total_contract_value,
        currency,
        governing_law,
        termination_rights,
        audit_rights,
        data_return_deletion_terms,
        business_continuity_requirements,
        contract_storage_key,
        contract_hash,
        status,
        owner_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      thirdPartyId,
      body.contractReference,
      body.contractName,
      body.contractType,
      body.effectiveFrom,
      body.effectiveTo || null,
      body.renewalDate || null,
      body.autoRenew,
      body.noticePeriodDays ?? null,
      body.totalContractValue ?? null,
      body.currency || null,
      body.governingLaw || null,
      body.terminationRights || null,
      body.auditRights || null,
      body.dataReturnDeletionTerms || null,
      body.businessContinuityRequirements || null,
      body.contractStorageKey || null,
      body.contractHash || null,
      body.status,
      body.ownerUserId,
    ]
  );

  return findContractById({
    tenantId,
    contractId: id,
  });
};

const findContractById = async ({
  tenantId,
  contractId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM third_party_contracts
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, contractId]
  );

  return rows[0] || null;
};

const createSla = async ({
  tenantId,
  serviceId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO third_party_slas (
        id,
        tenant_id,
        third_party_service_id,
        sla_code,
        metric_name,
        metric_type,
        target_value,
        comparison_operator,
        unit,
        measurement_window,
        breach_severity,
        service_credit_terms,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      serviceId,
      body.slaCode,
      body.metricName,
      body.metricType,
      body.targetValue,
      body.comparisonOperator,
      body.unit,
      body.measurementWindow,
      body.breachSeverity,
      body.serviceCreditTerms || null,
      body.status,
    ]
  );

  return findSlaById({
    tenantId,
    slaId: id,
  });
};

const findSlaById = async ({
  tenantId,
  slaId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM third_party_slas
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, slaId]
  );

  return rows[0] || null;
};

const recordSlaMeasurement = async ({
  tenantId,
  sla,
  body,
  recordedBy,
}) => {
  const id = randomUUID();
  const reference =
    `SLM-${Date.now()}-${id.slice(0, 8)}`;

  const compliant =
    sla.comparison_operator === "gte"
      ? Number(body.measuredValue) >= Number(sla.target_value)
      : sla.comparison_operator === "lte"
        ? Number(body.measuredValue) <= Number(sla.target_value)
        : Number(body.measuredValue) === Number(sla.target_value);

  await db.query(
    `
      INSERT INTO third_party_sla_measurements (
        id,
        tenant_id,
        sla_id,
        measurement_reference,
        period_start,
        period_end,
        measured_value,
        compliant,
        breach_minutes,
        evidence_storage_key,
        recorded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      sla.id,
      reference,
      body.periodStart,
      body.periodEnd,
      body.measuredValue,
      compliant,
      body.breachMinutes ?? null,
      body.evidenceStorageKey || null,
      recordedBy,
    ]
  );

  return {
    id,
    measurementReference: reference,
    compliant,
  };
};

const createRiskIssue = async ({
  tenantId,
  thirdPartyId,
  body,
  ownerUserId,
}) => {
  const id = randomUUID();
  const reference =
    `TPI-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO third_party_risk_issues (
        id,
        tenant_id,
        third_party_id,
        due_diligence_id,
        issue_reference,
        title,
        description,
        category,
        severity,
        status,
        remediation_plan,
        owner_user_id,
        due_at,
        risk_acceptance_reference,
        evidence_storage_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      thirdPartyId,
      body.dueDiligenceId || null,
      reference,
      body.title,
      body.description,
      body.category,
      body.severity,
      body.status,
      body.remediationPlan || null,
      ownerUserId,
      body.dueAt || null,
      body.riskAcceptanceReference || null,
      body.evidenceStorageKey || null,
    ]
  );

  return findRiskIssueById({
    tenantId,
    issueId: id,
  });
};

const findRiskIssueById = async ({
  tenantId,
  issueId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM third_party_risk_issues
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, issueId]
  );

  return rows[0] || null;
};

const createExitPlan = async ({
  tenantId,
  thirdPartyId,
  body,
  createdBy,
}) => {
  const id = randomUUID();
  const reference =
    `TPE-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO third_party_exit_plans (
        id,
        tenant_id,
        third_party_id,
        plan_reference,
        plan_name,
        exit_triggers,
        replacement_strategy,
        transition_steps,
        data_return_strategy,
        data_deletion_verification,
        continuity_arrangements,
        estimated_exit_days,
        estimated_exit_cost,
        currency,
        next_test_due_at,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      thirdPartyId,
      reference,
      body.planName,
      JSON.stringify(body.exitTriggers),
      body.replacementStrategy,
      JSON.stringify(body.transitionSteps),
      body.dataReturnStrategy || null,
      body.dataDeletionVerification || null,
      body.continuityArrangements || null,
      body.estimatedExitDays ?? null,
      body.estimatedExitCost ?? null,
      body.currency || null,
      body.nextTestDueAt || null,
      body.status,
      createdBy,
    ]
  );

  return findExitPlanById({
    tenantId,
    exitPlanId: id,
  });
};

const findExitPlanById = async ({
  tenantId,
  exitPlanId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM third_party_exit_plans
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, exitPlanId]
  );

  return rows[0] || null;
};

module.exports = {
  createThirdParty,
  findThirdPartyById,
  updateThirdPartyStatus,
  createService,
  findServiceById,
  createDueDiligence,
  findDueDiligenceById,
  completeDueDiligence,
  approveDueDiligence,
  createContract,
  findContractById,
  createSla,
  findSlaById,
  recordSlaMeasurement,
  createRiskIssue,
  findRiskIssueById,
  createExitPlan,
  findExitPlanById,
};
