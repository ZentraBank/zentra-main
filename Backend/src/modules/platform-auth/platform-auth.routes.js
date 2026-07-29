const router = require("express").Router();

const controller = require("./platform-auth.controller");
const schemas = require("./platform-auth.validation");

const validate =
  require("../../middleware/validate.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const {
  requirePlatformScope,
} = require("../../middleware/platform-scope.middleware");

router.post(
  "/login",
  validate(schemas.login),
  controller.login
);

router.post(
  "/refresh",
  validate(schemas.refresh),
  controller.refresh
);

router.post(
  "/logout",
  validate(schemas.logout),
  controller.logout
);

router.get(
  "/me",
  authenticate,
  requirePlatformScope,
  controller.me
);

module.exports = router;
