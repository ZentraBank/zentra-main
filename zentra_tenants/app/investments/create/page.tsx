"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  investmentService,
} from "@/services/investment.service";

import {
  bankingService,
} from "@/services/banking.service";

import type {
  BankAccount,
} from "@/types/banking.types";

import type {
  TenantInvestment,
  TenantInvestmentProduct,
} from "@/services/investment.service";

type ClientOption = {
  userId: string;

  name: string;

  email:
    | string
    | null;
};

export default function CreateClientInvestmentPage() {
  const [
    products,
    setProducts,
  ] =
    useState<
      TenantInvestmentProduct[]
    >([]);

  const [
    accounts,
    setAccounts,
  ] =
    useState<
      BankAccount[]
    >([]);

  const [
    clientUserId,
    setClientUserId,
  ] = useState("");

  const [
    productId,
    setProductId,
  ] = useState("");

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

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    createdInvestment,
    setCreatedInvestment,
  ] =
    useState<
      TenantInvestment | null
    >(null);

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const load =
      async () => {
        setLoading(true);
        setError("");

        try {
          const [
            productResult,
            accountResult,
          ] =
            await Promise.all([
              investmentService.listProducts({
                page: 1,
                pageSize: 100,
                status: "active",
              }),

              bankingService.getTenantAccounts(),
            ]);

          setProducts(
            productResult,
          );

          setAccounts(
            accountResult,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load investment data.",
          );
        } finally {
          setLoading(false);
        }
      };

    void load();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Derived client list
  |--------------------------------------------------------------------------
  */

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

        /*
         * Ignore accounts where
         * client identity is not
         * available.
         */
        if (
          !account.client_name &&
          !account.client_email
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
          },
        );
      }

      return Array.from(
        map.values(),
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
          ),
      );
    }, [accounts]);

  /*
  |--------------------------------------------------------------------------
  | Selected entities
  |--------------------------------------------------------------------------
  */

  const selectedClient =
    useMemo(
      () =>
        clients.find(
          (client) =>
            client.userId ===
            clientUserId,
        ) ?? null,
      [
        clients,
        clientUserId,
      ],
    );

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (product) =>
            product.id ===
            productId,
        ) ?? null,
      [
        products,
        productId,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Client accounts
  |--------------------------------------------------------------------------
  */

  const clientAccounts =
    useMemo(() => {
      if (!clientUserId) {
        return [];
      }

      return accounts.filter(
        (account) =>
          account.user_id ===
            clientUserId &&
          account.status ===
            "active",
      );
    }, [
      accounts,
      clientUserId,
    ]);

  /*
   * Once a product is selected,
   * only accounts with the same
   * currency can fund it.
   */
  const eligibleAccounts =
    useMemo(() => {
      if (!selectedProduct) {
        return clientAccounts;
      }

      return clientAccounts.filter(
        (account) =>
          account.currency ===
          selectedProduct.currency,
      );
    }, [
      clientAccounts,
      selectedProduct,
    ]);

  const selectedAccount =
    useMemo(
      () =>
        eligibleAccounts.find(
          (account) =>
            account.id ===
            sourceAccountId,
        ) ?? null,
      [
        eligibleAccounts,
        sourceAccountId,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Reset dependent fields
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setSourceAccountId("");
    setAmount("");
    setSuccess("");
    setCreatedInvestment(
      null,
    );
  }, [clientUserId]);

  useEffect(() => {
    setSourceAccountId("");
    setAmount("");
    setSuccess("");
    setCreatedInvestment(
      null,
    );
  }, [productId]);

  /*
  |--------------------------------------------------------------------------
  | Projection
  |--------------------------------------------------------------------------
  */

  const numericAmount =
    Number(amount) || 0;

  const annualRate =
    Number(
      selectedProduct
        ?.annual_rate ??
        0,
    );

  const durationDays =
    Number(
      selectedProduct
        ?.duration_days ??
        0,
    );

  const expectedReturn =
    numericAmount > 0 &&
    annualRate >= 0 &&
    durationDays > 0
      ? numericAmount *
        (annualRate / 100) *
        (durationDays / 365)
      : 0;

  const maturityAmount =
    numericAmount +
    expectedReturn;

  const maturityDate =
    useMemo(() => {
      if (
        !selectedProduct
      ) {
        return null;
      }

      const date =
        new Date();

      date.setDate(
        date.getDate() +
          Number(
            selectedProduct.duration_days,
          ),
      );

      return date;
    }, [selectedProduct]);

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validateForm =
    () => {
      if (!clientUserId) {
        return "Select a client.";
      }

      if (!selectedProduct) {
        return "Select an investment product.";
      }

      if (!selectedAccount) {
        return "Select an eligible client account.";
      }

      if (
        !Number.isFinite(
          numericAmount,
        ) ||
        numericAmount <= 0
      ) {
        return "Enter a valid investment amount.";
      }

      const minimum =
        Number(
          selectedProduct.minimum_amount,
        );

      if (
        numericAmount <
        minimum
      ) {
        return `Minimum investment is ${formatMoney(
          minimum,
          selectedProduct.currency,
        )}.`;
      }

      if (
        selectedProduct.maximum_amount !==
          null &&
        selectedProduct.maximum_amount !==
          undefined &&
        numericAmount >
          Number(
            selectedProduct.maximum_amount,
          )
      ) {
        return `Maximum investment is ${formatMoney(
          selectedProduct.maximum_amount,
          selectedProduct.currency,
        )}.`;
      }

      if (
        numericAmount >
        Number(
          selectedAccount.balance,
        )
      ) {
        return "The selected client account does not have enough available balance.";
      }

      return null;
    };

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError,
        );

        return;
      }

      if (
        !selectedProduct ||
        !selectedAccount
      ) {
        return;
      }

      setSubmitting(true);
      setError("");
      setSuccess("");

      try {
        const result =
          await investmentService.createClientInvestment(
            {
              clientUserId,

              productId:
                selectedProduct.id,

              sourceAccountId:
                selectedAccount.id,

              amount:
                numericAmount,
            },
          );

        setCreatedInvestment(
          result,
        );

        setSuccess(
          "Client investment created successfully.",
        );

        /*
         * Refresh account balances
         * because the investment
         * debit happens immediately.
         */
        const refreshedAccounts =
          await bankingService.getTenantAccounts();

        setAccounts(
          refreshedAccounts,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create client investment.",
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5F7F9]">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-[#2458E8]"
          />

          <p className="mt-3 text-[11px] text-black/40">
            Loading investment
            options...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7F9] px-5 pb-12 pt-8 text-[#282828]">
      <section className="mx-auto w-full max-w-[1100px]">
        {/* Header */}

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/investments"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div>
              <h1 className="text-[24px] font-black tracking-[-0.03em]">
                Create Client
                Investment
              </h1>

              <p className="mt-1 text-[11px] text-black/40">
                Start an
                investment on
                behalf of a
                client.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-green-100 bg-green-50 px-4 py-3 text-[12px] font-medium text-green-700">
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0"
            />

            {success}
          </div>
        )}

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.82fr]">
          {/* Form */}

          <form
            onSubmit={
              handleSubmit
            }
            className="rounded-[22px] bg-white p-5 shadow-sm md:p-7"
          >
            <h2 className="text-[18px] font-black">
              Investment Details
            </h2>

            <p className="mt-1 text-[10px] leading-4 text-black/40">
              Select the client,
              product and funding
              account.
            </p>

            {/* Client */}

            <Field
              label="Client"
            >
              <div className="relative">
                <UserRound
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
                />

                <select
                  value={
                    clientUserId
                  }
                  onChange={(
                    event,
                  ) =>
                    setClientUserId(
                      event.target.value,
                    )
                  }
                  className="h-[52px] w-full appearance-none rounded-[12px] border border-black/10 bg-white pl-11 pr-10 text-[12px] font-semibold outline-none focus:border-[#2458E8]/40"
                >
                  <option value="">
                    Select client
                  </option>

                  {clients.map(
                    (
                      client,
                    ) => (
                      <option
                        key={
                          client.userId
                        }
                        value={
                          client.userId
                        }
                      >
                        {
                          client.name
                        }
                        {client.email
                          ? ` — ${client.email}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
                />
              </div>
            </Field>

            {/* Product */}

            <Field
              label="Investment Product"
            >
              <div className="relative">
                <TrendingUp
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
                />

                <select
                  value={
                    productId
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductId(
                      event.target.value,
                    )
                  }
                  className="h-[52px] w-full appearance-none rounded-[12px] border border-black/10 bg-white pl-11 pr-10 text-[12px] font-semibold outline-none focus:border-[#2458E8]/40"
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map(
                    (
                      product,
                    ) => (
                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {
                          product.name
                        }
                        {" — "}
                        {formatNumber(
                          product.annual_rate,
                        )}
                        %
                        {" — "}
                        {
                          product.currency
                        }
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
                />
              </div>
            </Field>

            {/* Account */}

            <Field
              label="Funding Account"
            >
              <div className="relative">
                <WalletCards
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
                />

                <select
                  value={
                    sourceAccountId
                  }
                  disabled={
                    !clientUserId ||
                    !selectedProduct
                  }
                  onChange={(
                    event,
                  ) =>
                    setSourceAccountId(
                      event.target.value,
                    )
                  }
                  className="h-[52px] w-full appearance-none rounded-[12px] border border-black/10 bg-white pl-11 pr-10 text-[12px] font-semibold outline-none disabled:bg-[#F5F6F7] disabled:text-black/30"
                >
                  <option value="">
                    {!clientUserId
                      ? "Select a client first"
                      : !selectedProduct
                        ? "Select a product first"
                        : "Select client account"}
                  </option>

                  {eligibleAccounts.map(
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

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
                />
              </div>

              {selectedProduct &&
                clientUserId &&
                eligibleAccounts.length ===
                  0 && (
                  <p className="mt-2 text-[10px] font-semibold text-red-600">
                    This client has
                    no active{" "}
                    {
                      selectedProduct.currency
                    }{" "}
                    account that can
                    fund this
                    investment.
                  </p>
                )}
            </Field>

            {/* Account balance */}

            {selectedAccount && (
              <div className="mt-4 rounded-[14px] bg-[#F6F8FA] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-black/30">
                      Available
                      Balance
                    </p>

                    <p className="mt-1 text-[18px] font-black text-[#333]">
                      {formatMoney(
                        selectedAccount.balance,
                        selectedAccount.currency,
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] text-black/30">
                      Account
                    </p>

                    <p className="mt-1 text-[11px] font-bold">
                      ••••{" "}
                      {selectedAccount.account_number.slice(
                        -4,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount */}

            <Field
              label="Investment Amount"
            >
              <div className="flex h-[54px] overflow-hidden rounded-[12px] border border-black/10">
                <div className="grid min-w-[74px] place-items-center border-r border-black/10 bg-[#F8FAFB] text-[11px] font-black">
                  {selectedProduct
                    ?.currency ||
                    "—"}
                </div>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={
                    !selectedProduct
                  }
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
                  className="min-w-0 flex-1 px-4 text-[16px] font-black outline-none placeholder:text-black/20 disabled:bg-[#F5F6F7]"
                />
              </div>

              {selectedProduct && (
                <div className="mt-2 flex items-center justify-between text-[9px] text-black/35">
                  <span>
                    Min:{" "}
                    {formatMoney(
                      selectedProduct.minimum_amount,
                      selectedProduct.currency,
                    )}
                  </span>

                  <span>
                    Max:{" "}
                    {selectedProduct.maximum_amount
                      ? formatMoney(
                          selectedProduct.maximum_amount,
                          selectedProduct.currency,
                        )
                      : "No maximum"}
                  </span>
                </div>
              )}
            </Field>

            <button
              type="submit"
              disabled={
                submitting ||
                !clientUserId ||
                !selectedProduct ||
                !selectedAccount
              }
              className="mt-7 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#2458E8] text-[12px] font-bold text-white shadow-sm transition hover:bg-[#1F4FD1] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Creating
                  Investment...
                </>
              ) : (
                <>
                  <TrendingUp
                    size={16}
                  />

                  Create Investment
                </>
              )}
            </button>
          </form>

          {/* Projection */}

          <section className="h-fit rounded-[22px] bg-[#15261E] p-5 text-white shadow-sm md:p-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
              Investment
              Projection
            </p>

            <h2 className="mt-2 text-[20px] font-black">
              {selectedProduct
                ?.name ||
                "Select a product"}
            </h2>

            {selectedClient && (
              <p className="mt-1 text-[10px] text-white/45">
                For{" "}
                {
                  selectedClient.name
                }
              </p>
            )}

            <div className="mt-7">
              <p className="text-[9px] uppercase tracking-[0.08em] text-white/35">
                Principal
              </p>

              <p className="mt-1 text-[34px] font-black tracking-[-0.04em] text-[#71D49B]">
                {formatMoney(
                  numericAmount,
                  selectedProduct
                    ?.currency ||
                    "USD",
                )}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <ProjectionCard
                icon={
                  <TrendingUp
                    size={15}
                  />
                }
                label="Annual Rate"
                value={
                  selectedProduct
                    ? `${formatNumber(
                        selectedProduct.annual_rate,
                      )}%`
                    : "—"
                }
              />

              <ProjectionCard
                icon={
                  <Clock3
                    size={15}
                  />
                }
                label="Duration"
                value={
                  selectedProduct
                    ? formatDuration(
                        selectedProduct.duration_days,
                      )
                    : "—"
                }
              />

              <ProjectionCard
                icon={
                  <TrendingUp
                    size={15}
                  />
                }
                label="Expected Return"
                value={formatMoney(
                  expectedReturn,
                  selectedProduct
                    ?.currency ||
                    "USD",
                )}
                success
              />

              <ProjectionCard
                icon={
                  <CalendarDays
                    size={15}
                  />
                }
                label="Maturity"
                value={
                  maturityDate
                    ? formatDate(
                        maturityDate,
                      )
                    : "—"
                }
              />
            </div>

            <div className="mt-5 rounded-[16px] border border-white/10 bg-white/5 px-4 py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-white/35">
                Projected Maturity
                Value
              </p>

              <p className="mt-2 text-[29px] font-black tracking-[-0.03em] text-[#71D49B]">
                {formatMoney(
                  maturityAmount,
                  selectedProduct
                    ?.currency ||
                    "USD",
                )}
              </p>

              {numericAmount >
                0 &&
                expectedReturn >
                  0 && (
                  <p className="mt-2 text-[10px] text-[#71D49B]/70">
                    +
                    {formatMoney(
                      expectedReturn,
                      selectedProduct
                        ?.currency ||
                        "USD",
                    )}{" "}
                    projected growth
                  </p>
                )}
            </div>

            {createdInvestment && (
              <div className="mt-5 rounded-[16px] border border-[#71D49B]/20 bg-[#71D49B]/10 px-4 py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#71D49B]"
                  />

                  <div>
                    <p className="text-[11px] font-black text-[#71D49B]">
                      Investment
                      Active
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-white/50">
                      Current value{" "}
                      {formatMoney(
                        createdInvestment.current_value ??
                          createdInvestment.principal,
                        createdInvestment.currency,
                      )}
                    </p>

                    <p className="mt-1 text-[9px] text-white/35">
                      {
                        createdInvestment.days_remaining
                      }{" "}
                      days remaining
                    </p>
                  </div>
                </div>

                <Link
                  href="/investments/client-investments"
                  className="mt-4 flex h-[38px] items-center justify-center rounded-[9px] bg-white/10 text-[10px] font-bold text-white"
                >
                  View Client
                  Investments
                </Link>
              </div>
            )}

            <p className="mt-5 text-[9px] leading-4 text-white/30">
              Projection uses the
              product&apos;s
              current annual rate
              and duration. The
              investment begins
              growing automatically
              once created.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <label className="text-[10px] font-black uppercase tracking-[0.05em] text-black/45">
        {label}
      </label>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

function ProjectionCard({
  icon,
  label,
  value,
  success = false,
}: {
  icon:
    React.ReactNode;

  label: string;

  value: string;

  success?: boolean;
}) {
  return (
    <div className="rounded-[13px] border border-white/10 bg-white/5 px-3 py-4">
      <div className="flex items-center gap-2 text-white/40">
        {icon}

        <p className="text-[8px] font-bold uppercase">
          {label}
        </p>
      </div>

      <p
        className={`mt-2 text-[13px] font-black ${
          success
            ? "text-[#71D49B]"
            : "text-white"
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