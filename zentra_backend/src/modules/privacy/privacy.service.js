const repo =
  require("./privacy.repository");

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

const grantConsent = async ({
  auth,
  body,
}) => {
  const purpose =
    await repo.findPurposeById({
      tenantId:
        auth.tenantId,
      purposeId:
        body.privacyPurposeId,
    });

  if (
    !purpose ||
    purpose.status !==
      "active"
  ) {
    throw httpError(
      404,
      "Active privacy purpose not found"
    );
  }

  if (
    purpose.lawful_basis !==
    "consent"
  ) {
    throw httpError(
      422,
      "This processing purpose does not use consent as its lawful basis"
    );
  }

  const existing =
    await repo.findActiveConsent({
      tenantId:
        auth.tenantId,
      userId:
        auth.userId,
      purposeId:
        purpose.id,
    });

  if (existing) {
    return {
      idempotent: true,
      consent: existing,
    };
  }

  const consent =
    await repo.createConsent({
      tenantId:
        auth.tenantId,
      userId:
        auth.userId,
      body,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "privacy.consent_granted",
    aggregateType:
      "privacy_consent",
    aggregateId:
      consent.id,
    idempotencyKey:
      `privacy-consent:${consent.id}:granted:v1`,
    payload: {
      consentId:
        consent.id,
      userId:
        consent.user_id,
      purposeId:
        consent.privacy_purpose_id,
      version:
        consent.consent_version,
    },
  });

  return {
    idempotent: false,
    consent,
  };
};

const withdrawConsent = async ({
  auth,
  consentId,
  body,
}) => {
  const consent =
    await repo.findConsentById({
      tenantId:
        auth.tenantId,
      consentId,
    });

  if (!consent) {
    throw httpError(
      404,
      "Privacy consent not found"
    );
  }

  if (
    consent.user_id !==
    auth.userId &&
    !auth.permissions?.includes(
      "privacy.consents.manage"
    )
  ) {
    throw httpError(
      403,
      "Not authorised to withdraw this consent"
    );
  }

  if (
    consent.status !==
    "granted"
  ) {
    throw httpError(
      409,
      "Only granted consent can be withdrawn"
    );
  }

  const withdrawn =
    await repo.withdrawConsent({
      tenantId:
        auth.tenantId,
      consentId,
      reason:
        body.reason,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "privacy.consent_withdrawn",
    aggregateType:
      "privacy_consent",
    aggregateId:
      withdrawn.id,
    idempotencyKey:
      `privacy-consent:${withdrawn.id}:withdrawn:v1`,
    payload: {
      consentId:
        withdrawn.id,
      userId:
        withdrawn.user_id,
      purposeId:
        withdrawn.privacy_purpose_id,
      reason:
        withdrawn.withdrawal_reason,
    },
  });

  return withdrawn;
};

const createDataSubjectRequest = async ({
  auth,
  body,
}) => {
  const dueAt =
    new Date(
      Date.now() +
      Number(
        body.responseDeadlineDays
      ) *
        24 *
        60 *
        60 *
        1000
    );

  const request =
    await repo
      .createDataSubjectRequest({
        tenantId:
          auth.tenantId,
        userId:
          body.userId ||
          auth.userId,
        body,
        dueAt,
      });

  if (
    body.tasks?.length
  ) {
    await repo.createRequestTasks({
      tenantId:
        auth.tenantId,
      requestId:
        request.id,
      tasks:
        body.tasks,
    });
  }

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "privacy.data_subject_request_created",
    aggregateType:
      "data_subject_request",
    aggregateId:
      request.id,
    idempotencyKey:
      `dsr:${request.id}:created:v1`,
    payload: {
      requestId:
        request.id,
      requestType:
        request.request_type,
      dueAt:
        request.due_at,
    },
  });

  return request;
};

const updateDataSubjectRequest = async ({
  auth,
  requestId,
  body,
}) => {
  const request =
    await repo
      .findDataSubjectRequestById({
        tenantId:
          auth.tenantId,
        requestId,
      });

  if (!request) {
    throw httpError(
      404,
      "Data subject request not found"
    );
  }

  const transitions = {
    received: [
      "identity_verification",
      "cancelled",
    ],
    identity_verification: [
      "in_review",
      "rejected",
      "cancelled",
    ],
    in_review: [
      "approved",
      "rejected",
      "cancelled",
    ],
    approved: [
      "processing",
      "cancelled",
    ],
    processing: [
      "completed",
      "overdue",
    ],
    overdue: [
      "processing",
      "completed",
    ],
  };

  if (
    !(
      transitions[
        request.status
      ] || []
    ).includes(
      body.status
    )
  ) {
    throw httpError(
      409,
      `Cannot change request from ${request.status} to ${body.status}`
    );
  }

  return repo.updateRequestStatus({
    tenantId:
      auth.tenantId,
    requestId,
    status:
      body.status,
    approvedBy:
      body.status ===
      "approved"
        ? auth.userId
        : null,
    rejectionReason:
      body.rejectionReason,
  });
};

const createRetentionRun = async ({
  auth,
  policyId,
}) => {
  const policy =
    await repo.findRetentionPolicyById({
      tenantId:
        auth.tenantId,
      policyId,
    });

  if (
    !policy ||
    policy.status !==
      "active"
  ) {
    throw httpError(
      404,
      "Active retention policy not found"
    );
  }

  const cutoffAt =
    new Date(
      Date.now() -
      Number(
        policy.retention_period_days
      ) *
        24 *
        60 *
        60 *
        1000
    );

  return repo.createRetentionRun({
    tenantId:
      auth.tenantId,
    policyId,
    cutoffAt,
    makerUserId:
      auth.userId,
  });
};

const approveRetentionRun = async ({
  auth,
  runId,
}) => {
  const run =
    await repo.findRetentionRunById({
      tenantId:
        auth.tenantId,
      runId,
    });

  if (!run) {
    throw httpError(
      404,
      "Retention execution run not found"
    );
  }

  if (
    run.status !==
    "awaiting_approval"
  ) {
    throw httpError(
      409,
      "Retention run is not awaiting approval"
    );
  }

  if (
    run.maker_user_id ===
    auth.userId
  ) {
    throw httpError(
      409,
      "The retention run maker cannot approve the same run"
    );
  }

  return repo.approveRetentionRun({
    tenantId:
      auth.tenantId,
    runId,
    checkerUserId:
      auth.userId,
  });
};

const releaseLegalHold = async ({
  auth,
  holdId,
}) => {
  const hold =
    await repo.findLegalHoldById({
      tenantId:
        auth.tenantId,
      holdId,
    });

  if (!hold) {
    throw httpError(
      404,
      "Privacy legal hold not found"
    );
  }

  if (
    hold.status !==
    "active"
  ) {
    throw httpError(
      409,
      "Legal hold is not active"
    );
  }

  return repo.releaseLegalHold({
    tenantId:
      auth.tenantId,
    holdId,
    releasedBy:
      auth.userId,
  });
};

module.exports = {
  grantConsent,
  withdrawConsent,
  createDataSubjectRequest,
  updateDataSubjectRequest,
  createRetentionRun,
  approveRetentionRun,
  releaseLegalHold,

  createPurpose:
    ({ auth, body }) =>
      repo.createPurpose({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),

  createRetentionPolicy:
    ({ auth, body }) =>
      repo.createRetentionPolicy({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),

  createLegalHold:
    ({ auth, body }) =>
      repo.createLegalHold({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),

  createIncident:
    ({ auth, body }) =>
      repo.createIncident({
        tenantId:
          auth.tenantId,
        body,
        ownerUserId:
          body.ownerUserId ||
          auth.userId,
      }),
};
