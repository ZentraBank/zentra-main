const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");

const repo = require("./platform-auth.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateOpaqueToken = () =>
  crypto.randomBytes(64).toString("hex");

const buildAccessToken = ({
  user,
  permissions,
}) => {
  return jwt.sign(
    {
      sub: user.id,
      userId: user.id,
      role: user.role_code,
      scope: "platform",
      tenantId: null,
      permissions,
      tokenType: "access",
    },
    env.jwt.accessSecret,
    {
      expiresIn:
        env.jwt.accessExpiresIn,
      issuer:
        env.appName,
      audience:
        "zentrabank-platform",
    }
  );
};

const buildSafeUser = ({
  user,
  permissions,
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role_code,
  status: user.status,
  permissions,
  lastLoginAt: user.last_login_at,
});

const login = async ({
  email,
  password,
  deviceName,
  requestContext,
}) => {
  const failedAttempts =
    await repo.countRecentFailedAttempts({
      email,
      minutes: Number(
        process.env.PLATFORM_LOGIN_WINDOW_MINUTES || 15
      ),
    });

  const maximumAttempts = Number(
    process.env.PLATFORM_LOGIN_MAX_ATTEMPTS || 5
  );

  if (failedAttempts >= maximumAttempts) {
    throw httpError(
      429,
      "Too many failed login attempts. Try again later."
    );
  }

  const user = await repo.findUserByEmail(email);

  if (!user) {
    await repo.recordLoginAttempt({
      email,
      wasSuccessful: false,
      failureReason: "user_not_found",
      ...requestContext,
    });

    throw httpError(401, "Invalid email or password.");
  }

  if (user.status !== "active") {
    await repo.recordLoginAttempt({
      email,
      platformUserId: user.id,
      wasSuccessful: false,
      failureReason: `user_${user.status}`,
      ...requestContext,
    });

    throw httpError(
      403,
      "This platform account is not active."
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    await repo.recordLoginAttempt({
      email,
      platformUserId: user.id,
      wasSuccessful: false,
      failureReason: "invalid_password",
      ...requestContext,
    });

    throw httpError(401, "Invalid email or password.");
  }

  const permissions =
    await repo.listPermissions(user.id);

  const accessToken = buildAccessToken({
    user,
    permissions,
  });

  const refreshToken = generateOpaqueToken();
  const refreshTokenHash = hashToken(refreshToken);

  const refreshDays = Number(
    process.env.JWT_REFRESH_EXPIRES_DAYS || 30
  );

  const expiresAt = new Date(
    Date.now() + refreshDays * 24 * 60 * 60 * 1000
  );

  await repo.createRefreshToken({
    platformUserId: user.id,
    tokenHash: refreshTokenHash,
    deviceName,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
    expiresAt,
  });

  await repo.updateLastLogin(user.id);

  await repo.recordLoginAttempt({
    email,
    platformUserId: user.id,
    wasSuccessful: true,
    ...requestContext,
  });

return {
  accessToken,
  refreshToken,
  accessTokenExpiresIn:
    env.jwt.accessExpiresIn,
  refreshTokenExpiresAt: expiresAt,
  user: buildSafeUser({
    user,
    permissions,
  }),
};
};

const refresh = async ({
  refreshToken,
  deviceName,
  requestContext,
}) => {
  if (!refreshToken) {
    throw httpError(
      401,
      "Refresh token is required."
    );
  }

  const tokenHash = hashToken(refreshToken);

  const stored =
    await repo.findRefreshTokenByHash(tokenHash);

  if (!stored) {
    throw httpError(401, "Invalid refresh token.");
  }

  if (stored.revoked_at) {
    await repo.revokeAllRefreshTokens(
      stored.platform_user_id
    );

    throw httpError(
      401,
      "Refresh token reuse was detected."
    );
  }

  if (
    new Date(stored.expires_at).getTime() <= Date.now()
  ) {
    throw httpError(401, "Refresh token has expired.");
  }

  const user = await repo.findUserById(
    stored.platform_user_id
  );

  if (!user || user.status !== "active") {
    throw httpError(
      403,
      "This platform account is not active."
    );
  }

  const permissions =
    await repo.listPermissions(user.id);

  const accessToken = buildAccessToken({
    user,
    permissions,
  });

  const nextRefreshToken = generateOpaqueToken();
  const nextHash = hashToken(nextRefreshToken);

  const refreshDays = Number(
    process.env.JWT_REFRESH_EXPIRES_DAYS || 30
  );

  const expiresAt = new Date(
    Date.now() + refreshDays * 24 * 60 * 60 * 1000
  );

  const newTokenId = await repo.createRefreshToken({
    platformUserId: user.id,
    tokenHash: nextHash,
    deviceName: deviceName || stored.device_name,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
    expiresAt,
  });

  await repo.rotateRefreshToken({
    oldTokenId: stored.id,
    newTokenId,
  });

  return {
  accessToken,
  refreshToken: nextRefreshToken,
  accessTokenExpiresIn:
    env.jwt.accessExpiresIn,
  refreshTokenExpiresAt: expiresAt,
  user: buildSafeUser({
    user,
    permissions,
  }),
};
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) return;

  const stored =
    await repo.findRefreshTokenByHash(
      hashToken(refreshToken)
    );

  if (stored) {
    await repo.revokeRefreshToken(stored.id);
  }
};

const getCurrentUser = async (userId) => {
  const user = await repo.findUserById(userId);

  if (!user) {
    throw httpError(404, "Platform user not found.");
  }

  const permissions =
    await repo.listPermissions(user.id);

  return buildSafeUser({
    user,
    permissions,
  });
};

module.exports = {
  login,
  refresh,
  logout,
  getCurrentUser,
};
