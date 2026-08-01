const router = require("express").Router();

const controller =
  require("./platform-search.controller");

const schemas =
  require("./platform-search.validation");

const validate =
  require("../../middleware/validate.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const {
  requirePlatformScope,
} = require("../../middleware/platform-scope.middleware");

const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");

router.use(authenticate);
router.use(requirePlatformScope);

router.get(
  "/users",
  validate(schemas.users),
  requireAllPermissions(
    "platform.users.read"
  ),
  controller.users
);

router.get(
  "/accounts",
  validate(schemas.accounts),
  requireAllPermissions(
    "platform.accounts.read"
  ),
  controller.accounts
);

router.get(
  "/transactions",
  validate(schemas.transactions),
  requireAllPermissions(
    "platform.transactions.read"
  ),
  controller.transactions
);

module.exports = router;
