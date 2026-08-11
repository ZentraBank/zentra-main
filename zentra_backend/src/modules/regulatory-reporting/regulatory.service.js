const crypto =
  require("crypto");

const repo =
  require("./regulatory.repository");

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

const sha256 = (
  value
) =>
  crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");

const createDefinition = async ({
  auth,
  body,
}) => {
  const authority =
    await repo.findAuthorityById({
      tenantId:
        auth.tenantId,
      authorityId:
        body.authorityId,
    });

  if (!authority) {
    throw httpError(
      404,
      "Regulatory authority not found"
    );
  }

  return repo.createDefinition({
    tenantId:
      auth.tenantId,
    body,
    createdBy:
      auth.userId,
  });
};

const createRun = async ({
  auth,
  body,
}) => {
  const definition =
    await repo.findDefinitionById({
      tenantId:
        auth.tenantId,
      definitionId:
        body.reportDefinitionId,
    });

  if (
    !definition ||
    definition.status !==
      "active"
  ) {
    throw httpError(
      404,
      "Active report definition not found"
    );
  }

  if (
    new Date(
      body.reportingPeriodStart
    ) >
    new Date(
      body.reportingPeriodEnd
    )
  ) {
    throw httpError(
      422,
      "Reporting period start cannot be after the end date"
    );
  }

  const run =
    await repo.createRun({
      tenantId:
        auth.tenantId,
      body,
      makerUserId:
        auth.userId,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "regulatory_report.run_created",
    aggregateType:
      "regulatory_report_run",
    aggregateId:
      run.id,
    idempotencyKey:
      `reg-report:${run.id}:created:v1`,
    payload: {
      runId:
        run.id,
      reference:
        run.run_reference,
      reportingPeriodStart:
        run.reporting_period_start,
      reportingPeriodEnd:
        run.reporting_period_end,
    },
  });

  return run;
};

const uploadRecords = async ({
  auth,
  runId,
  body,
}) => {
  const run =
    await repo.findRunById({
      tenantId:
        auth.tenantId,
      runId,
    });

  if (!run) {
    throw httpError(
      404,
      "Regulatory report run not found"
    );
  }

  if (
    ![
      "pending",
      "extracting",
      "validating",
    ].includes(
      run.status
    )
  ) {
    throw httpError(
      409,
      "Report records cannot be replaced in the current state"
    );
  }

  return repo.replaceRunRecords({
    tenantId:
      auth.tenantId,
    runId,
    records:
      body.records,
  });
};

const validateRun = async ({
  auth,
  runId,
  body,
}) => {
  const run =
    await repo.findRunById({
      tenantId:
        auth.tenantId,
      runId,
    });

  if (!run) {
    throw httpError(
      404,
      "Regulatory report run not found"
    );
  }

  let errorCount = 0;
  let warningCount = 0;

  for (
    const result
    of body.results
  ) {
    await repo.addValidationResult({
      tenantId:
        auth.tenantId,
      runId,
      recordId:
        result.recordId || null,
      result,
    });

    if (
      result.severity ===
      "error"
    ) {
      errorCount += 1;
    }

    if (
      result.severity ===
      "warning"
    ) {
      warningCount += 1;
    }
  }

  return repo.finaliseValidation({
    tenantId:
      auth.tenantId,
    runId,
    errorCount,
    warningCount,
  });
};

const approveRun = async ({
  auth,
  runId,
}) => {
  const run =
    await repo.findRunById({
      tenantId:
        auth.tenantId,
      runId,
    });

  if (!run) {
    throw httpError(
      404,
      "Regulatory report run not found"
    );
  }

  if (
    run.status !==
    "ready_for_review"
  ) {
    throw httpError(
      409,
      "Only reports ready for review can be approved"
    );
  }

  if (
    run.maker_user_id ===
    auth.userId
  ) {
    throw httpError(
      409,
      "The report maker cannot approve the same report"
    );
  }

  return repo.approveRun({
    tenantId:
      auth.tenantId,
    runId,
    checkerUserId:
      auth.userId,
  });
};

const attachGeneratedFile = async ({
  auth,
  runId,
  body,
}) => {
  const run =
    await repo.findRunById({
      tenantId:
        auth.tenantId,
      runId,
    });

  if (!run) {
    throw httpError(
      404,
      "Regulatory report run not found"
    );
  }

  const fileHash =
    body.fileHash ||
    sha256(
      `${body.fileKey}:${run.run_reference}`
    );

  return repo.attachGeneratedFile({
    tenantId:
      auth.tenantId,
    runId,
    fileKey:
      body.fileKey,
    fileHash,
  });
};

const createSubmission = async ({
  auth,
  runId,
}) => {
  const run =
    await repo.findRunById({
      tenantId:
        auth.tenantId,
      runId,
    });

  if (!run) {
    throw httpError(
      404,
      "Regulatory report run not found"
    );
  }

  if (
    run.status !==
    "approved"
  ) {
    throw httpError(
      409,
      "Only approved reports can be submitted"
    );
  }

  if (
    !run.generated_file_key ||
    !run.generated_file_hash
  ) {
    throw httpError(
      409,
      "A generated report file must be attached before submission"
    );
  }

  const definition =
    await repo.findDefinitionById({
      tenantId:
        auth.tenantId,
      definitionId:
        run.report_definition_id,
    });

  const authority =
    await repo.findAuthorityById({
      tenantId:
        auth.tenantId,
      authorityId:
        definition.authority_id,
    });

  return repo.createSubmission({
    tenantId:
      auth.tenantId,
    run,
    authority,
    submittedBy:
      auth.userId,
  });
};

const updateSubmission = async ({
  auth,
  submissionId,
  body,
}) => {
  const submission =
    await repo.findSubmissionById({
      tenantId:
        auth.tenantId,
      submissionId,
    });

  if (!submission) {
    throw httpError(
      404,
      "Regulatory submission not found"
    );
  }

  const updated =
    await repo.markSubmission({
      tenantId:
        auth.tenantId,
      submissionId,
      status:
        body.status,
      externalReference:
        body.externalReference,
      responseStatusCode:
        body.responseStatusCode,
      responsePayload:
        body.responsePayload,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      `regulatory_report.${body.status}`,
    aggregateType:
      "regulatory_submission",
    aggregateId:
      updated.id,
    idempotencyKey:
      `reg-submission:${updated.id}:${body.status}:${updated.attempt_count}`,
    payload: {
      submissionId:
        updated.id,
      reportRunId:
        updated.report_run_id,
      status:
        updated.status,
      externalReference:
        updated.external_reference,
    },
  });

  return updated;
};

module.exports = {
  createDefinition,
  createRun,
  uploadRecords,
  validateRun,
  approveRun,
  attachGeneratedFile,
  createSubmission,
  updateSubmission,

  createAuthority:
    ({ auth, body }) =>
      repo.createAuthority({
        tenantId:
          auth.tenantId,
        body,
      }),
};
