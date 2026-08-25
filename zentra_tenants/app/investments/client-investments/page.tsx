"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  UsersRound,
  WalletCards,
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
  TenantInvestment,
} from "@/services/investment.service";

type InvestmentFilter =
  | "all"
  | "active"
  | "matured"
  | "withdrawal_requested"
  | "completed";

export default function ClientInvestmentsPage() {
  const [
    investments,
    setInvestments,
  ] = useState<
    TenantInvestment[]
  >([]);

  const [
    selectedInvestmentId,
    setSelectedInvestmentId,
  ] = useState("");

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

  const [
    filter,
    setFilter,
  ] =
    useState<InvestmentFilter>(
      "all",
    );

  /*
  |--------------------------------------------------------------------------
  | Load investments
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await investmentService.listAll({
              page: 1,
              pageSize: 100,
            });

          setInvestments(
            result,
          );

          setSelectedInvestmentId(
            (current) => {
              if (
                current &&
                result.some(
                  (investment) =>
                    investment.id ===
                    current,
                )
              ) {
                return current;
              }

              return (
                result[0]?.id ??
                ""
              );
            },
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load client investments.",
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

  /*
  |--------------------------------------------------------------------------
  | Search / filter
  |--------------------------------------------------------------------------
  */

  const filteredInvestments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return investments.filter(
        (investment) => {
          if (
            filter !==
              "all" &&
            investment.status !==
              filter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const clientName =
            getClientName(
              investment,
            ).toLowerCase();

          return (
            clientName.includes(
              query,
            ) ||
            (
              investment.client_email ??
              ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              investment.product_name ??
              ""
            )
              .toLowerCase()
              .includes(query) ||
            investment.id
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [
      investments,
      search,
      filter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Selected investment
  |--------------------------------------------------------------------------
  */

  const selectedInvestment =
    useMemo(
      () =>
        filteredInvestments.find(
          (investment) =>
            investment.id ===
            selectedInvestmentId,
        ) ??
        filteredInvestments[0] ??
        null,
      [
        filteredInvestments,
        selectedInvestmentId,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Portfolio totals
  |--------------------------------------------------------------------------
  */

  const totals =
    useMemo(() => {
      return investments.reduce(
        (
          accumulator,
          investment,
        ) => {
          const principal =
            Number(
              investment.principal,
            ) || 0;

          const currentValue =
            Number(
              investment.current_value ??
                investment.principal,
            ) || 0;

          const accrued =
            Number(
              investment.accrued_return ??
                0,
            ) || 0;

          const maturity =
            Number(
              investment.maturity_amount,
            ) || 0;

          accumulator.principal +=
            principal;

          accumulator.current +=
            currentValue;

          accumulator.accrued +=
            accrued;

          accumulator.maturity +=
            maturity;

          if (
            investment.status ===
            "active"
          ) {
            accumulator.active +=
              1;
          }

          return accumulator;
        },
        {
          principal: 0,
          current: 0,
          accrued: 0,
          maturity: 0,
          active: 0,
        },
      );
    }, [investments]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F4F6F8]">
        <div className="text-center">
          <Loader2
            size={31}
            className="mx-auto animate-spin text-[#2458E8]"
          />

          <p className="mt-3 text-[11px] text-black/40">
            Loading client
            investments...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#272727]">
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
                Client Investments
              </h1>

              <p className="mt-1 text-[11px] text-black/40">
                Monitor client
                portfolios, growth
                and maturity.
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
              href="/dashboard/investments/create"
              className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#2458E8] px-4 text-[11px] font-bold text-white"
            >
              <Plus size={15} />

              New Investment
            </Link>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Portfolio summary */}

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Total Principal"
            value={formatPortfolioMoney(
              totals.principal,
              investments,
            )}
            icon={
              <WalletCards
                size={17}
              />
            }
          />

          <SummaryCard
            label="Current Value"
            value={formatPortfolioMoney(
              totals.current,
              investments,
            )}
            icon={
              <TrendingUp
                size={17}
              />
            }
            positive
          />

          <SummaryCard
            label="Accrued Growth"
            value={formatPortfolioMoney(
              totals.accrued,
              investments,
            )}
            icon={
              <TrendingUp
                size={17}
              />
            }
            positive
          />

          <SummaryCard
            label="Projected Value"
            value={formatPortfolioMoney(
              totals.maturity,
              investments,
            )}
            icon={
              <CalendarDays
                size={17}
              />
            }
          />

          <SummaryCard
            label="Active Investments"
            value={String(
              totals.active,
            )}
            icon={
              <UsersRound
                size={17}
              />
            }
          />
        </div>

        {/* Search */}

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
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
              placeholder="Search client, product or investment ID"
              className="h-[46px] w-full rounded-[11px] border border-black/10 bg-white pl-11 pr-4 text-[11px] outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {(
              [
                [
                  "all",
                  "All",
                ],
                [
                  "active",
                  "Active",
                ],
                [
                  "matured",
                  "Matured",
                ],
                [
                  "withdrawal_requested",
                  "Withdrawal",
                ],
                [
                  "completed",
                  "Completed",
                ],
              ] as const
            ).map(
              ([
                value,
                label,
              ]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(
                      value,
                    )
                  }
                  className={`h-[46px] shrink-0 rounded-[11px] px-4 text-[10px] font-bold ${
                    filter ===
                    value
                      ? "bg-[#2458E8] text-white"
                      : "border border-black/10 bg-white text-black/50"
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        {filteredInvestments.length ===
        0 ? (
          <div className="mt-7 grid min-h-[340px] place-items-center rounded-[20px] border border-dashed border-black/10 bg-white">
            <div className="text-center">
              <TrendingUp
                size={35}
                className="mx-auto text-[#2458E8]"
              />

              <p className="mt-4 text-[14px] font-black">
                No investments
                found
              </p>

              <p className="mt-2 text-[10px] text-black/40">
                Client investments
                will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            {/* Overlapping graph stack */}

            <section className="rounded-[22px] bg-[#14251D] p-5 text-white shadow-sm md:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                    Portfolio Stack
                  </p>

                  <h2 className="mt-2 text-[21px] font-black">
                    Growth Overview
                  </h2>

                  <p className="mt-1 text-[10px] text-white/40">
                    Click an
                    investment to
                    bring its graph
                    forward.
                  </p>
                </div>

                <TrendingUp
                  size={20}
                  className="text-[#71D49B]"
                />
              </div>

              <div className="relative mt-8 min-h-[420px]">
                {filteredInvestments
                  .slice(
                    0,
                    6,
                  )
                  .map(
                    (
                      investment,
                      index,
                    ) => {
                      const selected =
                        investment.id ===
                        selectedInvestment
                          ?.id;

                      const visualIndex =
                        selected
                          ? 0
                          : index +
                            1;

                      return (
                        <button
                          key={
                            investment.id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedInvestmentId(
                              investment.id,
                            )
                          }
                          style={{
                            top: `${
                              visualIndex *
                              36
                            }px`,

                            zIndex:
                              selected
                                ? 50
                                : 30 -
                                  visualIndex,

                            transform:
                              selected
                                ? "scale(1)"
                                : `scale(${
                                    1 -
                                    visualIndex *
                                      0.018
                                  })`,
                          }}
                          className={`absolute left-0 right-0 h-[300px] overflow-hidden rounded-[20px] border text-left shadow-xl transition-all duration-300 ${
                            selected
                              ? "border-[#71D49B]/40 bg-[#1C3428]"
                              : "border-white/10 bg-[#1A3025]"
                          }`}
                        >
                          <InvestmentGraphCard
                            investment={
                              investment
                            }
                            active={
                              selected
                            }
                          />
                        </button>
                      );
                    },
                  )}
              </div>

              {filteredInvestments.length >
                6 && (
                <p className="mt-3 text-center text-[9px] text-white/30">
                  Showing the first
                  6 investments.
                  Use search or
                  filters to narrow
                  the portfolio.
                </p>
              )}
            </section>

            {/* Selected details */}

            {selectedInvestment && (
              <InvestmentDetailsPanel
                investment={
                  selectedInvestment
                }
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Graph card
|--------------------------------------------------------------------------
*/

function InvestmentGraphCard({
  investment,
  active,
}: {
  investment:
    TenantInvestment;

  active: boolean;
}) {
  const graphPoints =
    useMemo(
      () =>
        buildGrowthPoints(
          investment,
          30,
        ),
      [investment],
    );

  const path =
    buildSvgPath(
      graphPoints,
      640,
      155,
    );

  const principal =
    Number(
      investment.principal,
    );

  const currentValue =
    Number(
      investment.current_value ??
        investment.principal,
    );

  return (
    <div className="h-full px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-black text-white">
            {investment.product_name ||
              "Investment"}
          </p>

          <p className="mt-1 truncate text-[9px] text-white/40">
            {getClientName(
              investment,
            )}
          </p>
        </div>

        <StatusBadge
          status={
            investment.status
          }
        />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-white/30">
            Current Value
          </p>

          <p className="mt-1 text-[26px] font-black tracking-[-0.04em] text-[#71D49B]">
            {formatMoney(
              currentValue,
              investment.currency,
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[8px] text-white/30">
            Growth
          </p>

          <p className="mt-1 text-[11px] font-black text-[#71D49B]">
            +
            {formatMoney(
              Math.max(
                0,
                currentValue -
                  principal,
              ),
              investment.currency,
            )}
          </p>
        </div>
      </div>

      <div className="relative mt-3 h-[155px] w-full overflow-hidden">
        <svg
          viewBox="0 0 640 155"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient
              id={`investment-fill-${investment.id}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity="0.24"
              />

              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <line
            x1="0"
            x2="640"
            y1="130"
            y2="130"
            stroke="currentColor"
            strokeOpacity="0.08"
          />

          <path
            d={`${path} L 640 155 L 0 155 Z`}
            fill={`url(#investment-fill-${investment.id})`}
            className="text-[#71D49B]"
          />

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth={
              active
                ? 4
                : 3
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#71D49B]"
          />
        </svg>
      </div>

      <div className="mt-1 flex items-center justify-between text-[8px] text-white/30">
        <span>
          Started{" "}
          {formatDateShort(
            investment.started_at,
          )}
        </span>

        <span>
          {formatNumber(
            investment.growth_progress ??
              0,
          )}
          % complete
        </span>

        <span>
          {formatDateShort(
            investment.maturity_date,
          )}
        </span>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Detail panel
|--------------------------------------------------------------------------
*/

function InvestmentDetailsPanel({
  investment,
}: {
  investment:
    TenantInvestment;
}) {
  const clientName =
    getClientName(
      investment,
    );

  return (
    <section className="rounded-[22px] bg-white p-5 shadow-sm md:p-7">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-black/30">
        Selected Investment
      </p>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[21px] font-black">
            {investment.product_name ||
              "Investment"}
          </h2>

          <p className="mt-1 text-[11px] font-semibold text-[#2458E8]">
            {clientName}
          </p>

          {investment.client_email && (
            <p className="mt-1 text-[9px] text-black/35">
              {
                investment.client_email
              }
            </p>
          )}
        </div>

        <StatusBadge
          status={
            investment.status
          }
          light
        />
      </div>

      <div className="mt-7 rounded-[16px] bg-[#F3F8F5] px-4 py-5">
        <p className="text-[9px] uppercase tracking-[0.08em] text-black/30">
          Current Value
        </p>

        <p className="mt-1 text-[32px] font-black tracking-[-0.04em] text-[#16884B]">
          {formatMoney(
            investment.current_value ??
              investment.principal,
            investment.currency,
          )}
        </p>

        <p className="mt-1 text-[10px] font-semibold text-[#16884B]/70">
          +
          {formatMoney(
            investment.accrued_return ??
              0,
            investment.currency,
          )}{" "}
          accrued
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Metric
          label="Principal"
          value={formatMoney(
            investment.principal,
            investment.currency,
          )}
        />

        <Metric
          label="Annual Rate"
          value={`${formatNumber(
            investment.annual_rate,
          )}%`}
        />

        <Metric
          label="Expected Return"
          value={formatMoney(
            investment.expected_return,
            investment.currency,
          )}
          positive
        />

        <Metric
          label="Maturity Value"
          value={formatMoney(
            investment.maturity_amount,
            investment.currency,
          )}
          positive
        />

        <Metric
          label="Duration"
          value={formatDuration(
            investment.duration_days,
          )}
        />

        <Metric
          label="Days Remaining"
          value={String(
            investment.days_remaining ??
              0,
          )}
        />
      </div>

      <div className="mt-6 rounded-[14px] border border-black/5 px-4 py-4">
        <Detail
          label="Started"
          value={formatDateTime(
            investment.started_at,
          )}
        />

        <Detail
          label="Maturity"
          value={formatDateTime(
            investment.maturity_date,
          )}
        />

        <Detail
          label="Risk Level"
          value={
            investment.risk_level ??
            "—"
          }
        />

        <Detail
          label="Payout Type"
          value={
            investment.payout_type
              ?.replaceAll(
                "_",
                " ",
              ) ??
            "—"
          }
        />

        <Detail
          label="Investment ID"
          value={
            investment.id
          }
        />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-[9px] font-semibold text-black/35">
          <span>
            Growth Progress
          </span>

          <span>
            {formatNumber(
              investment.growth_progress ??
                0,
            )}
            %
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-[#16884B] transition-all"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  Number(
                    investment.growth_progress ??
                      0,
                  ),
                ),
              )}%`,
            }}
          />
        </div>
      </div>

      <Link
        href={`/dashboard/investments/client-investments/${encodeURIComponent(
          investment.id,
        )}`}
        className="mt-7 flex h-[44px] items-center justify-center gap-2 rounded-[11px] bg-[#2458E8] text-[11px] font-bold text-white"
      >
        Open Full Details

        <ChevronRight
          size={15}
        />
      </Link>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Shared UI
|--------------------------------------------------------------------------
*/

function SummaryCard({
  label,
  value,
  icon,
  positive = false,
}: {
  label: string;
  value: string;
  icon:
    React.ReactNode;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[16px] bg-white px-4 py-4 shadow-sm">
      <div
        className={`flex items-center gap-2 ${
          positive
            ? "text-[#16884B]"
            : "text-[#2458E8]"
        }`}
      >
        {icon}

        <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-black/30">
          {label}
        </p>
      </div>

      <p
        className={`mt-3 truncate text-[19px] font-black ${
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

function Metric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[12px] bg-[#F7F8F9] px-3 py-3">
      <p className="text-[8px] font-semibold uppercase tracking-[0.05em] text-black/30">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-[12px] font-black ${
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

      <p className="max-w-[260px] break-all text-right text-[10px] font-bold capitalize">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
  light = false,
}: {
  status: string;
  light?: boolean;
}) {
  const styles:
    Record<
      string,
      string
    > = {
      active:
        light
          ? "bg-green-50 text-green-700"
          : "bg-[#71D49B]/15 text-[#71D49B]",

      matured:
        light
          ? "bg-blue-50 text-blue-700"
          : "bg-blue-400/15 text-blue-300",

      withdrawal_requested:
        light
          ? "bg-amber-50 text-amber-700"
          : "bg-amber-400/15 text-amber-300",

      completed:
        light
          ? "bg-gray-100 text-gray-600"
          : "bg-white/10 text-white/55",
    };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${
        styles[status] ??
        (
          light
            ? "bg-gray-100 text-gray-600"
            : "bg-white/10 text-white/60"
        )
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
| Graph generation
|--------------------------------------------------------------------------
*/

function buildGrowthPoints(
  investment:
    TenantInvestment,
  points: number,
) {
  const principal =
    Number(
      investment.principal,
    );

  const expectedReturn =
    Number(
      investment.expected_return,
    );

  const progress =
    Math.min(
      1,
      Math.max(
        0,
        Number(
          investment.growth_progress ??
            0,
        ) / 100,
      ),
    );

  return Array.from(
    {
      length:
        Math.max(
          points,
          2,
        ),
    },
    (
      _,
      index,
    ) => {
      const fraction =
        index /
        (
          Math.max(
            points,
            2,
          ) -
          1
        );

      /*
       * Full projected curve is
       * generated from the same
       * simple-interest model used
       * by the backend.
       */
      const value =
        principal +
        expectedReturn *
          fraction;

      return {
        fraction,
        value,

        reached:
          fraction <=
          progress,
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
    points.length === 0
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

function formatPortfolioMoney(
  value: number,
  investments:
    TenantInvestment[],
) {
  const currencies =
    new Set(
      investments.map(
        (investment) =>
          investment.currency,
      ),
    );

  /*
   * Don't falsely combine unlike
   * currencies into one currency
   * total.
   */
  if (
    currencies.size !==
    1
  ) {
    return value.toLocaleString(
      "en-GB",
      {
        maximumFractionDigits:
          2,
      },
    );
  }

  return formatMoney(
    value,
    Array.from(
      currencies,
    )[0] ||
      "USD",
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
      Number.isFinite(
        numeric,
      )
        ? numeric
        : 0,
    );
  } catch {
    return `${currency} ${Number.isFinite(
      numeric,
    )
      ? numeric.toLocaleString()
      : "0"}`;
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
    return "0";
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