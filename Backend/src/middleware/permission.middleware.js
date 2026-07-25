const authRepo = require("../modules/auth/auth.repository");
const { verifyAccessToken } = require("../utils/authTokens");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseFeatureValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw createHttpError(401, "Authentication is required");
    }

    const payload = verifyAccessToken(token);

    const user = await authRepo.findAuthContextByIdentity({
      userId: payload.userId || payload.sub,
      tenantId: payload.tenantId,
      membershipId: payload.membershipId,
    });

    if (!user) {
      throw createHttpError(401, "Authenticated user no longer exists");
    }

    if (user.user_status && user.user_status !== "active") {
      throw createHttpError(403, "Your account is not active");
    }

    if (user.membership_status !== "active") {
      throw createHttpError(403, "Your tenant membership is not active");
    }

    if (req.tenant?.id && req.tenant.id !== user.tenant_id) {
      throw createHttpError(403, "Token does not belong to this tenant");
    }

    const [permissionRows, planFeatureRows] = await Promise.all([
      authRepo.findPermissionsByRoleId(user.role_id),
      authRepo.findPlanFeatures(user.plan_id),
    ]);

    const planFeatures = planFeatureRows.reduce((result, feature) => {
      result[feature.feature_key] = {
        enabled: Boolean(feature.is_enabled),
        value: parseFeatureValue(feature.feature_value),
      };
      return result;
    }, {});

    req.auth = {
      userId: user.id,
      tenantId: user.tenant_id,
      membershipId: user.membership_id,
      roleId: user.role_id,
      role: user.role_code,
      permissions: permissionRows.map((permission) => permission.code),
      subscriptionId: user.subscription_id || null,
      planId: user.plan_id || null,
      plan: user.plan_code || null,
      planFeatures,
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(createHttpError(401, "Access token is invalid or expired"));
    }

    return next(error);
  }
};

module.exports = {
  authenticate,
};
