import {
  io,
  type Socket,
} from "socket.io-client";

import {
  authToken,
} from "@/lib/auth-token";

const SOCKET_URL = (
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000"
)
  .replace(
    /\/api\/v1\/?$/,
    "",
  )
  .replace(
    /\/$/,
    "",
  );

let socket:
  | Socket
  | null = null;

export function getSocket() {
  const token =
    authToken.get();

  if (!token) {
    throw new Error(
      "Authentication token is unavailable.",
    );
  }

  if (!socket) {
    socket = io(
      SOCKET_URL,
      {
        autoConnect:
          false,

        withCredentials:
          true,

        transports: [
          "websocket",
          "polling",
        ],

        auth: {
          accessToken:
            token,
        },
      },
    );

    return socket;
  }

  socket.auth = {
    accessToken:
      token,
  };

  return socket;
}

export function connectSocket() {
  const activeSocket =
    getSocket();

  if (
    !activeSocket.connected
  ) {
    activeSocket.connect();
  }

  return activeSocket;
}

export function reconnectSocket() {
  const activeSocket =
    getSocket();

  if (
    activeSocket.connected
  ) {
    activeSocket.disconnect();
  }

  activeSocket.auth = {
    accessToken:
      authToken.get(),
  };

  activeSocket.connect();

  return activeSocket;
}

export function disconnectSocket() {
  if (!socket) {
    return;
  }

  socket.disconnect();

  socket = null;
}

export function isSocketConnected() {
  return Boolean(
    socket?.connected,
  );
}