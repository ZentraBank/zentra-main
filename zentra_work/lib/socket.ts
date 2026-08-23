"use client";

import {
  io,
  type Socket,
} from "socket.io-client";

import {
  authToken,
} from "@/lib/auth-token";

const SOCKET_URL =
  (
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    "http://localhost:5000"
  ).replace(/\/$/, "");

let socket:
  | Socket
  | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(
      SOCKET_URL,
      {
        autoConnect: false,

        withCredentials:
          true,

        transports: [
          "websocket",
          "polling",
        ],

        auth: (
          callback,
        ) => {
          callback({
            accessToken:
              authToken.get(),
          });
        },
      },
    );
  }

  return socket;
}

export function connectSocket() {
  const current =
    getSocket();

  if (
    !current.connected
  ) {
    current.connect();
  }

  return current;
}

export function disconnectSocket() {
  if (!socket) {
    return;
  }

  socket.disconnect();
}