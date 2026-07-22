const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const authService = require("./auth.service");

/**
 * Register a new customer.
 *
 * The tenant is resolved by resolveTenantMiddleware
 * before this controller runs.
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser({
    tenantId: req.tenant.id,
    full_name: req.body.full_name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful",
    data: {
      user: result.user,
      account: result.account,
      accessToken: result.token,
    },
  });
});

/**
 * Log in an existing tenant user.
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser({
    tenantId: req.tenant.id,
    email: req.body.email,
    password: req.body.password,
  });

  return sendSuccess(res, {
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.token,
    },
  });
});

/**
 * Return the currently authenticated user.
 *
 * authenticate middleware should load the latest role,
 * permissions, subscription and plan features into req.auth.
 */
const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: "Authenticated user retrieved successfully",
    data: {
      id: req.auth.userId,
      tenantId: req.auth.tenantId,
      membershipId: req.auth.membershipId || null,

      role: req.auth.role || null,
      permissions: req.auth.permissions || [],

      subscription: req.auth.subscription || null,
      plan: req.auth.plan || null,
      planFeatures: req.auth.planFeatures || {},
    },
  });
});

module.exports = {
  register,
  login,
  me,
};