const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./superadmin.service");

const context = (req) => ({
  ipAddress:
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    null,
  userAgent: req.headers["user-agent"] || null,
  requestId: req.headers["x-request-id"] || null,
});

const listTenantDomains = asyncHandler(
  async (req, res) => {
    const data =
      await service.listTenantDomains({
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Tenant domains retrieved successfully.",
      data: data.rows,
      meta: data.meta,
    });
  }
);

const getTenantDomain = asyncHandler(
  async (req, res) => {
    const data =
      await service.getTenantDomain({
        domainId:
          req.params.domainId,
      });

    return sendSuccess(res, {
      message:
        "Tenant domain retrieved successfully.",
      data,
    });
  }
);

module.exports = {
  getDashboard: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform dashboard loaded successfully.",
      data:
        await service.getDashboard(),
    })
  ),

  listTenants: asyncHandler(
    async (req, res) => {
      const result =
        await service.listTenants({
          query: req.query,
        });

      return sendSuccess(res, {
        message:
          "Tenants loaded successfully.",
        data: result.rows,
        meta: result.meta,
      });
    }
  ),

  getTenant: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant loaded successfully.",
        data:
          await service.getTenant({
            tenantId:
              req.params.tenantId,
          }),
      })
  ),

  createTenant: asyncHandler(
    async (req, res) =>
      sendSuccess(
        res,
        {
          message:
            "Tenant created successfully.",
          data:
            await service.createTenant({
              auth: req.auth,
              body: req.body,
              requestContext:
                context(req),
            }),
        },
        201
      )
  ),

  updateTenantStatus: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant status updated successfully.",
        data:
          await service.updateTenantStatus({
            auth: req.auth,
            tenantId:
              req.params.tenantId,
            status:
              req.body.status,
            requestContext:
              context(req),
          }),
      })
  ),

  updateTenantFeatures: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant features updated successfully.",
        data:
          await service.updateTenantFeatures({
            auth: req.auth,
            tenantId:
              req.params.tenantId,
            features:
              req.body.features,
            reason:
              req.body.reason,
            requestContext:
              context(req),
          }),
      })
  ),

  listTenantAdministrators:
    asyncHandler(
      async (req, res) =>
        sendSuccess(res, {
          message:
            "Tenant administrators loaded successfully.",
          data:
            await service.listTenantAdministrators(
              {
                tenantId:
                  req.params.tenantId,
              }
            ),
        })
    ),

  listAuditLogs: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Platform audit logs loaded successfully.",
        data:
          await service.listAuditLogs({
            query: req.query,
          }),
      })
  ),

  /*
  |--------------------------------------------------------------------------
  | Domain oversight
  |--------------------------------------------------------------------------
  */

  listTenantDomains,

  getTenantDomain,
};