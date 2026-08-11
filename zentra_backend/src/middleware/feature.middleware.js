const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const tenantRepository = require(
  "../modules/tenant/tenant.repository"
);

const requireTenantFeature = (featureKey) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.tenantId) {
      throw ApiError.badRequest(
        "Tenant context is missing"
      );
    }

    const features =
      await tenantRepository.findTenantFeatures(
        req.tenantId
      );

    const feature = features.find(
      (item) => item.feature_key === featureKey
    );

    if (!feature || !Boolean(feature.is_enabled)) {
      throw ApiError.forbidden(
        `The ${featureKey} feature is not enabled for this tenant`
      );
    }

    req.tenantFeature = {
      key: feature.feature_key,
      enabled: Boolean(feature.is_enabled),
      configuration:
        typeof feature.configuration === "string"
          ? safelyParseJson(feature.configuration)
          : feature.configuration,
    };

    next();
  });
};

const safelyParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

module.exports = {
  requireTenantFeature,
};