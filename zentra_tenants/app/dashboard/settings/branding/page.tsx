"use client";

import {
  ChevronLeft,
  ImageIcon,
  Loader2,
  Palette,
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
  appName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
};

const emptyForm: FormState = {
  appName: "",
  logoUrl: "",
  primaryColor: "#DC2626",
  secondaryColor: "#111827",
};

export default function BrandingSettingsPage() {
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
        appName:
          currentTenant.app_name || "",
        logoUrl:
          currentTenant.logo_url || "",
        primaryColor:
          currentTenant.primary_color ||
          "#DC2626",
        secondaryColor:
          currentTenant.secondary_color ||
          "#111827",
      });
    } catch (err) {
      console.error(
        "Unable to load branding settings:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load branding settings.",
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
          appName: form.appName.trim(),

          logoUrl:
            form.logoUrl.trim() ||
            null,

          primaryColor:
            form.primaryColor,

          secondaryColor:
            form.secondaryColor ||
            null,
        });

      setTenant(updatedTenant);

      setForm({
        appName:
          updatedTenant.app_name || "",
        logoUrl:
          updatedTenant.logo_url || "",
        primaryColor:
          updatedTenant.primary_color ||
          "#DC2626",
        secondaryColor:
          updatedTenant.secondary_color ||
          "#111827",
      });

      document.documentElement.style.setProperty(
        "--tenant-primary",
        updatedTenant.primary_color ||
          "#DC2626",
      );

      document.title =
        updatedTenant.app_name ||
        updatedTenant.name;

      setSuccess(
        "Branding updated successfully.",
      );
    } catch (err) {
      console.error(
        "Unable to update branding:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update branding.",
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
              Branding
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Manage the name, logo and colours
              customers see across your banking
              experience.
            </p>
          </div>

          {loading ? (
            <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading branding...
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
                      <Palette size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold">
                        Brand identity
                      </h2>

                      <p className="mt-1 text-sm text-white/50">
                        Configure the tenant-facing
                        brand.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-5 md:p-6">
                  <div>
                    <label
                      htmlFor="app-name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      App name
                    </label>

                    <input
                      id="app-name"
                      value={form.appName}
                      onChange={(event) =>
                        updateField(
                          "appName",
                          event.target.value,
                        )
                      }
                      required
                      placeholder="Your banking app name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                    />

                    <p className="mt-2 text-xs leading-5 text-white/40">
                      This can be different from the
                      registered organisation name.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="logo-url"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Logo URL
                    </label>

                    <div className="relative">
                      <ImageIcon
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                      />

                      <input
                        id="logo-url"
                        type="url"
                        value={form.logoUrl}
                        onChange={(event) =>
                          updateField(
                            "logoUrl",
                            event.target.value,
                          )
                        }
                        placeholder="https://..."
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <ColorField
                      id="primary-color"
                      label="Primary colour"
                      value={form.primaryColor}
                      onChange={(value) =>
                        updateField(
                          "primaryColor",
                          value,
                        )
                      }
                    />

                    <ColorField
                      id="secondary-color"
                      label="Secondary colour"
                      value={form.secondaryColor}
                      onChange={(value) =>
                        updateField(
                          "secondaryColor",
                          value,
                        )
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <h2 className="font-bold">
                  Preview
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Quick preview of the tenant brand.
                </p>

                <div
                  className="mt-5 overflow-hidden rounded-2xl border border-white/10"
                  style={{
                    backgroundColor:
                      form.secondaryColor ||
                      "#111827",
                  }}
                >
                  <div className="flex min-h-52 flex-col justify-between p-6">
                    <div className="flex items-center gap-3">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="Tenant logo preview"
                          className="h-11 w-11 rounded-xl bg-white object-contain p-1"
                        />
                      ) : (
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black text-white"
                          style={{
                            backgroundColor:
                              form.primaryColor,
                          }}
                        >
                          {form.appName
                            .trim()
                            .charAt(0)
                            .toUpperCase() || "Z"}
                        </div>
                      )}

                      <p className="text-lg font-black text-white">
                        {form.appName ||
                          tenant?.name ||
                          "Your Bank"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-white/55">
                        Welcome back
                      </p>

                      <p className="mt-1 text-2xl font-black text-white">
                        Your finances, your way.
                      </p>

                      <button
                        type="button"
                        className="mt-5 rounded-xl px-5 py-3 text-sm font-bold text-white"
                        style={{
                          backgroundColor:
                            form.primaryColor,
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !form.appName.trim()
                  }
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

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>

      <div className="flex gap-3">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-12 w-14 cursor-pointer rounded-xl border border-white/10 bg-black/30 p-1"
        />

        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="#000000"
          maxLength={7}
          className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 font-mono text-sm uppercase text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
        />
      </div>
    </div>
  );
}