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

const router = express.Router();

router.post(
  "/login",
  resolveTenantMiddleware,
  validate(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh
);

router.post(
  "/logout",
  validate(logoutSchema),
  authController.logout
);

router.get(
  "/me",
  resolveTenantMiddleware,
  authenticate,
  authController.me
);

module.exports = router;
