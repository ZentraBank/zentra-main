const Joi = require("joi");

/*
|--------------------------------------------------------------------------
| Shared fields
|--------------------------------------------------------------------------
*/

const email = Joi.string()
  .trim()
  .lowercase()
  .email()
  .max(254)
  .required();

const otpCode = Joi.string()
  .trim()
  .pattern(/^[0-9]{6}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Verification code must contain exactly 6 digits",
  });

const password = Joi.string()
  .min(12)
  .max(128)
  .pattern(/[a-z]/, "lowercase letter")
  .pattern(/[A-Z]/, "uppercase letter")
  .pattern(/[0-9]/, "number")
  .pattern(
    /[^A-Za-z0-9]/,
    "special character"
  )
  .required()
  .messages({
    "string.min":
      "Password must be at least 12 characters long",

    "string.pattern.name":
      "Password must contain at least one {#name}",
  });

/*
|--------------------------------------------------------------------------
| Request registration OTP
|--------------------------------------------------------------------------
|
| At this stage we only need the email address.
|
| We do NOT create:
| - tenant
| - user
| - membership
| - subscription
|
| until the email has been verified.
|
*/

const requestRegistrationSchema = Joi.object({
  email,
});

/*
|--------------------------------------------------------------------------
| Verify registration OTP
|--------------------------------------------------------------------------
*/

const verifyRegistrationSchema = Joi.object({
  email,

  code:
    otpCode,
});

/*
|--------------------------------------------------------------------------
| Resend registration OTP
|--------------------------------------------------------------------------
*/

const resendRegistrationSchema = Joi.object({
  email,
});

/*
|--------------------------------------------------------------------------
| Complete tenant registration
|--------------------------------------------------------------------------
|
| This is intentionally separate from OTP verification.
|
| The user first proves ownership of their email address.
| Afterwards we collect/create the actual tenant.
|
*/

const completeRegistrationSchema =
  Joi.object({
    /*
    |--------------------------------------------------------------------------
    | Verified owner
    |--------------------------------------------------------------------------
    */

    email,

    ownerFirstName:
      Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    ownerLastName:
      Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    ownerPassword:
      password,

    /*
    |--------------------------------------------------------------------------
    | Organisation / tenant
    |--------------------------------------------------------------------------
    */

    name:
      Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required(),

    code:
      Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(100)
        .pattern(
          /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/
        )
        .required()
        .messages({
          "string.pattern.base":
            "Tenant code may only contain lowercase letters, numbers, hyphens and underscores",
        }),

    appName:
      Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required(),

    /*
    |--------------------------------------------------------------------------
    | Branding
    |--------------------------------------------------------------------------
    */

    logoUrl:
      Joi.string()
        .uri()
        .allow(
          "",
          null
        )
        .optional(),

    primaryColor:
      Joi.string()
        .trim()
        .pattern(
          /^#[0-9A-Fa-f]{6}$/
        )
        .default(
          "#2458E8"
        )
        .messages({
          "string.pattern.base":
            "Primary colour must be a valid 6-digit HEX colour",
        }),

    /*
    |--------------------------------------------------------------------------
    | Subscription
    |--------------------------------------------------------------------------
    */

    planCode:
      Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(100)
        .required(),
  });

module.exports = {
  requestRegistrationSchema,
  verifyRegistrationSchema,
  resendRegistrationSchema,
  completeRegistrationSchema,
};