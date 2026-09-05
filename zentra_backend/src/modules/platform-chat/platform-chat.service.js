const repo =
  require(
    "./platform-chat.repository"
  );

const subscriptionService =
  require(
    "../subscriptions/subscriptions.service"
  );

  const {
  emitToTenant,
  emitToPlatform,
  emitToPlatformChatConversation,
} = require(
  "../../realtime/socket"
);

const httpError = (
  statusCode,
  message,
  extra = {}
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  Object.assign(
    error,
    extra
  );

  return error;
};


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const ensureTenantPlatformChatAccess =
  async ({
    tenantId,
  }) => {
    const {
      subscription,
      entitlements,
    } =
      await subscriptionService
        .getTenantEntitlements({
          tenantId,
        });

    if (!subscription) {
      throw httpError(
        403,
        "An active subscription is required",
        {
          code:
            "ACTIVE_SUBSCRIPTION_REQUIRED",
        }
      );
    }

    if (
      entitlements.platform_chat !==
      true
    ) {
      throw httpError(
        403,
        "Platform chat is not included in your current subscription plan.",
        {
          code:
            "SUBSCRIPTION_FEATURE_REQUIRED",

          feature:
            "platform_chat",

          currentPlan:
            subscription.plan_code,
        }
      );
    }

    return {
      subscription,
      entitlements,
    };
  };


const ensureTenantUser =
  async ({
    tenantId,
    userId,
  }) => {
    const user =
      await repo
        .findActiveTenantUser({
          tenantId,
          userId,
        });

    if (!user) {
      throw httpError(
        403,
        "You are not an active member of this tenant"
      );
    }

    /*
     * Platform chat is intended for tenant
     * staff, not customer/client accounts.
     */
    if (
      user.role_code ===
      "customer"
    ) {
      throw httpError(
        403,
        "Platform chat is only available to tenant staff",
        {
          code:
            "TENANT_STAFF_REQUIRED",
        }
      );
    }

    return user;
  };


const ensurePlatformUser =
  async ({
    platformUserId,
  }) => {
    const user =
      await repo
        .findActivePlatformUser({
          platformUserId,
        });

    if (!user) {
      throw httpError(
        403,
        "Active platform user required"
      );
    }

    return user;
  };


const getOrCreateTenantConversation =
  async ({
    tenantId,
  }) => {
    let conversation =
      await repo
        .findConversationByTenant({
          tenantId,
        });

    if (conversation) {
      return conversation;
    }

    try {
      conversation =
        await repo
          .createConversation({
            tenantId,
          });

      return conversation;
    } catch (error) {
      /*
       * The database has a unique constraint
       * on tenant_id. If two requests try to
       * create the conversation simultaneously,
       * fetch the conversation created by the
       * winning request.
       */
      if (
        error?.code ===
        "ER_DUP_ENTRY"
      ) {
        const existing =
          await repo
            .findConversationByTenant({
              tenantId,
            });

        if (existing) {
          return existing;
        }
      }

      throw error;
    }
  };


const ensureConversationOpen =
  (
    conversation
  ) => {
    if (
      conversation.status !==
      "open"
    ) {
      throw httpError(
        409,
        "This platform chat conversation is closed",
        {
          code:
            "PLATFORM_CHAT_CLOSED",
        }
      );
    }
  };


const normalisePagination =
  ({
    page = 1,
    pageSize = 50,
  }) => {
    const safePage =
      Number(page) > 0
        ? Number(page)
        : 1;

    const safePageSize =
      Number(pageSize) > 0
        ? Math.min(
            Number(pageSize),
            100
          )
        : 50;

    return {
      page:
        safePage,

      pageSize:
        safePageSize,

      offset:
        (
          safePage -
          1
        ) *
        safePageSize,
    };
  };


/*
|--------------------------------------------------------------------------
| Tenant side
|--------------------------------------------------------------------------
*/

const getTenantConversation =
  async ({
    tenantId,
    userId,
  }) => {
    await ensureTenantPlatformChatAccess({
      tenantId,
    });

    await ensureTenantUser({
      tenantId,
      userId,
    });

    const conversation =
      await getOrCreateTenantConversation({
        tenantId,
      });

    const unreadCount =
      await repo
        .countUnreadMessages({
          conversationId:
            conversation.id,

          actorType:
            "tenant_user",

          actorId:
            userId,
        });

    return {
      ...conversation,

      unread_count:
        unreadCount,
    };
  };


const listTenantMessages =
  async ({
    tenantId,
    userId,
    page = 1,
    pageSize = 50,
  }) => {
    await ensureTenantPlatformChatAccess({
      tenantId,
    });

    await ensureTenantUser({
      tenantId,
      userId,
    });

    const conversation =
      await getOrCreateTenantConversation({
        tenantId,
      });

    const pagination =
      normalisePagination({
        page,
        pageSize,
      });

    const [
      messages,
      total,
    ] =
      await Promise.all([
        repo.listMessages({
          conversationId:
            conversation.id,

          limit:
            pagination.pageSize,

          offset:
            pagination.offset,
        }),

        repo.countMessages({
          conversationId:
            conversation.id,
        }),
      ]);

    return {
      conversation,

      /*
       * Repository returns newest first.
       * Reverse this page so the frontend can
       * render messages chronologically.
       */
      messages:
        messages.reverse(),

      pagination: {
        page:
          pagination.page,

        pageSize:
          pagination.pageSize,

        total,

        totalPages:
          Math.ceil(
            total /
              pagination.pageSize
          ),
      },
    };
  };


const sendTenantMessage =
  async ({
    tenantId,
    userId,
    body,
  }) => {
    await ensureTenantPlatformChatAccess({
      tenantId,
    });

    const tenantUser =
      await ensureTenantUser({
        tenantId,
        userId,
      });

    const conversation =
      await getOrCreateTenantConversation({
        tenantId,
      });

    ensureConversationOpen(
      conversation
    );

    const message =
      String(
        body.message || ""
      ).trim();

    if (!message) {
      throw httpError(
        422,
        "Message is required"
      );
    }

    const createdMessage =
      await repo.createMessage({
        conversationId:
          conversation.id,

        senderType:
          "tenant_user",

        senderId:
          userId,

        message,
      });


    /*
    |--------------------------------------------------------------------------
    | Realtime: active conversation
    |--------------------------------------------------------------------------
    */

    emitToPlatformChatConversation(
      conversation.id,
      "platform-chat:message:new",
      {
        conversationId:
          conversation.id,

        tenantId,

        message:
          createdMessage,
      }
    );


    /*
    |--------------------------------------------------------------------------
    | Realtime: platform inbox
    |--------------------------------------------------------------------------
    |
    | This lets Superadmin receive a new-message
    | event even if they have not opened this
    | specific conversation room.
    |
    */

    emitToPlatform(
      "platform-chat:inbox:update",
      {
        conversationId:
          conversation.id,

        tenantId,

        sender: {
          id:
            tenantUser.id,

          name:
            [
              tenantUser.first_name,
              tenantUser.middle_name,
              tenantUser.last_name,
            ]
              .filter(Boolean)
              .join(" "),

          roleCode:
            tenantUser.role_code,
        },

        message:
          createdMessage,
      }
    );


    return createdMessage;
  };


const markTenantConversationRead =
  async ({
    tenantId,
    userId,
  }) => {
    await ensureTenantPlatformChatAccess({
      tenantId,
    });

    await ensureTenantUser({
      tenantId,
      userId,
    });

    const conversation =
      await getOrCreateTenantConversation({
        tenantId,
      });

    return repo
      .markConversationRead({
        conversationId:
          conversation.id,

        actorType:
          "tenant_user",

        actorId:
          userId,
      });
  };


const getTenantUnreadCount =
  async ({
    tenantId,
    userId,
  }) => {
    await ensureTenantPlatformChatAccess({
      tenantId,
    });

    await ensureTenantUser({
      tenantId,
      userId,
    });

    const conversation =
      await repo
        .findConversationByTenant({
          tenantId,
        });

    if (!conversation) {
      return {
        unreadCount:
          0,
      };
    }

    const unreadCount =
      await repo
        .countUnreadMessages({
          conversationId:
            conversation.id,

          actorType:
            "tenant_user",

          actorId:
            userId,
        });

    return {
      unreadCount,
    };
  };


/*
|--------------------------------------------------------------------------
| Platform side
|--------------------------------------------------------------------------
*/

const listPlatformConversations =
  async ({
    platformUserId,
    status = null,
    page = 1,
    pageSize = 20,
  }) => {
    await ensurePlatformUser({
      platformUserId,
    });

    const pagination =
      normalisePagination({
        page,
        pageSize,
      });

    const [
      conversations,
      total,
    ] =
      await Promise.all([
        repo.listPlatformConversations({
          platformUserId,

          status:
            status || null,

          limit:
            pagination.pageSize,

          offset:
            pagination.offset,
        }),

        repo.countPlatformConversations({
          status:
            status || null,
        }),
      ]);

    return {
      conversations,

      pagination: {
        page:
          pagination.page,

        pageSize:
          pagination.pageSize,

        total,

        totalPages:
          Math.ceil(
            total /
              pagination.pageSize
          ),
      },
    };
  };


const getPlatformConversation =
  async ({
    platformUserId,
    conversationId,
  }) => {
    await ensurePlatformUser({
      platformUserId,
    });

    const conversation =
      await repo
        .findConversationById({
          conversationId,
        });

    if (!conversation) {
      throw httpError(
        404,
        "Platform chat conversation not found"
      );
    }

    const unreadCount =
      await repo
        .countUnreadMessages({
          conversationId,

          actorType:
            "platform_user",

          actorId:
            platformUserId,
        });

    return {
      ...conversation,

      unread_count:
        unreadCount,
    };
  };


const listPlatformMessages =
  async ({
    platformUserId,
    conversationId,
    page = 1,
    pageSize = 50,
  }) => {
    await ensurePlatformUser({
      platformUserId,
    });

    const conversation =
      await repo
        .findConversationById({
          conversationId,
        });

    if (!conversation) {
      throw httpError(
        404,
        "Platform chat conversation not found"
      );
    }

    const pagination =
      normalisePagination({
        page,
        pageSize,
      });

    const [
      messages,
      total,
    ] =
      await Promise.all([
        repo.listMessages({
          conversationId,

          limit:
            pagination.pageSize,

          offset:
            pagination.offset,
        }),

        repo.countMessages({
          conversationId,
        }),
      ]);

    return {
      conversation,

      messages:
        messages.reverse(),

      pagination: {
        page:
          pagination.page,

        pageSize:
          pagination.pageSize,

        total,

        totalPages:
          Math.ceil(
            total /
              pagination.pageSize
          ),
      },
    };
  };


const sendPlatformMessage =
  async ({
    platformUserId,
    conversationId,
    body,
  }) => {
    const platformUser =
      await ensurePlatformUser({
        platformUserId,
      });

    const conversation =
      await repo
        .findConversationById({
          conversationId,
        });

    if (!conversation) {
      throw httpError(
        404,
        "Platform chat conversation not found"
      );
    }

    ensureConversationOpen(
      conversation
    );

    const message =
      String(
        body.message || ""
      ).trim();

    if (!message) {
      throw httpError(
        422,
        "Message is required"
      );
    }

    const createdMessage =
      await repo.createMessage({
        conversationId,

        senderType:
          "platform_user",

        senderId:
          platformUserId,

        message,
      });


    /*
    |--------------------------------------------------------------------------
    | Realtime: active conversation
    |--------------------------------------------------------------------------
    */

    emitToPlatformChatConversation(
      conversationId,
      "platform-chat:message:new",
      {
        conversationId,

        tenantId:
          conversation.tenant_id,

        message:
          createdMessage,
      }
    );


    /*
    |--------------------------------------------------------------------------
    | Realtime: tenant
    |--------------------------------------------------------------------------
    |
    | Tenant staff receive this even when they
    | are not currently inside the conversation.
    |
    */

    emitToTenant(
      conversation.tenant_id,
      "platform-chat:inbox:update",
      {
        conversationId,

        tenantId:
          conversation.tenant_id,

        sender: {
          id:
            platformUser.id,

          name:
            [
              platformUser.first_name,
              platformUser.last_name,
            ]
              .filter(Boolean)
              .join(" "),

          roleCode:
            platformUser.role_code,
        },

        message:
          createdMessage,
      }
    );


    return createdMessage;
  };


const markPlatformConversationRead =
  async ({
    platformUserId,
    conversationId,
  }) => {
    await ensurePlatformUser({
      platformUserId,
    });

    const conversation =
      await repo
        .findConversationById({
          conversationId,
        });

    if (!conversation) {
      throw httpError(
        404,
        "Platform chat conversation not found"
      );
    }

    return repo
      .markConversationRead({
        conversationId,

        actorType:
          "platform_user",

        actorId:
          platformUserId,
      });
  };


const updatePlatformConversationStatus =
  async ({
    platformUserId,
    conversationId,
    status,
  }) => {
    await ensurePlatformUser({
      platformUserId,
    });

    const conversation =
      await repo
        .findConversationById({
          conversationId,
        });

    if (!conversation) {
      throw httpError(
        404,
        "Platform chat conversation not found"
      );
    }

    if (
      ![
        "open",
        "closed",
      ].includes(status)
    ) {
      throw httpError(
        422,
        "Invalid conversation status"
      );
    }

    await repo
      .updateConversationStatus({
        conversationId,
        status,
      });

    return repo
      .findConversationById({
        conversationId,
      });
  };


const getPlatformUnreadCount =
  async ({
    platformUserId,
  }) => {
    await ensurePlatformUser({
      platformUserId,
    });

    const unreadCount =
      await repo
        .countPlatformUnread({
          platformUserId,
        });

    return {
      unreadCount,
    };
  };


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