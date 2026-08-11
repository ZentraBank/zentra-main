const repo =
  require("./auditLogs.repository");

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const write = async ({
  connection,
  tenantId = null,
  actorUserId = null,
  actorType = "user",
  action,
  entityType = null,
  entityId = null,
  requestMethod = null,
  requestPath = null,
  ipAddress = null,
  userAgent = null,
  status = "success",
  description = null,
  metadata = null,
}) => {
  if (!action) {
    throw httpError(
      500,
      "Audit action is required"
    );
  }

  return repo.create({
    connection,
    tenantId,
    actorUserId,
    actorType,
    action,
    entityType,
    entityId,
    requestMethod,
    requestPath,
    ipAddress,
    userAgent,
    status,
    description,
    metadata,
  });
};

const writeFromRequest = async ({
  req,
  action,
  actorType,
  entityType,
  entityId,
  status = "success",
  description,
  metadata,
  connection,
}) => {
  return write({
    connection,
    tenantId:
      req.auth?.tenantId ||
      req.tenant?.id ||
      null,

    actorUserId:
      req.auth?.userId ||
      null,

    actorType:
      actorType ||
      (
        req.auth?.isAdmin
          ? "admin"
          : "user"
      ),

    action,
    entityType,
    entityId,

    requestMethod:
      req.method,

    requestPath:
      req.originalUrl,

    ipAddress:
      req.ip ||
      req.headers[
        "x-forwarded-for"
      ] ||
      null,

    userAgent:
      req.get("user-agent") ||
      null,

    status,
    description,
    metadata,
  });
};

const listForTenant = async ({
  tenantId,
  query,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  const filters = {
    tenantId,
    actorUserId:
      query.actorUserId ||
      null,

    action:
      query.action ||
      null,

    entityType:
      query.entityType ||
      null,

    entityId:
      query.entityId ||
      null,

    status:
      query.status ||
      null,

    dateFrom:
      query.dateFrom ||
      null,

    dateTo:
      query.dateTo ||
      null,
  };

  const [
    items,
    total,
  ] = await Promise.all([
    repo.list({
      ...filters,
      limit,
      offset:
        (page - 1) *
        limit,
    }),

    repo.count(
      filters
    ),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize: limit,
      total,
      totalPages:
        Math.ceil(
          total / limit
        ),
    },
  };
};

const getForTenant = async ({
  tenantId,
  auditLogId,
}) => {
  const auditLog =
    await repo.findById({
      tenantId,
      auditLogId,
    });

  if (!auditLog) {
    throw httpError(
      404,
      "Audit log not found"
    );
  }

  return auditLog;
};

module.exports = {
  write,
  writeFromRequest,
  listForTenant,
  getForTenant,
};
