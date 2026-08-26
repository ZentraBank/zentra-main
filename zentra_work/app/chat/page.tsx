"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCheck,
  Circle,
  Loader2,
  Send,
  X,
} from "lucide-react";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  chatService,
} from "@/services/chat.service";

import {
  connectSocket,
} from "@/lib/socket";

import type {
  ClientChatConversation,
  ClientChatMessage,
} from "@/services/chat.service";

export default function ClientChatPage() {
  const [
    conversation,
    setConversation,
  ] =
    useState<
      ClientChatConversation | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      ClientChatMessage[]
    >([]);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    connected,
    setConnected,
  ] =
    useState(false);

  const [
    tenantTyping,
    setTenantTyping,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const typingTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /*
  |--------------------------------------------------------------------------
  | Add unique message
  |--------------------------------------------------------------------------
  */

  const addMessage =
    useCallback(
      (
        incoming:
          ClientChatMessage,
      ) => {
        setMessages(
          (current) => {
            if (
              current.some(
                (item) =>
                  item.id ===
                  incoming.id,
              )
            ) {
              return current;
            }

            return [
              ...current,
              incoming,
            ];
          },
        );
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await chatService.listMyMessages({
              page: 1,
              pageSize: 100,
            });

          setConversation(
            result.conversation,
          );

          setMessages(
            result.messages,
          );

          const last =
            result.messages[
              result.messages.length -
                1
            ];

          if (last) {
            await chatService.markRead(
              last.id,
            );
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load chat.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    bottomRef.current
      ?.scrollIntoView({
        behavior:
          loading
            ? "auto"
            : "smooth",
      });
  }, [
    messages,
    tenantTyping,
    loading,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Realtime
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !conversation?.id
    ) {
      return;
    }

    let socket;

    try {
      socket =
        connectSocket();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to realtime chat.",
      );

      return;
    }

    const conversationId =
      conversation.id;

    const handleConnect =
      () => {
        setConnected(
          true,
        );

        socket.emit(
          "chat:conversation:join",
          {
            conversationId,
          },
          (
            result: {
              success:
                boolean;

              message?:
                string;
            },
          ) => {
            if (
              !result?.success
            ) {
              setError(
                result?.message ||
                  "Unable to join chat.",
              );
            }
          },
        );
      };

    const handleDisconnect =
      () => {
        setConnected(
          false,
        );
      };

    const handleNewMessage =
      async (
        payload: {
          conversationId:
            string;

          message:
            ClientChatMessage;
        },
      ) => {
        if (
          payload
            .conversationId !==
          conversationId
        ) {
          return;
        }

        addMessage(
          payload.message,
        );

        if (
          payload.message
            .sender_type ===
          "tenant"
        ) {
          try {
            await chatService.markRead(
              payload.message.id,
            );
          } catch {
            // Don't break chat because
            // a read receipt failed.
          }
        }
      };

    const handleTypingStart =
      (
        payload: {
          conversationId:
            string;

          roleCode?:
            string;
        },
      ) => {
        if (
          payload
            .conversationId ===
            conversationId &&
          payload.roleCode !==
            "client"
        ) {
          setTenantTyping(
            true,
          );
        }
      };

    const handleTypingStop =
      (
        payload: {
          conversationId:
            string;
        },
      ) => {
        if (
          payload
            .conversationId ===
          conversationId
        ) {
          setTenantTyping(
            false,
          );
        }
      };

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "disconnect",
      handleDisconnect,
    );

    socket.on(
      "chat:message:new",
      handleNewMessage,
    );

    socket.on(
      "chat:typing:start",
      handleTypingStart,
    );

    socket.on(
      "chat:typing:stop",
      handleTypingStop,
    );

    if (
      socket.connected
    ) {
      handleConnect();
    }

    return () => {
      socket.emit(
        "chat:conversation:leave",
        {
          conversationId,
        },
      );

      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      socket.off(
        "chat:message:new",
        handleNewMessage,
      );

      socket.off(
        "chat:typing:start",
        handleTypingStart,
      );

      socket.off(
        "chat:typing:stop",
        handleTypingStop,
      );
    };
  }, [
    conversation?.id,
    addMessage,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Typing
  |--------------------------------------------------------------------------
  */

  const handleTyping =
    (
      value: string,
    ) => {
      setMessage(
        value,
      );

      if (
        !conversation?.id
      ) {
        return;
      }

      try {
        const socket =
          connectSocket();

        socket.emit(
          "chat:typing:start",
          {
            conversationId:
              conversation.id,
          },
        );

        if (
          typingTimer.current
        ) {
          clearTimeout(
            typingTimer.current,
          );
        }

        typingTimer.current =
          setTimeout(
            () => {
              socket.emit(
                "chat:typing:stop",
                {
                  conversationId:
                    conversation.id,
                },
              );
            },
            900,
          );
      } catch {
        // Chat sending via REST
        // still works.
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Send
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const trimmed =
        message.trim();

      if (
        !trimmed ||
        sending
      ) {
        return;
      }

      if (
        conversation?.status ===
        "archived"
      ) {
        setError(
          "This conversation has been archived.",
        );

        return;
      }

      setSending(
        true,
      );

      setError("");

      try {
        const created =
          await chatService.sendMessage(
            trimmed,
          );

        addMessage(
          created,
        );

        setMessage(
          "",
        );

        if (
          conversation
        ) {
          try {
            const socket =
              connectSocket();

            socket.emit(
              "chat:typing:stop",
              {
                conversationId:
                  conversation.id,
              },
            );
          } catch {
            // ignored
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to send message.",
        );
      } finally {
        setSending(
          false,
        );
      }
    };

  const grouped =
    useMemo(
      () =>
        groupMessagesByDay(
          messages,
        ),
      [messages],
    );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#13813d]">
        <Loader2
          size={30}
          className="animate-spin text-white"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#13813d] px-4 py-5 text-[#292929]">
      <section className="mx-auto flex h-[calc(100vh-40px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[22px] bg-white shadow-xl">
        <header className="flex shrink-0 items-center gap-3 border-b border-black/5 px-4 py-4">
          <Link
            href="/dashboard"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#F4F6F8] text-black/55"
          >
            <ArrowLeft
              size={18}
            />
          </Link>

          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#EAF8EF] text-[#16884B]">
            <span className="text-[13px] font-black">
              Z
            </span>
          </div>

          <div>
            <p className="text-[13px] font-black">
              Zentra Support
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <Circle
                size={7}
                className={
                  connected
                    ? "fill-green-500 text-green-500"
                    : "fill-gray-300 text-gray-300"
                }
              />

              <p className="text-[8px] text-black/35">
                {tenantTyping
                  ? "Support is typing..."
                  : connected
                    ? "Online"
                    : "Connecting..."}
              </p>
            </div>
          </div>
        </header>

        {conversation?.status ===
          "archived" && (
          <div className="bg-gray-100 px-4 py-2 text-center text-[9px] font-semibold text-gray-600">
            This conversation has
            been archived.
          </div>
        )}

        {error && (
          <div className="relative bg-red-50 px-4 py-2.5 pr-10 text-[9px] font-semibold text-red-700">
            {error}

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-[#F7F8FA] px-4 py-5">
          {messages.length ===
          0 ? (
            <div className="grid h-full place-items-center">
              <div className="max-w-[270px] text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#EAF8EF] text-[#16884B]">
                  <span className="text-[18px] font-black">
                    Z
                  </span>
                </div>

                <p className="mt-4 text-[14px] font-black">
                  How can we help?
                </p>

                <p className="mt-2 text-[9px] leading-4 text-black/40">
                  Send us a message
                  and a member of the
                  support team can
                  respond here.
                </p>
              </div>
            </div>
          ) : (
            <>
              {grouped.map(
                (
                  group,
                ) => (
                  <div
                    key={
                      group.dateKey
                    }
                  >
                    <DateDivider
                      label={
                        group.label
                      }
                    />

                    {group.messages.map(
                      (
                        item,
                      ) => (
                        <ClientMessageBubble
                          key={
                            item.id
                          }
                          message={
                            item
                          }
                        />
                      ),
                    )}
                  </div>
                ),
              )}

              {tenantTyping && (
                <div className="mb-4 flex justify-start">
                  <div className="rounded-[16px] rounded-bl-[4px] bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <TypingDot />
                      <TypingDot
                        delay="150ms"
                      />
                      <TypingDot
                        delay="300ms"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div
                ref={
                  bottomRef
                }
              />
            </>
          )}
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="shrink-0 border-t border-black/5 bg-white px-4 py-4"
        >
          <div className="flex items-end gap-3">
            <textarea
              rows={1}
              value={
                message
              }
              disabled={
                conversation?.status ===
                  "archived" ||
                sending
              }
              onChange={(
                event,
              ) =>
                handleTyping(
                  event.target.value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  event.currentTarget.form
                    ?.requestSubmit();
                }
              }}
              placeholder="Type a message..."
              className="max-h-[120px] min-h-[46px] flex-1 resize-none rounded-[14px] border border-black/10 bg-[#F8F9FA] px-4 py-3 text-[11px] leading-5 outline-none"
            />

            <button
              type="submit"
              disabled={
                sending ||
                !message.trim() ||
                conversation?.status ===
                  "archived"
              }
              className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[13px] bg-[#1D4ED8] text-white disabled:opacity-40"
            >
              {sending ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Send
                  size={17}
                />
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function ClientMessageBubble({
  message,
}: {
  message:
    ClientChatMessage;
}) {
  const mine =
    message.sender_type ===
    "client";

  return (
    <div
      className={`mb-3 flex ${
        mine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div className="max-w-[80%]">
        <div
          className={`rounded-[17px] px-4 py-3 text-[10px] leading-[17px] shadow-sm ${
            mine
              ? "rounded-br-[4px] bg-[#1D4ED8] text-white"
              : "rounded-bl-[4px] bg-white text-[#333]"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.body}
          </p>
        </div>

        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[7px] text-black/25 ${
            mine
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <span>
            {formatMessageTime(
              message.created_at,
            )}
          </span>

          {mine && (
            <CheckCheck
              size={10}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DateDivider({
  label,
}: {
  label: string;
}) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-black/5" />

      <span className="rounded-full bg-white px-3 py-1 text-[7px] font-bold text-black/30 shadow-sm">
        {label}
      </span>

      <div className="h-px flex-1 bg-black/5" />
    </div>
  );
}

function TypingDot({
  delay = "0ms",
}: {
  delay?: string;
}) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/30"
      style={{
        animationDelay:
          delay,
      }}
    />
  );
}

function formatMessageTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(date);
}

function groupMessagesByDay(
  messages:
    ClientChatMessage[],
) {
  const groups =
    new Map<
      string,
      ClientChatMessage[]
    >();

  for (
    const message
    of messages
  ) {
    const date =
      new Date(
        message.created_at,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      continue;
    }

    const key =
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    const current =
      groups.get(
        key,
      ) ?? [];

    current.push(
      message,
    );

    groups.set(
      key,
      current,
    );
  }

  return Array.from(
    groups.entries(),
  ).map(
    ([
      dateKey,
      items,
    ]) => ({
      dateKey,

      label:
        formatDayLabel(
          new Date(
            items[0].created_at,
          ),
        ),

      messages:
        items,
    }),
  );
}

function formatDayLabel(
  date: Date,
) {
  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

  const target =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

  const difference =
    (
      today.getTime() -
      target.getTime()
    ) /
    86400000;

  if (
    difference === 0
  ) {
    return "Today";
  }

  if (
    difference === 1
  ) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(date);
}