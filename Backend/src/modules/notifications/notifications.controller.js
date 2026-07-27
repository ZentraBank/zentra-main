const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./notifications.service");

const listMine = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Notifications retrieved successfully",
    data:await service.listMine({auth:req.auth,query:req.query})})
);

const unreadCount = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Unread count retrieved successfully",
    data:{count:await service.unreadCount({auth:req.auth})}})
);

const markRead = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Notification marked as read",
    data:await service.markRead({auth:req.auth,notificationId:req.params.notificationId})})
);

const markAllRead = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"All notifications marked as read",
    data:await service.markAllRead({auth:req.auth})})
);

const archive = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Notification archived successfully",
    data:await service.archive({auth:req.auth,notificationId:req.params.notificationId})})
);

const broadcast = asyncHandler(async (req,res) =>
  sendSuccess(res,{message:"Broadcast created successfully",
    data:await service.broadcast({auth:req.auth,body:req.body})},201)
);

module.exports = {listMine,unreadCount,markRead,markAllRead,archive,broadcast};
