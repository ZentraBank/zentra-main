const { randomUUID } = require("crypto");
const db = require("../../config/db");

const listTenants = async ({
  page,
  limit,
  search,
  status,
}) => {
  const offset = (page - 1) * limit;
  const where = ["deleted_at IS NULL"];
  const values = [];

  if (search) {
    where.push(
      "(name LIKE ? OR slug LIKE ? OR app_name LIKE ?)"
    );

    const term = `%${search}%`;
    values.push(term, term, term);
  }

  if (status) {
    where.push("status = ?");
    values.push(status);
  }

  const clause = `WHERE ${where.join(" AND ")}`;

  const [rows] = await db.query(
    `
      SELECT
        id,
        slug AS code,
        slug,
        name,
        app_name,
        logo_url,
        primary_color,
        status,
        created_at,
        updated_at
      FROM tenants
      ${clause}
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
    `,
    [
      ...values,
      Number(limit),
      Number(offset),
    ]
  );

  const [countRows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM tenants
      ${clause}
    `,
    values
  );

  const total = Number(
    countRows[0]?.total || 0
  );

  return {
    rows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.max(
        1,
        Math.ceil(total / Number(limit))
      ),
    },
  };
};

const findTenantById = async (tenantId) => {
  const [rows] = await db.query(
    "SELECT * FROM tenants WHERE id = ? LIMIT 1",
    [tenantId]
  );

  return rows[0] || null;
};

const createTenant = async ({
  connection,
  body,
  createdBy,
}) => {
  const tenantId = randomUUID();

  const slug = body.code
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  await connection.query(
    `
      INSERT INTO tenants (
        id,
        name,
        slug,
        app_name,
        logo_url,
        primary_color,
        status,
        created_by_platform_user_id
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'pending',
        ?
      )
    `,
    [
      tenantId,
      body.name,
      slug,
      body.appName,
      body.logoUrl || null,
      body.primaryColor,
      createdBy,
    ]
  );

  return tenantId;
};

const createTenantSystemRoles = async ({
  connection,
  tenantId,
}) => {
  const permissions = [
    ["Accounts Read", "accounts.read", "accounts"],
    ["Accounts Create", "accounts.create", "accounts"],
    ["Accounts Manage", "accounts.manage", "accounts"],

    ["Transfers Read", "transfers.read", "transfers"],
    ["Transfers Create", "transfers.create", "transfers"],
    ["Transfers Approve", "transfers.approve", "transfers"],

    ["Cards Read", "cards.read", "cards"],
    ["Cards Create", "cards.create", "cards"],
    ["Cards Manage", "cards.manage", "cards"],

    ["Subscriptions Read", "subscriptions.read", "subscriptions"],
    ["Subscriptions Manage", "subscriptions.manage", "subscriptions"],

    ["Users Read", "users.read", "users"],
    ["Users Manage", "users.manage", "users"],

    ["Notifications Read", "notifications.read", "notifications"],
    ["Notifications Manage", "notifications.manage", "notifications"],

    ["Donations Read", "donations.read", "donations"],
    ["Donations Create", "donations.create", "donations"],
    ["Donations Approve", "donations.approve", "donations"],

    ["Investments Read", "investments.read", "investments"],
    ["Investments Create", "investments.create", "investments"],
    ["Investments Approve", "investments.approve", "investments"],

    ["Audit Logs Read", "audit_logs.read", "audit"],
  ];

  const roles = [
    {
      name: "Customer",
      code: "customer",
      permissions: [
        "accounts.read",
        "transfers.read",
        "transfers.create",
        "cards.read",
        "subscriptions.read",
        "notifications.read",
        "donations.read",
        "donations.create",
        "investments.read",
        "investments.create",
      ],
    },
    {
      name: "Support Agent",
      code: "support_agent",
      permissions: [
        "accounts.read",
        "transfers.read",
        "cards.read",
        "subscriptions.read",
        "users.read",
        "notifications.read",
        "donations.read",
        "investments.read",
      ],
    },
    {
      name: "Account Manager",
      code: "account_manager",
      permissions: [
        "accounts.read",
        "accounts.manage",
        "transfers.read",
        "transfers.approve",
        "cards.read",
        "cards.manage",
        "users.read",
        "notifications.read",
        "notifications.manage",
        "donations.read",
        "donations.approve",
        "investments.read",
        "investments.approve",
      ],
    },
    {
      name: "Tenant Admin",
      code: "tenant_admin",
      permissions: permissions.map(
        ([, code]) => code
      ),
    },
  ];

  const permissionIds =
    new Map();

  for (
    const [name, code, module] of permissions
  ) {
    let [rows] =
      await connection.query(
        `
          SELECT id
          FROM permissions
          WHERE code = ?
          LIMIT 1
        `,
        [code]
      );

    let permission = rows[0];

    if (!permission) {
      const permissionId =
        randomUUID();

      await connection.query(
        `
          INSERT INTO permissions (
            id,
            name,
            code,
            module
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          permissionId,
          name,
          code,
          module,
        ]
      );

      permission = {
        id: permissionId,
      };
    }

    permissionIds.set(
      code,
      permission.id
    );
  }

  for (const role of roles) {
    const roleId =
      randomUUID();

    await connection.query(
      `
        INSERT INTO roles (
          id,
          tenant_id,
          name,
          code,
          is_system_role,
          is_active
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          TRUE,
          TRUE
        )
      `,
      [
        roleId,
        tenantId,
        role.name,
        role.code,
      ]
    );

    for (
      const permissionCode
      of role.permissions
    ) {
      const permissionId =
        permissionIds.get(
          permissionCode
        );

      if (!permissionId) {
        const error =
          new Error(
            `Permission "${permissionCode}" was not found.`
          );

        error.statusCode = 500;
        throw error;
      }

      await connection.query(
        `
          INSERT IGNORE INTO role_permissions (
            role_id,
            permission_id
          )
          VALUES (?, ?)
        `,
        [
          roleId,
          permissionId,
        ]
      );
    }
  }
};

const createTenantOwner = async ({
  connection,
  tenantId,
  body,
}) => {
  const userId = randomUUID();
  const membershipId = randomUUID();

  const [roleRows] = await connection.query(
    `
      SELECT id
      FROM roles
      WHERE tenant_id = ?
        AND code = 'tenant_admin'
        AND is_active = TRUE
      LIMIT 1
    `,
    [tenantId]
  );

  const role = roleRows[0];

  if (!role) {
    const error = new Error(
      "Tenant administrator role was not found."
    );

    error.statusCode = 500;
    throw error;
  }

  await connection.query(
    `
      INSERT INTO users (
        id,
        email,
        first_name,
        last_name,
        password_hash,
        status,
        email_verified_at
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        'pending',
        NULL
      )
    `,
    [
      userId,
      body.ownerEmail
        .trim()
        .toLowerCase(),
      body.ownerFirstName,
      body.ownerLastName,
      body.ownerPasswordHash,
    ]
  );

  await connection.query(
    `
      INSERT INTO tenant_memberships (
        id,
        tenant_id,
        user_id,
        role_id,
        status
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        'active'
      )
    `,
    [
      membershipId,
      tenantId,
      userId,
      role.id,
    ]
  );

  return {
    userId,
    membershipId,
  };
};

const createSubscription = async ({
  connection,
  tenantId,
  userId,
  planId,
}) => {
  const subscriptionId =
    randomUUID();

  await connection.query(
    `
      INSERT INTO user_subscriptions (
        id,
        tenant_id,
        user_id,
        plan_id,
        status,
        starts_at
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        'active',
        NOW()
      )
    `,
    [
      subscriptionId,
      tenantId,
      userId,
      planId,
    ]
  );

  return subscriptionId;
};

const updateTenantStatus = async ({ tenantId, status }) => {
  await db.query(
    "UPDATE tenants SET status = ? WHERE id = ?",
    [status, tenantId]
  );

  return findTenantById(tenantId);
};

const upsertFeatureOverride = async ({
  tenantId,
  featureCode,
  isEnabled,
  reason,
  actorUserId,
}) => {
  await db.query(
    `INSERT INTO tenant_feature_overrides
      (id, tenant_id, feature_code, is_enabled, override_reason, created_by)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       is_enabled = VALUES(is_enabled),
       override_reason = VALUES(override_reason),
       created_by = VALUES(created_by),
       approved_by = NULL,
       approved_at = NULL`,
    [
      randomUUID(),
      tenantId,
      featureCode,
      isEnabled,
      reason || null,
      actorUserId,
    ]
  );
};

const listFeatureOverrides = async (tenantId) => {
  const [rows] = await db.query(
    `SELECT * FROM tenant_feature_overrides
     WHERE tenant_id = ?
     ORDER BY feature_code`,
    [tenantId]
  );

  return rows;
};

const getDashboardMetrics = async () => {
  const [
    [tenantRows],
    [userRows],
    [transactionRows],
    [subscriptionRows],
  ] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'active'), 0) AS active,
        COALESCE(SUM(status = 'suspended'), 0) AS suspended,
        COALESCE(SUM(status = 'pending'), 0) AS pending
      FROM tenants
    `),

    db.query(`
      SELECT
        COUNT(DISTINCT u.id) AS total,

        COUNT(
          DISTINCT CASE
            WHEN r.code = 'tenant_admin'
            THEN u.id
          END
        ) AS tenantAdministrators,

        COUNT(
          DISTINCT CASE
            WHEN r.code = 'customer'
            THEN u.id
          END
        ) AS customers

      FROM users u

      LEFT JOIN tenant_memberships tm
        ON tm.user_id = u.id

      LEFT JOIN roles r
        ON r.id = tm.role_id

      WHERE u.deleted_at IS NULL
    `),

    db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(amount), 0) AS volume
      FROM transfers
    `),

    db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'active'), 0) AS active,
        COALESCE(SUM(status = 'pending'), 0) AS pending,
        COALESCE(SUM(status = 'expired'), 0) AS expired,
        COALESCE(SUM(status = 'cancelled'), 0) AS cancelled,
        COALESCE(SUM(status = 'suspended'), 0) AS suspended
      FROM user_subscriptions
    `),
  ]);

  const tenants = tenantRows[0] || {};
  const users = userRows[0] || {};
  const transactions = transactionRows[0] || {};
  const subscriptions =
    subscriptionRows[0] || {};

  return {
    tenants: {
      total: Number(tenants.total || 0),
      active: Number(tenants.active || 0),
      suspended: Number(
        tenants.suspended || 0
      ),
      pending: Number(
        tenants.pending || 0
      ),
    },

    users: {
      total: Number(users.total || 0),

      tenantAdministrators: Number(
        users.tenantAdministrators || 0
      ),

      customers: Number(
        users.customers || 0
      ),
    },

    transactions: {
      total: Number(
        transactions.total || 0
      ),

      volume: Number(
        transactions.volume || 0
      ),
    },

    subscriptions: {
      total: Number(
        subscriptions.total || 0
      ),

      active: Number(
        subscriptions.active || 0
      ),

      pending: Number(
        subscriptions.pending || 0
      ),

      expired: Number(
        subscriptions.expired || 0
      ),

      cancelled: Number(
        subscriptions.cancelled || 0
      ),

      suspended: Number(
        subscriptions.suspended || 0
      ),
    },
  };
};

const createAuditLog = async ({
  actorUserId,
  actionCode,
  tenantId,
  entityType,
  entityId,
  oldValues,
  newValues,
  requestContext,
  connection = db,
}) => {
  await connection.query(
    `INSERT INTO platform_audit_logs
      (id, actor_platform_user_id, action_code, tenant_id, entity_type,
       entity_id, old_values, new_values, ip_address, user_agent, request_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      actorUserId,
      actionCode,
      tenantId || null,
      entityType || null,
      entityId || null,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      requestContext?.ipAddress || null,
      requestContext?.userAgent || null,
      requestContext?.requestId || null,
    ]
  );
};

const listTenantAdministrators =
  async (tenantId) => {
    const [rows] = await db.query(
      `
        SELECT
          u.id,
          tm.tenant_id,
          u.email,
          u.first_name,
          u.last_name,
          u.status,
          u.created_at
        FROM users u

        INNER JOIN tenant_memberships tm
          ON tm.user_id = u.id

        INNER JOIN roles r
          ON r.id = tm.role_id

        WHERE tm.tenant_id = ?
          AND r.code = 'tenant_admin'
          AND u.deleted_at IS NULL

        ORDER BY u.created_at DESC
      `,
      [tenantId]
    );

    return rows;
  };

const listAuditLogs = async ({ limit }) => {
  const [rows] = await db.query(
    `SELECT * FROM platform_audit_logs
     ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );

  return rows;
};

const createTenantSubscriptionPlans = async ({
  connection,
  tenantId,
}) => {
  const plans = [
    {
      name: "Bronze",
      code: "bronze",
      price: 40,
      features: {
        transfer_limit: 10000,
        daily_transfer_limit: 25000,
        virtual_cards: false,
        international_transfers: false,
        number_of_accounts: 1,
        priority_support: false,
        donation_access: true,
        investment_access: false,
      },
    },
    {
      name: "Gold",
      code: "gold",
      price: 80,
      features: {
        transfer_limit: 100000,
        daily_transfer_limit: 250000,
        virtual_cards: true,
        international_transfers: false,
        number_of_accounts: 3,
        priority_support: true,
        donation_access: true,
        investment_access: true,
      },
    },
    {
      name: "Diamond",
      code: "diamond",
      price: 120,
      features: {
        transfer_limit: 1000000,
        daily_transfer_limit: 2500000,
        virtual_cards: true,
        international_transfers: true,
        number_of_accounts: 10,
        priority_support: true,
        donation_access: true,
        investment_access: true,
      },
    },
  ];

  for (const plan of plans) {
    const planId = randomUUID();

    await connection.query(
      `
        INSERT INTO subscription_plans (
          id,
          tenant_id,
          name,
          code,
          price,
          currency,
          billing_interval,
          is_active
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          'USD',
          'monthly',
          TRUE
        )
      `,
      [
        planId,
        tenantId,
        plan.name,
        plan.code,
        plan.price,
      ]
    );

    for (
      const [featureKey, rawValue]
      of Object.entries(plan.features)
    ) {
      const enabled =
        typeof rawValue === "boolean"
          ? rawValue
          : true;

      await connection.query(
        `
          INSERT INTO plan_features (
            id,
            plan_id,
            feature_key,
            is_enabled,
            feature_value
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          planId,
          featureKey,
          enabled,
          JSON.stringify(rawValue),
        ]
      );
    }
  }
};

const findTenantPlanByCode = async ({
  connection,
  tenantId,
  planCode,
}) => {
  const [rows] =
    await connection.query(
      `
        SELECT
          id,
          tenant_id,
          name,
          code,
          price,
          currency,
          billing_interval,
          is_active
        FROM subscription_plans
        WHERE tenant_id = ?
          AND code = ?
          AND is_active = TRUE
        LIMIT 1
      `,
      [
        tenantId,
        planCode,
      ]
    );

  return rows[0] || null;
};

const updateTenantAdministratorsStatus = async ({
  tenantId,
  status,
}) => {
  await db.query(
    `
      UPDATE users u
      INNER JOIN tenant_memberships tm
        ON tm.user_id = u.id
      INNER JOIN roles r
        ON r.id = tm.role_id
      SET u.status = ?
      WHERE tm.tenant_id = ?
        AND r.code = 'tenant_admin'
        AND u.deleted_at IS NULL
    `,
    [status, tenantId]
  );
};


module.exports = {
  listTenants,
  findTenantById,
  createTenant,
  createTenantOwner,
  createSubscription,
  updateTenantStatus,
  upsertFeatureOverride,
  listFeatureOverrides,
  getDashboardMetrics,
  createAuditLog,
  listTenantAdministrators,
  listAuditLogs,
  createTenantSystemRoles,
  createTenantSubscriptionPlans,
  findTenantPlanByCode,
  updateTenantAdministratorsStatus,
};
