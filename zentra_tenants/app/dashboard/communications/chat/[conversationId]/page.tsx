"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCheck,
  Circle,
  Loader2,
  MoreVertical,
  Send,
  UserRound,
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
  useParams,
} from "next/navigation";

import {
  chatService,
} from "@/services/chat.service";

import {
  connectSocket,
} from "@/lib/socket";

import type {
  ChatConversation,
  ChatMessage,
} from "@/services/chat.service";

export default function TenantConversationPage() {
  const {
    conversationId,
  } =
    useParams<{
      conversationId:
        string;
    }>();

  const [
    conversation,
    setConversation,
  ] =
    useState<
      ChatConversation | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
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
    error,
    setError,
  ] =
    useState("");

  const [
    connected,
    setConnected,
  ] =
    useState(false);

  const [
    clientTyping,
    setClientTyping,
  ] =
    useState(false);

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const [
    changingStatus,
    setChangingStatus,
  ] =
    useState(false);

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
  | Message helpers
  |--------------------------------------------------------------------------
  */

  const addMessage =
    useCallback(
      (
        incoming:
          ChatMessage,
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

  const scrollToBottom =
    useCallback(
      (
        behavior:
          ScrollBehavior =
          "smooth",
      ) => {
        bottomRef.current
          ?.scrollIntoView({
            behavior,
          });
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | Load initial conversation
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        if (
          !conversationId
        ) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const [
            conversationResult,
            messageResult,
          ] =
            await Promise.all([
              chatService.listTenantConversations({
                page: 1,
                pageSize: 100,
              }),

              chatService.listTenantMessages(
                conversationId,
                {
                  page: 1,
                  pageSize: 100,
                },
              ),
            ]);

          const found =
            conversationResult.conversations.find(
              (
                item,
              ) =>
                item.id ===
                conversationId,
            );

          if (!found) {
            throw new Error(
              "Conversation not found.",
            );
          }

          setConversation(
            found,
          );

          setMessages(
            messageResult.messages,
          );

          const last =
            messageResult.messages[
              messageResult
                .messages
                .length -
                1
            ];

          await chatService.markTenantRead(
            conversationId,
            last?.id ??
              null,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load conversation.",
          );
        } finally {
          setLoading(false);
        }
      },
      [conversationId],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Auto scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      messages.length ===
      0
    ) {
      return;
    }

    scrollToBottom(
      loading
        ? "auto"
        : "smooth",
    );
  }, [
    messages,
    loading,
    scrollToBottom,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Socket.IO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !conversationId
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
                  "Unable to join conversation.",
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

    const handleMessage =
      async (
        payload: {
          conversationId:
            string;

          message:
            ChatMessage;
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

        /*
         * Only messages from the
         * client need marking read
         * by the tenant.
         */
        if (
          payload.message
            .sender_type ===
          "client"
        ) {
          try {
            await chatService.markTenantRead(
              conversationId,
              payload.message.id,
            );
          } catch {
            // UI should not fail
            // because read receipt
            // could not be saved.
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
          payload.roleCode ===
            "client"
        ) {
          setClientTyping(
            true,
          );
        }
      };

    const handleTypingStop =
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
          conversationId
        ) {
          setClientTyping(
            false,
          );
        }
      };

    const handleConversationUpdate =
      (
        payload: {
          conversation?:
            ChatConversation;
        },
      ) => {
        if (
          payload
            .conversation?.id ===
          conversationId
        ) {
          setConversation(
            payload.conversation,
          );
        }
      };

    const handleError =
      (
        payload: {
          message?:
            string;
        },
      ) => {
        if (
          payload?.message
        ) {
          setError(
            payload.message,
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
      handleMessage,
    );

    socket.on(
      "chat:typing:start",
      handleTypingStart,
    );

    socket.on(
      "chat:typing:stop",
      handleTypingStop,
    );

    socket.on(
      "chat:conversation:updated",
      handleConversationUpdate,
    );

    socket.on(
      "chat:error",
      handleError,
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
        handleMessage,
      );

      socket.off(
        "chat:typing:start",
        handleTypingStart,
      );

      socket.off(
        "chat:typing:stop",
        handleTypingStop,
      );

      socket.off(
        "chat:conversation:updated",
        handleConversationUpdate,
      );

      socket.off(
        "chat:error",
        handleError,
      );
    };
  }, [
    conversationId,
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
        !conversationId
      ) {
        return;
      }

      try {
        const socket =
          connectSocket();

        socket.emit(
          "chat:typing:start",
          {
            conversationId,
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
                  conversationId,
                },
              );
            },
            900,
          );
      } catch {
        // Sending through REST
        // still works without
        // typing indicators.
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
        !conversationId ||
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
        /*
         * REST remains the source
         * of truth. Socket.IO will
         * also deliver this message
         * back to joined clients.
         */
        const created =
          await chatService.sendTenantMessage(
            conversationId,
            trimmed,
          );

        addMessage(
          created,
        );

        setMessage(
          "",
        );

        try {
          const socket =
            connectSocket();

          socket.emit(
            "chat:typing:stop",
            {
              conversationId,
            },
          );
        } catch {
          // ignored
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

  /*
  |--------------------------------------------------------------------------
  | Conversation status
  |--------------------------------------------------------------------------
  */

  const changeStatus =
    async (
      status:
        | "open"
        | "closed"
        | "archived",
    ) => {
      if (
        !conversationId
      ) {
        return;
      }

      setChangingStatus(
        true,
      );

      setError("");

      try {
        const updated =
          await chatService.updateConversationStatus(
            conversationId,
            status,
          );

        setConversation(
          updated,
        );

        setMenuOpen(
          false,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update conversation.",
        );
      } finally {
        setChangingStatus(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Derived
  |--------------------------------------------------------------------------
  */

  const clientName =
    useMemo(
      () =>
        conversation
          ? getClientName(
              conversation,
            )
          : "Client",
      [conversation],
    );

  const grouped =
    useMemo(
      () =>
        groupMessagesByDay(
          messages,
        ),
      [messages],
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F4F6F8]">
        <Loader2
          size={30}
          className="animate-spin text-[#2458E8]"
        />
      </main>
    );
  }

  if (
    !conversation
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F4F6F8] px-5">
        <div className="text-center">
          <p className="text-[14px] font-black">
            {error ||
              "Conversation not found."}
          </p>

          <Link
            href="/dashboard/communications/chat"
            className="mt-4 inline-flex text-[11px] font-bold text-[#2458E8]"
          >
            Back to Chat
          </Link>
        </div>
      </main>
    );
  }

  const canSend =
    conversation.status !==
    "archived";

  return (
    <main className="min-h-screen bg-[#EDEFF2] px-4 py-5 text-[#292929] md:px-6">
      <section className="mx-auto flex h-[calc(100vh-40px)] w-full max-w-[1050px] flex-col overflow-hidden rounded-[22px] bg-white shadow-lg">
        {/* Header */}

        <header className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-4 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/communications/chat"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F4F6F8] text-black/55"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EEF3FF] text-[#2458E8]">
              <UserRound
                size={19}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-black">
                {clientName}
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
                  {clientTyping
                    ? "Client is typing..."
                    : connected
                      ? "Realtime connected"
                      : "Connecting..."}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) =>
                    !current,
                )
              }
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#F4F6F8]"
            >
              <MoreVertical
                size={17}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-30 w-[180px] overflow-hidden rounded-[12px] border border-black/5 bg-white py-1 shadow-xl">
                {conversation.status !==
                  "open" && (
                  <StatusAction
                    label="Reopen conversation"
                    disabled={
                      changingStatus
                    }
                    onClick={() =>
                      void changeStatus(
                        "open",
                      )
                    }
                  />
                )}

                {conversation.status !==
                  "closed" && (
                  <StatusAction
                    label="Close conversation"
                    disabled={
                      changingStatus
                    }
                    onClick={() =>
                      void changeStatus(
                        "closed",
                      )
                    }
                  />
                )}

                {conversation.status !==
                  "archived" && (
                  <StatusAction
                    label="Archive conversation"
                    danger
                    disabled={
                      changingStatus
                    }
                    onClick={() =>
                      void changeStatus(
                        "archived",
                      )
                    }
                  />
                )}
              </div>
            )}
          </div>
        </header>

        {conversation.status !==
          "open" && (
          <div
            className={`shrink-0 px-4 py-2 text-center text-[9px] font-semibold ${
              conversation.status ===
              "archived"
                ? "bg-gray-100 text-gray-600"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {conversation.status ===
            "archived"
              ? "This conversation is archived."
              : "This conversation is closed. You can still reply or reopen it."}
          </div>
        )}

        {error && (
          <div className="relative shrink-0 bg-red-50 px-4 py-2.5 pr-10 text-[9px] font-semibold text-red-700">
            {error}

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X
                size={13}
              />
            </button>
          </div>
        )}

        {/* Messages */}

        <div className="flex-1 overflow-y-auto bg-[#F7F8FA] px-4 py-5 md:px-7">
          {messages.length ===
          0 ? (
            <div className="grid h-full place-items-center">
              <div className="max-w-[280px] text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#EEF3FF] text-[#2458E8]">
                  <UserRound
                    size={23}
                  />
                </div>

                <p className="mt-4 text-[13px] font-black">
                  Start the
                  conversation
                </p>

                <p className="mt-2 text-[9px] leading-4 text-black/40">
                  Send a message to{" "}
                  {clientName}.
                  Messages will appear
                  here in real time.
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
                        <MessageBubble
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

              {clientTyping && (
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

        {/* Composer */}

        <form
          onSubmit={
            handleSubmit
          }
          className="shrink-0 border-t border-black/5 bg-white px-4 py-4 md:px-5"
        >
          <div className="flex items-end gap-3">
            <textarea
              rows={1}
              value={
                message
              }
              disabled={
                !canSend ||
                sending
              }
              onChange={(
                event,
              ) =>
                handleTyping(
                  event.target
                    .value,
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

                  event.currentTarget
                    .form
                    ?.requestSubmit();
                }
              }}
              placeholder={
                canSend
                  ? `Message ${clientName}...`
                  : "Conversation archived"
              }
              className="max-h-[120px] min-h-[46px] flex-1 resize-none rounded-[14px] border border-black/10 bg-[#F8F9FA] px-4 py-3 text-[11px] leading-5 outline-none focus:border-[#2458E8]/40 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={
                !canSend ||
                sending ||
                !message.trim()
              }
              className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[13px] bg-[#2458E8] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
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

          <p className="mt-2 text-center text-[7px] text-black/25">
            Enter to send •
            Shift + Enter for a
            new line
          </p>
        </form>
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Message bubble
|--------------------------------------------------------------------------
*/

function MessageBubble({
  message,
}: {
  message:
    ChatMessage;
}) {
  const mine =
    message.sender_type ===
    "tenant";

  return (
    <div
      className={`mb-3 flex ${
        mine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[78%] ${
          mine
            ? "text-right"
            : "text-left"
        }`}
      >
        {!mine && (
          <p className="mb-1 px-1 text-[7px] font-semibold text-black/30">
            {getSenderName(
              message,
            )}
          </p>
        )}

        <div
          className={`inline-block rounded-[17px] px-4 py-3 text-left text-[10px] leading-[17px] shadow-sm ${
            mine
              ? "rounded-br-[4px] bg-[#2458E8] text-white"
              : "rounded-bl-[4px] bg-white text-[#333]"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.body}
          </p>
        </div>

        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[7px] ${
            mine
              ? "justify-end text-black/30"
              : "justify-start text-black/25"
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

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

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

function StatusAction({
  label,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;

  onClick:
    () => void;

  disabled:
    boolean;

  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`block w-full px-4 py-2.5 text-left text-[9px] font-semibold transition hover:bg-[#F6F7F8] disabled:opacity-40 ${
        danger
          ? "text-red-600"
          : "text-[#333]"
      }`}
    >
      {label}
    </button>
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

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getClientName(
  conversation:
    ChatConversation,
) {
  return (
    [
      conversation.client_first_name,
      conversation.client_middle_name,
      conversation.client_last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    conversation.client_email ||
    "Client"
  );
}

function getSenderName(
  message:
    ChatMessage,
) {
  return (
    [
      message.sender_first_name,
      message.sender_middle_name,
      message.sender_last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    message.sender_email ||
    (
      message.sender_type ===
      "tenant"
        ? "Support"
        : "Client"
    )
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
    ChatMessage[],
) {
  const groups =
    new Map<
      string,
      ChatMessage[]
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
    ]) => {
      const date =
        new Date(
          items[0]
            .created_at,
        );

      return {
        dateKey,

        label:
          formatDayLabel(
            date,
          ),

        messages:
          items,
      };
    },
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
    difference ===
    0
  ) {
    return "Today";
  }

  if (
    difference ===
    1
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