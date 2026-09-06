"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Ban,
  Check,
  Clock3,
  CreditCard,
  Loader2,
  Lock,
  RefreshCw,
  ShieldOff,
  Snowflake,
  Sun,
  X,
  XCircle,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import {
  cardService,
  type TenantCard,
  type TenantCardPurchaseRequest,
} from "@/services/card.service";

import { getApiErrorMessage } from "@/lib/api";

type MainTab =
  | "requests"
  | "cards";

type RequestTab =
  | "pending"
  | "approved"
  | "rejected";

type CardStatusFilter =
  | "all"
  | "active"
  | "frozen"
  | "blocked"
  | "inactive";

type CardAction = {
  status:
    | "active"
    | "frozen"
    | "blocked"
    | "inactive";

  label: string;

  tone:
    | "blue"
    | "amber"
    | "red"
    | "green";

  icon:
    React.ReactNode;
};

export default function CardsManagementPage() {
  const [
    mainTab,
    setMainTab,
  ] =
    useState<MainTab>(
      "requests",
    );

  const [
    requestTab,
    setRequestTab,
  ] =
    useState<RequestTab>(
      "pending",
    );

  const [
    cardFilter,
    setCardFilter,
  ] =
    useState<CardStatusFilter>(
      "all",
    );

  const [
    requests,
    setRequests,
  ] =
    useState<
      TenantCardPurchaseRequest[]
    >([]);

  const [
    cards,
    setCards,
  ] =
    useState<
      TenantCard[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionId,
    setActionId,
  ] =
    useState("");

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

  const [
    rejectingRequest,
    setRejectingRequest,
  ] =
    useState<
      TenantCardPurchaseRequest | null
    >(null);

  const [
    cardAction,
    setCardAction,
  ] =
    useState<{
      card: TenantCard;
      status:
        | "active"
        | "frozen"
        | "blocked"
        | "inactive";
      label: string;
    } | null>(
      null,
    );

  /*
  |--------------------------------------------------------------------------
  | Load purchase requests
  |--------------------------------------------------------------------------
  */

  const loadRequests =
    useCallback(
      async (
        silent = false,
      ) => {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        try {
          const result =
            await cardService.listPurchaseRequests(
              requestTab,
              1,
              50,
            );

          setRequests(
            result.requests,
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load card requests.",
            ),
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [requestTab],
    );

  /*
  |--------------------------------------------------------------------------
  | Load issued cards
  |--------------------------------------------------------------------------
  */

  const loadCards =
    useCallback(
      async (
        silent = false,
      ) => {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        try {
          const result =
            await cardService.listIssuedCards(
              1,
              100,
            );

          setCards(
            result.cards,
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load issued cards.",
            ),
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | Initial / tab load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      mainTab ===
      "requests"
    ) {
      void loadRequests();
    } else {
      void loadCards();
    }
  }, [
    mainTab,
    loadRequests,
    loadCards,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Request actions
  |--------------------------------------------------------------------------
  */

  const approveRequest =
    async (
      request:
        TenantCardPurchaseRequest,
    ) => {
      setActionId(
        request.id,
      );

      setError("");
      setMessage("");

      try {
        await cardService.approvePurchaseRequest(
          request.id,
        );

        setMessage(
          `${request.customer_name}'s ${prettyCardType(
            request.card_type,
          )} has been approved and issued.`,
        );

        await loadRequests(
          true,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to approve card request.",
          ),
        );
      } finally {
        setActionId("");
      }
    };

  const rejectRequest =
    async (
      requestId: string,
      reason: string,
    ) => {
      setActionId(
        requestId,
      );

      setError("");
      setMessage("");

      try {
        await cardService.rejectPurchaseRequest(
          requestId,
          reason,
        );

        setRejectingRequest(
          null,
        );

        setMessage(
          "Card request rejected.",
        );

        await loadRequests(
          true,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to reject card request.",
          ),
        );
      } finally {
        setActionId("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Issued card actions
  |--------------------------------------------------------------------------
  */

  const updateCardStatus =
    async (
      card: TenantCard,
      status:
        | "active"
        | "frozen"
        | "blocked"
        | "inactive",
      reason?: string,
    ) => {
      setActionId(
        card.id,
      );

      setError("");
      setMessage("");

      try {
        const updated =
          await cardService.changeIssuedCardStatus(
            card.id,
            status,
            reason,
          );

        setCards(
          (
            current,
          ) =>
            current.map(
              (
                item,
              ) =>
                item.id ===
                updated.id
                  ? {
                      ...item,
                      ...updated,
                    }
                  : item,
            ),
        );

        setCardAction(
          null,
        );

        setMessage(
          `${prettyCardType(
            card.card_type,
          )} status changed to ${status}.`,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to update card status.",
          ),
        );
      } finally {
        setActionId("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Filter issued cards
  |--------------------------------------------------------------------------
  */

  const filteredCards =
    useMemo(() => {
      if (
        cardFilter ===
        "all"
      ) {
        return cards;
      }

      return cards.filter(
        (card) =>
          card.status ===
          cardFilter,
      );
    }, [
      cards,
      cardFilter,
    ]);

  const cardCounts =
    useMemo(
      () => ({
        all:
          cards.length,

        active:
          cards.filter(
            (card) =>
              card.status ===
              "active",
          ).length,

        frozen:
          cards.filter(
            (card) =>
              card.status ===
              "frozen",
          ).length,

        blocked:
          cards.filter(
            (card) =>
              card.status ===
              "blocked",
          ).length,

        inactive:
          cards.filter(
            (card) =>
              card.status ===
              "inactive",
          ).length,
      }),
      [cards],
    );

  const refresh =
    () => {
      if (
        mainTab ===
        "requests"
      ) {
        void loadRequests();
      } else {
        void loadCards();
      }
    };

  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-80px)] overflow-x-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.13),transparent_16%)] bg-black px-4 py-8 text-white md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1200px]">

          {/* TOP BAR */}

          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/15"
            >
              <ArrowLeft
                size={20}
              />
            </Link>

            <button
              type="button"
              onClick={
                refresh
              }
              disabled={
                loading
              }
              className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* HEADER */}

          <header className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              Card management
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#2f73ff] md:text-5xl">
              Client Cards
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              Review card applications and manage cards already issued to your customers.
            </p>
          </header>

          {(error ||
            message) && (
            <div
              className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
                error
                  ? "border border-red-500/30 bg-red-950/70 text-red-100"
                  : "border border-emerald-500/30 bg-emerald-950/70 text-emerald-100"
              }`}
            >
              {error ||
                message}
            </div>
          )}

          {/* MAIN TAB */}

          <div className="mt-8 grid grid-cols-2 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() =>
                setMainTab(
                  "requests",
                )
              }
              className={`h-12 rounded-xl text-sm font-black transition ${
                mainTab ===
                "requests"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Card Requests
            </button>

            <button
              type="button"
              onClick={() =>
                setMainTab(
                  "cards",
                )
              }
              className={`h-12 rounded-xl text-sm font-black transition ${
                mainTab ===
                "cards"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Issued Cards
            </button>
          </div>

          {mainTab ===
          "requests" ? (
            <>
              {/* REQUEST FILTER */}

              <div className="mt-5 flex overflow-x-auto rounded-2xl bg-white/5 p-1">
                <RequestTabButton
                  active={
                    requestTab ===
                    "pending"
                  }
                  onClick={() =>
                    setRequestTab(
                      "pending",
                    )
                  }
                  icon={
                    <Clock3
                      size={15}
                    />
                  }
                  label="Pending"
                />

                <RequestTabButton
                  active={
                    requestTab ===
                    "approved"
                  }
                  onClick={() =>
                    setRequestTab(
                      "approved",
                    )
                  }
                  icon={
                    <Check
                      size={15}
                    />
                  }
                  label="Approved"
                />

                <RequestTabButton
                  active={
                    requestTab ===
                    "rejected"
                  }
                  onClick={() =>
                    setRequestTab(
                      "rejected",
                    )
                  }
                  icon={
                    <XCircle
                      size={15}
                    />
                  }
                  label="Rejected"
                />
              </div>

              {loading ? (
                <LoadingState
                  label="Loading card requests…"
                />
              ) : requests.length ===
                0 ? (
                <EmptyState
                  title={`No ${requestTab} card requests`}
                  description="Card applications will appear here when clients submit them."
                />
              ) : (
                <section className="mt-6 grid gap-5 lg:grid-cols-2">
                  {requests.map(
                    (
                      request,
                    ) => (
                      <RequestCard
                        key={
                          request.id
                        }
                        request={
                          request
                        }
                        busy={
                          actionId ===
                          request.id
                        }
                        onApprove={() =>
                          void approveRequest(
                            request,
                          )
                        }
                        onReject={() =>
                          setRejectingRequest(
                            request,
                          )
                        }
                      />
                    ),
                  )}
                </section>
              )}
            </>
          ) : (
            <>
              {/* CARD FILTER */}

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {(
                  [
                    "all",
                    "active",
                    "frozen",
                    "blocked",
                    "inactive",
                  ] as const
                ).map(
                  (
                    status,
                  ) => (
                    <button
                      key={
                        status
                      }
                      type="button"
                      onClick={() =>
                        setCardFilter(
                          status,
                        )
                      }
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                        cardFilter ===
                        status
                          ? "bg-[#2f73ff] text-white shadow-sm"
                          : "bg-white/10 text-white/55 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {status}
                      {" "}
                      {
                        cardCounts[
                          status
                        ]
                      }
                    </button>
                  ),
                )}
              </div>

              {loading ? (
                <LoadingState
                  label="Loading issued cards…"
                />
              ) : filteredCards.length ===
                0 ? (
                <EmptyState
                  title="No cards found"
                  description="Issued cards matching this status will appear here."
                />
              ) : (
                <section className="mt-6 grid gap-5 lg:grid-cols-2">
                  {filteredCards.map(
                    (
                      card,
                    ) => (
                      <IssuedCard
                        key={
                          card.id
                        }
                        card={
                          card
                        }
                        busy={
                          actionId ===
                          card.id
                        }
                        onAction={(
                          status,
                          label,
                        ) =>
                          setCardAction(
                            {
                              card,
                              status,
                              label,
                            },
                          )
                        }
                      />
                    ),
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {/* REJECTION OVERLAY */}

        <RejectOverlay
          request={
            rejectingRequest
          }
          busy={
            Boolean(
              rejectingRequest &&
                actionId ===
                  rejectingRequest.id,
            )
          }
          onClose={() =>
            setRejectingRequest(
              null,
            )
          }
          onReject={(
            reason,
          ) => {
            if (
              rejectingRequest
            ) {
              void rejectRequest(
                rejectingRequest.id,
                reason,
              );
            }
          }}
        />

        {/* CARD STATUS ACTION */}

        <CardActionOverlay
          action={
            cardAction
          }
          busy={
            Boolean(
              cardAction &&
                actionId ===
                  cardAction.card.id,
            )
          }
          onClose={() =>
            setCardAction(
              null,
            )
          }
          onConfirm={(
            reason,
          ) => {
            if (
              !cardAction
            ) {
              return;
            }

            void updateCardStatus(
              cardAction.card,
              cardAction.status,
              reason,
            );
          }}
        />
      </main>
    </AppShell>
  );
}

/*
|--------------------------------------------------------------------------
| PURCHASE REQUEST
|--------------------------------------------------------------------------
*/

function RequestCard({
  request,
  busy,
  onApprove,
  onReject,
}: {
  request:
    TenantCardPurchaseRequest;

  busy: boolean;

  onApprove: () => void;

  onReject: () => void;
}) {
  const pending =
    request.status ===
    "pending";

  return (
    <article className="overflow-hidden rounded-[24px] border border-white/10 bg-white text-[#252525] shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-black/5 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E8F0FF] text-[#2458E8]">
            <CreditCard
              size={21}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[16px] font-black text-neutral-900">
              {
                request.customer_name
              }
            </p>

            <p className="mt-1 truncate text-xs text-black/40">
              {
                request.customer_email
              }
            </p>
          </div>
        </div>

        <StatusBadge
          status={
            request.status
          }
        />
      </div>

      <div className="p-5">
        <h2 className="text-xl font-black text-neutral-900">
          {prettyCardType(
            request.card_type,
          )}
        </h2>

        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#2458E8]">
          {request.card_brand ||
            "Zentra"}
        </p>

        <div className="mt-5 grid gap-3 rounded-2xl bg-[#F8FAFC] p-4 text-sm">
          <InfoRow
            label="Linked account"
            value={`${
              request.account_name
            } •••• ${request.account_number.slice(
              -4,
            )}`}
          />

          <InfoRow
            label="Account currency"
            value={
              request.account_currency
            }
          />

          <InfoRow
            label="Price"
            value={formatMoney(
              request.price,
              request.currency,
            )}
          />

          <InfoRow
            label="Payment"
            value={
              request.payment_method
            }
          />

          <InfoRow
            label="Reference"
            value={
              request.payment_reference ||
              "Not supplied"
            }
            wrap
          />

          <InfoRow
            label="Submitted"
            value={new Date(
              request.created_at,
            ).toLocaleString()}
          />
        </div>

        {request.status ===
          "rejected" &&
          request.rejection_reason && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {
                request.rejection_reason
              }
            </div>
          )}

        {request.status ===
          "approved" &&
          request.issued_card_id && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              Card issued successfully.
            </div>
          )}

        {pending && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={
                onReject
              }
              disabled={
                busy
              }
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <X
                size={16}
              />
              Reject
            </button>

            <button
              type="button"
              onClick={
                onApprove
              }
              disabled={
                busy
              }
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2458E8] text-sm font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              {busy ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Check
                  size={16}
                />
              )}

              Approve
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| ISSUED CARD
|--------------------------------------------------------------------------
*/

function IssuedCard({
  card,
  busy,
  onAction,
}: {
  card: TenantCard;

  busy: boolean;

  onAction: (
    status:
      | "active"
      | "frozen"
      | "blocked"
      | "inactive",
    label: string,
  ) => void;
}) {
  const actions =
    getCardActions(
      card.status,
    );

  return (
    <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white text-[#252525] shadow-xl">
      <div className="bg-gradient-to-br from-[#1D4ED8] via-[#2458E8] to-[#12285f] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-white/55">
              {
                card.card_brand
              }
            </p>

            <h2 className="mt-1 text-xl font-black">
              {prettyCardType(
                card.card_type,
              )}
            </h2>
          </div>

          <StatusBadge
            status={
              card.status
            }
          />
        </div>

        <p className="mt-9 text-lg tracking-[0.14em]">
          {
            card.masked_pan
          }
        </p>

        <div className="mt-5 flex items-end justify-between text-sm">
          <div>
            <p className="text-[10px] uppercase text-white/45">
              Expires
            </p>

            <p className="font-bold">
              {String(
                card.expiry_month,
              ).padStart(
                2,
                "0",
              )}
              /
              {String(
                card.expiry_year,
              ).slice(-2)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase text-white/45">
              Linked account
            </p>

            <p className="font-bold">
              ••••{" "}
              {card.account_number?.slice(
                -4,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-3 rounded-2xl bg-[#F8FAFC] p-4 text-sm">
          {"customer_name" in
            card &&
            Boolean(
              (
                card as TenantCard & {
                  customer_name?: string;
                }
              ).customer_name,
            ) && (
              <InfoRow
                label="Customer"
                value={
                  (
                    card as TenantCard & {
                      customer_name?: string;
                    }
                  ).customer_name ||
                  "—"
                }
              />
            )}

          <InfoRow
            label="Account"
            value={
              card.account_name
            }
          />

          <InfoRow
            label="Currency"
            value={
              card.currency
            }
          />

          <InfoRow
            label="Daily limit"
            value={formatMoney(
              card.daily_spend_limit,
              card.currency,
            )}
          />

          <InfoRow
            label="Card format"
            value={
              card.is_virtual
                ? "Virtual"
                : "Physical"
            }
          />
        </div>

        {actions.length >
        0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {actions.map(
              (
                action,
              ) => (
                <button
                  key={
                    action.status
                  }
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() =>
                    onAction(
                      action.status,
                      action.label,
                    )
                  }
                  className={actionButtonClass(
                    action.tone,
                  )}
                >
                  {busy ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    action.icon
                  )}

                  {
                    action.label
                  }
                </button>
              ),
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-neutral-100 px-4 py-3 text-center text-xs font-semibold text-neutral-500">
            No further card actions are available.
          </div>
        )}
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| ACTION RULES
|--------------------------------------------------------------------------
*/

function getCardActions(
  status: TenantCard["status"],
): CardAction[] {
  switch (status) {
    case "active":
      return [
        {
          status:
            "frozen",
          label:
            "Freeze",
          tone:
            "amber",
          icon:
            <Snowflake
              size={15}
            />,
        },

        {
          status:
            "blocked",
          label:
            "Block",
          tone:
            "red",
          icon:
            <Ban
              size={15}
            />,
        },

        {
          status:
            "inactive",
          label:
            "Deactivate",
          tone:
            "red",
          icon:
            <ShieldOff
              size={15}
            />,
        },
      ];

    case "frozen":
      return [
        {
          status:
            "active",
          label:
            "Unfreeze",
          tone:
            "green",
          icon:
            <Sun
              size={15}
            />,
        },

        {
          status:
            "blocked",
          label:
            "Block",
          tone:
            "red",
          icon:
            <Ban
              size={15}
            />,
        },

        {
          status:
            "inactive",
          label:
            "Deactivate",
          tone:
            "red",
          icon:
            <ShieldOff
              size={15}
            />,
        },
      ];

    case "blocked":
      return [
        {
          status:
            "active",
          label:
            "Unblock",
          tone:
            "green",
          icon:
            <Lock
              size={15}
            />,
        },

        {
          status:
            "inactive",
          label:
            "Deactivate",
          tone:
            "red",
          icon:
            <ShieldOff
              size={15}
            />,
        },
      ];

    default:
      return [];
  }
}

/*
|--------------------------------------------------------------------------
| REQUEST TABS
|--------------------------------------------------------------------------
*/

function RequestTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon:
    React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex h-11 min-w-[120px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
        active
          ? "bg-white text-black shadow-sm"
          : "text-white/55 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "active" ||
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"

      : status ===
          "pending"
        ? "bg-amber-50 text-amber-700 border border-amber-200"

        : status ===
            "frozen"
          ? "bg-sky-50 text-sky-700 border border-sky-200"

          : status ===
              "blocked"
            ? "bg-orange-50 text-orange-700 border border-orange-200"

            : status ===
                "rejected" ||
                status ===
                  "inactive"
              ? "bg-red-50 text-red-700 border border-red-200"

              : "bg-neutral-100 text-neutral-600 border border-neutral-200";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${classes}`}
    >
      {status}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| INFO
|--------------------------------------------------------------------------
*/

function InfoRow({
  label,
  value,
  wrap = false,
}: {
  label: string;
  value: string;
  wrap?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-black/40">
        {label}
      </span>

      <span
        className={`text-right font-bold text-neutral-800 ${
          wrap
            ? "max-w-[60%] break-all"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| REJECT REQUEST
|--------------------------------------------------------------------------
*/

function RejectOverlay({
  request,
  busy,
  onClose,
  onReject,
}: {
  request:
    TenantCardPurchaseRequest | null;

  busy: boolean;

  onClose: () => void;

  onReject: (
    reason: string,
  ) => void;
}) {
  const [
    reason,
    setReason,
  ] =
    useState("");

  useEffect(() => {
    if (!request) {
      setReason("");
    }
  }, [request]);

  if (!request) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 px-4">
      <section className="w-full max-w-md rounded-[24px] bg-white p-6 text-[#252525] shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-neutral-900">
              Reject card request
            </h2>

            <p className="mt-1 text-sm text-black/45">
              {
                request.customer_name
              }
              {" — "}
              {prettyCardType(
                request.card_type,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
          >
            <X
              size={17}
            />
          </button>
        </div>

        <textarea
          value={
            reason
          }
          onChange={(
            event,
          ) =>
            setReason(
              event.target
                .value,
            )
          }
          maxLength={
            500
          }
          placeholder="Why is this card request being rejected?"
          className="mt-6 h-28 w-full resize-none rounded-xl border border-black/10 p-3 text-sm text-neutral-900 outline-none transition focus:border-red-400"
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="h-11 rounded-xl bg-neutral-100 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              onReject(
                reason.trim(),
              )
            }
            disabled={
              busy ||
              reason.trim()
                .length <
                3
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
          >
            {busy && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Reject
          </button>
        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CARD ACTION OVERLAY
|--------------------------------------------------------------------------
*/

function CardActionOverlay({
  action,
  busy,
  onClose,
  onConfirm,
}: {
  action: {
    card: TenantCard;

    status:
      | "active"
      | "frozen"
      | "blocked"
      | "inactive";

    label: string;
  } | null;

  busy: boolean;

  onClose: () => void;

  onConfirm: (
    reason?: string,
  ) => void;
}) {
  const [
    reason,
    setReason,
  ] =
    useState("");

  useEffect(() => {
    if (!action) {
      setReason("");
    }
  }, [action]);

  if (!action) {
    return null;
  }

  const needsReason =
    action.status ===
      "blocked" ||
    action.status ===
      "inactive";

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 px-4">
      <section className="w-full max-w-md rounded-[24px] bg-white p-6 text-[#252525] shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-neutral-900">
              {action.label} card
            </h2>

            <p className="mt-1 text-sm text-black/45">
              {prettyCardType(
                action.card
                  .card_type,
              )}
              {" • "}
              {
                action.card
                  .masked_pan
              }
            </p>
          </div>

          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              onClose
            }
            className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
          >
            <X
              size={17}
            />
          </button>
        </div>

        {needsReason && (
          <label className="mt-6 block">
            <span className="text-sm font-bold text-neutral-900">
              Reason
            </span>

            <textarea
              value={
                reason
              }
              onChange={(
                event,
              ) =>
                setReason(
                  event.target
                    .value,
                )
              }
              maxLength={
                500
              }
              placeholder={`Reason for ${action.label.toLowerCase()}ing this card`}
              className="mt-2 h-24 w-full resize-none rounded-xl border border-black/10 p-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
            />
          </label>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="h-11 rounded-xl bg-neutral-100 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              busy ||
              (
                needsReason &&
                reason.trim()
                  .length <
                  3
              )
            }
            onClick={() =>
              onConfirm(
                reason.trim() ||
                  undefined,
              )
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2458E8] text-sm font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-40"
          >
            {busy && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Confirm
          </button>
        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMMON UI
|--------------------------------------------------------------------------
*/

function LoadingState({
  label,
}: {
  label: string;
}) {
  return (
    <div className="grid min-h-[350px] place-items-center">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-[#2f73ff]" />

        <p className="mt-3 text-sm text-white/45">
          {label}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 grid min-h-[300px] place-items-center rounded-[24px] border border-dashed border-white/15 bg-white/5 px-5 text-center">
      <div>
        <CreditCard
          size={36}
          className="mx-auto text-white/20"
        />

        <p className="mt-4 font-black">
          {title}
        </p>

        <p className="mt-2 text-sm text-white/40">
          {description}
        </p>
      </div>
    </div>
  );
}

function actionButtonClass(
  tone:
    | "blue"
    | "amber"
    | "red"
    | "green",
) {
  const styles = {
    blue:
      "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",

    amber:
      "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",

    red:
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",

    green:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  };

  return `flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-xs transition disabled:opacity-50 ${styles[tone]}`;
}

function prettyCardType(
  value: string,
) {
  return `${value
    .charAt(0)
    .toUpperCase()}${value.slice(
    1,
  )} Card`;
}

function formatMoney(
  amount:
    | string
    | number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-GB",
    {
      style:
        "currency",

      currency,

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    },
  ).format(
    Number(amount) ||
      0,
  );
}