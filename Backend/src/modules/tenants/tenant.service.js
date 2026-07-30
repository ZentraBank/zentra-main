  const ApiError = require("../../utils/ApiError");
  const tenantRepository = require("./tenant.repository");

  const parseJsonValue = (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const mapSettingsToObject = (settings) => {
    return settings.reduce((result, setting) => {
      result[setting.setting_key] = parseJsonValue(
        setting.setting_value
      );

      return result;
    }, {});
  };

  const mapFeaturesToObject = (features) => {
    return features.reduce((result, feature) => {
      result[feature.feature_key] = {
        enabled: Boolean(feature.is_enabled),
        configuration: parseJsonValue(
          feature.configuration
        ),
      };

      return result;
    }, {});
  };

  const mapEnabledFeatureList = (features) => {
    return features
      .filter((feature) => Boolean(feature.is_enabled))
      .map((feature) => feature.feature_key);
  };

 const ensureTenantIsAvailable = (tenant) => {
  if (!tenant) {
    throw ApiError.notFound("Tenant was not found");
  }

  const status = String(tenant.status ?? "")
    .trim()
    .toLowerCase();

  console.log("Resolved tenant:", {
    id: tenant.id,
    slug: tenant.slug,
    status: tenant.status,
    normalisedStatus: status,
  });

  if (status === "suspended") {
    throw ApiError.forbidden(
      "This tenant has been suspended"
    );
  }

  if (status !== "active") {
    throw ApiError.forbidden(
      "This tenant is currently unavailable"
    );
  }

  return {
    ...tenant,
    status,
  };
};

  const getTenantById = async (tenantId) => {
    const tenant = await tenantRepository.findTenantById(
      tenantId
    );

    return ensureTenantIsAvailable(tenant);
  };

  const getTenantBySlug = async (slug) => {
    const normalisedSlug = slug
      ?.trim()
      .toLowerCase();

    if (!normalisedSlug) {
      throw ApiError.badRequest(
        "A tenant slug is required"
      );
    }

    const tenant = await tenantRepository.findTenantBySlug(
      normalisedSlug
    );

    return ensureTenantIsAvailable(tenant);
  };

  const getTenantByDomain = async (domain) => {
    const normalisedDomain = domain
      ?.trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/:\d+$/, "")
      .replace(/^www\./, "");

    if (!normalisedDomain) {
      throw ApiError.badRequest(
        "A tenant domain is required"
      );
    }

    const tenant =
      await tenantRepository.findTenantByDomain(
        normalisedDomain
      );

    return ensureTenantIsAvailable(tenant);
  };

  const resolveTenant = async ({
    slug,
    domain,
  }) => {
    if (slug) {
      return getTenantBySlug(slug);
    }

    if (domain) {
      return getTenantByDomain(domain);
    }

    throw ApiError.badRequest(
      "Unable to determine the tenant"
    );
  };

  const getTenantConfiguration = async (
    tenant,
    {
      includePrivateSettings = false,
    } = {}
  ) => {
    const settings = includePrivateSettings
      ? await tenantRepository.findAllTenantSettings(
          tenant.id
        )
      : await tenantRepository.findPublicTenantSettings(
          tenant.id
        );

    const features =
      await tenantRepository.findTenantFeatures(
        tenant.id
      );

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,

      branding: {
        appName: tenant.app_name,
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color,
        secondaryColor: tenant.secondary_color,
      },

      contact: {
        email: tenant.contact_email,
        phone: tenant.contact_phone,
      },

      localisation: {
        countryCode: tenant.country_code,
        currency: tenant.default_currency,
        timezone: tenant.timezone,
      },

      settings: mapSettingsToObject(settings),

      features: mapFeaturesToObject(features),

      enabledFeatures: mapEnabledFeatureList(features),
    };
  };

  const getCurrentTenantConfiguration = async (
    tenant
  ) => {
    ensureTenantIsAvailable(tenant);

    return getTenantConfiguration(tenant, {
      includePrivateSettings: false,
    });
  };

  module.exports = {
    getTenantById,
    getTenantBySlug,
    getTenantByDomain,
    resolveTenant,
    getTenantConfiguration,
    getCurrentTenantConfiguration,
  };