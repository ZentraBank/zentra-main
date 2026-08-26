"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  bankingService,
} from "@/services/banking.service";

import {
  chatService,
} from "@/services/chat.service";

import type {
  BankAccount,
} from "@/types/banking.types";

type ClientOption = {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export default function NewTenantChatPage() {
  const router =
    useRouter();

  const [
    accounts,
    setAccounts,
  ] =
    useState<
      BankAccount[]
    >([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(
      false,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    creatingId,
    setCreatingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    search,
    setSearch,
  ] =
    useState(
      "",
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  const loadClients =
    async () => {
      if (loaded) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result =
          await bankingService.getTenantAccounts();

        setAccounts(
          result,
        );

        setLoaded(
          true,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load clients.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  /*
   * Load immediately on first render.
   */
  if (
    !loaded &&
    !loading
  ) {
    void loadClients();
  }

  const clients =
    useMemo<
      ClientOption[]
    >(() => {
      const map =
        new Map<
          string,
          ClientOption
        >();

      for (
        const account
        of accounts
      ) {
        if (
          !account.user_id
        ) {
          continue;
        }

        if (
          map.has(
            account.user_id,
          )
        ) {
          continue;
        }

        map.set(
          account.user_id,
          {
            userId:
              account.user_id,

            name:
              account.client_name ||
              account.account_name ||
              "Client",

            email:
              account.client_email ??
              null,

            phone:
              account.client_phone ??
              null,
          },
        );
      }

      return Array.from(
        map.values(),
      ).sort(
        (
          a,
          b,
        ) =>
          a.name.localeCompare(
            b.name,
          ),
      );
    }, [accounts]);

  const filteredClients =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return clients;
      }

      return clients.filter(
        (
          client,
        ) =>
          client.name
            .toLowerCase()
            .includes(
              query,
            ) ||
          (
            client.email ??
            ""
          )
            .toLowerCase()
            .includes(
              query,
            ) ||
          (
            client.phone ??
            ""
          )
            .toLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      clients,
      search,
    ]);

  const startChat =
    async (
      clientUserId:
        string,
    ) => {
      setCreatingId(
        clientUserId,
      );

      setError("");

      try {
        const conversation =
          await chatService.createConversation(
            clientUserId,
          );

        router.push(
          `/dashboard/communications/chat/${encodeURIComponent(
            conversation.id,
          )}`,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to start conversation.",
        );
      } finally {
        setCreatingId(
          null,
        );
      }
    };

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[900px]">
        <header className="flex items-center gap-4">
          <Link
            href="/dashboard/communications/chat"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
          >
            <ArrowLeft
              size={18}
            />
          </Link>

          <div>
            <h1 className="text-[25px] font-black tracking-[-0.035em]">
              New Conversation
            </h1>

            <p className="mt-1 text-[11px] text-black/40">
              Select a client to start or continue a conversation.
            </p>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="relative mt-7">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
          />

          <input
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search client by name, email or phone"
            className="h-[48px] w-full rounded-[12px] border border-black/10 bg-white pl-11 pr-4 text-[11px] outline-none"
          />
        </div>

        {loading ? (
          <div className="mt-6 grid min-h-[360px] place-items-center rounded-[20px] bg-white">
            <Loader2
              size={30}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : filteredClients.length ===
          0 ? (
          <div className="mt-6 grid min-h-[360px] place-items-center rounded-[20px] border border-dashed border-black/10 bg-white">
            <div className="text-center">
              <UserRound
                size={35}
                className="mx-auto text-[#2458E8]"
              />

              <p className="mt-4 text-[14px] font-black">
                No clients found
              </p>

              <p className="mt-2 text-[10px] text-black/40">
                Registered clients will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[20px] bg-white shadow-sm">
            {filteredClients.map(
              (
                client,
                index,
              ) => {
                const busy =
                  creatingId ===
                  client.userId;

                return (
                  <button
                    key={
                      client.userId
                    }
                    type="button"
                    disabled={
                      creatingId !==
                        null
                    }
                    onClick={() =>
                      void startChat(
                        client.userId,
                      )
                    }
                    className={`flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#F8F9FA] disabled:cursor-not-allowed ${
                      index > 0
                        ? "border-t border-black/5"
                        : ""
                    }`}
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EEF3FF] text-[#2458E8]">
                      <UserRound
                        size={20}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-black">
                        {
                          client.name
                        }
                      </p>

                      {client.email && (
                        <p className="mt-1 truncate text-[9px] text-black/35">
                          {
                            client.email
                          }
                        </p>
                      )}

                      {client.phone && (
                        <p className="mt-0.5 truncate text-[8px] text-black/25">
                          {
                            client.phone
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex h-[37px] min-w-[92px] items-center justify-center gap-2 rounded-[9px] bg-[#2458E8] px-3 text-[9px] font-bold text-white">
                      {busy ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <MessageCircle
                          size={13}
                        />
                      )}

                      {busy
                        ? "Opening"
                        : "Chat"}
                    </div>
                  </button>
                );
              },
            )}
          </div>
        )}
      </section>
    </main>
  );
}