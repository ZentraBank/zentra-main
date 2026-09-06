"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AppShell from "@/components/layout/AppShell";
import {
  nextOfKinService,
} from "@/services/next-of-kin.service";

import type {
  PodClaim,
  PodClaimStatus,
} from "@/types/next-of-kin.types";

export default function NextOfKinManagementPage() {
  const [
    claims,
    setClaims,
  ] = useState<PodClaim[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadClaims =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await nextOfKinService.listClaims({
              page: 1,
              pageSize: 50,
            });

          setClaims(
            result.claims,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load POD claims.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-80px)] overflow-x-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.13),transparent_16%)] bg-black px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                Next-of-kin Management
              </p>

              <h1 className="mt-1 text-3xl font-black text-white md:text-4xl">
                Account Manager
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-white/65">
                Review and process POD claims submitted by your clients.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadClaims()
              }
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin text-white"
                    : ""
                }
              />
              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-xl text-neutral-900">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    POD Claims
                  </p>
                  <p className="mt-1 text-2xl font-black text-neutral-900">
                    {loading ? "..." : claims.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-950/70 px-4 py-3 text-sm font-medium text-red-100 shadow-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Loader2
                  size={24}
                  className="animate-spin text-white"
                />
                Loading claims...
              </div>
            </div>
          ) : claims.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white">
              <FileText
                size={38}
                className="mx-auto text-white/30"
              />

              <h2 className="mt-4 text-base font-bold text-white">
                No POD claims
              </h2>

              <p className="mx-auto mt-1 max-w-[280px] text-xs text-white/50">
                Client next-of-kin claims will appear here when they are submitted.
              </p>
            </div>
          ) : (
            <section className="mt-8 grid gap-5 lg:grid-cols-2">
              {claims.map(
                (claim) => (
                  <ClaimCard
                    key={
                      claim.id
                    }
                    claim={
                      claim
                    }
                  />
                ),
              )}
            </section>
          )}
        </div>
      </main>
    </AppShell>
  );
}

function ClaimCard({
  claim,
}: {
  claim: PodClaim;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white text-neutral-900 shadow-xl">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-100 p-6">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
            Deceased account holder
          </p>

          <h2 className="mt-1 truncate text-lg font-bold text-neutral-900">
            {
              claim.deceased_name
            }
          </h2>
        </div>

        <StatusBadge
          status={
            claim.status
          }
        />
      </div>

      <div className="p-6">
        <div className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 text-sm">
          <InfoRow
            label="Beneficiary"
            value={
              claim.beneficiary_name
            }
          />

          <InfoRow
            label="Relationship"
            value={
              claim.relationship_to_deceased
            }
          />

          <InfoRow
            label="Account"
            value={`•••• ${claim.deceased_account_number.slice(
              -4,
            )}`}
          />

          <InfoRow
            label="Submitted"
            value={formatDate(
              claim.submitted_at ??
                claim.created_at,
            )}
          />
        </div>

        <Link
          href={`/nok/${encodeURIComponent(
            claim.id,
          )}`}
          className="group mt-5 flex h-12 w-full items-center justify-between rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <span>
            Review claim
          </span>

          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: PodClaimStatus;
}) {
  const config = {
    draft: {
      label: "Draft",
      className:
        "bg-neutral-100 text-neutral-700 border border-neutral-200",
      icon: Clock3,
    },

    submitted: {
      label: "Submitted",
      className:
        "bg-amber-50 text-amber-700 border border-amber-200",
      icon: Clock3,
    },

    under_review: {
      label: "Under review",
      className:
        "bg-blue-50 text-blue-700 border border-blue-200",
      icon: Clock3,
    },

    more_information_required: {
      label: "More info",
      className:
        "bg-orange-50 text-orange-700 border border-orange-200",
      icon: Clock3,
    },

    approved: {
      label: "Approved",
      className:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border border-red-200",
      icon: XCircle,
    },

    completed: {
      label: "Completed",
      className:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: CheckCircle2,
    },

    cancelled: {
      label: "Cancelled",
      className:
        "bg-neutral-100 text-neutral-700 border border-neutral-200",
      icon: XCircle,
    },
  } as const;

  const current =
    config[status];

  const Icon =
    current.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${current.className}`}
    >
      <Icon size={14} />
      {current.label}
    </span>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-neutral-400 font-medium">
        {label}
      </span>

      <span className="max-w-[250px] text-right font-semibold capitalize text-neutral-800">
        {value}
      </span>
    </div>
  );
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}