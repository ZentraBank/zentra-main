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
  createdBy = null,
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

const createTemporaryTenantDomain = async ({
  connection,
  tenantId,
  slug,
  rootDomain,
}) => {
  const domainId = randomUUID();

  const domain = `${slug}.${rootDomain}`
    .trim()
    .toLowerCase();

  await connection.query(
    `
      INSERT INTO tenant_domains (
        id,
        tenant_id,
        domain,
        domain_type,
        status,
        is_primary,
        verification_method,
        verification_token,
        target_host,
        ssl_status,
        verified_at,
        activated_at
      )
      VALUES (
        ?,
        ?,
        ?,
        'temporary',
        'active',
        TRUE,
        NULL,
        NULL,
        NULL,
        'active',
        NOW(),
        NOW()
      )
    `,
    [
      domainId,
      tenantId,
      domain,
    ]
  );

  return {
    id: domainId,
    domain,
  };
};

const createTenantSystemRoles = async ({
  connection,
  tenantId,
}) => {
 const permissions = [
  /*
  |--------------------------------------------------------------------------
  | Tenant administration
  |--------------------------------------------------------------------------
  */

  [
    "Tenant Settings Read",
    "tenant.settings.read",
    "tenant",
  ],
  [
    "Tenant Settings Manage",
    "tenant.settings.manage",
    "tenant",
  ],
  [
    "Tenant Domains Read",
    "tenant.domains.read",
    "tenant",
  ],
  [
    "Tenant Domains Manage",
    "tenant.domains.manage",
    "tenant",
  ],

  /*
  |--------------------------------------------------------------------------
  | Accounts
  |--------------------------------------------------------------------------
  */

  [
    "Accounts Read",
    "accounts.read",
    "accounts",
  ],
  [
    "Accounts Create",
    "accounts.create",
    "accounts",
  ],
  [
    "Accounts Manage",
    "accounts.manage",
    "accounts",
  ],

  /*
  |--------------------------------------------------------------------------
  | Transfers
  |--------------------------------------------------------------------------
  */

  [
    "Transfers Read",
    "transfers.read",
    "transfers",
  ],
  [
    "Transfers Create",
    "transfers.create",
    "transfers",
  ],
  [
    "Transfers Approve",
    "transfers.approve",
    "transfers",
  ],

  /*
  |--------------------------------------------------------------------------
  | Cards
  |--------------------------------------------------------------------------
  */

  [
    "Cards Read",
    "cards.read",
    "cards",
  ],
  [
    "Cards Create",
    "cards.create",
    "cards",
  ],
  [
    "Cards Manage",
    "cards.manage",
    "cards",
  ],

  /*
  |--------------------------------------------------------------------------
  | Subscriptions
  |--------------------------------------------------------------------------
  */

  [
    "Subscriptions Read",
    "subscriptions.read",
    "subscriptions",
  ],
  [
    "Subscriptions Manage",
    "subscriptions.manage",
    "subscriptions",
  ],

  /*
  |--------------------------------------------------------------------------
  | Users
  |--------------------------------------------------------------------------
  */

  [
    "Users Read",
    "users.read",
    "users",
  ],
  [
    "Users Manage",
    "users.manage",
    "users",
  ],

  /*
  |--------------------------------------------------------------------------
  | Notifications
  |--------------------------------------------------------------------------
  */

  [
    "Notifications Read",
    "notifications.read",
    "notifications",
  ],
  [
    "Notifications Manage",
    "notifications.manage",
    "notifications",
  ],

  /*
  |--------------------------------------------------------------------------
  | Donations
  |--------------------------------------------------------------------------
  */

  [
    "Donations Read",
    "donations.read",
    "donations",
  ],
  [
    "Donations Create",
    "donations.create",
    "donations",
  ],
  [
    "Donations Approve",
    "donations.approve",
    "donations",
  ],

  /*
  |--------------------------------------------------------------------------
  | Investments
  |--------------------------------------------------------------------------
  */

  [
    "Investments Read",
    "investments.read",
    "investments",
  ],
  [
    "Investments Create",
    "investments.create",
    "investments",
  ],
  [
    "Investments Approve",
    "investments.approve",
    "investments",
  ],

  /*
  |--------------------------------------------------------------------------
  | Audit logs
  |--------------------------------------------------------------------------
  */

  [
    "Audit Logs Read",
    "audit_logs.read",
    "audit",
  ],
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
  emailVerified = false,
}) => {
  const userId =
    randomUUID();

  const membershipId =
    randomUUID();

  /*
  |--------------------------------------------------------------------------
  | Find tenant administrator role
  |--------------------------------------------------------------------------
  */

  const [roleRows] =
    await connection.query(
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

  const role =
    roleRows[0];

  if (!role) {
    const error =
      new Error(
        "Tenant administrator role was not found."
      );

    error.statusCode = 500;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create tenant owner
  |--------------------------------------------------------------------------
  |
  | The user remains pending until the tenant itself is approved.
  |
  | emailVerified controls only whether email ownership has already
  | been confirmed.
  |
  */

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
        ${
          emailVerified
            ? "NOW()"
            : "NULL"
        }
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

  /*
  |--------------------------------------------------------------------------
  | Create tenant membership
  |--------------------------------------------------------------------------
  */

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
  number_of_accounts: 1,

  fx_access: false,
  virtual_cards: false,
  international_transfers: false,

  kyc_access: true,
  next_of_kin: true,
  donation_access: true,
  investment_access: false,
  gift_access: false,

  client_chat: false,

  platform_chat: false,

  push_notifications: true,
  push_notification_limit: 1000,

  priority_support: false,
},
    },
    {
      name: "Gold",
      code: "gold",
      price: 80,
      features: {
  transfer_limit: 100000,
  daily_transfer_limit: 250000,
  number_of_accounts: 3,

  fx_access: true,
  virtual_cards: true,
  international_transfers: false,

  kyc_access: true,
  next_of_kin: true,
  donation_access: true,
  investment_access: true,
  gift_access: true,

  client_chat: true,

  platform_chat: true,

  push_notifications: true,
  push_notification_limit: 10000,

  priority_support: true,
},
    },
    {
  name: "Diamond",
  code: "diamond",
  price: 120,
  features: {
  transfer_limit: null,
  daily_transfer_limit: null,
  number_of_accounts: null,

  fx_access: true,
  virtual_cards: true,
  international_transfers: true,

  kyc_access: true,
  next_of_kin: true,
  donation_access: true,
  investment_access: true,
  gift_access: true,

  client_chat: true,

  platform_chat: true,

  push_notifications: true,
  push_notification_limit: null,

  priority_support: true,
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

const findTenantDomainById =
  async (domainId) => {
    const [rows] =
      await db.query(
        `
          SELECT
            td.*,
            t.name AS tenant_name,
            t.slug AS tenant_slug,
            t.app_name AS tenant_app_name,
            t.status AS tenant_status

          FROM tenant_domains td

          INNER JOIN tenants t
            ON t.id = td.tenant_id

          WHERE
            td.id = ?
            AND td.deleted_at IS NULL
            AND t.deleted_at IS NULL

          LIMIT 1
        `,
        [domainId]
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

const updateTenantDomainStatus = async ({
  domainId,
  status,
  failureReason = null,
}) => {
  await db.query(
    `
      UPDATE tenant_domains
      SET
        status = ?,
        failure_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        id = ?
        AND deleted_at IS NULL
    `,
    [
      status,
      failureReason,
      domainId,
    ]
  );

  return findTenantDomainById(
    domainId
  );
};

const updateTenantDomainProviderDetails =
  async ({
    domainId,
    provider,
    providerHostnameId,
    sslStatus,
    targetHost,
  }) => {
    const fields = [];
    const values = [];

    if (
      provider !== undefined
    ) {
      fields.push(
        "provider = ?"
      );
      values.push(provider);
    }

    if (
      providerHostnameId !==
      undefined
    ) {
      fields.push(
        "provider_hostname_id = ?"
      );
      values.push(
        providerHostnameId
      );
    }

    if (
      sslStatus !== undefined
    ) {
      fields.push(
        "ssl_status = ?"
      );
      values.push(sslStatus);
    }

    if (
      targetHost !== undefined
    ) {
      fields.push(
        "target_host = ?"
      );
      values.push(targetHost);
    }

    if (!fields.length) {
      return findTenantDomainById(
        domainId
      );
    }

    fields.push(
      "updated_at = CURRENT_TIMESTAMP"
    );

    values.push(domainId);

    await db.query(
      `
        UPDATE tenant_domains
        SET ${fields.join(", ")}
        WHERE
          id = ?
          AND deleted_at IS NULL
      `,
      values
    );

    return findTenantDomainById(
      domainId
    );
  };

const markTenantDomainActive =
  async ({
    domainId,
    sslStatus = "active",
  }) => {
    await db.query(
      `
        UPDATE tenant_domains
        SET
          status = 'active',
          ssl_status = ?,
          failure_reason = NULL,
          activated_at =
            COALESCE(
              activated_at,
              CURRENT_TIMESTAMP
            ),
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          id = ?
          AND deleted_at IS NULL
      `,
      [
        sslStatus,
        domainId,
      ]
    );

    return findTenantDomainById(
      domainId
    );
  };

const markTenantDomainProvisioning =
  async (domainId) => {
    await db.query(
      `
        UPDATE tenant_domains
        SET
          status = 'provisioning',
          failure_reason = NULL,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          id = ?
          AND deleted_at IS NULL
      `,
      [domainId]
    );

    return findTenantDomainById(
      domainId
    );
  };

const markTenantDomainFailed =
  async ({
    domainId,
    failureReason,
  }) => {
    await db.query(
      `
        UPDATE tenant_domains
        SET
          status = 'failed',
          failure_reason = ?,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          id = ?
          AND deleted_at IS NULL
      `,
      [
        failureReason,
        domainId,
      ]
    );

    return findTenantDomainById(
      domainId
    );
  };

const disconnectTenantDomain =
  async (domainId) => {
    await db.query(
      `
        UPDATE tenant_domains
        SET
          status = 'disconnected',
          is_primary = 0,
          ssl_status = NULL,
          provider_hostname_id = NULL,
          failure_reason = NULL,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          id = ?
          AND deleted_at IS NULL
      `,
      [domainId]
    );

    return findTenantDomainById(
      domainId
    );
  };

  const makeTemporaryDomainPrimary =
  async (tenantId) => {
    await db.query(
      `
        UPDATE tenant_domains
        SET
          is_primary = 0,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          tenant_id = ?
          AND deleted_at IS NULL
      `,
      [tenantId]
    );

    await db.query(
      `
        UPDATE tenant_domains
        SET
          is_primary = 1,
          status = 'active',
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          tenant_id = ?
          AND domain_type = 'temporary'
          AND deleted_at IS NULL
        ORDER BY created_at ASC
        LIMIT 1
      `,
      [tenantId]
    );
  };

  const listTenantDomains = async ({
  page = 1,
  limit = 20,
  search,
  status,
  domainType,
  tenantId,
}) => {
  const offset =
    (page - 1) * limit;

  const where = [
    "td.deleted_at IS NULL",
    "t.deleted_at IS NULL",
  ];

  const values = [];

  if (search) {
    where.push(`
      (
        td.domain LIKE ?
        OR t.name LIKE ?
        OR t.slug LIKE ?
        OR t.app_name LIKE ?
      )
    `);

    const searchValue =
      `%${search}%`;

    values.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue
    );
  }

  if (status) {
    where.push(
      "td.status = ?"
    );

    values.push(status);
  }

  if (domainType) {
    where.push(
      "td.domain_type = ?"
    );

    values.push(domainType);
  }

  if (tenantId) {
    where.push(
      "td.tenant_id = ?"
    );

    values.push(tenantId);
  }

  const whereClause =
    `WHERE ${where.join(
      " AND "
    )}`;

  const [rows] =
  await db.query(
    `
      SELECT
        td.id,
        td.tenant_id,
        td.domain,
        td.domain_type,
        td.status,
        td.is_primary,
        td.verification_method,
        td.target_host,
        td.ssl_status,
        td.provider,
        td.provider_hostname_id,
        td.verification_attempts,
        td.last_verification_at,
        td.verified_at,
        td.activated_at,
        td.failure_reason,
        td.created_at,
        td.updated_at,

        t.name AS tenant_name,
        t.slug AS tenant_slug,
        t.app_name AS tenant_app_name,
        t.status AS tenant_status

      FROM tenant_domains td

      INNER JOIN tenants t
        ON t.id = td.tenant_id

      ${whereClause}

      ORDER BY
        CASE
          WHEN td.status = 'failed'
            THEN 0
          WHEN td.status = 'verification_pending'
            THEN 1
          WHEN td.status = 'provisioning'
            THEN 2
          ELSE 3
        END,
        td.updated_at DESC

      LIMIT ?
      OFFSET ?
    `,
    [
      ...values,
      Number(limit),
      Number(offset),
    ]
  );

  const [countRows] =
  await db.query(
    `
      SELECT
        COUNT(*) AS total

      FROM tenant_domains td

      INNER JOIN tenants t
        ON t.id = td.tenant_id

      ${whereClause}
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
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.max(
      1,
      Math.ceil(
        total / Number(limit)
      )
    ),
  },
};
};

module.exports = {
  listTenants,
  findTenantById,
  createTenant,
  createTemporaryTenantDomain,

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
  updateTenantDomainStatus,
  updateTenantDomainProviderDetails,

  markTenantDomainActive,
  markTenantDomainProvisioning,
  markTenantDomainFailed,

  disconnectTenantDomain,
  makeTemporaryDomainPrimary,

  listTenantDomains,
  findTenantDomainById,

  
  
};
