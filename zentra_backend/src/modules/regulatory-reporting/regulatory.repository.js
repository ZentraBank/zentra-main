const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createAuthority = async ({
  tenantId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO regulatory_authorities (
        id,
        tenant_id,
        code,
        name,
        country_code,
        submission_channel,
        endpoint_url,
        public_key,
        status,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.countryCode || null,
      body.submissionChannel,
      body.endpointUrl || null,
      body.publicKey || null,
      body.status,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findAuthorityById({
    tenantId,
    authorityId: id,
  });
};

const findAuthorityById = async ({
  tenantId,
  authorityId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM regulatory_authorities
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, authorityId]
  );

  return rows[0] || null;
};

const createDefinition = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO regulatory_report_definitions (
        id,
        tenant_id,
        authority_id,
        report_code,
        report_name,
        report_type,
        frequency,
        submission_deadline_days,
        timezone,
        output_format,
        data_query_key,
        validation_schema,
        version,
        effective_from,
        effective_to,
        retention_years,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.authorityId,
      body.reportCode,
      body.reportName,
      body.reportType,
      body.frequency,
      body.submissionDeadlineDays,
      body.timezone,
      body.outputFormat,
      body.dataQueryKey,
      body.validationSchema
        ? JSON.stringify(body.validationSchema)
        : null,
      body.version,
      body.effectiveFrom,
      body.effectiveTo || null,
      body.retentionYears,
      body.status,
      createdBy,
    ]
  );

  return findDefinitionById({
    tenantId,
    definitionId: id,
  });
};

const findDefinitionById = async ({
  tenantId,
  definitionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM regulatory_report_definitions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, definitionId]
  );

  return rows[0] || null;
};

const createRun = async ({
  tenantId,
  body,
  makerUserId,
}) => {
  const id = randomUUID();
  const reference =
    `REG-${body.reportingPeriodEnd}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO regulatory_report_runs (
        id,
        tenant_id,
        report_definition_id,
        run_reference,
        reporting_period_start,
        reporting_period_end,
        maker_user_id,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.reportDefinitionId,
      reference,
      body.reportingPeriodStart,
      body.reportingPeriodEnd,
      makerUserId,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findRunById({
    tenantId,
    runId: id,
  });
};

const findRunById = async ({
  tenantId,
  runId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM regulatory_report_runs
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, runId]
  );

  return rows[0] || null;
};

const replaceRunRecords = async ({
  tenantId,
  runId,
  records,
}) => {
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
        DELETE FROM regulatory_report_records
        WHERE tenant_id = ?
          AND report_run_id = ?
      `,
      [tenantId, runId]
    );

    for (const record of records) {
      await connection.query(
        `
          INSERT INTO regulatory_report_records (
            id,
            tenant_id,
            report_run_id,
            record_key,
            record_type,
            source_table,
            source_record_id,
            payload
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          tenantId,
          runId,
          record.recordKey,
          record.recordType || null,
          record.sourceTable || null,
          record.sourceRecordId || null,
          JSON.stringify(record.payload),
        ]
      );
    }

    await connection.query(
      `
        UPDATE regulatory_report_runs
        SET
          status = 'validating',
          record_count = ?
        WHERE tenant_id = ?
          AND id = ?
      `,
      [records.length, tenantId, runId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findRunById({
    tenantId,
    runId,
  });
};

const addValidationResult = ({
  tenantId,
  runId,
  recordId,
  result,
}) =>
  db.query(
    `
      INSERT INTO regulatory_validation_results (
        id,
        tenant_id,
        report_run_id,
        report_record_id,
        severity,
        rule_code,
        field_path,
        message,
        actual_value,
        expected_value
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      runId,
      recordId || null,
      result.severity,
      result.ruleCode,
      result.fieldPath || null,
      result.message,
      result.actualValue ?? null,
      result.expectedValue ?? null,
    ]
  );

const finaliseValidation = async ({
  tenantId,
  runId,
  errorCount,
  warningCount,
}) => {
  await db.query(
    `
      UPDATE regulatory_report_runs
      SET
        status = CASE
          WHEN ? > 0
          THEN 'validating'
          ELSE 'ready_for_review'
        END,
        validation_error_count = ?,
        validation_warning_count = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      errorCount,
      errorCount,
      warningCount,
      tenantId,
      runId,
    ]
  );

  return findRunById({
    tenantId,
    runId,
  });
};

const approveRun = async ({
  tenantId,
  runId,
  checkerUserId,
}) => {
  await db.query(
    `
      UPDATE regulatory_report_runs
      SET
        status = 'approved',
        checker_user_id = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'ready_for_review'
    `,
    [checkerUserId, tenantId, runId]
  );

  return findRunById({
    tenantId,
    runId,
  });
};

const attachGeneratedFile = async ({
  tenantId,
  runId,
  fileKey,
  fileHash,
}) => {
  await db.query(
    `
      UPDATE regulatory_report_runs
      SET
        generated_file_key = ?,
        generated_file_hash = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [fileKey, fileHash, tenantId, runId]
  );

  return findRunById({
    tenantId,
    runId,
  });
};

const createSubmission = async ({
  tenantId,
  run,
  authority,
  submittedBy,
}) => {
  const id = randomUUID();
  const reference =
    `SUB-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO regulatory_submissions (
        id,
        tenant_id,
        report_run_id,
        authority_id,
        submission_reference,
        submission_channel,
        submitted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      run.id,
      authority.id,
      reference,
      authority.submission_channel,
      submittedBy,
    ]
  );

  return findSubmissionById({
    tenantId,
    submissionId: id,
  });
};

const findSubmissionById = async ({
  tenantId,
  submissionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM regulatory_submissions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, submissionId]
  );

  return rows[0] || null;
};

const markSubmission = async ({
  tenantId,
  submissionId,
  status,
  externalReference,
  responseStatusCode,
  responsePayload,
}) => {
  await db.query(
    `
      UPDATE regulatory_submissions
      SET
        status = ?,
        attempt_count = attempt_count + 1,
        external_reference =
          COALESCE(?, external_reference),
        response_status_code =
          COALESCE(?, response_status_code),
        response_payload =
          COALESCE(?, response_payload),
        submitted_at = CASE
          WHEN ? IN ('submitted', 'accepted', 'rejected')
          THEN COALESCE(submitted_at, NOW())
          ELSE submitted_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      status,
      externalReference || null,
      responseStatusCode || null,
      responsePayload
        ? JSON.stringify(responsePayload)
        : null,
      status,
      tenantId,
      submissionId,
    ]
  );

  const submission =
    await findSubmissionById({
      tenantId,
      submissionId,
    });

  await db.query(
    `
      UPDATE regulatory_report_runs
      SET
        status = ?,
        external_submission_reference =
          COALESCE(?, external_submission_reference),
        submitted_at = CASE
          WHEN ? IN ('submitted', 'accepted', 'rejected')
          THEN COALESCE(submitted_at, NOW())
          ELSE submitted_at
        END,
        accepted_at = CASE
          WHEN ? = 'accepted'
          THEN NOW()
          ELSE accepted_at
        END,
        rejected_at = CASE
          WHEN ? = 'rejected'
          THEN NOW()
          ELSE rejected_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      status,
      externalReference || null,
      status,
      status,
      status,
      tenantId,
      submission.report_run_id,
    ]
  );

  return submission;
};

module.exports = {
  createAuthority,
  findAuthorityById,
  createDefinition,
  findDefinitionById,
  createRun,
  findRunById,
  replaceRunRecords,
  addValidationResult,
  finaliseValidation,
  approveRun,
  attachGeneratedFile,
  createSubmission,
  findSubmissionById,
  markSubmission,
};
