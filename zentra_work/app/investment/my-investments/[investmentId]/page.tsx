"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  investmentService,
} from "@/services/investment.service";

import {
  accountService,
} from "@/services/account.service";

import type {
  Investment,
} from "@/types/investment.types";

import type {
  ClientAccount,
} from "@/types/account";

export default function MyInvestmentDetailsPage() {
  const { investmentId } =
    useParams<{
      investmentId: string;
    }>();

  const [
    investment,
    setInvestment,
  ] =
    useState<Investment | null>(
      null,
    );

  const [
    accounts,
    setAccounts,
  ] =
    useState<ClientAccount[]>(
      [],
    );

  const [
    destinationAccountId,
    setDestinationAccountId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    withdrawing,
    setWithdrawing,
  ] = useState(false);

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
        if (!investmentId) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const [
            investments,
            accountResult,
          ] =
            await Promise.all([
              investmentService.listMine({
                page: 1,
                pageSize: 100,
              }),

              accountService.listMine(),
            ]);

          const found =
            investments.find(
              (item) =>
                item.id ===
                investmentId,
            );

          if (!found) {
            throw new Error(
              "Investment not found.",
            );
          }

          setInvestment(
            found,
          );

          const eligible =
            accountResult.filter(
              (account) =>
                account.status ===
                  "active" &&
                account.currency ===
                  found.currency,
            );

          setAccounts(
            eligible,
          );

          if (
            eligible.length ===
            1
          ) {
            setDestinationAccountId(
              eligible[0].id,
            );
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load investment.",
          );
        } finally {
          setLoading(false);
        }
      },
      [investmentId],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Live investment value
  |--------------------------------------------------------------------------
  */

  const liveInvestment =
    useLiveInvestmentValue(
      investment,
    );

  const graphPoints =
    useMemo(
      () =>
        liveInvestment
          ? buildGrowthPoints(
              liveInvestment,
              60,
            )
          : [],
      [liveInvestment],
    );

  const graphPath =
    useMemo(
      () =>
        buildSvgPath(
          graphPoints,
          700,
          190,
        ),
      [graphPoints],
    );

  const selectedDestination =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            destinationAccountId,
        ) ?? null,
      [
        accounts,
        destinationAccountId,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Withdrawal
  |--------------------------------------------------------------------------
  */

  const handleWithdrawal =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !liveInvestment
      ) {
        return;
      }

      if (
        liveInvestment.status !==
        "matured"
      ) {
        setError(
          "This investment has not matured yet.",
        );

        return;
      }

      if (
        !selectedDestination
      ) {
        setError(
          "Select a destination account.",
        );

        return;
      }

      setWithdrawing(
        true,
      );

      setError("");
      setSuccess("");

      try {
        await investmentService.requestWithdrawal(
          liveInvestment.id,
          selectedDestination.id,
        );

        setSuccess(
          "Your withdrawal request has been submitted successfully.",
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to request withdrawal.",
        );
      } finally {
        setWithdrawing(
          false,
        );
      }
    };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#13813d]">
        <Loader2
          size={30}
          className="animate-spin text-white"
        />
      </main>
    );
  }

  if (
    !liveInvestment
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#13813d] px-6 text-white">
        <div className="text-center">
          <p className="text-[14px] font-black">
            {error ||
              "Investment not found."}
          </p>

          <Link
            href="/investment/my-investments"
            className="mt-5 inline-block text-[11px] underline"
          >
            Back to My Investments
          </Link>
        </div>
      </main>
    );
  }

  const principal =
    Number(
      liveInvestment.principal,
    );

  const currentValue =
    Number(
      liveInvestment.current_value ??
        liveInvestment.principal,
    );

  const accrued =
    Number(
      liveInvestment.accrued_return ??
        0,
    );

  const maturityAmount =
    Number(
      liveInvestment.maturity_amount,
    );

  const progress =
    Number(
      liveInvestment.growth_progress ??
        0,
    );

  return (
    <main className="min-h-screen bg-[#13813d] px-5 pb-12 pt-10 text-white">
      <section className="mx-auto w-full max-w-[430px]">
        {/* Header */}

        <header className="relative flex items-center justify-center">
          <Link
            href="/investment/my-investments"
            className="absolute left-0 text-white"
          >
            <ArrowLeft
              size={21}
            />
          </Link>

          <p className="font-heading text-[13px] font-bold tracking-[0.12em]">
            Investment Details
          </p>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="absolute right-0 grid h-8 w-8 place-items-center rounded-full bg-white/10"
          >
            <RefreshCw
              size={14}
            />
          </button>
        </header>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-3 rounded-[12px] bg-green-50 px-4 py-3 text-[11px] font-semibold text-green-700">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0"
            />

            {success}
          </div>
        )}

        {/* Main growth card */}

        <section className="mt-6 overflow-hidden rounded-[22px] bg-[#10291E] shadow-xl">
          <div className="px-5 pb-5 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/35">
                  Investment
                </p>

                <h1 className="mt-1 text-[22px] font-black">
                  {liveInvestment.product_name ||
                    "Investment"}
                </h1>
              </div>

              <StatusBadge
                status={
                  liveInvestment.status
                }
              />
            </div>

            <div className="mt-7">
              <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-white/30">
                Current Value
              </p>

              <p className="mt-1 text-[38px] font-black tracking-[-0.045em] text-[#71D49B]">
                {formatMoney(
                  currentValue,
                  liveInvestment.currency,
                )}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-[#71D49B]/70">
                +
                {formatMoney(
                  accrued,
                  liveInvestment.currency,
                )}{" "}
                accrued growth
              </p>
            </div>

            {/* Graph */}

            <div className="relative mt-5 h-[190px] w-full">
              <svg
                viewBox="0 0 700 190"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient
                    id="client-investment-detail-fill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.28"
                    />

                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {[45, 90, 135, 180].map(
                  (y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="700"
                      y1={y}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.06"
                    />
                  ),
                )}

                <path
                  d={`${graphPath} L 700 190 L 0 190 Z`}
                  fill="url(#client-investment-detail-fill)"
                  className="text-[#71D49B]"
                />

                <path
                  d={graphPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#71D49B]"
                />
              </svg>
            </div>

            <div className="mt-3 flex items-center justify-between text-[8px] text-white/30">
              <span>
                {formatDateShort(
                  liveInvestment.started_at,
                )}
              </span>

              <span className="font-bold text-[#71D49B]">
                {formatNumber(
                  progress,
                )}
                %
              </span>

              <span>
                {formatDateShort(
                  liveInvestment.maturity_date,
                )}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/[0.03] px-5 py-5">
            <div className="grid grid-cols-3 gap-2">
              <DarkMetric
                label="Principal"
                value={formatMoney(
                  principal,
                  liveInvestment.currency,
                )}
              />

              <DarkMetric
                label="Growth"
                value={formatMoney(
                  accrued,
                  liveInvestment.currency,
                )}
                positive
              />

              <DarkMetric
                label="Maturity"
                value={formatMoney(
                  maturityAmount,
                  liveInvestment.currency,
                )}
                positive
              />
            </div>
          </div>
        </section>

        {/* Investment summary */}

        <section className="mt-5 rounded-[20px] bg-white px-5 py-5 text-[#292929] shadow-md">
          <h2 className="text-[16px] font-black">
            Investment Summary
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoCard
              icon={
                <TrendingUp
                  size={15}
                />
              }
              label="Annual Rate"
              value={`${formatNumber(
                liveInvestment.annual_rate,
              )}%`}
            />

            <InfoCard
              icon={
                <Clock3
                  size={15}
                />
              }
              label="Duration"
              value={formatDuration(
                liveInvestment.duration_days,
              )}
            />

            <InfoCard
              icon={
                <CalendarDays
                  size={15}
                />
              }
              label="Days Remaining"
              value={String(
                liveInvestment.days_remaining ??
                  0,
              )}
            />

            <InfoCard
              icon={
                <ShieldCheck
                  size={15}
                />
              }
              label="Risk"
              value={
                liveInvestment.risk_level ??
                "—"
              }
            />
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-[9px] font-semibold text-black/35">
              <span>
                Investment Progress
              </span>

              <span>
                {formatNumber(
                  progress,
                )}
                %
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-[#16884B] transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      progress,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-[13px] bg-[#F6F8F7] px-4 py-4">
            <Detail
              label="Started"
              value={formatDateTime(
                liveInvestment.started_at,
              )}
            />

            <Detail
              label="Maturity"
              value={formatDateTime(
                liveInvestment.maturity_date,
              )}
            />

            <Detail
              label="Expected Return"
              value={formatMoney(
                liveInvestment.expected_return,
                liveInvestment.currency,
              )}
            />

            <Detail
              label="Payout Type"
              value={
                liveInvestment.payout_type
                  ?.replaceAll(
                    "_",
                    " ",
                  ) ??
                "—"
              }
            />
          </div>
        </section>

        {/* Withdrawal */}

        {liveInvestment.status ===
          "matured" && (
          <form
            onSubmit={
              handleWithdrawal
            }
            className="mt-5 rounded-[20px] bg-white px-5 py-5 text-[#292929] shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#EEF3FF] text-[#1D4ED8]">
                <WalletCards
                  size={18}
                />
              </div>

              <div>
                <h2 className="text-[15px] font-black">
                  Withdraw Investment
                </h2>

                <p className="mt-1 text-[9px] text-black/40">
                  This investment has matured and is available for withdrawal.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[14px] bg-[#F3F8F5] px-4 py-4">
              <p className="text-[8px] font-semibold uppercase tracking-[0.06em] text-black/30">
                Amount Available
              </p>

              <p className="mt-1 text-[25px] font-black text-[#16884B]">
                {formatMoney(
                  liveInvestment.maturity_amount,
                  liveInvestment.currency,
                )}
              </p>
            </div>

            <div className="mt-5">
              <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
                Destination Account
              </label>

              <select
                value={
                  destinationAccountId
                }
                onChange={(
                  event,
                ) =>
                  setDestinationAccountId(
                    event.target.value,
                  )
                }
                className="mt-2 h-[50px] w-full rounded-[11px] border border-black/10 bg-white px-4 text-[11px] font-semibold outline-none"
              >
                <option value="">
                  Select account
                </option>

                {accounts.map(
                  (account) => (
                    <option
                      key={
                        account.id
                      }
                      value={
                        account.id
                      }
                    >
                      {
                        account.account_name
                      }
                      {" — ••••"}
                      {account.account_number.slice(
                        -4,
                      )}
                      {" — "}
                      {formatMoney(
                        account.balance,
                        account.currency,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={
                withdrawing ||
                !selectedDestination
              }
              className="mt-5 flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#1D4ED8] text-[11px] font-bold text-white disabled:opacity-50"
            >
              {withdrawing ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <WalletCards
                    size={15}
                  />

                  Request Withdrawal
                </>
              )}
            </button>
          </form>
        )}

        {liveInvestment.status ===
          "withdrawal_requested" && (
          <section className="mt-5 rounded-[20px] bg-amber-50 px-5 py-5 text-amber-800">
            <div className="flex items-start gap-3">
              <Clock3
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-[12px] font-black">
                  Withdrawal Pending
                </p>

                <p className="mt-1 text-[9px] leading-4">
                  Your withdrawal request has been submitted and is awaiting review.
                </p>
              </div>
            </div>
          </section>
        )}

        {liveInvestment.status ===
          "completed" && (
          <section className="mt-5 rounded-[20px] bg-green-50 px-5 py-5 text-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-[12px] font-black">
                  Investment Completed
                </p>

                <p className="mt-1 text-[9px] leading-4">
                  This investment has been completed and the withdrawal has been credited.
                </p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Live growth
|--------------------------------------------------------------------------
*/

function useLiveInvestmentValue(
  investment:
    | Investment
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

  return useMemo(() => {
    if (!investment) {
      return null;
    }

    if (
      investment.status !==
        "active" &&
      investment.status !==
        "matured"
    ) {
      return investment;
    }

    const principal =
      Number(
        investment.principal,
      );

    const expectedReturn =
      Number(
        investment.expected_return,
      );

    const maturityAmount =
      Number(
        investment.maturity_amount,
      );

    const startedAt =
      new Date(
        investment.started_at,
      ).getTime();

    const maturityDate =
      new Date(
        investment.maturity_date,
      ).getTime();

    if (
      !Number.isFinite(
        startedAt,
      ) ||
      !Number.isFinite(
        maturityDate,
      )
    ) {
      return investment;
    }

    const totalDuration =
      Math.max(
        maturityDate -
          startedAt,
        1,
      );

    const elapsed =
      Math.max(
        0,
        Math.min(
          now -
            startedAt,
          totalDuration,
        ),
      );

    const fraction =
      elapsed /
      totalDuration;

    const accruedReturn =
      expectedReturn *
      fraction;

    const currentValue =
      Math.min(
        principal +
          accruedReturn,
        maturityAmount,
      );

    const daysRemaining =
      Math.max(
        0,
        Math.ceil(
          (
            maturityDate -
            now
          ) /
            86400000,
        ),
      );

    return {
      ...investment,

      accrued_return:
        accruedReturn.toFixed(
          4,
        ),

      current_value:
        currentValue.toFixed(
          4,
        ),

      growth_progress:
        Number(
          (
            fraction *
            100
          ).toFixed(
            6,
          ),
        ),

      days_remaining:
        daysRemaining,
    };
  }, [
    investment,
    now,
  ]);
}

/*
|--------------------------------------------------------------------------
| Graph
|--------------------------------------------------------------------------
*/

function buildGrowthPoints(
  investment:
    Investment,
  count: number,
) {
  const principal =
    Number(
      investment.principal,
    );

  const expectedReturn =
    Number(
      investment.expected_return,
    );

  const total =
    Math.max(
      count,
      2,
    );

  return Array.from(
    {
      length: total,
    },
    (
      _,
      index,
    ) => {
      const fraction =
        index /
        (
          total -
          1
        );

      return {
        fraction,

        value:
          principal +
          expectedReturn *
            fraction,
      };
    },
  );
}

function buildSvgPath(
  points: {
    fraction: number;
    value: number;
  }[],
  width: number,
  height: number,
) {
  if (!points.length) {
    return "";
  }

  const values =
    points.map(
      (point) =>
        point.value,
    );

  const minimum =
    Math.min(
      ...values,
    );

  const maximum =
    Math.max(
      ...values,
    );

  const range =
    Math.max(
      maximum -
        minimum,
      1,
    );

  return points
    .map(
      (
        point,
        index,
      ) => {
        const x =
          point.fraction *
          width;

        const normalized =
          (
            point.value -
            minimum
          ) /
          range;

        const y =
          height -
          15 -
          normalized *
            (
              height -
              35
            );

        return `${
          index ===
          0
            ? "M"
            : "L"
        } ${x.toFixed(
          2,
        )} ${y.toFixed(
          2,
        )}`;
      },
    )
    .join(" ");
}

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

function DarkMetric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[11px] border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-[10px] font-black ${
          positive
            ? "text-[#71D49B]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[12px] bg-[#F6F8F7] px-3 py-3">
      <div className="flex items-center gap-2 text-[#16884B]">
        {icon}

        <p className="text-[7px] font-bold uppercase tracking-[0.04em] text-black/30">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-[11px] font-black capitalize">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mt-3 flex items-start justify-between gap-4 first:mt-0">
      <p className="text-[9px] text-black/35">
        {label}
      </p>

      <p className="max-w-[230px] text-right text-[10px] font-bold capitalize">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles:
    Record<
      string,
      string
    > = {
      active:
        "bg-[#71D49B]/15 text-[#71D49B]",

      matured:
        "bg-blue-400/15 text-blue-300",

      withdrawal_requested:
        "bg-amber-400/15 text-amber-300",

      completed:
        "bg-white/10 text-white/60",
    };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${
        styles[status] ??
        "bg-white/10 text-white/60"
      }`}
    >
      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
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
        ? numeric.toFixed(
            2,
          )
        : "0.00"
    }`;
  }
}

function formatNumber(
  value:
    | string
    | number,
) {
  const numeric =
    Number(value);

  return Number.isFinite(
    numeric,
  )
    ? numeric.toFixed(2)
    : "0.00";
}

function formatDuration(
  days: number,
) {
  if (
    days >= 365 &&
    days % 365 === 0
  ) {
    const years =
      days / 365;

    return `${years} ${
      years === 1
        ? "year"
        : "years"
    }`;
  }

  if (
    days >= 30 &&
    days % 30 === 0
  ) {
    const months =
      days / 30;

    return `${months} ${
      months === 1
        ? "month"
        : "months"
    }`;
  }

  return `${days} days`;
}

function formatDateShort(
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
    },
  ).format(date);
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