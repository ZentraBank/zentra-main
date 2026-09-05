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
  CheckCheck,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";

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


  /*
  |--------------------------------------------------------------------------
  | Conversations
  |--------------------------------------------------------------------------
  */

  const loadConversations =
    useCallback(
      async (
        preserveSelection = true
      ) => {
        try {
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

              return (
                rows[0]?.id ??
                null
              );
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
      [statusFilter]
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
    setIsLoadingConversations(
      true
    );

    void loadConversations(
      false
    );
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
  | Temporary polling
  |--------------------------------------------------------------------------
  |
  | This keeps the page live while we finish the
  | Socket.IO client connection in the next file.
  |
  */

//   useEffect(() => {
//     const interval =
//       window.setInterval(
//         () => {
//           void loadConversations();

//           if (
//             selectedId
//           ) {
//             void loadMessages(
//               selectedId
//             );
//           }
//         },
//         5000
//       );

//     return () => {
//       window.clearInterval(
//         interval
//       );
//     };
//   }, [
//     loadConversations,
//     loadMessages,
//     selectedId,
//   ]);


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


  return (
    <div className="space-y-5">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Platform Chat
          </h1>

          <p className="mt-1 text-sm text-neutral-400">
            Communicate directly with
            tenant administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadConversations()
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium hover:bg-white/5"
        >
          <RefreshCw
            size={16}
          />

          Refresh
        </button>
      </div>


      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}


      {/* Main chat shell */}

      <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Conversation list */}

        <aside className="border-b border-white/10 lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-white/10 p-4">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
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
                className="w-full rounded-xl border border-white/10 bg-black/10 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-neutral-500 focus:border-white/20"
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                      statusFilter ===
                      status
                        ? "bg-white text-black"
                        : "border border-white/10 text-neutral-400 hover:bg-white/5"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>


          <div className="max-h-[580px] overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center gap-2 p-5 text-sm text-neutral-500">
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Loading conversations…
              </div>
            ) : filteredConversations.length ===
              0 ? (
              <div className="p-8 text-center">
                <MessageSquare
                  size={28}
                  className="mx-auto text-neutral-600"
                />

                <p className="mt-3 text-sm text-neutral-500">
                  No conversations
                  found.
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
                        setSelectedId(
                          conversation.id
                        )
                      }
                      className={`w-full border-b border-white/5 p-4 text-left transition ${
                        active
                          ? "bg-white/10"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
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
                          <span className="flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                            {unread >
                            99
                              ? "99+"
                              : unread}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 truncate text-xs text-neutral-400">
                        {conversation.last_message ||
                          "No messages yet"}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-medium capitalize ${
                            conversation.status ===
                            "open"
                              ? "text-emerald-400"
                              : "text-neutral-500"
                          }`}
                        >
                          {
                            conversation.status
                          }
                        </span>

                        <span className="text-[11px] text-neutral-600">
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

        <section className="flex min-h-[600px] min-w-0 flex-col">
          {!selectedId ||
          !selectedConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <MessageSquare
                  size={30}
                  className="text-neutral-400"
                />
              </div>

              <h2 className="mt-4 font-semibold">
                Select a conversation
              </h2>

              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                Choose a tenant from
                the inbox to view the
                conversation.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}

              <header className="flex items-center justify-between gap-4 border-b border-white/10 p-4 sm:p-5">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">
                    {getTenantLabel(
                      selectedConversation
                    )}
                  </h2>

                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                    <span>
                      {selectedConversation.tenant_slug ||
                        selectedConversation.tenant_id}
                    </span>

                    <span>
                      •
                    </span>

                    <span
                      className={
                        selectedConversation.status ===
                        "open"
                          ? "text-emerald-400"
                          : ""
                      }
                    >
                      {
                        selectedConversation.status
                      }
                    </span>
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
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/5 disabled:opacity-50"
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

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {isLoadingMessages &&
                messages.length ===
                  0 ? (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-neutral-500">
                    <Loader2
                      size={17}
                      className="animate-spin"
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
                              className={`max-w-[80%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                                mine
                                  ? "bg-[#2458e8] text-white"
                                  : "border border-white/10 bg-white/5"
                              }`}
                            >
                              {!mine && (
                                <p className="mb-1 text-xs font-semibold text-blue-300">
                                  {message.sender_name ||
                                    getTenantLabel(
                                      selectedConversation
                                    )}
                                </p>
                              )}

                              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                {
                                  message.message
                                }
                              </p>

                              <div
                                className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                                  mine
                                    ? "justify-end text-blue-100"
                                    : "text-neutral-500"
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

              <div className="border-t border-white/10 p-4">
                {selectedConversation.status ===
                "closed" ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-neutral-400">
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
                      className="max-h-36 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-neutral-500 focus:border-white/20"
                    />

                    <button
                      type="submit"
                      disabled={
                        !draft.trim() ||
                        isSending
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2458e8] text-white transition hover:bg-[#1f4fd4] disabled:cursor-not-allowed disabled:opacity-40"
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}