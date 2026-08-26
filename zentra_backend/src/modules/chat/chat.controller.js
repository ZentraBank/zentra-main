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
    "./chat.service"
  );

const {
  emitToUser,
  emitToTenant,
  emitToConversation,
} = require(
  "../../realtime/socket"
);

/*
|--------------------------------------------------------------------------
| Tenant: list conversations
|--------------------------------------------------------------------------
*/

const listTenantConversations =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.listTenantConversations({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Conversations retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: create/get conversation
|--------------------------------------------------------------------------
*/

const createTenantConversation =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.createTenantConversation({
          auth:
            req.auth,

          clientUserId:
            req.params.clientUserId,
        });

      /*
       * Let tenant-side screens know
       * that the conversation exists.
       */
      emitToTenant(
        req.auth.tenantId,
        "chat:conversation:updated",
        {
          conversation:
            data,
        }
      );

      /*
       * Let the client know that
       * their conversation is now
       * available as well.
       */
      emitToUser(
        data.client_user_id,
        "chat:conversation:updated",
        {
          conversation:
            data,
        }
      );

      return sendSuccess(
        res,
        {
          message:
            "Conversation created successfully",

          data,
        },
        201
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: list messages
|--------------------------------------------------------------------------
*/

const listTenantMessages =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.listTenantMessages({
          auth:
            req.auth,

          conversationId:
            req.params.conversationId,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Messages retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: send message
|--------------------------------------------------------------------------
*/

const sendTenantMessage =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.sendTenantMessage({
          auth:
            req.auth,

          conversationId:
            req.params.conversationId,

          body:
            req.body,
        });

      const {
        conversation,
        message,
      } = data;

      /*
       * Everyone actively viewing
       * this conversation receives
       * the message.
       */
      emitToConversation(
        conversation.id,
        "chat:message:new",
        {
          conversationId:
            conversation.id,

          message,
        }
      );

      /*
       * Client receives a general
       * conversation update even if
       * they are not currently inside
       * the conversation room.
       */
      emitToUser(
        conversation.client_user_id,
        "chat:conversation:updated",
        {
          conversationId:
            conversation.id,

          message,
        }
      );

      /*
       * Also refresh tenant inboxes.
       */
      emitToTenant(
        req.auth.tenantId,
        "chat:conversation:updated",
        {
          conversationId:
            conversation.id,

          clientUserId:
            conversation.client_user_id,

          message,
        }
      );

      return sendSuccess(
        res,
        {
          message:
            "Message sent successfully",

          data:
            message,
        },
        201
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: mark conversation read
|--------------------------------------------------------------------------
*/

const markTenantRead =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.markTenantRead({
          auth:
            req.auth,

          conversationId:
            req.params.conversationId,

          body:
            req.body,
        });

      /*
       * Let anyone inside the
       * conversation know the tenant
       * has read through this message.
       */
      emitToConversation(
        req.params.conversationId,
        "chat:message:read",
        {
          conversationId:
            req.params.conversationId,

          userId:
            req.auth.userId,

          lastReadMessageId:
            data.last_read_message_id,

          lastReadAt:
            data.last_read_at,
        }
      );

      /*
       * Refresh tenant unread badges.
       */
      emitToTenant(
        req.auth.tenantId,
        "chat:conversation:updated",
        {
          conversationId:
            req.params.conversationId,

          readByUserId:
            req.auth.userId,

          lastReadMessageId:
            data.last_read_message_id,

          lastReadAt:
            data.last_read_at,
        }
      );

      return sendSuccess(
        res,
        {
          message:
            "Conversation marked as read",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: unread count
|--------------------------------------------------------------------------
*/

const tenantUnreadCount =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.tenantUnreadCount({
          auth:
            req.auth,
        });

      return sendSuccess(
        res,
        {
          message:
            "Unread chat count retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: update conversation status
|--------------------------------------------------------------------------
*/

const updateConversationStatus =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.updateConversationStatus({
          auth:
            req.auth,

          conversationId:
            req.params.conversationId,

          body:
            req.body,
        });

      emitToConversation(
        data.id,
        "chat:conversation:updated",
        {
          conversation:
            data,
        }
      );

      emitToUser(
        data.client_user_id,
        "chat:conversation:updated",
        {
          conversation:
            data,
        }
      );

      emitToTenant(
        req.auth.tenantId,
        "chat:conversation:updated",
        {
          conversation:
            data,
        }
      );

      return sendSuccess(
        res,
        {
          message:
            "Conversation status updated successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: get conversation
|--------------------------------------------------------------------------
*/

const getMyConversation =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.getMyConversation({
          auth:
            req.auth,

          createIfMissing:
            true,
        });

      return sendSuccess(
        res,
        {
          message:
            "Conversation retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: list messages
|--------------------------------------------------------------------------
*/

const listMyMessages =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.listMyMessages({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Messages retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: send message
|--------------------------------------------------------------------------
*/

const sendMyMessage =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.sendMyMessage({
          auth:
            req.auth,

          body:
            req.body,
        });

      const {
        conversation,
        message,
      } = data;

      /*
       * Everyone currently viewing
       * this conversation gets the
       * newly persisted message.
       */
      emitToConversation(
        conversation.id,
        "chat:message:new",
        {
          conversationId:
            conversation.id,

          message,
        }
      );

      /*
       * Tenant inbox/list screens
       * receive an update even when
       * nobody has opened the chat.
       */
      emitToTenant(
        req.auth.tenantId,
        "chat:conversation:updated",
        {
          conversationId:
            conversation.id,

          clientUserId:
            conversation.client_user_id,

          message,
        }
      );

      /*
       * Also send to the client's
       * private room. This helps other
       * tabs/windows owned by the same
       * client refresh.
       */
      emitToUser(
        req.auth.userId,
        "chat:conversation:updated",
        {
          conversationId:
            conversation.id,

          message,
        }
      );

      return sendSuccess(
        res,
        {
          message:
            "Message sent successfully",

          data:
            message,
        },
        201
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: mark conversation read
|--------------------------------------------------------------------------
*/

const markMyConversationRead =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.markMyConversationRead({
          auth:
            req.auth,

          body:
            req.body,
        });

      emitToConversation(
        data.conversation_id,
        "chat:message:read",
        {
          conversationId:
            data.conversation_id,

          userId:
            req.auth.userId,

          lastReadMessageId:
            data.last_read_message_id,

          lastReadAt:
            data.last_read_at,
        }
      );

      /*
       * Tenant side may need to
       * update read indicators.
       */
      emitToTenant(
        req.auth.tenantId,
        "chat:conversation:updated",
        {
          conversationId:
            data.conversation_id,

          readByUserId:
            req.auth.userId,

          lastReadMessageId:
            data.last_read_message_id,

          lastReadAt:
            data.last_read_at,
        }
      );

      return sendSuccess(
        res,
        {
          message:
            "Conversation marked as read",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: unread count
|--------------------------------------------------------------------------
*/

const myUnreadCount =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const data =
        await service.myUnreadCount({
          auth:
            req.auth,
        });

      return sendSuccess(
        res,
        {
          message:
            "Unread chat count retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  listTenantConversations,
  createTenantConversation,
  listTenantMessages,
  sendTenantMessage,
  markTenantRead,
  tenantUnreadCount,
  updateConversationStatus,

  getMyConversation,
  listMyMessages,
  sendMyMessage,
  markMyConversationRead,
  myUnreadCount,
};