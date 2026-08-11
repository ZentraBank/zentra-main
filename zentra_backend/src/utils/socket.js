function emitToUser(req, tenantId, userId, event, payload) {
  const io = req.app.get("io");

  if (!io) return;

  io.to(`tenant:${tenantId}:user:${userId}`).emit(event, payload);
}

function emitToTenantAdmins(req, tenantId, event, payload) {
  const io = req.app.get("io");

  if (!io) return;

  io.to(`tenant:${tenantId}:admins`).emit(event, payload);
}

function emitToConversation(req, conversationId, event, payload) {
  const io = req.app.get("io");

  if (!io) return;

  io.to(`conversation:${conversationId}`).emit(event, payload);
}

module.exports = {
  emitToUser,
  emitToTenantAdmins,
  emitToConversation,
};