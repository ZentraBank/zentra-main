// src/middleware/tenant.middleware.js

const db = require("../config/db");

async function tenantMiddleware(req, res, next) {
  try {
    const host = req.headers.host?.split(":")[0];

    if (!host) {
      return res.status(400).json({ message: "Missing host header" });
    }

    const [rows] = await db.query(
      "SELECT * FROM tenants WHERE domain = ? AND status = 'active'",
      [host]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    req.tenant = rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = tenantMiddleware;