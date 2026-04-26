const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      `SELECT id, tenant_id, full_name, email, phone, role, kyc_status, created_at 
       FROM users 
       WHERE id = ? AND tenant_id = ? 
       LIMIT 1`,
      [decoded.userId, decoded.tenantId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = users[0];

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;