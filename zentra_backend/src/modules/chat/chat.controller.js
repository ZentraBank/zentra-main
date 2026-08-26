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
  getIO,
} = require(
  "../../realtime/socket"
);

/*
|--------------------------------------------------------------------------
| Socket helpers
|--------------------------------------------------------------------------
*/

const emitToConversation =
  ({
    conversationId,
    event,
    payload,
  }) => {
    try {
      const io =
        getIO();

      io.to(
        `conversation:${conversationId}`
      ).emit(
        event,
        payload
      );
    } catch (error) {
      /*
       * Realtime failure must not
       * break an already-completed
       * API/database operation.
       */
      console.error(
        `[Chat] Failed to emit ${event}:`,
        error.message
      );
    }
  };

const emitToUser =
  ({
    userId,
    event,
    payload,
  }) => {
    try {
      const io =
        getIO();

      io.to(
        `user:${userId}`
      ).emit(
        event,
        payload
      );
    } catch (error) {
      console.error(
        `[Chat] Failed to emit ${event}:`,
        error.message
      );
    }
  };

const emitToTenant =
  ({
    tenantId,
    event,
    payload,
  }) => {
    try {
      const io =
        getIO();

      io.to(
        `tenant:${tenantId}`
      ).emit(
        event,
        payload
      );
    } catch (error) {
      console.error(
        `[Chat] Failed to emit ${event}:`,
        error.message
      );
    }
  };

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
       * Everyone currently viewing
       * this conversation receives
       * the new message.
       */
      emitToConversation({
        conversationId:
          conversation.id,

        event:
          "chat:message:new",

        payload: {
          conversationId:
            conversation.id,

          message,
        },
      });

      /*
       * Client receives it even if
       * they are not currently in
       * the conversation room.
       */
      emitToUser({
        userId:
          conversation.client_user_id,

        event:
          "chat:conversation:updated",

        payload: {
          conversationId:
            conversation.id,

          message,
        },
      });

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

      emitToConversation({
        conversationId:
          req.params.conversationId,

        event:
          "chat:message:read",

        payload: {
          conversationId:
            req.params.conversationId,

          userId:
            req.auth.userId,

          lastReadMessageId:
            data.last_read_message_id,

          lastReadAt:
            data.last_read_at,
        },
      });

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

      emitToConversation({
        conversationId:
          data.id,

        event:
          "chat:conversation:updated",

        payload: {
          conversation:
            data,
        },
      });

      emitToUser({
        userId:
          data.client_user_id,

        event:
          "chat:conversation:updated",

        payload: {
          conversation:
            data,
        },
      });

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
       * Send to anyone currently
       * viewing this conversation.
       */
      emitToConversation({
        conversationId:
          conversation.id,

        event:
          "chat:message:new",

        payload: {
          conversationId:
            conversation.id,

          message,
        },
      });

      /*
       * Notify tenant-side live
       * communication screens that
       * a conversation changed.
       */
      emitToTenant({
        tenantId:
          req.auth.tenantId,

        event:
          "chat:conversation:updated",

        payload: {
          conversationId:
            conversation.id,

          clientUserId:
            conversation.client_user_id,

          message,
        },
      });

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
| Client: mark read
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

      emitToConversation({
        conversationId:
          data.conversation_id,

        event:
          "chat:message:read",

        payload: {
          conversationId:
            data.conversation_id,

          userId:
            req.auth.userId,

          lastReadMessageId:
            data.last_read_message_id,

          lastReadAt:
            data.last_read_at,
        },
      });

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