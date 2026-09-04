const asyncHandler = require("../../utils/asyncHandler");
const service = require("./notifications.service");
const {
  sendSuccess,
} = require(
  "../../utils/response"
);

const listMine = asyncHandler(async (req, res) => {
  const parsedPage = Number.parseInt(req.query.page, 10);
  const parsedPageSize = Number.parseInt(
    req.query.pageSize || req.query.limit,
    10
  );

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const pageSize =
    Number.isInteger(parsedPageSize) && parsedPageSize > 0
      ? Math.min(parsedPageSize, 100)
      : 20;

  const data = await service.listMine({
    auth: req.auth,
    page,
    pageSize,
  });

  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data,
  });
});

const unreadCount = asyncHandler(async (req, res) => {
  const data = await service.unreadCount({
    auth: req.auth,
  });

  res.status(200).json({
    success: true,
    message: "Unread notification count retrieved successfully",
    data,
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  const data = await service.markAllRead({
    auth: req.auth,
  });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data,
  });
});

const markRead = asyncHandler(async (req, res) => {
  const data = await service.markRead({
    auth: req.auth,
    notificationId: req.params.notificationId,
  });

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data,
  });
});

const archive = asyncHandler(async (req, res) => {
  const data = await service.archive({
    auth: req.auth,
    notificationId: req.params.notificationId,
  });

  res.status(200).json({
    success: true,
    message: "Notification archived",
    data,
  });
});

const broadcast = asyncHandler(async (req, res) => {
  const data = await service.broadcast({
    auth: req.auth,
    body: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Notification broadcast created successfully",
    data,
  });
});

const createTemplate =
  asyncHandler(async (req, res) => {
    const data =
      await service.createTemplate({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Notification template created successfully",
        data,
      },
      201
    );
  });

const listTemplates =
  asyncHandler(async (req, res) => {
    const data =
      await service.listTemplates({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Notification templates retrieved successfully",
      data,
    });
  });

const updateTemplate =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateTemplate({
        auth: req.auth,
        templateId:
          req.params.templateId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Notification template updated successfully",
      data,
    });
  });

const deleteTemplate =
  asyncHandler(async (req, res) => {
    const data =
      await service.deleteTemplate({
        auth: req.auth,
        templateId:
          req.params.templateId,
      });

    return sendSuccess(res, {
      message:
        "Notification template deleted successfully",
      data,
    });
  });

const sendToClients =
  asyncHandler(async (req, res) => {
    const data =
      await service.sendToClients({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Notification sent successfully",
        data,
      },
      201
    );
  });

  const savePushSubscription =
  asyncHandler(async (req, res) => {
    const data =
      await service.savePushSubscription({
        auth: req.auth,
        body: req.body,

        userAgent:
          req.get("user-agent") ||
          null,
      });

    return sendSuccess(
      res,
      {
        message:
          "Push subscription saved successfully",
        data,
      },
      201
    );
  });


const removePushSubscription =
  asyncHandler(async (req, res) => {
    const data =
      await service.removePushSubscription({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Push subscription removed successfully",
      data,
    });
  });

module.exports = {
  listMine,
  unreadCount,
  markAllRead,
  markRead,
  archive,
  broadcast,
  createTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  sendToClients,
  savePushSubscription,
  removePushSubscription,
};