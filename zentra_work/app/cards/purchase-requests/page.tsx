"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
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
  cardService,
  type CardPurchaseRequest,
} from "@/services/card.service";

export default function CardPurchaseRequestsPage() {
  const [requests, setRequests] =
    useState<CardPurchaseRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result =
        await cardService.listMyPurchaseRequests();

      setRequests(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load card requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#E7EBF0] text-[#252525]">
      <section className="mx-auto max-w-[430px] px-4 pb-28 pt-12 lg:max-w-[900px] lg:px-8 lg:py-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href="/cards/active-cards"
            className="absolute left-0 text-black/60 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:shadow-sm"
          >
            <ArrowLeft size={21} />
          </Link>

          <div className="text-center lg:text-left">
            <h1 className="font-heading text-[18px] font-bold lg:text-[26px]">
              Card requests
            </h1>

            <p className="mt-1 hidden text-sm text-black/45 lg:block">
              Track your submitted card applications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="absolute right-0 grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm lg:static lg:h-11 lg:w-11"
            aria-label="Refresh requests"
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
          <div className="grid min-h-[350px] place-items-center">
            <Loader2 className="animate-spin text-[#2458E8]" />
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-[28px] bg-white p-8 text-center shadow-sm">
            <Clock3
              size={38}
              className="mx-auto text-black/20"
            />

            <h2 className="mt-4 text-lg font-black">
              No card requests yet
            </h2>

            <p className="mt-2 text-sm text-black/45">
              Once you request a card, its status will appear here.
            </p>

            <Link
              href="/cards/cards-purchase"
              className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-[#2458E8] font-bold text-white"
            >
              Request a card
            </Link>
          </div>
        ) : (
          <section className="mt-8 space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

function RequestCard({
  request,
}: {
  request: CardPurchaseRequest;
}) {
  return (
    <Link
      href={`/cards/purchase-status/${request.id}`}
      className="block rounded-[24px] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[17px] font-black capitalize">
            {request.card_type.replaceAll(
              "_",
              " ",
            )}{" "}
            card
          </p>

          <p className="mt-1 text-xs text-black/40">
            {new Date(
              request.created_at,
            ).toLocaleString()}
          </p>
        </div>

        <StatusBadge
          status={request.status}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Info
          label="Amount"
          value={formatMoney(
            request.price,
            request.currency,
          )}
        />

        <Info
          label="Payment"
          value={request.payment_method}
        />

        <Info
          label="Account"
          value={
            request.account_number
              ? `•••• ${request.account_number.slice(
                  -4,
                )}`
              : "—"
          }
        />

        <Info
          label="Reference"
          value={
            request.payment_reference ||
            "—"
          }
        />
      </div>

      {request.status ===
        "rejected" &&
        request.rejection_reason && (
          <div className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-xs text-red-700">
            {
              request.rejection_reason
            }
          </div>
        )}
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status:
    CardPurchaseRequest["status"];
}) {
  const config = {
    pending: {
      icon: Clock3,
      className:
        "bg-amber-100 text-amber-700",
    },

    approved: {
      icon: CheckCircle2,
      className:
        "bg-green-100 text-green-700",
    },

    rejected: {
      icon: XCircle,
      className:
        "bg-red-100 text-red-700",
    },

    cancelled: {
      icon: XCircle,
      className:
        "bg-gray-100 text-gray-600",
    },
  }[status];

  const Icon =
    config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${config.className}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#F7FAFC] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/35">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold capitalize">
        {value}
      </p>
    </div>
  );
}

function formatMoney(
  amount:
    | string
    | number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-GB",
    {
      style: "currency",
      currency,
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    },
  ).format(
    Number(amount) ||
      0,
  );
}