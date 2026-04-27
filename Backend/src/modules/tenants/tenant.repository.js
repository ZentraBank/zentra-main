const db = require("../../config/db");

async function findByDomain(domain) {
  const [rows] = await db.query(
    `SELECT * FROM tenants 
     WHERE domain = ? AND status = 'active'
     LIMIT 1`,
    [domain]
  );

  return rows[0];
}

async function createTenant(data) {
  const { name, slug, domain, logo_url, primary_color } = data;

  const [result] = await db.query(
    `INSERT INTO tenants 
     (name, slug, domain, logo_url, primary_color)
     VALUES (?, ?, ?, ?, ?)`,
    [name, slug, domain, logo_url || null, primary_color || "#111827"]
  );

  return result.insertId;
}

module.exports = {
  findByDomain,
  createTenant,
};