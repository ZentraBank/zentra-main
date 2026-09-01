"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Headphones,
  Loader2,
  Lock,
  MessageCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  platformChatService,
  type PlatformChatConversation,
  type PlatformChatMessage,
} from "@/services/platform-chat.service";

import {
  getApiErrorMessage,
} from "@/lib/api";

export default function PlatformSupportPage() {
  const [conversation, setConversation] =
    useState<PlatformChatConversation | null>(null);

  const [messages, setMessages] =
    useState<PlatformChatMessage[]>([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Scroll to latest message
  |--------------------------------------------------------------------------
  */

  const scrollToBottom =
    useCallback(() => {
      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 50);
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
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const [
            conversationData,
            messagesData,
          ] = await Promise.all([
            platformChatService.getConversation(),

            platformChatService.listMessages({
              page: 1,
              pageSize: 100,
            }),
          ]);

          setConversation(
            conversationData,
          );

          setMessages(
            messagesData.messages ?? [],
          );

          try {
            await platformChatService.markAsRead();
          } catch {
            /*
             * Mark-as-read failure should not
             * prevent the conversation loading.
             */
          }

          scrollToBottom();
        } catch (err) {
          setError(
            getApiErrorMessage(
              err,
            ),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [scrollToBottom],
    );

  useEffect(() => {
    void loadChat();
  }, [loadChat]);

  /*
  |--------------------------------------------------------------------------
  | Send message
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
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

      setSending(true);
      setError("");

      try {
        const created =
          await platformChatService.sendMessage(
            trimmed,
          );

        setMessage("");

        /*
         * Add the returned message immediately.
         * We then refresh to ensure conversation
         * metadata stays in sync with the backend.
         */

        if (created) {
          setMessages(
            (current) => [
              ...current,
              created,
            ],
          );
        }

        scrollToBottom();

        await loadChat({
          silent: true,
        });
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
          ),
        );
      } finally {
        setSending(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F4F6F8] px-5 text-[#292929]">
        <div className="flex items-center gap-3 text-sm font-bold text-black/50">
          <Loader2
            className="animate-spin"
            size={18}
          />

          Loading platform support...
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error / locked state
  |--------------------------------------------------------------------------
  */

  if (
    error &&
    !conversation
  ) {
    const subscriptionLocked =
      error
        .toLowerCase()
        .includes(
          "subscription",
        ) ||
      error
        .toLowerCase()
        .includes(
          "plan",
        );

    return (
      <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
        <section className="mx-auto w-full max-w-[900px]">
          <Link
            href="/dashboard/communications"
            className="inline-flex items-center gap-2 text-[11px] font-bold text-black/50 transition hover:text-black"
          >
            <ArrowLeft
              size={15}
            />

            Communications
          </Link>

          <div className="mt-8 rounded-[24px] bg-white p-8 shadow-sm">
            <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-[#EEF3FF] text-[#2458E8]">
              {subscriptionLocked ? (
                <Lock
                  size={24}
                />
              ) : (
                <MessageCircle
                  size={24}
                />
              )}
            </div>

            <h1 className="mt-6 text-[24px] font-black tracking-[-0.035em]">
              {subscriptionLocked
                ? "Platform Support Locked"
                : "Unable to load platform support"}
            </h1>

            <p className="mt-2 max-w-[520px] text-[12px] leading-6 text-black/45">
              {error}
            </p>

            {subscriptionLocked && (
              <p className="mt-4 max-w-[520px] text-[11px] leading-5 text-black/40">
                Platform support chat is available
                on eligible ZentraBank subscription
                plans.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                void loadChat();
              }}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#14251D] px-4 text-[10px] font-black text-white transition hover:opacity-90"
            >
              <RefreshCw
                size={14}
              />

              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  const conversationClosed =
    conversation?.status ===
    "closed";

  /*
  |--------------------------------------------------------------------------
  | Main chat
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[1000px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/communications"
              className="inline-flex items-center gap-2 text-[11px] font-bold text-black/45 transition hover:text-black"
            >
              <ArrowLeft
                size={15}
              />

              Communications
            </Link>

            <h1 className="mt-4 text-[26px] font-black tracking-[-0.035em]">
              ZentraBank Support
            </h1>

            <p className="mt-1 text-[11px] text-black/40">
              Chat directly with the
              ZentraBank platform team.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => {
              void loadChat({
                silent: true,
              });
            }}
            className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-white px-4 text-[10px] font-black shadow-sm transition hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        <div className="mt-7 overflow-hidden rounded-[24px] bg-white shadow-sm">
          {/* Header */}

          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#14251D] text-[#71D49B]">
                <Headphones
                  size={20}
                />
              </div>

              <div>
                <p className="text-[13px] font-black">
                  Platform Support
                </p>

                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.05em] text-black/35">
                  ZentraBank
                </p>
              </div>
            </div>

            <span
              className={[
                "rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.05em]",
                conversationClosed
                  ? "bg-black/[0.05] text-black/40"
                  : "bg-[#EAF8F0] text-[#268451]",
              ].join(
                " ",
              )}
            >
              {conversationClosed
                ? "Closed"
                : "Open"}
            </span>
          </div>

          {/* Messages */}

          <div className="h-[520px] overflow-y-auto bg-[#F9FAFB] px-5 py-6 md:px-7">
            {messages.length ===
            0 ? (
              <div className="grid h-full place-items-center">
                <div className="max-w-[380px] text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-white text-[#2458E8] shadow-sm">
                    <MessageCircle
                      size={23}
                    />
                  </div>

                  <h2 className="mt-5 text-[17px] font-black">
                    Start a conversation
                  </h2>

                  <p className="mt-2 text-[11px] leading-5 text-black/40">
                    Send a message to the
                    ZentraBank platform team.
                    Your conversation will
                    appear in the platform
                    support inbox.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(
                  (item) => {
                    const mine =
                      item.senderType ===
                      "tenant_user";

                    return (
                      <div
                        key={
                          item.id
                        }
                        className={[
                          "flex",
                          mine
                            ? "justify-end"
                            : "justify-start",
                        ].join(
                          " ",
                        )}
                      >
                        <div
                          className={[
                            "max-w-[78%] rounded-[18px] px-4 py-3 md:max-w-[65%]",
                            mine
                              ? "rounded-br-[5px] bg-[#14251D] text-white"
                              : "rounded-bl-[5px] bg-white text-[#292929] shadow-sm",
                          ].join(
                            " ",
                          )}
                        >
                          {!mine && (
                            <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.04em] text-[#2458E8]">
                              {item.senderName ||
                                "ZentraBank Support"}
                            </p>
                          )}

                          <p className="whitespace-pre-wrap break-words text-[12px] leading-5">
                            {
                              item.message
                            }
                          </p>

                          <p
                            className={[
                              "mt-2 text-right text-[8px]",
                              mine
                                ? "text-white/35"
                                : "text-black/30",
                            ].join(
                              " ",
                            )}
                          >
                            {formatMessageTime(
                              item.createdAt,
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

          {/* Error */}

          {error && (
            <div className="border-t border-[#F4DADA] bg-[#FFF7F7] px-6 py-3 text-[10px] font-bold text-[#B42318]">
              {error}
            </div>
          )}

          {/* Composer */}

          <div className="border-t border-black/[0.06] bg-white p-4 md:p-5">
            {conversationClosed ? (
              <div className="flex items-center justify-center gap-2 rounded-[14px] bg-black/[0.035] px-4 py-4 text-[10px] font-bold text-black/40">
                <Lock
                  size={14}
                />

                This support conversation
                has been closed.
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
                className="flex items-end gap-3"
              >
                <textarea
                  value={
                    message
                  }
                  onChange={(
                    event,
                  ) =>
                    setMessage(
                      event
                        .target
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
                  rows={1}
                  maxLength={
                    5000
                  }
                  placeholder="Write a message to ZentraBank support..."
                  className="max-h-32 min-h-[46px] flex-1 resize-none rounded-[14px] border border-black/[0.08] bg-[#F8F9FA] px-4 py-3 text-[12px] outline-none transition placeholder:text-black/25 focus:border-[#2458E8]/40 focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[#14251D] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function formatMessageTime(
  value?: string,
) {
  if (!value) {
    return "";
  }

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
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    },
  ).format(date);
}