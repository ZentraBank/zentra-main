const crypto = require("crypto");

const ApiError = require("../../utils/ApiError");
const env = require("../../config/env");

const tenantRepository =
  require("./tenant.repository");
  const dns = require("dns").promises;

const domainProvisioning =
  require(
    "./domain-provisioning.service"
  );




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

  const normaliseDomain = (domain) => {
  return String(domain || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
};

const isValidDomain = (domain) => {
  return /^(?=.{4,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(
    domain
  );
};

const isZentraBankOwnedDomain = (
  domain
) => {
  const rootDomain =
    String(
      env.tenantTemporaryDomain ||
        "zentrabank.app"
    )
      .trim()
      .toLowerCase();

  return (
    domain === rootDomain ||
    domain.endsWith(
      `.${rootDomain}`
    )
  );
};

const generateDomainVerificationToken =
  () => {
    return crypto
      .randomBytes(32)
      .toString("hex");
  };

 const ensureTenantIsAvailable = (tenant) => {
  if (!tenant) {
    throw ApiError.notFound("Tenant was not found");
  }

  const status = String(tenant.status ?? "")
    .trim()
    .toLowerCase();

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

const getCurrentTenantConfiguration =
  async (tenantId) => {
    const tenant =
      await tenantRepository.findTenantById(
        tenantId
      );

    const availableTenant =
      ensureTenantIsAvailable(
        tenant
      );

    return getTenantConfiguration(
      availableTenant,
      {
        includePrivateSettings: false,
      }
    );
  };


  const updateCurrentTenantProfile = async ({
  tenantId,
  body,
}) => {
  const existingTenant =
    await tenantRepository.findTenantById(
      tenantId
    );

  ensureTenantIsAvailable(existingTenant);

  const updatedTenant =
    await tenantRepository.updateTenantProfile({
      tenantId,
      body,
    });

  if (!updatedTenant) {
    throw ApiError.notFound(
      "Tenant was not found"
    );
  }

  return getTenantConfiguration(
    updatedTenant,
    {
      includePrivateSettings: false,
    }
  );
};

const listCurrentTenantDomains =
  async (tenantId) => {
    const tenant =
      await tenantRepository.findTenantById(
        tenantId
      );

    ensureTenantIsAvailable(
      tenant
    );

    const domains =
      await tenantRepository.listTenantDomains(
        tenantId
      );

    return domains.map(
      (domain) => ({
        id: domain.id,

        domain:
          domain.domain,

        type:
          domain.domain_type,

        status:
          domain.status,

        isPrimary:
          Boolean(
            domain.is_primary
          ),

        verificationMethod:
          domain.verification_method,

        targetHost:
          domain.target_host,

        sslStatus:
          domain.ssl_status,

        verificationAttempts:
          Number(
            domain.verification_attempts ||
              0
          ),

        lastVerificationAt:
          domain.last_verification_at,

        verifiedAt:
          domain.verified_at,

        activatedAt:
          domain.activated_at,

        failureReason:
          domain.failure_reason,

        createdAt:
          domain.created_at,

        updatedAt:
          domain.updated_at,
      })
    );
  };

const createCustomDomainRequest =
  async ({
    tenantId,
    domain,
  }) => {
    const tenant =
      await tenantRepository.findTenantById(
        tenantId
      );

    ensureTenantIsAvailable(
      tenant
    );

    const normalisedDomain =
      normaliseDomain(domain);

    if (!normalisedDomain) {
      throw ApiError.badRequest(
        "A domain is required"
      );
    }

    if (
      !isValidDomain(
        normalisedDomain
      )
    ) {
      throw ApiError.badRequest(
        "Enter a valid domain name"
      );
    }

    if (
      isZentraBankOwnedDomain(
        normalisedDomain
      )
    ) {
      throw ApiError.badRequest(
        "ZentraBank temporary domains cannot be registered as custom domains"
      );
    }

    const existingDomain =
      await tenantRepository.findTenantDomainByName(
        normalisedDomain
      );

    if (existingDomain) {
      if (
        existingDomain.tenant_id ===
        tenantId
      ) {
        throw ApiError.conflict(
          "This domain has already been added to your tenant"
        );
      }

      throw ApiError.conflict(
        "This domain is already connected to another tenant"
      );
    }

    const verificationToken =
      generateDomainVerificationToken();

    const connectionInstructions =
      domainProvisioning
        .getConnectionInstructions({
          domain:
            normalisedDomain,
        });

    const targetHost =
      connectionInstructions
        .targetHost;

    const createdDomain =
      await tenantRepository.createTenantDomain(
        {
          tenantId,

          domain:
            normalisedDomain,

          verificationMethod:
            "dns_txt",

          verificationToken,

          targetHost,
        }
      );

    return {
      id:
        createdDomain.id,

      domain:
        createdDomain.domain,

      type:
        createdDomain.domain_type,

      status:
        createdDomain.status,

      isPrimary:
        Boolean(
          createdDomain.is_primary
        ),

      sslStatus:
        createdDomain.ssl_status,

      verification: {
        method:
          "dns_txt",

        recordType:
          "TXT",

        host:
          buildDnsVerificationHost(
            normalisedDomain
          ),

        value:
          verificationToken,
      },

      connection: {
        record:
          connectionInstructions.record,

        targetHost:
          connectionInstructions
            .targetHost,
      },
    };
  };

  const verifyCurrentTenantDomain =
  async ({
    tenantId,
    domainId,
  }) => {
    const tenant =
      await tenantRepository.findTenantById(
        tenantId
      );

    ensureTenantIsAvailable(tenant);

    const domain =
      await tenantRepository.findTenantDomainById({
        tenantId,
        domainId,
      });

    if (!domain) {
      throw ApiError.notFound(
        "Domain was not found"
      );
    }

    if (
      domain.domain_type !== "custom"
    ) {
      throw ApiError.badRequest(
        "Temporary ZentraBank domains do not require ownership verification"
      );
    }

    if (
      domain.status === "active"
    ) {
      return {
        id: domain.id,
        domain: domain.domain,
        status: domain.status,
        verified: true,
        message:
          "This domain is already active.",
      };
    }

    if (
      domain.status === "verified" ||
      domain.status === "provisioning"
    ) {
      return {
        id: domain.id,
        domain: domain.domain,
        status: domain.status,
        verified: true,
        message:
          "Domain ownership has already been verified.",
      };
    }

    await tenantRepository
      .incrementDomainVerificationAttempt({
        tenantId,
        domainId,
      });
    
      const buildVerificationHost = (domain) => {
  const parts = domain
    .trim()
    .toLowerCase()
    .split(".")
    .filter(Boolean);

  if (parts.length <= 2) {
    return "_zentrabank";
  }

  const subdomain = parts
    .slice(0, -2)
    .join(".");

  return `_zentrabank.${subdomain}`;
};
    const verificationHost =
  buildVerificationHost(domain);

    let records;

    try {
      records =
        await dns.resolveTxt(
          verificationHost
        );
    } catch (error) {
      if (
        error?.code === "ENOTFOUND" ||
        error?.code === "ENODATA" ||
        error?.code === "ESERVFAIL"
      ) {
        throw ApiError.badRequest(
          `DNS verification record was not found for ${verificationHost}. DNS changes can take time to propagate.`
        );
      }

      throw error;
    }

    /*
     * resolveTxt returns:
     *
     * [
     *   ["part-1", "part-2"],
     *   ["another-record"]
     * ]
     *
     * Each inner array represents one TXT record.
     */
    const txtValues =
      records.map(
        (parts) =>
          parts.join("")
      );

    const verified =
      txtValues.includes(
        domain.verification_token
      );

    if (!verified) {
      throw ApiError.badRequest(
        "The DNS verification record was found, but its value does not match the ZentraBank verification token."
      );
    }

    const updatedDomain =
      await tenantRepository.markDomainVerified({
        tenantId,
        domainId,
      });

    return {
      id:
        updatedDomain.id,

      domain:
        updatedDomain.domain,

      status:
        updatedDomain.status,

      verified: true,

      verifiedAt:
        updatedDomain.verified_at,

      nextStep: {
        message:
          "Domain ownership verified. Connect the domain to ZentraBank to continue provisioning.",

        targetHost:
          updatedDomain.target_host,
      },
    };
  };

 const provisionCurrentTenantDomain =
  async ({
    tenantId,
    domainId,
  }) => {
    const tenant =
      await tenantRepository.findTenantById(
        tenantId
      );

    ensureTenantIsAvailable(
      tenant
    );

    const domain =
      await tenantRepository.findTenantDomainById({
        tenantId,
        domainId,
      });

    if (!domain) {
      throw ApiError.notFound(
        "Domain was not found"
      );
    }

    if (
      domain.domain_type !==
      "custom"
    ) {
      throw ApiError.badRequest(
        "Temporary domains do not require custom provisioning"
      );
    }

    if (
      domain.status !== "verified" &&
      domain.status !== "provisioning"
    ) {
      throw ApiError.badRequest(
        "Domain ownership must be verified before provisioning"
      );
    }

    /*
     * If this domain has already been
     * registered with Cloudflare, do
     * not create a second hostname.
     */
    if (
      domain.provider === "cloudflare" &&
      domain.provider_hostname_id
    ) {
      const providerStatus =
        await domainProvisioning
          .getDomainStatus({
            providerHostnameId:
              domain.provider_hostname_id,
          });

      return {
        id: domain.id,
        domain: domain.domain,
        status: domain.status,
        provider: "cloudflare",
        providerHostnameId:
          domain.provider_hostname_id,
        providerStatus,
      };
    }

    await tenantRepository
      .markDomainProvisioning({
        tenantId,
        domainId,
      });

    let result;

    try {
      result =
        await domainProvisioning
          .provisionDomain({
            tenantId,
            domain,
          });
    } catch (error) {
      await tenantRepository
        .markDomainFailed({
          tenantId,
          domainId,
          reason:
            error.message ||
            "Cloudflare provisioning failed.",
        });

      throw error;
    }

    await tenantRepository
      .setTenantDomainProvider({
        tenantId,
        domainId,
        provider:
          result.provider,
        providerHostnameId:
          result.providerHostnameId,
      });

    return {
      id:
        domain.id,

      domain:
        domain.domain,

      status:
        "provisioning",

      provider:
        result.provider,

      providerHostnameId:
        result.providerHostnameId,

      providerStatus:
        result.status,

      ssl:
        result.ssl,

      ownershipVerification:
        result.ownershipVerification,

      ownershipVerificationHttp:
        result.ownershipVerificationHttp,

      message:
        "Domain has been registered with ZentraBank's edge provider and is awaiting activation.",
    };
  };

  const refreshCurrentTenantDomainStatus =
  async ({
    tenantId,
    domainId,
  }) => {
    const tenant =
      await tenantRepository.findTenantById(
        tenantId
      );

    ensureTenantIsAvailable(
      tenant
    );

    const domain =
      await tenantRepository.findTenantDomainById({
        tenantId,
        domainId,
      });

    if (!domain) {
      throw ApiError.notFound(
        "Domain was not found"
      );
    }

    if (
      domain.provider !==
        "cloudflare" ||
      !domain.provider_hostname_id
    ) {
      throw ApiError.badRequest(
        "This domain has not been provisioned with Cloudflare"
      );
    }

    const providerStatus =
      await domainProvisioning
        .getDomainStatus({
          providerHostnameId:
            domain.provider_hostname_id,
        });

    const hostnameActive =
      providerStatus.status ===
      "active";

    const sslActive =
      providerStatus.ssl?.status ===
        "active";

    if (
      hostnameActive &&
      sslActive
    ) {
      const activeDomain =
        await tenantRepository
          .markDomainActive({
            tenantId,
            domainId,
          });

      await tenantRepository
        .setPrimaryTenantDomain({
          tenantId,
          domainId,
        });

      return {
        id:
          activeDomain.id,

        domain:
          activeDomain.domain,

        status:
          "active",

        sslStatus:
          "active",

        isPrimary:
          true,

        provider:
          providerStatus.provider,

        providerStatus:
          providerStatus.status,
      };
    }

    return {
      id:
        domain.id,

      domain:
        domain.domain,

      status:
        "provisioning",

      sslStatus:
        providerStatus.ssl?.status ||
        "pending",

      provider:
        providerStatus.provider,

      providerStatus:
        providerStatus.status,

      ownershipVerification:
        providerStatus
          .ownershipVerification,

      ownershipVerificationHttp:
        providerStatus
          .ownershipVerificationHttp,
    };
  };

  const disconnectCurrentTenantDomain =
  async ({
    tenantId,
    domainId,
  }) => {
    const tenant =
      await tenantRepository
        .findTenantById(
          tenantId
        );

    ensureTenantIsAvailable(
      tenant
    );

    const domain =
      await tenantRepository
        .findTenantDomainById({
          tenantId,
          domainId,
        });

    if (!domain) {
      throw ApiError.notFound(
        "Domain was not found"
      );
    }

    if (
      domain.domain_type ===
      "temporary"
    ) {
      throw ApiError.badRequest(
        "The temporary ZentraBank domain cannot be disconnected"
      );
    }

    /*
     * Remove from Cloudflare first.
     *
     * If this fails, keep our local
     * record intact so the operation
     * can safely be retried.
     */
    if (
      domain.provider ===
        "cloudflare" &&
      domain.provider_hostname_id
    ) {
      try {
        await domainProvisioning
          .deleteDomain({
            providerHostnameId:
              domain.provider_hostname_id,
          });
      } catch (error) {
        throw ApiError.badRequest(
          error.message ||
            "Unable to disconnect the domain from ZentraBank"
        );
      }
    }

    await tenantRepository
      .disconnectTenantDomain({
        tenantId,
        domainId,
      });

    const fallbackDomain =
      await tenantRepository
        .restoreTemporaryDomainAsPrimary(
          tenantId
        );

    return {
      disconnected: true,

      domain:
        domain.domain,

      fallbackDomain:
        fallbackDomain
          ? {
              id:
                fallbackDomain.id,

              domain:
                fallbackDomain.domain,

              type:
                fallbackDomain
                  .domain_type,

              isPrimary:
                true,
            }
          : null,
    };
  };

  

  module.exports = {
  getTenantById,
  getTenantBySlug,
  getTenantByDomain,
  resolveTenant,

  getTenantConfiguration,
  getCurrentTenantConfiguration,
  updateCurrentTenantProfile,

  listCurrentTenantDomains,
  createCustomDomainRequest,

  verifyCurrentTenantDomain,
  provisionCurrentTenantDomain,
  refreshCurrentTenantDomainStatus,

  disconnectCurrentTenantDomain,

  
};