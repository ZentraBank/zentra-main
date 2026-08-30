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
| We read it from:
|
|   X-Onboarding-Token: <token>
|
| instead of putting it in:
|
| - request body
| - query string
| - URL
|
| This keeps it out of URLs, browser history and most request logs.
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

const listPlans = asyncHandler(
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

const getMine = asyncHandler(
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
| Authenticated subscription request
|--------------------------------------------------------------------------
*/

const startUpgrade = asyncHandler(
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

const submitProof = asyncHandler(
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
| Onboarding subscription request
|--------------------------------------------------------------------------
|
| No normal JWT session exists yet.
|
| Access is restricted by the temporary onboarding token.
|
*/

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
| Onboarding payment proof
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
| Pending subscription requests
|--------------------------------------------------------------------------
*/

const listPending =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Pending requests retrieved successfully",

          data:
            await service.listPending(
              {
                tenantId:
                  req.auth
                    .tenantId,

                page:
                  Number(
                    req.query.page
                  ),

                pageSize:
                  Number(
                    req.query
                      .pageSize
                  ),
              }
            ),
        }
      )
  );

/*
|--------------------------------------------------------------------------
| Approve subscription
|--------------------------------------------------------------------------
*/

const approve =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Subscription approved successfully",

          data:
            await service.approve(
              {
                auth:
                  req.auth,

                requestId:
                  req.params
                    .requestId,

                durationDays:
                  Number(
                    req.body
                      .durationDays
                  ),
              }
            ),
        }
      )
  );

/*
|--------------------------------------------------------------------------
| Reject subscription
|--------------------------------------------------------------------------
*/

const reject =
  asyncHandler(
    async (
      req,
      res
    ) =>
      sendSuccess(
        res,
        {
          message:
            "Subscription rejected successfully",

          data:
            await service.reject(
              {
                auth:
                  req.auth,

                requestId:
                  req.params
                    .requestId,

                reason:
                  req.body
                    .reason,
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

  uploadOnboardingPaymentProof,

  startOnboardingSubscription,
  submitOnboardingProof,
  getOnboardingStatus,

  listPending,
  approve,
  reject,
};