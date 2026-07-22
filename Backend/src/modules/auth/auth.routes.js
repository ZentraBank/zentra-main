const express = require("express");

const validate = require(
  "../../middleware/validate.middleware"
);

const {
  resolveTenantMiddleware,
} = require(
  "../../middleware/tenant.middleware"
);

const {
  authenticate,
} = require(
  "../../middleware/auth.middleware"
);

const authController = require("./auth.controller");

const {
  registerSchema,
  loginSchema,
} = require("./auth.validation");

const router = express.Router();

router.post(
  "/register",
  resolveTenantMiddleware,
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  resolveTenantMiddleware,
  validate(loginSchema),
  authController.login
);

router.get(
  "/me",
  resolveTenantMiddleware,
  authenticate,
  authController.me
);

module.exports = router;