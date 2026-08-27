"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/api";

import {
  createTenantDomain,
  disconnectTenantDomain,
  getTenantPlatformSettings,
  listTenantDomains,
  provisionTenantDomain,
  refreshTenantDomainStatus,
  verifyTenantDomain,
  type CreateDomainResponse,
  type TenantDomain,
  type TenantPlatformSettings,
} from "@/services/tenant.service";

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const label = status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
      {label}
    </span>
  );
}

function DomainCard({
  domain,
  loadingAction,
  onVerify,
  onProvision,
  onRefresh,
  onDisconnect,
}: {
  domain: TenantDomain;
  loadingAction: string | null;
  onVerify: (domain: TenantDomain) => void;
  onProvision: (domain: TenantDomain) => void;
  onRefresh: (domain: TenantDomain) => void;
  onDisconnect: (domain: TenantDomain) => void;
}) {
  const busy =
    loadingAction?.startsWith(
      domain.id
    ) ?? false;

  const canVerify =
    domain.type === "custom" &&
    domain.status ===
      "verification_pending";

  const canProvision =
    domain.type === "custom" &&
    domain.status === "verified";

  const canRefresh =
    domain.type === "custom" &&
    domain.status ===
      "provisioning";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-all text-lg font-bold">
              {domain.domain}
            </h2>

            <StatusBadge
              status={domain.status}
            />

            {domain.isPrimary ? (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                Primary
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm text-white/50">
            {domain.type ===
            "temporary"
              ? "Temporary ZentraBank onboarding domain"
              : "Custom business domain"}
          </p>

          {domain.sslStatus ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <ShieldCheck
                size={16}
              />

              SSL:{" "}
              <span className="font-semibold text-white">
                {
                  domain.sslStatus
                }
              </span>
            </div>
          ) : null}

          {domain.failureReason ? (
            <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">
              {
                domain.failureReason
              }
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {canVerify ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onVerify(domain)
              }
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
            >
              Verify
            </button>
          ) : null}

          {canProvision ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onProvision(domain)
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Connect
            </button>
          ) : null}

          {canRefresh ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onRefresh(domain)
              }
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold"
            >
              <RefreshCw
                size={16}
              />
              Refresh
            </button>
          ) : null}

          {domain.type ===
          "custom" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onDisconnect(
                  domain
                )
              }
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 disabled:opacity-50"
            >
              <Trash2
                size={16}
              />
              Disconnect
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function TenantDomainsPage() {
  const [domains, setDomains] =
    useState<TenantDomain[]>([]);

  const [
    platformSettings,
    setPlatformSettings,
  ] =
    useState<TenantPlatformSettings>(
      {}
    );

  const [
    domainInput,
    setDomainInput,
  ] = useState("");

  const [
    createdDomain,
    setCreatedDomain,
  ] =
    useState<CreateDomainResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    loadingAction,
    setLoadingAction,
  ] =
    useState<string | null>(
      null
    );

  const [error, setError] =
    useState("");

  const loadDomains =
    useCallback(async () => {
      try {
        const result =
          await listTenantDomains();

        setDomains(result);
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError
          )
        );
      }
    }, []);

  const loadPlatformSettings =
    useCallback(async () => {
      try {
        const result =
          await getTenantPlatformSettings();

        setPlatformSettings(
          result
        );
      } catch (requestError) {
        /*
         * Domain management itself
         * should still work even if
         * optional platform settings
         * fail to load.
         */
        console.error(
          "Unable to load tenant platform settings:",
          requestError
        );
      }
    }, []);

  useEffect(() => {
    let mounted = true;

    const initialise =
      async () => {
        setLoading(true);
        setError("");

        try {
          await Promise.all([
            loadDomains(),
            loadPlatformSettings(),
          ]);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    void initialise();

    return () => {
      mounted = false;
    };
  }, [
    loadDomains,
    loadPlatformSettings,
  ]);

  const temporaryDomain =
    useMemo(
      () =>
        domains.find(
          (domain) =>
            domain.type ===
            "temporary"
        ) ?? null,
      [domains]
    );

  const customDomains =
    useMemo(
      () =>
        domains.filter(
          (domain) =>
            domain.type ===
            "custom"
        ),
      [domains]
    );

  const domainSettings =
  platformSettings[
    "platform.domains"
  ];

const domainPurchaseUrl =
  domainSettings?.purchaseUrl;

const domainPurchaseLabel =
  domainSettings?.purchaseLabel ||
  "Buy a domain";

const domainSupportEmail =
  domainSettings?.supportEmail;

  const refreshDomains =
    async () => {
      setLoading(true);
      setError("");

      try {
        await loadDomains();
      } finally {
        setLoading(false);
      }
    };

  const handleCreate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const value =
      domainInput.trim();

    if (!value) {
      return;
    }

    setSubmitting(true);
    setError("");
    setCreatedDomain(null);

    try {
      const result =
        await createTenantDomain(
          value
        );

      setCreatedDomain(
        result
      );

      setDomainInput("");

      await loadDomains();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (
    domain: TenantDomain
  ) => {
    setLoadingAction(
      `${domain.id}:verify`
    );

    setError("");

    try {
      await verifyTenantDomain(
        domain.id
      );

      await loadDomains();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError
        )
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleProvision =
    async (
      domain: TenantDomain
    ) => {
      setLoadingAction(
        `${domain.id}:provision`
      );

      setError("");

      try {
        await provisionTenantDomain(
          domain.id
        );

        await loadDomains();
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setLoadingAction(
          null
        );
      }
    };

  const handleRefresh = async (
    domain: TenantDomain
  ) => {
    setLoadingAction(
      `${domain.id}:refresh`
    );

    setError("");

    try {
      await refreshTenantDomainStatus(
        domain.id
      );

      await loadDomains();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError
        )
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDisconnect =
    async (
      domain: TenantDomain
    ) => {
      const confirmed =
        window.confirm(
          `Disconnect ${domain.domain}? Your temporary ZentraBank domain will become the fallback address.`
        );

      if (!confirmed) {
        return;
      }

      setLoadingAction(
        `${domain.id}:disconnect`
      );

      setError("");

      try {
        await disconnectTenantDomain(
          domain.id
        );

        setCreatedDomain(
          null
        );

        await loadDomains();
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setLoadingAction(
          null
        );
      }
    };

  const copyText = async (
    value: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        value
      );
    } catch {
      setError(
        "Unable to copy to the clipboard."
      );
    }
  };

  return (
    <AppShell>
      <main className="min-h-[calc(100svh-80px)] rounded-3xl bg-black px-5 py-6 text-white md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
                Tenant settings
              </p>

              <h1 className="mt-2 text-3xl font-black md:text-5xl">
                Domains
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
                Connect your
                business domain.
                ZentraBank manages
                ownership
                verification,
                routing and SSL
                provisioning.
              </p>
            </div>

            {domainPurchaseUrl ? (
              <a
                href={
                  domainPurchaseUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
              >
                {
                  domainPurchaseLabel
                }

                <ExternalLink
                  size={16}
                />
              </a>
            ) : null}
          </div>

          {error ? (
            <div className="mt-6 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              <TriangleAlert
                className="mt-0.5 shrink-0"
                size={18}
              />

              <p>{error}</p>
            </div>
          ) : null}

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                <Globe2
                  size={22}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Temporary
                  address
                </h2>

                {loading ? (
                  <p className="mt-2 text-sm text-white/50">
                    Loading…
                  </p>
                ) : temporaryDomain ? (
                  <>
                    <p className="mt-2 break-all text-sm text-white/70">
                      {
                        temporaryDomain.domain
                      }
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/40">
                      This is your
                      onboarding and
                      fallback address.
                      Once your custom
                      domain is active,
                      customers should
                      use your business
                      domain.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-amber-300">
                    No temporary
                    domain was found.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold">
              Connect a custom
              domain
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              Enter the address
              customers should use,
              for example{" "}
              <span className="font-semibold text-white">
                bank.example.com
              </span>
              .
            </p>

            <form
              onSubmit={
                handleCreate
              }
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={
                  domainInput
                }
                onChange={(
                  event
                ) =>
                  setDomainInput(
                    event.target
                      .value
                  )
                }
                placeholder="bank.example.com"
                required
                disabled={
                  submitting
                }
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black px-4 text-sm outline-none focus:border-white/30 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="h-12 rounded-xl bg-white px-6 text-sm font-bold text-black disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      className="animate-spin"
                      size={16}
                    />

                    Adding…
                  </span>
                ) : (
                  "Add domain"
                )}
              </button>
            </form>

            {domainSupportEmail ? (
              <p className="mt-4 text-xs text-white/40">
                Need help
                connecting a
                domain? Contact{" "}
                <a
                  href={`mailto:${domainSupportEmail}`}
                  className="font-semibold text-white/70 underline"
                >
                  {
                    domainSupportEmail
                  }
                </a>
                .
              </p>
            ) : null}
          </section>

          {createdDomain ? (
            <section className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-blue-300"
                  size={20}
                />

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">
                    Verify domain
                    ownership
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Add this TXT
                    record at your
                    domain registrar
                    or DNS provider.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-black/35 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        Type
                      </p>

                      <p className="mt-1 font-mono text-sm">
                        {
                          createdDomain
                            .verification
                            .recordType
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/35 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        Host
                      </p>

                      <div className="mt-1 flex items-center gap-3">
                        <p className="min-w-0 flex-1 break-all font-mono text-sm">
                          {
                            createdDomain
                              .verification
                              .host
                          }
                        </p>

                        <button
                          type="button"
                          aria-label="Copy verification host"
                          onClick={() =>
                            void copyText(
                              createdDomain
                                .verification
                                .host
                            )
                          }
                          className="rounded-lg p-2 hover:bg-white/10"
                        >
                          <Copy
                            size={
                              16
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-black/35 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        Value
                      </p>

                      <div className="mt-1 flex items-center gap-3">
                        <p className="min-w-0 flex-1 break-all font-mono text-sm">
                          {
                            createdDomain
                              .verification
                              .value
                          }
                        </p>

                        <button
                          type="button"
                          aria-label="Copy verification value"
                          onClick={() =>
                            void copyText(
                              createdDomain
                                .verification
                                .value
                            )
                          }
                          className="rounded-lg p-2 hover:bg-white/10"
                        >
                          <Copy
                            size={
                              16
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-white/45">
                    DNS changes
                    can take time
                    to propagate.
                    Once the record
                    is available,
                    click Verify
                    below.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Custom domains
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Manage the
                  domains connected
                  to this tenant.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void refreshDomains()
                }
                disabled={
                  loading
                }
                className="rounded-xl border border-white/10 bg-white/5 p-3 disabled:opacity-50"
                title="Refresh domains"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : undefined
                  }
                />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/55">
                <Loader2
                  className="animate-spin"
                  size={18}
                />

                Loading
                domains…
              </div>
            ) : customDomains.length ? (
              <div className="space-y-4">
                {customDomains.map(
                  (domain) => (
                    <DomainCard
                      key={
                        domain.id
                      }
                      domain={
                        domain
                      }
                      loadingAction={
                        loadingAction
                      }
                      onVerify={
                        handleVerify
                      }
                      onProvision={
                        handleProvision
                      }
                      onRefresh={
                        handleRefresh
                      }
                      onDisconnect={
                        handleDisconnect
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                <Globe2
                  className="mx-auto text-white/25"
                  size={34}
                />

                <p className="mt-4 font-semibold">
                  No custom
                  domain connected
                  yet.
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                  Add the
                  business domain
                  your customers
                  should use to
                  access this
                  tenant.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}