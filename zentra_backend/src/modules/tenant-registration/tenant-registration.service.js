const bcrypt =
  require("bcryptjs");

const {
  randomInt,
  randomUUID,
  randomBytes,
  createHash,
} = require("crypto");

const env =
  require("../../config/env");

const db =
  require("../../config/db");

const repo =
  require("./tenant-registration.repository");

const tenantRepo =
  require(
    "../superadmin/superadmin.repository"
  );

const emailService =
  require(
    "../../services/email.service"
  );

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const OTP_EXPIRY_MINUTES = 10;

const OTP_EXPIRY_SECONDS =
  OTP_EXPIRY_MINUTES * 60;

const MAX_OTP_ATTEMPTS = 5;

const COMPLETION_TOKEN_EXPIRY_MINUTES =
  30;

/*
|--------------------------------------------------------------------------
| Error helper
|--------------------------------------------------------------------------
*/

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

/*
|--------------------------------------------------------------------------
| Email normalisation
|--------------------------------------------------------------------------
*/

const normalizeEmail = (
  email
) =>
  email
    .trim()
    .toLowerCase();

/*
|--------------------------------------------------------------------------
| Tenant slug normalisation
|--------------------------------------------------------------------------
*/

const normalizeTenantCode = (
  code
) =>
  code
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

/*
|--------------------------------------------------------------------------
| Generate OTP
|--------------------------------------------------------------------------
*/

const generateOtp = () =>
  String(
    randomInt(
      100000,
      1000000
    )
  );

/*
|--------------------------------------------------------------------------
| OTP expiry
|--------------------------------------------------------------------------
*/

const getOtpExpiry = () =>
  new Date(
    Date.now() +
      OTP_EXPIRY_MINUTES *
        60 *
        1000
  );

/*
|--------------------------------------------------------------------------
| Completion token
|--------------------------------------------------------------------------
|
| This token proves that the person completing tenant registration
| successfully verified the email address.
|
| We return the raw token to the frontend.
| Only its SHA-256 hash is stored in the database.
|
*/

const generateCompletionToken = () =>
  randomBytes(48)
    .toString("hex");

const hashCompletionToken = (
  token
) =>
  createHash("sha256")
    .update(token)
    .digest("hex");

const getCompletionTokenExpiry =
  () =>
    new Date(
      Date.now() +
        COMPLETION_TOKEN_EXPIRY_MINUTES *
          60 *
          1000
    );

/*
|--------------------------------------------------------------------------
| Check existing account
|--------------------------------------------------------------------------
*/

const ensureEmailAvailable =
  async (email) => {
    const existingUser =
      await repo.findUserByEmail(
        email
      );

    if (existingUser) {
      throw httpError(
        409,
        "An account already exists with this email address"
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Request tenant registration OTP
|--------------------------------------------------------------------------
*/

const requestRegistration =
  async ({
    email,
  }) => {
    const normalizedEmail =
      normalizeEmail(email);

    /*
    |--------------------------------------------------------------------------
    | Prevent registration using an existing account
    |--------------------------------------------------------------------------
    */

    await ensureEmailAvailable(
      normalizedEmail
    );

    /*
    |--------------------------------------------------------------------------
    | Generate OTP
    |--------------------------------------------------------------------------
    */

    const code =
      generateOtp();

    const verificationId =
      randomUUID();

    const expiresAt =
      getOtpExpiry();

    const codeHash =
      await bcrypt.hash(
        code,
        10
      );

    /*
    |--------------------------------------------------------------------------
    | Store OTP
    |--------------------------------------------------------------------------
    |
    | createVerificationCode() automatically invalidates previous active
    | registration codes for the email address.
    |
    */

    await repo.createVerificationCode({
      id:
        verificationId,

      email:
        normalizedEmail,

      codeHash,

      expiresAt,
    });

    /*
    |--------------------------------------------------------------------------
    | Send OTP email
    |--------------------------------------------------------------------------
    */

    try {
      await emailService
        .sendRegistrationOtp({
          email:
            normalizedEmail,

          code,

          expiresInMinutes:
            OTP_EXPIRY_MINUTES,
        });
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | Never leave a usable OTP behind if the email failed
      |--------------------------------------------------------------------------
      */

      await repo.consumeVerification(
        verificationId
      );

      console.error(
        "[TENANT REGISTRATION] OTP email failed",
        {
          email:
            normalizedEmail,

          error:
            error.message,
        }
      );

      throw httpError(
        503,
        "Unable to send verification email. Please try again."
      );
    }

    return {
      email:
        normalizedEmail,

      expiresIn:
        OTP_EXPIRY_SECONDS,
    };
  };

/*
|--------------------------------------------------------------------------
| Resend tenant registration OTP
|--------------------------------------------------------------------------
*/

const resendRegistrationCode =
  async ({
    email,
  }) => {
    const normalizedEmail =
      normalizeEmail(email);

    /*
    |--------------------------------------------------------------------------
    | Make sure account still does not exist
    |--------------------------------------------------------------------------
    */

    await ensureEmailAvailable(
      normalizedEmail
    );

    /*
    |--------------------------------------------------------------------------
    | Generate replacement OTP
    |--------------------------------------------------------------------------
    */

    const code =
      generateOtp();

    const verificationId =
      randomUUID();

    const expiresAt =
      getOtpExpiry();

    const codeHash =
      await bcrypt.hash(
        code,
        10
      );

    /*
    |--------------------------------------------------------------------------
    | Store replacement code
    |--------------------------------------------------------------------------
    |
    | The repository consumes the previous active code automatically.
    |
    */

    await repo.createVerificationCode({
      id:
        verificationId,

      email:
        normalizedEmail,

      codeHash,

      expiresAt,
    });

    /*
    |--------------------------------------------------------------------------
    | Send replacement OTP
    |--------------------------------------------------------------------------
    */

    try {
      await emailService
        .sendRegistrationOtp({
          email:
            normalizedEmail,

          code,

          expiresInMinutes:
            OTP_EXPIRY_MINUTES,
        });
    } catch (error) {
      await repo.consumeVerification(
        verificationId
      );

      console.error(
        "[TENANT REGISTRATION] OTP resend failed",
        {
          email:
            normalizedEmail,

          error:
            error.message,
        }
      );

      throw httpError(
        503,
        "Unable to resend verification email. Please try again."
      );
    }

    return {
      email:
        normalizedEmail,

      expiresIn:
        OTP_EXPIRY_SECONDS,
    };
  };

/*
|--------------------------------------------------------------------------
| Verify tenant registration OTP
|--------------------------------------------------------------------------
*/

const verifyRegistration =
  async ({
    email,
    code,
  }) => {
    const normalizedEmail =
      normalizeEmail(email);

    /*
    |--------------------------------------------------------------------------
    | Ensure email has not been registered during verification
    |--------------------------------------------------------------------------
    */

    await ensureEmailAvailable(
      normalizedEmail
    );

    /*
    |--------------------------------------------------------------------------
    | Load active OTP
    |--------------------------------------------------------------------------
    */

    const verification =
      await repo
        .findActiveVerificationCode(
          normalizedEmail
        );

    if (!verification) {
      throw httpError(
        400,
        "Verification code is invalid or expired"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Attempt limit
    |--------------------------------------------------------------------------
    */

    if (
      Number(
        verification.attempts
      ) >= MAX_OTP_ATTEMPTS
    ) {
      await repo.consumeVerification(
        verification.id
      );

      throw httpError(
        400,
        "Verification code is invalid or expired"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Compare OTP
    |--------------------------------------------------------------------------
    */

    const codeIsValid =
      await bcrypt.compare(
        code,
        verification.code_hash
      );

    if (!codeIsValid) {
      await repo
        .incrementVerificationAttempts(
          verification.id
        );

      const nextAttemptCount =
        Number(
          verification.attempts
        ) + 1;

      /*
      |--------------------------------------------------------------------------
      | Consume after fifth failed attempt
      |--------------------------------------------------------------------------
      */

      if (
        nextAttemptCount >=
        MAX_OTP_ATTEMPTS
      ) {
        await repo.consumeVerification(
          verification.id
        );
      }

      throw httpError(
        400,
        "Verification code is invalid or expired"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate secure registration completion token
    |--------------------------------------------------------------------------
    */

    const registrationToken =
      generateCompletionToken();

    const completionTokenHash =
      hashCompletionToken(
        registrationToken
      );

    const completionTokenExpiresAt =
      getCompletionTokenExpiry();

    /*
    |--------------------------------------------------------------------------
    | Mark OTP verified
    |--------------------------------------------------------------------------
    */

    const marked =
      await repo
        .markVerificationCompleted({
          id:
            verification.id,

          completionTokenHash,

          completionTokenExpiresAt,
        });

    if (!marked) {
      throw httpError(
        409,
        "This verification request is no longer valid"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Raw token is returned once
    |--------------------------------------------------------------------------
    */

    return {
      email:
        normalizedEmail,

      verified:
        true,

      registrationToken,

      registrationTokenExpiresIn:
        COMPLETION_TOKEN_EXPIRY_MINUTES *
        60,
    };
  };

/*
|--------------------------------------------------------------------------
| Validate completion token
|--------------------------------------------------------------------------
*/

const getVerifiedRegistration =
  async ({
    email,
    registrationToken,
  }) => {
    if (!registrationToken) {
      throw httpError(
        401,
        "Registration verification token is required"
      );
    }

    const normalizedEmail =
      normalizeEmail(email);

    const completionTokenHash =
      hashCompletionToken(
        registrationToken
      );

    const verification =
      await repo
        .findVerifiedRegistration({
          email:
            normalizedEmail,

          completionTokenHash,
        });

    if (!verification) {
      throw httpError(
        401,
        "Registration verification has expired or is invalid"
      );
    }

    return verification;
  };

/*
|--------------------------------------------------------------------------
| Validate tenant details before creation
|--------------------------------------------------------------------------
*/

const validateTenantAvailability =
  async ({
    email,
    code,
  }) => {
    const normalizedEmail =
      normalizeEmail(email);

    const normalizedCode =
      normalizeTenantCode(
        code
      );

    /*
    |--------------------------------------------------------------------------
    | Email race-condition protection
    |--------------------------------------------------------------------------
    */

    await ensureEmailAvailable(
      normalizedEmail
    );

    /*
    |--------------------------------------------------------------------------
    | Tenant slug uniqueness
    |--------------------------------------------------------------------------
    */

    const existingTenant =
      await repo.findTenantBySlug(
        normalizedCode
      );

    if (existingTenant) {
      throw httpError(
        409,
        "This organisation code is already in use"
      );
    }

    return {
      normalizedEmail,
      normalizedCode,
    };
  };

/*
|--------------------------------------------------------------------------
| Complete tenant registration
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The verification/security side of completion is implemented here.
|
| The actual tenant creation transaction will be added once the current
| tenant creation repository is aligned for both:
|
|   1. platform-created tenants
|   2. self-registered tenants
|
|--------------------------------------------------------------------------
*/

const completeRegistration =
  async ({
    email,
    registrationToken,

    ownerFirstName,
    ownerLastName,
    ownerPassword,

    name,
    code,
    appName,

    logoUrl,
    primaryColor,

    planCode,

    requestContext,
  }) => {
    /*
    |--------------------------------------------------------------------------
    | Verify email proof
    |--------------------------------------------------------------------------
    */

    const verification =
      await getVerifiedRegistration({
        email,
        registrationToken,
      });

    /*
    |--------------------------------------------------------------------------
    | Check tenant + user availability
    |--------------------------------------------------------------------------
    */

    const {
      normalizedEmail,
      normalizedCode,
    } =
      await validateTenantAvailability({
        email,
        code,
      });

    /*
    |--------------------------------------------------------------------------
    | Prepare sanitized payload
    |--------------------------------------------------------------------------
    */

    const registrationData = {
      ownerEmail:
        normalizedEmail,

      ownerFirstName:
        ownerFirstName.trim(),

      ownerLastName:
        ownerLastName.trim(),

      ownerPassword,

      name:
        name.trim(),

      code:
        normalizedCode,

      appName:
        appName.trim(),

      logoUrl:
        logoUrl || null,

      primaryColor,

      planCode:
        planCode
          .trim()
          .toLowerCase(),

      requestContext:
        requestContext || null,
    };

    /*
    |--------------------------------------------------------------------------
    | STOP POINT
    |--------------------------------------------------------------------------
    |
    | We do not create a partial tenant here.
    |
    | Tenant creation must happen inside ONE database transaction:
    |
    | tenant
    |   ↓
    | roles
    |   ↓
    | role permissions
    |   ↓
    | subscription plans
    |   ↓
    | temporary domain
    |   ↓
    | tenant administrator
    |   ↓
    | membership
    |   ↓
    | subscription
    |   ↓
    | consume registration verification
    |
    |--------------------------------------------------------------------------
    */

    return {
      readyForTenantCreation:
        true,

      verificationId:
        verification.id,

      registrationData,
    };
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  requestRegistration,
  resendRegistrationCode,
  verifyRegistration,

  getVerifiedRegistration,
  validateTenantAvailability,

  completeRegistration,
};