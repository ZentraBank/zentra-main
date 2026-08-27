const { randomUUID } = require("crypto");
const { query } = require("../../utils/query");

const findTenantById = async (tenantId) => {
  const rows = await query(
    `
      SELECT
        id,
        name,
        slug,
        domain,
        app_name,
        logo_url,
        primary_color,
        secondary_color,
        contact_email,
        contact_phone,
        country_code,
        default_currency,
        timezone,
        status,
        created_at,
        updated_at
      FROM tenants
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [tenantId]
  );

  return rows[0] || null;
};

const createTenantDomain = async ({
  tenantId,
  domain,
  verificationMethod,
  verificationToken,
  targetHost,
}) => {
  

  const domainId = randomUUID();

  await query(
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
        ssl_status
      )
      VALUES (
        ?,
        ?,
        ?,
        'custom',
        'verification_pending',
        FALSE,
        ?,
        ?,
        ?,
        'pending'
      )
    `,
    [
      domainId,
      tenantId,
      domain,
      verificationMethod,
      verificationToken,
      targetHost,
    ]
  );

  return findTenantDomainById({
    tenantId,
    domainId,
  });
};

const findTenantDomainByName = async (
  domain
) => {
  const rows = await query(
    `
      SELECT *
      FROM tenant_domains
      WHERE LOWER(domain) = LOWER(?)
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [domain]
  );

  return rows[0] || null;
};

const incrementDomainVerificationAttempt =
  async ({
    tenantId,
    domainId,
  }) => {
    await query(
      `
        UPDATE tenant_domains
        SET
          verification_attempts =
            verification_attempts + 1,
          last_verification_at =
            CURRENT_TIMESTAMP
        WHERE id = ?
          AND tenant_id = ?
          AND deleted_at IS NULL
      `,
      [
        domainId,
        tenantId,
      ]
    );
  };

const markDomainVerified = async ({
  tenantId,
  domainId,
}) => {
  await query(
    `
      UPDATE tenant_domains
      SET
        status = 'verified',
        verified_at = CURRENT_TIMESTAMP,
        failure_reason = NULL
      WHERE id = ?
        AND tenant_id = ?
        AND deleted_at IS NULL
    `,
    [
      domainId,
      tenantId,
    ]
  );

  return findTenantDomainById({
    tenantId,
    domainId,
  });
};

const markDomainProvisioning =
  async ({
    tenantId,
    domainId,
  }) => {
    await query(
      `
        UPDATE tenant_domains
        SET
          status = 'provisioning',
          failure_reason = NULL
        WHERE id = ?
          AND tenant_id = ?
          AND deleted_at IS NULL
      `,
      [
        domainId,
        tenantId,
      ]
    );

    return findTenantDomainById({
      tenantId,
      domainId,
    });
  };

const markDomainActive = async ({
  tenantId,
  domainId,
}) => {
  await query(
    `
      UPDATE tenant_domains
      SET
        status = 'active',
        ssl_status = 'active',
        activated_at =
          CURRENT_TIMESTAMP,
        failure_reason = NULL
      WHERE id = ?
        AND tenant_id = ?
        AND deleted_at IS NULL
    `,
    [
      domainId,
      tenantId,
    ]
  );

  return findTenantDomainById({
    tenantId,
    domainId,
  });
};

const markDomainFailed = async ({
  tenantId,
  domainId,
  reason,
}) => {
  await query(
    `
      UPDATE tenant_domains
      SET
        status = 'failed',
        ssl_status = 'failed',
        failure_reason = ?
      WHERE id = ?
        AND tenant_id = ?
        AND deleted_at IS NULL
    `,
    [
      reason,
      domainId,
      tenantId,
    ]
  );

  return findTenantDomainById({
    tenantId,
    domainId,
  });
};

const setPrimaryTenantDomain = async ({
  tenantId,
  domainId,
}) => {
  await query(
    `
      UPDATE tenant_domains
      SET is_primary = FALSE
      WHERE tenant_id = ?
        AND deleted_at IS NULL
    `,
    [tenantId]
  );

  await query(
    `
      UPDATE tenant_domains
      SET is_primary = TRUE
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'active'
        AND deleted_at IS NULL
    `,
    [
      domainId,
      tenantId,
    ]
  );

  return findTenantDomainById({
    tenantId,
    domainId,
  });
};

const disconnectTenantDomain = async ({
  tenantId,
  domainId,
}) => {
  await query(
    `
      UPDATE tenant_domains
      SET
        status = 'disconnected',
        is_primary = FALSE,
        deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND tenant_id = ?
        AND domain_type = 'custom'
        AND deleted_at IS NULL
    `,
    [
      domainId,
      tenantId,
    ]
  );
};

const findTenantBySlug = async (slug) => {
  const rows = await query(
    `
      SELECT
        id,
        name,
        slug,
        domain,
        app_name,
        logo_url,
        primary_color,
        secondary_color,
        contact_email,
        contact_phone,
        country_code,
        default_currency,
        timezone,
        status,
        created_at,
        updated_at
      FROM tenants
      WHERE slug = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
};

const findTenantByDomain = async (domain) => {
  if (!domain) {
    return null;
  }

  const normalisedDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");

  const domainRows = await query(
    `
      SELECT
        t.*
      FROM tenant_domains td

      INNER JOIN tenants t
        ON t.id = td.tenant_id

      WHERE LOWER(td.domain) = ?
        AND td.status = 'active'
        AND td.deleted_at IS NULL
        AND t.deleted_at IS NULL

      LIMIT 1
    `,
    [normalisedDomain]
  );

  if (domainRows[0]) {
    return domainRows[0];
  }

  const legacyRows = await query(
    `
      SELECT *
      FROM tenants
      WHERE LOWER(domain) = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [normalisedDomain]
  );

  return legacyRows[0] || null;
};
const listTenantDomains = async (
  tenantId
) => {
  return query(
    `
      SELECT
        id,
        tenant_id,
        domain,
        domain_type,
        status,
        is_primary,
        verification_method,
        target_host,
        ssl_status,
        verification_attempts,
        last_verification_at,
        verified_at,
        activated_at,
        failure_reason,
        created_at,
        updated_at
      FROM tenant_domains
      WHERE tenant_id = ?
        AND deleted_at IS NULL
      ORDER BY
        is_primary DESC,
        created_at ASC
    `,
    [tenantId]
  );
};

const findTenantDomainById = async ({
  tenantId,
  domainId,
}) => {
  const rows = await query(
    `
      SELECT *
      FROM tenant_domains
      WHERE id = ?
        AND tenant_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [domainId, tenantId]
  );

  return rows[0] || null;
};

const findPublicTenantSettings = async (tenantId) => {
  return query(
    `
      SELECT
        setting_key,
        setting_value
      FROM tenant_settings
      WHERE tenant_id = ?
        AND is_public = TRUE
      ORDER BY setting_key ASC
    `,
    [tenantId]
  );
};

const findAllTenantSettings = async (tenantId) => {
  return query(
    `
      SELECT
        setting_key,
        setting_value,
        is_public
      FROM tenant_settings
      WHERE tenant_id = ?
      ORDER BY setting_key ASC
    `,
    [tenantId]
  );
};

const findTenantFeatures = async (
  tenantId,
  enabledOnly = false
) => {
  let sql = `
    SELECT
      feature_key,
      is_enabled,
      configuration
    FROM tenant_features
    WHERE tenant_id = ?
  `;

  if (enabledOnly) {
    sql += " AND is_enabled = TRUE";
  }

  sql += " ORDER BY feature_key ASC";

  return query(sql, [tenantId]);
};

const updateTenantProfile = async ({
  tenantId,
  body,
}) => {
  const fieldMap = {
    name: "name",
    appName: "app_name",
    logoUrl: "logo_url",
    primaryColor: "primary_color",
    secondaryColor: "secondary_color",
    contactEmail: "contact_email",
    contactPhone: "contact_phone",
    countryCode: "country_code",
    defaultCurrency: "default_currency",
    timezone: "timezone",
  };

  const nullableFields = new Set([
    "logoUrl",
    "secondaryColor",
    "contactEmail",
    "contactPhone",
  ]);

  const updates = [];
  const values = [];

  for (const [field, column] of Object.entries(
    fieldMap
  )) {
    if (
      !Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      continue;
    }

    let value = body[field];

    // Convert empty strings on nullable fields
    // into SQL NULL.
    if (
      nullableFields.has(field) &&
      value === ""
    ) {
      value = null;
    }

    updates.push(`${column} = ?`);
    values.push(value);
  }

  if (updates.length === 0) {
    return findTenantById(tenantId);
  }

  values.push(tenantId);

  await query(
    `
      UPDATE tenants
      SET
        ${updates.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
    `,
    values
  );

  return findTenantById(tenantId);
};

const setTenantDomainProvider = async ({
  tenantId,
  domainId,
  provider,
  providerHostnameId,
}) => {
  await query(
    `
      UPDATE tenant_domains
      SET
        provider = ?,
        provider_hostname_id = ?
      WHERE id = ?
        AND tenant_id = ?
        AND deleted_at IS NULL
    `,
    [
      provider,
      providerHostnameId,
      domainId,
      tenantId,
    ]
  );

  return findTenantDomainById({
    tenantId,
    domainId,
  });
};
const findTemporaryTenantDomain = async (
  tenantId
) => {
  const rows = await query(
    `
      SELECT *
      FROM tenant_domains
      WHERE tenant_id = ?
        AND domain_type = 'temporary'
        AND status = 'active'
        AND deleted_at IS NULL
      ORDER BY created_at ASC
      LIMIT 1
    `,
    [tenantId]
  );

  return rows[0] || null;
};

const restoreTemporaryDomainAsPrimary =
  async (tenantId) => {
    const temporaryDomain =
      await findTemporaryTenantDomain(
        tenantId
      );

    if (!temporaryDomain) {
      return null;
    }

    await query(
      `
        UPDATE tenant_domains
        SET is_primary = FALSE
        WHERE tenant_id = ?
          AND deleted_at IS NULL
      `,
      [tenantId]
    );

    await query(
      `
        UPDATE tenant_domains
        SET is_primary = TRUE
        WHERE id = ?
          AND tenant_id = ?
      `,
      [
        temporaryDomain.id,
        tenantId,
      ]
    );

    return findTenantDomainById({
      tenantId,
      domainId:
        temporaryDomain.id,
    });
  };

module.exports = {
  findTenantById,
  findTenantBySlug,
  findTenantByDomain,
  findPublicTenantSettings,
  findAllTenantSettings,
  findTenantFeatures,
  updateTenantProfile,
  listTenantDomains,
  findTenantDomainById,
  markDomainProvisioning,
  markDomainActive,
  markDomainVerified,
  markDomainFailed,
  setPrimaryTenantDomain,
  disconnectTenantDomain,
  setTenantDomainProvider,
  findTemporaryTenantDomain,
  restoreTemporaryDomainAsPrimary,

};