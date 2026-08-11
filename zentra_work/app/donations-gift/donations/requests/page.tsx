/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Gift,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  donationService,
  type DonationRequest,
} from "@/services/donation.service";

export default function DonationRequestsPage() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await donationService.listMine({
        page: 1,
        pageSize: 50,
      });

      setRequests(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your donation requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main
      className="min-h-screen bg-[#9AF0A8]"
      style={{
        backgroundImage: "url('/images/donations-bg-2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-10 pt-12">
        <header className="relative flex items-center justify-center">
          <Link
            href="/donations-gift/donations"
            className="absolute left-0 text-white"
            aria-label="Back"
          >
            <ArrowLeft size={21} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            My Donations
          </h1>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="absolute right-0 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </header>

        <section className="mt-8 rounded-[20px] bg-white/90 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#2458E8]/10 text-[#2458E8]">
              <Gift size={21} />
            </div>

            <div>
              <h2 className="text-[18px] font-black text-[#222]">
                Donation requests
              </h2>

              <p className="text-[12px] text-black/45">
                Track your requests and approved funds.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-[10px] bg-red-50 px-4 py-3 text-center text-[12px] font-medium text-red-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 inline-flex items-center gap-2 font-bold"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid min-h-[280px] place-items-center rounded-[18px] bg-white/60">
            <div className="text-center">
              <Loader2
                size={26}
                className="mx-auto animate-spin text-[#2458E8]"
              />

              <p className="mt-3 text-[12px] font-medium text-black/50">
                Loading requests...
              </p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-6 rounded-[18px] bg-white/90 px-6 py-10 text-center shadow-sm">
            <Gift
              size={38}
              className="mx-auto text-black/20"
            />

            <h3 className="mt-4 text-[16px] font-bold text-[#222]">
              No donation requests
            </h3>

            <p className="mt-2 text-[12px] leading-5 text-black/45">
              You haven&apos;t submitted a donation request yet.
            </p>

            <Link
              href="/donations-gift/donations"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[10px] bg-[#2458E8] px-5 text-[12px] font-bold text-white"
            >
              Find a donor
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function RequestCard({
  request,
}: {
  request: DonationRequest;
}) {
  const canRedeem =
    request.status === "approved" ||
    request.status === "funded";

  return (
    <article className="overflow-hidden rounded-[16px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3 border-b border-black/5 px-4 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
            Donor
          </p>

          <h3 className="mt-1 truncate text-[16px] font-bold text-[#222]">
            {request.donor_name || "Donor"}
          </h3>
        </div>

        <StatusBadge status={request.status} />
      </div>

      <div className="px-4 py-4">
        <p className="text-[11px] font-medium text-black/40">
          Amount requested
        </p>

        <p className="mt-1 text-[24px] font-black text-[#222]">
          {request.currency}{" "}
          {Number(request.amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

        <div className="mt-4 space-y-3">
          {request.account_name && (
            <InfoRow
              label="Destination account"
              value={
                request.account_number
                  ? `${request.account_name} •••• ${request.account_number.slice(
                      -4,
                    )}`
                  : request.account_name
              }
            />
          )}

          {request.purpose && (
            <div>
              <p className="text-[11px] font-semibold text-black/40">
                Purpose
              </p>

              <p className="mt-1 text-[12px] leading-5 text-[#333]">
                {request.purpose}
              </p>
            </div>
          )}

          <InfoRow
            label="Requested"
            value={formatDate(request.created_at)}
          />

          {request.rejection_reason && (
            <div className="rounded-[10px] bg-red-50 px-3 py-3">
              <p className="text-[11px] font-bold text-red-700">
                Rejection reason
              </p>

              <p className="mt-1 text-[12px] leading-5 text-red-700">
                {request.rejection_reason}
              </p>
            </div>
          )}
        </div>

        {canRedeem && (
          <Link
            href={`/donations-gift/donations/requests/${encodeURIComponent(
              request.id,
            )}/redeem`}
            className="mt-5 flex h-[42px] w-full items-center justify-center rounded-[10px] bg-[#2458E8] text-[13px] font-bold text-white"
          >
            Redeem donation
          </Link>
        )}
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: DonationRequest["status"];
}) {
  const config = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700",
      icon: Clock3,
    },

    approved: {
      label: "Approved",
      className: "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    funded: {
      label: "Funded",
      className: "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    redeemed: {
      label: "Redeemed",
      className: "bg-blue-50 text-blue-700",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-700",
      icon: XCircle,
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
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] font-medium text-black/40">
        {label}
      </span>

      <span className="max-w-[220px] text-right text-[12px] font-semibold text-[#333]">
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