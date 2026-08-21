"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  RefreshCw,
  Plus,
  ArrowLeftRight,
  Percent,
  Database,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";

import {
  fxService,
  type FxRate,
  type FxRateSource,
  type FxSpreadRule,
} from "@/services/fx.service";

import { getApiErrorMessage } from "@/lib/api";

export default function FxManagementPage() {
  const [rateSources, setRateSources] =
    useState<FxRateSource[]>([]);

  const [rates, setRates] =
    useState<FxRate[]>([]);

  const [spreadRules, setSpreadRules] =
    useState<FxSpreadRule[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    showRateSourceForm,
    setShowRateSourceForm,
  ] = useState(false);

  const [
    showRateForm,
    setShowRateForm,
  ] = useState(false);

  const [
    showSpreadForm,
    setShowSpreadForm,
  ] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        sourceItems,
        rateItems,
        spreadItems,
      ] = await Promise.all([
        fxService.listRateSources(),
        fxService.listRates(),
        fxService.listSpreadRules(),
      ]);

      setRateSources(sourceItems);
      setRates(rateItems);
      setSpreadRules(spreadItems);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeRates =
    useMemo(
      () =>
        rates.filter(
          (rate) =>
            rate.status ===
              "active" ||
            !rate.status,
        ),
      [rates],
    );

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl pb-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Treasury
            </p>

            <h1 className="mt-1 text-3xl font-black text-white">
              FX Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Configure exchange-rate sources,
              publish currency rates, and define
              the spreads applied to customer
              FX transfers.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </header>

        {(error || message) && (
          <div
            className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
              error
                ? "bg-red-950/70 text-red-100"
                : "bg-emerald-950/60 text-emerald-100"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            icon={
              <Database size={22} />
            }
            label="Rate sources"
            value={
              rateSources.length
            }
          />

          <SummaryCard
            icon={
              <ArrowLeftRight
                size={22}
              />
            }
            label="Active rates"
            value={
              activeRates.length
            }
          />

          <SummaryCard
            icon={
              <Percent size={22} />
            }
            label="Spread rules"
            value={
              spreadRules.length
            }
          />
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white p-5 shadow-xl md:p-7">
          <SectionHeader
            title="Rate sources"
            description="Sources used to publish FX market rates."
            buttonLabel="Add source"
            onClick={() =>
              setShowRateSourceForm(
                (value) =>
                  !value,
              )
            }
          />

          {showRateSourceForm && (
            <RateSourceForm
              onCreated={async () => {
                setMessage(
                  "FX rate source created.",
                );

                setShowRateSourceForm(
                  false,
                );

                await load();
              }}
            />
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-3 py-3">
                    Source
                  </th>

                  <th className="px-3 py-3">
                    Type
                  </th>

                  <th className="px-3 py-3">
                    Priority
                  </th>

                  <th className="px-3 py-3">
                    Scope
                  </th>

                  <th className="px-3 py-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {rateSources.map(
                  (source) => (
                    <tr
                      key={
                        source.id
                      }
                      className="border-b border-gray-100"
                    >
                      <td className="px-3 py-4">
                        <p className="font-bold text-gray-900">
                          {
                            source.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            source.code
                          }
                        </p>
                      </td>

                      <td className="px-3 py-4 capitalize text-gray-600">
                        {source.provider_type.replaceAll(
                          "_",
                          " ",
                        )}
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {
                          source.priority
                        }
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {source.tenant_id
                          ? "Tenant"
                          : "Global"}
                      </td>

                      <td className="px-3 py-4">
                        <StatusPill
                          status={
                            source.status
                          }
                        />
                      </td>
                    </tr>
                  ),
                )}

                {!loading &&
                  rateSources.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        className="px-3 py-10 text-center text-gray-400"
                      >
                        No FX rate
                        sources
                        configured.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white p-5 shadow-xl md:p-7">
          <SectionHeader
            title="Exchange rates"
            description="Publish bid, ask and mid rates for currency pairs."
            buttonLabel="Add rate"
            onClick={() =>
              setShowRateForm(
                (value) =>
                  !value,
              )
            }
          />

          {showRateForm && (
            <RateForm
              rateSources={
                rateSources
              }
              onCreated={async () => {
                setMessage(
                  "FX rate published.",
                );

                setShowRateForm(
                  false,
                );

                await load();
              }}
            />
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-3 py-3">
                    Pair
                  </th>

                  <th className="px-3 py-3">
                    Source
                  </th>

                  <th className="px-3 py-3">
                    Bid
                  </th>

                  <th className="px-3 py-3">
                    Ask
                  </th>

                  <th className="px-3 py-3">
                    Mid
                  </th>

                  <th className="px-3 py-3">
                    Effective
                  </th>

                  <th className="px-3 py-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {rates.map(
                  (rate) => (
                    <tr
                      key={
                        rate.id
                      }
                      className="border-b border-gray-100"
                    >
                      <td className="px-3 py-4 font-black text-gray-900">
                        {
                          rate.base_currency
                        }
                        /
                        {
                          rate.quote_currency
                        }
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {
                          rate.rate_source_name ||
                          rate.rate_source_id
                        }
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {Number(
                          rate.bid_rate,
                        ).toFixed(
                          6,
                        )}
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {Number(
                          rate.ask_rate,
                        ).toFixed(
                          6,
                        )}
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {Number(
                          rate.mid_rate,
                        ).toFixed(
                          6,
                        )}
                      </td>

                      <td className="px-3 py-4 text-xs text-gray-500">
                        {new Date(
                          rate.effective_at,
                        ).toLocaleString()}
                      </td>

                      <td className="px-3 py-4">
                        <StatusPill
                          status={
                            rate.status ||
                            "active"
                          }
                        />
                      </td>
                    </tr>
                  ),
                )}

                {!loading &&
                  rates.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          7
                        }
                        className="px-3 py-10 text-center text-gray-400"
                      >
                        No exchange
                        rates
                        published.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white p-5 shadow-xl md:p-7">
          <SectionHeader
            title="Spread rules"
            description="Control the tenant margin or fee applied to customer FX quotes."
            buttonLabel="Add spread"
            onClick={() =>
              setShowSpreadForm(
                (value) =>
                  !value,
              )
            }
          />

          {showSpreadForm && (
            <SpreadRuleForm
              onCreated={async () => {
                setMessage(
                  "FX spread rule created.",
                );

                setShowSpreadForm(
                  false,
                );

                await load();
              }}
            />
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-3 py-3">
                    Rule
                  </th>

                  <th className="px-3 py-3">
                    Pair
                  </th>

                  <th className="px-3 py-3">
                    Transaction
                  </th>

                  <th className="px-3 py-3">
                    Spread
                  </th>

                  <th className="px-3 py-3">
                    Priority
                  </th>

                  <th className="px-3 py-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {spreadRules.map(
                  (rule) => (
                    <tr
                      key={
                        rule.id
                      }
                      className="border-b border-gray-100"
                    >
                      <td className="px-3 py-4">
                        <p className="font-bold text-gray-900">
                          {
                            rule.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            rule.code
                          }
                        </p>
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {rule.base_currency ||
                          "*"}
                        /
                        {rule.quote_currency ||
                          "*"}
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {rule.transaction_type ||
                          "All"}
                      </td>

                      <td className="px-3 py-4 font-semibold text-gray-700">
                        {
                          rule.spread_value
                        }{" "}
                        {rule.spread_type ===
                        "basis_points"
                          ? "bps"
                          : rule.spread_type ===
                              "percentage"
                            ? "%"
                            : "fixed"}
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {
                          rule.priority
                        }
                      </td>

                      <td className="px-3 py-4">
                        <StatusPill
                          status={
                            rule.status
                          }
                        />
                      </td>
                    </tr>
                  ),
                )}

                {!loading &&
                  spreadRules.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          6
                        }
                        className="px-3 py-10 text-center text-gray-400"
                      >
                        No spread
                        rules
                        configured.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white p-5 shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tenant/10 text-tenant">
        {icon}
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-gray-900">
        {value}
      </p>
    </article>
  );
}

function SectionHeader({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-black text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-tenant px-4 text-sm font-bold text-white"
      >
        <Plus size={16} />
        {buttonLabel}
      </button>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: string;
}) {
  const active =
    status === "active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-green-100 text-green-700"
          : status === "draft"
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function RateSourceForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [code, setCode] =
    useState("ZENTRA_MANUAL");

  const [name, setName] =
    useState("Zentra Manual FX");

  const [
    providerType,
    setProviderType,
  ] =
    useState<
      | "manual"
      | "api"
      | "central_bank"
      | "market_data"
      | "internal"
    >("manual");

  const [priority, setPriority] =
    useState("10");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const submit = async () => {
    setBusy(true);
    setError("");

    try {
      await fxService.createRateSource({
        code,
        name,
        providerType,
        priority:
          Number(priority),
        status: "active",
        global: false,
      });

      await onCreated();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-gray-50 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Code"
          value={code}
          onChange={setCode}
        />

        <Field
          label="Name"
          value={name}
          onChange={setName}
        />

        <label>
          <span className="text-xs font-bold text-gray-500">
            Provider type
          </span>

          <select
            value={
              providerType
            }
            onChange={(
              event,
            ) =>
              setProviderType(
                event.target
                  .value as typeof providerType,
              )
            }
            className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
          >
            <option value="manual">
              Manual
            </option>

            <option value="api">
              API
            </option>

            <option value="central_bank">
              Central bank
            </option>

            <option value="market_data">
              Market data
            </option>

            <option value="internal">
              Internal
            </option>
          </select>
        </label>

        <Field
          label="Priority"
          value={priority}
          onChange={setPriority}
          inputMode="numeric"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          void submit()
        }
        disabled={busy}
        className="mt-4 h-11 rounded-xl bg-tenant px-5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy
          ? "Creating…"
          : "Create source"}
      </button>
    </div>
  );
}

function RateForm({
  rateSources,
  onCreated,
}: {
  rateSources: FxRateSource[];
  onCreated: () => Promise<void>;
}) {
  const activeSources =
    rateSources.filter(
      (source) =>
        source.status ===
        "active",
    );

  const [
    rateSourceId,
    setRateSourceId,
  ] = useState("");

  const [
    baseCurrency,
    setBaseCurrency,
  ] = useState("GBP");

  const [
    quoteCurrency,
    setQuoteCurrency,
  ] = useState("USD");

  const [bidRate, setBidRate] =
    useState("");

  const [askRate, setAskRate] =
    useState("");

  const [midRate, setMidRate] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (
      !rateSourceId &&
      activeSources[0]
    ) {
      setRateSourceId(
        activeSources[0].id,
      );
    }
  }, [
    activeSources,
    rateSourceId,
  ]);

  const submit = async () => {
    const bid =
      Number(bidRate);

    const ask =
      Number(askRate);

    const mid =
      Number(midRate);

    if (
      !rateSourceId
    ) {
      setError(
        "Create an active rate source first.",
      );
      return;
    }

    if (
      !Number.isFinite(
        bid,
      ) ||
      !Number.isFinite(
        ask,
      ) ||
      !Number.isFinite(
        mid,
      ) ||
      bid <= 0 ||
      ask <= 0 ||
      mid <= 0
    ) {
      setError(
        "Enter valid positive rates.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await fxService.createRate({
        rateSourceId,

        baseCurrency:
          baseCurrency
            .trim()
            .toUpperCase(),

        quoteCurrency:
          quoteCurrency
            .trim()
            .toUpperCase(),

        bidRate:
          bid,

        askRate:
          ask,

        midRate:
          mid,

        effectiveAt:
          new Date().toISOString(),

        global:
          false,
      });

      await onCreated();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-gray-50 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="md:col-span-3">
          <span className="text-xs font-bold text-gray-500">
            Rate source
          </span>

          <select
            value={
              rateSourceId
            }
            onChange={(
              event,
            ) =>
              setRateSourceId(
                event.target
                  .value,
              )
            }
            className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">
              Select source
            </option>

            {activeSources.map(
              (source) => (
                <option
                  key={
                    source.id
                  }
                  value={
                    source.id
                  }
                >
                  {
                    source.name
                  }
                </option>
              ),
            )}
          </select>
        </label>

        <Field
          label="Base currency"
          value={
            baseCurrency
          }
          onChange={
            setBaseCurrency
          }
        />

        <Field
          label="Quote currency"
          value={
            quoteCurrency
          }
          onChange={
            setQuoteCurrency
          }
        />

        <div />

        <Field
          label="Bid rate"
          value={bidRate}
          onChange={setBidRate}
          inputMode="decimal"
        />

        <Field
          label="Ask rate"
          value={askRate}
          onChange={setAskRate}
          inputMode="decimal"
        />

        <Field
          label="Mid rate"
          value={midRate}
          onChange={setMidRate}
          inputMode="decimal"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          void submit()
        }
        disabled={busy}
        className="mt-4 h-11 rounded-xl bg-tenant px-5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy
          ? "Publishing…"
          : "Publish rate"}
      </button>
    </div>
  );
}

function SpreadRuleForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [code, setCode] =
    useState(
      "GBP_USD_TRANSFER",
    );

  const [name, setName] =
    useState(
      "GBP USD Transfer Spread",
    );

  const [
    baseCurrency,
    setBaseCurrency,
  ] = useState("GBP");

  const [
    quoteCurrency,
    setQuoteCurrency,
  ] = useState("USD");

  const [
    spreadType,
    setSpreadType,
  ] =
    useState<
      | "basis_points"
      | "percentage"
      | "fixed"
    >("basis_points");

  const [
    spreadValue,
    setSpreadValue,
  ] = useState("50");

  const [priority, setPriority] =
    useState("10");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const submit = async () => {
    const value =
      Number(
        spreadValue,
      );

    if (
      !Number.isFinite(
        value,
      ) ||
      value < 0
    ) {
      setError(
        "Enter a valid spread value.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await fxService.createSpreadRule(
        {
          code,
          name,

          baseCurrency:
            baseCurrency
              .trim()
              .toUpperCase(),

          quoteCurrency:
            quoteCurrency
              .trim()
              .toUpperCase(),

          transactionType:
            "account_transfer",

          spreadType,

          spreadValue:
            value,

          priority:
            Number(
              priority,
            ),

          status:
            "active",
        },
      );

      await onCreated();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-gray-50 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Code"
          value={code}
          onChange={setCode}
        />

        <Field
          label="Name"
          value={name}
          onChange={setName}
        />

        <Field
          label="Base currency"
          value={
            baseCurrency
          }
          onChange={
            setBaseCurrency
          }
        />

        <Field
          label="Quote currency"
          value={
            quoteCurrency
          }
          onChange={
            setQuoteCurrency
          }
        />

        <label>
          <span className="text-xs font-bold text-gray-500">
            Spread type
          </span>

          <select
            value={
              spreadType
            }
            onChange={(
              event,
            ) =>
              setSpreadType(
                event.target
                  .value as typeof spreadType,
              )
            }
            className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
          >
            <option value="basis_points">
              Basis points
            </option>

            <option value="percentage">
              Percentage
            </option>

            <option value="fixed">
              Fixed fee
            </option>
          </select>
        </label>

        <Field
          label={
            spreadType ===
            "basis_points"
              ? "Spread (bps)"
              : spreadType ===
                  "percentage"
                ? "Spread (%)"
                : "Fixed fee"
          }
          value={
            spreadValue
          }
          onChange={
            setSpreadValue
          }
          inputMode="decimal"
        />

        <Field
          label="Priority"
          value={priority}
          onChange={setPriority}
          inputMode="numeric"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          void submit()
        }
        disabled={busy}
        className="mt-4 h-11 rounded-xl bg-tenant px-5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy
          ? "Creating…"
          : "Create spread rule"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) =>
      void;
  inputMode?:
    | "text"
    | "numeric"
    | "decimal";
}) {
  return (
    <label>
      <span className="text-xs font-bold text-gray-500">
        {label}
      </span>

      <input
        value={value}
        inputMode={
          inputMode
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-tenant"
      />
    </label>
  );
}