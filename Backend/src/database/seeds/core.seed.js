const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const env = require("../../config/env");
const {
  pool,
} = require("../../config/db");

const createId = () => crypto.randomUUID();

const permissions = [
  {
    module: "tenants",
    code: "tenants.read",
    name: "Read tenants",
  },
  {
    module: "tenants",
    code: "tenants.create",
    name: "Create tenants",
  },
  {
    module: "tenants",
    code: "tenants.update",
    name: "Update tenants",
  },
  {
    module: "tenants",
    code: "tenants.delete",
    name: "Delete tenants",
  },

  {
    module: "users",
    code: "users.read",
    name: "Read users",
  },
  {
    module: "users",
    code: "users.create",
    name: "Create users",
  },
  {
    module: "users",
    code: "users.update",
    name: "Update users",
  },
  {
    module: "users",
    code: "users.suspend",
    name: "Suspend users",
  },

  {
    module: "accounts",
    code: "accounts.read",
    name: "Read accounts",
  },
  {
    module: "accounts",
    code: "accounts.create",
    name: "Create accounts",
  },
  {
    module: "accounts",
    code: "accounts.update",
    name: "Update accounts",
  },
  {
    module: "accounts",
    code: "accounts.manage_balance",
    name: "Manage account balances",
  },

  {
    module: "transactions",
    code: "transactions.read",
    name: "Read transactions",
  },
  {
    module: "transactions",
    code: "transactions.create",
    name: "Create transactions",
  },
  {
    module: "transactions",
    code: "transactions.update",
    name: "Update transactions",
  },
  {
    module: "transactions",
    code: "transactions.approve",
    name: "Approve transactions",
  },

  {
    module: "notifications",
    code: "notifications.read",
    name: "Read notifications",
  },
  {
    module: "notifications",
    code: "notifications.manage",
    name: "Manage notifications",
  },

  {
    module: "subscriptions",
    code: "subscriptions.read",
    name: "Read subscriptions",
  },
  {
    module: "subscriptions",
    code: "subscriptions.manage",
    name: "Manage subscriptions",
  },

  {
    module: "cards",
    code: "cards.read",
    name: "Read cards",
  },
  {
    module: "cards",
    code: "cards.manage",
    name: "Manage cards",
  },

  {
    module: "donations",
    code: "donations.read",
    name: "Read donations",
  },
  {
    module: "donations",
    code: "donations.manage",
    name: "Manage donations",
  },

  {
    module: "chat",
    code: "chat.read",
    name: "Read chat messages",
  },
  {
    module: "chat",
    code: "chat.respond",
    name: "Respond to chat messages",
  },

  {
    module: "audit_logs",
    code: "audit_logs.read",
    name: "Read audit logs",
  },
];

const tenantFeatures = [
  "accounts",
  "transactions",
  "subscriptions",
  "notifications",
  "cards",
  "donations",
  "next_of_kin",
  "chat",
];

const seedDatabase = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const platformAdminId = await seedPlatformAdmin(
      connection
    );

    const tenantId = await seedTenant(
      connection,
      platformAdminId
    );

    await seedTenantSettings(connection, tenantId);
    await seedTenantFeatures(connection, tenantId);

    const permissionIds = await seedPermissions(
      connection
    );

    const roleIds = await seedRoles(
      connection,
      tenantId
    );

    await seedRolePermissions(
      connection,
      roleIds,
      permissionIds
    );

    const tenantAdminUserId = await seedTenantAdminUser(
      connection
    );

    await seedTenantMembership(
      connection,
      {
        tenantId,
        userId: tenantAdminUserId,
        roleId: roleIds.tenantAdmin,
      }
    );

    await connection.commit();

    console.log("---------------------------------------");
    console.log("Core database seed completed");
    console.log(
      `Platform admin: ${env.seed.platformAdmin.email}`
    );
    console.log(
      `Tenant: ${env.seed.tenant.name}`
    );
    console.log(
      `Tenant admin: ${env.seed.tenantAdmin.email}`
    );
    console.log("---------------------------------------");
  } catch (error) {
    await connection.rollback();

    console.error("Database seed failed:", error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

const seedPlatformAdmin = async (connection) => {
  const [existingRows] = await connection.execute(
    `
      SELECT id
      FROM platform_users
      WHERE email = ?
      LIMIT 1
    `,
    [env.seed.platformAdmin.email]
  );

  if (existingRows.length > 0) {
    return existingRows[0].id;
  }

  const id = createId();

  const passwordHash = await bcrypt.hash(
    env.seed.platformAdmin.password,
    12
  );

  await connection.execute(
    `
      INSERT INTO platform_users (
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role_code,
        status,
        email_verified_at
      )
      VALUES (?, ?, ?, ?, ?, 'platform_superadmin', 'active', NOW())
    `,
    [
      id,
      env.seed.platformAdmin.firstName,
      env.seed.platformAdmin.lastName,
      env.seed.platformAdmin.email,
      passwordHash,
    ]
  );

  return id;
};

const seedTenant = async (
  connection,
  platformAdminId
) => {
  const [existingRows] = await connection.execute(
    `
      SELECT id
      FROM tenants
      WHERE slug = ?
      LIMIT 1
    `,
    [env.seed.tenant.slug]
  );

  if (existingRows.length > 0) {
    return existingRows[0].id;
  }

  const id = createId();

  await connection.execute(
    `
      INSERT INTO tenants (
        id,
        name,
        slug,
        domain,
        app_name,
        primary_color,
        secondary_color,
        default_currency,
        timezone,
        status,
        created_by_platform_user_id
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        '#2447D8',
        '#111827',
        'USD',
        'Europe/London',
        'active',
        ?
      )
    `,
    [
      id,
      env.seed.tenant.name,
      env.seed.tenant.slug,
      env.seed.tenant.domain,
      env.seed.tenant.name,
      platformAdminId,
    ]
  );

  return id;
};

const seedTenantSettings = async (
  connection,
  tenantId
) => {
  const settings = [
    {
      key: "registration_enabled",
      value: true,
      isPublic: true,
    },
    {
      key: "maintenance_mode",
      value: false,
      isPublic: true,
    },
    {
      key: "support_email",
      value: "support@zentrabank.com",
      isPublic: true,
    },
    {
      key: "minimum_transfer_amount",
      value: 1,
      isPublic: false,
    },
    {
      key: "maximum_transfer_amount",
      value: 1000000,
      isPublic: false,
    },
  ];

  for (const setting of settings) {
    await connection.execute(
      `
        INSERT INTO tenant_settings (
          id,
          tenant_id,
          setting_key,
          setting_value,
          is_public
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          is_public = VALUES(is_public)
      `,
      [
        createId(),
        tenantId,
        setting.key,
        JSON.stringify(setting.value),
        setting.isPublic,
      ]
    );
  }
};

const seedTenantFeatures = async (
  connection,
  tenantId
) => {
  for (const featureKey of tenantFeatures) {
    await connection.execute(
      `
        INSERT INTO tenant_features (
          id,
          tenant_id,
          feature_key,
          is_enabled
        )
        VALUES (?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE
          is_enabled = VALUES(is_enabled)
      `,
      [
        createId(),
        tenantId,
        featureKey,
      ]
    );
  }
};

const seedPermissions = async (connection) => {
  const permissionIds = {};

  for (const permission of permissions) {
    const [existingRows] = await connection.execute(
      `
        SELECT id
        FROM permissions
        WHERE code = ?
        LIMIT 1
      `,
      [permission.code]
    );

    if (existingRows.length > 0) {
      permissionIds[permission.code] =
        existingRows[0].id;

      continue;
    }

    const id = createId();

    await connection.execute(
      `
        INSERT INTO permissions (
          id,
          name,
          code,
          description,
          module
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        permission.name,
        permission.code,
        permission.name,
        permission.module,
      ]
    );

    permissionIds[permission.code] = id;
  }

  return permissionIds;
};

const seedRoles = async (
  connection,
  tenantId
) => {
  const roleDefinitions = [
    {
      key: "tenantAdmin",
      name: "Tenant Administrator",
      code: "tenant_admin",
      description:
        "Full administrative access within a tenant",
    },
    {
      key: "supportAgent",
      name: "Support Agent",
      code: "support_agent",
      description:
        "Customer support and operational access",
    },
    {
      key: "customer",
      name: "Customer",
      code: "customer",
      description:
        "Standard tenant customer access",
    },
  ];

  const roleIds = {};

  for (const role of roleDefinitions) {
    const [existingRows] = await connection.execute(
      `
        SELECT id
        FROM roles
        WHERE tenant_id = ?
          AND code = ?
        LIMIT 1
      `,
      [
        tenantId,
        role.code,
      ]
    );

    if (existingRows.length > 0) {
      roleIds[role.key] = existingRows[0].id;
      continue;
    }

    const id = createId();

    await connection.execute(
      `
        INSERT INTO roles (
          id,
          tenant_id,
          name,
          code,
          description,
          is_system,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, TRUE, TRUE)
      `,
      [
        id,
        tenantId,
        role.name,
        role.code,
        role.description,
      ]
    );

    roleIds[role.key] = id;
  }

  return roleIds;
};

const seedRolePermissions = async (
  connection,
  roleIds,
  permissionIds
) => {
  const allPermissionCodes = Object.keys(
    permissionIds
  );

  const supportPermissionCodes = [
    "users.read",
    "accounts.read",
    "accounts.update",
    "transactions.read",
    "transactions.update",
    "notifications.read",
    "notifications.manage",
    "subscriptions.read",
    "cards.read",
    "cards.manage",
    "donations.read",
    "chat.read",
    "chat.respond",
  ];

  const customerPermissionCodes = [
    "accounts.read",
    "transactions.read",
    "transactions.create",
    "notifications.read",
    "subscriptions.read",
    "cards.read",
    "donations.read",
    "chat.read",
    "chat.respond",
  ];

  await assignPermissions(
    connection,
    roleIds.tenantAdmin,
    allPermissionCodes,
    permissionIds
  );

  await assignPermissions(
    connection,
    roleIds.supportAgent,
    supportPermissionCodes,
    permissionIds
  );

  await assignPermissions(
    connection,
    roleIds.customer,
    customerPermissionCodes,
    permissionIds
  );
};

const assignPermissions = async (
  connection,
  roleId,
  permissionCodes,
  permissionIds
) => {
  for (const permissionCode of permissionCodes) {
    const permissionId =
      permissionIds[permissionCode];

    if (!permissionId) {
      continue;
    }

    await connection.execute(
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
};

const seedTenantAdminUser = async (
  connection
) => {
  const [existingRows] = await connection.execute(
    `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [env.seed.tenantAdmin.email]
  );

  if (existingRows.length > 0) {
    return existingRows[0].id;
  }

  const id = createId();

  const passwordHash = await bcrypt.hash(
    env.seed.tenantAdmin.password,
    12
  );

  await connection.execute(
    `
      INSERT INTO users (
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role_code,
        status,
        email_verified_at
      )
      VALUES (?, ?, ?, ?, ?, 'platform_superadmin', 'active', NOW())
    `,
    [
      id,
      env.seed.tenantAdmin.firstName,
      env.seed.tenantAdmin.lastName,
      env.seed.tenantAdmin.email,
      passwordHash,
    ]
  );

  return id;
};

const seedTenantMembership = async (
  connection,
  {
    tenantId,
    userId,
    roleId,
  }
) => {
  const [existingRows] = await connection.execute(
    `
      SELECT id
      FROM tenant_memberships
      WHERE tenant_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [
      tenantId,
      userId,
    ]
  );

  if (existingRows.length > 0) {
    await connection.execute(
      `
        UPDATE tenant_memberships
        SET
          role_id = ?,
          status = 'active'
        WHERE id = ?
      `,
      [
        roleId,
        existingRows[0].id,
      ]
    );

    return existingRows[0].id;
  }

  const membershipId = createId();

  await connection.execute(
    `
      INSERT INTO tenant_memberships (
        id,
        tenant_id,
        user_id,
        role_id,
        status
      )
      VALUES (?, ?, ?, ?, 'active')
    `,
    [
      membershipId,
      tenantId,
      userId,
      roleId,
    ]
  );

  return membershipId;
};

seedDatabase();