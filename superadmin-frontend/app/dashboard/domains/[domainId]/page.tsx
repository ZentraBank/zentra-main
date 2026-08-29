"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  Globe2,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";

import { ApiError } from "@/src/lib/api-error";
import {
  platformDomainsService,
  type PlatformDomainDetails,
  type PlatformDomainStatus,
} from "@/src/services/platform-domains.service";

const formatStatus = (
  value: string
) =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatDate = (
  value: string | null
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

function StatusBadge({
  status,
}: {
  status: PlatformDomainStatus;
}) {
  const classes =
    status === "active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : status === "failed"
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : status ===
            "verification_pending"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : status ===
              "provisioning"
            ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
            : "border-white/10 bg-white/5 text-white/60";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/35">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white/90">
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function DomainDetailsPage({
  params,
}: {
  params: Promise<{
    domainId: string;
  }>;
}) {
  const [domainId, setDomainId] =
    useState("");

  const [domain, setDomain] =
    useState<
      PlatformDomainDetails | null
    >(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState("");

  useEffect(() => {
    void params.then(
      ({ domainId }) => {
        setDomainId(domainId);
      }
    );
  }, [params]);

  const loadDomain =
    useCallback(async () => {
      if (!domainId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await platformDomainsService.get(
            domainId
          );

        setDomain(
          response.data ?? null
        );
      } catch (caught) {
        setDomain(null);

        setError(
          caught instanceof
            ApiError
            ? caught.message
            : "Unable to load tenant domain."
        );
      } finally {
        setLoading(false);
      }
    }, [domainId]);

  useEffect(() => {
    void loadDomain();
  }, [loadDomain]);

  const copyValue = async (
    label: string,
    value: string | null
  ) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopied(label);

      window.setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch {
      // Clipboard may be
      // unavailable in some contexts.
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3 text-sm text-white/50">
          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading domain details…
        </div>
      </main>
    );
  }

  if (error || !domain) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/domains"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Back to domains
          </Link>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <div className="flex gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-300"
              />

              <div>
                <p className="font-bold text-red-100">
                  Unable to load
                  domain
                </p>

                <p className="mt-2 text-sm leading-6 text-red-200/80">
                  {error ||
                    "Tenant domain not found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <Link
              href="/dashboard/domains"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-white"
            >
              <ArrowLeft
                size={16}
              />

              Tenant domains
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <h1 className="break-all text-3xl font-black md:text-4xl">
                {domain.domain}
              </h1>

              <StatusBadge
                status={
                  domain.status
                }
              />

              {domain.isPrimary ? (
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                  Primary
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-sm text-white/45">
              {domain.tenant.name}
              {" · "}
              {domain.tenant.slug}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadDomain()
            }
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            <RefreshCw
              size={16}
            />

            Refresh status
          </button>
        </div>

        {domain.failureReason ? (
          <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <div className="flex gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-300"
              />

              <div>
                <p className="font-bold text-red-100">
                  Domain requires
                  attention
                </p>

                <p className="mt-2 text-sm leading-6 text-red-200/80">
                  {
                    domain.failureReason
                  }
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="Domain type"
            value={formatStatus(
              domain.type
            )}
          />

          <InfoCard
            label="SSL status"
            value={
              domain.sslStatus
                ? formatStatus(
                    domain.sslStatus
                  )
                : "—"
            }
          />

          <InfoCard
            label="Provider"
            value={
              domain.provider
            }
          />

          <InfoCard
            label="Verification attempts"
            value={
              domain.verificationAttempts
            }
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
            <div className="flex items-center gap-3">
              <Globe2
                size={20}
                className="text-white/50"
              />

              <div>
                <h2 className="font-bold">
                  Domain routing
                </h2>

                <p className="mt-1 text-xs text-white/40">
                  Routing and
                  provider details.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <DetailRow
                label="Domain"
                value={
                  domain.domain
                }
                onCopy={() =>
                  void copyValue(
                    "domain",
                    domain.domain
                  )
                }
                copied={
                  copied ===
                  "domain"
                }
              />

              <DetailRow
                label="Target host"
                value={
                  domain.targetHost
                }
                onCopy={
                  domain.targetHost
                    ? () =>
                        void copyValue(
                          "target",
                          domain.targetHost
                        )
                    : undefined
                }
                copied={
                  copied ===
                  "target"
                }
              />

              <DetailRow
                label="Provider"
                value={
                  domain.provider
                }
              />

              <DetailRow
                label="Provider hostname ID"
                value={
                  domain.providerHostnameId
                }
                onCopy={
                  domain.providerHostnameId
                    ? () =>
                        void copyValue(
                          "providerId",
                          domain.providerHostnameId
                        )
                    : undefined
                }
                copied={
                  copied ===
                  "providerId"
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={20}
                className="text-white/50"
              />

              <div>
                <h2 className="font-bold">
                  Verification & SSL
                </h2>

                <p className="mt-1 text-xs text-white/40">
                  Ownership and
                  certificate state.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <DetailRow
                label="Verification method"
                value={
                  domain.verificationMethod
                    ? formatStatus(
                        domain.verificationMethod
                      )
                    : null
                }
              />

              <DetailRow
                label="Domain status"
                value={formatStatus(
                  domain.status
                )}
              />

              <DetailRow
                label="SSL status"
                value={
                  domain.sslStatus
                    ? formatStatus(
                        domain.sslStatus
                      )
                    : null
                }
              />

              <DetailRow
                label="Verification attempts"
                value={String(
                  domain.verificationAttempts
                )}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <Server
              size={20}
              className="text-white/50"
            />

            <div>
              <h2 className="font-bold">
                Tenant
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Tenant associated
                with this domain.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label="Tenant name"
              value={
                domain.tenant.name
              }
            />

            <InfoCard
              label="App name"
              value={
                domain.tenant
                  .appName
              }
            />

            <InfoCard
              label="Tenant slug"
              value={
                domain.tenant.slug
              }
            />

            <InfoCard
              label="Tenant status"
              value={formatStatus(
                domain.tenant
                  .status
              )}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <Clock3
              size={20}
              className="text-white/50"
            />

            <div>
              <h2 className="font-bold">
                Timeline
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Domain lifecycle
                activity.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              label="Created"
              value={formatDate(
                domain.createdAt
              )}
            />

            <InfoCard
              label="Last updated"
              value={formatDate(
                domain.updatedAt
              )}
            />

            <InfoCard
              label="Last verification"
              value={formatDate(
                domain.lastVerificationAt
              )}
            />

            <InfoCard
              label="Verified"
              value={formatDate(
                domain.verifiedAt
              )}
            />

            <InfoCard
              label="Activated"
              value={formatDate(
                domain.activatedAt
              )}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <h2 className="font-bold">
            Platform controls
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            This section will hold
            superadmin recovery
            controls such as provider
            status refresh, retry
            provisioning and domain
            disconnection.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              disabled
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/30"
            >
              Refresh provider
            </button>

            <button
              type="button"
              disabled
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/30"
            >
              Retry provisioning
            </button>

            <button
              type="button"
              disabled
              className="rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-300/30"
            >
              Disconnect domain
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value:
    | string
    | null
    | undefined;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/30">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-medium text-white/80">
          {value || "—"}
        </p>
      </div>

      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-white/45 transition hover:text-white"
          title={`Copy ${label}`}
        >
          {copied ? (
            <CheckCircle2
              size={15}
            />
          ) : (
            <Copy
              size={15}
            />
          )}
        </button>
      ) : null}
    </div>
  );
}