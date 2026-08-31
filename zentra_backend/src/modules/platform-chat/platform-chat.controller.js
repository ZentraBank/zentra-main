const asyncHandler =
  require(
    "../../utils/asyncHandler"
  );

const {
  sendSuccess,
} = require(
  "../../utils/response"
);

const service =
  require(
    "./platform-chat.service"
  );


/*
|--------------------------------------------------------------------------
| Tenant side
|--------------------------------------------------------------------------
*/

const getTenantConversation =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .getTenantConversation({
            tenantId:
              req.auth.tenantId,

            userId:
              req.auth.userId,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat conversation retrieved successfully",

          data,
        }
      );
    }
  );


const listTenantMessages =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .listTenantMessages({
            tenantId:
              req.auth.tenantId,

            userId:
              req.auth.userId,

            page:
              req.query.page,

            pageSize:
              req.query.pageSize,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat messages retrieved successfully",

          data,
        }
      );
    }
  );


const sendTenantMessage =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .sendTenantMessage({
            tenantId:
              req.auth.tenantId,

            userId:
              req.auth.userId,

            body:
              req.body,
          });

      return sendSuccess(
        res,
        {
          statusCode:
            201,

          message:
            "Platform chat message sent successfully",

          data,
        }
      );
    }
  );


const markTenantConversationRead =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .markTenantConversationRead({
            tenantId:
              req.auth.tenantId,

            userId:
              req.auth.userId,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat conversation marked as read",

          data,
        }
      );
    }
  );


const getTenantUnreadCount =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .getTenantUnreadCount({
            tenantId:
              req.auth.tenantId,

            userId:
              req.auth.userId,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat unread count retrieved successfully",

          data,
        }
      );
    }
  );


/*
|--------------------------------------------------------------------------
| Platform side
|--------------------------------------------------------------------------
*/

const listPlatformConversations =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .listPlatformConversations({
            platformUserId:
              req.auth.userId,

            status:
              req.query.status,

            page:
              req.query.page,

            pageSize:
              req.query.pageSize,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat conversations retrieved successfully",

          data,
        }
      );
    }
  );


const getPlatformConversation =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .getPlatformConversation({
            platformUserId:
              req.auth.userId,

            conversationId:
              req.params.conversationId,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat conversation retrieved successfully",

          data,
        }
      );
    }
  );


const listPlatformMessages =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .listPlatformMessages({
            platformUserId:
              req.auth.userId,

            conversationId:
              req.params.conversationId,

            page:
              req.query.page,

            pageSize:
              req.query.pageSize,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat messages retrieved successfully",

          data,
        }
      );
    }
  );


const sendPlatformMessage =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .sendPlatformMessage({
            platformUserId:
              req.auth.userId,

            conversationId:
              req.params.conversationId,

            body:
              req.body,
          });

      return sendSuccess(
        res,
        {
          statusCode:
            201,

          message:
            "Platform chat reply sent successfully",

          data,
        }
      );
    }
  );


const markPlatformConversationRead =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .markPlatformConversationRead({
            platformUserId:
              req.auth.userId,

            conversationId:
              req.params.conversationId,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat conversation marked as read",

          data,
        }
      );
    }
  );


const updatePlatformConversationStatus =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .updatePlatformConversationStatus({
            platformUserId:
              req.auth.userId,

            conversationId:
              req.params.conversationId,

            status:
              req.body.status,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat conversation status updated successfully",

          data,
        }
      );
    }
  );


const getPlatformUnreadCount =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service
          .getPlatformUnreadCount({
            platformUserId:
              req.auth.userId,
          });

      return sendSuccess(
        res,
        {
          message:
            "Platform chat unread count retrieved successfully",

          data,
        }
      );
    }
  );


module.exports = {
  /*
   * Tenant side
   */
  getTenantConversation,
  listTenantMessages,
  sendTenantMessage,
  markTenantConversationRead,
  getTenantUnreadCount,

  /*
   * Platform side
   */
  listPlatformConversations,
  getPlatformConversation,
  listPlatformMessages,
  sendPlatformMessage,
  markPlatformConversationRead,
  updatePlatformConversationStatus,
  getPlatformUnreadCount,
};