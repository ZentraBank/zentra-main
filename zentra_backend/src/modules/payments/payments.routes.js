const router =
  require("express").Router();

const controller =
  require("./payments.controller");

const schemas =
  require("./payments.validation");

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
  "/rails",
  validate(
    schemas.createRail
  ),
  requireAllPermissions(
    "payments.rails.manage"
  ),
  controller.createRail
);

router.get(
  "/rails",
  validate(
    schemas.listRails
  ),
  requireAllPermissions(
    "payments.rails.read"
  ),
  controller.listRails
);

router.post(
  "/instructions",
  validate(
    schemas.createInstruction
  ),
  requireAllPermissions(
    "payments.create"
  ),
  controller.createInstruction
);

router.get(
  "/instructions/mine",
  validate(
    schemas.listInstructions
  ),
  requireAllPermissions(
    "payments.create"
  ),
  controller.listMine
);

router.get(
  "/instructions",
  validate(
    schemas.listInstructions
  ),
  requireAllPermissions(
    "payments.read"
  ),
  controller.listInstructions
);

router.post(
  "/instructions/:instructionId/validate",
  validate(
    schemas.instructionId
  ),
  requireAllPermissions(
    "payments.validate"
  ),
  controller.validateInstruction
);

router.post(
  "/instructions/:instructionId/submit",
  validate(
    schemas.submitInstruction
  ),
  requireAllPermissions(
    "payments.submit"
  ),
  controller.submitInstruction
);

router.post(
  "/instructions/:instructionId/clear",
  validate(
    schemas.markCleared
  ),
  requireAllPermissions(
    "payments.clearing.manage"
  ),
  controller.markCleared
);

router.post(
  "/clearing/batches",
  validate(
    schemas.createClearingBatch
  ),
  requireAllPermissions(
    "payments.clearing.manage"
  ),
  controller.createClearingBatch
);

router.post(
  "/clearing/batches/:batchId/instructions/:instructionId",
  validate(
    schemas.batchInstruction
  ),
  requireAllPermissions(
    "payments.clearing.manage"
  ),
  controller.addInstructionToBatch
);

router.post(
  "/settlements/calculate",
  validate(
    schemas.calculateSettlement
  ),
  requireAllPermissions(
    "payments.settlement.manage"
  ),
  controller.calculateSettlement
);

router.post(
  "/settlements/:settlementBatchId/post",
  validate(
    schemas.settlementBatchId
  ),
  requireAllPermissions(
    "payments.settlement.post"
  ),
  controller.postSettlement
);

module.exports =
  router;
