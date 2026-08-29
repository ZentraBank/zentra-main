"use client";

import {
  ChevronLeft,
  Clock3,
  Coins,
  Globe2,
  Loader2,
  Save,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import AppShell from "@/components/layout/AppShell";
import {
  getCurrentTenant,
  updateCurrentTenant,
} from "@/services/tenant.service";
import type { Tenant } from "@/types/tenant.types";

type FormState = {
  countryCode: string;
  defaultCurrency: string;
  timezone: string;
};

const emptyForm: FormState = {
  countryCode: "GB",
  defaultCurrency: "GBP",
  timezone: "Europe/London",
};

export default function LocalisationSettingsPage() {
  const [tenant, setTenant] =
    useState<Tenant | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadTenant = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentTenant =
        await getCurrentTenant();

      setTenant(currentTenant);

      setForm({
        countryCode:
          currentTenant.country_code ||
          "GB",

        defaultCurrency:
          currentTenant.currency ||
          "GBP",

        timezone:
          currentTenant.timezone ||
          "Europe/London",
      });
    } catch (err) {
      console.error(
        "Unable to load localisation settings:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load localisation settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedTenant =
        await updateCurrentTenant({
          countryCode:
            form.countryCode,

          defaultCurrency:
            form.defaultCurrency,

          timezone:
            form.timezone,
        });

      setTenant(updatedTenant);

      setForm({
        countryCode:
          updatedTenant.country_code ||
          form.countryCode,

        defaultCurrency:
          updatedTenant.currency ||
          form.defaultCurrency,

        timezone:
          updatedTenant.timezone ||
          form.timezone,
      });

      setSuccess(
        "Localisation settings updated successfully.",
      );
    } catch (err) {
      console.error(
        "Unable to update localisation settings:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update localisation settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="min-h-[calc(100svh-80px)] rounded-3xl bg-black px-5 py-6 text-white md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition hover:text-white"
          >
            <ChevronLeft size={17} />
            Settings
          </Link>

          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/45">
              Tenant administration
            </p>

            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              Localisation
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Configure the country,
              currency and timezone used
              across this tenant.
            </p>
          </div>

          {loading ? (
            <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading localisation...
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="border-b border-white/10 p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
                      <Globe2 size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold">
                        Regional settings
                      </h2>

                      <p className="mt-1 text-sm text-white/50">
                        Defaults used throughout
                        the tenant.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-5 md:p-6">
                  <SelectField
                    icon={<Globe2 size={18} />}
                    id="country-code"
                    label="Country"
                    value={form.countryCode}
                    onChange={(value) =>
                      updateField(
                        "countryCode",
                        value,
                      )
                    }
                    options={[
                      {
                        value: "GB",
                        label: "United Kingdom",
                      },
                      {
                        value: "NG",
                        label: "Nigeria",
                      },
                      {
                        value: "US",
                        label: "United States",
                      },
                      {
                        value: "CA",
                        label: "Canada",
                      },
                      {
                        value: "IE",
                        label: "Ireland",
                      },
                      {
                        value: "GH",
                        label: "Ghana",
                      },
                      {
                        value: "ZA",
                        label: "South Africa",
                      },
                    ]}
                  />

                  <SelectField
                    icon={<Coins size={18} />}
                    id="currency"
                    label="Default currency"
                    value={
                      form.defaultCurrency
                    }
                    onChange={(value) =>
                      updateField(
                        "defaultCurrency",
                        value,
                      )
                    }
                    options={[
                      {
                        value: "GBP",
                        label: "GBP — British Pound",
                      },
                      {
                        value: "NGN",
                        label: "NGN — Nigerian Naira",
                      },
                      {
                        value: "USD",
                        label: "USD — US Dollar",
                      },
                      {
                        value: "EUR",
                        label: "EUR — Euro",
                      },
                      {
                        value: "CAD",
                        label: "CAD — Canadian Dollar",
                      },
                      {
                        value: "GHS",
                        label: "GHS — Ghanaian Cedi",
                      },
                      {
                        value: "ZAR",
                        label: "ZAR — South African Rand",
                      },
                    ]}
                  />

                  <SelectField
                    icon={<Clock3 size={18} />}
                    id="timezone"
                    label="Timezone"
                    value={form.timezone}
                    onChange={(value) =>
                      updateField(
                        "timezone",
                        value,
                      )
                    }
                    options={[
                      {
                        value:
                          "Europe/London",
                        label:
                          "Europe/London",
                      },
                      {
                        value:
                          "Africa/Lagos",
                        label:
                          "Africa/Lagos",
                      },
                      {
                        value:
                          "America/New_York",
                        label:
                          "America/New_York",
                      },
                      {
                        value:
                          "America/Toronto",
                        label:
                          "America/Toronto",
                      },
                      {
                        value:
                          "Europe/Dublin",
                        label:
                          "Europe/Dublin",
                      },
                      {
                        value:
                          "Africa/Accra",
                        label:
                          "Africa/Accra",
                      },
                      {
                        value:
                          "Africa/Johannesburg",
                        label:
                          "Africa/Johannesburg",
                      },
                    ]}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <h2 className="font-bold">
                  Current configuration
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <SummaryItem
                    label="Country"
                    value={
                      form.countryCode
                    }
                  />

                  <SummaryItem
                    label="Currency"
                    value={
                      form.defaultCurrency
                    }
                  />

                  <SummaryItem
                    label="Timezone"
                    value={form.timezone}
                  />
                </div>

                {tenant && (
                  <p className="mt-5 text-xs text-white/35">
                    Tenant: {tenant.name}
                  </p>
                )}
              </section>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </AppShell>
  );
}

function SelectField({
  icon,
  id,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
          {icon}
        </div>

        <select
          id={id}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-black/30 pl-11 pr-10 text-sm text-white outline-none transition focus:border-white/30"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-neutral-950 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35">
          ▼
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white/80">
        {value}
      </p>
    </div>
  );
}