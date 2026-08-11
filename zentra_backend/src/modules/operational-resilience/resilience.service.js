const repo =
  require("./resilience.repository");

const eventsService =
  require("../events/events.service");

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const createCriticalService = async ({
  auth,
  body,
}) => {
  if (
    body.recoveryTimeObjectiveMinutes >
    body.impactToleranceMinutes
  ) {
    throw httpError(
      422,
      "Recovery time objective cannot exceed the impact tolerance"
    );
  }

  return repo.createCriticalService({
    tenantId:
      auth.tenantId,
    body,
    createdBy:
      auth.userId,
  });
};

const addDependency = async ({
  auth,
  serviceId,
  body,
}) => {
  const service =
    await repo.findCriticalServiceById({
      tenantId:
        auth.tenantId,
      serviceId,
    });

  if (!service) {
    throw httpError(
      404,
      "Critical business service not found"
    );
  }

  return repo.createDependency({
    tenantId:
      auth.tenantId,
    serviceId,
    body,
  });
};

const createIncident = async ({
  auth,
  body,
}) => {
  const incident =
    await repo.createIncident({
      tenantId:
        auth.tenantId,
      body,
      createdBy:
        auth.userId,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "operational_incident.created",
    aggregateType:
      "operational_incident",
    aggregateId:
      incident.id,
    idempotencyKey:
      `operational-incident:${incident.id}:created:v1`,
    payload: {
      incidentId:
        incident.id,
      reference:
        incident.incident_reference,
      severity:
        incident.severity,
      incidentType:
        incident.incident_type,
      customerImpact:
        incident.customer_impact,
      regulatoryImpact:
        incident.regulatory_impact,
    },
  });

  return incident;
};

const updateIncidentStatus = async ({
  auth,
  incidentId,
  body,
}) => {
  const incident =
    await repo.findIncidentById({
      tenantId:
        auth.tenantId,
      incidentId,
    });

  if (!incident) {
    throw httpError(
      404,
      "Operational incident not found"
    );
  }

  const transitions = {
    detected: [
      "triaged",
      "closed",
    ],
    triaged: [
      "investigating",
      "closed",
    ],
    investigating: [
      "mitigating",
      "resolved",
    ],
    mitigating: [
      "monitoring",
      "resolved",
    ],
    monitoring: [
      "mitigating",
      "resolved",
    ],
    resolved: [
      "closed",
    ],
  };

  if (
    !(
      transitions[
        incident.status
      ] || []
    ).includes(
      body.status
    )
  ) {
    throw httpError(
      409,
      `Cannot change incident from ${incident.status} to ${body.status}`
    );
  }

  const updated =
    await repo.updateIncidentStatus({
      tenantId:
        auth.tenantId,
      incidentId,
      status:
        body.status,
      rootCauseCategory:
        body.rootCauseCategory,
      rootCauseSummary:
        body.rootCauseSummary,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      `operational_incident.${body.status}`,
    aggregateType:
      "operational_incident",
    aggregateId:
      updated.id,
    idempotencyKey:
      `operational-incident:${updated.id}:${body.status}`,
    payload: {
      incidentId:
        updated.id,
      status:
        updated.status,
      severity:
        updated.severity,
    },
  });

  return updated;
};

const addAffectedService = async ({
  auth,
  incidentId,
  body,
}) => {
  const incident =
    await repo.findIncidentById({
      tenantId:
        auth.tenantId,
      incidentId,
    });

  if (!incident) {
    throw httpError(
      404,
      "Operational incident not found"
    );
  }

  const service =
    await repo.findCriticalServiceById({
      tenantId:
        auth.tenantId,
      serviceId:
        body.criticalBusinessServiceId,
    });

  if (!service) {
    throw httpError(
      404,
      "Critical business service not found"
    );
  }

  const record =
    await repo.addAffectedService({
      tenantId:
        auth.tenantId,
      incidentId,
      body,
    });

  if (
    record.tolerance_breached
  ) {
    await eventsService.emit({
      tenantId:
        auth.tenantId,
      eventType:
        "operational_resilience.impact_tolerance_breached",
      aggregateType:
        "critical_business_service",
      aggregateId:
        service.id,
      idempotencyKey:
        `impact-tolerance:${incident.id}:${service.id}`,
      payload: {
        incidentId:
          incident.id,
        serviceId:
          service.id,
        serviceCode:
          service.service_code,
        breachMinutes:
          record.breach_minutes,
      },
    });
  }

  return record;
};

const createIncidentAction = async ({
  auth,
  incidentId,
  body,
}) => {
  const incident =
    await repo.findIncidentById({
      tenantId:
        auth.tenantId,
      incidentId,
    });

  if (!incident) {
    throw httpError(
      404,
      "Operational incident not found"
    );
  }

  return repo.createIncidentAction({
    tenantId:
      auth.tenantId,
    incidentId,
    body,
    createdBy:
      auth.userId,
  });
};

const completeExercise = async ({
  auth,
  exerciseId,
  body,
}) => {
  const exercise =
    await repo.findExerciseById({
      tenantId:
        auth.tenantId,
      exerciseId,
    });

  if (!exercise) {
    throw httpError(
      404,
      "Resilience exercise not found"
    );
  }

  if (
    ![
      "approved",
      "in_progress",
    ].includes(
      exercise.status
    )
  ) {
    throw httpError(
      409,
      "Only approved or active exercises can be completed"
    );
  }

  return repo.completeExercise({
    tenantId:
      auth.tenantId,
    exerciseId,
    body,
  });
};

const createPostIncidentReview = async ({
  auth,
  incidentId,
  body,
}) => {
  const incident =
    await repo.findIncidentById({
      tenantId:
        auth.tenantId,
      incidentId,
    });

  if (!incident) {
    throw httpError(
      404,
      "Operational incident not found"
    );
  }

  if (
    ![
      "resolved",
      "closed",
    ].includes(
      incident.status
    )
  ) {
    throw httpError(
      409,
      "A post-incident review can only be created after resolution"
    );
  }

  return repo.createPostIncidentReview({
    tenantId:
      auth.tenantId,
    incidentId,
    body,
    createdBy:
      auth.userId,
  });
};

module.exports = {
  createCriticalService,
  addDependency,
  createIncident,
  updateIncidentStatus,
  addAffectedService,
  createIncidentAction,
  completeExercise,
  createPostIncidentReview,

  updateIncidentActionStatus:
    ({ auth, actionId, body }) =>
      repo.updateIncidentActionStatus({
        tenantId:
          auth.tenantId,
        actionId,
        status:
          body.status,
      }),

  createContinuityPlan:
    ({ auth, serviceId, body }) =>
      repo.createContinuityPlan({
        tenantId:
          auth.tenantId,
        serviceId,
        body,
        createdBy:
          auth.userId,
      }),

  createExercise:
    ({ auth, body }) =>
      repo.createExercise({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),
};
