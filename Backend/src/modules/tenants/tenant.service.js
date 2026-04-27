const tenantRepo = require("./tenant.repository");

async function resolveTenant(host) {
  if (!host) {
    throw new Error("Missing host header");
  }

  const cleanHost = host.split(":")[0];

  const tenant = await tenantRepo.findByDomain(cleanHost);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
}

async function createTenant(data) {
  if (!data.name || !data.slug || !data.domain) {
    throw new Error("Name, slug, and domain are required");
  }

  const tenantId = await tenantRepo.createTenant(data);

  return {
    id: tenantId,
    ...data,
  };
}

module.exports = {
  resolveTenant,
  createTenant,
};