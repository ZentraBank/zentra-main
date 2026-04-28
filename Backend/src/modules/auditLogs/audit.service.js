const auditRepo = require("./audit.repository");

async function logAction({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  metadata,
}) {
  if (!tenantId || !userId || !action) {
    return; // do not break app if logging fails
  }

  try {
    await auditRepo.createLog({
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}

async function getAuditLogs({ tenantId, user }) {
  const isAdmin = ["tenant_admin", "super_admin"].includes(user.role);

  if (!isAdmin) {
    throw new Error("Only admins can view audit logs");
  }

  return auditRepo.getLogs({ tenantId });
}

module.exports = {
  logAction,
  getAuditLogs,
};