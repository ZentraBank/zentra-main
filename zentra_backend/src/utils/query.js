const { pool } = require("../config/db");

/**
 * Run a prepared SQL statement.
 *
 * @param {string} sql
 * @param {Array} parameters
 * @returns {Promise<any>}
 */
const query = async (sql, parameters = []) => {
  const [result] = await pool.execute(sql, parameters);

  return result;
};

/**
 * Execute several database operations in one transaction.
 *
 * @param {(connection: import("mysql2/promise").PoolConnection) =>
 * Promise<any>} callback
 */
const withTransaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  query,
  withTransaction,
};