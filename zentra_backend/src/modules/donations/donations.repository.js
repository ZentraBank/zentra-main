const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createDonor = async ({
  tenantId,
  createdBy,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO donors (
        id,
        tenant_id,
        created_by,
        full_name,
        email,
        phone_number,
        profile_image_url,
        address,
        country,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      createdBy,
      body.fullName,
      body.email || null,
      body.phoneNumber || null,
      body.profileImageUrl || null,
      body.address || null,
      body.country || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findDonorById({
    tenantId,
    donorId: id,
  });
};

const findDonorById = async ({
  tenantId,
  donorId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM donors
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
    `,
    [donorId, tenantId]
  );

  return rows[0] || null;
};

const listDonors = async ({
  tenantId,
  status,
  search,
  excludeDonorId = null,
  limit,
  offset,
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

    values.push(status);
  }

  if (excludeDonorId) {
    conditions.push(
      "id <> ?"
    );

    values.push(excludeDonorId);
  }

  if (search) {
    conditions.push(
      `(full_name LIKE ?
        OR email LIKE ?
        OR phone_number LIKE ?)`
    );

    const term =
      `%${search}%`;

    values.push(
      term,
      term,
      term
    );
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM donors
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return rows;
};

const updateDonor = async ({
  tenantId,
  donorId,
  body,
}) => {
  await db.query(
    `
      UPDATE donors
      SET
        full_name = COALESCE(?, full_name),
        email = COALESCE(?, email),
        phone_number = COALESCE(?, phone_number),
        profile_image_url = COALESCE(?, profile_image_url),
        address = COALESCE(?, address),
        country = COALESCE(?, country),
        status = COALESCE(?, status),
        metadata = COALESCE(?, metadata)
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      body.fullName,
      body.email,
      body.phoneNumber,
      body.profileImageUrl,
      body.address,
      body.country,
      body.status,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
      donorId,
      tenantId,
    ]
  );

  return findDonorById({
    tenantId,
    donorId,
  });
};

const findAccountById = async ({
  tenantId,
  accountId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM accounts
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
    `,
    [accountId, tenantId]
  );

  return rows[0] || null;
};

const createDonationRequest = async ({
  tenantId,
  donorId,
  beneficiaryUserId,
  accountId,
  amount,
  currency,
  purpose,
  appreciation,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO donation_requests (
        id,
        tenant_id,
        donor_id,
        beneficiary_user_id,
        account_id,
        amount,
        currency,
        purpose,
        appreciation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      donorId,
      beneficiaryUserId,
      accountId,
      amount,
      currency,
      purpose || null,
      appreciation || null,
    ]
  );

  return findDonationRequestById({
    tenantId,
    requestId: id,
  });
};

const findDonationRequestById = async ({
  tenantId,
  requestId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        dr.*,
        d.full_name AS donor_name,
        d.email AS donor_email,
        a.account_number,
        a.account_name
      FROM donation_requests dr
      INNER JOIN donors d
        ON d.id = dr.donor_id
      INNER JOIN accounts a
        ON a.id = dr.account_id
      WHERE dr.id = ?
        AND dr.tenant_id = ?
      LIMIT 1
    `,
    [
      requestId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const listDonationRequests = async ({
  tenantId,
  userId,
  status,
  adminView,
  limit,
  offset,
}) => {
  const conditions = [
    "dr.tenant_id = ?",
  ];

  const values = [
    tenantId,
  ];

  if (!adminView) {
    conditions.push(
      "dr.beneficiary_user_id = ?"
    );
    values.push(userId);
  }

  if (status) {
    conditions.push(
      "dr.status = ?"
    );
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT
        dr.*,
        d.full_name AS donor_name,
        a.account_number,
        a.account_name
      FROM donation_requests dr
      INNER JOIN donors d
        ON d.id = dr.donor_id
      INNER JOIN accounts a
        ON a.id = dr.account_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY dr.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return rows;
};

const updateDonationRequestStatus = async ({
  tenantId,
  requestId,
  status,
  actorUserId,
  rejectionReason,
}) => {
  const fields = [
    "status = ?",
  ];

  const values = [
    status,
  ];

  if (status === "approved") {
    fields.push(
      "approved_by = ?",
      "approved_at = NOW()"
    );
    values.push(actorUserId);
  }

  if (status === "rejected") {
    fields.push(
      "rejected_by = ?",
      "rejected_at = NOW()",
      "rejection_reason = ?"
    );
    values.push(
      actorUserId,
      rejectionReason || null
    );
  }

  values.push(
    requestId,
    tenantId
  );

  await db.query(
    `
      UPDATE donation_requests
      SET ${fields.join(", ")}
      WHERE id = ?
        AND tenant_id = ?
    `,
    values
  );

  return findDonationRequestById({
    tenantId,
    requestId,
  });
};

const createRedemption = async ({
  tenantId,
  requestId,
  userId,
  amount,
  currency,
  otpHash,
  otpExpiresAt,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO donation_redemptions (
        id,
        tenant_id,
        donation_request_id,
        user_id,
        amount,
        currency,
        otp_hash,
        otp_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      requestId,
      userId,
      amount,
      currency,
      otpHash,
      otpExpiresAt,
    ]
  );

  return findRedemptionById({
    tenantId,
    redemptionId: id,
  });
};

const findRedemptionById = async ({
  tenantId,
  redemptionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM donation_redemptions
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
    `,
    [
      redemptionId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const incrementOtpAttempts = ({
  tenantId,
  redemptionId,
}) =>
  db.query(
    `
      UPDATE donation_redemptions
      SET otp_attempts = otp_attempts + 1
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      redemptionId,
      tenantId,
    ]
  );

const markOtpVerified = async ({
  tenantId,
  redemptionId,
}) => {
  await db.query(
    `
      UPDATE donation_redemptions
      SET
        otp_verified_at = NOW(),
        status = 'approved'
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      redemptionId,
      tenantId,
    ]
  );

  return findRedemptionById({
    tenantId,
    redemptionId,
  });
};

const completeRedemption = async ({
  connection = db,
  tenantId,
  redemptionId,
  requestId,
}) => {
  await connection.query(
    `
      UPDATE donation_redemptions
      SET status = 'completed'
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      redemptionId,
      tenantId,
    ]
  );

  await connection.query(
    `
      UPDATE donation_requests
      SET status = 'redeemed'
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      requestId,
      tenantId,
    ]
  );
};

const createEvent = async ({
  connection = db,
  tenantId,
  requestId = null,
  redemptionId = null,
  actorUserId = null,
  eventType,
  metadata = null,
}) => {
  await connection.query(
    `
      INSERT INTO donation_events (
        id,
        tenant_id,
        donation_request_id,
        redemption_id,
        actor_user_id,
        event_type,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      requestId,
      redemptionId,
      actorUserId,
      eventType,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );
};

module.exports = {
  db,
  createDonor,
  findDonorById,
  listDonors,
  updateDonor,
  findAccountById,
  createDonationRequest,
  findDonationRequestById,
  listDonationRequests,
  updateDonationRequestStatus,
  createRedemption,
  findRedemptionById,
  incrementOtpAttempts,
  markOtpVerified,
  completeRedemption,
  createEvent,
};
