"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeftRight,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/api";

import {
  fxService,
  type SimpleFxRate,
} from "@/services/fx.service";

const CURRENCIES = [
  "GBP",
  "USD",
  "EUR",
  "NGN",
  "CAD",
  "AUD",
  "CHF",
  "JPY",
];

export default function FxManagementPage() {
  const [rates, setRates] = useState<SimpleFxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [baseCurrency, setBaseCurrency] = useState("GBP");
  const [quoteCurrency, setQuoteCurrency] = useState("USD");
  const [rate, setRate] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fxService.listSimpleRates();
      setRates(result);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load FX rates.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRates();
  }, [loadRates]);

  const availableQuoteCurrencies = useMemo(
    () =>
      CURRENCIES.filter(
        (currency) => currency !== baseCurrency,
      ),
    [baseCurrency],
  );

  useEffect(() => {
    if (baseCurrency === quoteCurrency) {
      setQuoteCurrency(
        availableQuoteCurrencies[0] || "USD",
      );
    }
  }, [
    baseCurrency,
    quoteCurrency,
    availableQuoteCurrencies,
  ]);

  const saveRate = async () => {
    const numericRate = Number(rate);

    setError("");
    setMessage("");

    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      setError("Enter a valid exchange rate.");
      return;
    }

    if (baseCurrency === quoteCurrency) {
      setError(
        "The two currencies must be different.",
      );
      return;
    }

    setSaving(true);

    try {
      await fxService.saveSimpleRate({
        baseCurrency,
        quoteCurrency,
        rate: numericRate,
      });

      setRate("");

      setMessage(
        `${baseCurrency}/${quoteCurrency} exchange rate saved.`,
      );

      await loadRates();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to save FX rate.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-80px)] overflow-x-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.13),transparent_16%)] bg-black px-4 py-8 text-white md:px-8">
        <div className="mx-auto w-full max-w-5xl pb-12">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                Banking settings
              </p>

              <h1 className="mt-1 text-3xl font-black text-white">
                FX Rates
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-white/65">
                Set the exchange rates customers use when
                transferring between accounts in different
                currencies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadRates()}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin text-white" : ""}
              />

              Refresh
            </button>
          </header>

          {(error || message) && (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${
                error
                  ? "border-red-500/30 bg-red-950/70 text-red-100"
                  : "border-emerald-500/30 bg-emerald-950/70 text-emerald-100"
              }`}
            >
              {error || message}
            </div>
          )}

          <section className="mt-8 rounded-3xl border border-white/10 bg-white p-6 shadow-xl md:p-8 text-neutral-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                <ArrowLeftRight size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Set exchange rate
                </h2>

                <p className="mt-0.5 text-sm text-neutral-500">
                  Choose two currencies and enter the conversion
                  rate.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
              <CurrencyField
                label="From"
                value={baseCurrency}
                options={CURRENCIES}
                onChange={setBaseCurrency}
              />

              <div className="hidden pb-3 text-neutral-300 md:block">
                <ArrowLeftRight size={21} />
              </div>

              <CurrencyField
                label="To"
                value={quoteCurrency}
                options={availableQuoteCurrencies}
                onChange={setQuoteCurrency}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 md:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Exchange rate
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-base font-bold text-neutral-700">
                  1 {baseCurrency} =
                </span>

                <input
                  value={rate}
                  inputMode="decimal"
                  onChange={(event) =>
                    setRate(
                      event.target.value.replace(
                        /[^0-9.]/g,
                        "",
                      ),
                    )
                  }
                  placeholder="1.35"
                  className="h-12 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-lg font-bold text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
                />

                <span className="text-base font-bold text-neutral-700">
                  {quoteCurrency}
                </span>
              </div>

              <p className="mt-3 text-xs text-neutral-400">
                Customers will see this rate before confirming a
                cross-currency transfer.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void saveRate()}
              disabled={saving}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
            >
              <Plus size={17} />

              {saving ? "Saving…" : "Save exchange rate"}
            </button>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white p-6 shadow-xl md:p-8 text-neutral-900">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Current rates
              </h2>

              <p className="mt-0.5 text-sm text-neutral-500">
                These are the active rates customers can currently
                use.
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-44 items-center justify-center text-sm text-neutral-500">
                <RefreshCw
                  size={18}
                  className="mr-2 animate-spin text-blue-600"
                />
                Loading rates…
              </div>
            ) : rates.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/30 px-4 py-12 text-center">
                <ArrowLeftRight
                  size={28}
                  className="mx-auto text-neutral-300"
                />

                <p className="mt-3 font-semibold text-neutral-800">
                  No exchange rates yet
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Add your first currency pair above.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {rates.map((item) => (
                  <RateRow
                    key={item.id}
                    rate={item}
                    onUpdated={loadRates}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function CurrencyField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
      >
        {options.map((currency) => (
          <option
            key={currency}
            value={currency}
          >
            {currency}
          </option>
        ))}
      </select>
    </label>
  );
}

function RateRow({
  rate,
  onUpdated,
}: {
  rate: SimpleFxRate;
  onUpdated: () => Promise<void>;
}) {
  const [editing, setEditing] =
    useState(false);

  const [value, setValue] =
    useState(
      String(rate.rate),
    );

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const save = async () => {
    const numericRate =
      Number(value);

    if (
      !Number.isFinite(
        numericRate,
      ) ||
      numericRate <= 0
    ) {
      setError(
        "Enter a valid rate.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await fxService.updateSimpleRate(
        rate.id,
        numericRate,
      );

      setEditing(false);

      await onUpdated();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to update rate.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const confirmed =
      window.confirm(
        `Delete ${rate.base_currency}/${rate.quote_currency} rate?`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await fxService.deleteSimpleRate(
        rate.id,
      );

      await onUpdated();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to delete rate.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 transition hover:bg-neutral-50 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-xs">
            <ArrowLeftRight
              size={18}
            />
          </div>

          <div>
            <p className="font-bold text-neutral-900">
              {rate.base_currency}
              {" → "}
              {rate.quote_currency}
            </p>

            <p className="mt-0.5 text-xs text-neutral-500">
              Updated{" "}
              {new Date(
                rate.effective_at,
              ).toLocaleString()}
            </p>
          </div>
        </div>

        {!editing ? (
          <div className="flex flex-col gap-3 sm:items-end">
            <p className="text-lg font-extrabold text-neutral-900">
              1{" "}
              {rate.base_currency}
              {" = "}
              {Number(
                rate.rate,
              ).toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 8,
                },
              )}{" "}
              {rate.quote_currency}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setEditing(true)
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50"
              >
                <Pencil size={14} className="text-neutral-500" />
                Edit
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void remove()
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-100"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full sm:max-w-[320px]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-600">
                1{" "}
                {rate.base_currency}
                {" = "}
              </span>

              <input
                value={value}
                inputMode="decimal"
                onChange={(event) =>
                  setValue(
                    event.target.value.replace(
                      /[^0-9.]/g,
                      "",
                    ),
                  )
                }
                className="h-10 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 font-bold text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
              />

              <span className="text-sm font-semibold text-neutral-600">
                {rate.quote_currency}
              </span>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setValue(
                    String(
                      rate.rate,
                    ),
                  );

                  setError("");
                  setEditing(false);
                }}
                className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void save()
                }
                className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
              >
                {busy
                  ? "Saving…"
                  : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </article>
  );
}