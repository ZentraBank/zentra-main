"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { nextOfKinService } from "@/services/next-of-kin.service";
import type {
  PodClaim,
  PodClaimStatus,
} from "@/types/next-of-kin";

export default function PodClaimsPage() {
  const [claims, setClaims] = useState<PodClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await nextOfKinService.listMine();
      setClaims(result.claims);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your POD claims.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-5 pb-10 pt-12">
      <section className="mx-auto w-full max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/nok"
            className="absolute left-0 text-[#555]"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </Link>

          <h1 className="font-heading text-[14px] font-bold tracking-[0.08em] text-[#444]">
            My POD Claims
          </h1>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="absolute right-0 grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm disabled:opacity-50"
            aria-label="Refresh claims"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </header>

        <section className="mt-8 rounded-[20px] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#2458E8]/10 text-[#2458E8]">
              <FileText size={21} />
            </div>

            <div>
              <h2 className="text-[18px] font-black text-[#222]">
                POD Claims
              </h2>

              <p className="text-[12px] text-black/45">
                Track your submitted next-of-kin claims.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid min-h-[280px] place-items-center rounded-[18px] bg-white">
            <Loader2
              size={28}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : claims.length === 0 ? (
          <div className="mt-6 rounded-[18px] bg-white px-6 py-10 text-center shadow-sm">
            <FileText
              size={38}
              className="mx-auto text-black/20"
            />

            <h3 className="mt-4 text-[16px] font-bold text-[#222]">
              No POD claims
            </h3>

            <p className="mt-2 text-[12px] leading-5 text-black/45">
              You haven&apos;t submitted a next-of-kin claim yet.
            </p>

            <Link
              href="/nok/pod-upload"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[10px] bg-[#2458E8] px-5 text-[12px] font-bold text-white"
            >
              Start a claim
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {claims.map((claim) => (
              <article
                key={claim.id}
                className="overflow-hidden rounded-[16px] bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 border-b border-black/5 px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
                      Deceased account holder
                    </p>

                    <h3 className="mt-1 truncate text-[16px] font-bold text-[#222]">
                      {claim.deceased_name}
                    </h3>
                  </div>

                  <StatusBadge status={claim.status} />
                </div>

                <div className="px-4 py-4">
                  <InfoRow
                    label="Account"
                    value={`•••• ${claim.deceased_account_number.slice(-4)}`}
                  />

                  <InfoRow
                    label="Relationship"
                    value={claim.relationship_to_deceased}
                  />

                  <InfoRow
                    label="Submitted"
                    value={formatDate(claim.created_at)}
                  />

                  <Link
                    href={`/nok/claims/${encodeURIComponent(claim.id)}`}
                    className="mt-4 flex h-[40px] w-full items-center justify-center rounded-[10px] bg-[#EEF4FF] text-[12px] font-bold text-[#2458E8]"
                  >
                    View claim details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
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
      className: "bg-gray-100 text-gray-600",
      icon: Clock3,
    },

    submitted: {
      label: "Submitted",
      className: "bg-amber-50 text-amber-700",
      icon: Clock3,
    },

    under_review: {
      label: "Under review",
      className: "bg-blue-50 text-blue-700",
      icon: Clock3,
    },

    more_information_required: {
      label: "More info",
      className: "bg-orange-50 text-orange-700",
      icon: Clock3,
    },

    approved: {
      label: "Approved",
      className: "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-700",
      icon: XCircle,
    },

    completed: {
      label: "Completed",
      className: "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    cancelled: {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600",
      icon: XCircle,
    },
  } as const;

  const current = config[status];
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${current.className}`}
    >
      <Icon size={12} />
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
    <div className="mb-3 flex items-start justify-between gap-4">
      <span className="text-[11px] text-black/40">
        {label}
      </span>

      <span className="max-w-[220px] text-right text-[12px] font-semibold capitalize text-[#333]">
        {value}
      </span>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}