const router =
  require("express").Router();

const controller =
  require("./resilience.controller");

const schemas =
  require("./resilience.validation");

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
  "/critical-services",
  validate(
    schemas.createCriticalService
  ),
  requireAllPermissions(
    "resilience.services.manage"
  ),
  controller.createCriticalService
);

router.post(
  "/critical-services/:serviceId/dependencies",
  validate(
    schemas.createDependency
  ),
  requireAllPermissions(
    "resilience.dependencies.manage"
  ),
  controller.addDependency
);

router.post(
  "/incidents",
  validate(
    schemas.createIncident
  ),
  requireAllPermissions(
    "resilience.incidents.create"
  ),
  controller.createIncident
);

router.patch(
  "/incidents/:incidentId/status",
  validate(
    schemas.updateIncidentStatus
  ),
  requireAllPermissions(
    "resilience.incidents.manage"
  ),
  controller.updateIncidentStatus
);

router.post(
  "/incidents/:incidentId/affected-services",
  validate(
    schemas.addAffectedService
  ),
  requireAllPermissions(
    "resilience.incidents.manage"
  ),
  controller.addAffectedService
);

router.post(
  "/incidents/:incidentId/actions",
  validate(
    schemas.createIncidentAction
  ),
  requireAllPermissions(
    "resilience.incidents.manage"
  ),
  controller.createIncidentAction
);

router.patch(
  "/incident-actions/:actionId/status",
  validate(
    schemas.updateIncidentActionStatus
  ),
  requireAllPermissions(
    "resilience.incidents.manage"
  ),
  controller.updateIncidentActionStatus
);

router.post(
  "/critical-services/:serviceId/continuity-plans",
  validate(
    schemas.createContinuityPlan
  ),
  requireAllPermissions(
    "resilience.continuity_plans.manage"
  ),
  controller.createContinuityPlan
);

router.post(
  "/exercises",
  validate(
    schemas.createExercise
  ),
  requireAllPermissions(
    "resilience.exercises.manage"
  ),
  controller.createExercise
);

router.post(
  "/exercises/:exerciseId/complete",
  validate(
    schemas.completeExercise
  ),
  requireAllPermissions(
    "resilience.exercises.manage"
  ),
  controller.completeExercise
);

router.post(
  "/incidents/:incidentId/post-incident-review",
  validate(
    schemas.createPostIncidentReview
  ),
  requireAllPermissions(
    "resilience.reviews.manage"
  ),
  controller.createPostIncidentReview
);

module.exports =
  router;
