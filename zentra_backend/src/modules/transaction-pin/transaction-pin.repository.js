const db = require("../../config/db");

const getByUserId = async (userId) => {
  const [rows] = await db.query(`SELECT
  id,
  email,
  password_hash,
  transaction_pin_hash,
  transaction_pin_failed_attempts,
  transaction_pin_locked_until
FROM users
WHERE id = ?
  AND deleted_at IS NULL
LIMIT 1`, [userId]);
  return rows[0] || null;
};

const setPin = async ({ userId, pinHash }) => db.query(`UPDATE users SET transaction_pin_hash = ?, transaction_pin_failed_attempts = 0, transaction_pin_locked_until = NULL WHERE id = ?`, [pinHash, userId]);
const recordFailure = async ({ userId, lock }) => db.query(`UPDATE users SET transaction_pin_failed_attempts = transaction_pin_failed_attempts + 1, transaction_pin_locked_until = CASE WHEN ? THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) ELSE transaction_pin_locked_until END WHERE id = ?`, [lock, userId]);
const clearFailures = async (userId) => db.query(`UPDATE users SET transaction_pin_failed_attempts = 0, transaction_pin_locked_until = NULL WHERE id = ?`, [userId]);
module.exports = { getByUserId, setPin, recordFailure, clearFailures };
