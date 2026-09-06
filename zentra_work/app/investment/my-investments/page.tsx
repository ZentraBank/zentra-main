"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
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
  Investment,
} from "@/types/investment.types";

type Filter =
  | "all"
  | "active"
  | "matured"
  | "withdrawal_requested"
  | "completed";

export default function MyInvestmentsPage() {
  const [
    investments,
    setInvestments,
  ] = useState<
    Investment[]
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

  const [
    filter,
    setFilter,
  ] =
    useState<Filter>(
      "all",
    );

  const [
    selectedId,
    setSelectedId,
  ] = useState("");

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await investmentService.listMine({
              page: 1,
              pageSize: 100,
            });

          setInvestments(
            result,
          );

          setSelectedId(
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
              : "Unable to load your investments.",
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

          return (
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

  const selected =
    useMemo(
      () =>
        filtered.find(
          (investment) =>
            investment.id ===
            selectedId,
        ) ??
        filtered[0] ??
        null,
      [
        filtered,
        selectedId,
      ],
    );

  const totals =
    useMemo(() => {
      return investments.reduce(
        (
          result,
          investment,
        ) => {
          result.principal +=
            Number(
              investment.principal,
            ) || 0;

          result.current +=
            Number(
              investment.current_value ??
                investment.principal,
            ) || 0;

          result.accrued +=
            Number(
              investment.accrued_return ??
                0,
            ) || 0;

          result.expected +=
            Number(
              investment.maturity_amount,
            ) || 0;

          if (
            investment.status ===
            "active"
          ) {
            result.active +=
              1;
          }

          return result;
        },
        {
          principal: 0,
          current: 0,
          accrued: 0,
          expected: 0,
          active: 0,
        },
      );
    }, [investments]);

  const portfolioCurrency =
    useMemo(() => {
      const currencies =
        new Set(
          investments.map(
            (investment) =>
              investment.currency,
          ),
        );

      if (
        currencies.size ===
        1
      ) {
        return Array.from(
          currencies,
        )[0];
      }

      return null;
    }, [investments]);

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

  return (
    <main className="min-h-screen bg-[#13813d] px-5 pb-12 pt-10 text-white lg:flex lg:items-center lg:justify-center lg:px-12 lg:py-16">
      {/* Mobile Layout Wrapper */}
      <section className="mx-auto w-full max-w-[430px] lg:hidden">
        <header className="relative flex items-center justify-center">
          <Link
            href="/investment/investment-types"
            className="absolute left-0 text-white"
          >
            <ArrowLeft
              size={21}
            />
          </Link>

          <p className="font-heading text-[13px] font-bold tracking-[0.12em]">
            My Investments
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

        <h1 className="mt-6 text-center text-[31px] font-black leading-[34px]">
          Your Portfolio
        </h1>

        <p className="mx-auto mt-3 max-w-[330px] text-center text-[11px] leading-5 text-white/65">
          Track your investments, growth and maturity in one place.
        </p>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6 rounded-[20px] bg-[#10291E] px-5 py-5 shadow-lg">
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/35">
            Portfolio Value
          </p>

          <p className="mt-2 text-[34px] font-black tracking-[-0.04em] text-[#71D49B]">
            {portfolioCurrency
              ? formatMoney(
                  totals.current,
                  portfolioCurrency,
                )
              : totals.current.toLocaleString()}
          </p>

          <p className="mt-1 text-[10px] font-semibold text-[#71D49B]/70">
            +
            {portfolioCurrency
              ? formatMoney(
                  totals.accrued,
                  portfolioCurrency,
                )
              : totals.accrued.toLocaleString()}{" "}
            total growth
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <PortfolioMetric
              label="Principal"
              value={
                portfolioCurrency
                  ? formatMoney(
                      totals.principal,
                      portfolioCurrency,
                    )
                  : totals.principal.toLocaleString()
              }
            />

            <PortfolioMetric
              label="Projected"
              value={
                portfolioCurrency
                  ? formatMoney(
                      totals.expected,
                      portfolioCurrency,
                    )
                  : totals.expected.toLocaleString()
              }
            />

            <PortfolioMetric
              label="Active"
              value={String(
                totals.active,
              )}
            />
          </div>
        </section>

        <div className="mt-6">
          <div className="relative">
            <Search
              size={14}
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
              placeholder="Search investments"
              className="h-[44px] w-full rounded-[11px] bg-white pl-10 pr-4 text-[11px] text-black outline-none"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <FilterButton
              label="All"
              value="all"
              current={filter}
              onClick={
                setFilter
              }
            />

            <FilterButton
              label="Active"
              value="active"
              current={filter}
              onClick={
                setFilter
              }
            />

            <FilterButton
              label="Matured"
              value="matured"
              current={filter}
              onClick={
                setFilter
              }
            />

            <FilterButton
              label="Withdrawal"
              value="withdrawal_requested"
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

        {filtered.length ===
        0 ? (
          <div className="mt-7 grid min-h-[310px] place-items-center rounded-[20px] border border-dashed border-white/20 bg-white/10">
            <div className="text-center">
              <TrendingUp
                size={35}
                className="mx-auto"
              />

              <p className="mt-4 text-[14px] font-black">
                No investments yet
              </p>

              <Link
                href="/investment/investment-types"
                className="mt-4 inline-flex h-[38px] items-center justify-center rounded-[9px] bg-white px-4 text-[10px] font-bold text-[#13813d]"
              >
                Explore Investments
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="relative mt-7 min-h-[420px]">
              {filtered
                .slice(
                  0,
                  6,
                )
                .map(
                  (
                    investment,
                    index,
                  ) => {
                    const active =
                      investment.id ===
                      selected?.id;

                    const visualIndex =
                      active
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
                          setSelectedId(
                            investment.id,
                          )
                        }
                        style={{
                          top: `${
                            visualIndex *
                            34
                          }px`,

                          zIndex:
                            active
                              ? 50
                              : 30 -
                                visualIndex,

                          transform:
                            active
                              ? "scale(1)"
                              : `scale(${
                                  1 -
                                  visualIndex *
                                    0.018
                                })`,
                        }}
                        className={`absolute left-0 right-0 h-[300px] overflow-hidden rounded-[20px] border text-left shadow-xl transition-all duration-300 ${
                          active
                            ? "border-[#71D49B]/40 bg-[#10291E]"
                            : "border-white/10 bg-[#173528]"
                        }`}
                      >
                        <InvestmentGraphCard
                          investment={
                            investment
                          }
                          active={
                            active
                          }
                        />
                      </button>
                    );
                  },
                )}
            </section>

            {selected && (
              <section className="mt-5 rounded-[20px] bg-white px-5 py-5 text-[#292929] shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-black/30">
                      Selected Investment
                    </p>

                    <h2 className="mt-1 text-[18px] font-black">
                      {selected.product_name ||
                        "Investment"}
                    </h2>
                  </div>

                  <StatusBadge
                    status={
                      selected.status
                    }
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <DetailCard
                    label="Current Value"
                    value={formatMoney(
                      selected.current_value ??
                        selected.principal,
                      selected.currency,
                    )}
                    positive
                  />

                  <DetailCard
                    label="Growth"
                    value={formatMoney(
                      selected.accrued_return ??
                        0,
                      selected.currency,
                    )}
                    positive
                  />

                  <DetailCard
                    label="Rate"
                    value={`${formatNumber(
                      selected.annual_rate,
                    )}%`}
                  />

                  <DetailCard
                    label="Remaining"
                    value={`${selected.days_remaining ?? 0} days`}
                  />
                </div>

                <Link
                  href={`/investment/my-investments/${encodeURIComponent(
                    selected.id,
                  )}`}
                  className="mt-5 flex h-[44px] items-center justify-center gap-2 rounded-[11px] bg-[#1D4ED8] text-[11px] font-bold text-white"
                >
                  View Investment

                  <ChevronRight
                    size={15}
                  />
                </Link>
              </section>
            )}
          </>
        )}
      </section>

      {/* Desktop Layout Wrapper */}
      <section className="hidden lg:mx-auto lg:flex lg:w-full lg:max-w-[1200px] lg:flex-col">
        {/* Top Header Bar */}
        <header className="relative mb-10 flex items-center justify-between rounded-[24px] border border-white/20 bg-white/10 px-8 py-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-4">
            <Link
              href="/investment/investment-types"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#13813d] shadow-md transition hover:bg-white/90"
            >
              <ArrowLeft
                size={20}
              />
            </Link>

            <div>
              <h1 className="font-heading text-[22px] font-black tracking-tight text-white">
                My Investment Portfolio & Growth
              </h1>
              <p className="mt-0.5 text-xs text-white/80">
                Track active portfolios, analyze returns, and manage maturities securely.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/investment/investment-types"
              className="flex items-center gap-2 rounded-full bg-white text-[#13813d] px-6 py-2.5 text-xs font-bold shadow-md transition hover:bg-white/90"
            >
              <TrendingUp size={16} />
              Explore New Investments
            </Link>

            <button
              type="button"
              onClick={() =>
                void load()
              }
              className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white shadow-sm transition hover:bg-white/30"
              aria-label="Refresh portfolio"
            >
              <RefreshCw
                size={18}
              />
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-[16px] bg-red-50 px-6 py-4 text-sm font-semibold text-red-700 shadow-md">
            {error}
          </div>
        )}

        {/* Portfolio Summary Banner */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-[24px] border border-white/20 bg-[#10291E] p-8 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">
              Total Portfolio Value
            </p>
            <p className="mt-3 text-3xl font-black text-[#71D49B]">
              {portfolioCurrency
                ? formatMoney(totals.current, portfolioCurrency)
                : totals.current.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#71D49B]/80">
              +{portfolioCurrency ? formatMoney(totals.accrued, portfolioCurrency) : totals.accrued.toLocaleString()} total growth
            </p>
          </div>

          <div className="rounded-[24px] border border-white/20 bg-white/10 p-8 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">
              Total Principal Invested
            </p>
            <p className="text-2xl font-black text-white">
              {portfolioCurrency
                ? formatMoney(totals.principal, portfolioCurrency)
                : totals.principal.toLocaleString()}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/20 bg-white/10 p-8 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">
              Projected Maturity Value
            </p>
            <p className="text-2xl font-black text-white">
              {portfolioCurrency
                ? formatMoney(totals.expected, portfolioCurrency)
                : totals.expected.toLocaleString()}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/20 bg-white/10 p-8 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">
              Active Portfolios
            </p>
            <p className="text-2xl font-black text-white">
              {totals.active} Active
            </p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name or ID..."
              className="h-12 w-full rounded-[14px] bg-white pl-11 pr-4 text-xs font-semibold text-black outline-none shadow-sm focus:ring-2 focus:ring-[#71D49B]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All Portfolios"
              value="all"
              current={filter}
              onClick={setFilter}
            />
            <FilterButton
              label="Active"
              value="active"
              current={filter}
              onClick={setFilter}
            />
            <FilterButton
              label="Matured"
              value="matured"
              current={filter}
              onClick={setFilter}
            />
            <FilterButton
              label="Withdrawal Requested"
              value="withdrawal_requested"
              current={filter}
              onClick={setFilter}
            />
            <FilterButton
              label="Completed"
              value="completed"
              current={filter}
              onClick={setFilter}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-dashed border-white/30 bg-white/10 px-6 backdrop-blur-sm">
            <div className="text-center text-white max-w-sm">
              <TrendingUp size={44} className="mx-auto text-white/70" />
              <p className="mt-4 text-lg font-black">
                No investments found
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                You do not have any investments matching the current search criteria or filter status.
              </p>
              <Link
                href="/investment/investment-types"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-[12px] bg-white px-6 text-xs font-bold text-[#13813d] shadow-md transition hover:bg-white/90"
              >
                Explore Investment Opportunities
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((investment) => (
              <div
                key={investment.id}
                className="flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/20 bg-[#10291E] shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Investment Asset
                      </p>
                      <h3 className="mt-1 font-heading text-xl font-black text-white">
                        {investment.product_name || "Investment"}
                      </h3>
                      <p className="mt-1 text-xs text-white/60">
                        {formatNumber(investment.annual_rate)}% Rate • {formatDuration(investment.duration_days)}
                      </p>
                    </div>

                    <StatusBadge status={investment.status} dark />
                  </div>

                  <div className="mt-6 rounded-[16px] bg-white/5 p-5 border border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Current Value
                    </p>
                    <p className="mt-1 text-2xl font-black text-[#71D49B]">
                      {formatMoney(
                        investment.current_value ?? investment.principal,
                        investment.currency,
                      )}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#71D49B]/80">
                      +{formatMoney(investment.accrued_return ?? 0, investment.currency)} accrued growth
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-[12px] bg-white/5 p-3.5 border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-white/40">Principal</p>
                      <p className="mt-1 text-xs font-black text-white">
                        {formatMoney(investment.principal, investment.currency)}
                      </p>
                    </div>

                    <div className="rounded-[12px] bg-white/5 p-3.5 border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-white/40">Remaining</p>
                      <p className="mt-1 text-xs font-black text-white">
                        {investment.days_remaining ?? 0} days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 px-8 py-5 backdrop-blur-sm border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-white/70">
                    ID: {investment.id.slice(0, 8)}...
                  </span>

                  <Link
                    href={`/investment/my-investments/${encodeURIComponent(
                      investment.id,
                    )}`}
                    className="flex items-center gap-1.5 rounded-full bg-[#1D4ED8] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-600"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function InvestmentGraphCard({
  investment,
  active,
}: {
  investment:
    Investment;

  active: boolean;
}) {
  const points =
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
      points,
      640,
      145,
    );

  return (
    <div className="h-full px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-black">
            {investment.product_name ||
              "Investment"}
          </p>

          <p className="mt-1 text-[9px] text-white/40">
            {formatNumber(
              investment.annual_rate,
            )}
            % •{" "}
            {formatDuration(
              investment.duration_days,
            )}
          </p>
        </div>

        <StatusBadge
          status={
            investment.status
          }
          dark
        />
      </div>

      <div className="mt-4">
        <p className="text-[8px] uppercase tracking-[0.07em] text-white/30">
          Current Value
        </p>

        <p className="mt-1 text-[27px] font-black tracking-[-0.04em] text-[#71D49B]">
          {formatMoney(
            investment.current_value ??
              investment.principal,
            investment.currency,
          )}
        </p>

        <p className="mt-1 text-[9px] font-semibold text-[#71D49B]/70">
          +
          {formatMoney(
            investment.accrued_return ??
              0,
            investment.currency,
          )}{" "}
          growth
        </p>
      </div>

      <div className="relative mt-3 h-[145px]">
        <svg
          viewBox="0 0 640 145"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient
              id={`client-investment-${investment.id}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity="0.25"
              />

              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d={`${path} L 640 145 L 0 145 Z`}
            fill={`url(#client-investment-${investment.id})`}
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
            className="text-[#71D49B]"
          />
        </svg>
      </div>
    </div>
  );
}

function PortfolioMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[11px] border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-white/30">
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-black">
        {value}
      </p>
    </div>
  );
}

function DetailCard({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[12px] bg-[#F6F8F7] px-3 py-3">
      <p className="text-[8px] font-semibold uppercase tracking-[0.04em] text-black/30">
        {label}
      </p>

      <p
        className={`mt-1 text-[12px] font-black ${
          positive
            ? "text-[#16884B]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

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
      className={`h-[34px] lg:h-11 shrink-0 rounded-full px-4 lg:px-6 text-[9px] lg:text-xs font-bold transition ${
        current ===
        value
          ? "bg-white text-[#13813d] shadow-md"
          : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
  dark = false,
}: {
  status: string;
  dark?: boolean;
}) {
  const styles =
    dark
      ? {
          active:
            "bg-[#71D49B]/15 text-[#71D49B]",
          matured:
            "bg-blue-400/15 text-blue-300",
          withdrawal_requested:
            "bg-amber-400/15 text-amber-300",
          completed:
            "bg-white/10 text-white/55",
        }
      : {
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
      className={`rounded-full px-2.5 py-1 text-[8px] lg:text-[10px] font-black uppercase ${
        styles[
          status as keyof typeof styles
        ] ??
        (
          dark
            ? "bg-white/10 text-white/60"
            : "bg-gray-100 text-gray-600"
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