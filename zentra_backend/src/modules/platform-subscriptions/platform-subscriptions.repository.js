const { randomUUID } = require("crypto");
const db = require("../../config/db");

const listPlans = async ({
  page,
  limit,
  search,
  status,
}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push(
      "(code LIKE ? OR name LIKE ? OR description LIKE ?)"
    );

    const term = `%${search}%`;
    values.push(term, term, term);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await db.query(
    `
      SELECT
        id,
        code,
        name,
        description,
        billing_interval,
        price,
        currency,
        status,
        is_public,
        created_at,
        updated_at
      FROM subscription_plans
      ${where}
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
    `,
    [...values, limit, offset]
  );

  const [countRows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM subscription_plans
      ${where}
    `,
    values
  );

  const total = Number(countRows[0]?.total || 0);

  return {
    rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(
        1,
        Math.ceil(total / limit)
      ),
    },
  };
};

const findPlanById = async (planId) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
    `,
    [planId]
  );

  return rows[0] || null;
};

const findPlanByCode = async (code) => {
  const [rows] = await db.query(
    `
      SELECT id
      FROM subscription_plans
      WHERE code = ?
      LIMIT 1
    `,
    [code]
  );

  return rows[0] || null;
};

const listPlanFeatures = async (planId) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        plan_id,
        feature_code,
        is_enabled,
        usage_limit,
        metadata,
        created_at,
        updated_at
      FROM subscription_plan_features
      WHERE plan_id = ?
      ORDER BY feature_code ASC
    `,
    [planId]
  );

  return rows;
};

const createPlan = async ({
  connection,
  body,
  actorUserId,
}) => {
  const planId = randomUUID();

  await connection.query(
    `
      INSERT INTO subscription_plans (
        id,
        code,
        name,
        description,
        billing_interval,
        price,
        currency,
        status,
        is_public,
        created_by,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      planId,
      body.code,
      body.name,
      body.description || null,
      body.billingInterval,
      body.price,
      body.currency,
      body.status || "draft",
      Boolean(body.isPublic),
      actorUserId,
      actorUserId,
    ]
  );

  return planId;
};

const replacePlanFeatures = async ({
  connection,
  planId,
  features,
}) => {
  await connection.query(
    `
      DELETE FROM subscription_plan_features
      WHERE plan_id = ?
    `,
    [planId]
  );

  for (const feature of features) {
    await connection.query(
      `
        INSERT INTO subscription_plan_features (
          id,
          plan_id,
          feature_code,
          is_enabled,
          usage_limit,
          metadata
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        planId,
        feature.featureCode,
        feature.isEnabled,
        feature.usageLimit ?? null,
        feature.metadata
          ? JSON.stringify(feature.metadata)
          : null,
      ]
    );
  }
};

const updatePlan = async ({
  planId,
  body,
  actorUserId,
}) => {
  await db.query(
    `
      UPDATE subscription_plans
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        billing_interval = COALESCE(?, billing_interval),
        price = COALESCE(?, price),
        currency = COALESCE(?, currency),
        status = COALESCE(?, status),
        is_public = COALESCE(?, is_public),
        updated_by = ?
      WHERE id = ?
    `,
    [
      body.name ?? null,
      body.description ?? null,
      body.billingInterval ?? null,
      body.price ?? null,
      body.currency ?? null,
      body.status ?? null,
      body.isPublic ?? null,
      actorUserId,
      planId,
    ]
  );

  return findPlanById(planId);
};

const findTenantSubscription = async (tenantId) => {
  const [rows] = await db.query(
    `
      SELECT
        us.*,

        p.code AS plan_code,
        p.name AS plan_name,
        p.price AS plan_price,
        p.currency AS plan_currency,
        p.billing_interval AS plan_billing_interval,

        u.email AS user_email

      FROM user_subscriptions us

      INNER JOIN subscription_plans p
        ON p.id = us.plan_id

      INNER JOIN users u
        ON u.id = us.user_id

      WHERE us.tenant_id = ?

      ORDER BY
        CASE
          WHEN us.status = 'active' THEN 0
          WHEN us.status = 'pending' THEN 1
          ELSE 2
        END,
        us.created_at DESC

      LIMIT 1
    `,
    [tenantId]
  );

  return rows[0] || null;
};
const updateTenantSubscription = async ({
  tenantId,
  subscriptionId,
  planId,
  status,
  startsAt,
  expiresAt,
}) => {
  await db.query(
    `
      UPDATE user_subscriptions

      SET
        plan_id = COALESCE(?, plan_id),
        status = COALESCE(?, status),
        starts_at = COALESCE(?, starts_at),
        expires_at = COALESCE(?, expires_at),
        updated_at = NOW()

      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      planId ?? null,
      status ?? null,
      startsAt ?? null,
      expiresAt ?? null,
      subscriptionId,
      tenantId,
    ]
  );

  return findTenantSubscription(tenantId);
};

const createSubscriptionHistory = async ({
  tenantId,
  subscriptionId,
  previousPlanId,
  newPlanId,
  action,
  previousStatus,
  newStatus,
  reason,
  actorUserId,
}) => {
  await db.query(
    `
      INSERT INTO tenant_subscription_history (
        id,
        tenant_id,
        subscription_id,
        previous_plan_id,
        new_plan_id,
        action,
        previous_status,
        new_status,
        reason,
        performed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      subscriptionId,
      previousPlanId || null,
      newPlanId || null,
      action,
      previousStatus || null,
      newStatus || null,
      reason || null,
      actorUserId,
    ]
  );
};

const listTenantSubscriptionHistory = async ({
  tenantId,
  limit,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM tenant_subscription_history
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [tenantId, limit]
  );

  return rows;
};

const upsertTenantOverride = async ({
  tenantId,
  subscriptionId,
  body,
  actorUserId,
}) => {
  await db.query(
    `
      INSERT INTO tenant_subscription_overrides (
        id,
        tenant_id,
        subscription_id,
        custom_price,
        custom_currency,
        custom_billing_interval,
        contract_start_at,
        contract_end_at,
        notes,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        custom_price = VALUES(custom_price),
        custom_currency = VALUES(custom_currency),
        custom_billing_interval =
          VALUES(custom_billing_interval),
        contract_start_at = VALUES(contract_start_at),
        contract_end_at = VALUES(contract_end_at),
        notes = VALUES(notes),
        updated_by = VALUES(updated_by)
    `,
    [
      randomUUID(),
      tenantId,
      subscriptionId,
      body.customPrice ?? null,
      body.customCurrency ?? null,
      body.customBillingInterval ?? null,
      body.contractStartAt ?? null,
      body.contractEndAt ?? null,
      body.notes ?? null,
      actorUserId,
    ]
  );
};

const getTenantOverride = async ({
  tenantId,
  subscriptionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM tenant_subscription_overrides
      WHERE tenant_id = ?
        AND subscription_id = ?
      LIMIT 1
    `,
    [tenantId, subscriptionId]
  );

  return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Platform subscription payment requests
|--------------------------------------------------------------------------
*/

const listSubscriptionRequests =
  async ({
    page,
    limit,
    status,
    search,
  }) => {
    const offset =
      (page - 1) * limit;

    const conditions = [];
    const values = [];

    if (status) {
      conditions.push(
        "sr.status = ?"
      );

      values.push(
        status
      );
    }

    if (search) {
      conditions.push(
        `(
          t.name LIKE ?
          OR t.slug LIKE ?
          OR u.email LIKE ?
          OR sp.name LIKE ?
          OR sp.code LIKE ?
          OR sr.payment_reference LIKE ?
        )`
      );

      const term =
        `%${search}%`;

      values.push(
        term,
        term,
        term,
        term,
        term,
        term
      );
    }

    const where =
      conditions.length
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";

    const [rows] =
      await db.query(
        `
          SELECT
            sr.id,
            sr.tenant_id,
            sr.user_id,
            sr.plan_id,
            sr.status,
            sr.payment_reference,
            sr.payment_proof_file_id,
            sr.payment_note,
            sr.reviewed_by,
            sr.reviewed_at,
            sr.rejection_reason,
            sr.created_at,
            sr.updated_at,

            t.name AS tenant_name,
            t.slug AS tenant_slug,
            t.domain AS tenant_domain,
            t.status AS tenant_status,

            u.email AS user_email,
            u.status AS user_status,

            sp.code AS plan_code,
            sp.name AS plan_name,
            sp.price AS plan_price,
            sp.currency AS plan_currency,
            sp.billing_interval
              AS plan_billing_interval,

            pf.original_name
              AS payment_proof_original_name,
            pf.mime_type
              AS payment_proof_mime_type,
            pf.size_bytes
              AS payment_proof_size_bytes

          FROM subscription_requests sr

          INNER JOIN tenants t
            ON t.id = sr.tenant_id

          INNER JOIN users u
            ON u.id = sr.user_id

          INNER JOIN subscription_plans sp
            ON sp.id = sr.plan_id

          LEFT JOIN private_files pf
            ON pf.id =
              sr.payment_proof_file_id
            AND pf.tenant_id =
              sr.tenant_id
            AND pf.status = 'active'

          ${where}

          ORDER BY
            CASE
              WHEN sr.status =
                'payment_submitted'
              THEN 0
              ELSE 1
            END,
            sr.updated_at DESC

          LIMIT ?
          OFFSET ?
        `,
        [
          ...values,
          limit,
          offset,
        ]
      );

    const [countRows] =
      await db.query(
        `
          SELECT
            COUNT(*) AS total

          FROM subscription_requests sr

          INNER JOIN tenants t
            ON t.id = sr.tenant_id

          INNER JOIN users u
            ON u.id = sr.user_id

          INNER JOIN subscription_plans sp
            ON sp.id = sr.plan_id

          ${where}
        `,
        values
      );

    const total =
      Number(
        countRows[0]?.total || 0
      );

    return {
      rows,

      meta: {
        page,
        limit,
        total,

        totalPages:
          Math.max(
            1,
            Math.ceil(
              total / limit
            )
          ),
      },
    };
  };

  const findSubscriptionRequestById =
  async ({
    requestId,
    connection = db,
    forUpdate = false,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            sr.*,

            t.name AS tenant_name,
            t.slug AS tenant_slug,
            t.domain AS tenant_domain,
            t.status AS tenant_status,

            u.email AS user_email,
            u.status AS user_status,

            sp.code AS plan_code,
            sp.name AS plan_name,
            sp.price AS plan_price,
            sp.currency AS plan_currency,
            sp.billing_interval
              AS plan_billing_interval,

            pf.original_name
              AS payment_proof_original_name,
            pf.mime_type
              AS payment_proof_mime_type,
            pf.size_bytes
              AS payment_proof_size_bytes

          FROM subscription_requests sr

          INNER JOIN tenants t
            ON t.id = sr.tenant_id

          INNER JOIN users u
            ON u.id = sr.user_id

          INNER JOIN subscription_plans sp
            ON sp.id = sr.plan_id

          LEFT JOIN private_files pf
            ON pf.id =
              sr.payment_proof_file_id
            AND pf.tenant_id =
              sr.tenant_id
            AND pf.status = 'active'

          WHERE sr.id = ?

          LIMIT 1

          ${
            forUpdate
              ? "FOR UPDATE"
              : ""
          }
        `,
        [
          requestId
        ]
      );

    return (
      rows[0] || null
    );
  };

  const findSubscriptionPaymentProof =
  async ({
    requestId,
  }) => {
    const [rows] =
      await db.query(
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
            pf.status

          FROM subscription_requests sr

          INNER JOIN private_files pf
            ON pf.id =
              sr.payment_proof_file_id
            AND pf.tenant_id =
              sr.tenant_id

          WHERE sr.id = ?
            AND pf.status = 'active'
            AND pf.module =
              'subscriptions'
            AND pf.document_type =
              'payment_proof'

          LIMIT 1
        `,
        [
          requestId
        ]
      );

    return (
      rows[0] || null
    );
  };

  const rejectSubscriptionRequest =
  async ({
    requestId,
    reviewerUserId,
    reason,
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
            AND status =
              'payment_submitted'
        `,
        [
          reviewerUserId,
          reason,
          requestId,
        ]
      );

    return (
      result.affectedRows === 1
    );
  };

  const approveSubscriptionRequest =
  async ({
    connection,
    requestId,
    reviewerUserId,
  }) => {
    const [result] =
      await connection.query(
        `
          UPDATE subscription_requests

          SET
            status = 'approved',
            reviewed_by = ?,
            reviewed_at = NOW(),
            rejection_reason = NULL,
            updated_at = NOW()

          WHERE id = ?
            AND status =
              'payment_submitted'
        `,
        [
          reviewerUserId,
          requestId,
        ]
      );

    return (
      result.affectedRows === 1
    );
  };

  const activateTenant =
  async ({
    connection,
    tenantId,
  }) => {
    const [result] =
      await connection.query(
        `
          UPDATE tenants

          SET
            status = 'active',
            updated_at = NOW()

          WHERE id = ?
            AND deleted_at IS NULL
            AND status = 'pending'
        `,
        [
          tenantId
        ]
      );

    return (
      result.affectedRows === 1
    );
  };

  const findUserSubscription = async ({
  tenantId,
  userId,
  connection = db,
}) => {
  const [rows] =
    await connection.query(
      `
        SELECT *
        FROM user_subscriptions

        WHERE tenant_id = ?
          AND user_id = ?

        ORDER BY created_at DESC

        LIMIT 1
      `,
      [
        tenantId,
        userId,
      ]
    );

  return rows[0] || null;
};
const createUserSubscription =
  async ({
    connection,
    tenantId,
    userId,
    planId,
    expiresAt,
  }) => {
    const id = randomUUID();

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
          NOW(),
          ?
        )
      `,
      [
        id,
        tenantId,
        userId,
        planId,
        expiresAt,
      ]
    );

    return id;
  };

  const activateUserSubscription =
  async ({
    connection,
    subscriptionId,
    planId,
    expiresAt,
  }) => {
    const [result] =
      await connection.query(
        `
          UPDATE user_subscriptions

          SET
            plan_id = ?,
            status = 'active',
            starts_at = NOW(),
            expires_at = ?,
            updated_at = NOW()

          WHERE id = ?
        `,
        [
          planId,
          expiresAt,
          subscriptionId,
        ]
      );

    return result.affectedRows === 1;
  };

const consumeTenantOnboardingSessions =
  async ({
    connection,
    tenantId,
    userId,
  }) => {
    await connection.query(
      `
        UPDATE tenant_onboarding_sessions

        SET
          consumed_at = COALESCE(
            consumed_at,
            NOW()
          ),
          updated_at = NOW()

        WHERE tenant_id = ?
          AND user_id = ?
          AND consumed_at IS NULL
      `,
      [
        tenantId,
        userId,
      ]
    );
  };

module.exports = {
  listPlans,
  findPlanById,
  findPlanByCode,
  listPlanFeatures,
  createPlan,
  replacePlanFeatures,
  updatePlan,
  findTenantSubscription,
  updateTenantSubscription,
  createSubscriptionHistory,
  listTenantSubscriptionHistory,
  upsertTenantOverride,
  getTenantOverride,

  listSubscriptionRequests,
  findSubscriptionRequestById,
  findSubscriptionPaymentProof,
  rejectSubscriptionRequest,
  approveSubscriptionRequest,

  activateTenant,

  findUserSubscription,
  createUserSubscription,
  activateUserSubscription,

  consumeTenantOnboardingSessions,
};
