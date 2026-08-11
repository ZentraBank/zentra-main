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

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

router.post(
  "/rate-sources",
  validate(
    schemas.createRateSource
  ),
  requireAllPermissions(
    "fx.rates.manage"
  ),
  controller.createRateSource
);

router.post(
  "/rates",
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
  validate(
    schemas.createSpreadRule
  ),
  requireAllPermissions(
    "fx.spreads.manage"
  ),
  controller.createSpreadRule
);

router.post(
  "/quotes",
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
