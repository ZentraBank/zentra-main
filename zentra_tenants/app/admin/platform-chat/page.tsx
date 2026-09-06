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
  ArrowLeft,
  Headphones,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import Link from "next/link";
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
        ? "OPEN"
        : "CLOSED";
    }, [conversation]);

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

  useEffect(() => {
    void loadChat();
  }, [loadChat]);

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
            /* Silent polling failure */
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F6F8]">
        <div className="flex items-center gap-3 text-sm text-neutral-500 font-medium">
          <Loader2
            size={20}
            className="animate-spin text-neutral-800"
          />
          Loading ZentraBank Support...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-4 py-8 text-neutral-900 md:px-12 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Communications
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                ZentraBank Support
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Chat directly with the ZentraBank platform team.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadChat({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin text-neutral-800"
                    : "text-neutral-800"
                }
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Main Card Container */}
        <div className="flex min-h-[650px] flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-xs">
          {/* Platform Support Info Card */}
          <div className="border-b border-neutral-100 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-sm">
                  <Headphones size={26} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    Platform Support
                  </h2>
                  <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase mt-0.5">
                    ZENTRABANK
                  </p>
                </div>
              </div>

              {conversation && (
                <span
                  className={`rounded-full px-4 py-1 text-xs font-bold tracking-wide ${
                    conversation.status === "open"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}
                >
                  {statusLabel}
                </span>
              )}
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[320px] items-center justify-center">
                <div className="max-w-md text-center">
                  <h3 className="text-base font-bold text-neutral-900">
                    Start a conversation
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    Send a message to the ZentraBank platform team about your subscription, account, platform features, or technical support.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
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
                          className={`max-w-[85%] sm:max-w-[65%] ${
                            isTenant
                              ? "items-end"
                              : "items-start"
                          }`}
                        >
                          {!isTenant && (
                            <p className="mb-1.5 px-1 text-[11px] font-bold tracking-wide uppercase text-blue-600">
                              {chatMessage.sender_name ||
                                "ZENTRABANK SUPPORT"}
                            </p>
                          )}

                          <div
                            className={`rounded-2xl border p-4 text-sm leading-relaxed shadow-xs ${
                              isTenant
                                ? "border-blue-600 bg-blue-600 text-white rounded-br-xs"
                                : "border-neutral-200/80 bg-white text-neutral-800 rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {
                                chatMessage.message
                              }
                            </p>
                          </div>
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

          {/* Closed status banner */}
          {isClosed && (
            <div className="border-t border-amber-200 bg-amber-50 px-6 py-4 text-center text-sm font-medium text-amber-800">
              This conversation has been closed by the ZentraBank platform team.
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={
              handleSubmit
            }
            className="border-t border-neutral-100 bg-white p-6 md:p-8"
          >
            <div className="relative flex items-center">
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
                rows={2}
                placeholder={
                  isClosed
                    ? "This conversation is closed."
                    : "Write a message to ZentraBank support..."
                }
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 pr-16 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-50 shadow-xs"
              />

              <button
                type="submit"
                disabled={
                  !canSend
                }
                className="absolute right-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-400 text-white transition hover:bg-neutral-500 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2
                    size={18}
                    className="animate-spin text-white"
                  />
                ) : (
                  <Send
                    size={18}
                  />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
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