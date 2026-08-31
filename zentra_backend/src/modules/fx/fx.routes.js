const router =
  require("express").Router();

const controller =
  require("./fx.controller");

const schemas =
  require("./fx.validation");

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

const {
  requirePlanFeature,
} = require(
  "../../middleware/subscription.middleware"
);

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| Tenant FX administration
|--------------------------------------------------------------------------
*/

router.get(
  "/rate-sources",

  requirePlanFeature(
    "fx_access"
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.listRateSources
);

router.get(
  "/rates",

  requirePlanFeature(
    "fx_access"
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.listRates
);

router.get(
  "/spread-rules",

  requirePlanFeature(
    "fx_access"
  ),

  requireAllPermissions(
    "fx.spreads.manage"
  ),

  controller.listSpreadRules
);

router.post(
  "/rate-sources",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.createRateSource
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.createRateSource
);

router.get(
  "/simple-rates",

  requirePlanFeature(
    "fx_access"
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.listSimpleRates
);

router.post(
  "/simple-rates",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.saveSimpleRate
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.saveSimpleRate
);

router.patch(
  "/simple-rates/:rateId",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.updateSimpleRate
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.updateSimpleRate
);

router.delete(
  "/simple-rates/:rateId",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.simpleRateId
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.deleteSimpleRate
);

/*
|--------------------------------------------------------------------------
| Client-facing FX rates
|--------------------------------------------------------------------------
*/

router.get(
  "/rate",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.getSimpleRate
  ),

  controller.getSimpleRate
);

/*
|--------------------------------------------------------------------------
| Tenant FX configuration
|--------------------------------------------------------------------------
*/

router.post(
  "/rates",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.createRate
  ),

  requireAllPermissions(
    "fx.rates.manage"
  ),

  controller.createRate
);

router.post(
  "/spread-rules",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.createSpreadRule
  ),

  requireAllPermissions(
    "fx.spreads.manage"
  ),

  controller.createSpreadRule
);

/*
|--------------------------------------------------------------------------
| Client FX quotes and conversion
|--------------------------------------------------------------------------
*/

router.post(
  "/quotes",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.createQuote
  ),

  requireAllPermissions(
    "fx.quotes.create"
  ),

  controller.createQuote
);

router.post(
  "/quotes/:quoteId/convert",

  requirePlanFeature(
    "fx_access"
  ),

  validate(
    schemas.executeConversion
  ),

  requireAllPermissions(
    "fx.convert"
  ),

  controller.executeConversion
);

module.exports =
  router;