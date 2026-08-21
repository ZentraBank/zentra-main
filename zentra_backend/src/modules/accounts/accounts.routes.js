const router = require("express").Router();

const controller = require("./accounts.controller");
const schemas = require("./accounts.validation");

const validate =
  require("../../middleware/validate.middleware");

const {
  resolveTenantMiddleware,
} = require("../../middleware/tenant.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");

router.use(resolveTenantMiddleware);
router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Client / self-service account routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  requireAllPermissions("accounts.read"),
  controller.listOwn
);
router.get(
  "/me/activity",
  validate(
    schemas.activityListSchema
  ),
  requireAllPermissions(
    "accounts.read"
  ),
  controller.listOwnActivity
);
router.get(
  "/transfer-destination/:accountNumber",
  validate(
    schemas.transferDestinationSchema
  ),
  requireAllPermissions(
    "accounts.read"
  ),
  controller.lookupTransferDestination
);

router.get(
  "/me/:accountId",
  validate(schemas.accountIdSchema),
  requireAllPermissions("accounts.read"),
  controller.getOwn
);

router.post(
  "/",
  validate(schemas.createAccountSchema),
  requireAllPermissions("accounts.create"),
  controller.createOwn
);

/*
|--------------------------------------------------------------------------
| Tenant administrator account routes
|--------------------------------------------------------------------------
*/

router.get(
  "/tenant",
  requireAllPermissions("accounts.read"),
  controller.listTenantAccounts
);

router.get(
  "/tenant/:accountId",
  validate(schemas.accountIdSchema),
  requireAllPermissions("accounts.read"),
  controller.getTenantAccount
);
router.patch(
  "/tenant/:accountId/balance",
  validate(schemas.balanceSchema),
  requireAllPermissions(
    "accounts.manage_balance"
  ),
  controller.setBalance
);
router.post(
  "/tenant/:accountId/adjustment",
  validate(
    schemas.balanceAdjustmentSchema
  ),
  requireAllPermissions(
    "accounts.manage_balance"
  ),
  controller.adjustTenantBalance
);

router.patch(
  "/:accountId/status",
  validate(schemas.statusSchema),
  requireAllPermissions("accounts.manage"),
  controller.setStatus
);

module.exports = router;