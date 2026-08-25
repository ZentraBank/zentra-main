"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
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
  InvestmentProduct,
} from "@/types/investment.types";

type RiskFilter =
  | "all"
  | "low"
  | "medium"
  | "high";

export default function InvestmentsPage() {
  const [
    products,
    setProducts,
  ] = useState<
    InvestmentProduct[]
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
    riskFilter,
    setRiskFilter,
  ] =
    useState<RiskFilter>(
      "all",
    );

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await investmentService.listProducts({
              page: 1,
              pageSize: 100,
            });

          setProducts(
            result,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load investments.",
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

  const filteredProducts =
    useMemo(() => {
      if (
        riskFilter ===
        "all"
      ) {
        return products;
      }

      return products.filter(
        (product) =>
          product.risk_level
            ?.toLowerCase() ===
          riskFilter,
      );
    }, [
      products,
      riskFilter,
    ]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#13813d]">
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-10 pt-14">
        <header className="relative flex items-center justify-center">
          <Link
            href="/investment"
            className="absolute left-0 text-[#1F1F1F]"
          >
            <ArrowLeft
              size={20}
            />
          </Link>

          <p className="font-heading text-[13px] font-bold tracking-[0.15em] text-[#1F1F1F]">
            Investments
          </p>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={loading}
            className="absolute right-0 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </header>

        <h1 className="mt-6 text-center font-heading text-[31px] font-black leading-[34px] text-white">
          Take Financial
          Control
        </h1>

        <p className="mx-auto mt-4 max-w-[340px] text-center text-[13px] font-medium leading-[18px] text-white/80">
          Explore investment
          opportunities designed
          around your goals,
          timeline and risk
          appetite.
        </p>

        <Link
          href="/investment/my-investments"
          className="mt-6 flex h-[44px] w-full items-center justify-between rounded-[12px] bg-white/15 px-4 text-white backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <WalletCards
              size={18}
            />

            <div>
              <p className="text-[11px] font-black">
                My Investments
              </p>

              <p className="text-[9px] text-white/65">
                Track your active
                investments
              </p>
            </div>
          </div>

          <ChevronRight
            size={17}
          />
        </Link>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <RiskButton
            label="All"
            active={
              riskFilter ===
              "all"
            }
            onClick={() =>
              setRiskFilter(
                "all",
              )
            }
          />

          <RiskButton
            label="Low Risk"
            active={
              riskFilter ===
              "low"
            }
            onClick={() =>
              setRiskFilter(
                "low",
              )
            }
          />

          <RiskButton
            label="Medium"
            active={
              riskFilter ===
              "medium"
            }
            onClick={() =>
              setRiskFilter(
                "medium",
              )
            }
          />

          <RiskButton
            label="High Risk"
            active={
              riskFilter ===
              "high"
            }
            onClick={() =>
              setRiskFilter(
                "high",
              )
            }
          />
        </div>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-[320px] place-items-center rounded-[18px] bg-white/10">
            <div className="text-center text-white">
              <Loader2
                size={30}
                className="mx-auto animate-spin"
              />

              <p className="mt-3 text-[11px] text-white/65">
                Loading investment
                opportunities...
              </p>
            </div>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="mt-8 grid min-h-[300px] place-items-center rounded-[18px] border border-dashed border-white/30 bg-white/10 px-5">
            <div className="text-center text-white">
              <TrendingUp
                size={36}
                className="mx-auto"
              />

              <p className="mt-4 text-[14px] font-black">
                No investments
                available
              </p>

              <p className="mt-2 text-[10px] leading-4 text-white/60">
                There are currently
                no active investment
                products matching
                this filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {filteredProducts.map(
              (product) => (
                <InvestmentCard
                  key={
                    product.id
                  }
                  product={
                    product
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

function InvestmentCard({
  product,
}: {
  product:
    InvestmentProduct;
}) {
  return (
    <Link
      href={`/investment/investment-types/${encodeURIComponent(
        product.id,
      )}`}
      className="block overflow-hidden rounded-[16px] border border-white/30 bg-[#c9f2ee] text-[#263238] shadow-md transition active:scale-[0.99]"
    >
      <div className="bg-gradient-to-br from-[#E9FFF8] to-[#BFECE1] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#16884b]/60">
              Investment
              opportunity
            </p>

            <h2 className="mt-2 font-heading text-[18px] font-black leading-[21px] text-[#24302b]">
              {product.name}
            </h2>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#16884b] text-white shadow-sm">
            <TrendingUp
              size={21}
            />
          </div>
        </div>

        {product.description && (
          <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-[#33443d]/65">
            {
              product.description
            }
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <ProductStat
            icon={
              <TrendingUp
                size={13}
              />
            }
            label="Annual rate"
            value={`${formatNumber(
              product.annual_rate,
            )}%`}
          />

          <ProductStat
            icon={
              <Clock3
                size={13}
              />
            }
            label="Duration"
            value={formatDuration(
              product.duration_days,
            )}
          />

          <ProductStat
            icon={
              <ShieldCheck
                size={13}
              />
            }
            label="Risk"
            value={
              product.risk_level ||
              "—"
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/65 px-5 py-4">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.06em] text-black/35">
            Minimum investment
          </p>

          <p className="mt-1 text-[14px] font-black text-[#16884b]">
            {formatMoney(
              product.minimum_amount,
              product.currency,
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-black text-[#1D4ED8]">
          View details

          <ChevronRight
            size={15}
          />
        </div>
      </div>
    </Link>
  );
}

function ProductStat({
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
    <div className="rounded-[10px] bg-white/65 px-2 py-3">
      <div className="flex items-center gap-1 text-[#16884b]">
        {icon}

        <p className="text-[7px] font-semibold uppercase">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-[10px] font-black capitalize">
        {value}
      </p>
    </div>
  );
}

function RiskButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-[35px] shrink-0 rounded-full px-4 text-[9px] font-bold transition ${
        active
          ? "bg-white text-[#13813d]"
          : "border border-white/25 bg-white/10 text-white"
      }`}
    >
      {label}
    </button>
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

function formatNumber(
  value:
    | string
    | number,
) {
  const numeric =
    Number(value);

  return Number.isInteger(
    numeric,
  )
    ? String(numeric)
    : numeric.toFixed(2);
}

function formatDuration(
  days: number,
) {
  if (
    days % 365 ===
      0 &&
    days >= 365
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
    days % 30 ===
      0 &&
    days >= 30
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