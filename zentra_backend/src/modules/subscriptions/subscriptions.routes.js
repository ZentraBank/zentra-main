const router = require("express").Router();

const controller =
  require("./subscriptions.controller");

const schema =
  require("./subscriptions.validation");

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
  uploadSingleDocument,
} = require(
  "../../middleware/upload.middleware"
);

/*
|--------------------------------------------------------------------------
| Public onboarding subscription flow
|--------------------------------------------------------------------------
|
| These routes are intentionally BEFORE tenant resolution and normal
| authentication.
|
| Newly created tenants may not yet be accessing the API through a resolved
| tenant domain and they do not yet have a normal authenticated session.
|
| Their access is restricted using:
|
|   X-Onboarding-Token
|
| The service resolves that token back to the correct tenant + owner.
|
*/

router.post(
  "/onboarding/requests",
  validate(
    schema.startOnboardingSubscription
  ),
  controller.startOnboardingSubscription
);

router.post(
  "/onboarding/payment-proof/upload",
  uploadSingleDocument,
  controller.uploadOnboardingPaymentProof
);

router.patch(
  "/onboarding/requests/:requestId/payment-proof",
  validate(
    schema.onboardingProof
  ),
  controller.submitOnboardingProof
);

router.get(
  "/onboarding/status",
  validate(
    schema.onboardingStatus
  ),
  controller.getOnboardingStatus
);
/*
|--------------------------------------------------------------------------
| Tenant-resolved subscription routes
|--------------------------------------------------------------------------
|
| Everything below this point requires a tenant context.
|
*/

router.use(
  resolveTenantMiddleware
);

/*
|--------------------------------------------------------------------------
| Public subscription catalogue
|--------------------------------------------------------------------------
|
| Public in the sense that a normal JWT is not required.
| A valid tenant still has to be resolved.
|
*/

router.get(
  "/plans",
  controller.listPlans
);

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| Current subscription
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  requireAllPermissions(
    "subscriptions.read"
  ),
  controller.getMine
);

/*
|--------------------------------------------------------------------------
| Authenticated subscription request
|--------------------------------------------------------------------------
*/

router.post(
  "/requests",
  validate(
    schema.startUpgrade
  ),
  requireAllPermissions(
    "subscriptions.read"
  ),
  controller.startUpgrade
);

/*
|--------------------------------------------------------------------------
| Authenticated payment proof
|--------------------------------------------------------------------------
*/

router.patch(
  "/requests/:requestId/payment-proof",
  validate(
    schema.proof
  ),
  requireAllPermissions(
    "subscriptions.read"
  ),
  controller.submitProof
);

/*
|--------------------------------------------------------------------------
| Tenant admin - pending requests
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/requests/pending",
  validate(
    schema.pending
  ),
  requireAllPermissions(
    "subscriptions.manage"
  ),
  controller.listPending
);

/*
|--------------------------------------------------------------------------
| Tenant admin - approve request
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/requests/:requestId/approve",
  validate(
    schema.approve
  ),
  requireAllPermissions(
    "subscriptions.manage"
  ),
  controller.approve
);

/*
|--------------------------------------------------------------------------
| Tenant admin - reject request
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/requests/:requestId/reject",
  validate(
    schema.reject
  ),
  requireAllPermissions(
    "subscriptions.manage"
  ),
  controller.reject
);

module.exports = router;