"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
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
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Next-of-kin management background"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col px-5 pb-6 pt-8 md:max-w-[760px] md:px-8 md:pt-10">
        <header className="relative flex items-center justify-center">
          <Link
            href="/dashboard"
            aria-label="Go back"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft
              size={18}
              strokeWidth={2}
            />
          </Link>

          <p className="text-[11px] font-semibold tracking-[0.8px] md:text-xs">
            Next-of-kin Management
          </p>

          <button
            type="button"
            onClick={() =>
              void loadClaims()
            }
            disabled={loading}
            aria-label="Refresh claims"
            className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </header>

        <section className="mt-6">
          <h1 className="mx-auto max-w-[420px] pt-6 text-center font-sf text-[43px] leading-[1.03] tracking-[-0.7px] md:text-[48px]">
            Next-of-kin
            <br />
            Account Manager
          </h1>

          <p className="mx-auto mt-4 max-w-[450px] text-center font-lato text-[14px] font-medium leading-[1.4] text-white/90">
            Review and process POD claims submitted by your clients.
          </p>

          <div className="mx-auto mt-7 flex w-full max-w-[560px] items-center justify-between rounded-[14px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-white text-[#2458E8]">
                <FileText size={19} />
              </div>

              <div>
                <p className="text-[15px] font-bold">
                  POD Claims
                </p>

                <p className="mt-0.5 text-[11px] text-white/65">
                  {loading
                    ? "Loading claims..."
                    : `${claims.length} claim${
                        claims.length === 1
                          ? ""
                          : "s"
                      } loaded`}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-auto mt-5 max-w-[560px] rounded-[12px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mx-auto mt-5 grid min-h-[260px] max-w-[560px] place-items-center rounded-[18px] bg-white/10 backdrop-blur-md">
              <Loader2
                size={30}
                className="animate-spin"
              />
            </div>
          ) : claims.length === 0 ? (
            <div className="mx-auto mt-5 max-w-[560px] rounded-[18px] bg-white px-6 py-10 text-center text-[#333] shadow-lg">
              <FileText
                size={38}
                className="mx-auto text-black/20"
              />

              <h2 className="mt-4 text-[17px] font-bold">
                No POD claims
              </h2>

              <p className="mx-auto mt-2 max-w-[280px] text-[12px] leading-5 text-black/45">
                Client next-of-kin claims will appear here when they are submitted.
              </p>
            </div>
          ) : (
            <div className="mx-auto mt-5 w-full max-w-[560px] space-y-3">
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
            </div>
          )}
        </section>

        <div className="mt-auto flex justify-center pb-1 pt-10">
          <Link
            href="/dashboard"
            className="flex h-[40px] w-[260px] items-center justify-center rounded-[8px] bg-[#1E40AF] font-roboto text-[15px] text-white shadow-lg transition hover:bg-[#1e3fc2] active:scale-95 md:w-[220px]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function ClaimCard({
  claim,
}: {
  claim: PodClaim;
}) {
  return (
    <article className="overflow-hidden rounded-[16px] bg-white text-[#333] shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3 border-b border-black/5 px-4 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
            Deceased account holder
          </p>

          <h2 className="mt-1 truncate text-[16px] font-bold text-[#222]">
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

      <div className="px-4 py-4">
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

        <Link
          href={`/nok/${encodeURIComponent(
            claim.id,
          )}`}
          className="group mt-4 flex h-[42px] w-full items-center justify-between rounded-[10px] bg-[#EEF4FF] px-4 text-[12px] font-bold text-[#2458E8] transition hover:bg-[#E4EDFF]"
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
        "bg-gray-100 text-gray-600",
      icon: Clock3,
    },

    submitted: {
      label: "Submitted",
      className:
        "bg-amber-50 text-amber-700",
      icon: Clock3,
    },

    under_review: {
      label: "Under review",
      className:
        "bg-blue-50 text-blue-700",
      icon: Clock3,
    },

    more_information_required: {
      label: "More info",
      className:
        "bg-orange-50 text-orange-700",
      icon: Clock3,
    },

    approved: {
      label: "Approved",
      className:
        "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700",
      icon: XCircle,
    },

    completed: {
      label: "Completed",
      className:
        "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    cancelled: {
      label: "Cancelled",
      className:
        "bg-gray-100 text-gray-600",
      icon: XCircle,
    },
  } as const;

  const current =
    config[status];

  const Icon =
    current.icon;

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
    <div className="mb-2.5 flex items-start justify-between gap-4">
      <span className="text-[11px] text-black/40">
        {label}
      </span>

      <span className="max-w-[250px] text-right text-[12px] font-semibold capitalize text-[#333]">
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