const bcrypt = require("bcryptjs");
const { randomInt, randomUUID } = require("crypto");

const env = require("../../config/env");
const authRepo = require("./auth.repository");
const emailService = require("../../services/email.service");

const {
  createRefreshToken,
  hashRefreshToken,
} = require("../../utils/authTokens");

const {
  signAccessToken,
} = require("../../utils/jwt");

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_DAYS = 30;

const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_SECONDS =
  OTP_EXPIRY_MINUTES * 60;

const MAX_OTP_ATTEMPTS = 5;

/*
|--------------------------------------------------------------------------
| Error helper
|--------------------------------------------------------------------------
*/

const createHttpError = (
  statusCode,
  message
) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

/*
|--------------------------------------------------------------------------
| Feature helpers
|--------------------------------------------------------------------------
*/

const parseFeatureValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const buildFeatures = (rows) =>
  rows.reduce(
    (result, feature) => {
      result[feature.feature_key] = {
        enabled:
          Boolean(feature.is_enabled),

        value:
          parseFeatureValue(
            feature.feature_value
          ),
      };

      return result;
    },
    {}
  );

/*
|--------------------------------------------------------------------------
| Authorization
|--------------------------------------------------------------------------
*/

const loadAuthorizationContext = async (
  user
) => {
  const [
    permissionRows,
    planFeatureRows,
  ] = await Promise.all([
    authRepo.findPermissionsByRoleId(
      user.role_id
    ),

    authRepo.findPlanFeatures(
      user.plan_id
    ),
  ]);

  return {
    permissions:
      permissionRows.map(
        (permission) =>
          permission.code
      ),

    planFeatures:
      buildFeatures(
        planFeatureRows
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Account state
|--------------------------------------------------------------------------
*/

const validateAccountState = (user) => {
  if (!user) {
    throw createHttpError(
      401,
      "Invalid email or password"
    );
  }

  if (
    user.user_status &&
    user.user_status !== "active"
  ) {
    throw createHttpError(
      403,
      "Your account is not active"
    );
  }

  if (
    user.membership_status !== "active"
  ) {
    throw createHttpError(
      403,
      "Your tenant membership is not active"
    );
  }
};

/*
|--------------------------------------------------------------------------
| Public user
|--------------------------------------------------------------------------
*/

const buildPublicUser = (
  user,
  authorization
) => ({
  id:
    user.id,

  full_name:
    user.full_name,

  email:
    user.email,

  phone:
    user.phone,

  kyc_status:
    user.kyc_status,

  membership: {
    id:
      user.membership_id,

    status:
      user.membership_status,
  },

  role: {
    id:
      user.role_id,

    name:
      user.role_name,

    code:
      user.role_code,
  },

  permissions:
    authorization.permissions,

  subscription:
    user.plan_id
      ? {
          id:
            user.subscription_id,

          status:
            user.subscription_status,

          starts_at:
            user.subscription_starts_at,

          expires_at:
            user.subscription_expires_at,

          plan: {
            id:
              user.plan_id,

            name:
              user.plan_name,

            code:
              user.plan_code,
          },

          features:
            authorization.planFeatures,
        }
      : null,
});

/*
|--------------------------------------------------------------------------
| Token issuing
|--------------------------------------------------------------------------
*/

const issueTokenPair = async ({
  user,
  authorization,
  ipAddress,
  userAgent,
}) => {
  const accessToken =
    signAccessToken({
      userId:
        user.id,

      tenantId:
        user.tenant_id,

      membershipId:
        user.membership_id,

      roleCode:
        user.role_code,
    });

  const refreshToken =
    createRefreshToken();

  const refreshTokenExpiresAt =
    new Date(
      Date.now() +
        REFRESH_TOKEN_TTL_DAYS *
          24 *
          60 *
          60 *
          1000
    );

  const refreshTokenId =
    await authRepo.createRefreshToken({
      userId:
        user.id,

      tenantId:
        user.tenant_id,

      membershipId:
        user.membership_id,

      tokenHash:
        hashRefreshToken(
          refreshToken
        ),

      ipAddress,

      userAgent,

      expiresAt:
        refreshTokenExpiresAt,
    });

  return {
    refreshTokenId,

    accessToken,

    accessTokenExpiresIn:
      ACCESS_TOKEN_TTL_SECONDS,

    refreshToken,

    refreshTokenExpiresAt,

    user:
      buildPublicUser(
        user,
        authorization
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const login = async ({
  tenantId,
  email,
  password,
  ipAddress,
  userAgent,
}) => {
  if (
    !tenantId ||
    !email ||
    !password
  ) {
    throw createHttpError(
      400,
      "Tenant, email, and password are required"
    );
  }

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  console.log(
    "[TENANT LOGIN DEBUG]",
    {
      tenantId,
      normalizedEmail,
    }
  );

  const user =
    await authRepo.findUserByEmailAndTenant(
      normalizedEmail,
      tenantId
    );

  console.log(
    "[TENANT LOGIN USER]",
    {
      found:
        Boolean(user),

      userId:
        user?.id,

      tenantId:
        user?.tenant_id,

      membershipStatus:
        user?.membership_status,

      userStatus:
        user?.user_status,
    }
  );

  validateAccountState(user);

  const passwordIsValid =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!passwordIsValid) {
    throw createHttpError(
      401,
      "Invalid email or password"
    );
  }

  const authorization =
    await loadAuthorizationContext(
      user
    );

  return issueTokenPair({
    user,
    authorization,
    ipAddress,
    userAgent,
  });
};

/*
|--------------------------------------------------------------------------
| Social login
|--------------------------------------------------------------------------
*/

const socialLogin = async ({
  tenantId,
  email,
  ipAddress,
  userAgent,
}) => {
  if (!tenantId || !email) {
    throw createHttpError(
      400,
      "Tenant and social account email are required"
    );
  }

  const user =
    await authRepo.findUserByEmailAndTenant(
      email
        .trim()
        .toLowerCase(),

      tenantId
    );

  validateAccountState(user);

  const authorization =
    await loadAuthorizationContext(
      user
    );

  return issueTokenPair({
    user,
    authorization,
    ipAddress,
    userAgent,
  });
};

/*
|--------------------------------------------------------------------------
| Refresh access token
|--------------------------------------------------------------------------
*/

const refreshAccessToken = async ({
  refreshToken,
  ipAddress,
  userAgent,
}) => {
  if (!refreshToken) {
    throw createHttpError(
      401,
      "Refresh token is required"
    );
  }

  const tokenRecord =
    await authRepo.findActiveRefreshToken(
      hashRefreshToken(
        refreshToken
      )
    );

  if (!tokenRecord) {
    throw createHttpError(
      401,
      "Refresh token is invalid or expired"
    );
  }

  const user =
    await authRepo.findAuthContextByIdentity(
      {
        userId:
          tokenRecord.user_id,

        tenantId:
          tokenRecord.tenant_id,
      }
    );

  validateAccountState(user);

  const authorization =
    await loadAuthorizationContext(
      user
    );

  const nextTokens =
    await issueTokenPair({
      user,
      authorization,
      ipAddress,
      userAgent,
    });

  await authRepo.revokeRefreshToken({
    tokenId:
      tokenRecord.id,

    replacedByTokenId:
      nextTokens.refreshTokenId,
  });

  return nextTokens;
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const logout = async ({
  refreshToken,
}) => {
  if (!refreshToken) {
    return;
  }

  const tokenRecord =
    await authRepo.findActiveRefreshToken(
      hashRefreshToken(
        refreshToken
      )
    );

  if (!tokenRecord) {
    return;
  }

  await authRepo.revokeRefreshToken({
    tokenId:
      tokenRecord.id,
  });
};

/*
|--------------------------------------------------------------------------
| Current user
|--------------------------------------------------------------------------
*/

const getCurrentUser = async ({
  userId,
  membershipId,
  tenantId,
}) => {
  const user =
    await authRepo.findAuthContextByIdentity(
      {
        userId,
        membershipId,
        tenantId,
      }
    );

  validateAccountState(user);

  const authorization =
    await loadAuthorizationContext(
      user
    );

  return buildPublicUser(
    user,
    authorization
  );
};

/*
|--------------------------------------------------------------------------
| OTP helpers
|--------------------------------------------------------------------------
*/

const generateOtp = () =>
  String(
    randomInt(
      100000,
      1000000
    )
  );

const codeExpiry = () =>
  new Date(
    Date.now() +
      OTP_EXPIRY_MINUTES *
        60 *
        1000
  );

/*
|--------------------------------------------------------------------------
| Registration request
|--------------------------------------------------------------------------
*/

const requestRegistration = async ({
  tenantId,
  firstName,
  middleName,
  lastName,
  email,
  phone,
  password,
}) => {
  if (!tenantId) {
    throw createHttpError(
      400,
      "Tenant is required"
    );
  }

  if (!email) {
    throw createHttpError(
      400,
      "Email is required"
    );
  }

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const existing =
    await authRepo.findAnyUserByEmail(
      normalizedEmail
    );

  if (existing) {
    throw createHttpError(
      409,
      "An account already exists with this email"
    );
  }

  const role =
    await authRepo.findCustomerRole(
      tenantId
    );

  if (!role) {
    throw createHttpError(
      500,
      "Customer role is not configured for this tenant"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Generate OTP
  |--------------------------------------------------------------------------
  */

  const code =
    generateOtp();

  const expiresAt =
    codeExpiry();

  /*
  |--------------------------------------------------------------------------
  | Store hashed OTP
  |--------------------------------------------------------------------------
  */

  await authRepo.createVerificationCode({
    id:
      randomUUID(),

    tenantId,

    purpose:
      "registration",

    destination:
      normalizedEmail,

    codeHash:
      await bcrypt.hash(
        code,
        10
      ),

    expiresAt,

    payloadJson: {
      firstName,

      middleName:
        middleName || null,

      lastName,

      email:
        normalizedEmail,

      phone:
        phone || null,

      passwordHash:
        await bcrypt.hash(
          password,
          12
        ),

      roleId:
        role.id,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Send OTP email
  |--------------------------------------------------------------------------
  */

  try {
    await emailService.sendRegistrationOtp({
      email:
        normalizedEmail,

      code,

      expiresInMinutes:
        OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error(
      "[AUTH] Registration OTP email failed",
      {
        email:
          normalizedEmail,

        error:
          error.message,
      }
    );

    throw createHttpError(
      503,
      "Unable to send verification email. Please try again."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Do NOT return OTP to frontend
  |--------------------------------------------------------------------------
  */

  return {
    email:
      normalizedEmail,

    expiresIn:
      OTP_EXPIRY_SECONDS,

    message:
      "Verification code sent to your email address",
  };
};

/*
|--------------------------------------------------------------------------
| Verify registration OTP
|--------------------------------------------------------------------------
*/

const verifyRegistration = async ({
  tenantId,
  email,
  code,
}) => {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const record =
    await authRepo.findActiveVerificationCode(
      {
        tenantId,

        purpose:
          "registration",

        destination:
          normalizedEmail,
      }
    );

  if (
    !record ||
    record.attempts >=
      MAX_OTP_ATTEMPTS
  ) {
    throw createHttpError(
      400,
      "Verification code is invalid or expired"
    );
  }

  const codeIsValid =
    await bcrypt.compare(
      code,
      record.code_hash
    );

  if (!codeIsValid) {
    await authRepo
      .incrementVerificationAttempts(
        record.id
      );

    throw createHttpError(
      400,
      "Verification code is invalid or expired"
    );
  }

  const payload =
    record.payload_json;

  if (!payload) {
    throw createHttpError(
      400,
      "Registration details are unavailable"
    );
  }

  const existing =
    await authRepo.findAnyUserByEmail(
      normalizedEmail
    );

  if (existing) {
    throw createHttpError(
      409,
      "An account already exists with this email"
    );
  }

  await authRepo.createRegisteredCustomer({
    tenantId,

    roleId:
      payload.roleId,

    firstName:
      payload.firstName,

    middleName:
      payload.middleName,

    lastName:
      payload.lastName,

    email:
      normalizedEmail,

    phone:
      payload.phone,

    passwordHash:
      payload.passwordHash,
  });

  await authRepo.consumeVerificationCode(
    record.id
  );

  return {
    email:
      normalizedEmail,
  };
};

/*
|--------------------------------------------------------------------------
| Resend registration OTP
|--------------------------------------------------------------------------
*/

const resendRegistrationCode = async ({
  tenantId,
  email,
}) => {
  if (!email) {
    throw createHttpError(
      400,
      "Email is required"
    );
  }

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const current =
    await authRepo.findActiveVerificationCode(
      {
        tenantId,

        purpose:
          "registration",

        destination:
          normalizedEmail,
      }
    );

  if (!current?.payload_json) {
    throw createHttpError(
      400,
      "Start registration again to request a new code"
    );
  }

  const code =
    generateOtp();

  const expiresAt =
    codeExpiry();

  await authRepo.createVerificationCode({
    id:
      randomUUID(),

    tenantId,

    purpose:
      "registration",

    destination:
      normalizedEmail,

    codeHash:
      await bcrypt.hash(
        code,
        10
      ),

    expiresAt,

    payloadJson:
      current.payload_json,
  });

  /*
  |--------------------------------------------------------------------------
  | Email replacement OTP
  |--------------------------------------------------------------------------
  */

  try {
    await emailService.sendRegistrationOtp({
      email:
        normalizedEmail,

      code,

      expiresInMinutes:
        OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error(
      "[AUTH] Registration OTP resend failed",
      {
        email:
          normalizedEmail,

        error:
          error.message,
      }
    );

    throw createHttpError(
      503,
      "Unable to resend verification email. Please try again."
    );
  }

  return {
    email:
      normalizedEmail,

    expiresIn:
      OTP_EXPIRY_SECONDS,

    message:
      "A new verification code has been sent to your email address",
  };
};

/*
|--------------------------------------------------------------------------
| Password reset request
|--------------------------------------------------------------------------
*/

const requestPasswordReset = async ({
  tenantId,
  email,
}) => {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const user =
    await authRepo.findUserByEmailAndTenant(
      normalizedEmail,
      tenantId
    );

  /*
  |--------------------------------------------------------------------------
  | Do not reveal whether an account exists
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return {
      email:
        normalizedEmail,

      expiresIn:
        OTP_EXPIRY_SECONDS,
    };
  }

  const code =
    generateOtp();

  await authRepo.createVerificationCode({
    id:
      randomUUID(),

    tenantId,

    userId:
      user.id,

    purpose:
      "password_reset",

    destination:
      normalizedEmail,

    codeHash:
      await bcrypt.hash(
        code,
        10
      ),

    expiresAt:
      codeExpiry(),
  });

  /*
  |--------------------------------------------------------------------------
  | Send password reset email
  |--------------------------------------------------------------------------
  */

  try {
    await emailService.sendPasswordResetOtp({
      email:
        normalizedEmail,

      code,

      expiresInMinutes:
        OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error(
      "[AUTH] Password reset email failed",
      {
        email:
          normalizedEmail,

        error:
          error.message,
      }
    );

    throw createHttpError(
      503,
      "Unable to send password reset email. Please try again."
    );
  }

  return {
    email:
      normalizedEmail,

    expiresIn:
      OTP_EXPIRY_SECONDS,

    message:
      "Password reset code sent",
  };
};

/*
|--------------------------------------------------------------------------
| Reset password
|--------------------------------------------------------------------------
*/

const resetPassword = async ({
  tenantId,
  email,
  code,
  newPassword,
}) => {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const record =
    await authRepo.findActiveVerificationCode(
      {
        tenantId,

        purpose:
          "password_reset",

        destination:
          normalizedEmail,
      }
    );

  if (
    !record ||
    record.attempts >=
      MAX_OTP_ATTEMPTS ||
    !record.user_id
  ) {
    throw createHttpError(
      400,
      "Reset code is invalid or expired"
    );
  }

  const codeIsValid =
    await bcrypt.compare(
      code,
      record.code_hash
    );

  if (!codeIsValid) {
    await authRepo
      .incrementVerificationAttempts(
        record.id
      );

    throw createHttpError(
      400,
      "Reset code is invalid or expired"
    );
  }

  await authRepo.updatePassword({
    userId:
      record.user_id,

    passwordHash:
      await bcrypt.hash(
        newPassword,
        12
      ),
  });

  await authRepo.consumeVerificationCode(
    record.id
  );

  return {
    success: true,
  };
};

/*
|--------------------------------------------------------------------------
| Change password
|--------------------------------------------------------------------------
*/

const changePassword = async ({
  userId,
  tenantId,
  currentPassword,
  newPassword,
}) => {
  const user =
    await authRepo.findAuthContextByIdentity(
      {
        userId,
        tenantId,
      }
    );

  if (!user) {
    throw createHttpError(
      404,
      "User not found"
    );
  }

  const credentials =
    await authRepo.findUserByEmailAndTenant(
      user.email,
      tenantId
    );

  if (
    !credentials ||
    !(
      await bcrypt.compare(
        currentPassword,
        credentials.password_hash
      )
    )
  ) {
    throw createHttpError(
      400,
      "Current password is incorrect"
    );
  }

  await authRepo.updatePassword({
    userId,

    passwordHash:
      await bcrypt.hash(
        newPassword,
        12
      ),
  });

  return {
    success: true,
  };
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  requestRegistration,
  verifyRegistration,
  resendRegistrationCode,

  requestPasswordReset,
  resetPassword,
  changePassword,

  login,
  socialLogin,
  refreshAccessToken,
  logout,
  getCurrentUser,
};