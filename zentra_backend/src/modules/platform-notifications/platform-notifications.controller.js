const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./platform-notifications.service");

module.exports = {
  list: asyncHandler(async (req, res) => {
  res.set({
    "Cache-Control":
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  const result =
    await service.listNotifications({
      auth: req.auth,
      query: req.query,
    });

  return sendSuccess(res, {
    message:
      "Platform notifications loaded successfully.",
    data: result.rows,
    meta: result.meta,
  });
}),

  getOne: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform notification loaded successfully.",
      data: await service.getNotification({
        auth: req.auth,
        notificationId:
          req.params.notificationId,
      }),
    })
  ),

  create: asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      {
        message:
          "Platform notification created successfully.",
        data:
          await service.createNotification({
            body: req.body,
          }),
      },
      201
    )
  ),

  markRead: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform notification marked as read.",
      data: await service.markRead({
        auth: req.auth,
        notificationId:
          req.params.notificationId,
      }),
    })
  ),

  markAllRead: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "All platform notifications marked as read.",
      data: await service.markAllRead({
        auth: req.auth,
      }),
    })
  ),

  unreadCount: asyncHandler(async (req, res) => {
  res.set({
    "Cache-Control":
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  return sendSuccess(res, {
    message:
      "Unread notification count loaded.",
    data: {
      unreadCount:
        await service.getUnreadCount({
          auth: req.auth,
        }),
    },
  });
}),
};
