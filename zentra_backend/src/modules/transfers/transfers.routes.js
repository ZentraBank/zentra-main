const router = require("express").Router();

const controller = require("./transfers.controller");
const schemas = require("./transfers.validation");

const validate = require("../../middleware/validate.middleware");

const {
  requirePlanLimit,
} = require(
  "../../middleware/subscription.middleware"
);

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
| Client transfer routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  validate(schemas.createTransferSchema),

  requirePlanLimit(
    "transfer_limit",
    (req) => req.body.amount
  ),

  requireAllPermissions("transfers.create"),

  controller.createOwn
);

router.get(
  "/me",
  validate(schemas.listTransfersSchema),
  requireAllPermissions("transfers.read_own"),
  controller.listOwn
);

router.get(
  "/me/:transferId",
  validate(schemas.transferIdSchema),
  requireAllPermissions("transfers.read_own"),
  controller.getOwn
);

/*
|--------------------------------------------------------------------------
| Tenant administrator transfer routes
|--------------------------------------------------------------------------
*/

router.get(
  "/tenant",
  validate(schemas.listTransfersSchema),
  requireAllPermissions("transfers.read_tenant"),
  controller.listTenant
);

router.get(
  "/tenant/:transferId",
  validate(schemas.transferIdSchema),
  requireAllPermissions("transfers.read_tenant"),
  controller.getTenant
);

router.patch(
  "/tenant/:transferId",
  validate(schemas.updateTenantTransferSchema),
  requireAllPermissions(
    "transfers.read_tenant",
    "transfers.update_tenant"
  ),
  controller.updateTenant
);

module.exports = router;