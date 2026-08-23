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

let io = null;

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

  io.on(
    "connection",
    (socket) => {
      const {
        userId,
        tenantId,
      } =
        socket.auth;

      /*
       * Private room for a
       * particular user.
       */
      socket.join(
        `user:${userId}`
      );

      /*
       * Tenant-level room will be
       * useful later for tenant-wide
       * live events.
       */
      socket.join(
        `tenant:${tenantId}`
      );

      console.log(
        `Realtime connected: ${userId}`
      );

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

const getIo = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialised"
    );
  }

  return io;
};

const emitToUser = (
  userId,
  event,
  payload
) => {
  if (!io) {
    return;
  }

  io
    .to(
      `user:${userId}`
    )
    .emit(
      event,
      payload
    );
};

const emitToTenant = (
  tenantId,
  event,
  payload
) => {
  if (!io) {
    return;
  }

  io
    .to(
      `tenant:${tenantId}`
    )
    .emit(
      event,
      payload
    );
};

module.exports = {
  initialiseSocket,
  getIo,
  emitToUser,
  emitToTenant,
};