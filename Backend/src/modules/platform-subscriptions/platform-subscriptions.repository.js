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
        s.*,
        p.code AS plan_code,
        p.name AS plan_name,
        p.price AS plan_price,
        p.currency AS plan_currency,
        p.billing_interval AS plan_billing_interval
      FROM subscriptions s
      INNER JOIN subscription_plans p
        ON p.id = s.plan_id
      WHERE s.tenant_id = ?
      ORDER BY s.created_at DESC
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
  renewedAt,
  expiresAt,
}) => {
  await db.query(
    `
      UPDATE subscriptions
      SET
        plan_id = COALESCE(?, plan_id),
        status = COALESCE(?, status),
        renewed_at = COALESCE(?, renewed_at),
        expires_at = COALESCE(?, expires_at),
        updated_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      planId || null,
      status || null,
      renewedAt || null,
      expiresAt || null,
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
};
