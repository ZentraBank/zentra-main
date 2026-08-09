const Joi = require("joi");

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Donors
  |--------------------------------------------------------------------------
  */

  createDonor: {
    body: Joi.object({
      fullName: Joi.string()
        .trim()
        .min(2)
        .max(160)
        .required(),

      email: Joi.string()
        .email()
        .max(190)
        .optional(),

      phoneNumber: Joi.string()
        .trim()
        .max(40)
        .optional(),

      profileImageUrl: Joi.string()
        .uri()
        .max(1000)
        .optional(),

      address: Joi.string()
        .trim()
        .max(500)
        .optional(),

      country: Joi.string()
        .trim()
        .max(100)
        .optional(),

      metadata: Joi.object()
        .unknown(true)
        .optional(),
    }),
  },

  donorId: {
    params: Joi.object({
      donorId: Joi.string()
        .uuid()
        .required(),
    }),
  },

  updateDonor: {
    params: Joi.object({
      donorId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      fullName: Joi.string()
        .trim()
        .min(2)
        .max(160)
        .optional(),

      email: Joi.string()
        .email()
        .max(190)
        .allow("")
        .optional(),

      phoneNumber: Joi.string()
        .trim()
        .max(40)
        .allow("")
        .optional(),

      profileImageUrl: Joi.string()
        .uri()
        .max(1000)
        .allow("")
        .optional(),

      address: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional(),

      country: Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional(),

      status: Joi.string()
        .valid(
          "active",
          "inactive",
          "blocked"
        )
        .optional(),

      metadata: Joi.object()
        .unknown(true)
        .optional(),
    }).min(1),
  },

  /*
  |--------------------------------------------------------------------------
  | Lists
  |--------------------------------------------------------------------------
  */

  list: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),

      pageSize: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

      status: Joi.string()
        .valid(
          "pending",
          "approved",
          "rejected",
          "cancelled",
          "funded",
          "redeemed",
          "active",
          "inactive",
          "blocked"
        )
        .optional(),

      search: Joi.string()
        .trim()
        .max(160)
        .allow("")
        .optional(),

      excludeDonorId: Joi.string()
        .uuid()
        .optional(),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Donation requests
  |--------------------------------------------------------------------------
  */

  createRequest: {
    body: Joi.object({
      donorId: Joi.string()
        .uuid()
        .required(),

      accountId: Joi.string()
        .uuid()
        .required(),

      amount: Joi.number()
        .positive()
        .precision(2)
        .required(),

      currency: Joi.string()
        .trim()
        .uppercase()
        .length(3)
        .required(),

      purpose: Joi.string()
        .trim()
        .min(3)
        .max(500)
        .required(),

      appreciation: Joi.string()
        .trim()
        .min(3)
        .max(1000)
        .required(),
    }),
  },

  reviewRequest: {
    params: Joi.object({
      requestId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid(
          "approved",
          "rejected"
        )
        .required(),

      rejectionReason: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .optional(),
    }),
  },

  requestId: {
    params: Joi.object({
      requestId: Joi.string()
        .uuid()
        .required(),
    }),
  },

  /*
  |--------------------------------------------------------------------------
  | Redemption
  |--------------------------------------------------------------------------
  */

  verifyOtp: {
    params: Joi.object({
      redemptionId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      otp: Joi.string()
        .pattern(/^\d{6}$/)
        .required(),
    }),
  },

  redemptionId: {
    params: Joi.object({
      redemptionId: Joi.string()
        .uuid()
        .required(),
    }),
  },
};