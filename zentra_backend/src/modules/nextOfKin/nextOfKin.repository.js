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
};