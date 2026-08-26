const repo = require("./notifications.repository");

const httpError = (statusCode,message) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

const listMine = ({ auth, page = 1, pageSize = 20 }) => {
  const safePage =
    Number.isInteger(page) && page > 0 ? page : 1;

  const safePageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? Math.min(pageSize, 100)
      : 20;

  const offset = (safePage - 1) * safePageSize;

  return repo.listByUser({
    tenantId: auth.tenantId,
    userId: auth.userId,
    limit: safePageSize,
    offset,
  });
};

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

const replaceTemplateVariables =
  (
    text,
    variables
  ) => {
    if (!text) {
      return text;
    }

    return text.replace(
      /\{\{(\w+)\}\}/g,
      (
        match,
        key
      ) => {
        const value =
          variables[key];

        return (
          value === undefined ||
          value === null
            ? match
            : String(value)
        );
      }
    );
  };
const createTemplate =
  ({
    auth,
    body,
  }) =>
    repo.createTemplate({
      tenantId:
        auth.tenantId,

      createdBy:
        auth.userId,

      body,
    });

const listTemplates =
  ({
    auth,
    query = {},
  }) =>
    repo.listTemplates({
      tenantId:
        auth.tenantId,

      status:
        query.status ||
        "active",
    });

const updateTemplate =
  async ({
    auth,
    templateId,
    body,
  }) => {
    const template =
      await repo.findTemplateById({
        tenantId:
          auth.tenantId,

        templateId,
      });

    if (!template) {
      throw httpError(
        404,
        "Notification template not found"
      );
    }

    return repo.updateTemplate({
      tenantId:
        auth.tenantId,

      templateId,
      body,
    });
  };

const deleteTemplate =
  async ({
    auth,
    templateId,
  }) => {
    const template =
      await repo.findTemplateById({
        tenantId:
          auth.tenantId,

        templateId,
      });

    if (!template) {
      throw httpError(
        404,
        "Notification template not found"
      );
    }

    await repo.deleteTemplate({
      tenantId:
        auth.tenantId,

      templateId,
    });

    return {
      deleted:
        true,
    };
  };

  const sendToClients =
  async ({
    auth,
    body,
  }) => {
    let template =
      null;

    if (
      body.templateId
    ) {
      template =
        await repo.findTemplateById({
          tenantId:
            auth.tenantId,

          templateId:
            body.templateId,
        });

      if (!template) {
        throw httpError(
          404,
          "Notification template not found"
        );
      }
    }

    let recipients =
      [];

    if (
      body.audienceType ===
      "user"
    ) {
      const client =
        await repo.findTenantClientById({
          tenantId:
            auth.tenantId,

          userId:
            body.userId,
        });

      if (client) {
        recipients = [
          client,
        ];
      }
    }

    if (
      body.audienceType ===
      "users"
    ) {
      recipients =
        await repo.findTenantClientsByIds({
          tenantId:
            auth.tenantId,

          userIds:
            body.userIds,
        });
    }

    if (
      body.audienceType ===
      "all_clients"
    ) {
      recipients =
        await repo.findAllTenantClients({
          tenantId:
            auth.tenantId,
        });
    }

    if (
      recipients.length ===
      0
    ) {
      throw httpError(
        404,
        "No clients matched the selected audience"
      );
    }

    const baseTitle =
      body.title ||
      template?.title;

    const baseMessage =
      body.message ||
      template?.message;

    if (
      !baseTitle ||
      !baseMessage
    ) {
      throw httpError(
        422,
        "Notification title and message are required"
      );
    }

    let sentCount =
      0;

    for (
      const recipient
      of recipients
    ) {
      const variables = {
        firstName:
          recipient.first_name ||
          "",

        lastName:
          recipient.last_name ||
          "",

        email:
          recipient.email ||
          "",

        tenantName:
          body.tenantName ||
          "",
      };

      const title =
        replaceTemplateVariables(
          baseTitle,
          variables
        );

      const message =
        replaceTemplateVariables(
          baseMessage,
          variables
        );

      await repo.create({
        tenantId:
          auth.tenantId,

        userId:
          recipient.user_id,

        notificationType:
          "tenant_notification",

        title,

        message,

        priority:
          body.priority ||
          template?.priority ||
          "normal",

        actionUrl:
          body.actionUrl ??
          template?.action_url ??
          null,

        metadata: {
          sentBy:
            auth.userId,

          templateId:
            template?.id ||
            null,

          audienceType:
            body.audienceType,
        },
      });

      sentCount +=
        1;
    }

    return {
      sentCount,
    };
  };

module.exports = {
  listMine,unreadCount,markRead,markAllRead,archive,broadcast,notifyUser,
  replaceTemplateVariables,listTemplates,updateTemplate,deleteTemplate,sendToClients
};
