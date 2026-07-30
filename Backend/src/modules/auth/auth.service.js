const bcrypt = require("bcryptjs");
const authRepo = require("./auth.repository");
const {
  createRefreshToken,
  hashRefreshToken,
} = require("../../utils/authTokens");
const { signAccessToken } = require("../../utils/jwt");

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_DAYS = 30;

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

const buildFeatures = (rows) =>
  rows.reduce((result, feature) => {
    result[feature.feature_key] = {
      enabled: Boolean(feature.is_enabled),
      value: parseFeatureValue(feature.feature_value),
    };
    return result;
  }, {});

const loadAuthorizationContext = async (user) => {
  const [permissionRows, planFeatureRows] = await Promise.all([
    authRepo.findPermissionsByRoleId(user.role_id),
    authRepo.findPlanFeatures(user.plan_id),
  ]);

  return {
    permissions: permissionRows.map((permission) => permission.code),
    planFeatures: buildFeatures(planFeatureRows),
  };
};

const validateAccountState = (user) => {
  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  if (user.user_status && user.user_status !== "active") {
    throw createHttpError(403, "Your account is not active");
  }

  if (user.membership_status !== "active") {
    throw createHttpError(403, "Your tenant membership is not active");
  }
};

const buildPublicUser = (user, authorization) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  kyc_status: user.kyc_status,

  membership: {
    id: user.membership_id,
    status: user.membership_status,
  },

  role: {
    id: user.role_id,
    name: user.role_name,
    code: user.role_code,
  },

  permissions: authorization.permissions,

  subscription: user.plan_id
    ? {
        id: user.subscription_id,
        status: user.subscription_status,
        starts_at: user.subscription_starts_at,
        expires_at: user.subscription_expires_at,
        plan: {
          id: user.plan_id,
          name: user.plan_name,
          code: user.plan_code,
        },
        features: authorization.planFeatures,
      }
    : null,
});

const issueTokenPair = async ({
  user,
  authorization,
  ipAddress,
  userAgent,
}) => {
  const accessToken = signAccessToken({
    userId: user.id,
    tenantId: user.tenant_id,
    membershipId: user.membership_id,
    roleCode: user.role_code,
  });

  const refreshToken = createRefreshToken();
  const refreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const refreshTokenId = await authRepo.createRefreshToken({
    userId: user.id,
    tenantId: user.tenant_id,
    membershipId: user.membership_id,
    tokenHash: hashRefreshToken(refreshToken),
    ipAddress,
    userAgent,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    refreshTokenId,
    accessToken,
    accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
    refreshToken,
    refreshTokenExpiresAt,
    user: buildPublicUser(user, authorization),
  };
};

const login = async ({
  tenantId,
  email,
  password,
  ipAddress,
  userAgent,
}) => {
  if (!tenantId || !email || !password) {
    throw createHttpError(400, "Tenant, email, and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await authRepo.findUserByEmailAndTenant(
    normalizedEmail,
    tenantId
  );

  validateAccountState(user);

  const passwordIsValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordIsValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  const authorization = await loadAuthorizationContext(user);

  return issueTokenPair({
    user,
    authorization,
    ipAddress,
    userAgent,
  });
};

const socialLogin = async ({ tenantId, email, ipAddress, userAgent }) => {
  if (!tenantId || !email) {
    throw createHttpError(400, "Tenant and social account email are required");
  }

  const user = await authRepo.findUserByEmailAndTenant(
    email.trim().toLowerCase(),
    tenantId
  );

  validateAccountState(user);
  const authorization = await loadAuthorizationContext(user);

  return issueTokenPair({ user, authorization, ipAddress, userAgent });
};

const refreshAccessToken = async ({
  refreshToken,
  ipAddress,
  userAgent,
}) => {
  if (!refreshToken) {
    throw createHttpError(401, "Refresh token is required");
  }

  const tokenRecord = await authRepo.findActiveRefreshToken(
    hashRefreshToken(refreshToken)
  );

  if (!tokenRecord) {
    throw createHttpError(401, "Refresh token is invalid or expired");
  }

  const user = await authRepo.findAuthContextByIdentity({
    userId: tokenRecord.user_id,
    tenantId: tokenRecord.tenant_id,
  });

  validateAccountState(user);

  const authorization = await loadAuthorizationContext(user);
  const nextTokens = await issueTokenPair({
    user,
    authorization,
    ipAddress,
    userAgent,
  });

  await authRepo.revokeRefreshToken({
    tokenId: tokenRecord.id,
    replacedByTokenId: nextTokens.refreshTokenId,
  });

  return nextTokens;
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) return;

  const tokenRecord = await authRepo.findActiveRefreshToken(
    hashRefreshToken(refreshToken)
  );

  if (!tokenRecord) return;

  await authRepo.revokeRefreshToken({
    tokenId: tokenRecord.id,
  });
};

const getCurrentUser = async ({
  userId,
  membershipId,
  tenantId,
}) => {
  const user = await authRepo.findAuthContextByIdentity({
    userId,
    membershipId,
    tenantId,
  });

  validateAccountState(user);

  const authorization = await loadAuthorizationContext(user);

  return buildPublicUser(user, authorization);
};

module.exports = {
  login,
  socialLogin,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
