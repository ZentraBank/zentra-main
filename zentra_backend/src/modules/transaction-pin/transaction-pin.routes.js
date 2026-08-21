const router = require("express").Router();

const controller = require("./transaction-pin.controller");
const schemas = require("./transaction-pin.validation");

const validate = require("../../middleware/validate.middleware");

const {
  resolveTenantMiddleware,
} = require("../../middleware/tenant.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

router.use(
  resolveTenantMiddleware,
  authenticate
);

/*
|--------------------------------------------------------------------------
| Transaction PIN
|--------------------------------------------------------------------------
*/

router.get(
  "/status",
  controller.status
);

router.post(
  "/setup",
  validate(schemas.setup),
  controller.setup
);

router.post(
  "/change",
  validate(schemas.change),
  controller.change
);

/*
|--------------------------------------------------------------------------
| Forgot / reset PIN
|--------------------------------------------------------------------------
*/

router.post(
  "/reset/request",
  controller.requestReset
);

router.post(
  "/reset",
  validate(schemas.reset),
  controller.reset
);

module.exports = router;