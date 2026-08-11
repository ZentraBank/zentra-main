"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function DonationRequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>();

  const [request, setRequest] =
    useState<DonationRequest | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load = useCallback(async () => {
    if (!requestId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result =
        await donationService.getMine(requestId);

      setRequest(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this donation request.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main
      className="min-h-screen bg-[#9AF0A8]"
      style={{
        backgroundImage:
          "url('/images/donations-bg-2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-10 pt-12">
        <header className="relative flex items-center justify-center">
          <Link
            href="/donations-gift/donations/requests"
            className="absolute left-0 text-white"
            aria-label="Back"
          >
            <ArrowLeft size={21} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Donation Request
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
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </header>

        {error && (
          <div className="mt-5 rounded-[10px] bg-red-50 px-4 py-3 text-center text-[12px] font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-[320px] place-items-center rounded-[18px] bg-white/70">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-[#2458E8]"
              />

              <p className="mt-3 text-[12px] text-black/50">
                Loading request...
              </p>
            </div>
          </div>
        ) : request ? (
          <section className="mt-8 overflow-hidden rounded-[20px] bg-white shadow-lg">
            <div className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
                  Donor
                </p>

                <h2 className="mt-1 truncate text-[19px] font-black text-[#222]">
                  {request.donor_name ||
                    "Donor"}
                </h2>
              </div>

              <StatusBadge
                status={request.status}
              />
            </div>

            <div className="px-5 py-5">
              <p className="text-[11px] font-medium text-black/40">
                Amount requested
              </p>

              <p className="mt-1 text-[30px] font-black text-[#222]">
                {request.currency}{" "}
                {Number(
                  request.amount,
                ).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                )}
              </p>

              <div className="mt-6 space-y-4">
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

                <InfoRow
                  label="Status"
                  value={request.status}
                />

                <InfoRow
                  label="Submitted"
                  value={formatDate(
                    request.created_at,
                  )}
                />

                {request.purpose && (
                  <TextBlock
                    label="Purpose"
                    value={request.purpose}
                  />
                )}

                {request.appreciation && (
                  <TextBlock
                    label="Appreciation"
                    value={
                      request.appreciation
                    }
                  />
                )}

                {request.rejection_reason && (
                  <div className="rounded-[12px] bg-red-50 px-4 py-3">
                    <p className="text-[11px] font-bold text-red-700">
                      Rejection reason
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-red-700">
                      {
                        request.rejection_reason
                      }
                    </p>
                  </div>
                )}
              </div>

              {(request.status ===
                "approved" ||
                request.status ===
                  "funded") && (
                <Link
                  href={`/donations-gift/donations/requests/${encodeURIComponent(
                    request.id,
                  )}/redeem`}
                  className="mt-6 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-[#2458E8] text-[13px] font-bold text-white"
                >
                  Redeem donation
                </Link>
              )}

              {request.status ===
                "pending" && (
                <div className="mt-6 rounded-[12px] bg-amber-50 px-4 py-3 text-center text-[12px] font-medium text-amber-700">
                  Your request is awaiting review.
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="mt-8 rounded-[18px] bg-white p-8 text-center">
            <Gift
              size={38}
              className="mx-auto text-black/20"
            />

            <p className="mt-4 text-sm text-black/50">
              Donation request not found.
            </p>
          </div>
        )}
      </section>
    </main>
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
      className:
        "bg-amber-50 text-amber-700",
      icon: Clock3,
    },

    approved: {
      label: "Approved",
      className:
        "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    funded: {
      label: "Funded",
      className:
        "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    redeemed: {
      label: "Redeemed",
      className:
        "bg-blue-50 text-blue-700",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700",
      icon: XCircle,
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
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] font-medium text-black/40">
        {label}
      </span>

      <span className="max-w-[220px] text-right text-[12px] font-semibold capitalize text-[#333]">
        {value}
      </span>
    </div>
  );
}

function TextBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-black/40">
        {label}
      </p>

      <p className="mt-1 text-[12px] leading-5 text-[#333]">
        {value}
      </p>
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