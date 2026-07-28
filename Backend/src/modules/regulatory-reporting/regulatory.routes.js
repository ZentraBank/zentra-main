const router =
  require("express").Router();

const controller =
  require("./regulatory.controller");

const schemas =
  require("./regulatory.validation");

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
  "/authorities",
  validate(
    schemas.createAuthority
  ),
  requireAllPermissions(
    "regulatory.authorities.manage"
  ),
  controller.createAuthority
);

router.post(
  "/definitions",
  validate(
    schemas.createDefinition
  ),
  requireAllPermissions(
    "regulatory.definitions.manage"
  ),
  controller.createDefinition
);

router.post(
  "/runs",
  validate(
    schemas.createRun
  ),
  requireAllPermissions(
    "regulatory.runs.create"
  ),
  controller.createRun
);

router.post(
  "/runs/:runId/records",
  validate(
    schemas.uploadRecords
  ),
  requireAllPermissions(
    "regulatory.runs.manage"
  ),
  controller.uploadRecords
);

router.post(
  "/runs/:runId/validate",
  validate(
    schemas.validateRun
  ),
  requireAllPermissions(
    "regulatory.runs.validate"
  ),
  controller.validateRun
);

router.post(
  "/runs/:runId/approve",
  validate(
    schemas.runId
  ),
  requireAllPermissions(
    "regulatory.runs.approve"
  ),
  controller.approveRun
);

router.post(
  "/runs/:runId/file",
  validate(
    schemas.attachGeneratedFile
  ),
  requireAllPermissions(
    "regulatory.runs.manage"
  ),
  controller.attachGeneratedFile
);

router.post(
  "/runs/:runId/submissions",
  validate(
    schemas.runId
  ),
  requireAllPermissions(
    "regulatory.submissions.create"
  ),
  controller.createSubmission
);

router.patch(
  "/submissions/:submissionId",
  validate(
    schemas.updateSubmission
  ),
  requireAllPermissions(
    "regulatory.submissions.manage"
  ),
  controller.updateSubmission
);

module.exports =
  router;
