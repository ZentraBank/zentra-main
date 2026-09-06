const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./subscriptions.service");

/*
|--------------------------------------------------------------------------
| Onboarding token helper
|--------------------------------------------------------------------------
|
| The onboarding token is treated as a temporary credential.
|
| It is read from:
|
|   X-Onboarding-Token: <token>
|
| rather than request bodies, query strings, or URLs.
|
*/

const getOnboardingToken = (
  req
) => {
  const token =
    req.get(
      "X-Onboarding-Token"
    );

  if (
    !token ||
    typeof token !== "string"
  ) {
    return null;
  }

  return token.trim();
};

/*
|--------------------------------------------------------------------------
| Plans
|--------------------------------------------------------------------------
*/

const listPlans =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Subscription plans retrieved successfully",

          data:
            await service.listPlans({
              tenantId:
                req.tenant.id,
            }),
        }
      )
  );

/*
|--------------------------------------------------------------------------
| Current authenticated subscription
|--------------------------------------------------------------------------
*/

const getMine =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Subscription retrieved successfully",

          data:
            await service.getMine({
              tenantId:
                req.auth.tenantId,

              userId:
                req.auth.userId,
            }),
        }
      )
  );

/*
|--------------------------------------------------------------------------
| Authenticated plan-change request
|--------------------------------------------------------------------------
|
| Despite the legacy service name "startUpgrade", this endpoint can be used
| for any valid plan change.
|
| The tenant only creates a request here.
|
| Approval/rejection belongs to the platform/Superadmin flow.
|
*/

const startUpgrade =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Subscription request created successfully",

          data:
            await service.startUpgrade({
              tenantId:
                req.auth.tenantId,

              userId:
                req.auth.userId,

              planCode:
                req.body.planCode,
            }),
        },
        201
      )
  );

/*
|--------------------------------------------------------------------------
| Authenticated payment proof
|--------------------------------------------------------------------------
*/

const submitProof =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Payment proof submitted successfully",

          data:
            await service.submitProof({
              auth:
                req.auth,

              requestId:
                req.params
                  .requestId,

              body:
                req.body,
            }),
        }
      )
  );

/*
|--------------------------------------------------------------------------
| Authenticated payment proof upload
|--------------------------------------------------------------------------
*/

const uploadPaymentProof =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Payment proof file uploaded successfully",

          data:
            await service
              .uploadPaymentProof({
                auth:
                  req.auth,

                file:
                  req.file,
              }),
        },
        201
      )
  ); 
/*
|--------------------------------------------------------------------------
| Upload onboarding payment proof
|--------------------------------------------------------------------------
|
| The browser sends:
|
| - X-Onboarding-Token
| - multipart/form-data
| - file
|
| Multer places the uploaded file on req.file.
|
*/

const uploadOnboardingPaymentProof =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Payment proof file uploaded successfully",

          data:
            await service
              .uploadOnboardingPaymentProof(
                {
                  onboardingToken:
                    getOnboardingToken(
                      req
                    ),

                  file:
                    req.file,
                }
              ),
        },
        201
      )
  );

/*
|--------------------------------------------------------------------------
| Start onboarding subscription request
|--------------------------------------------------------------------------
*/

const startOnboardingSubscription =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Subscription request created successfully",

          data:
            await service
              .startOnboardingSubscription(
                {
                  onboardingToken:
                    getOnboardingToken(
                      req
                    ),

                  planCode:
                    req.body
                      .planCode,
                }
              ),
        },
        201
      )
  );

/*
|--------------------------------------------------------------------------
| Submit onboarding payment proof
|--------------------------------------------------------------------------
*/

const submitOnboardingProof =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Payment proof submitted successfully",

          data:
            await service
              .submitOnboardingProof(
                {
                  onboardingToken:
                    getOnboardingToken(
                      req
                    ),

                  requestId:
                    req.params
                      .requestId,

                  body:
                    req.body,
                }
              ),
        }
      )
  );

/*
|--------------------------------------------------------------------------
| Onboarding subscription status
|--------------------------------------------------------------------------
*/

const getOnboardingStatus =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Subscription status retrieved successfully",

          data:
            await service
              .getOnboardingStatus(
                {
                  onboardingToken:
                    getOnboardingToken(
                      req
                    ),
                }
              ),
        }
      )
  );

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  listPlans,

  getMine,

  startUpgrade,
  submitProof,
  uploadPaymentProof,

  uploadOnboardingPaymentProof,

  startOnboardingSubscription,
  submitOnboardingProof,
  getOnboardingStatus,
};