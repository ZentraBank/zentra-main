const router =
  require("express").Router();

const controller =
  require("./admin-dashboard.controller");

const schemas =
  require("./admin-dashboard.validation");

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

router.use(
  requireAllPermissions(
    "dashboard.read"
  )
);

router.get(
  "/",
  validate(
    schemas.dashboardQuery
  ),
  controller.fullDashboard
);

router.get(
  "/overview",
  validate(
    schemas.dateRangeQuery
  ),
  controller.overview
);

router.get(
  "/transfer-trend",
  validate(
    schemas.dateRangeQuery
  ),
  controller.transferTrend
);

router.get(
  "/customer-growth",
  validate(
    schemas.dateRangeQuery
  ),
  controller.customerGrowth
);

router.get(
  "/account-distribution",
  controller.accountDistribution
);

router.get(
  "/recent-activity",
  validate(
    schemas.recentActivityQuery
  ),
  controller.recentActivity
);

router.get(
  "/pending-actions",
  controller.pendingActions
);

module.exports =
  router;
