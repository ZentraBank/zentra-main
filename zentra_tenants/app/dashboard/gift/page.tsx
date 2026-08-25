"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Gift,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  bankingService,
} from "@/services/banking.service";

import {
  giftService,
} from "@/services/gift.service";

import type {
  BankAccount,
} from "@/types/banking.types";

import type {
  Gift as GiftRecord,
} from "@/types/gift.types";

type TimerOption =
  | "1_hour"
  | "6_hours"
  | "24_hours"
  | "3_days"
  | "10_days"
  | "custom";

type GiftPageTab =
  | "send"
  | "sent";

type GiftStatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "declined"
  | "processed"
  | "cancelled"
  | "expired";

const timerOptions: Array<{
  label: string;
  shortLabel: string;
  value: TimerOption;
}> = [
  {
    label: "1 Hour",
    shortLabel: "1",
    value: "1_hour",
  },
  {
    label: "6 Hours",
    shortLabel: "6",
    value: "6_hours",
  },
  {
    label: "24 Hours",
    shortLabel: "24",
    value: "24_hours",
  },
  {
    label: "3 Days",
    shortLabel: "3",
    value: "3_days",
  },
  {
    label: "10 Days",
    shortLabel: "10",
    value: "10_days",
  },
  {
    label: "Custom",
    shortLabel: "Custom",
    value: "custom",
  },
];

const initialForm = {
  accountId: "",
  amount: "",
  redemptionFee: "",
  senderName: "",
  message: "",
  timer: "10_days" as TimerOption,
  customExpiry: "",
};

export default function GiftPage() {
  const searchParams =
    useSearchParams();

  const [
    activeTab,
    setActiveTab,
  ] = useState<GiftPageTab>(
    "send",
  );

  const [
    sentGifts,
    setSentGifts,
  ] = useState<GiftRecord[]>(
    [],
  );

  const [
    loadingGifts,
    setLoadingGifts,
  ] = useState(false);

  const [
    giftsError,
    setGiftsError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<GiftStatusFilter>(
    "all",
  );

  const [
    cancellingGiftId,
    setCancellingGiftId,
  ] = useState<string | null>(
    null,
  );

  const [
    accounts,
    setAccounts,
  ] = useState<BankAccount[]>([]);

  const [
    loadingAccounts,
    setLoadingAccounts,
  ] = useState(true);

  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    createdGift,
    setCreatedGift,
  ] =
    useState<GiftRecord | null>(
      null,
    );

  useEffect(() => {
    const loadAccounts =
      async () => {
        setLoadingAccounts(
          true,
        );

        setError("");

        try {
          const result =
            await bankingService.getTenantAccounts();

          setAccounts(
            result.filter(
              (account) =>
                account.status ===
                "active",
            ),
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load client accounts.",
          );
        } finally {
          setLoadingAccounts(
            false,
          );
        }
      };

    void loadAccounts();
  }, []);

  const loadSentGifts =
    useCallback(
      async () => {
        setLoadingGifts(true);
        setGiftsError("");

        try {
          const result =
            await giftService.list({
              page: 1,
              pageSize: 100,
            });

          setSentGifts(
            result.gifts ?? [],
          );
        } catch (err) {
          setGiftsError(
            err instanceof Error
              ? err.message
              : "Unable to load sent gifts.",
          );
        } finally {
          setLoadingGifts(false);
        }
      },
      [],
    );

  useEffect(() => {
    if (activeTab !== "sent") {
      return;
    }

    void loadSentGifts();
  }, [
    activeTab,
    loadSentGifts,
  ]);

  useEffect(() => {
    const giftId =
      searchParams.get(
        "giftId",
      );

    if (!giftId) {
      return;
    }

    const loadReceipt =
      async () => {
        try {
          const result =
            await giftService.get(
              giftId,
            );

          setCreatedGift(
            result,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load gift receipt.",
          );
        }
      };

    void loadReceipt();
  }, [searchParams]);

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            form.accountId,
        ) ?? null,
      [
        accounts,
        form.accountId,
      ],
    );

  const amount =
    Number(form.amount) || 0;

  const redemptionFee =
    Number(
      form.redemptionFee,
    ) || 0;

  const recipientAmount =
    amount;

  const expiresAt =
    useMemo(
      () =>
        resolveExpiry(
          form.timer,
          form.customExpiry,
        ),
      [
        form.timer,
        form.customExpiry,
      ],
    );

  const countdown =
    useCountdown(
      expiresAt,
    );

  const filteredGifts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return sentGifts.filter(
        (gift) => {
          const statusMatches =
            statusFilter ===
              "all" ||
            gift.status ===
              statusFilter;

          if (!statusMatches) {
            return false;
          }

          if (!query) {
            return true;
          }

          const clientName =
            [
              gift.client_first_name,
              gift.client_middle_name,
              gift.client_last_name,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return (
            clientName.includes(
              query,
            ) ||
            (gift.account_name ?? "")
              .toLowerCase()
              .includes(query) ||
            (gift.account_number ?? "").includes(
              query,
            ) ||
            gift.id
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [
      sentGifts,
      search,
      statusFilter,
    ]);

  const cancelSentGift =
    async (giftId: string) => {
      const confirmed =
        window.confirm(
          "Cancel this pending gift? The client will no longer be able to accept it.",
        );

      if (!confirmed) {
        return;
      }

      setCancellingGiftId(
        giftId,
      );
      setGiftsError("");

      try {
        await giftService.cancel(
          giftId,
        );

        await loadSentGifts();
      } catch (err) {
        setGiftsError(
          err instanceof Error
            ? err.message
            : "Unable to cancel gift.",
        );
      } finally {
        setCancellingGiftId(
          null,
        );
      }
    };

  const updateField = <
    K extends keyof typeof initialForm,
  >(
    name: K,
    value:
      (typeof initialForm)[K],
  ) => {
    setForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );

    setError("");
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError("");

      if (!selectedAccount) {
        setError(
          "Select a client account.",
        );

        return;
      }

      if (
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        setError(
          "Enter a valid gift amount.",
        );

        return;
      }

      if (
        !Number.isFinite(
          redemptionFee,
        ) ||
        redemptionFee < 0
      ) {
        setError(
          "Enter a valid redemption fee.",
        );

        return;
      }

      if (
        form.senderName.trim()
          .length < 2
      ) {
        setError(
          "Enter who the gift is coming from.",
        );

        return;
      }

      if (!expiresAt) {
        setError(
          "Select a valid expiry time.",
        );

        return;
      }

      if (
        new Date(
          expiresAt,
        ).getTime() <=
        Date.now()
      ) {
        setError(
          "Gift expiry must be in the future.",
        );

        return;
      }

      setSubmitting(true);

      try {
        const gift =
          await giftService.create({
            accountNumber:
              selectedAccount.account_number,

            amount,

            redemptionFee,

            currency:
              selectedAccount.currency,

            senderName:
              form.senderName.trim(),

            message:
              form.message.trim() ||
              undefined,

            expiresAt,
          });

        setCreatedGift(
          gift,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create gift.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  if (createdGift) {
    return (
      <GiftSuccess
        gift={createdGift}
        onCreateAnother={() => {
          setCreatedGift(
            null,
          );

          setForm(
            initialForm,
          );
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#171717]">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-black/5 pb-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-black/70"
          >
            <ArrowLeft
              size={17}
            />

            Back to Dashboard
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#FFF4CC] text-[#DDAF27]">
              Z
            </div>

            <span className="font-serif text-[22px] font-semibold tracking-[0.22em]">
              ZENTRABANK
            </span>
          </div>

          <div className="w-[140px]" />
        </header>

        <div className="mt-7 flex items-center gap-2 rounded-[14px] border border-black/5 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "send",
              )
            }
            className={`flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] text-[12px] font-bold transition ${
              activeTab === "send"
                ? "bg-[#2458E8] text-white shadow-sm"
                : "text-black/50 hover:bg-[#F8FAFC]"
            }`}
          >
            <Send size={15} />
            Send Gift
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "sent",
              )
            }
            className={`flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] text-[12px] font-bold transition ${
              activeTab === "sent"
                ? "bg-[#2458E8] text-white shadow-sm"
                : "text-black/50 hover:bg-[#F8FAFC]"
            }`}
          >
            <Gift size={15} />
            Sent Gifts

            {sentGifts.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] ${
                  activeTab === "sent"
                    ? "bg-white/15 text-white"
                    : "bg-[#EEF4FF] text-[#2458E8]"
                }`}
              >
                {sentGifts.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "send" && (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[22px] border border-black/5 bg-white p-5 shadow-sm md:p-7">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-[#EEF4FF] text-[#2458E8]">
                <Gift
                  size={27}
                />
              </div>

              <div>
                <h1 className="text-[28px] font-black tracking-[-0.04em]">
                  Send Gifted Funds
                </h1>

                <p className="mt-1 max-w-[460px] text-[13px] leading-5 text-black/45">
                  Send a gift to a
                  client. They will
                  be notified and
                  can accept or
                  decline it before
                  the timer expires.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7"
            >
              <FieldBlock
                label="Select Client Account"
                helper="Choose a registered client account"
              >
                <div className="relative">
                  <select
                    value={
                      form.accountId
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "accountId",
                        event.target.value,
                      )
                    }
                    disabled={
                      loadingAccounts
                    }
                    className="h-[64px] w-full appearance-none rounded-[12px] border border-black/10 bg-white px-4 pr-11 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-[#2458E8]/15 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingAccounts
                        ? "Loading client accounts..."
                        : "Select client account"}
                    </option>

                    {accounts.map(
                      (
                        account,
                      ) => (
                        <option
                          key={
                            account.id
                          }
                          value={
                            account.id
                          }
                        >
                          {formatAccountOption(
                            account,
                          )}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/35"
                  />
                </div>
              </FieldBlock>

              {selectedAccount && (
                <div className="mt-3 rounded-[12px] bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-black">
                        {selectedAccount.client_name ||
                          selectedAccount.account_name}
                      </p>

                      <p className="mt-1 text-[11px] text-black/40">
                        ••••{" "}
                        {selectedAccount.account_number.slice(
                          -4,
                        )}{" "}
                        ·{" "}
                        {
                          selectedAccount.currency
                        }
                      </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-bold uppercase text-green-700">
                      {
                        selectedAccount.status
                      }
                    </span>
                  </div>
                </div>
              )}

              <FieldBlock
                label="Gift Amount"
              >
                <MoneyInput
                  currency={
                    selectedAccount?.currency ??
                    "USD"
                  }
                  value={
                    form.amount
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "amount",
                      value,
                    )
                  }
                />
              </FieldBlock>

              <FieldBlock
                label="Tier-2 Redemption Fee"
                helper="This fee will be charged to the client upon redemption"
              >
                <MoneyInput
                  currency={
                    selectedAccount?.currency ??
                    "USD"
                  }
                  value={
                    form.redemptionFee
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "redemptionFee",
                      value,
                    )
                  }
                />
              </FieldBlock>

              <FieldBlock
                label="Gift From"
                helper="Enter who the gift is coming from"
              >
                <input
                  value={
                    form.senderName
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "senderName",
                      event.target.value,
                    )
                  }
                  placeholder="ZentraBank Rewards"
                  className="h-[52px] w-full rounded-[12px] border border-black/10 px-4 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-[#2458E8]/15"
                />
              </FieldBlock>

              <FieldBlock
                label="Message to Client"
                helper="Add a personal message for the client"
              >
                <textarea
                  value={
                    form.message
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "message",
                      event.target.value,
                    )
                  }
                  maxLength={200}
                  placeholder="Enjoy your reward! Thank you for banking with us."
                  className="h-[112px] w-full resize-none rounded-[12px] border border-black/10 px-4 py-3 text-[13px] leading-5 outline-none focus:ring-2 focus:ring-[#2458E8]/15"
                />

                <p className="mt-1 text-right text-[9px] text-black/30">
                  {
                    form.message
                      .length
                  }
                  /200
                </p>
              </FieldBlock>

              <FieldBlock
                label="Response Timer"
                helper="Set how long the client has to accept or decline this gift"
              >
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {timerOptions.map(
                    (
                      option,
                    ) => {
                      const active =
                        form.timer ===
                        option.value;

                      return (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() =>
                            updateField(
                              "timer",
                              option.value,
                            )
                          }
                          className={`min-h-[62px] rounded-[10px] border px-2 text-center transition ${
                            active
                              ? "border-[#2458E8] bg-[#F3F7FF] text-[#2458E8]"
                              : "border-black/10 bg-white text-black/60 hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <p className="text-[14px] font-black">
                            {
                              option.shortLabel
                            }
                          </p>

                          <p className="mt-1 text-[9px] font-semibold">
                            {
                              option.label
                            }
                          </p>
                        </button>
                      );
                    },
                  )}
                </div>
              </FieldBlock>

              {form.timer ===
                "custom" && (
                <FieldBlock
                  label="Custom Expiry"
                >
                  <input
                    type="datetime-local"
                    value={
                      form.customExpiry
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "customExpiry",
                        event.target.value,
                      )
                    }
                    className="h-[52px] w-full rounded-[12px] border border-black/10 px-4 text-[13px] font-semibold outline-none"
                  />
                </FieldBlock>
              )}

              <div className="mt-6 rounded-[16px] bg-[#F4F7FF] px-4 py-4">
                <p className="text-[12px] font-black text-[#2458E8]">
                  Gift Summary
                </p>

                <div className="mt-4 space-y-3">
                  <SummaryRow
                    label="Gift Amount"
                    value={formatMoney(
                      amount,
                      selectedAccount?.currency ??
                        "USD",
                    )}
                  />

                  <SummaryRow
                    label="Redemption Fee"
                    value={formatMoney(
                      redemptionFee,
                      selectedAccount?.currency ??
                        "USD",
                    )}
                    danger
                  />

                  <SummaryRow
                    label="Recipient Will Receive"
                    value={formatMoney(
                      recipientAmount,
                      selectedAccount?.currency ??
                        "USD",
                    )}
                    success
                  />
                </div>

                <div className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-[#2458E8]">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    The gift will
                    only become
                    available after
                    the client
                    accepts it.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingAccounts
                }
                className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#2458E8] text-[14px] font-bold text-white shadow-sm transition hover:bg-[#1F4FD1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Sending...
                  </>
                ) : (
                  <>
                    <Send
                      size={17}
                    />

                    Send Gifted Funds
                  </>
                )}
              </button>
            </form>
          </section>

          <aside className="rounded-[22px] border border-black/5 bg-white p-5 shadow-sm md:p-7">
            <p className="text-center text-[13px] font-semibold uppercase tracking-[0.12em] text-black/45">
              Preview
            </p>

            <div className="mt-5 rounded-[20px] border border-black/10 px-5 py-6">
              <h2 className="text-center text-[22px] font-black">
                Gifted Funds
              </h2>

              <div className="mx-auto mt-5 grid h-[170px] w-[170px] place-items-center rounded-full bg-[#FFE446] shadow-[0_10px_25px_rgba(0,0,0,0.12)]">
                <Gift
                  size={72}
                  className="text-[#1375B9]"
                  strokeWidth={
                    1.5
                  }
                />
              </div>

              <p className="mt-6 text-center text-[44px] font-black tracking-[-0.04em] text-[#49A476]">
                {formatMoney(
                  amount,
                  selectedAccount?.currency ??
                    "USD",
                )}
              </p>

              <p className="mt-1 text-center text-[16px] font-bold text-[#2458E8]">
                Gift Sent!
              </p>

              <CountdownCard
                countdown={
                  countdown
                }
              />

              <div className="mt-6 text-center">
                <p className="text-[11px] text-black/45">
                  Sent to
                </p>

                <p className="mt-1 text-[18px] font-black">
                  {selectedAccount
                    ? selectedAccount.client_name ||
                      selectedAccount.account_name
                    : "Select a client"}
                </p>
              </div>

              <div className="mt-7 space-y-4">
                <ReceiptRow
                  label="Current account status"
                  value={
                    selectedAccount?.status ||
                    "—"
                  }
                />

                <ReceiptRow
                  label="Tier-2 Redemption fee"
                  value={formatMoney(
                    redemptionFee,
                    selectedAccount?.currency ??
                      "USD",
                  )}
                  danger
                />

                <ReceiptRow
                  label="Recipient will receive"
                  value={formatMoney(
                    recipientAmount,
                    selectedAccount?.currency ??
                      "USD",
                  )}
                  success
                />

                <ReceiptRow
                  label="Transaction date"
                  value={formatDate(
                    new Date().toISOString(),
                  )}
                />

                <ReceiptRow
                  label="Available Balance"
                  value={
                    selectedAccount
                      ? formatMoney(
                          selectedAccount.balance,
                          selectedAccount.currency,
                        )
                      : "—"
                  }
                />

                <ReceiptRow
                  label="Transaction time"
                  value={formatTime(
                    new Date(),
                  )}
                />

                <ReceiptRow
                  label="Transaction ID"
                  value="Pending"
                />

                <ReceiptRow
                  label="Type"
                  value="Gifted Funds"
                />

                <ReceiptRow
                  label="Authorization Code"
                  value="Pending"
                />
              </div>

              <div className="mt-7 border-t border-black/10 pt-5">
                <div className="flex items-center justify-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#FFF4CC] text-[#DDAF27]">
                    Z
                  </div>

                  <span className="font-serif text-[15px] font-semibold tracking-[0.18em]">
                    ZENTRABANK
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[16px] bg-[#F4F7FF] px-4 py-4">
              <div className="flex items-start gap-3">
                <Clock3
                  size={18}
                  className="mt-0.5 shrink-0 text-[#2458E8]"
                />

                <div>
                  <p className="text-[11px] font-black text-[#2458E8]">
                    How it works
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-black/50">
                    The client will
                    be notified of
                    this gift and
                    can accept or
                    decline it before
                    the timer
                    expires. The full
                    gifted amount remains
                    available to the client.
                    Any redemption fee is
                    handled separately.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
        )}

        {activeTab === "sent" && (
          <SentGiftsPanel
            gifts={filteredGifts}
            loading={loadingGifts}
            error={giftsError}
            search={search}
            statusFilter={statusFilter}
            cancellingGiftId={
              cancellingGiftId
            }
            onSearchChange={
              setSearch
            }
            onStatusChange={
              setStatusFilter
            }
            onRefresh={() =>
              void loadSentGifts()
            }
            onCancel={(giftId) =>
              void cancelSentGift(
                giftId,
              )
            }
          />
        )}
      </div>
    </main>
  );
}

function SentGiftsPanel({
  gifts,
  loading,
  error,
  search,
  statusFilter,
  cancellingGiftId,
  onSearchChange,
  onStatusChange,
  onRefresh,
  onCancel,
}: {
  gifts: GiftRecord[];
  loading: boolean;
  error: string;
  search: string;
  statusFilter: GiftStatusFilter;
  cancellingGiftId: string | null;
  onSearchChange: (
    value: string,
  ) => void;
  onStatusChange: (
    value: GiftStatusFilter,
  ) => void;
  onRefresh: () => void;
  onCancel: (
    giftId: string,
  ) => void;
}) {
  return (
    <section className="mt-7 rounded-[22px] border border-black/5 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-[25px] font-black tracking-[-0.04em]">
            Sent Gifts
          </h1>

          <p className="mt-1 text-[12px] text-black/40">
            View and manage gifts sent to your clients.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-black/10 px-4 text-[11px] font-bold transition hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_190px]">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
          />

          <input
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search client, account or gift ID"
            className="h-[48px] w-full rounded-[11px] border border-black/10 pl-11 pr-4 text-[12px] font-medium outline-none focus:ring-2 focus:ring-[#2458E8]/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(
              event.target
                .value as GiftStatusFilter,
            )
          }
          className="h-[48px] rounded-[11px] border border-black/10 bg-white px-4 text-[12px] font-semibold outline-none"
        >
          <option value="all">
            All statuses
          </option>
          <option value="pending">
            Pending
          </option>
          <option value="accepted">
            Accepted
          </option>
          <option value="declined">
            Declined
          </option>
          <option value="processed">
            Processed
          </option>
          <option value="cancelled">
            Cancelled
          </option>
          <option value="expired">
            Expired
          </option>
        </select>
      </div>

      {error && (
        <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid min-h-[300px] place-items-center">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-[#2458E8]" />
            <p className="mt-3 text-[11px] text-black/40">
              Loading sent gifts...
            </p>
          </div>
        </div>
      ) : gifts.length === 0 ? (
        <div className="mt-6 grid min-h-[300px] place-items-center rounded-[16px] border border-dashed border-black/10 bg-[#FAFBFC]">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#EEF4FF] text-[#2458E8]">
              <Gift size={24} />
            </div>
            <p className="mt-4 text-[13px] font-black">
              No gifts found
            </p>
            <p className="mt-1 text-[11px] text-black/40">
              Your sent gifts will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {gifts.map((gift) => (
            <SentGiftCard
              key={gift.id}
              gift={gift}
              cancelling={
                cancellingGiftId ===
                gift.id
              }
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SentGiftCard({
  gift,
  cancelling,
  onCancel,
}: {
  gift: GiftRecord;
  cancelling: boolean;
  onCancel: (
    giftId: string,
  ) => void;
}) {
  const countdown =
    useCountdown(
      gift.expires_at,
    );

  const clientName =
    [
      gift.client_first_name,
      gift.client_middle_name,
      gift.client_last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    gift.account_name ||
    "Client";

  const editable =
    gift.status ===
      "pending" &&
    !countdown.expired;

  const displayStatus =
    countdown.expired &&
    gift.status === "pending"
      ? "expired"
      : gift.status;

  return (
    <article className="rounded-[18px] border border-black/5 bg-[#FBFCFE] p-5 transition hover:border-[#2458E8]/20 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-black">
            {clientName}
          </p>
          <p className="mt-1 text-[10px] text-black/40">
            {gift.account_number
              ? `•••• ${gift.account_number.slice(-4)}`
              : "Client account"}
          </p>
        </div>

        <GiftStatusBadge
          status={displayStatus}
        />
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/30">
          Gift amount
        </p>
        <p className="mt-1 text-[28px] font-black tracking-[-0.04em] text-[#49A476]">
          {formatMoney(
            gift.amount,
            gift.currency,
          )}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniGiftDetail
          label="Redemption fee"
          value={formatMoney(
            gift.redemption_fee,
            gift.currency,
          )}
        />

        <MiniGiftDetail
          label="Sent"
          value={formatDate(
            gift.created_at,
          )}
        />
      </div>

      {gift.status === "pending" && (
        <div className="mt-5 rounded-[12px] bg-white px-3 py-3">
          {countdown.expired ? (
            <p className="text-[11px] font-bold text-red-600">
              Gift timer expired
            </p>
          ) : (
            <>
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-black/30">
                Time remaining
              </p>
              <p className="mt-1 text-[13px] font-black tabular-nums text-[#2458E8]">
                {String(countdown.days).padStart(2, "0")}d{" "}
                {String(countdown.hours).padStart(2, "0")}h{" "}
                {String(countdown.minutes).padStart(2, "0")}m{" "}
                {String(countdown.seconds).padStart(2, "0")}s
              </p>
            </>
          )}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Link
          href={`/dashboard/gift/${encodeURIComponent(
            gift.id,
          )}`}
          className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#2458E8] px-3 text-[11px] font-bold text-white transition hover:bg-[#1F4FD1]"
        >
          {editable ? (
            <Pencil size={14} />
          ) : (
            <Eye size={14} />
          )}

          {editable
            ? "View / Edit"
            : "View Gift"}
        </Link>

        {editable && (
          <button
            type="button"
            onClick={() =>
              onCancel(gift.id)
            }
            disabled={cancelling}
            className="flex h-[42px] items-center justify-center gap-2 rounded-[10px] bg-red-50 px-4 text-[11px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            {cancelling ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <XCircle size={14} />
            )}

            Cancel
          </button>
        )}
      </div>
    </article>
  );
}

function MiniGiftDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] bg-white px-3 py-3">
      <p className="text-[9px] text-black/35">
        {label}
      </p>
      <p className="mt-1 truncate text-[11px] font-bold">
        {value}
      </p>
    </div>
  );
}

function GiftStatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    pending:
      "bg-amber-50 text-amber-700",
    accepted:
      "bg-green-50 text-green-700",
    processed:
      "bg-blue-50 text-blue-700",
    declined:
      "bg-red-50 text-red-700",
    cancelled:
      "bg-gray-100 text-gray-600",
    expired:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.05em] ${
        styles[status] ??
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function GiftSuccess({
  gift,
  onCreateAnother,
}: {
  gift: GiftRecord;
  onCreateAnother: () => void;
}) {
  const countdown =
    useCountdown(
      gift.expires_at,
    );

  const recipientAmount = Number(gift.amount);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-5 py-8">
      <div className="mx-auto w-full max-w-[520px] rounded-[24px] bg-white px-5 py-7 shadow-sm">
        <div className="mx-auto grid h-[150px] w-[150px] place-items-center rounded-full bg-[#FFE446] shadow-md">
          <Gift
            size={64}
            className="text-[#1375B9]"
          />
        </div>

        <h1 className="mt-5 text-center text-[22px] font-black">
          Gifted Funds
        </h1>

        <p className="mt-2 text-center text-[42px] font-black tracking-[-0.04em] text-[#49A476]">
          {formatMoney(
            gift.amount,
            gift.currency,
          )}
        </p>

        <p className="text-center text-[14px] font-bold text-[#2458E8]">
          Gift Sent!
        </p>

        <CountdownCard
          countdown={
            countdown
          }
        />

        <div className="mt-6 space-y-3">
          <ReceiptRow
            label="Sent to"
            value={
              [
                gift.client_first_name,
                gift.client_middle_name,
                gift.client_last_name,
              ]
                .filter(Boolean)
                .join(" ") ||
              gift.account_name ||
              "Client"
            }
          />

          <ReceiptRow
            label="Redemption fee"
            value={formatMoney(
              gift.redemption_fee,
              gift.currency,
            )}
            danger
          />

          <ReceiptRow
            label="Recipient will receive"
            value={formatMoney(
              recipientAmount,
              gift.currency,
            )}
            success
          />

          <ReceiptRow
            label="Status"
            value={
              gift.status ===
              "pending"
                ? "Awaiting client response"
                : gift.status
            }
          />

          <ReceiptRow
            label="Expires"
            value={
              gift.expires_at
                ? formatDate(
                    gift.expires_at,
                  )
                : "—"
            }
          />
        </div>

        <Link
          href={`/dashboard/gift/${encodeURIComponent(
            gift.id,
          )}`}
          className="mt-6 flex h-[46px] w-full items-center justify-center rounded-[12px] bg-[#2458E8] text-[12px] font-bold text-white"
        >
          View / edit gift
        </Link>

        <button
          type="button"
          onClick={
            onCreateAnother
          }
          className="mt-3 flex h-[44px] w-full items-center justify-center rounded-[12px] bg-[#EEF4FF] text-[12px] font-bold text-[#2458E8]"
        >
          Send another gift
        </button>
      </div>
    </main>
  );
}

function CountdownCard({
  countdown,
}: {
  countdown: {
    expired: boolean;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}) {
  if (countdown.expired) {
    return (
      <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-4 text-center">
        <p className="text-[14px] font-black text-red-600">
          Gift expired
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-center gap-2">
        <TimeBox
          value={countdown.days}
          label="Days"
        />

        <TimeSeparator />

        <TimeBox
          value={countdown.hours}
          label="Hrs"
        />

        <TimeSeparator />

        <TimeBox
          value={countdown.minutes}
          label="Min"
        />

        <TimeSeparator />

        <TimeBox
          value={countdown.seconds}
          label="Sec"
        />
      </div>
    </div>
  );
}

function TimeSeparator() {
  return (
    <span className="pb-5 text-[16px] font-black text-black/25">
      :
    </span>
  );
}

function TimeBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-[58px] rounded-[12px] border border-black/5 bg-white px-2 py-3 text-center shadow-sm">
      <p className="text-[20px] font-black tabular-nums">
        {String(value).padStart(
          2,
          "0",
        )}
      </p>

      <p className="mt-1 text-[9px] font-semibold text-black/40">
        {label}
      </p>
    </div>
  );
}


function FieldBlock({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label className="text-[12px] font-black">
        {label}
      </label>

      {helper && (
        <p className="mt-1 text-[10px] text-black/40">
          {helper}
        </p>
      )}

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

function MoneyInput({
  currency,
  value,
  onChange,
}: {
  currency: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="flex h-[52px] overflow-hidden rounded-[12px] border border-black/10">
      <div className="grid min-w-[58px] place-items-center border-r border-black/10 text-[13px] font-black">
        {currencySymbol(
          currency,
        )}
      </div>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder="0.00"
        className="min-w-0 flex-1 px-4 text-[15px] font-semibold outline-none placeholder:text-black/20"
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  danger = false,
  success = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] text-black/50">
        {label}
      </span>

      <span
        className={`text-[12px] font-black ${
          danger
            ? "text-red-500"
            : success
              ? "text-green-600"
              : "text-[#222]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  danger = false,
  success = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-[11px] text-black/50">
        {label}
      </span>

      <span
        className={`max-w-[220px] text-right text-[12px] font-semibold ${
          danger
            ? "text-red-500"
            : success
              ? "text-green-600"
              : "text-[#333]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function resolveExpiry(
  timer: TimerOption,
  customExpiry: string,
) {
  if (
    timer === "custom"
  ) {
    if (!customExpiry) {
      return null;
    }

    const date =
      new Date(
        customExpiry,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return null;
    }

    return date.toISOString();
  }

  const durations: Record<
    Exclude<
      TimerOption,
      "custom"
    >,
    number
  > = {
    "1_hour":
      60 * 60 * 1000,

    "6_hours":
      6 *
      60 *
      60 *
      1000,

    "24_hours":
      24 *
      60 *
      60 *
      1000,

    "3_days":
      3 *
      24 *
      60 *
      60 *
      1000,

    "10_days":
      10 *
      24 *
      60 *
      60 *
      1000,
  };

  return new Date(
    Date.now() +
      durations[timer],
  ).toISOString();
}

function useCountdown(
  expiresAt:
    | string
    | null,
) {
  const [
    now,
    setNow,
  ] = useState(
    Date.now(),
  );

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setNow(
            Date.now(),
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, []);

  if (!expiresAt) {
    return {
      expired: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const difference =
    new Date(
      expiresAt,
    ).getTime() -
    now;

  if (
    difference <= 0
  ) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds =
    Math.floor(
      difference /
        1000,
    );

  const days =
    Math.floor(
      totalSeconds /
        86400,
    );

  const hours =
    Math.floor(
      (
        totalSeconds %
        86400
      ) /
        3600,
    );

  const minutes =
    Math.floor(
      (
        totalSeconds %
        3600
      ) /
        60,
    );

  const seconds =
    totalSeconds %
    60;

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
  };
}

function formatAccountOption(
  account:
    BankAccount,
) {
  const name =
    account.client_name ||
    account.account_name ||
    "Client";

  return `${name} — ••••${account.account_number.slice(
    -4,
  )} — ${account.currency}`;
}

function currencySymbol(
  currency: string,
) {
  const symbols: Record<
    string,
    string
  > = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    NGN: "₦",
  };

  return (
    symbols[currency] ||
    currency
  );
}

function formatMoney(
  amount:
    | string
    | number,
  currency: string,
) {
  const numeric =
    Number(amount);

  try {
    return new Intl.NumberFormat(
      "en",
      {
        style:
          "currency",
        currency,
        maximumFractionDigits:
          2,
      },
    ).format(
      numeric,
    );
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatTime(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(value);
}