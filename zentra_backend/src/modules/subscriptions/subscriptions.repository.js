const {
  randomUUID,
} = require("crypto");

const db = require("../../config/db");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const one = async (
  sql,
  params = [],
  connection = db
) => {
  const [rows] =
    await connection.query(
      sql,
      params
    );

  return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Subscription plans
|--------------------------------------------------------------------------
*/

const listPlans = async ({
  tenantId
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          id,
          name,
          code,
          price,
          currency,
          billing_interval
        FROM subscription_plans
        WHERE tenant_id = ?
          AND is_active = TRUE
        ORDER BY price ASC
      `,
      [
        tenantId
      ]
    );

  return rows;
};

const findPlanByCode = ({
  tenantId,
  planCode
}) =>
  one(
    `
      SELECT
        *
      FROM subscription_plans
      WHERE tenant_id = ?
        AND LOWER(code) = LOWER(?)
        AND is_active = TRUE
      LIMIT 1
    `,
    [
      tenantId,
      planCode
    ]
  );

/*
|--------------------------------------------------------------------------
| Active subscription
|--------------------------------------------------------------------------
*/

const findActiveSubscription = ({
  tenantId,
  userId
}) =>
  one(
    `
      SELECT
        us.*,
        sp.name AS plan_name,
        sp.code AS plan_code,
        sp.price AS plan_price,
        sp.currency AS plan_currency,
        sp.billing_interval AS plan_billing_interval
      FROM user_subscriptions us
      JOIN subscription_plans sp
        ON sp.id = us.plan_id
      WHERE us.tenant_id = ?
        AND us.user_id = ?
        AND us.status = 'active'
        AND (
          us.expires_at IS NULL
          OR us.expires_at > NOW()
        )
      ORDER BY us.created_at DESC
      LIMIT 1
    `,
    [
      tenantId,
      userId
    ]
  );

  /*
|--------------------------------------------------------------------------
| Active tenant subscription
|--------------------------------------------------------------------------
|
| Subscription entitlements belong to the tenant.
|
| user_id remains useful for identifying who purchased / owns the
| subscription, but access to paid features is resolved by tenant_id.
|
*/

const findActiveTenantSubscription = ({
  tenantId,
  connection = db,
}) =>
  one(
    `
      SELECT
        us.id,
        us.tenant_id,
        us.user_id,
        us.plan_id,
        us.status,
        us.starts_at,
        us.expires_at,
        us.created_at,
        us.updated_at,

        sp.name AS plan_name,
        sp.code AS plan_code,
        sp.price AS plan_price,
        sp.currency AS plan_currency,
        sp.billing_interval AS plan_billing_interval

      FROM user_subscriptions us

      INNER JOIN subscription_plans sp
        ON sp.id = us.plan_id

      WHERE us.tenant_id = ?
        AND us.status = 'active'
        AND sp.is_active = TRUE
        AND (
          us.expires_at IS NULL
          OR us.expires_at > NOW()
        )

      ORDER BY
        us.starts_at DESC,
        us.created_at DESC

      LIMIT 1
    `,
    [
      tenantId,
    ],
    connection
  );

/*
|--------------------------------------------------------------------------
| Plan features
|--------------------------------------------------------------------------
*/

const listPlanFeatures = async ({
  planId,
  connection = db,
}) => {
  const [rows] =
    await connection.query(
      `
        SELECT
          id,
          plan_id,
          feature_key,
          is_enabled,
          feature_value
        FROM plan_features
        WHERE plan_id = ?
        ORDER BY feature_key ASC
      `,
      [
        planId,
      ]
    );

  return rows;
};
/*
|--------------------------------------------------------------------------
| Open subscription request
|--------------------------------------------------------------------------
*/

const findOpenRequest = ({
  tenantId,
  userId
}) =>
  one(
    `
      SELECT
        sr.*,
        sp.name AS plan_name,
        sp.code AS plan_code,
        sp.price AS plan_price,
        sp.currency AS plan_currency,
        sp.billing_interval AS plan_billing_interval
      FROM subscription_requests sr
      JOIN subscription_plans sp
        ON sp.id = sr.plan_id
      WHERE sr.tenant_id = ?
        AND sr.user_id = ?
        AND sr.status IN (
          'pending_payment',
          'payment_submitted'
        )
      ORDER BY sr.created_at DESC
      LIMIT 1
    `,
    [
      tenantId,
      userId
    ]
  );

/*
|--------------------------------------------------------------------------
| Find request
|--------------------------------------------------------------------------
*/

const findRequestById = ({
  tenantId,
  requestId,
  connection = db,
  forUpdate = false
}) =>
  one(
    `
      SELECT
        sr.*,
        sp.name AS plan_name,
        sp.code AS plan_code,
        sp.price AS plan_price,
        sp.currency AS plan_currency,
        sp.billing_interval AS plan_billing_interval
      FROM subscription_requests sr
      JOIN subscription_plans sp
        ON sp.id = sr.plan_id
      WHERE sr.id = ?
        AND sr.tenant_id = ?
      LIMIT 1
      ${
        forUpdate
          ? "FOR UPDATE"
          : ""
      }
    `,
    [
      requestId,
      tenantId
    ],
    connection
  );

/*
|--------------------------------------------------------------------------
| Create subscription request
|--------------------------------------------------------------------------
*/

const createRequest = async ({
  tenantId,
  userId,
  planId
}) => {
  const id =
    randomUUID();

  await db.query(
    `
      INSERT INTO subscription_requests (
        id,
        tenant_id,
        user_id,
        plan_id,
        status
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        'pending_payment'
      )
    `,
    [
      id,
      tenantId,
      userId,
      planId
    ]
  );

  return findRequestById({
    tenantId,
    requestId: id
  });
};

/*
|--------------------------------------------------------------------------
| Submit payment proof
|--------------------------------------------------------------------------
*/

const submitProof = async ({
  tenantId,
  userId,
  requestId,
  paymentReference,
  paymentProofFileId,
  paymentNote,
}) => {
  const [result] =
    await db.query(
      `
        UPDATE subscription_requests
        SET
          status = 'payment_submitted',
          payment_reference = ?,
          payment_proof_file_id = ?,
          payment_note = ?,
          updated_at = NOW()
        WHERE id = ?
          AND tenant_id = ?
          AND user_id = ?
          AND status = 'pending_payment'
      `,
      [
        paymentReference || null,
        paymentProofFileId || null,
        paymentNote || null,
        requestId,
        tenantId,
        userId,
      ]
    );

  return (
    result.affectedRows === 1
  );
};

/*
|--------------------------------------------------------------------------
| Pending payment reviews
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Private payment proof files
|--------------------------------------------------------------------------
*/

const createPrivateFileRecord =
  async ({
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
          storage_path,
          status
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'active'
        )
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
      SELECT
        *
      FROM private_files
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'active'
      LIMIT 1
    `,
    [
      fileId,
      tenantId,
    ]
  );

const listPending = async ({
  tenantId,
  limit,
  offset
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          sr.*,
          sp.name AS plan_name,
          sp.code AS plan_code,
          sp.price AS plan_price,
          sp.currency AS plan_currency,
          u.email AS user_email,
          u.full_name AS user_name
        FROM subscription_requests sr
        JOIN subscription_plans sp
          ON sp.id = sr.plan_id
        JOIN users u
          ON u.id = sr.user_id
        WHERE sr.tenant_id = ?
          AND sr.status = 'payment_submitted'
        ORDER BY sr.created_at ASC
        LIMIT ?
        OFFSET ?
      `,
      [
        tenantId,
        limit,
        offset
      ]
    );

  return rows;
};

/*
|--------------------------------------------------------------------------
| Expire active subscription
|--------------------------------------------------------------------------
*/

const expireActive = ({
  connection,
  tenantId,
  userId
}) =>
  connection.query(
    `
      UPDATE user_subscriptions
      SET
        status = 'expired',
        expires_at =
          COALESCE(
            expires_at,
            NOW()
          ),
        updated_at = NOW()
      WHERE tenant_id = ?
        AND user_id = ?
        AND status = 'active'
    `,
    [
      tenantId,
      userId
    ]
  );

/*
|--------------------------------------------------------------------------
| Create active subscription
|--------------------------------------------------------------------------
*/

const createSubscription = async ({
  connection,
  tenantId,
  userId,
  planId,
  startsAt,
  expiresAt
}) => {
  const id =
    randomUUID();

  await connection.query(
    `
      INSERT INTO user_subscriptions (
        id,
        tenant_id,
        user_id,
        plan_id,
        status,
        starts_at,
        expires_at
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        'active',
        ?,
        ?
      )
    `,
    [
      id,
      tenantId,
      userId,
      planId,
      startsAt,
      expiresAt
    ]
  );

  return id;
};

/*
|--------------------------------------------------------------------------
| Approve request
|--------------------------------------------------------------------------
*/

const approveRequest = async ({
  connection,
  tenantId,
  requestId,
  reviewerUserId
}) =>
  connection.query(
    `
      UPDATE subscription_requests
      SET
        status = 'approved',
        reviewed_by = ?,
        reviewed_at = NOW(),
        rejection_reason = NULL,
        updated_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'payment_submitted'
    `,
    [
      reviewerUserId,
      requestId,
      tenantId
    ]
  );

/*
|--------------------------------------------------------------------------
| Reject request
|--------------------------------------------------------------------------
*/

const rejectRequest = async ({
  tenantId,
  requestId,
  reviewerUserId,
  reason
}) => {
  const [result] =
    await db.query(
      `
        UPDATE subscription_requests
        SET
          status = 'rejected',
          reviewed_by = ?,
          reviewed_at = NOW(),
          rejection_reason = ?,
          updated_at = NOW()
        WHERE id = ?
          AND tenant_id = ?
          AND status = 'payment_submitted'
      `,
      [
        reviewerUserId,
        reason,
        requestId,
        tenantId
      ]
    );

  return (
    result.affectedRows === 1
  );
};

/*
|--------------------------------------------------------------------------
| Find onboarding session
|--------------------------------------------------------------------------
|
| Only the SHA-256 hash of the browser token is stored in the database.
|
| This ensures that knowing:
|
| tenantId
| userId
| email
|
| is NOT enough to access onboarding subscription endpoints.
|
*/

const findOnboardingSession = ({
  tokenHash
}) =>
  one(
    `
      SELECT
        tos.id,
        tos.tenant_id,
        tos.user_id,
        tos.token_hash,
        tos.expires_at,
        tos.consumed_at,
        tos.created_at,

        t.name AS tenant_name,
        t.slug AS tenant_code,
        t.status AS tenant_status,

        u.email AS user_email,
        u.status AS user_status

      FROM tenant_onboarding_sessions tos

      JOIN tenants t
        ON t.id = tos.tenant_id

      JOIN users u
        ON u.id = tos.user_id

      WHERE tos.token_hash = ?
        AND tos.consumed_at IS NULL
        AND tos.expires_at > NOW()
        AND t.deleted_at IS NULL

      LIMIT 1
    `,
    [
      tokenHash
    ]
  );

/*
|--------------------------------------------------------------------------
| Consume onboarding session
|--------------------------------------------------------------------------
|
| We won't call this immediately after payment-proof submission.
|
| The tenant still needs this token to view:
|   /subscriptions/onboarding/status
|
| We can consume it after activation or after a normal login is established.
|
*/

const consumeOnboardingSession = async ({
  tokenHash,
  connection = db
}) => {
  const [result] =
    await connection.query(
      `
        UPDATE tenant_onboarding_sessions
        SET
          consumed_at = NOW(),
          updated_at = NOW()
        WHERE token_hash = ?
          AND consumed_at IS NULL
          AND expires_at > NOW()
      `,
      [
        tokenHash
      ]
    );

  return (
    result.affectedRows === 1
  );
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  db,

  listPlans,
  findPlanByCode,

  findActiveSubscription,

  findOpenRequest,
  findRequestById,
  createRequest,

  submitProof,
  createPrivateFileRecord,
  findPrivateFileById,

  listPending,

  expireActive,
  createSubscription,

  approveRequest,
  rejectRequest,

  findOnboardingSession,
  consumeOnboardingSession,
  findActiveTenantSubscription,
  listPlanFeatures,

};