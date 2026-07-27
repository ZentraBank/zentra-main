const router =
  require("express").Router();

const controller =
  require("./ledger.controller");

const schemas =
  require("./ledger.validation");

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
  "/accounts",
  validate(
    schemas.createLedgerAccount
  ),
  requireAllPermissions(
    "ledger.accounts.manage"
  ),
  controller.createLedgerAccount
);

router.get(
  "/accounts/:ledgerAccountId/balance",
  validate(
    schemas.ledgerAccountId
  ),
  requireAllPermissions(
    "ledger.read"
  ),
  controller.getBalance
);

router.post(
  "/journals",
  validate(
    schemas.postJournal
  ),
  requireAllPermissions(
    "ledger.post"
  ),
  controller.postJournal
);

router.post(
  "/journals/:journalId/reverse",
  validate(
    schemas.reverseJournal
  ),
  requireAllPermissions(
    "ledger.reverse"
  ),
  controller.reverseJournal
);

router.get(
  "/journals",
  validate(
    schemas.listJournals
  ),
  requireAllPermissions(
    "ledger.read"
  ),
  controller.listJournals
);

router.post(
  "/holds",
  validate(
    schemas.createHold
  ),
  requireAllPermissions(
    "ledger.holds.manage"
  ),
  controller.createHold
);

router.post(
  "/holds/:holdId/release",
  validate(
    schemas.holdId
  ),
  requireAllPermissions(
    "ledger.holds.manage"
  ),
  controller.releaseHold
);

router.post(
  "/holds/expire",
  requireAllPermissions(
    "ledger.holds.manage"
  ),
  controller.expireHolds
);

module.exports =
  router;
