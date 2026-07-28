const repo =
  require("./third-party.repository");

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

const createService = async ({
  auth,
  thirdPartyId,
  body,
}) => {
  const thirdParty =
    await repo.findThirdPartyById({
      tenantId:
        auth.tenantId,
      thirdPartyId,
    });

  if (!thirdParty) {
    throw httpError(
      404,
      "Third party not found"
    );
  }

  return repo.createService({
    tenantId:
      auth.tenantId,
    thirdPartyId,
    body,
  });
};

const createDueDiligence = async ({
  auth,
  thirdPartyId,
  body,
}) => {
  const thirdParty =
    await repo.findThirdPartyById({
      tenantId:
        auth.tenantId,
      thirdPartyId,
    });

  if (!thirdParty) {
    throw httpError(
      404,
      "Third party not found"
    );
  }

  return repo.createDueDiligence({
    tenantId:
      auth.tenantId,
    thirdPartyId,
    body,
    assessorUserId:
      auth.userId,
  });
};

const completeDueDiligence = async ({
  auth,
  assessmentId,
  body,
}) => {
  const assessment =
    await repo.findDueDiligenceById({
      tenantId:
        auth.tenantId,
      assessmentId,
    });

  if (!assessment) {
    throw httpError(
      404,
      "Due diligence assessment not found"
    );
  }

  if (
    Number(body.residualRiskScore) >
    Number(body.inherentRiskScore)
  ) {
    throw httpError(
      422,
      "Residual risk cannot exceed inherent risk"
    );
  }

  return repo.completeDueDiligence({
    tenantId:
      auth.tenantId,
    assessmentId,
    body,
  });
};

const reviewDueDiligence = async ({
  auth,
  assessmentId,
  body,
}) => {
  const assessment =
    await repo.findDueDiligenceById({
      tenantId:
        auth.tenantId,
      assessmentId,
    });

  if (!assessment) {
    throw httpError(
      404,
      "Due diligence assessment not found"
    );
  }

  if (
    assessment.assessor_user_id ===
    auth.userId
  ) {
    throw httpError(
      409,
      "The assessor cannot review the same assessment"
    );
  }

  const reviewed =
    await repo.approveDueDiligence({
      tenantId:
        auth.tenantId,
      assessmentId,
      reviewerUserId:
        auth.userId,
      approved:
        body.decision ===
        "approve",
      rejectionReason:
        body.rejectionReason,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      body.decision ===
      "approve"
        ? "third_party.due_diligence_approved"
        : "third_party.due_diligence_rejected",
    aggregateType:
      "third_party_due_diligence",
    aggregateId:
      reviewed.id,
    idempotencyKey:
      `third-party-dd:${reviewed.id}:${reviewed.status}`,
    payload: {
      assessmentId:
        reviewed.id,
      thirdPartyId:
        reviewed.third_party_id,
      status:
        reviewed.status,
      riskRating:
        reviewed.risk_rating,
    },
  });

  return reviewed;
};

const updateThirdPartyStatus = async ({
  auth,
  thirdPartyId,
  body,
}) => {
  const thirdParty =
    await repo.findThirdPartyById({
      tenantId:
        auth.tenantId,
      thirdPartyId,
    });

  if (!thirdParty) {
    throw httpError(
      404,
      "Third party not found"
    );
  }

  const transitions = {
    prospective: [
      "due_diligence",
      "rejected",
    ],
    due_diligence: [
      "approved",
      "rejected",
    ],
    approved: [
      "active",
      "rejected",
    ],
    active: [
      "suspended",
      "offboarding",
    ],
    suspended: [
      "active",
      "offboarding",
    ],
    offboarding: [
      "terminated",
    ],
  };

  if (
    !(
      transitions[
        thirdParty.status
      ] || []
    ).includes(
      body.status
    )
  ) {
    throw httpError(
      409,
      `Cannot change third party from ${thirdParty.status} to ${body.status}`
    );
  }

  return repo.updateThirdPartyStatus({
    tenantId:
      auth.tenantId,
    thirdPartyId,
    status:
      body.status,
    approvedBy:
      body.status ===
      "approved"
        ? auth.userId
        : null,
  });
};

const recordSlaMeasurement = async ({
  auth,
  slaId,
  body,
}) => {
  const sla =
    await repo.findSlaById({
      tenantId:
        auth.tenantId,
      slaId,
    });

  if (!sla) {
    throw httpError(
      404,
      "Third-party SLA not found"
    );
  }

  const measurement =
    await repo.recordSlaMeasurement({
      tenantId:
        auth.tenantId,
      sla,
      body,
      recordedBy:
        auth.userId,
    });

  if (!measurement.compliant) {
    await eventsService.emit({
      tenantId:
        auth.tenantId,
      eventType:
        "third_party.sla_breached",
      aggregateType:
        "third_party_sla",
      aggregateId:
        sla.id,
      idempotencyKey:
        `sla-measurement:${measurement.id}:breach`,
      payload: {
        slaId:
          sla.id,
        measurementId:
          measurement.id,
        metricName:
          sla.metric_name,
        targetValue:
          sla.target_value,
        measuredValue:
          body.measuredValue,
        severity:
          sla.breach_severity,
      },
    });
  }

  return measurement;
};

module.exports = {
  createService,
  createDueDiligence,
  completeDueDiligence,
  reviewDueDiligence,
  updateThirdPartyStatus,
  recordSlaMeasurement,

  createThirdParty:
    ({ auth, body }) =>
      repo.createThirdParty({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),

  createContract:
    ({ auth, thirdPartyId, body }) =>
      repo.createContract({
        tenantId:
          auth.tenantId,
        thirdPartyId,
        body,
      }),

  createSla:
    ({ auth, serviceId, body }) =>
      repo.createSla({
        tenantId:
          auth.tenantId,
        serviceId,
        body,
      }),

  createRiskIssue:
    ({ auth, thirdPartyId, body }) =>
      repo.createRiskIssue({
        tenantId:
          auth.tenantId,
        thirdPartyId,
        body,
        ownerUserId:
          body.ownerUserId ||
          auth.userId,
      }),

  createExitPlan:
    ({ auth, thirdPartyId, body }) =>
      repo.createExitPlan({
        tenantId:
          auth.tenantId,
        thirdPartyId,
        body,
        createdBy:
          auth.userId,
      }),
};
