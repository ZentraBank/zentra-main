const router =
  require("express").Router();

const controller =
  require("./disputes.controller");

const schemas =
  require("./disputes.validation");

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
  "/",
  validate(
    schemas.createDispute
  ),
  requireAllPermissions(
    "disputes.create"
  ),
  controller.createDispute
);

router.get(
  "/mine",
  validate(
    schemas.listDisputes
  ),
  requireAllPermissions(
    "disputes.create"
  ),
  controller.listMine
);

router.get(
  "/",
  validate(
    schemas.listDisputes
  ),
  requireAllPermissions(
    "disputes.read"
  ),
  controller.listDisputes
);

router.get(
  "/:disputeId",
  validate(
    schemas.disputeId
  ),
  requireAllPermissions(
    "disputes.read"
  ),
  controller.getDispute
);

router.patch(
  "/:disputeId",
  validate(
    schemas.updateDispute
  ),
  requireAllPermissions(
    "disputes.manage"
  ),
  controller.updateDispute
);

router.post(
  "/:disputeId/evidence",
  validate(
    schemas.addEvidence
  ),
  requireAllPermissions(
    "disputes.evidence.create"
  ),
  controller.addEvidence
);

router.patch(
  "/evidence/:evidenceId/review",
  validate(
    schemas.reviewEvidence
  ),
  requireAllPermissions(
    "disputes.evidence.review"
  ),
  controller.reviewEvidence
);

router.post(
  "/:disputeId/refunds",
  validate(
    schemas.createRefund
  ),
  requireAllPermissions(
    "disputes.refunds.manage"
  ),
  controller.createRefund
);

router.post(
  "/:disputeId/chargebacks",
  validate(
    schemas.createChargeback
  ),
  requireAllPermissions(
    "disputes.chargebacks.manage"
  ),
  controller.createChargeback
);

router.patch(
  "/chargebacks/:chargebackId",
  validate(
    schemas.updateChargeback
  ),
  requireAllPermissions(
    "disputes.chargebacks.manage"
  ),
  controller.updateChargeback
);

module.exports =
  router;
