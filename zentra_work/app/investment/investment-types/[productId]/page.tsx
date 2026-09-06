"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
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
  ClientAccount,
} from "@/types/account";

import type {
  InvestmentProduct,
} from "@/types/investment.types";

export default function InvestmentProductPage() {
  const { productId } =
    useParams<{
      productId: string;
    }>();

  const router =
    useRouter();

  const [
    product,
    setProduct,
  ] =
    useState<InvestmentProduct | null>(
      null,
    );

const [
  accounts,
  setAccounts,
] = useState<ClientAccount[]>(
  [],
);

  const [
    sourceAccountId,
    setSourceAccountId,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load product + accounts
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        if (!productId) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const [
            products,
            accountResult,
          ] =
            await Promise.all([
              investmentService.listProducts({
                page: 1,
                pageSize: 100,
              }),

              accountService.listMine()
            ]);

          const found =
            products.find(
              (item) =>
                item.id ===
                productId,
            );

          if (!found) {
            throw new Error(
              "Investment product not found.",
            );
          }

          setProduct(found);

          const eligibleAccounts =
            accountResult.filter(
              (account) =>
                account.status ===
                  "active" &&
                account.currency ===
                  found.currency,
            );

          setAccounts(
            eligibleAccounts,
          );

          if (
            eligibleAccounts.length ===
            1
          ) {
            setSourceAccountId(
              eligibleAccounts[0].id,
            );
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load investment product.",
          );
        } finally {
          setLoading(false);
        }
      },
      [productId],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            sourceAccountId,
        ) ?? null,
      [
        accounts,
        sourceAccountId,
      ],
    );

  const numericAmount =
    Number(amount) || 0;

  const expectedReturn =
    useMemo(() => {
      if (
        !product ||
        numericAmount <= 0
      ) {
        return 0;
      }

      return (
        numericAmount *
        (Number(
          product.annual_rate,
        ) /
          100) *
        (Number(
          product.duration_days,
        ) /
          365)
      );
    }, [
      numericAmount,
      product,
    ]);

  const maturityAmount =
    numericAmount +
    expectedReturn;

  const maturityDate =
    useMemo(() => {
      if (!product) {
        return null;
      }

      const date =
        new Date();

      date.setDate(
        date.getDate() +
          Number(
            product.duration_days,
          ),
      );

      return date;
    }, [product]);

  /*
  |--------------------------------------------------------------------------
  | Subscribe
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!product) {
        return;
      }

      setError("");

      if (!selectedAccount) {
        setError(
          "Select an eligible funding account.",
        );

        return;
      }

      if (
        !Number.isFinite(
          numericAmount,
        ) ||
        numericAmount <= 0
      ) {
        setError(
          "Enter a valid investment amount.",
        );

        return;
      }

      if (
        numericAmount <
        Number(
          product.minimum_amount,
        )
      ) {
        setError(
          `Minimum investment is ${formatMoney(
            product.minimum_amount,
            product.currency,
          )}.`,
        );

        return;
      }

      if (
        product.maximum_amount &&
        numericAmount >
          Number(
            product.maximum_amount,
          )
      ) {
        setError(
          `Maximum investment is ${formatMoney(
            product.maximum_amount,
            product.currency,
          )}.`,
        );

        return;
      }

      if (
        numericAmount >
        Number(
          selectedAccount.balance,
        )
      ) {
        setError(
          "Insufficient balance in the selected account.",
        );

        return;
      }

      setSubmitting(true);

      try {
        const investment =
          await investmentService.subscribe(
            {
              productId:
                product.id,

              sourceAccountId:
                selectedAccount.id,

              amount:
                numericAmount,
            },
          );

        router.push(
          `/investment/my-investments?investmentId=${encodeURIComponent(
            investment.id,
          )}&created=1`,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to start investment.",
        );
      } finally {
        setSubmitting(false);
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

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#13813d] px-6 text-white">
        <div className="text-center">
          <p className="font-bold">
            {error ||
              "Investment product not found."}
          </p>

          <Link
            href="/investment/investment-types"
            className="mt-4 inline-block text-[12px] underline"
          >
            Back to investments
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#13813d] text-[#24302b] lg:flex lg:items-center lg:justify-center lg:px-12 lg:py-16">
      {/* Mobile Layout Wrapper */}
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-10 pt-12 lg:hidden">
        <header className="relative flex items-center justify-center">
          <Link
            href="/investment/investment-types"
            className="absolute left-0 text-[#1F1F1F]"
          >
            <ArrowLeft
              size={21}
            />
          </Link>

          <p className="font-heading text-[13px] font-bold tracking-[0.13em]">
            Investment Details
          </p>
        </header>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-[20px] bg-[#c9f2ee] shadow-md">
          <div className="bg-gradient-to-br from-[#EBFFF8] to-[#B9E9DC] px-5 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#16884b]/60">
                  Investment Opportunity
                </p>

                <h1 className="mt-2 font-heading text-[24px] font-black leading-[27px]">
                  {product.name}
                </h1>
              </div>

              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#16884b] text-white">
                <TrendingUp
                  size={23}
                />
              </div>
            </div>

            {product.description && (
              <p className="mt-4 text-[11px] leading-5 text-black/55">
                {product.description}
              </p>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2">
              <InfoCard
                icon={
                  <TrendingUp
                    size={14}
                  />
                }
                label="Annual Rate"
                value={`${formatNumber(
                  product.annual_rate,
                )}%`}
              />

              <InfoCard
                icon={
                  <Clock3
                    size={14}
                  />
                }
                label="Duration"
                value={formatDuration(
                  product.duration_days,
                )}
              />

              <InfoCard
                icon={
                  <ShieldCheck
                    size={14}
                  />
                }
                label="Risk"
                value={
                  product.risk_level
                }
              />
            </div>
          </div>

          <div className="bg-white/70 px-5 py-5">
            <DetailRow
              label="Minimum"
              value={formatMoney(
                product.minimum_amount,
                product.currency,
              )}
            />

            <DetailRow
              label="Maximum"
              value={
                product.maximum_amount
                  ? formatMoney(
                      product.maximum_amount,
                      product.currency,
                    )
                  : "No maximum"
              }
            />

            <DetailRow
              label="Payout"
              value={product.payout_type.replaceAll(
                "_",
                " ",
              )}
            />

            <DetailRow
              label="Currency"
              value={
                product.currency
              }
            />
          </div>
        </section>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 rounded-[20px] bg-white px-5 py-6 shadow-md"
        >
          <h2 className="text-[18px] font-black">
            Start Investment
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-black/40">
            Choose a funding
            account and enter the
            amount you want to
            invest.
          </p>

          <div className="mt-5">
            <label className="text-[11px] font-bold text-black/55">
              Funding account
            </label>

            <select
              value={
                sourceAccountId
              }
              onChange={(
                event,
              ) =>
                setSourceAccountId(
                  event.target.value,
                )
              }
              className="mt-2 h-[52px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[12px] font-semibold outline-none"
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
                    {formatAccount(
                      account,
                    )}
                  </option>
                ),
              )}
            </select>

            {accounts.length ===
              0 && (
              <p className="mt-2 text-[10px] font-semibold text-red-600">
                You do not have an
                active{" "}
                {product.currency}{" "}
                account available
                for this investment.
              </p>
            )}
          </div>

          {selectedAccount && (
            <div className="mt-3 rounded-[12px] bg-[#F5F8F7] px-4 py-3">
              <DetailRow
                label="Available balance"
                value={formatMoney(
                  selectedAccount.balance,
                  selectedAccount.currency,
                )}
              />

              <DetailRow
                label="Account"
                value={`•••• ${selectedAccount.account_number.slice(
                  -4,
                )}`}
              />
            </div>
          )}

          <div className="mt-5">
            <label className="text-[11px] font-bold text-black/55">
              Investment amount
            </label>

            <div className="mt-2 flex h-[52px] overflow-hidden rounded-[12px] border border-black/10">
              <div className="grid min-w-[68px] place-items-center border-r border-black/10 text-[11px] font-black">
                {product.currency}
              </div>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  amount
                }
                onChange={(
                  event,
                ) =>
                  setAmount(
                    event.target.value,
                  )
                }
                placeholder="0.00"
                className="min-w-0 flex-1 px-4 text-[15px] font-black outline-none placeholder:text-black/20"
              />
            </div>
          </div>

          <section className="mt-6 rounded-[16px] bg-[#F2FBF6] px-4 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp
                size={16}
                className="text-[#16884b]"
              />

              <p className="text-[11px] font-black text-[#16884b]">
                Investment Projection
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <ProjectionRow
                label="Principal"
                value={formatMoney(
                  numericAmount,
                  product.currency,
                )}
              />

              <ProjectionRow
                label="Expected return"
                value={formatMoney(
                  expectedReturn,
                  product.currency,
                )}
                success
              />

              <ProjectionRow
                label="Maturity amount"
                value={formatMoney(
                  maturityAmount,
                  product.currency,
                )}
                success
              />

              <ProjectionRow
                label="Maturity date"
                value={
                  maturityDate
                    ? formatDate(
                        maturityDate,
                      )
                    : "—"
                }
              />
            </div>

            <p className="mt-4 text-[9px] leading-4 text-black/40">
              Returns shown are
              based on the product
              rate and duration.
              Final values are
              confirmed by the
              backend when the
              investment is
              created.
            </p>
          </section>

          <button
            type="submit"
            disabled={
              submitting ||
              accounts.length ===
                0
            }
            className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#1D4ED8] text-[13px] font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Starting investment...
              </>
            ) : (
              <>
                <WalletCards
                  size={16}
                />

                Invest Now
              </>
            )}
          </button>
        </form>
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
                Investment Subscription & Details
              </h1>
              <p className="mt-0.5 text-xs text-white/80">
                Review product metrics, evaluate compounding returns, and allocate funds securely.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-[16px] bg-red-50 px-6 py-4 text-sm font-semibold text-red-700 shadow-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-10">
          {/* Left Column: Product Specifications & Details */}
          <div className="col-span-6 space-y-8">
            <div className="overflow-hidden rounded-[32px] border border-white/20 bg-[#c9f2ee] shadow-xl">
              <div className="bg-gradient-to-br from-[#EBFFF8] to-[#B9E9DC] p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#16884b]/70">
                      Investment Opportunity
                    </p>

                    <h1 className="mt-2 font-heading text-3xl font-black leading-snug text-[#24302b]">
                      {product.name}
                    </h1>
                  </div>

                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[#16884b] text-white shadow-md">
                    <TrendingUp size={26} />
                  </div>
                </div>

                {product.description && (
                  <p className="mt-4 text-sm leading-relaxed text-black/70">
                    {product.description}
                  </p>
                )}

                <div className="mt-8 grid grid-cols-3 gap-3">
                  <InfoCardDesktop
                    icon={<TrendingUp size={16} />}
                    label="Annual Rate"
                    value={`${formatNumber(product.annual_rate)}%`}
                  />

                  <InfoCardDesktop
                    icon={<Clock3 size={16} />}
                    label="Duration"
                    value={formatDuration(product.duration_days)}
                  />

                  <InfoCardDesktop
                    icon={<ShieldCheck size={16} />}
                    label="Risk Level"
                    value={product.risk_level}
                  />
                </div>
              </div>

              <div className="bg-white/80 p-8 backdrop-blur-sm border-t border-black/5">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#24302b] mb-4">
                  Terms & Conditions
                </h3>
                <div className="space-y-4">
                  <DetailRowDesktop
                    label="Minimum Investment"
                    value={formatMoney(product.minimum_amount, product.currency)}
                  />
                  <DetailRowDesktop
                    label="Maximum Investment"
                    value={product.maximum_amount ? formatMoney(product.maximum_amount, product.currency) : "No maximum"}
                  />
                  <DetailRowDesktop
                    label="Payout Type"
                    value={product.payout_type.replaceAll("_", " ")}
                  />
                  <DetailRowDesktop
                    label="Currency"
                    value={product.currency}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Investment Action Form & Projections */}
          <div className="col-span-6">
            <form
              onSubmit={handleSubmit}
              className="rounded-[32px] border border-white/20 bg-white p-8 shadow-2xl backdrop-blur-md"
            >
              <h2 className="text-2xl font-black text-[#24302b]">
                Start Investment
              </h2>
              <p className="mt-1 text-xs text-black/50">
                Choose a funding account and enter the amount you want to invest.
              </p>

              <div className="mt-6">
                <label className="text-xs font-bold text-black/70">
                  Funding account
                </label>

                <select
                  value={sourceAccountId}
                  onChange={(event) => setSourceAccountId(event.target.value)}
                  className="mt-2 h-[56px] w-full rounded-[16px] border border-black/10 bg-white px-5 text-sm font-semibold outline-none focus:border-[#1D4ED8]"
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {formatAccount(account)}
                    </option>
                  ))}
                </select>

                {accounts.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    You do not have an active {product.currency} account available for this investment.
                  </p>
                )}
              </div>

              {selectedAccount && (
                <div className="mt-4 rounded-[16px] bg-[#F5F8F7] p-4 border border-black/5">
                  <DetailRowDesktop
                    label="Available Balance"
                    value={formatMoney(selectedAccount.balance, selectedAccount.currency)}
                  />
                  <div className="mt-2">
                    <DetailRowDesktop
                      label="Account Number"
                      value={`•••• ${selectedAccount.account_number.slice(-4)}`}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="text-xs font-bold text-black/70">
                  Investment amount
                </label>

                <div className="mt-2 flex h-[56px] overflow-hidden rounded-[16px] border border-black/10 focus-within:border-[#1D4ED8]">
                  <div className="grid min-w-[80px] place-items-center border-r border-black/15 bg-gray-50 text-xs font-black text-[#24302b]">
                    {product.currency}
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="min-w-0 flex-1 px-5 text-lg font-black outline-none placeholder:text-black/20"
                  />
                </div>
              </div>

              <section className="mt-6 rounded-[20px] bg-[#F2FBF6] p-6 border border-[#16884b]/15">
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={18} className="text-[#16884b]" />
                  <p className="text-xs font-black text-[#16884b]">
                    Investment Projection Summary
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <ProjectionRowDesktop
                    label="Principal Amount"
                    value={formatMoney(numericAmount, product.currency)}
                  />

                  <ProjectionRowDesktop
                    label="Expected Return"
                    value={formatMoney(expectedReturn, product.currency)}
                    success
                  />

                  <ProjectionRowDesktop
                    label="Maturity Amount"
                    value={formatMoney(maturityAmount, product.currency)}
                    success
                  />

                  <ProjectionRowDesktop
                    label="Estimated Maturity Date"
                    value={maturityDate ? formatDate(maturityDate) : "—"}
                  />
                </div>

                <p className="mt-5 text-[11px] leading-relaxed text-black/50">
                  Returns shown are based on the product rate and duration. Final values are confirmed by the backend when the investment is created.
                </p>
              </section>

              <button
                type="submit"
                disabled={submitting || accounts.length === 0}
                className="mt-8 flex h-[56px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#1D4ED8] text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Starting investment...
                  </>
                ) : (
                  <>
                    <WalletCards size={18} />
                    Invest Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
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
    <div className="rounded-[10px] bg-white/65 px-2 py-3">
      <div className="flex items-center gap-1 text-[#16884b]">
        {icon}

        <p className="text-[7px] font-bold uppercase">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-[10px] font-black capitalize">
        {value}
      </p>
    </div>
  );
}

function InfoCardDesktop({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] bg-white/70 p-4 shadow-xs">
      <div className="flex items-center gap-1.5 text-[#16884b]">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-sm font-black capitalize text-[#24302b]">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mt-3 flex items-start justify-between gap-5 first:mt-0">
      <span className="text-[10px] text-black/40">
        {label}
      </span>

      <span className="max-w-[220px] text-right text-[11px] font-bold capitalize">
        {value}
      </span>
    </div>
  );
}

function DetailRowDesktop({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-xs text-black/50 font-medium">
        {label}
      </span>

      <span className="text-xs font-black capitalize text-[#24302b]">
        {value}
      </span>
    </div>
  );
}

function ProjectionRow({
  label,
  value,
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[10px] text-black/45">
        {label}
      </span>

      <span
        className={`text-[11px] font-black ${
          success
            ? "text-[#16884b]"
            : "text-[#333]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ProjectionRowDesktop({
  label,
  value,
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-xs text-black/60 font-medium">
        {label}
      </span>

      <span
        className={`text-sm font-black ${
          success
            ? "text-[#16884b]"
            : "text-[#24302b]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatAccount(
  account:
    ClientAccount,
) {
  return `${account.account_name} — ••••${account.account_number.slice(
    -4,
  )} — ${formatMoney(
    account.balance,
    account.currency,
  )}`;
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

function formatDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(value);
}