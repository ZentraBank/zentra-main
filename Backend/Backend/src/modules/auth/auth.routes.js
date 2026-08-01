const express = require("express");
const authController = require("./auth.controller");
const {
  loginSchema,
  registerSchema,
  verifyRegistrationSchema,
  resendRegistrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshSchema,
  logoutSchema,
} = require("./auth.validation");
const validate = require("../../middleware/validate.middleware");
const {
  resolveTenantMiddleware,
} = require("../../middleware/tenant.middleware");
const { authenticate } = require("../../middleware/auth.middleware");

const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");

const authTestController = require("./auth.test.controller");

const router = express.Router();

router.get(
  "/social/providers",
  authController.socialProviders
);

router.get(
  "/social/:provider/start",
  resolveTenantMiddleware,
  authController.socialStart
);

router.get(
  "/social/:provider/callback",
  authController.socialCallback
);


router.post("/register", resolveTenantMiddleware, validate(registerSchema.body), authController.register);
router.post("/register/verify", resolveTenantMiddleware, validate(verifyRegistrationSchema.body), authController.verifyRegistration);
router.post("/register/resend", resolveTenantMiddleware, validate(resendRegistrationSchema.body), authController.resendRegistration);
router.post("/forgot-password", resolveTenantMiddleware, validate(forgotPasswordSchema.body), authController.forgotPassword);
router.post("/reset-password", resolveTenantMiddleware, validate(resetPasswordSchema.body), authController.resetPassword);
router.post("/change-password", resolveTenantMiddleware, authenticate, validate(changePasswordSchema.body), authController.changePassword);

router.post(
  "/login",
  resolveTenantMiddleware,
  validate(loginSchema.body),
  authController.login
);

router.post(
  "/refresh",
  validate(refreshSchema.body),
  authController.refresh
);

router.post(
  "/logout",
  validate(logoutSchema.body),
  authController.logout
);

router.get(
  "/me",
  resolveTenantMiddleware,
  authenticate,
  authController.me
);

router.get(
  "/test/accounts-read",
  resolveTenantMiddleware,
  authenticate,
  requireAllPermissions("accounts.read"),
  authTestController.testAccountsRead
);

module.exports = router;
