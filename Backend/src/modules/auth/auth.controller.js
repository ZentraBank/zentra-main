const env = require("../../config/env");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const authService = require("./auth.service");

const REFRESH_COOKIE_NAME = "zentrabank_refresh_token";

const getClientIpAddress = (req) =>
  req.ip || req.socket?.remoteAddress || null;

const getRefreshCookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: env.cookies.sameSite,
  path: `${env.apiPrefix}/auth`,
  expires: expiresAt,
});

const getRefreshTokenFromRequest = (req) =>
  req.cookies?.[REFRESH_COOKIE_NAME] ||
  req.body?.refreshToken ||
  null;

const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    tenantId: req.tenant.id,
    email: req.body.email,
    password: req.body.password,
    ipAddress: getClientIpAddress(req),
    userAgent: req.get("user-agent") || null,
  });

  res.cookie(
    REFRESH_COOKIE_NAME,
    result.refreshToken,
    getRefreshCookieOptions(result.refreshTokenExpiresAt)
  );

  return sendSuccess(res, {
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken({
    refreshToken: getRefreshTokenFromRequest(req),
    ipAddress: getClientIpAddress(req),
    userAgent: req.get("user-agent") || null,
  });

  res.cookie(
    REFRESH_COOKIE_NAME,
    result.refreshToken,
    getRefreshCookieOptions(result.refreshTokenExpiresAt)
  );

  return sendSuccess(res, {
    message: "Access token refreshed successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout({
    refreshToken: getRefreshTokenFromRequest(req),
  });

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.cookies.secure,
    sameSite: env.cookies.sameSite,
    path: `${env.apiPrefix}/auth`,
  });

  return sendSuccess(res, {
    message: "Logout successful",
    data: null,
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser({
    userId: req.auth.userId,
    membershipId: req.auth.membershipId,
    tenantId: req.auth.tenantId,
  });

  return sendSuccess(res, {
    message: "Authenticated user retrieved successfully",
    data: user,
  });
});

module.exports = {
  login,
  refresh,
  logout,
  me,
};
