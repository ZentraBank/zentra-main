const { randomUUID } = require("crypto");
const db = require("../../config/db");

const findByUser = async ({
  tenantId,
  userId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM kyc_profiles
      WHERE tenant_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [tenantId, userId]
  );

  return rows[0] || null;
};

const findById = async ({
  tenantId,
  profileId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        kp.*,

        CONCAT_WS(
          ' ',
          u.first_name,
          u.middle_name,
          u.last_name
        ) AS customer_name,

        u.email AS customer_email

      FROM kyc_profiles kp

      INNER JOIN users u
        ON u.id = kp.user_id

      WHERE kp.id = ?
        AND kp.tenant_id = ?

      LIMIT 1
    `,
    [
      profileId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const identityExists = async ({
  tenantId,
  identityType,
  identityNumber,
  excludeProfileId = null,
}) => {
  const values = [
    tenantId,
    identityType,
    identityNumber,
  ];

  let excludeClause = "";

  if (excludeProfileId) {
    excludeClause = "AND id <> ?";
    values.push(excludeProfileId);
  }

  const [rows] = await db.query(
    `
      SELECT id
      FROM kyc_profiles
      WHERE tenant_id = ?
        AND identity_type = ?
        AND identity_number = ?
        ${excludeClause}
      LIMIT 1
    `,
    values
  );

  return Boolean(rows[0]);
};

const create = async ({
  tenantId,
  userId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO kyc_profiles (
        id,
        tenant_id,
        user_id,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        nationality,
        phone_number,
        residential_address,
        city,
        state_region,
        postal_code,
        country,
        identity_type,
        identity_number,
        identity_expiry_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      body.firstName,
      body.middleName || null,
      body.lastName,
      body.dateOfBirth,
      body.nationality,
      body.phoneNumber,
      body.residentialAddress,
      body.city,
      body.stateRegion || null,
      body.postalCode || null,
      body.country,
      body.identityType,
      body.identityNumber,
      body.identityExpiryDate || null,
    ]
  );

  return findById({
    tenantId,
    profileId: id,
  });
};

const update = async ({
  tenantId,
  profileId,
  body,
}) => {
  await db.query(
    `
      UPDATE kyc_profiles
      SET
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        date_of_birth = ?,
        nationality = ?,
        phone_number = ?,
        residential_address = ?,
        city = ?,
        state_region = ?,
        postal_code = ?,
        country = ?,
        identity_type = ?,
        identity_number = ?,
        identity_expiry_date = ?,
        status = 'draft',
        rejection_reason = NULL,
        reviewed_by = NULL,
        reviewed_at = NULL
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      body.firstName,
      body.middleName || null,
      body.lastName,
      body.dateOfBirth,
      body.nationality,
      body.phoneNumber,
      body.residentialAddress,
      body.city,
      body.stateRegion || null,
      body.postalCode || null,
      body.country,
      body.identityType,
      body.identityNumber,
      body.identityExpiryDate || null,
      profileId,
      tenantId,
    ]
  );

  return findById({
    tenantId,
    profileId,
  });
};

const addDocument = async ({
  tenantId,
  profileId,
  userId,
  documentType,
  fileUrl,
  fileName,
  mimeType,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO kyc_documents (
        id,
        tenant_id,
        kyc_profile_id,
        user_id,
        document_type,
        file_url,
        file_name,
        mime_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      profileId,
      userId,
      documentType,
      fileUrl,
      fileName || null,
      mimeType || null,
    ]
  );

  return id;
};

const listDocuments = async ({
  tenantId,
  profileId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM kyc_documents
      WHERE tenant_id = ?
        AND kyc_profile_id = ?
      ORDER BY created_at ASC
    `,
    [tenantId, profileId]
  );

  return rows;
};

const findAdminApplicationById = async ({
  tenantId,
  profileId,
}) => {
  const profile =
    await findById({
      tenantId,
      profileId,
    });

  if (!profile) {
    return null;
  }

  const documents =
    await listDocuments({
      tenantId,
      profileId,
    });

  return {
    ...profile,
    documents,
  };
};

const submit = async ({
  tenantId,
  profileId,
}) => {
  await db.query(
    `
      UPDATE kyc_profiles
      SET
        status = 'submitted',
        submitted_at = NOW(),
        rejection_reason = NULL
      WHERE id = ?
        AND tenant_id = ?
    `,
    [profileId, tenantId]
  );

  return findById({
    tenantId,
    profileId,
  });
};

const setReviewStatus = async ({
  tenantId,
  profileId,
  reviewerId,
  status,
  riskLevel,
  rejectionReason,
}) => {
  await db.query(
    `
      UPDATE kyc_profiles
      SET
        status = ?,
        risk_level = ?,
        rejection_reason = ?,
        reviewed_by = ?,
        reviewed_at = NOW(),
        approved_at = IF(? = 'approved', NOW(), approved_at)
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      status,
      riskLevel || null,
      rejectionReason || null,
      reviewerId,
      status,
      profileId,
      tenantId,
    ]
  );

  return findById({
    tenantId,
    profileId,
  });
};

const listPending = async ({
  tenantId,
  status,
  limit,
  offset,
}) => {
  const [rows] = await db.query(
    `
      SELECT kp.*,
        CONCAT_WS(
          ' ',
          u.first_name,
          u.middle_name,
          u.last_name
        ) AS customer_name,
        u.email AS customer_email
      FROM kyc_profiles kp
      LEFT JOIN users u
        ON u.id = kp.user_id
      WHERE kp.tenant_id = ?
        AND kp.status = ?
      ORDER BY kp.submitted_at ASC
      LIMIT ? OFFSET ?
    `,
    [
      tenantId,
      status,
      limit,
      offset,
    ]
  );

  return rows;
};

const createEvent = async ({
  tenantId,
  profileId,
  userId,
  actorUserId,
  eventType,
  metadata = null,
}) => {
  await db.query(
    `
      INSERT INTO kyc_events (
        id,
        tenant_id,
        kyc_profile_id,
        user_id,
        actor_user_id,
        event_type,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      profileId,
      userId,
      actorUserId,
      eventType,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );
};

module.exports = {
  findByUser,
  findById,
  identityExists,
  create,
  update,
  addDocument,
  listDocuments,
  submit,
  setReviewStatus,
  listPending,
  createEvent,
  findAdminApplicationById,
};
