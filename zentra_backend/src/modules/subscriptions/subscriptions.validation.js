const Joi = require("joi");

/*
|--------------------------------------------------------------------------
| Shared schemas
|--------------------------------------------------------------------------
*/

const planCode = Joi.string()
  .trim()
  .lowercase()
  .valid(
    "bronze",
    "gold",
    "diamond"
  );

const requestId = Joi.string()
  .uuid();

const paymentProofFileId =
  Joi.string()
    .uuid();

const paymentReference =
  Joi.string()
    .trim()
    .min(3)
    .max(120);

const paymentNote =
  Joi.string()
    .trim()
    .max(500)
    .allow("");

module.exports = {

  /*
  |--------------------------------------------------------------------------
  | Authenticated subscription request
  |--------------------------------------------------------------------------
  */

  startUpgrade: {
    body: Joi.object({
      planCode:
        planCode.required(),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Authenticated payment proof
  |--------------------------------------------------------------------------
  */

  proof: {
    params: Joi.object({
      requestId:
        requestId.required(),
    }),

    body: Joi.object({
      paymentReference:
        paymentReference.required(),

      paymentProofFileId:
        paymentProofFileId.required(),

      paymentNote:
        paymentNote.optional(),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Onboarding subscription request
  |--------------------------------------------------------------------------
  |
  | X-Onboarding-Token is intentionally NOT validated here.
  |
  | It is read from the request header by the controller and securely
  | resolved by the service.
  |
  */

  startOnboardingSubscription: {
    body: Joi.object({
      planCode:
        planCode.required(),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Onboarding payment proof
  |--------------------------------------------------------------------------
  */

  onboardingProof: {
    params: Joi.object({
      requestId:
        requestId.required(),
    }),

    body: Joi.object({
      paymentReference:
        paymentReference.required(),

      paymentProofFileId:
        paymentProofFileId.required(),

      paymentNote:
        paymentNote.optional(),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Onboarding subscription status
  |--------------------------------------------------------------------------
  */

  onboardingStatus: {
    query: Joi.object({}),
  },

  /*
  |--------------------------------------------------------------------------
  | Pending subscription requests
  |--------------------------------------------------------------------------
  */

  pending: {
    query: Joi.object({
      page:
        Joi.number()
          .integer()
          .min(1)
          .default(1),

      pageSize:
        Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(20),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Approve subscription
  |--------------------------------------------------------------------------
  */

  approve: {
    params: Joi.object({
      requestId:
        requestId.required(),
    }),

    body: Joi.object({
      durationDays:
        Joi.number()
          .integer()
          .min(1)
          .max(3650)
          .default(30),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Reject subscription
  |--------------------------------------------------------------------------
  */

  reject: {
    params: Joi.object({
      requestId:
        requestId.required(),
    }),

    body: Joi.object({
      reason:
        Joi.string()
          .trim()
          .min(3)
          .max(500)
          .required(),
    }),
  },
};