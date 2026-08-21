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
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </header>

        {(error || message) && (
          <div
            className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
              error
                ? "bg-red-950/70 text-red-100"
                : "bg-emerald-950/70 text-emerald-100"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-xl md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tenant/10 text-tenant">
              <ArrowLeftRight size={22} />
            </div>

            <div>
              <h2 className="text-lg font-black !text-gray-900">
                Set exchange rate
              </h2>

              <p className="mt-1 text-sm text-gray-500">
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

            <div className="hidden pb-3 text-gray-300 md:block">
              <ArrowLeftRight size={21} />
            </div>

            <CurrencyField
              label="To"
              value={quoteCurrency}
              options={availableQuoteCurrencies}
              onChange={setQuoteCurrency}
            />
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 md:p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Exchange rate
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-base font-bold text-gray-700">
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
                className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-lg font-bold text-gray-900 outline-none focus:border-tenant"
              />

              <span className="text-base font-bold text-gray-700">
                {quoteCurrency}
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Customers will see this rate before confirming a
              cross-currency transfer.
            </p>
          </div>

          <button
  type="button"
  onClick={() => void saveRate()}
  disabled={saving}
  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
>
  <Plus size={17} />

  {saving ? "Saving…" : "Save exchange rate"}
</button>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-xl md:p-7">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Current rates
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              These are the active rates customers can currently
              use.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-44 items-center justify-center text-sm text-gray-400">
              <RefreshCw
                size={18}
                className="mr-2 animate-spin"
              />
              Loading rates…
            </div>
          ) : rates.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center">
              <ArrowLeftRight
                size={28}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-bold text-gray-700">
                No exchange rates yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
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
    <label>
      <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 outline-none focus:border-tenant"
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
    <article className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-tenant shadow-sm">
            <ArrowLeftRight
              size={18}
            />
          </div>

          <div>
            <p className="font-black text-gray-900">
              {rate.base_currency}
              {" → "}
              {rate.quote_currency}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Updated{" "}
              {new Date(
                rate.effective_at,
              ).toLocaleString()}
            </p>
          </div>
        </div>

        {!editing ? (
          <div className="flex flex-col gap-3 sm:items-end">
            <p className="text-lg font-black text-gray-900">
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
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700"
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void remove()
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-600"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full sm:max-w-[320px]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600">
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
                className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 font-bold outline-none focus:border-tenant"
              />

              <span className="text-sm font-bold text-gray-600">
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
                className="h-9 rounded-lg bg-gray-100 px-3 text-xs font-bold text-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void save()
                }
                className="h-9 rounded-lg bg-tenant px-4 text-xs font-bold text-white disabled:opacity-50"
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
        <p className="mt-3 text-xs text-red-600">
          {error}
        </p>
      )}
    </article>
  );
}