const db = require("../config/db");

async function tenantMiddleware(req, res, next) {
  try {
    let host = req.headers.host;

    if (!host) {
      return res.status(400).json({
        success: false,
        message: "Missing host header",
      });
    }

    host = host.split(":")[0];

    const [tenants] = await db.query(
      `SELECT * FROM tenants 
       WHERE domain = ? 
       AND status = 'active'
       LIMIT 1`,
      [host]
    );

    if (tenants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    req.tenant = tenants[0];

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = tenantMiddleware;