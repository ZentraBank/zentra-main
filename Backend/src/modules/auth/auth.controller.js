const bcrypt = require("bcryptjs");
const db = require("../../config/db");
const { generateToken } = require("../../utils/token");
const generateAccountNumber = require("../../utils/generateAccountNumber");

async function register(req, res, next) {
  const connection = await db.getConnection();

  try {
    const { full_name, email, phone, password } = req.body;
    const tenantId = req.tenant.id;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    const [existingUsers] = await connection.query(
      `SELECT id FROM users 
       WHERE tenant_id = ? AND email = ? 
       LIMIT 1`,
      [tenantId, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists for this bank",
      });
    }

    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 12);

    const [userResult] = await connection.query(
      `INSERT INTO users 
       (tenant_id, full_name, email, phone, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, full_name, email, phone || null, passwordHash]
    );

    const userId = userResult.insertId;
    const accountNumber = generateAccountNumber();

    await connection.query(
      `INSERT INTO accounts 
       (tenant_id, user_id, account_number, account_name)
       VALUES (?, ?, ?, ?)`,
      [tenantId, userId, accountNumber, full_name]
    );

    await connection.commit();

    const token = generateToken({
      userId,
      tenantId,
      role: "customer",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: userId,
          full_name,
          email,
          phone,
          role: "customer",
          kyc_status: "not_started",
        },
        account: {
          account_number: accountNumber,
          account_name: full_name,
          balance: 0,
          currency: "NGN",
        },
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const tenantId = req.tenant.id;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await db.query(
      `SELECT * FROM users 
       WHERE tenant_id = ? AND email = ? 
       LIMIT 1`,
      [tenantId, email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          kyc_status: user.kyc_status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  return res.json({
    success: true,
    data: {
      user: req.user,
      tenant: req.tenant,
    },
  });
}

async function logout(req, res) {
  res.clearCookie("token");

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
};