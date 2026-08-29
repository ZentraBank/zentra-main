const express = require(
  "express"
);

const validate = require(
  "../../middleware/validate.middleware"
);

const controller = require(
  "./tenant-registration.controller"
);

const {
  requestRegistrationSchema,
  verifyRegistrationSchema,
  resendRegistrationSchema,
  completeRegistrationSchema,
} = require(
  "./tenant-registration.validation"
);

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Public tenant registration routes
|--------------------------------------------------------------------------
|
| These routes intentionally do NOT use:
|
| - authMiddleware
| - resolveTenantMiddleware
| - permission middleware
|
| because the tenant does not exist yet.
|
*/

/*
|--------------------------------------------------------------------------
| Request email OTP
|--------------------------------------------------------------------------
*/

router.post(
  "/request",
  validate(
    requestRegistrationSchema
  ),
  controller.requestRegistration
);

/*
|--------------------------------------------------------------------------
| Verify email OTP
|--------------------------------------------------------------------------
*/

router.post(
  "/verify",
  validate(
    verifyRegistrationSchema
  ),
  controller.verifyRegistration
);

/*
|--------------------------------------------------------------------------
| Resend email OTP
|--------------------------------------------------------------------------
*/

router.post(
  "/resend",
  validate(
    resendRegistrationSchema
  ),
  controller.resendRegistration
);

/*
|--------------------------------------------------------------------------
| Complete registration
|--------------------------------------------------------------------------
*/

router.post(
  "/complete",
  validate(
    completeRegistrationSchema
  ),
  controller.completeRegistration
);

module.exports = router;