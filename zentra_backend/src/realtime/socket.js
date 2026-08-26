const {
  Server,
} = require("socket.io");

const {
  verifyAccessToken,
} = require("../utils/jwt");

const authRepository =
  require(
    "../modules/auth/auth.repository"
  );

const chatRepository =
  require(
    "../modules/chat/chat.repository"
  );

let io = null;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const conversationRoom = (
  conversationId
) =>
  `conversation:${conversationId}`;

const userRoom = (
  userId
) =>
  `user:${userId}`;

const tenantRoom = (
  tenantId
) =>
  `tenant:${tenantId}`;

/*
|--------------------------------------------------------------------------
| Verify access to a conversation
|--------------------------------------------------------------------------
*/

const canAccessConversation =
  async ({
    socket,
    conversationId,
  }) => {
    const {
      userId,
      tenantId,
      roleCode,
    } =
      socket.auth;

    const conversation =
      await chatRepository.findConversationById({
        tenantId,
        conversationId,
      });

    if (!conversation) {
      return false;
    }

    /*
     * A client may only join their
     * own conversation.
     */
    if (
      roleCode === "client"
    ) {
      return (
        conversation.client_user_id ===
        userId
      );
    }

    /*
     * Tenant-side authenticated
     * members can join conversations
     * belonging to their tenant.
     *
     * Route permissions still control
     * who can read/send via the API.
     */
    return (
      conversation.tenant_id ===
      tenantId
    );
  };

/*
|--------------------------------------------------------------------------
| Initialise Socket.IO
|--------------------------------------------------------------------------
*/

const initialiseSocket = (
  httpServer,
) => {
  io = new Server(
    httpServer,
    {
      cors: {
        origin: true,
        credentials: true,
      },
    }
  );

  /*
   * Authenticate every socket before
   * allowing it to connect.
   */
  io.use(
    async (
      socket,
      next
    ) => {
      try {
        const token =
          socket.handshake.auth
            ?.accessToken;

        if (!token) {
          return next(
            new Error(
              "Authentication required"
            )
          );
        }

        const payload =
          verifyAccessToken(
            token
          );

        if (
          !payload?.sub ||
          !payload?.tenantId
        ) {
          return next(
            new Error(
              "Invalid access token"
            )
          );
        }

        const context =
          await authRepository
            .findAuthContextByIdentity({
              userId:
                payload.sub,

              tenantId:
                payload.tenantId,
            });

        if (!context) {
          return next(
            new Error(
              "Authenticated user not found"
            )
          );
        }

        if (
          context.user_status !==
            "active" ||
          context.membership_status !==
            "active" ||
          context.tenant_status !==
            "active"
        ) {
          return next(
            new Error(
              "Account is not active"
            )
          );
        }

        socket.auth = {
          userId:
            context.id,

          tenantId:
            context.tenant_id,

          roleCode:
            context.role_code,
        };

        return next();
      } catch (error) {
        return next(
          new Error(
            error?.message ||
              "Socket authentication failed"
          )
        );
      }
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  */

  io.on(
    "connection",
    (
      socket
    ) => {
      const {
        userId,
        tenantId,
        roleCode,
      } =
        socket.auth;

      /*
       * Private user room.
       */
      socket.join(
        userRoom(
          userId
        )
      );

      /*
       * Tenant-wide room.
       */
      socket.join(
        tenantRoom(
          tenantId
        )
      );

      console.log(
        `Realtime connected: ${userId} (${roleCode})`
      );

      /*
      |--------------------------------------------------------------------------
      | Join chat conversation
      |--------------------------------------------------------------------------
      */

      socket.on(
        "chat:conversation:join",
        async (
          payload = {},
          callback
        ) => {
          try {
            const conversationId =
              String(
                payload.conversationId ||
                ""
              ).trim();

            if (
              !conversationId
            ) {
              throw new Error(
                "Conversation ID is required"
              );
            }

            const allowed =
              await canAccessConversation({
                socket,
                conversationId,
              });

            if (!allowed) {
              throw new Error(
                "You do not have access to this conversation"
              );
            }

            socket.join(
              conversationRoom(
                conversationId
              )
            );

            if (
              typeof callback ===
              "function"
            ) {
              callback({
                success:
                  true,

                conversationId,
              });
            }
          } catch (error) {
            if (
              typeof callback ===
              "function"
            ) {
              callback({
                success:
                  false,

                message:
                  error?.message ||
                  "Unable to join conversation",
              });

              return;
            }

            socket.emit(
              "chat:error",
              {
                message:
                  error?.message ||
                  "Unable to join conversation",
              }
            );
          }
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Leave chat conversation
      |--------------------------------------------------------------------------
      */

      socket.on(
        "chat:conversation:leave",
        (
          payload = {},
          callback
        ) => {
          const conversationId =
            String(
              payload.conversationId ||
              ""
            ).trim();

          if (
            conversationId
          ) {
            socket.leave(
              conversationRoom(
                conversationId
              )
            );
          }

          if (
            typeof callback ===
            "function"
          ) {
            callback({
              success:
                true,

              conversationId,
            });
          }
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Typing
      |--------------------------------------------------------------------------
      */

      socket.on(
        "chat:typing:start",
        async (
          payload = {}
        ) => {
          try {
            const conversationId =
              String(
                payload.conversationId ||
                ""
              ).trim();

            if (
              !conversationId
            ) {
              return;
            }

            const allowed =
              await canAccessConversation({
                socket,
                conversationId,
              });

            if (!allowed) {
              return;
            }

            socket
              .to(
                conversationRoom(
                  conversationId
                )
              )
              .emit(
                "chat:typing:start",
                {
                  conversationId,

                  userId,

                  roleCode,
                }
              );
          } catch (error) {
            console.error(
              "[Chat] Typing start failed:",
              error.message
            );
          }
        }
      );

      socket.on(
        "chat:typing:stop",
        async (
          payload = {}
        ) => {
          try {
            const conversationId =
              String(
                payload.conversationId ||
                ""
              ).trim();

            if (
              !conversationId
            ) {
              return;
            }

            const allowed =
              await canAccessConversation({
                socket,
                conversationId,
              });

            if (!allowed) {
              return;
            }

            socket
              .to(
                conversationRoom(
                  conversationId
                )
              )
              .emit(
                "chat:typing:stop",
                {
                  conversationId,

                  userId,

                  roleCode,
                }
              );
          } catch (error) {
            console.error(
              "[Chat] Typing stop failed:",
              error.message
            );
          }
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Disconnect
      |--------------------------------------------------------------------------
      */

      socket.on(
        "disconnect",
        () => {
          console.log(
            `Realtime disconnected: ${userId}`
          );
        }
      );
    }
  );

  return io;
};

/*
|--------------------------------------------------------------------------
| Socket access
|--------------------------------------------------------------------------
*/

const getIo =
  () => {
    if (!io) {
      throw new Error(
        "Socket.IO has not been initialised"
      );
    }

    return io;
  };

/*
|--------------------------------------------------------------------------
| Emitters
|--------------------------------------------------------------------------
*/

const emitToUser =
  (
    userId,
    event,
    payload
  ) => {
    if (!io) {
      return;
    }

    io
      .to(
        userRoom(
          userId
        )
      )
      .emit(
        event,
        payload
      );
  };

const emitToTenant =
  (
    tenantId,
    event,
    payload
  ) => {
    if (!io) {
      return;
    }

    io
      .to(
        tenantRoom(
          tenantId
        )
      )
      .emit(
        event,
        payload
      );
  };

const emitToConversation =
  (
    conversationId,
    event,
    payload
  ) => {
    if (!io) {
      return;
    }

    io
      .to(
        conversationRoom(
          conversationId
        )
      )
      .emit(
        event,
        payload
      );
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  initialiseSocket,

  getIo,

  emitToUser,
  emitToTenant,
  emitToConversation,
};