"use client";

import {
  Building2,
  ChevronLeft,
  Loader2,
  Mail,
  Phone,
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
  name: string;
  contactEmail: string;
  contactPhone: string;
};

const emptyForm: FormState = {
  name: "",
  contactEmail: "",
  contactPhone: "",
};

export default function OrganisationSettingsPage() {
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
        name:
          currentTenant.name || "",
        contactEmail:
          currentTenant.contact_email ||
          "",
        contactPhone:
          currentTenant.contact_phone ||
          "",
      });
    } catch (err) {
      console.error(
        "Unable to load organisation settings:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load organisation settings.",
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
          name: form.name.trim(),

          contactEmail:
            form.contactEmail.trim() ||
            null,

          contactPhone:
            form.contactPhone.trim() ||
            null,
        });

      setTenant(updatedTenant);

      setForm({
        name:
          updatedTenant.name || "",
        contactEmail:
          updatedTenant.contact_email ||
          "",
        contactPhone:
          updatedTenant.contact_phone ||
          "",
      });

      setSuccess(
        "Organisation details updated successfully.",
      );
    } catch (err) {
      console.error(
        "Unable to update organisation settings:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update organisation settings.",
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
              Organisation
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Manage your organisation name
              and contact information.
            </p>
          </div>

          {loading ? (
            <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading organisation...
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="border-b border-white/10 p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
                      <Building2 size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold">
                        Organisation profile
                      </h2>

                      <p className="mt-1 text-sm text-white/50">
                        Information associated
                        with this tenant.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-5 md:p-6">
                  <div>
                    <label
                      htmlFor="organisation-name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Organisation name
                    </label>

                    <input
                      id="organisation-name"
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value,
                        )
                      }
                      required
                      placeholder="Organisation name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Contact email
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                        />

                        <input
                          id="contact-email"
                          type="email"
                          value={
                            form.contactEmail
                          }
                          onChange={(event) =>
                            updateField(
                              "contactEmail",
                              event.target.value,
                            )
                          }
                          placeholder="contact@example.com"
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Contact phone
                      </label>

                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                        />

                        <input
                          id="contact-phone"
                          type="tel"
                          value={
                            form.contactPhone
                          }
                          onChange={(event) =>
                            updateField(
                              "contactPhone",
                              event.target.value,
                            )
                          }
                          placeholder="+44..."
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {tenant && (
                <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                  <h2 className="font-bold">
                    Tenant information
                  </h2>

                  <p className="mt-1 text-sm text-white/45">
                    These identifiers are managed
                    by the ZentraBank platform.
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <ReadOnlyField
                      label="Tenant slug"
                      value={tenant.slug}
                    />

                    <ReadOnlyField
                      label="Tenant ID"
                      value={tenant.id}
                    />
                  </div>
                </section>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !form.name.trim()
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

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>

      <p className="mt-2 break-all text-sm text-white/70">
        {value}
      </p>
    </div>
  );
}