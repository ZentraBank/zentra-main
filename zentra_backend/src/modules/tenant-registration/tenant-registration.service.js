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
| Subscription onboarding token
|--------------------------------------------------------------------------
|
| Created only after the tenant has been successfully provisioned.
|
| The raw token is returned to the frontend once.
| Only the SHA-256 hash is stored in the database.
|
| This token does NOT authenticate the tenant dashboard.
| It is restricted to the pre-login subscription onboarding flow.
|
*/

const ONBOARDING_TOKEN_EXPIRY_HOURS =
  24;

const generateOnboardingToken = () =>
  randomBytes(48)
    .toString("hex");

const hashOnboardingToken = (
  token
) =>
  createHash("sha256")
    .update(token)
    .digest("hex");
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
    |
    | TEMPORARILY DISABLED FOR LOCAL DEVELOPMENT.
    |
    | Restore this block when SMTP/email has been configured.
    |
    */

    /*
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
    */

    /*
    |--------------------------------------------------------------------------
    | DEVELOPMENT EMAIL BYPASS
    |--------------------------------------------------------------------------
    */

    /*
|--------------------------------------------------------------------------
| TEMPORARY DEVELOPMENT EMAIL BYPASS
|--------------------------------------------------------------------------
|
| SMTP is currently disabled.
| The OTP is printed to the backend console instead.
|
| REMOVE THIS BLOCK AND RESTORE THE EMAIL BLOCK
| BEFORE PRODUCTION.
|
*/

console.warn(
  "\n========================================"
);

console.warn(
  "[DEV] TENANT REGISTRATION OTP"
);

console.warn(
  `[DEV] Email: ${normalizedEmail}`
);

console.warn(
  `[DEV] OTP: ${code}`
);

console.warn(
  `[DEV] Expires in: ${OTP_EXPIRY_MINUTES} minutes`
);

console.warn(
  "========================================\n"
);

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

    requestContext,
  }) => {
    /*
    |--------------------------------------------------------------------------
    | 1. Verify email proof
    |--------------------------------------------------------------------------
    */

    const verification =
      await getVerifiedRegistration({
        email,
        registrationToken,
      });

    /*
    |--------------------------------------------------------------------------
    | 2. Check tenant + user availability
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
    | 3. Sanitize registration data
    |--------------------------------------------------------------------------
    */

    const registrationData = {
      ownerEmail:
        normalizedEmail,

      ownerFirstName:
        ownerFirstName.trim(),

      ownerLastName:
        ownerLastName.trim(),

      name:
        name.trim(),

      code:
        normalizedCode,

      appName:
        appName.trim(),

      logoUrl:
        logoUrl || null,

      primaryColor:
        primaryColor || "#2458E8",
    };

    /*
    |--------------------------------------------------------------------------
    | 4. Hash owner password
    |--------------------------------------------------------------------------
    */

    const ownerPasswordHash =
      await bcrypt.hash(
        ownerPassword,
        12
      );

    /*
    |--------------------------------------------------------------------------
    | 5. Start provisioning transaction
    |--------------------------------------------------------------------------
    |
    | Nothing is committed unless all core tenant resources are created.
    |
    */

    const connection =
      await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | 6. Create tenant
      |--------------------------------------------------------------------------
      |
      | Self-registration has no platform superadmin actor.
      |
      */

      const tenantId =
        await tenantRepo.createTenant({
          connection,

          body: {
            name:
              registrationData.name,

            code:
              registrationData.code,

            appName:
              registrationData.appName,

            logoUrl:
              registrationData.logoUrl,

            primaryColor:
              registrationData.primaryColor,
          },

          createdBy:
            null,
        });

      /*
      |--------------------------------------------------------------------------
      | 7. Create tenant system roles + permissions
      |--------------------------------------------------------------------------
      */

      await tenantRepo
        .createTenantSystemRoles({
          connection,
          tenantId,
        });

      
      /*
      |--------------------------------------------------------------------------
      | 9. Create temporary tenant domain
      |--------------------------------------------------------------------------
      */

      const temporaryDomain =
        await tenantRepo
          .createTemporaryTenantDomain({
            connection,

            tenantId,

            slug:
              registrationData.code,

            rootDomain:
              env.tenantTemporaryDomain,
          });

      /*
      |--------------------------------------------------------------------------
      | 10. Create verified tenant administrator
      |--------------------------------------------------------------------------
      */

      const owner =
        await tenantRepo
          .createTenantOwner({
            connection,

            tenantId,

            body: {
              ownerEmail:
                registrationData.ownerEmail,

              ownerFirstName:
                registrationData.ownerFirstName,

              ownerLastName:
                registrationData.ownerLastName,

              ownerPasswordHash,
            },

            emailVerified:
              true,
          });

      /*
      |--------------------------------------------------------------------------
      | 11. Make email verification explicit
      |--------------------------------------------------------------------------
      |
      | The owner already proved ownership through OTP.
      |
      */

      await connection.query(
        `
          UPDATE users
          SET email_verified_at = NOW()
          WHERE id = ?
        `,
        [
          owner.userId,
        ]
      );

     /*
|--------------------------------------------------------------------------
| 12. Create subscription onboarding session
|--------------------------------------------------------------------------
|
| The registration token has completed its job.
|
| From this point forward, the frontend uses a separate restricted token
| for:
|
| - selecting a subscription
| - submitting payment proof
| - checking onboarding subscription status
|
*/

const onboardingToken =
  generateOnboardingToken();

const onboardingTokenHash =
  hashOnboardingToken(
    onboardingToken
  );

const onboardingSessionId =
  randomUUID();

await connection.query(
  `
    INSERT INTO tenant_onboarding_sessions (
      id,
      tenant_id,
      user_id,
      token_hash,
      expires_at
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      DATE_ADD(
        NOW(),
        INTERVAL 24 HOUR
      )
    )
  `,
  [
    onboardingSessionId,
    tenantId,
    owner.userId,
    onboardingTokenHash,
  ]
);

      const [
        verificationResult,
      ] =
        await connection.query(
          `
            UPDATE tenant_registration_verifications
            SET
              consumed_at = NOW(),
              updated_at = NOW()
            WHERE id = ?
              AND verified_at IS NOT NULL
              AND consumed_at IS NULL
              AND completion_token_expires_at > NOW()
          `,
          [
            verification.id,
          ]
        );

      if (
        verificationResult.affectedRows !==
        1
      ) {
        throw httpError(
          409,
          "This registration has already been completed or has expired"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | 13. Commit core tenant registration
      |--------------------------------------------------------------------------
      */

      await connection.commit();

      /*
      |--------------------------------------------------------------------------
      | 14. Return completed registration
      |--------------------------------------------------------------------------
      |
      | No subscription exists yet.
      |
      | The frontend should now continue to the dedicated subscription flow.
      |
      */

      return {
        tenant: {
          id:
            tenantId,

          name:
            registrationData.name,

          code:
            registrationData.code,

          status:
            "pending",

          temporaryDomain:
            temporaryDomain.domain,
        },

        owner: {
          id:
            owner.userId,

          membershipId:
            owner.membershipId,

          email:
            registrationData.ownerEmail,

          emailVerified:
            true,

          status:
            "pending",
        },

        subscription:
            null,

            onboardingToken,

            onboardingTokenExpiresIn:
            ONBOARDING_TOKEN_EXPIRY_HOURS *
            60 *
            60,

            nextStep:
            "choose_subscription",
      };
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | Roll back everything
      |--------------------------------------------------------------------------
      */

      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
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