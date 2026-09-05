const {
  Server,
} = require("socket.io");

const jwt =
  require("jsonwebtoken");

const env =
  require("../config/env");

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

const platformChatRepository =
  require(
    "../modules/platform-chat/platform-chat.repository"
  );

let io = null;


/*
|--------------------------------------------------------------------------
| Rooms
|--------------------------------------------------------------------------
*/

const conversationRoom = (
  conversationId
) =>
  `conversation:${conversationId}`;

const platformChatRoom = (
  conversationId
) =>
  `platform-chat:${conversationId}`;

const userRoom = (
  userId
) =>
  `user:${userId}`;

const tenantRoom = (
  tenantId
) =>
  `tenant:${tenantId}`;

const platformUserRoom = (
  userId
) =>
  `platform-user:${userId}`;

const platformRoom =
  () => "platform";


/*
|--------------------------------------------------------------------------
| Token helpers
|--------------------------------------------------------------------------
*/

const verifyPlatformAccessToken =
  (token) => {
    const payload =
      jwt.verify(
        token,
        env.jwt.accessSecret,
        {
          issuer:
            env.appName,

          audience:
            "zentrabank-platform",
        }
      );

    if (
      payload.tokenType !==
      "access"
    ) {
      const error =
        new Error(
          "The supplied token is not an access token"
        );

      error.name =
        "JsonWebTokenError";

      throw error;
    }

    if (
      payload.scope !==
      "platform"
    ) {
      const error =
        new Error(
          "The supplied token is not a platform access token"
        );

      error.name =
        "JsonWebTokenError";

      throw error;
    }

    return payload;
  };


/*
|--------------------------------------------------------------------------
| Normal tenant/client chat access
|--------------------------------------------------------------------------
*/

const canAccessConversation =
  async ({
    socket,
    conversationId,
  }) => {
    if (
      socket.auth.authType !==
      "tenant"
    ) {
      return false;
    }

    const {
      userId,
      tenantId,
      roleCode,
    } =
      socket.auth;

    const conversation =
      await chatRepository
        .findConversationById({
          tenantId,
          conversationId,
        });

    if (!conversation) {
      return false;
    }

    /*
     * Client users can only join
     * their own conversation.
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
     * Tenant staff can join normal
     * conversations belonging to
     * their tenant.
     */
    return (
      conversation.tenant_id ===
      tenantId
    );
  };


/*
|--------------------------------------------------------------------------
| Platform chat access
|--------------------------------------------------------------------------
*/

const canAccessPlatformChat =
  async ({
    socket,
    conversationId,
  }) => {
    const conversation =
      await platformChatRepository
        .findConversationById({
          conversationId,
        });

    if (!conversation) {
      return false;
    }

    /*
     * Zentra platform staff.
     *
     * The socket must have the same read
     * permission used by the HTTP routes.
     */
    if (
      socket.auth.authType ===
      "platform"
    ) {
      return (
        socket.auth.permissions
          ?.includes(
            "platform.chat.read"
          ) === true
      );
    }

    /*
     * Tenant staff.
     *
     * The platform conversation must belong
     * to the authenticated tenant.
     */
    if (
      socket.auth.authType ===
      "tenant"
    ) {
      return (
        conversation.tenant_id ===
        socket.auth.tenantId &&
        socket.auth.roleCode !==
          "client" &&
        socket.auth.roleCode !==
          "customer"
      );
    }

    return false;
  };


/*
|--------------------------------------------------------------------------
| Initialise Socket.IO
|--------------------------------------------------------------------------
*/

const initialiseSocket = (
  httpServer
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
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
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


        /*
        |--------------------------------------------------------------------------
        | Determine token audience
        |--------------------------------------------------------------------------
        |
        | jwt.decode() is only used to decide which
        | strict verifier to call.
        |
        | Authentication itself is still performed
        | by jwt.verify().
        |
        */

        const decoded =
          jwt.decode(
            token,
            {
              complete: true,
            }
          );

        const audience =
          decoded?.payload?.aud;


        /*
        |--------------------------------------------------------------------------
        | Platform authentication
        |--------------------------------------------------------------------------
        */

        if (
          audience ===
          "zentrabank-platform"
        ) {
          const payload =
            verifyPlatformAccessToken(
              token
            );

          if (!payload?.sub) {
            return next(
              new Error(
                "Invalid platform access token"
              )
            );
          }

          const platformUser =
            await platformChatRepository
              .findActivePlatformUser({
                platformUserId:
                  payload.sub,
              });

          if (!platformUser) {
            return next(
              new Error(
                "Active platform user required"
              )
            );
          }

          socket.auth = {
            authType:
              "platform",

            userId:
              platformUser.id,

            tenantId:
              null,

            roleCode:
              platformUser.role_code,

            permissions:
              Array.isArray(
                payload.permissions
              )
                ? payload.permissions
                : [],
          };

          return next();
        }


        /*
        |--------------------------------------------------------------------------
        | Tenant/client authentication
        |--------------------------------------------------------------------------
        */

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
          authType:
            "tenant",

          userId:
            context.id,

          tenantId:
            context.tenant_id,

          roleCode:
            context.role_code,

          permissions:
            Array.isArray(
              payload.permissions
            )
              ? payload.permissions
              : [],
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
        authType,
        userId,
        tenantId,
        roleCode,
      } =
        socket.auth;


      /*
      |--------------------------------------------------------------------------
      | Join identity rooms
      |--------------------------------------------------------------------------
      */

      if (
        authType ===
        "platform"
      ) {
        socket.join(
          platformUserRoom(
            userId
          )
        );

        socket.join(
          platformRoom()
        );
      } else {
        socket.join(
          userRoom(
            userId
          )
        );

        socket.join(
          tenantRoom(
            tenantId
          )
        );
      }


      console.log(
        `Realtime connected: ${userId} (${authType}:${roleCode})`
      );


      /*
      |--------------------------------------------------------------------------
      | Normal tenant/client conversation join
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

            if (!conversationId) {
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
                success: true,
                conversationId,
              });
            }
          } catch (error) {
            if (
              typeof callback ===
              "function"
            ) {
              callback({
                success: false,

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
      | Normal conversation leave
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

          if (conversationId) {
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
              success: true,
              conversationId,
            });
          }
        }
      );


      /*
      |--------------------------------------------------------------------------
      | Normal chat typing
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

            if (!conversationId) {
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

            if (!conversationId) {
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
      | Platform chat join
      |--------------------------------------------------------------------------
      */

      socket.on(
        "platform-chat:conversation:join",
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

            if (!conversationId) {
              throw new Error(
                "Conversation ID is required"
              );
            }

            const allowed =
              await canAccessPlatformChat({
                socket,
                conversationId,
              });

            if (!allowed) {
              throw new Error(
                "You do not have access to this platform conversation"
              );
            }

            socket.join(
              platformChatRoom(
                conversationId
              )
            );

            if (
              typeof callback ===
              "function"
            ) {
              callback({
                success: true,
                conversationId,
              });
            }
          } catch (error) {
            if (
              typeof callback ===
              "function"
            ) {
              callback({
                success: false,

                message:
                  error?.message ||
                  "Unable to join platform conversation",
              });

              return;
            }

            socket.emit(
              "platform-chat:error",
              {
                message:
                  error?.message ||
                  "Unable to join platform conversation",
              }
            );
          }
        }
      );


      /*
      |--------------------------------------------------------------------------
      | Platform chat leave
      |--------------------------------------------------------------------------
      */

      socket.on(
        "platform-chat:conversation:leave",
        (
          payload = {},
          callback
        ) => {
          const conversationId =
            String(
              payload.conversationId ||
                ""
            ).trim();

          if (conversationId) {
            socket.leave(
              platformChatRoom(
                conversationId
              )
            );
          }

          if (
            typeof callback ===
            "function"
          ) {
            callback({
              success: true,
              conversationId,
            });
          }
        }
      );


      /*
      |--------------------------------------------------------------------------
      | Platform chat typing
      |--------------------------------------------------------------------------
      */

      socket.on(
        "platform-chat:typing:start",
        async (
          payload = {}
        ) => {
          try {
            const conversationId =
              String(
                payload.conversationId ||
                  ""
              ).trim();

            if (!conversationId) {
              return;
            }

            const allowed =
              await canAccessPlatformChat({
                socket,
                conversationId,
              });

            if (!allowed) {
              return;
            }

            socket
              .to(
                platformChatRoom(
                  conversationId
                )
              )
              .emit(
                "platform-chat:typing:start",
                {
                  conversationId,
                  userId,
                  authType,
                  roleCode,
                }
              );
          } catch (error) {
            console.error(
              "[Platform Chat] Typing start failed:",
              error.message
            );
          }
        }
      );


      socket.on(
        "platform-chat:typing:stop",
        async (
          payload = {}
        ) => {
          try {
            const conversationId =
              String(
                payload.conversationId ||
                  ""
              ).trim();

            if (!conversationId) {
              return;
            }

            const allowed =
              await canAccessPlatformChat({
                socket,
                conversationId,
              });

            if (!allowed) {
              return;
            }

            socket
              .to(
                platformChatRoom(
                  conversationId
                )
              )
              .emit(
                "platform-chat:typing:stop",
                {
                  conversationId,
                  userId,
                  authType,
                  roleCode,
                }
              );
          } catch (error) {
            console.error(
              "[Platform Chat] Typing stop failed:",
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
            `Realtime disconnected: ${userId} (${authType})`
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
| Existing emitters
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
| Platform emitters
|--------------------------------------------------------------------------
*/

const emitToPlatform =
  (
    event,
    payload
  ) => {
    if (!io) {
      return;
    }

    io
      .to(
        platformRoom()
      )
      .emit(
        event,
        payload
      );
  };


const emitToPlatformUser =
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
        platformUserRoom(
          userId
        )
      )
      .emit(
        event,
        payload
      );
  };


const emitToPlatformChatConversation =
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
        platformChatRoom(
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

  emitToPlatform,
  emitToPlatformUser,
  emitToPlatformChatConversation,
};