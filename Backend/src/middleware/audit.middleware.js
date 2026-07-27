const auditLogsService =
  require(
    "../modules/audit-logs/auditLogs.service"
  );

const auditAction = ({
  action,
  actorType,
  entityType,
  getEntityId,
  description,
  getMetadata,
}) => {
  return (
    req,
    res,
    next
  ) => {
    const originalJson =
      res.json.bind(res);

    res.json = (
      body
    ) => {
      const status =
        res.statusCode >= 400
          ? "failure"
          : "success";

      const entityId =
        typeof getEntityId ===
        "function"
          ? getEntityId(
              req,
              body
            )
          : null;

      const metadata =
        typeof getMetadata ===
        "function"
          ? getMetadata(
              req,
              body
            )
          : null;

      auditLogsService
        .writeFromRequest({
          req,
          action,
          actorType,
          entityType,
          entityId,
          status,
          description:
            typeof description ===
            "function"
              ? description(
                  req,
                  body
                )
              : description,

          metadata,
        })
        .catch((error) => {
          console.error(
            "Audit log write failed:",
            error
          );
        });

      return originalJson(
        body
      );
    };

    next();
  };
};

module.exports = {
  auditAction,
};
