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
  CheckCheck,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import Link from "next/link";

import { ApiError } from "@/src/lib/api-error";

import {
  platformChatService,
  type PlatformChatConversation,
  type PlatformChatMessage,
  type PlatformChatStatus,
} from "@/src/services/platform-chat.service";

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const getTenantLabel = (
  conversation: PlatformChatConversation
) => {
  return (
    conversation.tenant_name ||
    conversation.tenant_slug ||
    conversation.tenant_id ||
    "Tenant"
  );
};

export default function PlatformChatPage() {
  const [
    conversations,
    setConversations,
  ] = useState<
    PlatformChatConversation[]
  >([]);

  const [
    selectedId,
    setSelectedId,
  ] = useState<string | null>(
    null
  );

  const [
    messages,
    setMessages,
  ] = useState<
    PlatformChatMessage[]
  >([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<
    PlatformChatConversation | null
  >(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "all" | PlatformChatStatus
  >("all");

  const [
    draft,
    setDraft,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    isLoadingConversations,
    setIsLoadingConversations,
  ] = useState(true);

  const [
    isLoadingMessages,
    setIsLoadingMessages,
  ] = useState(false);

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] = useState(false);

  const messageEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    chatPopup,
    setChatPopup,
  ] = useState<PlatformChatConversation | null>(
    null
  );

  const previousUnreadRef =
    useRef<Record<string, number>>({});

  const checkForNewChats =
    useCallback(
      (
        rows: PlatformChatConversation[]
      ) => {
        const previous =
          previousUnreadRef.current;

        let newest:
          | PlatformChatConversation
          | null = null;

        for (const conversation of rows) {
          const currentUnread =
            Number(
              conversation.unread_count ??
                0
            );

          const previousUnread =
            Number(
              previous[
                conversation.id
              ] ?? 0
            );

          if (
            currentUnread >
              previousUnread &&
            currentUnread > 0
          ) {
            newest = conversation;
          }

          previous[
            conversation.id
          ] = currentUnread;
        }

        previousUnreadRef.current = {
          ...previous,
        };

        if (newest) {
          setChatPopup(newest);
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Conversations
  |--------------------------------------------------------------------------
  */

  const loadConversations =
    useCallback(
      async (
        preserveSelection = true,
        silent = false
      ) => {
        try {
          if (!silent) {
            setIsLoadingConversations(true);
          }
          setError(null);

          const result =
            await platformChatService
              .listConversations({
                page: 1,
                pageSize: 100,

                status:
                  statusFilter ===
                  "all"
                    ? undefined
                    : statusFilter,
              });

          const rows =
            Array.isArray(
              result?.conversations
            )
              ? result.conversations
              : [];

          setConversations(
            rows
          );

          checkForNewChats(
            rows
          );
          setSelectedId(
            (current) => {
              if (
                preserveSelection &&
                current &&
                rows.some(
                  (item) =>
                    item.id ===
                    current
                )
              ) {
                return current;
              }

              return null;
            }
          );
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              ApiError
              ? caught.message
              : "Unable to load platform chat conversations."
          );
        } finally {
          setIsLoadingConversations(
            false
          );
        }
      },
      [statusFilter, checkForNewChats]
    );

  /*
  |--------------------------------------------------------------------------
  | Messages
  |--------------------------------------------------------------------------
  */

  const loadMessages =
    useCallback(
      async (
        conversationId: string
      ) => {
        setIsLoadingMessages(
          true
        );

        try {
          setError(null);

          const result =
            await platformChatService
              .listMessages(
                conversationId,
                {
                  page: 1,
                  pageSize: 100,
                }
              );

          setMessages(
            Array.isArray(
              result?.messages
            )
              ? result.messages
              : []
          );

          setSelectedConversation(
            result.conversation
          );

          await platformChatService
            .markRead(
              conversationId
            );

          setConversations(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  conversationId
                    ? {
                        ...item,
                        unread_count:
                          0,
                      }
                    : item
              )
          );
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              ApiError
              ? caught.message
              : "Unable to load conversation messages."
          );
        } finally {
          setIsLoadingMessages(
            false
          );
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Initial / filter load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void loadConversations(false, false);

    const interval =
      window.setInterval(
        () => {
          void loadConversations(
            true,
            true
          );
        },
        5000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    loadConversations,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load selected conversation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setSelectedConversation(
        null
      );

      return;
    }

    void loadMessages(
      selectedId
    );
  }, [
    selectedId,
    loadMessages,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Scroll latest message into view
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    messageEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [
    messages,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredConversations =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return conversations;
        }

        return conversations.filter(
          (conversation) => {
            const tenantName =
              conversation
                .tenant_name ??
              "";

            const tenantSlug =
              conversation
                .tenant_slug ??
              "";

            const lastMessage =
              conversation
                .last_message ??
              "";

            return [
              tenantName,
              tenantSlug,
              lastMessage,
            ].some(
              (value) =>
                value
                  .toLowerCase()
                  .includes(
                    query
                  )
            );
          }
        );
      },
      [
        conversations,
        search,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Send
  |--------------------------------------------------------------------------
  */

  const sendMessage =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

      if (
        !selectedId ||
        !draft.trim() ||
        isSending ||
        selectedConversation
          ?.status ===
          "closed"
      ) {
        return;
      }

      const message =
        draft.trim();

      setDraft("");
      setIsSending(true);
      setError(null);

      try {
        const created =
          await platformChatService
            .sendMessage(
              selectedId,
              message
            );

        setMessages(
          (current) => {
            if (
              current.some(
                (item) =>
                  item.id ===
                  created.id
              )
            ) {
              return current;
            }

            return [
              ...current,
              created,
            ];
          }
        );

        setConversations(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                selectedId
                  ? {
                      ...item,

                      last_message:
                        created.message,

                      last_message_sender_type:
                        created.sender_type,

                      last_message_at:
                        created.created_at,
                    }
                  : item
            )
        );
      } catch (
        caught
      ) {
        setDraft(
          message
        );

        setError(
          caught instanceof
            ApiError
            ? caught.message
            : "Unable to send message."
        );
      } finally {
        setIsSending(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Open / close conversation
  |--------------------------------------------------------------------------
  */

  const toggleStatus =
    async () => {
      if (
        !selectedConversation ||
        isUpdatingStatus
      ) {
        return;
      }

      const nextStatus:
        PlatformChatStatus =
        selectedConversation
          .status === "open"
          ? "closed"
          : "open";

      setIsUpdatingStatus(
        true
      );

      try {
        const updated =
          await platformChatService
            .updateStatus(
              selectedConversation.id,
              nextStatus
            );

        setSelectedConversation(
          (current) =>
            current
              ? {
                  ...current,
                  ...updated,
                  status:
                    nextStatus,
                }
              : current
        );

        setConversations(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                selectedConversation.id
                  ? {
                      ...item,
                      ...updated,
                      status:
                        nextStatus,
                    }
                  : item
            )
        );
      } catch (
        caught
      ) {
        setError(
          caught instanceof
            ApiError
            ? caught.message
            : "Unable to update conversation status."
        );
      } finally {
        setIsUpdatingStatus(
          false
        );
      }
    };

  const openConversation =
    useCallback(
      async (
        conversationId: string
      ) => {
        setSelectedId(
          conversationId
        );

        if (
          selectedId ===
          conversationId
        ) {
          await loadMessages(
            conversationId
          );
        }
      },
      [
        selectedId,
        loadMessages,
      ]
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
      {/* Header with Back Arrow */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Platform Chat
          </h1>
          <p className="text-sm text-neutral-500">
            Communicate directly with tenant administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadConversations(true, false)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
        >
          <RefreshCw
            size={16}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {chatPopup && (
        <div className="fixed right-6 top-6 z-[100] w-[340px] rounded-2xl border border-blue-500/30 bg-neutral-950 p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <MessageSquare
                size={19}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">
                New chat message
              </p>

              <p className="mt-1 truncate text-xs text-neutral-400">
                {getTenantLabel(
                  chatPopup
                )}
              </p>

              <p className="mt-2 line-clamp-2 text-sm text-neutral-300">
                {chatPopup.last_message ||
                  "You have a new message."}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(
                      chatPopup.id
                    );

                    void loadMessages(
                      chatPopup.id
                    );

                    setChatPopup(
                      null
                    );
                  }}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
                >
                  Open chat
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setChatPopup(
                      null
                    )
                  }
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/5 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main chat shell */}
      <div className="flex h-[calc(100vh-12rem)] min-h-[680px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Conversation list */}
        <aside className={`flex-col border-b border-neutral-200 bg-neutral-50/50 lg:flex lg:border-b-0 lg:border-r ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="space-y-3 border-b border-neutral-200 p-4 bg-white">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search tenants..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="flex gap-2">
              {(
                [
                  "all",
                  "open",
                  "closed",
                ] as const
              ).map(
                (status) => (
                  <button
                    key={
                      status
                    }
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        status
                      )
                    }
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      statusFilter ===
                      status
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-neutral-500">
                <Loader2
                  size={16}
                  className="animate-spin text-blue-600"
                />
                Loading conversations…
              </div>
            ) : filteredConversations.length ===
              0 ? (
              <div className="p-8 text-center">
                <MessageSquare
                  size={32}
                  className="mx-auto text-neutral-300"
                />
                <p className="mt-3 text-sm font-medium text-neutral-600">
                  No conversations found.
                </p>
              </div>
            ) : (
              filteredConversations.map(
                (
                  conversation
                ) => {
                  const active =
                    selectedId ===
                    conversation.id;

                  const unread =
                    Number(
                      conversation.unread_count ??
                        0
                    );

                  return (
                    <button
                      type="button"
                      key={
                        conversation.id
                      }
                      onClick={() =>
                        void openConversation(
                          conversation.id
                        )
                      }
                      className={`w-full p-4 text-left transition ${
                        active
                          ? "bg-blue-50/80 border-l-4 border-blue-600"
                          : "bg-white hover:bg-neutral-50/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900">
                            {getTenantLabel(
                              conversation
                            )}
                          </p>

                          {conversation.tenant_slug && (
                            <p className="mt-0.5 truncate text-xs text-neutral-500">
                              {
                                conversation.tenant_slug
                              }
                            </p>
                          )}
                        </div>

                        {unread >
                          0 && (
                          <span className="flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                            {unread >
                            99
                              ? "99+"
                              : unread}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 truncate text-xs text-neutral-600">
                        {conversation.last_message ||
                          "No messages yet"}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-medium capitalize ${
                            conversation.status ===
                            "open"
                              ? "text-emerald-600"
                              : "text-neutral-400"
                          }`}
                        >
                          {conversation.status}
                        </span>

                        <span className="text-[11px] text-neutral-400">
                          {formatDate(
                            conversation.last_message_at
                          )}
                        </span>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* Conversation */}
        <section className={`flex-1 flex-col bg-white min-h-0 ${selectedId ? 'flex' : 'hidden lg:flex'}`}>
          {!selectedId ||
          !selectedConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-neutral-50/30">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <MessageSquare
                  size={32}
                  className="text-neutral-400"
                />
              </div>

              <h2 className="mt-4 font-semibold text-neutral-900">
                Select a conversation
              </h2>

              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                Choose a tenant from
                the inbox to view the
                conversation.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col min-h-0">
              {/* Chat header */}
              <header className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-4 shadow-sm z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="inline-flex lg:hidden items-center justify-center rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50 transition"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-neutral-900">
                      {getTenantLabel(
                        selectedConversation
                      )}
                    </h2>

                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                      <span>
                        {selectedConversation.tenant_slug ||
                          selectedConversation.tenant_id}
                      </span>

                      <span>•</span>

                      <span
                        className={
                          selectedConversation.status ===
                          "open"
                            ? "text-emerald-600 font-medium"
                            : "text-neutral-400 font-medium"
                        }
                      >
                        {
                          selectedConversation.status
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={() =>
                    void toggleStatus()
                  }
                  className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 shrink-0"
                >
                  {isUpdatingStatus
                    ? "Updating…"
                    : selectedConversation.status ===
                        "open"
                      ? "Close conversation"
                      : "Reopen conversation"}
                </button>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 space-y-4">
                {isLoadingMessages &&
                messages.length ===
                  0 ? (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-neutral-500">
                    <Loader2
                      size={17}
                      className="animate-spin text-blue-600"
                    />
                    Loading messages…
                  </div>
                ) : messages.length ===
                  0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    No messages in this
                    conversation yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(
                      (
                        message
                      ) => {
                        const mine =
                          message.sender_type ===
                          "platform_user";

                        return (
                          <div
                            key={
                              message.id
                            }
                            className={`flex ${
                              mine
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 sm:max-w-[70%] shadow-sm ${
                                mine
                                  ? "bg-blue-600 text-white rounded-br-sm"
                                  : "border border-neutral-200 bg-white text-neutral-900 rounded-bl-sm"
                              }`}
                            >
                              {!mine && (
                                <p className="mb-1 text-xs font-semibold text-blue-600">
                                  {message.sender_name ||
                                    getTenantLabel(
                                      selectedConversation
                                    )}
                                </p>
                              )}

                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {
                                  message.message
                                }
                              </p>

                              <div
                                className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                                  mine
                                    ? "justify-end text-blue-100"
                                    : "text-neutral-400"
                                }`}
                              >
                                {formatDate(
                                  message.created_at
                                )}

                                {mine && (
                                  <CheckCheck
                                    size={
                                      12
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}

                    <div
                      ref={
                        messageEndRef
                      }
                    />
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-neutral-200 bg-white p-4">
                {selectedConversation.status ===
                "closed" ? (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
                    This conversation is
                    closed. Reopen it to
                    send another message.
                  </div>
                ) : (
                  <form
                    onSubmit={
                      sendMessage
                    }
                    className="flex items-end gap-3"
                  >
                    <textarea
                      value={
                        draft
                      }
                      onChange={(
                        event
                      ) =>
                        setDraft(
                          event
                            .target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();

                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={1}
                      placeholder="Write a reply..."
                      className="max-h-36 min-h-[46px] flex-1 resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                    />

                    <button
                      type="submit"
                      disabled={
                        !draft.trim() ||
                        isSending
                      }
                      className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                      aria-label="Send message"
                    >
                      {isSending ? (
                        <Loader2
                          size={
                            18
                          }
                          className="animate-spin"
                        />
                      ) : (
                        <Send
                          size={
                            18
                          }
                        />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}