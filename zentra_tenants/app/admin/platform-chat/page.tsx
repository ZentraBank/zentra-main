"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
} from "lucide-react";

import {
  platformChatService,
  type PlatformChatConversation,
  type PlatformChatMessage,
} from "@/services/platform-chat.service";

import {
  getApiErrorMessage,
} from "@/lib/api";


export default function PlatformChatPage() {
  const [
    conversation,
    setConversation,
  ] =
    useState<PlatformChatConversation | null>(
      null,
    );

  const [
    messages,
    setMessages,
  ] =
    useState<PlatformChatMessage[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

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
    message,
    setMessage,
  ] =
    useState("");

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );


  /*
  |--------------------------------------------------------------------------
  | Derived state
  |--------------------------------------------------------------------------
  */

  const isClosed =
    conversation?.status ===
    "closed";

  const canSend =
    !isClosed &&
    !sending &&
    message.trim().length > 0;

  const statusLabel =
    useMemo(() => {
      if (!conversation) {
        return "";
      }

      return conversation.status ===
        "open"
        ? "Open"
        : "Closed";
    }, [conversation]);


  /*
  |--------------------------------------------------------------------------
  | Scroll
  |--------------------------------------------------------------------------
  */

  const scrollToBottom =
    useCallback(() => {
      window.requestAnimationFrame(
        () => {
          bottomRef.current?.scrollIntoView({
            behavior:
              "smooth",
          });
        },
      );
    }, []);


  /*
  |--------------------------------------------------------------------------
  | Load conversation + messages
  |--------------------------------------------------------------------------
  */

  const loadChat =
    useCallback(
      async ({
        silent = false,
      }: {
        silent?: boolean;
      } = {}) => {
        if (silent) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(
            true,
          );
        }

        setError("");

        try {
          /*
           * Calling this endpoint also creates the
           * tenant's platform conversation if one
           * does not exist yet.
           */
          const [
            conversationData,
            messageData,
          ] =
            await Promise.all([
              platformChatService
                .getConversation(),

              platformChatService
                .listMessages({
                  page: 1,
                  pageSize: 50,
                }),
            ]);

          setConversation(
            conversationData,
          );

          setMessages(
            messageData.messages,
          );

          await platformChatService
            .markAsRead();

          scrollToBottom();
        } catch (err) {
          setError(
            getApiErrorMessage(
              err,
            ),
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [scrollToBottom],
    );


  /*
  |--------------------------------------------------------------------------
  | Initial load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void loadChat();
  }, [loadChat]);


  /*
  |--------------------------------------------------------------------------
  | Temporary polling
  |--------------------------------------------------------------------------
  |
  | We will replace this with Socket.IO once the
  | basic HTTP flow has been proven end-to-end.
  |
  */

  useEffect(() => {
    const interval =
      window.setInterval(
        async () => {
          try {
            const data =
              await platformChatService
                .listMessages({
                  page: 1,
                  pageSize: 50,
                });

            setConversation(
              data.conversation,
            );

            setMessages(
              data.messages,
            );

            if (
              data.messages
                .length > 0
            ) {
              await platformChatService
                .markAsRead();
            }
          } catch {
            /*
             * Silent polling failure.
             * Manual refresh still exposes errors.
             */
          }
        },
        5000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);


  /*
  |--------------------------------------------------------------------------
  | Send message
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const trimmedMessage =
        message.trim();

      if (
        !trimmedMessage ||
        sending ||
        isClosed
      ) {
        return;
      }

      setSending(
        true,
      );

      setError("");

      try {
        const created =
          await platformChatService
            .sendMessage(
              trimmedMessage,
            );

        setMessages(
          (current) => [
            ...current,
            created,
          ],
        );

        setMessage("");

        scrollToBottom();
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
          ),
        );
      } finally {
        setSending(
          false,
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading Zentra Support...
        </div>
      </div>
    );
  }


  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl flex-col">
      {/*
      |--------------------------------------------------------------------------
      | Header
      |--------------------------------------------------------------------------
      */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tenant text-white">
              <MessageCircle
                size={21}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Zentra Support
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Communicate directly with the ZentraBank platform team.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {conversation && (
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                conversation.status ===
                "open"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {statusLabel}
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              void loadChat({
                silent:
                  true,
              })
            }
            disabled={
              refreshing
            }
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>


      {/*
      |--------------------------------------------------------------------------
      | Error
      |--------------------------------------------------------------------------
      */}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/*
      |--------------------------------------------------------------------------
      | Chat
      |--------------------------------------------------------------------------
      */}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/*
        |--------------------------------------------------------------------------
        | Conversation info
        |--------------------------------------------------------------------------
        */}

        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
              Z
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                ZentraBank Platform Team
              </p>

              <p className="text-xs text-gray-500">
                Platform support and account assistance
              </p>
            </div>
          </div>
        </div>


        {/*
        |--------------------------------------------------------------------------
        | Messages
        |--------------------------------------------------------------------------
        */}

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/60 px-4 py-6 sm:px-6">
          {messages.length ===
          0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <MessageCircle
                    size={24}
                    className="text-gray-400"
                  />
                </div>

                <h2 className="text-base font-semibold text-gray-900">
                  Start a conversation
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Send a message to the ZentraBank platform team about your subscription, account, platform features, or technical support.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(
                (
                  chatMessage,
                ) => {
                  const isTenant =
                    chatMessage.sender_type ===
                    "tenant_user";

                  return (
                    <div
                      key={
                        chatMessage.id
                      }
                      className={`flex ${
                        isTenant
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] ${
                          isTenant
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        {!isTenant && (
                          <p className="mb-1 px-1 text-xs font-medium text-gray-500">
                            {chatMessage.sender_name ||
                              "ZentraBank Support"}
                          </p>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                            isTenant
                              ? "rounded-br-md bg-tenant text-white"
                              : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {
                              chatMessage.message
                            }
                          </p>
                        </div>

                        <p className="mt-1 px-1 text-[11px] text-gray-400">
                          {formatMessageTime(
                            chatMessage.created_at,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                },
              )}

              <div
                ref={
                  bottomRef
                }
              />
            </div>
          )}
        </div>


        {/*
        |--------------------------------------------------------------------------
        | Closed conversation
        |--------------------------------------------------------------------------
        */}

        {isClosed && (
          <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-800">
            This conversation has been closed by the ZentraBank platform team.
          </div>
        )}


        {/*
        |--------------------------------------------------------------------------
        | Composer
        |--------------------------------------------------------------------------
        */}

        <form
          onSubmit={
            handleSubmit
          }
          className="border-t border-gray-100 bg-white p-4"
        >
          <div className="flex items-end gap-3">
            <textarea
              value={
                message
              }
              onChange={(
                event,
              ) =>
                setMessage(
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

                  if (
                    canSend
                  ) {
                    event.currentTarget
                      .form
                      ?.requestSubmit();
                  }
                }
              }}
              disabled={
                isClosed ||
                sending
              }
              rows={1}
              placeholder={
                isClosed
                  ? "This conversation is closed."
                  : "Write a message..."
              }
              className="max-h-36 min-h-[46px] flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={
                !canSend
              }
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-tenant text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send
                  size={18}
                />
              )}
            </button>
          </div>

          {!isClosed && (
            <p className="mt-2 px-1 text-xs text-gray-400">
              Press Enter to send. Shift + Enter for a new line.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

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
    undefined,
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
      day:
        "2-digit",
      month:
        "short",
    },
  ).format(date);
}