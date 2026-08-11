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
      WHERE LOWER(domain) = LOWER(?)
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [domain]
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

module.exports = {
  findTenantById,
  findTenantBySlug,
  findTenantByDomain,
  findPublicTenantSettings,
  findAllTenantSettings,
  findTenantFeatures,
};