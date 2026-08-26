"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  chatService,
} from "@/services/chat.service";

import type {
  ChatConversation,
} from "@/services/chat.service";

export default function TenantChatInboxPage() {
  const [
    conversations,
    setConversations,
  ] =
    useState<
      ChatConversation[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await chatService.listTenantConversations({
              page: 1,
              pageSize: 100,
            });

          setConversations(
            result.conversations,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load conversations.",
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

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const name =
            getClientName(
              conversation,
            ).toLowerCase();

          const email =
            (
              conversation.client_email ??
              ""
            ).toLowerCase();

          const lastMessage =
            (
              conversation.last_message ??
              ""
            ).toLowerCase();

          return (
            name.includes(
              query,
            ) ||
            email.includes(
              query,
            ) ||
            lastMessage.includes(
              query,
            )
          );
        },
      );
    }, [
      conversations,
      search,
    ]);

  const totalUnread =
    useMemo(
      () =>
        conversations.reduce(
          (
            total,
            conversation,
          ) =>
            total +
            Number(
              conversation.unread_count ??
                0,
            ),
          0,
        ),
      [conversations],
    );

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[1100px]">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/communications"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="text-[25px] font-black tracking-[-0.035em]">
                Client Chat
              </h1>

              <p className="mt-1 text-[11px] text-black/40">
                Manage conversations with your clients.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                void load()
              }
              className="flex h-[42px] items-center gap-2 rounded-[10px] border border-black/10 bg-white px-4 text-[11px] font-bold"
            >
              <RefreshCw
                size={14}
              />

              Refresh
            </button>

            <Link
              href="/dashboard/communications/chat/new"
              className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#2458E8] px-4 text-[11px] font-bold text-white"
            >
              <Plus size={15} />
              New Chat
            </Link>
          </div>
        </header>

        <section className="mt-7 rounded-[20px] bg-[#14251D] px-5 py-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/35">
                Conversations
              </p>

              <p className="mt-2 text-[29px] font-black">
                {conversations.length}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/35">
                Unread
              </p>

              <p className="mt-2 text-[29px] font-black text-[#71D49B]">
                {totalUnread}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="relative mt-6">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
          />

          <input
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search client or message"
            className="h-[46px] w-full rounded-[11px] border border-black/10 bg-white pl-11 pr-4 text-[11px] outline-none"
          />
        </div>

        {loading ? (
          <div className="mt-6 grid min-h-[360px] place-items-center rounded-[20px] bg-white">
            <Loader2
              size={30}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : filtered.length ===
          0 ? (
          <div className="mt-6 grid min-h-[360px] place-items-center rounded-[20px] border border-dashed border-black/10 bg-white">
            <div className="text-center">
              <MessageCircle
                size={36}
                className="mx-auto text-[#2458E8]"
              />

              <p className="mt-4 text-[14px] font-black">
                No conversations yet
              </p>

              <p className="mx-auto mt-2 max-w-[260px] text-[10px] leading-4 text-black/40">
                Start a conversation with one of your clients.
              </p>

              <Link
                href="/dashboard/communications/chat/new"
                className="mt-5 inline-flex h-[38px] items-center justify-center gap-2 rounded-[9px] bg-[#2458E8] px-4 text-[10px] font-bold text-white"
              >
                <Plus size={14} />
                Start Conversation
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[20px] bg-white shadow-sm">
            {filtered.map(
              (
                conversation,
                index,
              ) => (
                <ConversationRow
                  key={
                    conversation.id
                  }
                  conversation={
                    conversation
                  }
                  first={
                    index === 0
                  }
                />
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function ConversationRow({
  conversation,
  first,
}: {
  conversation:
    ChatConversation;

  first: boolean;
}) {
  const unread =
    Number(
      conversation.unread_count ??
        0,
    );

  const name =
    getClientName(
      conversation,
    );

  const lastMessageAt =
    conversation.last_message_created_at ??
    conversation.last_message_at;

  return (
    <Link
      href={`/dashboard/communications/chat/${encodeURIComponent(
        conversation.id,
      )}`}
      className={`flex items-center gap-4 px-5 py-4 transition hover:bg-[#F8F9FA] ${
        first
          ? ""
          : "border-t border-black/5"
      }`}
    >
      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EEF3FF] text-[#2458E8]">
        <UserRound
          size={20}
        />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-[#2458E8] px-1 text-[8px] font-black text-white">
            {unread >
            99
              ? "99+"
              : unread}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`truncate text-[12px] ${
                unread > 0
                  ? "font-black"
                  : "font-bold"
              }`}
            >
              {name}
            </p>

            {conversation.client_email && (
              <p className="mt-0.5 truncate text-[8px] text-black/30">
                {
                  conversation.client_email
                }
              </p>
            )}
          </div>

          {lastMessageAt && (
            <p
              className={`shrink-0 text-[8px] ${
                unread > 0
                  ? "font-bold text-[#2458E8]"
                  : "text-black/30"
              }`}
            >
              {formatChatTime(
                lastMessageAt,
              )}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <p
            className={`truncate text-[10px] ${
              unread > 0
                ? "font-semibold text-black/70"
                : "text-black/40"
            }`}
          >
            {conversation.last_message ||
              "No messages yet"}
          </p>

          <ConversationStatus
            status={
              conversation.status
            }
          />
        </div>
      </div>
    </Link>
  );
}

function ConversationStatus({
  status,
}: {
  status: string;
}) {
  const styles:
    Record<
      string,
      string
    > = {
      open:
        "bg-green-50 text-green-700",

      closed:
        "bg-gray-100 text-gray-600",

      archived:
        "bg-gray-100 text-gray-400",
    };

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[7px] font-black uppercase ${
        styles[status] ??
        "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

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

function formatChatTime(
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

  const now =
    new Date();

  const sameDay =
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate();

  if (sameDay) {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(date);
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
    },
  ).format(date);
}