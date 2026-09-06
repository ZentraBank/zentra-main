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
| These routes are intentionally defined before tenant resolution and
| normal authentication.
|
| Newly registered tenants may not yet have a normal authenticated tenant
| session. Access to these endpoints is therefore controlled using the
| X-Onboarding-Token header.
|
| The subscription service resolves the onboarding token back to the
| appropriate tenant and tenant owner.
|
*/

/*
|--------------------------------------------------------------------------
| Start onboarding subscription request
|--------------------------------------------------------------------------
*/

router.post(
  "/onboarding/requests",
  validate(
    schema.startOnboardingSubscription
  ),
  controller.startOnboardingSubscription
);

/*
|--------------------------------------------------------------------------
| Upload onboarding payment proof file
|--------------------------------------------------------------------------
*/

router.post(
  "/onboarding/payment-proof/upload",
  uploadSingleDocument,
  controller.uploadOnboardingPaymentProof
);

/*
|--------------------------------------------------------------------------
| Attach payment proof to onboarding request
|--------------------------------------------------------------------------
*/

router.patch(
  "/onboarding/requests/:requestId/payment-proof",
  validate(
    schema.onboardingProof
  ),
  controller.submitOnboardingProof
);

/*
|--------------------------------------------------------------------------
| Read onboarding subscription status
|--------------------------------------------------------------------------
*/

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
| Everything below this point must resolve a tenant before continuing.
|
*/

router.use(
  resolveTenantMiddleware
);

/*
|--------------------------------------------------------------------------
| Subscription plans
|--------------------------------------------------------------------------
|
| A tenant context must exist, but a normal authenticated JWT is not
| required to retrieve the subscription catalogue.
|
*/

router.get(
  "/plans",
  controller.listPlans
);

/*
|--------------------------------------------------------------------------
| Authenticated tenant routes
|--------------------------------------------------------------------------
*/

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| Upload authenticated payment proof
|--------------------------------------------------------------------------
|
| Creates the private subscriptions/payment_proof file record and returns
| the paymentProofFileId required by the request payment-proof endpoint.
|
*/

router.post(
  "/payment-proof/upload",
  requireAllPermissions(
    "subscriptions.read"
  ),
  uploadSingleDocument,
  controller.uploadPaymentProof
);
/*
|--------------------------------------------------------------------------
| Current tenant subscription
|--------------------------------------------------------------------------
|
| Returns:
|
| - current active subscription
| - resolved subscription entitlements
| - any open plan-change request for the current user
|
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
| Request subscription plan change
|--------------------------------------------------------------------------
|
| This endpoint is used by an authenticated tenant administrator to request
| a different subscription plan.
|
| It can support both upgrades and downgrades. The tenant is only requesting
| the plan change here; it does NOT approve or activate its own subscription.
|
| Commercial approval belongs to the platform/Superadmin subscription flow.
|
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
| Submit payment proof for plan-change request
|--------------------------------------------------------------------------
|
| The tenant can attach payment proof to its own subscription request.
|
| Once submitted, the request must be reviewed and approved or rejected by
| the platform/Superadmin subscription module.
|
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

module.exports = router;