const db = require("../../config/db");

async function findUserByEmailAndTenant(email, tenantId) {
  const [rows] = await db.query(
    `SELECT * FROM users WHERE email = ? AND tenant_id = ? LIMIT 1`,
    [email, tenantId]
  );

  return rows[0];
}

async function findUserByIdAndTenant(userId, tenantId) {
  const [rows] = await db.query(
    `SELECT id, tenant_id, full_name, email, phone, role, kyc_status, created_at
     FROM users
     WHERE id = ? AND tenant_id = ?
     LIMIT 1`,
    [userId, tenantId]
  );

  return rows[0];
}

async function createUserWithAccount({ tenantId, fullName, email, phone, passwordHash, accountNumber }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `INSERT INTO users 
       (tenant_id, full_name, email, phone, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, fullName, email, phone || null, passwordHash]
    );

    const userId = userResult.insertId;

    await connection.query(
      `INSERT INTO accounts
       (tenant_id, user_id, account_number, account_name)
       VALUES (?, ?, ?, ?)`,
      [tenantId, userId, accountNumber, fullName]
    );

    await connection.commit();

    return {
      userId,
      accountNumber,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findUserByEmailAndTenant,
  findUserByIdAndTenant,
  createUserWithAccount,
};