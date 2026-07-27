const express = require("express");
const authController = require("./auth.controller");
const {
  loginSchema,
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
