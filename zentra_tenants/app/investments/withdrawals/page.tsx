"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  investmentService,
} from "@/services/investment.service";

import type {
  InvestmentWithdrawal,
  InvestmentWithdrawalStatus,
} from "@/services/investment.service";

type Filter =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export default function InvestmentWithdrawalsPage() {
  const [
    withdrawals,
    setWithdrawals,
  ] = useState<
    InvestmentWithdrawal[]
  >([]);

  const [
    filter,
    setFilter,
  ] =
    useState<Filter>(
      "pending",
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionId,
    setActionId,
  ] = useState<
    string | null
  >(null);

  const [
    rejecting,
    setRejecting,
  ] =
    useState<
      InvestmentWithdrawal | null
    >(null);

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await investmentService.listWithdrawals({
              page: 1,
              pageSize: 100,
              status: filter,
            });

          setWithdrawals(
            result,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load investment withdrawals.",
          );
        } finally {
          setLoading(false);
        }
      },
      [filter],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return withdrawals;
      }

      return withdrawals.filter(
        (withdrawal) =>
          withdrawal.id
            .toLowerCase()
            .includes(query) ||
          withdrawal.investment_id
            .toLowerCase()
            .includes(query) ||
          withdrawal.user_id
            .toLowerCase()
            .includes(query) ||
          (
            withdrawal.currency ??
            ""
          )
            .toLowerCase()
            .includes(query),
      );
    }, [
      withdrawals,
      search,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Approve
  |--------------------------------------------------------------------------
  */

  const approve =
    async (
      withdrawal:
        InvestmentWithdrawal,
    ) => {
      const confirmed =
        window.confirm(
          `Approve withdrawal of ${formatMoney(
            withdrawal.amount,
            withdrawal.currency,
          )}?`,
        );

      if (!confirmed) {
        return;
      }

      setActionId(
        withdrawal.id,
      );

      setError("");
      setSuccess("");

      try {
        await investmentService.reviewWithdrawal(
          withdrawal.id,
          {
            status:
              "approved",
          },
        );

        setSuccess(
          "Withdrawal approved successfully.",
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to approve withdrawal.",
        );
      } finally {
        setActionId(
          null,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Reject
  |--------------------------------------------------------------------------
  */

  const reject =
    async () => {
      if (!rejecting) {
        return;
      }

      if (
        rejectionReason
          .trim()
          .length < 3
      ) {
        setError(
          "Enter a rejection reason.",
        );

        return;
      }

      setActionId(
        rejecting.id,
      );

      setError("");
      setSuccess("");

      try {
        await investmentService.reviewWithdrawal(
          rejecting.id,
          {
            status:
              "rejected",

            rejectionReason:
              rejectionReason.trim(),
          },
        );

        setSuccess(
          "Withdrawal rejected successfully.",
        );

        setRejecting(
          null,
        );

        setRejectionReason(
          "",
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to reject withdrawal.",
        );
      } finally {
        setActionId(
          null,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Complete
  |--------------------------------------------------------------------------
  */

  const complete =
    async (
      withdrawal:
        InvestmentWithdrawal,
    ) => {
      const confirmed =
        window.confirm(
          `Complete this withdrawal and credit ${formatMoney(
            withdrawal.amount,
            withdrawal.currency,
          )} to the client's destination account?`,
        );

      if (!confirmed) {
        return;
      }

      setActionId(
        withdrawal.id,
      );

      setError("");
      setSuccess("");

      try {
        await investmentService.completeWithdrawal(
          withdrawal.id,
        );

        setSuccess(
          "Withdrawal completed and destination account credited successfully.",
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to complete withdrawal.",
        );
      } finally {
        setActionId(
          null,
        );
      }
    };

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[1180px]">
        {/* Header */}

        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/investments"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div>
              <h1 className="text-[25px] font-black tracking-[-0.035em]">
                Investment
                Withdrawals
              </h1>

              <p className="mt-1 text-[11px] text-black/40">
                Review and
                complete matured
                investment
                withdrawals.
              </p>
            </div>
          </div>

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
        </header>

        {error && (
          <div className="mt-6 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-green-100 bg-green-50 px-4 py-3 text-[11px] font-medium text-green-700">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0"
            />

            {success}
          </div>
        )}

        {/* Filters */}

        <div className="mt-7 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
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
              placeholder="Search withdrawal or investment ID"
              className="h-[46px] w-full rounded-[11px] border border-black/10 bg-white pl-11 pr-4 text-[11px] outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <FilterButton
              label="Pending"
              value="pending"
              current={filter}
              onClick={
                setFilter
              }
            />

            <FilterButton
              label="Approved"
              value="approved"
              current={filter}
              onClick={
                setFilter
              }
            />

            <FilterButton
              label="Rejected"
              value="rejected"
              current={filter}
              onClick={
                setFilter
              }
            />

            <FilterButton
              label="Completed"
              value="completed"
              current={filter}
              onClick={
                setFilter
              }
            />
          </div>
        </div>

        {/* List */}

        {loading ? (
          <div className="mt-7 grid min-h-[350px] place-items-center rounded-[20px] bg-white">
            <Loader2
              size={30}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : filtered.length ===
          0 ? (
          <div className="mt-7 grid min-h-[350px] place-items-center rounded-[20px] border border-dashed border-black/10 bg-white">
            <div className="text-center">
              <WalletCards
                size={34}
                className="mx-auto text-[#2458E8]"
              />

              <p className="mt-4 text-[14px] font-black">
                No {filter}{" "}
                withdrawals
              </p>

              <p className="mt-2 text-[10px] text-black/40">
                Matching
                investment
                withdrawals will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {filtered.map(
              (
                withdrawal,
              ) => (
                <WithdrawalCard
                  key={
                    withdrawal.id
                  }
                  withdrawal={
                    withdrawal
                  }
                  busy={
                    actionId ===
                    withdrawal.id
                  }
                  onApprove={() =>
                    void approve(
                      withdrawal,
                    )
                  }
                  onReject={() => {
                    setRejecting(
                      withdrawal,
                    );

                    setRejectionReason(
                      "",
                    );

                    setError(
                      "",
                    );
                  }}
                  onComplete={() =>
                    void complete(
                      withdrawal,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

      {/* Reject modal */}

      {rejecting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-[470px] rounded-[20px] bg-white p-5 shadow-2xl md:p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                <XCircle
                  size={19}
                />
              </div>

              <div>
                <h2 className="text-[16px] font-black">
                  Reject
                  Withdrawal
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-black/40">
                  Give the client
                  a clear reason
                  for rejecting
                  this request.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[12px] bg-[#F6F7F8] px-4 py-3">
              <Detail
                label="Amount"
                value={formatMoney(
                  rejecting.amount,
                  rejecting.currency,
                )}
              />

              <Detail
                label="Investment"
                value={
                  rejecting.investment_id
                }
                breakValue
              />
            </div>

            <textarea
              value={
                rejectionReason
              }
              onChange={(
                event,
              ) =>
                setRejectionReason(
                  event.target.value,
                )
              }
              maxLength={2000}
              placeholder="Why is this withdrawal being rejected?"
              className="mt-5 h-[120px] w-full resize-none rounded-[12px] border border-black/10 px-4 py-3 text-[11px] outline-none"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejecting(
                    null,
                  );

                  setRejectionReason(
                    "",
                  );
                }}
                className="h-[43px] rounded-[10px] border border-black/10 text-[11px] font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  actionId ===
                  rejecting.id
                }
                onClick={() =>
                  void reject()
                }
                className="flex h-[43px] items-center justify-center gap-2 rounded-[10px] bg-red-600 text-[11px] font-bold text-white disabled:opacity-50"
              >
                {actionId ===
                rejecting.id ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <XCircle
                    size={15}
                  />
                )}

                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Withdrawal card
|--------------------------------------------------------------------------
*/

function WithdrawalCard({
  withdrawal,
  busy,
  onApprove,
  onReject,
  onComplete,
}: {
  withdrawal:
    InvestmentWithdrawal;

  busy: boolean;

  onApprove: () => void;

  onReject: () => void;

  onComplete: () => void;
}) {
  return (
    <article className="rounded-[18px] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge
              status={
                withdrawal.status
              }
            />

            <p className="text-[9px] text-black/30">
              {formatDateTime(
                withdrawal.created_at,
              )}
            </p>
          </div>

          <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.07em] text-black/30">
            Withdrawal Amount
          </p>

          <p className="mt-1 text-[28px] font-black tracking-[-0.035em] text-[#333]">
            {formatMoney(
              withdrawal.amount,
              withdrawal.currency,
            )}
          </p>
        </div>

        <div className="grid min-w-[260px] gap-2 sm:grid-cols-2">
          <SmallMetric
            label="Investment ID"
            value={
              withdrawal.investment_id
            }
            breakValue
          />

          <SmallMetric
            label="Destination Account"
            value={
              withdrawal.destination_account_id
            }
            breakValue
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <DetailBox
          label="Withdrawal ID"
          value={
            withdrawal.id
          }
        />

        <DetailBox
          label="Client User ID"
          value={
            withdrawal.user_id
          }
        />

        <DetailBox
          label="Currency"
          value={
            withdrawal.currency
          }
        />
      </div>

      {withdrawal.rejection_reason && (
        <div className="mt-5 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.05em] text-red-700">
            Rejection Reason
          </p>

          <p className="mt-2 text-[11px] leading-5 text-red-700">
            {
              withdrawal.rejection_reason
            }
          </p>
        </div>
      )}

      {withdrawal.status ===
        "pending" && (
        <div className="mt-6 flex flex-col gap-2 border-t border-black/5 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={
              onReject
            }
            className="flex h-[41px] items-center justify-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-5 text-[10px] font-bold text-red-700 disabled:opacity-50"
          >
            <XCircle
              size={14}
            />

            Reject
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={
              onApprove
            }
            className="flex h-[41px] items-center justify-center gap-2 rounded-[10px] bg-[#16884B] px-5 text-[10px] font-bold text-white disabled:opacity-50"
          >
            {busy ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2
                size={14}
              />
            )}

            Approve
          </button>
        </div>
      )}

      {withdrawal.status ===
        "approved" && (
        <div className="mt-6 border-t border-black/5 pt-5">
          <div className="rounded-[12px] bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <Clock3
                size={16}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-[10px] font-black text-amber-700">
                  Approved -
                  Awaiting
                  Completion
                </p>

                <p className="mt-1 text-[9px] leading-4 text-amber-700/65">
                  Completing this
                  withdrawal will
                  credit the
                  client&apos;s
                  selected
                  destination
                  account.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={
              onComplete
            }
            className="mt-3 flex h-[43px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#2458E8] text-[10px] font-bold text-white disabled:opacity-50 sm:ml-auto sm:w-auto sm:px-6"
          >
            {busy ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <WalletCards
                size={14}
              />
            )}

            Complete &
            Credit Account
          </button>
        </div>
      )}

      {withdrawal.status ===
        "completed" && (
        <div className="mt-5 flex items-start gap-3 rounded-[12px] bg-green-50 px-4 py-3">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <div>
            <p className="text-[10px] font-black text-green-700">
              Withdrawal
              Completed
            </p>

            <p className="mt-1 text-[9px] text-green-700/65">
              Funds were credited
              to the destination
              account.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| UI
|--------------------------------------------------------------------------
*/

function FilterButton({
  label,
  value,
  current,
  onClick,
}: {
  label: string;

  value: Filter;

  current: Filter;

  onClick: (
    value: Filter,
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onClick(value)
      }
      className={`h-[46px] shrink-0 rounded-[11px] px-4 text-[10px] font-bold ${
        current === value
          ? "bg-[#2458E8] text-white"
          : "border border-black/10 bg-white text-black/50"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status:
    InvestmentWithdrawalStatus;
}) {
  const styles:
    Record<
      InvestmentWithdrawalStatus,
      string
    > = {
      pending:
        "bg-amber-50 text-amber-700",

      approved:
        "bg-blue-50 text-blue-700",

      rejected:
        "bg-red-50 text-red-700",

      completed:
        "bg-green-50 text-green-700",
    };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function SmallMetric({
  label,
  value,
  breakValue = false,
}: {
  label: string;
  value: string;
  breakValue?: boolean;
}) {
  return (
    <div className="rounded-[11px] bg-[#F6F7F8] px-3 py-3">
      <p className="text-[8px] font-semibold uppercase tracking-[0.05em] text-black/30">
        {label}
      </p>

      <p
        className={`mt-1 text-[9px] font-bold ${
          breakValue
            ? "break-all"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[11px] border border-black/5 px-3 py-3">
      <p className="text-[8px] font-semibold uppercase tracking-[0.05em] text-black/30">
        {label}
      </p>

      <p className="mt-1 break-all text-[9px] font-bold text-black/60">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
  breakValue = false,
}: {
  label: string;
  value: string;
  breakValue?: boolean;
}) {
  return (
    <div className="mt-3 flex items-start justify-between gap-4 first:mt-0">
      <p className="text-[9px] text-black/35">
        {label}
      </p>

      <p
        className={`max-w-[280px] text-right text-[10px] font-bold ${
          breakValue
            ? "break-all"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

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
        minimumFractionDigits:
          2,
        maximumFractionDigits:
          2,
      },
    ).format(
      Number.isFinite(
        numeric,
      )
        ? numeric
        : 0,
    );
  } catch {
    return `${currency} ${
      Number.isFinite(
        numeric,
      )
        ? numeric.toFixed(2)
        : "0.00"
    }`;
  }
}

function formatDateTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}