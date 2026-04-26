const db = require("../../config/db");

async function getCurrentTenant(req, res) {
  return res.json({
    success: true,
    data: {
      tenant: req.tenant,
    },
  });
}

async function createTenant(req, res, next) {
  try {
    const { name, slug, domain, logo_url, primary_color } = req.body;

    if (!name || !slug || !domain) {
      return res.status(400).json({
        success: false,
        message: "Name, slug, and domain are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO tenants 
       (name, slug, domain, logo_url, primary_color)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        domain,
        logo_url || null,
        primary_color || "#111827",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: {
        id: result.insertId,
        name,
        slug,
        domain,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentTenant,
  createTenant,
};