const env = require("../../config/env");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const authService = require("./auth.service");
const socialAuthService = require("./social-auth.service");

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


const register = asyncHandler(async (req, res) => {
  const data = await authService.requestRegistration({ tenantId: req.tenant.id, ...req.body });
  return sendSuccess(res, { statusCode: 202, message: "Verification code sent", data });
});

const verifyRegistration = asyncHandler(async (req, res) => {
  const data = await authService.verifyRegistration({ tenantId: req.tenant.id, ...req.body });
  return sendSuccess(res, { statusCode: 201, message: "Registration completed successfully", data });
});

const resendRegistration = asyncHandler(async (req, res) => {
  const data = await authService.resendRegistrationCode({ tenantId: req.tenant.id, email: req.body.email });
  return sendSuccess(res, { message: "Verification code resent", data });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.requestPasswordReset({ tenantId: req.tenant.id, email: req.body.email });
  return sendSuccess(res, { message: "If the account exists, a reset code has been sent", data });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword({ tenantId: req.tenant.id, ...req.body });
  return sendSuccess(res, { message: "Password reset successfully", data: null });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword({ userId: req.auth.userId, tenantId: req.auth.tenantId, ...req.body });
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, secure: env.cookies.secure, sameSite: env.cookies.sameSite, path: `${env.apiPrefix}/auth` });
  return sendSuccess(res, { message: "Password changed successfully. Please log in again.", data: null });
});

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

const socialProviders = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Social login providers retrieved",
    data: socialAuthService.getAvailability(),
  })
);

const socialStart = asyncHandler(async (req, res) => {
  const provider = String(req.params.provider || "").toLowerCase();
  const callbackUrl = `${req.protocol}://${req.get("host")}${env.apiPrefix}/auth/social/${provider}/callback`;
  const state = socialAuthService.createState({
    tenantId: req.tenant.id,
    tenantSlug: req.tenant.slug,
    next: req.query.next,
    callbackUrl,
  });
  const authorizationUrl = socialAuthService.buildAuthorizationUrl({
    provider, state, callbackUrl,
  });
  return res.redirect(authorizationUrl);
});

const socialCallback = asyncHandler(async (req, res) => {
  const provider = String(req.params.provider || "").toLowerCase();
  const frontendCallback = new URL("/auth/social/callback", env.frontendUrl);

  try {
    if (req.query.error) {
      throw Object.assign(new Error("Social login was cancelled"), { statusCode: 401 });
    }
    if (!req.query.code || !req.query.state) {
      throw Object.assign(new Error("Social login response is incomplete"), { statusCode: 400 });
    }

    const state = socialAuthService.verifyState(req.query.state);
    const profile = await socialAuthService.exchangeCode({
      provider,
      code: req.query.code,
      callbackUrl: state.callbackUrl,
    });
    const result = await authService.socialLogin({
      tenantId: state.tenantId,
      email: profile.email,
      ipAddress: getClientIpAddress(req),
      userAgent: req.get("user-agent") || null,
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      getRefreshCookieOptions(result.refreshTokenExpiresAt)
    );
    frontendCallback.searchParams.set("next", socialAuthService.safeNextPath(state.next));
  } catch (error) {
    frontendCallback.searchParams.set("error", error.message || "Social login failed");
  }

  return res.redirect(frontendCallback.toString());
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
  register,
  verifyRegistration,
  resendRegistration,
  forgotPassword,
  resetPassword,
  changePassword,
  login,
  socialProviders,
  socialStart,
  socialCallback,
  refresh,
  logout,
  me,
};
