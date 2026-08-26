const repo =
  require(
    "./chat.repository"
  );

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(
      message
    );

  error.statusCode =
    statusCode;

  return error;
};

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

const getPagination = (
  query = {}
) => {
  const page =
    Number(
      query.page
    ) > 0
      ? Number(
          query.page
        )
      : 1;

  const pageSize =
    Number(
      query.pageSize
    ) > 0
      ? Math.min(
          Number(
            query.pageSize
          ),
          100
        )
      : 30;

  return {
    page,
    pageSize,

    limit:
      pageSize,

    offset:
      (
        page -
        1
      ) *
      pageSize,
  };
};

/*
|--------------------------------------------------------------------------
| Client validation
|--------------------------------------------------------------------------
*/

const getTenantClient =
  async ({
    tenantId,
    clientUserId,
  }) => {
    const client =
      await repo.findTenantClient({
        tenantId,
        clientUserId,
      });

    if (!client) {
      throw httpError(
        404,
        "Client not found in this tenant"
      );
    }

    if (
      client.user_status !==
      "active"
    ) {
      throw httpError(
        409,
        "Client user account is not active"
      );
    }

    if (
      client.membership_status !==
      "active"
    ) {
      throw httpError(
        409,
        "Client tenant membership is not active"
      );
    }

    return client;
  };

/*
|--------------------------------------------------------------------------
| Tenant conversation access
|--------------------------------------------------------------------------
*/

const getTenantConversation =
  async ({
    tenantId,
    conversationId,
  }) => {
    const conversation =
      await repo.findConversationById({
        tenantId,
        conversationId,
      });

    if (!conversation) {
      throw httpError(
        404,
        "Conversation not found"
      );
    }

    return conversation;
  };

/*
|--------------------------------------------------------------------------
| Client conversation access
|--------------------------------------------------------------------------
*/

const getClientConversation =
  async ({
    tenantId,
    userId,
  }) => {
    const conversation =
      await repo.findConversationByClient({
        tenantId,

        clientUserId:
          userId,
      });

    if (!conversation) {
      return null;
    }

    if (
      conversation.client_user_id !==
      userId
    ) {
      throw httpError(
        403,
        "You do not have access to this conversation"
      );
    }

    return conversation;
  };

/*
|--------------------------------------------------------------------------
| Tenant: list conversations
|--------------------------------------------------------------------------
*/

const listTenantConversations =
  async ({
    auth,
    query = {},
  }) => {
    const {
      page,
      pageSize,
      limit,
      offset,
    } =
      getPagination(
        query
      );

    const conversations =
      await repo.listTenantConversations({
        tenantId:
          auth.tenantId,

        limit,
        offset,
      });

    const enriched =
      [];

    for (
      const conversation
      of conversations
    ) {
      const unreadCount =
        await repo.countUnreadForUser({
          tenantId:
            auth.tenantId,

          conversationId:
            conversation.id,

          userId:
            auth.userId,
        });

      enriched.push({
        ...conversation,

        unread_count:
          unreadCount,
      });
    }

    return {
      conversations:
        enriched,

      pagination: {
        page,
        pageSize,
      },
    };
  };

/*
|--------------------------------------------------------------------------
| Tenant: create/get conversation
|--------------------------------------------------------------------------
*/

const createTenantConversation =
  async ({
    auth,
    clientUserId,
  }) => {
    await getTenantClient({
      tenantId:
        auth.tenantId,

      clientUserId,
    });

    return repo.createConversation({
      tenantId:
        auth.tenantId,

      clientUserId,
    });
  };

/*
|--------------------------------------------------------------------------
| Tenant: messages
|--------------------------------------------------------------------------
*/

const listTenantMessages =
  async ({
    auth,
    conversationId,
    query = {},
  }) => {
    await getTenantConversation({
      tenantId:
        auth.tenantId,

      conversationId,
    });

    const {
      page,
      pageSize,
      limit,
      offset,
    } =
      getPagination(
        query
      );

    const messages =
      await repo.listMessages({
        tenantId:
          auth.tenantId,

        conversationId,

        limit,
        offset,
      });

    const total =
      await repo.countMessages({
        tenantId:
          auth.tenantId,

        conversationId,
      });

    return {
      messages,

      pagination: {
        page,
        pageSize,

        total,

        totalPages:
          Math.max(
            1,
            Math.ceil(
              total /
                pageSize
            )
          ),
      },
    };
  };

const sendTenantMessage =
  async ({
    auth,
    conversationId,
    body,
  }) => {
    const conversation =
      await getTenantConversation({
        tenantId:
          auth.tenantId,

        conversationId,
      });

    if (
      conversation.status ===
      "archived"
    ) {
      throw httpError(
        409,
        "Archived conversations cannot receive new messages"
      );
    }

    const message =
      String(
        body.message ||
        ""
      ).trim();

    if (!message) {
      throw httpError(
        422,
        "Message is required"
      );
    }

    const created =
      await repo.createMessage({
        tenantId:
          auth.tenantId,

        conversationId,

        senderUserId:
          auth.userId,

        senderType:
          "tenant",

        body:
          message,

        messageType:
          "text",
      });

    return {
      conversation,
      message:
        created,
    };
  };

/*
|--------------------------------------------------------------------------
| Tenant: mark read
|--------------------------------------------------------------------------
*/

const markTenantRead =
  async ({
    auth,
    conversationId,
    body = {},
  }) => {
    await getTenantConversation({
      tenantId:
        auth.tenantId,

      conversationId,
    });

    return repo.markConversationRead({
      tenantId:
        auth.tenantId,

      conversationId,

      userId:
        auth.userId,

      lastReadMessageId:
        body.lastReadMessageId ||
        null,
    });
  };

/*
|--------------------------------------------------------------------------
| Tenant: unread count
|--------------------------------------------------------------------------
*/

const tenantUnreadCount =
  async ({
    auth,
  }) => {
    const unreadCount =
      await repo.countTotalUnreadForTenantUser({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,
      });

    return {
      unreadCount,
    };
  };

/*
|--------------------------------------------------------------------------
| Tenant: conversation status
|--------------------------------------------------------------------------
*/

const updateConversationStatus =
  async ({
    auth,
    conversationId,
    body,
  }) => {
    await getTenantConversation({
      tenantId:
        auth.tenantId,

      conversationId,
    });

    return repo.updateConversationStatus({
      tenantId:
        auth.tenantId,

      conversationId,

      status:
        body.status,
    });
  };

/*
|--------------------------------------------------------------------------
| Client: get/create conversation
|--------------------------------------------------------------------------
*/

const getMyConversation =
  async ({
    auth,
    createIfMissing = true,
  }) => {
    let conversation =
      await getClientConversation({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,
      });

    if (
      !conversation &&
      createIfMissing
    ) {
      /*
       * Confirm that this user
       * actually belongs to the
       * tenant before creating
       * their chat.
       */
      await getTenantClient({
        tenantId:
          auth.tenantId,

        clientUserId:
          auth.userId,
      });

      conversation =
        await repo.createConversation({
          tenantId:
            auth.tenantId,

          clientUserId:
            auth.userId,
        });
    }

    return conversation;
  };

/*
|--------------------------------------------------------------------------
| Client: list messages
|--------------------------------------------------------------------------
*/

const listMyMessages =
  async ({
    auth,
    query = {},
  }) => {
    const conversation =
      await getMyConversation({
        auth,
        createIfMissing:
          true,
      });

    const {
      page,
      pageSize,
      limit,
      offset,
    } =
      getPagination(
        query
      );

    const messages =
      await repo.listMessages({
        tenantId:
          auth.tenantId,

        conversationId:
          conversation.id,

        limit,
        offset,
      });

    const total =
      await repo.countMessages({
        tenantId:
          auth.tenantId,

        conversationId:
          conversation.id,
      });

    const unreadCount =
      await repo.countUnreadForUser({
        tenantId:
          auth.tenantId,

        conversationId:
          conversation.id,

        userId:
          auth.userId,
      });

    return {
      conversation,

      messages,

      unreadCount,

      pagination: {
        page,
        pageSize,

        total,

        totalPages:
          Math.max(
            1,
            Math.ceil(
              total /
                pageSize
            )
          ),
      },
    };
  };

/*
|--------------------------------------------------------------------------
| Client: send message
|--------------------------------------------------------------------------
*/

const sendMyMessage =
  async ({
    auth,
    body,
  }) => {
    const conversation =
      await getMyConversation({
        auth,
        createIfMissing:
          true,
      });

    if (
      conversation.status ===
      "archived"
    ) {
      throw httpError(
        409,
        "This conversation has been archived"
      );
    }

    const message =
      String(
        body.message ||
        ""
      ).trim();

    if (!message) {
      throw httpError(
        422,
        "Message is required"
      );
    }

    const created =
      await repo.createMessage({
        tenantId:
          auth.tenantId,

        conversationId:
          conversation.id,

        senderUserId:
          auth.userId,

        senderType:
          "client",

        body:
          message,

        messageType:
          "text",
      });

    return {
      conversation,
      message:
        created,
    };
  };

/*
|--------------------------------------------------------------------------
| Client: mark read
|--------------------------------------------------------------------------
*/

const markMyConversationRead =
  async ({
    auth,
    body = {},
  }) => {
    const conversation =
      await getMyConversation({
        auth,
        createIfMissing:
          true,
      });

    return repo.markConversationRead({
      tenantId:
        auth.tenantId,

      conversationId:
        conversation.id,

      userId:
        auth.userId,

      lastReadMessageId:
        body.lastReadMessageId ||
        null,
    });
  };

/*
|--------------------------------------------------------------------------
| Client: unread count
|--------------------------------------------------------------------------
*/

const myUnreadCount =
  async ({
    auth,
  }) => {
    const conversation =
      await getClientConversation({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,
      });

    if (!conversation) {
      return {
        unreadCount:
          0,
      };
    }

    const unreadCount =
      await repo.countUnreadForUser({
        tenantId:
          auth.tenantId,

        conversationId:
          conversation.id,

        userId:
          auth.userId,
      });

    return {
      unreadCount,
    };
  };

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