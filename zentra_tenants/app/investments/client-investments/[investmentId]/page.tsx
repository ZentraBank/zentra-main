"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";

import {
  investmentService,
} from "@/services/investment.service";

import type {
  TenantInvestment,
} from "@/services/investment.service";

export default function ClientInvestmentDetailsPage() {
  const { investmentId } =
    useParams<{
      investmentId: string;
    }>();

  const [
    investment,
    setInvestment,
  ] =
    useState<TenantInvestment | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load investment
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
          const result =
            await investmentService.listAll({
              page: 1,
              pageSize: 100,
            });

          const found =
            result.find(
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
  | Live display value
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
          900,
          260,
        ),
      [graphPoints],
    );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F4F6F8]">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-[#2458E8]"
          />

          <p className="mt-3 text-[11px] text-black/40">
            Loading investment...
          </p>
        </div>
      </main>
    );
  }

  if (
    !liveInvestment
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F4F6F8] px-5">
        <div className="text-center">
          <p className="text-[14px] font-black text-red-600">
            {error ||
              "Investment not found."}
          </p>

          <Link
            href="/investments/client-investments"
            className="mt-5 inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#2458E8] px-5 text-[11px] font-bold text-white"
          >
            Back to investments
          </Link>
        </div>
      </main>
    );
  }

  const clientName =
    getClientName(
      liveInvestment,
    );

  const currentValue =
    Number(
      liveInvestment.current_value ??
        liveInvestment.principal,
    );

  const principal =
    Number(
      liveInvestment.principal,
    );

  const accrued =
    Number(
      liveInvestment.accrued_return ??
        0,
    );

  const maturityValue =
    Number(
      liveInvestment.maturity_amount,
    );

  const progress =
    Number(
      liveInvestment.growth_progress ??
        0,
    );

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[1180px]">
        {/* Header */}

        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/investments/client-investments"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-black/30">
                Client Investment
              </p>

              <h1 className="mt-1 text-[25px] font-black tracking-[-0.035em]">
                {liveInvestment.product_name ||
                  "Investment Details"}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="flex h-[41px] items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-white px-4 text-[10px] font-bold"
          >
            <RefreshCw
              size={14}
            />

            Refresh
          </button>
        </header>

        {error && (
          <div className="mt-5 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[11px] text-red-700">
            {error}
          </div>
        )}

        {/* Client + status */}

        <section className="mt-7 flex flex-col justify-between gap-4 rounded-[20px] bg-white px-5 py-5 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#EEF3FF] text-[#2458E8]">
              <UserRound
                size={21}
              />
            </div>

            <div>
              <p className="text-[15px] font-black">
                {clientName}
              </p>

              <p className="mt-1 text-[10px] text-black/40">
                {liveInvestment.client_email ||
                  "No email available"}
              </p>
            </div>
          </div>

          <StatusBadge
            status={
              liveInvestment.status
            }
          />
        </section>

        {/* Main value */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-[22px] bg-[#14251D] text-white shadow-sm">
            <div className="px-5 pb-5 pt-6 md:px-7">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                    Current Investment Value
                  </p>

                  <p className="mt-2 text-[39px] font-black tracking-[-0.045em] text-[#71D49B]">
                    {formatMoney(
                      currentValue,
                      liveInvestment.currency,
                    )}
                  </p>

                  <p className="mt-2 text-[11px] font-semibold text-[#71D49B]/70">
                    +
                    {formatMoney(
                      accrued,
                      liveInvestment.currency,
                    )}{" "}
                    accrued growth
                  </p>
                </div>

                <div className="rounded-[13px] border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[8px] uppercase tracking-[0.07em] text-white/30">
                    Annual Rate
                  </p>

                  <p className="mt-1 text-[20px] font-black">
                    {formatNumber(
                      liveInvestment.annual_rate,
                    )}
                    %
                  </p>
                </div>
              </div>

              {/* Graph */}

              <div className="relative mt-8 h-[260px] w-full">
                <svg
                  viewBox="0 0 900 260"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <defs>
                    <linearGradient
                      id="investment-detail-fill"
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

                  {[60, 120, 180, 240].map(
                    (y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="900"
                        y1={y}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity="0.06"
                      />
                    ),
                  )}

                  <path
                    d={`${graphPath} L 900 260 L 0 260 Z`}
                    fill="url(#investment-detail-fill)"
                    className="text-[#71D49B]"
                  />

                  <path
                    d={
                      graphPath
                    }
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#71D49B]"
                  />
                </svg>
              </div>

              <div className="mt-3 flex items-center justify-between text-[9px] text-white/30">
                <span>
                  {formatDateShort(
                    liveInvestment.started_at,
                  )}
                </span>

                <span className="font-bold text-[#71D49B]">
                  {formatNumber(
                    progress,
                  )}
                  % complete
                </span>

                <span>
                  {formatDateShort(
                    liveInvestment.maturity_date,
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.03] px-5 py-5 md:px-7">
              <div className="grid gap-3 sm:grid-cols-3">
                <DarkMetric
                  label="Principal"
                  value={formatMoney(
                    principal,
                    liveInvestment.currency,
                  )}
                />

                <DarkMetric
                  label="Expected Return"
                  value={formatMoney(
                    liveInvestment.expected_return,
                    liveInvestment.currency,
                  )}
                  positive
                />

                <DarkMetric
                  label="Maturity Value"
                  value={formatMoney(
                    maturityValue,
                    liveInvestment.currency,
                  )}
                  positive
                />
              </div>
            </div>
          </section>

          {/* Side panel */}

          <section className="rounded-[22px] bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-[16px] font-black">
              Investment Summary
            </h2>

            <p className="mt-1 text-[10px] text-black/40">
              Current terms and
              maturity information.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MetricCard
                icon={
                  <Clock3
                    size={16}
                  />
                }
                label="Duration"
                value={formatDuration(
                  liveInvestment.duration_days,
                )}
              />

              <MetricCard
                icon={
                  <CalendarDays
                    size={16}
                  />
                }
                label="Days Remaining"
                value={String(
                  liveInvestment.days_remaining ??
                    0,
                )}
              />

              <MetricCard
                icon={
                  <ShieldCheck
                    size={16}
                  />
                }
                label="Risk"
                value={
                  liveInvestment.risk_level ||
                  "—"
                }
              />

              <MetricCard
                icon={
                  <TrendingUp
                    size={16}
                  />
                }
                label="Payout"
                value={
                  liveInvestment.payout_type
                    ?.replaceAll(
                      "_",
                      " ",
                    ) ||
                  "—"
                }
              />
            </div>

            {/* Progress */}

            <div className="mt-6 rounded-[14px] bg-[#F4F8F6] px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-black/35">
                  Growth Progress
                </p>

                <p className="text-[10px] font-black text-[#16884B]">
                  {formatNumber(
                    progress,
                  )}
                  %
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
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

            <div className="mt-6 rounded-[14px] border border-black/5 px-4 py-4">
              <DetailRow
                label="Started"
                value={formatDateTime(
                  liveInvestment.started_at,
                )}
              />

              <DetailRow
                label="Maturity"
                value={formatDateTime(
                  liveInvestment.maturity_date,
                )}
              />

              <DetailRow
                label="Currency"
                value={
                  liveInvestment.currency
                }
              />

              <DetailRow
                label="Investment ID"
                value={
                  liveInvestment.id
                }
                breakValue
              />

              <DetailRow
                label="Source Account ID"
                value={
                  liveInvestment.source_account_id
                }
                breakValue
              />
            </div>
          </section>
        </div>

        {/* Projection breakdown */}

        <section className="mt-6 rounded-[22px] bg-white p-5 shadow-sm md:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#EEF8F2] text-[#16884B]">
              <TrendingUp
                size={18}
              />
            </div>

            <div>
              <h2 className="text-[16px] font-black">
                Growth Breakdown
              </h2>

              <p className="mt-1 text-[9px] text-black/40">
                How this investment
                progresses from
                principal to maturity.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BreakdownCard
              label="Initial Principal"
              value={formatMoney(
                principal,
                liveInvestment.currency,
              )}
            />

            <BreakdownCard
              label="Growth So Far"
              value={formatMoney(
                accrued,
                liveInvestment.currency,
              )}
              positive
            />

            <BreakdownCard
              label="Growth Remaining"
              value={formatMoney(
                Math.max(
                  0,
                  Number(
                    liveInvestment.expected_return,
                  ) -
                    accrued,
                ),
                liveInvestment.currency,
              )}
            />

            <BreakdownCard
              label="Final Maturity Value"
              value={formatMoney(
                maturityValue,
                liveInvestment.currency,
              )}
              positive
            />
          </div>
        </section>
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Live investment hook
|--------------------------------------------------------------------------
*/

function useLiveInvestmentValue(
  investment:
    | TenantInvestment
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

    /*
     * Only active investments
     * continue growing locally.
     */
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
    TenantInvestment,
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
      2,
      count,
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
  if (
    points.length ===
    0
  ) {
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
          20 -
          normalized *
            (
              height -
              45
            );

        return `${
          index === 0
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
| UI Components
|--------------------------------------------------------------------------
*/

function MetricCard({
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
    <div className="rounded-[13px] bg-[#F7F8F9] px-3 py-4">
      <div className="flex items-center gap-2 text-[#2458E8]">
        {icon}

        <p className="text-[8px] font-bold uppercase tracking-[0.04em] text-black/30">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-[12px] font-black capitalize">
        {value}
      </p>
    </div>
  );
}

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
    <div className="rounded-[13px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[8px] font-semibold uppercase tracking-[0.06em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-2 text-[14px] font-black ${
          positive
            ? "text-[#71D49B]"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BreakdownCard({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-black/5 bg-[#F8F9FA] px-4 py-4">
      <p className="text-[8px] font-bold uppercase tracking-[0.05em] text-black/30">
        {label}
      </p>

      <p
        className={`mt-2 text-[16px] font-black ${
          positive
            ? "text-[#16884B]"
            : "text-[#333]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({
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
      <p className="shrink-0 text-[9px] text-black/35">
        {label}
      </p>

      <p
        className={`max-w-[260px] text-right text-[10px] font-bold ${
          breakValue
            ? "break-all"
            : "capitalize"
        }`}
      >
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
        "bg-green-50 text-green-700",

      matured:
        "bg-blue-50 text-blue-700",

      withdrawal_requested:
        "bg-amber-50 text-amber-700",

      completed:
        "bg-gray-100 text-gray-600",
    };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.05em] ${
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

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getClientName(
  investment:
    TenantInvestment,
) {
  const name =
    [
      investment.client_first_name,
      investment.client_middle_name,
      investment.client_last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return (
    name ||
    investment.client_email ||
    "Client"
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

  if (
    !Number.isFinite(
      numeric,
    )
  ) {
    return "0.00";
  }

  return numeric.toFixed(
    2,
  );
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
      year: "2-digit",
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