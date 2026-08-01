const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createCriticalService = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO critical_business_services (
        id,
        tenant_id,
        service_code,
        service_name,
        description,
        service_owner_user_id,
        executive_owner_user_id,
        criticality,
        customer_impact_description,
        regulatory_impact_description,
        impact_tolerance_minutes,
        recovery_time_objective_minutes,
        recovery_point_objective_minutes,
        minimum_service_level_percentage,
        status,
        next_review_due_at,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.serviceCode,
      body.serviceName,
      body.description || null,
      body.serviceOwnerUserId,
      body.executiveOwnerUserId || null,
      body.criticality,
      body.customerImpactDescription || null,
      body.regulatoryImpactDescription || null,
      body.impactToleranceMinutes,
      body.recoveryTimeObjectiveMinutes,
      body.recoveryPointObjectiveMinutes,
      body.minimumServiceLevelPercentage ?? null,
      body.status,
      body.nextReviewDueAt || null,
      createdBy,
    ]
  );

  return findCriticalServiceById({
    tenantId,
    serviceId: id,
  });
};

const findCriticalServiceById = async ({
  tenantId,
  serviceId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM critical_business_services
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, serviceId]
  );

  return rows[0] || null;
};

const createDependency = async ({
  tenantId,
  serviceId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO service_dependencies (
        id,
        tenant_id,
        critical_business_service_id,
        dependency_type,
        dependency_name,
        dependency_reference,
        internal_owner_user_id,
        third_party_id,
        criticality,
        maximum_tolerable_downtime_minutes,
        recovery_strategy,
        single_point_of_failure,
        alternate_available,
        status,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      serviceId,
      body.dependencyType,
      body.dependencyName,
      body.dependencyReference || null,
      body.internalOwnerUserId || null,
      body.thirdPartyId || null,
      body.criticality,
      body.maximumTolerableDowntimeMinutes ?? null,
      body.recoveryStrategy || null,
      body.singlePointOfFailure,
      body.alternateAvailable,
      body.status,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findDependencyById({
    tenantId,
    dependencyId: id,
  });
};

const findDependencyById = async ({
  tenantId,
  dependencyId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM service_dependencies
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, dependencyId]
  );

  return rows[0] || null;
};

const createIncident = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();
  const reference =
    `INC-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO operational_incidents (
        id,
        tenant_id,
        incident_reference,
        title,
        description,
        incident_type,
        severity,
        status,
        detected_at,
        started_at,
        incident_commander_user_id,
        technical_lead_user_id,
        communications_lead_user_id,
        customer_impact,
        regulatory_impact,
        financial_impact_amount,
        financial_impact_currency,
        affected_customer_count,
        affected_transaction_count,
        regulator_notification_required,
        customer_notification_required,
        metadata,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      reference,
      body.title,
      body.description,
      body.incidentType,
      body.severity,
      body.status,
      body.detectedAt,
      body.startedAt || null,
      body.incidentCommanderUserId || null,
      body.technicalLeadUserId || null,
      body.communicationsLeadUserId || null,
      body.customerImpact,
      body.regulatoryImpact,
      body.financialImpactAmount ?? null,
      body.financialImpactCurrency || null,
      body.affectedCustomerCount ?? null,
      body.affectedTransactionCount ?? null,
      body.regulatorNotificationRequired,
      body.customerNotificationRequired,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
      createdBy,
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
      FROM operational_incidents
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, incidentId]
  );

  return rows[0] || null;
};

const updateIncidentStatus = async ({
  tenantId,
  incidentId,
  status,
  rootCauseCategory,
  rootCauseSummary,
}) => {
  await db.query(
    `
      UPDATE operational_incidents
      SET
        status = ?,
        acknowledged_at = CASE
          WHEN ? = 'triaged'
          THEN COALESCE(acknowledged_at, NOW())
          ELSE acknowledged_at
        END,
        mitigated_at = CASE
          WHEN ? = 'monitoring'
          THEN COALESCE(mitigated_at, NOW())
          ELSE mitigated_at
        END,
        resolved_at = CASE
          WHEN ? = 'resolved'
          THEN COALESCE(resolved_at, NOW())
          ELSE resolved_at
        END,
        closed_at = CASE
          WHEN ? = 'closed'
          THEN COALESCE(closed_at, NOW())
          ELSE closed_at
        END,
        root_cause_category =
          COALESCE(?, root_cause_category),
        root_cause_summary =
          COALESCE(?, root_cause_summary)
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      status,
      status,
      status,
      status,
      status,
      rootCauseCategory || null,
      rootCauseSummary || null,
      tenantId,
      incidentId,
    ]
  );

  return findIncidentById({
    tenantId,
    incidentId,
  });
};

const addAffectedService = async ({
  tenantId,
  incidentId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO incident_affected_services (
        id,
        tenant_id,
        operational_incident_id,
        critical_business_service_id,
        impact_started_at,
        impact_ended_at,
        impact_description,
        service_level_percentage,
        tolerance_breached,
        breach_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      incidentId,
      body.criticalBusinessServiceId,
      body.impactStartedAt || null,
      body.impactEndedAt || null,
      body.impactDescription || null,
      body.serviceLevelPercentage ?? null,
      body.toleranceBreached,
      body.breachMinutes ?? null,
    ]
  );

  return findAffectedServiceById({
    tenantId,
    affectedServiceId: id,
  });
};

const findAffectedServiceById = async ({
  tenantId,
  affectedServiceId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM incident_affected_services
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, affectedServiceId]
  );

  return rows[0] || null;
};

const createIncidentAction = async ({
  tenantId,
  incidentId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO incident_actions (
        id,
        tenant_id,
        operational_incident_id,
        action_type,
        title,
        description,
        priority,
        status,
        assigned_to,
        due_at,
        evidence_storage_key,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      incidentId,
      body.actionType,
      body.title,
      body.description || null,
      body.priority,
      body.status,
      body.assignedTo || null,
      body.dueAt || null,
      body.evidenceStorageKey || null,
      createdBy,
    ]
  );

  return findIncidentActionById({
    tenantId,
    actionId: id,
  });
};

const findIncidentActionById = async ({
  tenantId,
  actionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM incident_actions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, actionId]
  );

  return rows[0] || null;
};

const updateIncidentActionStatus = async ({
  tenantId,
  actionId,
  status,
}) => {
  await db.query(
    `
      UPDATE incident_actions
      SET
        status = ?,
        completed_at = CASE
          WHEN ? = 'completed'
          THEN NOW()
          ELSE completed_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [status, status, tenantId, actionId]
  );

  return findIncidentActionById({
    tenantId,
    actionId,
  });
};

const createContinuityPlan = async ({
  tenantId,
  serviceId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO business_continuity_plans (
        id,
        tenant_id,
        critical_business_service_id,
        plan_code,
        plan_name,
        version,
        activation_criteria,
        recovery_strategy,
        communication_plan,
        alternate_site_details,
        manual_workaround_details,
        restoration_sequence,
        status,
        effective_from,
        effective_to,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      serviceId,
      body.planCode,
      body.planName,
      body.version,
      body.activationCriteria,
      body.recoveryStrategy,
      body.communicationPlan || null,
      body.alternateSiteDetails || null,
      body.manualWorkaroundDetails || null,
      body.restorationSequence
        ? JSON.stringify(body.restorationSequence)
        : null,
      body.status,
      body.effectiveFrom,
      body.effectiveTo || null,
      createdBy,
    ]
  );

  return findContinuityPlanById({
    tenantId,
    planId: id,
  });
};

const findContinuityPlanById = async ({
  tenantId,
  planId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM business_continuity_plans
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, planId]
  );

  return rows[0] || null;
};

const createExercise = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();
  const reference =
    `RES-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO resilience_test_exercises (
        id,
        tenant_id,
        exercise_reference,
        exercise_name,
        exercise_type,
        scope,
        scenario,
        planned_start_at,
        planned_end_at,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      reference,
      body.exerciseName,
      body.exerciseType,
      JSON.stringify(body.scope),
      body.scenario,
      body.plannedStartAt,
      body.plannedEndAt,
      body.status,
      createdBy,
    ]
  );

  return findExerciseById({
    tenantId,
    exerciseId: id,
  });
};

const findExerciseById = async ({
  tenantId,
  exerciseId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM resilience_test_exercises
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, exerciseId]
  );

  return rows[0] || null;
};

const completeExercise = async ({
  tenantId,
  exerciseId,
  body,
}) => {
  await db.query(
    `
      UPDATE resilience_test_exercises
      SET
        status = 'completed',
        outcome = ?,
        actual_start_at =
          COALESCE(actual_start_at, ?),
        actual_end_at = ?,
        summary = ?,
        lessons_learned = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.outcome,
      body.actualStartAt || null,
      body.actualEndAt,
      body.summary || null,
      body.lessonsLearned || null,
      tenantId,
      exerciseId,
    ]
  );

  return findExerciseById({
    tenantId,
    exerciseId,
  });
};

const createPostIncidentReview = async ({
  tenantId,
  incidentId,
  body,
  createdBy,
}) => {
  const id = randomUUID();
  const reference =
    `PIR-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO post_incident_reviews (
        id,
        tenant_id,
        operational_incident_id,
        review_reference,
        executive_summary,
        timeline,
        root_cause,
        contributing_factors,
        what_went_well,
        what_went_wrong,
        customer_impact_assessment,
        regulatory_impact_assessment,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      incidentId,
      reference,
      body.executiveSummary,
      JSON.stringify(body.timeline),
      body.rootCause,
      body.contributingFactors
        ? JSON.stringify(body.contributingFactors)
        : null,
      body.whatWentWell
        ? JSON.stringify(body.whatWentWell)
        : null,
      body.whatWentWrong
        ? JSON.stringify(body.whatWentWrong)
        : null,
      body.customerImpactAssessment || null,
      body.regulatoryImpactAssessment || null,
      createdBy,
    ]
  );

  return findPostIncidentReviewById({
    tenantId,
    reviewId: id,
  });
};

const findPostIncidentReviewById = async ({
  tenantId,
  reviewId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM post_incident_reviews
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, reviewId]
  );

  return rows[0] || null;
};

module.exports = {
  createCriticalService,
  findCriticalServiceById,
  createDependency,
  findDependencyById,
  createIncident,
  findIncidentById,
  updateIncidentStatus,
  addAffectedService,
  findAffectedServiceById,
  createIncidentAction,
  findIncidentActionById,
  updateIncidentActionStatus,
  createContinuityPlan,
  findContinuityPlanById,
  createExercise,
  findExerciseById,
  completeExercise,
  createPostIncidentReview,
  findPostIncidentReviewById,
};
