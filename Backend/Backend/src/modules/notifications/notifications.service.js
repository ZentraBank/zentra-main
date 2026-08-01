const repo = require("./notifications.repository");

const httpError = (statusCode,message) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

const listMine = ({auth,query}) =>
  repo.listByUser({
    tenantId:auth.tenantId,
    userId:auth.userId,
    unreadOnly:query.unreadOnly,
    includeArchived:query.includeArchived,
    limit:Math.min(Number(query.pageSize),100),
    offset:(Number(query.page)-1)*Math.min(Number(query.pageSize),100)
  });

const unreadCount = ({auth}) =>
  repo.countUnread({tenantId:auth.tenantId,userId:auth.userId});

const markRead = async ({auth,notificationId}) => {
  const item = await repo.findById({tenantId:auth.tenantId,notificationId});
  if (!item || item.user_id !== auth.userId) throw httpError(404,"Notification not found");
  await repo.markRead({tenantId:auth.tenantId,userId:auth.userId,notificationId});
  return repo.findById({tenantId:auth.tenantId,notificationId});
};

const markAllRead = async ({auth}) => {
  const [result] = await repo.markAllRead({
    tenantId:auth.tenantId,userId:auth.userId
  });
  return {updatedCount:result.affectedRows};
};

const archive = async ({auth,notificationId}) => {
  const item = await repo.findById({tenantId:auth.tenantId,notificationId});
  if (!item || item.user_id !== auth.userId) throw httpError(404,"Notification not found");
  await repo.archive({tenantId:auth.tenantId,userId:auth.userId,notificationId});
  return repo.findById({tenantId:auth.tenantId,notificationId});
};

const broadcast = async ({auth,body}) => {
  const recipients = await repo.audienceUsers({
    tenantId:auth.tenantId,
    audienceType:body.audienceType,
    audienceValue:body.audienceValue
  });
  if (!recipients.length) throw httpError(404,"No users matched the audience");

  for (const recipient of recipients) {
    await repo.create({
      tenantId:auth.tenantId,
      userId:recipient.user_id,
      notificationType:"admin_broadcast",
      title:body.title,
      message:body.message,
      priority:body.priority,
      actionUrl:body.actionUrl,
      metadata:{audienceType:body.audienceType,audienceValue:body.audienceValue || null}
    });
  }

  return {recipientCount:recipients.length};
};

const notifyUser = (payload) => repo.create(payload);

module.exports = {
  listMine,unreadCount,markRead,markAllRead,archive,broadcast,notifyUser
};
