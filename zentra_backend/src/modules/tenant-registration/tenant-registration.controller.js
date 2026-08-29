const asyncHandler = require(
  "../../utils/asyncHandler"
);

const {
  sendSuccess,
} = require(
  "../../utils/response"
);

const service = require(
  "./tenant-registration.service"
);

/*
|--------------------------------------------------------------------------
| Request OTP
|--------------------------------------------------------------------------
*/

const requestRegistration =
  asyncHandler(
    async (req, res) => {
      const data =
        await service
          .requestRegistration({
            email:
              req.body.email,
          });

      return sendSuccess(
        res,
        {
          statusCode: 202,

          message:
            "Verification code sent",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Verify OTP
|--------------------------------------------------------------------------
*/

const verifyRegistration =
  asyncHandler(
    async (req, res) => {
      const data =
        await service
          .verifyRegistration({
            email:
              req.body.email,

            code:
              req.body.code,
          });

      return sendSuccess(
        res,
        {
          message:
            "Email verified successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Resend OTP
|--------------------------------------------------------------------------
*/

const resendRegistration =
  asyncHandler(
    async (req, res) => {
      const data =
        await service
          .resendRegistrationCode({
            email:
              req.body.email,
          });

      return sendSuccess(
        res,
        {
          message:
            "Verification code resent",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Complete tenant registration
|--------------------------------------------------------------------------
*/

const completeRegistration =
  asyncHandler(
    async (req, res) => {
      const data =
        await service
          .completeRegistration({
            ...req.body,

            requestContext: {
              ipAddress:
                req.ip,

              userAgent:
                req.get(
                  "user-agent"
                ) || null,

              requestId:
                req.requestId ||
                null,
            },
          });

      return sendSuccess(
        res,
        {
          statusCode: 201,

          message:
            "Tenant registration completed successfully",

          data,
        }
      );
    }
  );

module.exports = {
  requestRegistration,
  verifyRegistration,
  resendRegistration,
  completeRegistration,
};