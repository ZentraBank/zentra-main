const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const tenantService = require(
  "../modules/tenants/tenant.service"
);

const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

const normaliseTenantSlug = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const slug = value.trim().toLowerCase();

  if (!slug) {
    return null;
  }

  const isValidSlug =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

  if (!isValidSlug) {
    throw ApiError.badRequest(
      "The supplied tenant slug is invalid"
    );
  }

  return slug;
};

const normaliseHostname = (hostname) => {
  if (!hostname) {
    return null;
  }

  return hostname
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/^www\./, "");
};

const getTenantSlugFromRequest = (req) => {
  const headerSlug = req.get("x-tenant-slug");

  if (headerSlug) {
    return normaliseTenantSlug(headerSlug);
  }

  const querySlug = req.query?.tenant;

  if (typeof querySlug === "string" && querySlug) {
    return normaliseTenantSlug(querySlug);
  }

  return null;
};

const getTenantDomainFromRequest = (req) => {
  const forwardedHost = req.get("x-forwarded-host");
  const host = forwardedHost || req.get("host");

  const hostname = normaliseHostname(host);

  if (!hostname || LOCAL_HOSTNAMES.has(hostname)) {
    return null;
  }

  return hostname;
};

const resolveTenantMiddleware = asyncHandler(
  async (req, res, next) => {
    let slug = getTenantSlugFromRequest(req);
    const domain = getTenantDomainFromRequest(req);

    /*
     * Development fallback:
     * localhost:5000 can use DEFAULT_TENANT_SLUG.
     */
    if (!slug && !domain && env.isDevelopment) {
      slug = env.defaultTenantSlug;
    }

    if (!slug && !domain) {
      throw ApiError.badRequest(
        "Tenant identification is required. Supply the X-Tenant-Slug header."
      );
    }

    const tenant = await tenantService.resolveTenant({
      slug,
      domain,
    });

    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    res.locals.tenant = tenant;

    next();
  }
);

const optionalTenantMiddleware = asyncHandler(
  async (req, res, next) => {
    let slug = getTenantSlugFromRequest(req);
    const domain = getTenantDomainFromRequest(req);

    if (!slug && !domain && env.isDevelopment) {
      slug = env.defaultTenantSlug;
    }

    if (!slug && !domain) {
      return next();
    }

    const tenant = await tenantService.resolveTenant({
      slug,
      domain,
    });

    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    res.locals.tenant = tenant;

    return next();
  }
);

module.exports = {
  resolveTenantMiddleware,
  optionalTenantMiddleware,
};