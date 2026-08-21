const bcrypt = require("bcryptjs");
const {
  randomInt,
  randomUUID,
} = require("crypto");

const repo = require(
  "./transaction-pin.repository"
);

const authRepo = require(
  "../auth/auth.repository"
);

const error = (
  statusCode,
  message
) =>
  Object.assign(
    new Error(message),
    { statusCode }
  );

const RESET_PURPOSE =
  "transaction_pin_reset";

const OTP_EXPIRY_MINUTES = 10;

const generateOtp = () =>
  String(
    randomInt(
      100000,
      1000000
    )
  );

/*
|--------------------------------------------------------------------------
| PIN status
|--------------------------------------------------------------------------
*/

const getStatus = async ({
  userId,
}) => {
  const user =
    await repo.getByUserId(
      userId
    );

  if (!user) {
    throw error(
      404,
      "User not found"
    );
  }

  return {
    isSet: Boolean(
      user.transaction_pin_hash
    ),

    isLocked: Boolean(
      user.transaction_pin_locked_until &&
        new Date(
          user.transaction_pin_locked_until
        ) > new Date()
    ),
  };
};

/*
|--------------------------------------------------------------------------
| First-time PIN setup
|--------------------------------------------------------------------------
*/

const setup = async ({
  userId,
  password,
  pin,
}) => {
  const user =
    await repo.getByUserId(
      userId
    );

  if (!user) {
    throw error(
      404,
      "User not found"
    );
  }

  if (
    user.transaction_pin_hash
  ) {
    throw error(
      409,
      "Transaction PIN is already set"
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!passwordMatches) {
    throw error(
      400,
      "Password is incorrect"
    );
  }

  const pinHash =
    await bcrypt.hash(
      pin,
      12
    );

  await repo.setPin({
    userId,
    pinHash,
  });

  return {
    isSet: true,
  };
};

/*
|--------------------------------------------------------------------------
| Verify transaction PIN
|--------------------------------------------------------------------------
*/

const verify = async ({
  userId,
  pin,
}) => {
  const user =
    await repo.getByUserId(
      userId
    );

  if (
    !user?.transaction_pin_hash
  ) {
    throw error(
      403,
      "Set up your transaction PIN before making a transfer"
    );
  }

  if (
    user.transaction_pin_locked_until &&
    new Date(
      user.transaction_pin_locked_until
    ) > new Date()
  ) {
    throw error(
      423,
      "Transaction PIN is temporarily locked. Try again later"
    );
  }

  const pinMatches =
    await bcrypt.compare(
      pin,
      user.transaction_pin_hash
    );

  if (!pinMatches) {
    const attempts =
      Number(
        user.transaction_pin_failed_attempts ||
          0
      ) + 1;

    const shouldLock =
      attempts >= 5;

    await repo.recordFailure({
      userId,
      lock: shouldLock,
    });

    throw error(
      shouldLock
        ? 423
        : 400,

      shouldLock
        ? "Transaction PIN is temporarily locked for 15 minutes"
        : "Transaction PIN is incorrect"
    );
  }

  await repo.clearFailures(
    userId
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| Change PIN
|--------------------------------------------------------------------------
*/

const change = async ({
  userId,
  currentPin,
  newPin,
}) => {
  await verify({
    userId,
    pin: currentPin,
  });

  const pinHash =
    await bcrypt.hash(
      newPin,
      12
    );

  await repo.setPin({
    userId,
    pinHash,
  });

  return {
    isSet: true,
  };
};

/*
|--------------------------------------------------------------------------
| Request forgotten-PIN reset
|--------------------------------------------------------------------------
*/

const requestReset = async ({
  userId,
  tenantId,
}) => {
  const user =
    await repo.getByUserId(
      userId
    );

  if (!user) {
    throw error(
      404,
      "User not found"
    );
  }

  /*
   * If there is no PIN, the customer
   * should use /setup instead.
   */
  if (
    !user.transaction_pin_hash
  ) {
    throw error(
      400,
      "Transaction PIN has not been set yet"
    );
  }

  if (!user.email) {
    throw error(
      400,
      "No email address is available for PIN reset"
    );
  }

  const code =
    generateOtp();

  const codeHash =
    await bcrypt.hash(
      code,
      12
    );

  const expiresAt =
    new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

  await authRepo.createVerificationCode({
    id:
      randomUUID(),

    tenantId,

    userId,

    purpose:
      RESET_PURPOSE,

    destination:
      user.email,

    codeHash,

    payloadJson: {
      userId,
    },

    expiresAt,
  });

  return {
    email:
      user.email,

    expiresIn:
      OTP_EXPIRY_MINUTES *
      60,

    /*
     * Temporary development behaviour.
     * When real email delivery is added,
     * production will not expose the OTP.
     */
    ...(process.env.NODE_ENV !==
    "production"
      ? {
          developmentCode:
            code,
        }
      : {}),
  };
};

/*
|--------------------------------------------------------------------------
| Reset forgotten PIN
|--------------------------------------------------------------------------
*/

const reset = async ({
  userId,
  tenantId,
  code,
  newPin,
}) => {
  const user =
    await repo.getByUserId(
      userId
    );

  if (!user) {
    throw error(
      404,
      "User not found"
    );
  }

  if (
    !user.transaction_pin_hash
  ) {
    throw error(
      400,
      "Transaction PIN has not been set yet"
    );
  }

  if (!user.email) {
    throw error(
      400,
      "No email address is available for PIN reset"
    );
  }

  const verification =
    await authRepo.findActiveVerificationCode({
      tenantId,

      purpose:
        RESET_PURPOSE,

      destination:
        user.email,
    });

  if (!verification) {
    throw error(
      400,
      "PIN reset code is invalid or has expired"
    );
  }

  /*
   * Limit OTP guessing attempts.
   *
   * Your verification table already
   * tracks attempts.
   */
  if (
    Number(
      verification.attempts ||
        0
    ) >= 5
  ) {
    throw error(
      429,
      "Too many incorrect reset attempts. Request a new code"
    );
  }

  const matches =
    await bcrypt.compare(
      code,
      verification.code_hash
    );

  if (!matches) {
    await authRepo.incrementVerificationAttempts(
      verification.id
    );

    throw error(
      400,
      "PIN reset code is incorrect"
    );
  }

  const pinHash =
    await bcrypt.hash(
      newPin,
      12
    );

  await repo.setPin({
    userId,
    pinHash,
  });

  await authRepo.consumeVerificationCode(
    verification.id
  );

  /*
   * setPin() already clears failed
   * transaction-PIN attempts and lockout.
   */

  return {
    isSet: true,
    isLocked: false,
  };
};

module.exports = {
  getStatus,
  setup,
  verify,
  change,
  requestReset,
  reset,
};