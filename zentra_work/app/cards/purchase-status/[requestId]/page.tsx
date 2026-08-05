/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  cardService,
  type CardPurchaseRequest,
} from "@/services/card.service";

const formatMoney = (
  amount: string | number,
  currency: string,
) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function CardPurchaseStatusPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;

  

  const [request, setRequest] =
    useState<CardPurchaseRequest | null>(null);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!requestId) return;

    setLoading(true);
    setError("");

    try {
      const result =
        await cardService.getMyPurchaseRequest(
          requestId,
        );

      setRequest(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the card request.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!request || request.status !== "pending") {
      return;
    }

    const interval = window.setInterval(() => {
      void load();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [load, request]);

  const cancelRequest = async () => {
    if (!request || request.status !== "pending") {
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const updated =
        await cardService.cancelPurchaseRequest(
          request.id,
        );

      setRequest(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the request.",
      );
    } finally {
      setCancelling(false);
    }
    
  };

  return (
    <main className="min-h-screen bg-[#E7EBF0] text-[#252525]">
      <section className="mx-auto max-w-[430px] px-4 pb-24 pt-12 lg:max-w-[900px] lg:px-8 lg:py-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href="/cards/active-cards"
            className="absolute left-0 text-black/60 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:shadow-sm"
          >
            <ArrowLeft size={21} />
          </Link>

          <h1 className="font-heading text-[18px] font-bold lg:text-[26px]">
            Card request status
          </h1>

          <button
            type="button"
            onClick={() => void load()}
            className="absolute right-0 grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm lg:static lg:h-11 lg:w-11"
            aria-label="Refresh request status"
          >
            <RefreshCw size={17} />
          </button>
        </header>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid min-h-[420px] place-items-center">
            <Loader2 className="animate-spin text-[#2458E8]" />
          </div>
        ) : !request ? (
          <section className="mt-8 rounded-[28px] bg-white p-8 text-center shadow-sm">
            <XCircle
              size={44}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-xl font-black">
              Request not found
            </h2>

            <Link
              href="/cards/cards-purchase"
              className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-[#2458E8] font-bold text-white"
            >
              Return to card catalogue
            </Link>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-[30px] bg-white shadow-sm">
            <StatusBanner status={request.status} />

            <div className="p-6 lg:p-8">
              <h2 className="text-[24px] font-black capitalize lg:text-[34px]">
                {request.card_type.replaceAll("_", " ")} card
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/50">
                Request submitted on{" "}
                {formatDate(request.created_at)}.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Amount"
                  value={formatMoney(
                    request.price,
                    request.currency,
                  )}
                />

                <DetailRow
                  label="Payment method"
                  value={request.payment_method}
                />

                <DetailRow
                  label="Card brand"
                  value={request.card_brand}
                />

                <DetailRow
                  label="Status"
                  value={request.status}
                />

                <DetailRow
                  label="Account"
                  value={
                    request.account_number
                        ? `•••• ${request.account_number.slice(-4)}`
                        : `•••• ${request.account_id.slice(-4)}`
                    }
                />

                <DetailRow
                  label="Reference"
                  value={
                    request.payment_reference ||
                    "Not supplied"
                  }
                />
              </div>

              {request.status === "pending" && (
                <div className="mt-7 rounded-[20px] bg-[#FFF8E7] p-5">
                  <div className="flex items-start gap-3">
                    <Clock3
                      size={22}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <h3 className="font-black text-amber-800">
                        Awaiting tenant-admin verification
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-amber-800/70">
                        Your card has not been issued yet.
                        A tenant administrator must verify
                        your payment before the card becomes
                        active.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={cancelRequest}
                    disabled={cancelling}
                    className="mt-5 flex h-11 w-full items-center justify-center rounded-[14px] border border-red-200 bg-white text-sm font-bold text-red-600 disabled:opacity-50"
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "Cancel request"}
                  </button>
                </div>
              )}

              {request.status === "approved" && (
                <div className="mt-7 rounded-[20px] bg-green-50 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={22}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>
                      <h3 className="font-black text-green-800">
                        Payment approved
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-green-800/70">
                        Your payment was verified and your
                        card has been issued.
                      </p>
                    </div>
                  </div>

                  {request.issued_card_id && (
                    <Link
                      href={`/cards/details/${request.issued_card_id}`}
                      className="mt-5 flex h-12 items-center justify-center rounded-[16px] bg-green-600 text-sm font-bold text-white"
                    >
                      View issued card
                    </Link>
                  )}
                </div>
              )}

              {request.status === "rejected" && (
                <div className="mt-7 rounded-[20px] bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={22}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                      <h3 className="font-black text-red-800">
                        Payment verification failed
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-red-800/70">
                        {request.rejection_reason ||
                          "The tenant administrator could not verify the payment."}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/cards/cards-purchase"
                    className="mt-5 flex h-12 items-center justify-center rounded-[16px] bg-[#2458E8] text-sm font-bold text-white"
                  >
                    Start a new request
                  </Link>
                </div>
              )}

              {request.status === "cancelled" && (
                <div className="mt-7 rounded-[20px] bg-[#F3F4F6] p-5">
                  <h3 className="font-black">
                    Request cancelled
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    This request will not be reviewed or
                    issued.
                  </p>

                  <Link
                    href="/cards/cards-purchase"
                    className="mt-5 flex h-12 items-center justify-center rounded-[16px] bg-[#2458E8] text-sm font-bold text-white"
                  >
                    Choose another card
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function StatusBanner({
  status,
}: {
  status: CardPurchaseRequest["status"];
}) {
  const config = {
    pending: {
      title: "Verification pending",
      description:
        "Your payment submission is awaiting review.",
      className: "bg-amber-500",
      icon: Clock3,
    },
    approved: {
      title: "Request approved",
      description:
        "Your card has been issued successfully.",
      className: "bg-green-600",
      icon: CheckCircle2,
    },
    rejected: {
      title: "Request rejected",
      description:
        "Your payment could not be verified.",
      className: "bg-red-600",
      icon: XCircle,
    },
    cancelled: {
      title: "Request cancelled",
      description:
        "You cancelled this purchase request.",
      className: "bg-gray-600",
      icon: XCircle,
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`${config.className} p-6 text-white`}>
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15">
          <Icon size={25} />
        </span>

        <div>
          <h2 className="text-xl font-black">
            {config.title}
          </h2>

          <p className="mt-1 text-sm text-white/75">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] bg-[#F7FAFC] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-black/35">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black capitalize">
        {value}
      </p>
    </div>
  );
}