const router =
  require("express").Router();

const controller =
  require("./treasury.controller");

const schemas =
  require("./treasury.validation");

const validate =
  require(
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

const {
  requireAllPermissions,
} = require(
  "../../middleware/permission.middleware"
);

router.use(resolveTenantMiddleware);
router.use(authenticate);

router.post(
  "/fees/definitions",
  validate(
    schemas.createFeeDefinition
  ),
  requireAllPermissions(
    "treasury.fees.manage"
  ),
  controller.createFeeDefinition
);

router.get(
  "/fees/definitions",
  validate(
    schemas.listFeeDefinitions
  ),
  requireAllPermissions(
    "treasury.fees.read"
  ),
  controller.listFeeDefinitions
);

router.post(
  "/fees/assess",
  validate(
    schemas.assessFee
  ),
  requireAllPermissions(
    "treasury.fees.assess"
  ),
  controller.assessFee
);

router.post(
  "/fees/assessments/:assessmentId/post",
  validate(
    schemas.assessmentId
  ),
  requireAllPermissions(
    "treasury.fees.post"
  ),
  controller.postFee
);

router.post(
  "/fees/assessments/:assessmentId/waive",
  validate(
    schemas.waiveFee
  ),
  requireAllPermissions(
    "treasury.fees.waive"
  ),
  controller.waiveFee
);

router.post(
  "/interest/products",
  validate(
    schemas.createInterestProduct
  ),
  requireAllPermissions(
    "treasury.interest.manage"
  ),
  controller.createInterestProduct
);

router.get(
  "/interest/products",
  validate(
    schemas.listInterestProducts
  ),
  requireAllPermissions(
    "treasury.interest.read"
  ),
  controller.listInterestProducts
);

router.post(
  "/interest/accruals",
  validate(
    schemas.accrueInterest
  ),
  requireAllPermissions(
    "treasury.interest.accrue"
  ),
  controller.accrueInterest
);

router.post(
  "/interest/accruals/:accrualId/post",
  validate(
    schemas.accrualId
  ),
  requireAllPermissions(
    "treasury.interest.post"
  ),
  controller.postInterest
);

router.post(
  "/positions",
  validate(
    schemas.treasuryPosition
  ),
  requireAllPermissions(
    "treasury.positions.manage"
  ),
  controller.createTreasuryPosition
);

module.exports = router;
