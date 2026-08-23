const { randomUUID } = require("crypto");
const db = require("../../config/db");

const one = async (sql, params = []) => {
  const [rows] = await db.query(sql, params);
  return rows[0] || null;
};

const createPrivateFileRecord = async ({
  id,
  tenantId,
  userId,
  module,
  documentType,
  originalName,
  storedName,
  mimeType,
  sizeBytes,
  storagePath,
}) => {
  await db.query(
    `
      INSERT INTO private_files (
        id,
        tenant_id,
        user_id,
        module,
        document_type,
        original_name,
        stored_name,
        mime_type,
        size_bytes,
        storage_path
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      module,
      documentType,
      originalName,
      storedName,
      mimeType,
      sizeBytes,
      storagePath,
    ]
  );

  return findPrivateFileById({
    tenantId,
    fileId: id,
  });
};

const findPrivateFileById = ({
  tenantId,
  fileId,
}) =>
  one(
    `
      SELECT *
      FROM private_files
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'active'
      LIMIT 1
    `,
    [fileId, tenantId]
  );



const findAccountByNumber = ({
  tenantId,
  accountNumber,
}) =>
  one(
    `
      SELECT
        id,
        user_id,
        tenant_id,
        account_number,
        account_name,
        currency,
        status
      FROM accounts
      WHERE tenant_id = ?
        AND account_number = ?
      LIMIT 1
    `,
    [tenantId, accountNumber]
  );

const createClaim = async ({
  connection = null,
  tenantId,
  claimantUserId,
  body,
}) => {
  const executor =
    connection || db;

  const id =
    randomUUID();

  await executor.query(
    `
      INSERT INTO next_of_kin_claims (
        id,
        tenant_id,
        claimant_user_id,

        deceased_name,
        deceased_date_of_birth,
        deceased_identification_number,
        deceased_account_number,

        beneficiary_name,
        beneficiary_date_of_birth,
        relationship_to_deceased,
        contact_details,

        claimant_id_type,
        claimant_id_number,
        claimant_id_expiry_date,

        claim_statement,
        payment_method,

        indemnity_future_claims,
        indemnity_return_error_funds,

        signature_date,

        status,
        submitted_at
      )
      VALUES (
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?,
        'submitted',
        NOW()
      )
    `,
    [
      id,
      tenantId,
      claimantUserId,

      body.deceasedName,
      body.deceasedDateOfBirth || null,
      body.deceasedIdentificationNumber || null,
      body.deceasedAccountNumber,

      body.beneficiaryName,
      body.beneficiaryDateOfBirth || null,
      body.relationshipToDeceased,
      body.contactDetails,

      body.claimantIdType || null,
      body.claimantIdNumber || null,
      body.claimantIdExpiryDate || null,

      body.claimStatement,
      body.paymentMethod,

      body.indemnityFutureClaims ? 1 : 0,
      body.indemnityReturnErrorFunds ? 1 : 0,

      body.signatureDate || null,
    ]
  );

  return findClaimById({
    tenantId,
    claimId: id,
    connection,
  });
};

const createClaimDocument = async ({
  connection = null,
  tenantId,
  claimId,
  fileId,
  documentType,
}) => {
  const executor =
    connection || db;

  const id =
    randomUUID();

  await executor.query(
    `
      INSERT INTO next_of_kin_claim_documents (
        id,
        tenant_id,
        claim_id,
        file_id,
        document_type
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      claimId,
      fileId,
      documentType,
    ]
  );

  return id;
};

const findClaimById = async ({
  tenantId,
  claimId,
  connection = null,
}) => {
  const executor =
    connection || db;

  const [rows] =
    await executor.query(
      `
        SELECT *
        FROM next_of_kin_claims
        WHERE id = ?
          AND tenant_id = ?
        LIMIT 1
      `,
      [
        claimId,
        tenantId,
      ]
    );

  return rows[0] || null;
};

const findClaimDocuments = async ({
  tenantId,
  claimId,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          ncd.id,
          ncd.document_type,
          ncd.file_id,
          pf.original_name,
          pf.mime_type,
          pf.size_bytes,
          ncd.created_at
        FROM next_of_kin_claim_documents ncd
        INNER JOIN private_files pf
  ON pf.id = ncd.file_id
 AND pf.tenant_id = ncd.tenant_id
        WHERE ncd.tenant_id = ?
          AND ncd.claim_id = ?
          AND pf.status = 'active'
        ORDER BY ncd.created_at ASC
      `,
      [
        tenantId,
        claimId,
      ]
    );

  return rows;
};

const findClaimsByUser = async ({
  tenantId,
  userId,
  status = null,
  limit = 20,
  offset = 0,
}) => {
  const conditions = [
    "tenant_id = ?",
    "claimant_user_id = ?",
  ];

  const values = [
    tenantId,
    userId,
  ];

  if (status) {
    conditions.push(
      "status = ?"
    );

    values.push(
      status
    );
  }

  values.push(
    limit,
    offset
  );

  const [rows] =
    await db.query(
      `
        SELECT *
        FROM next_of_kin_claims
        WHERE ${conditions.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT ?
        OFFSET ?
      `,
      values
    );

  return rows;
};

const countClaimsByUser = async ({
  tenantId,
  userId,
  status = null,
}) => {
  const conditions = [
    "tenant_id = ?",
    "claimant_user_id = ?",
  ];

  const values = [
    tenantId,
    userId,
  ];

  if (status) {
    conditions.push(
      "status = ?"
    );

    values.push(
      status
    );
  }

  const row =
    await one(
      `
        SELECT COUNT(*) AS total
        FROM next_of_kin_claims
        WHERE ${conditions.join(" AND ")}
      `,
      values
    );

  return Number(
    row?.total || 0
  );
};

const findClaimsByTenant = async ({
  tenantId,
  status = null,
  limit = 20,
  offset = 0,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];

  const values = [
    tenantId,
  ];

  if (status) {
    conditions.push(
      "status = ?"
    );

    values.push(
      status
    );
  }

  values.push(
    limit,
    offset
  );

  const [rows] =
    await db.query(
      `
        SELECT *
        FROM next_of_kin_claims
        WHERE ${conditions.join(" AND ")}
        ORDER BY created_at DESC
        LIMIT ?
        OFFSET ?
      `,
      values
    );

  return rows;
};

const findClaimFile = async ({
  tenantId,
  claimId,
  fileId,
}) => {
  const row =
    await one(
      `
        SELECT
          pf.id,
          pf.tenant_id,
          pf.user_id,
          pf.module,
          pf.document_type,
          pf.original_name,
          pf.stored_name,
          pf.mime_type,
          pf.size_bytes,
          pf.storage_path,
          pf.status,
          pf.created_at
        FROM next_of_kin_claim_documents ncd
        INNER JOIN private_files pf
          ON pf.id = ncd.file_id
         AND pf.tenant_id = ncd.tenant_id
        WHERE ncd.tenant_id = ?
          AND ncd.claim_id = ?
          AND ncd.file_id = ?
          AND pf.status = 'active'
        LIMIT 1
      `,
      [
        tenantId,
        claimId,
        fileId,
      ]
    );

  return row;
};

const countClaimsByTenant = async ({
  tenantId,
  status = null,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];

  const values = [
    tenantId,
  ];

  if (status) {
    conditions.push(
      "status = ?"
    );

    values.push(
      status
    );
  }

  const row =
    await one(
      `
        SELECT COUNT(*) AS total
        FROM next_of_kin_claims
        WHERE ${conditions.join(" AND ")}
      `,
      values
    );

  return Number(
    row?.total || 0
  );
};

const updateClaimStatus = async ({
  tenantId,
  claimId,
  currentStatus,
  status,
  rejectionReason = null,
  moreInformationRequest = null,
}) => {
  const reviewedAtStatuses =
    new Set([
      "under_review",
      "more_information_required",
      "approved",
      "rejected",
      "completed",
    ]);

  const shouldSetReviewedAt =
    reviewedAtStatuses.has(
      status
    );

  const shouldSetApprovedAt =
    status === "approved";

  const shouldSetCompletedAt =
    status === "completed";

  const shouldSetMoreInformationAt =
    status ===
    "more_information_required";

  const [result] =
    await db.query(
      `
        UPDATE next_of_kin_claims
        SET
          status = ?,

          rejection_reason = ?,

          more_information_request =
            CASE
              WHEN ?
              THEN ?
              ELSE more_information_request
            END,

          more_information_requested_at =
            CASE
              WHEN ?
              THEN NOW()
              ELSE more_information_requested_at
            END,

          reviewed_at =
            CASE
              WHEN ?
              THEN COALESCE(
                reviewed_at,
                NOW()
              )
              ELSE reviewed_at
            END,

          approved_at =
            CASE
              WHEN ?
              THEN COALESCE(
                approved_at,
                NOW()
              )
              ELSE approved_at
            END,

          completed_at =
            CASE
              WHEN ?
              THEN COALESCE(
                completed_at,
                NOW()
              )
              ELSE completed_at
            END

        WHERE id = ?
          AND tenant_id = ?
          AND status = ?
      `,
      [
        status,

        rejectionReason,

        shouldSetMoreInformationAt
          ? 1
          : 0,

        moreInformationRequest,

        shouldSetMoreInformationAt
          ? 1
          : 0,

        shouldSetReviewedAt
          ? 1
          : 0,

        shouldSetApprovedAt
          ? 1
          : 0,

        shouldSetCompletedAt
          ? 1
          : 0,

        claimId,
        tenantId,
        currentStatus,
      ]
    );

  if (
    result.affectedRows !== 1
  ) {
    return null;
  }

  return findClaimById({
    tenantId,
    claimId,
  });
};

const findTenantClaimReviewers = async ({
  tenantId,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT DISTINCT
          u.id AS user_id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.email,

          r.id AS role_id,
          r.name AS role_name,
          r.code AS role_code

        FROM tenant_memberships tm

        INNER JOIN users u
          ON u.id = tm.user_id

        INNER JOIN roles r
          ON r.id = tm.role_id
         AND (
           r.tenant_id = tm.tenant_id
           OR r.tenant_id IS NULL
         )

        INNER JOIN role_permissions rp
          ON rp.role_id = r.id

        INNER JOIN permissions p
          ON p.id = rp.permission_id

        WHERE tm.tenant_id = ?
          AND tm.status = 'active'
          AND u.status = 'active'
          AND u.deleted_at IS NULL
          AND r.is_active = 1
          AND p.code = 'next_of_kin.claims.review'

        ORDER BY
          u.first_name ASC,
          u.last_name ASC
      `,
      [
        tenantId,
      ]
    );

  return rows;
};

const submitAdditionalInformation = async ({
  connection = null,
  tenantId,
  claimId,
  currentStatus,
  message,
}) => {
  const executor =
    connection || db;

  const [result] =
    await executor.query(
      `
        UPDATE next_of_kin_claims
        SET
          status = 'under_review',

          additional_information_response = ?,

          additional_information_responded_at =
            NOW(),

          reviewed_at =
            COALESCE(
              reviewed_at,
              NOW()
            )

        WHERE id = ?
          AND tenant_id = ?
          AND status = ?
      `,
      [
        message,
        claimId,
        tenantId,
        currentStatus,
      ]
    );

  if (
    result.affectedRows !== 1
  ) {
    return null;
  }

  return findClaimById({
    tenantId,
    claimId,
    connection,
  });
};

module.exports = {
  db,

  createPrivateFileRecord,
  findPrivateFileById,

  findAccountByNumber,

  createClaim,
  createClaimDocument,

  findClaimById,
  findClaimDocuments,

  findClaimsByUser,
  countClaimsByUser,
  findClaimsByTenant,
  countClaimsByTenant,
  updateClaimStatus,
  findClaimFile,
  findTenantClaimReviewers,

  submitAdditionalInformation,
};