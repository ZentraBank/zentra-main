import {
  io,
  type Socket,
} from "socket.io-client";

import {
  getAccessToken,
} from "@/lib/api";

/*
|--------------------------------------------------------------------------
| Socket URL
|--------------------------------------------------------------------------
|
| NEXT_PUBLIC_API_BASE_URL normally looks like:
|
| http://localhost:5000/api/v1
|
| Socket.IO connects to the server itself:
|
| http://localhost:5000
|
*/

const SOCKET_URL = (
  process.env
    .NEXT_PUBLIC_SOCKET_URL ??
  process.env
    .NEXT_PUBLIC_API_BASE_URL ??
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

/*
|--------------------------------------------------------------------------
| Get socket
|--------------------------------------------------------------------------
*/

export function getSocket() {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication token is unavailable.",
    );
  }

  /*
   * Create the Socket.IO client
   * only once.
   */
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

  /*
   * The access token may have been
   * refreshed since the socket was
   * created.
   *
   * Always replace socket.auth with
   * the latest in-memory token.
   */
  socket.auth = {
    accessToken:
      token,
  };

  return socket;
}

/*
|--------------------------------------------------------------------------
| Connect
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Reconnect with current token
|--------------------------------------------------------------------------
|
| Useful after an access-token refresh.
|
*/

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
      getAccessToken(),
  };

  activeSocket.connect();

  return activeSocket;
}

/*
|--------------------------------------------------------------------------
| Disconnect
|--------------------------------------------------------------------------
*/

export function disconnectSocket() {
  if (!socket) {
    return;
  }

  socket.disconnect();

  socket = null;
}

/*
|--------------------------------------------------------------------------
| Is connected
|--------------------------------------------------------------------------
*/

export function isSocketConnected() {
  return Boolean(
    socket?.connected,
  );
}