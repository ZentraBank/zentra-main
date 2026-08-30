const db = require("../../config/db");

/*
|--------------------------------------------------------------------------
| Find existing user by email
|--------------------------------------------------------------------------
*/

const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        email,
        status
      FROM users
      WHERE LOWER(email) = LOWER(?)
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Find tenant by slug
|--------------------------------------------------------------------------
*/

const findTenantBySlug = async (slug) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        slug,
        name,
        status
      FROM tenants
      WHERE LOWER(slug) = LOWER(?)
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Invalidate previous OTPs
|--------------------------------------------------------------------------
*/

const invalidateActiveVerificationCodes =
  async (email) => {
    await db.query(
      `
        UPDATE tenant_registration_verifications
        SET consumed_at = NOW()
        WHERE LOWER(email) = LOWER(?)
          AND consumed_at IS NULL
      `,
      [email]
    );
  };

/*
|--------------------------------------------------------------------------
| Create OTP record
|--------------------------------------------------------------------------
*/

const createVerificationCode = async ({
  id,
  email,
  codeHash,
  expiresAt,
}) => {
  await invalidateActiveVerificationCodes(
    email
  );

  await db.query(
    `
      INSERT INTO tenant_registration_verifications (
        id,
        email,
        code_hash,
        expires_at
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      id,
      email,
      codeHash,
      expiresAt,
    ]
  );

  return id;
};

/*
|--------------------------------------------------------------------------
| Find latest active OTP
|--------------------------------------------------------------------------
*/

const findActiveVerificationCode =
  async (email) => {
    const [rows] = await db.query(
      `
        SELECT
          id,
          email,
          code_hash,
          attempts,
          verified_at,
          consumed_at,
          expires_at,
          created_at
        FROM tenant_registration_verifications
        WHERE LOWER(email) = LOWER(?)
          AND consumed_at IS NULL
          AND verified_at IS NULL
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [email]
    );

    return rows[0] || null;
  };

/*
|--------------------------------------------------------------------------
| Increment failed OTP attempts
|--------------------------------------------------------------------------
*/

const incrementVerificationAttempts =
  async (id) => {
    await db.query(
      `
        UPDATE tenant_registration_verifications
        SET attempts = attempts + 1
        WHERE id = ?
          AND consumed_at IS NULL
      `,
      [id]
    );
  };

/*
|--------------------------------------------------------------------------
| Mark failed/maxed verification as consumed
|--------------------------------------------------------------------------
*/

const consumeVerification = async (id) => {
  await db.query(
    `
      UPDATE tenant_registration_verifications
      SET consumed_at = COALESCE(
        consumed_at,
        NOW()
      )
      WHERE id = ?
    `,
    [id]
  );
};

/*
|--------------------------------------------------------------------------
| Mark OTP verified and attach completion token
|--------------------------------------------------------------------------
*/

const markVerificationCompleted = async ({
  id,
  completionTokenHash,
  completionTokenExpiresAt,
}) => {
  const [result] = await db.query(
    `
      UPDATE tenant_registration_verifications
      SET
        verified_at = NOW(),
        completion_token_hash = ?,
        completion_token_expires_at =
          DATE_ADD(
            NOW(),
            INTERVAL 30 MINUTE
          )
      WHERE id = ?
        AND consumed_at IS NULL
        AND verified_at IS NULL
        AND expires_at > NOW()
    `,
    [
      completionTokenHash,
      id,
    ]
  );

  return result.affectedRows > 0;
};

/*
|--------------------------------------------------------------------------
| Find verified registration using completion token
|--------------------------------------------------------------------------
*/

const findVerifiedRegistration = async ({
  email,
  completionTokenHash,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        email,
        verified_at,
        completion_token_expires_at,
        created_at
      FROM tenant_registration_verifications
      WHERE LOWER(email) = LOWER(?)
        AND completion_token_hash = ?
        AND verified_at IS NOT NULL
        AND consumed_at IS NULL
        AND completion_token_expires_at > NOW()
      ORDER BY verified_at DESC
      LIMIT 1
    `,
    [
      email,
      completionTokenHash,
    ]
  );

  return rows[0] || null;
};

/*
|--------------------------------------------------------------------------
| Consume registration after tenant creation
|--------------------------------------------------------------------------
*/

const consumeCompletedRegistration =
  async (id, connection = db) => {
    const [result] =
      await connection.query(
        `
          UPDATE tenant_registration_verifications
          SET consumed_at = NOW()
          WHERE id = ?
            AND verified_at IS NOT NULL
            AND consumed_at IS NULL
        `,
        [id]
      );

    return result.affectedRows > 0;
  };

/*
|--------------------------------------------------------------------------
| Clean expired records
|--------------------------------------------------------------------------
*/

const consumeExpiredRegistrations =
  async () => {
    const [result] = await db.query(
      `
        UPDATE tenant_registration_verifications
        SET consumed_at = NOW()
        WHERE consumed_at IS NULL
          AND (
            (
              verified_at IS NULL
              AND expires_at <= NOW()
            )
            OR
            (
              verified_at IS NOT NULL
              AND completion_token_expires_at <= NOW()
            )
          )
      `
    );

    return result.affectedRows;
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  findUserByEmail,
  findTenantBySlug,

  createVerificationCode,
  findActiveVerificationCode,
  incrementVerificationAttempts,

  markVerificationCompleted,
  findVerifiedRegistration,

  consumeVerification,
  consumeCompletedRegistration,
  consumeExpiredRegistrations,
};