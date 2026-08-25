"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  Gift,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  giftService,
} from "@/services/gift.service";

import type {
  Gift as GiftRecord,
  GiftStatus,
} from "@/types/gift.types";

type StatusFilter =
  | "all"
  | GiftStatus;

export default function GiftsPage() {
  const [
    gifts,
    setGifts,
  ] = useState<GiftRecord[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "all",
    );

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await giftService.listMine({
              page: 1,
              pageSize: 100,
            });

          setGifts(
            result.gifts ?? [],
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your gifts.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const filteredGifts =
    useMemo(() => {
      if (
        statusFilter ===
        "all"
      ) {
        return gifts;
      }

      return gifts.filter(
        (gift) =>
          gift.status ===
          statusFilter,
      );
    }, [
      gifts,
      statusFilter,
    ]);

  const pendingCount =
    gifts.filter(
      (gift) =>
        gift.status ===
        "pending",
    ).length;

  return (
    <main className="min-h-screen bg-[#FEF08A] px-5 pb-10 pt-12 text-[#454545]">
      <section className="mx-auto w-full max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/dashboard"
            className="absolute left-0 text-[#777]"
            aria-label="Back"
          >
            <ArrowLeft
              size={24}
            />
          </Link>

          <h1 className="font-heading text-[14px] font-bold tracking-[0.13em]">
            My Gifts
          </h1>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={loading}
            className="absolute right-0 grid h-9 w-9 place-items-center rounded-full bg-white/50 text-[#555] shadow-sm disabled:opacity-50"
            aria-label="Refresh gifts"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </header>

        <section className="mt-7 rounded-[20px] border border-black/5 bg-white/50 px-4 py-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#FFE041] text-[#1D4ED8] shadow-sm">
              <Gift
                size={23}
              />
            </div>

            <div>
              <p className="text-[18px] font-black text-[#333]">
                Gifted Funds
              </p>

              <p className="mt-1 text-[10px] leading-4 text-black/45">
                View gifts sent
                to you and respond
                before they expire.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <SummaryBox
              label="Total gifts"
              value={String(
                gifts.length,
              )}
            />

            <SummaryBox
              label="Awaiting response"
              value={String(
                pendingCount,
              )}
            />
          </div>
        </section>

        <div className="mt-5 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            <FilterButton
              active={
                statusFilter ===
                "all"
              }
              label="All"
              onClick={() =>
                setStatusFilter(
                  "all",
                )
              }
            />

            <FilterButton
              active={
                statusFilter ===
                "pending"
              }
              label="Pending"
              onClick={() =>
                setStatusFilter(
                  "pending",
                )
              }
            />

            <FilterButton
              active={
                statusFilter ===
                "accepted"
              }
              label="Accepted"
              onClick={() =>
                setStatusFilter(
                  "accepted",
                )
              }
            />

            <FilterButton
              active={
                statusFilter ===
                "redemption_pending_review"
              }
              label="Under Review"
              onClick={() =>
                setStatusFilter(
                  "redemption_pending_review",
                )
              }
            />

            <FilterButton
              active={
                statusFilter ===
                "processed"
              }
              label="Processed"
              onClick={() =>
                setStatusFilter(
                  "processed",
                )
              }
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[11px] font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid min-h-[300px] place-items-center rounded-[18px] bg-white/40">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-[#1D4ED8]"
              />

              <p className="mt-3 text-[11px] text-black/40">
                Loading gifts...
              </p>
            </div>
          </div>
        ) : filteredGifts.length ===
          0 ? (
          <div className="mt-6 grid min-h-[300px] place-items-center rounded-[18px] border border-dashed border-black/10 bg-white/35 px-5">
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#FFE041] text-[#1D4ED8]">
                <Gift
                  size={29}
                />
              </div>

              <p className="mt-4 text-[14px] font-black text-[#444]">
                No gifts found
              </p>

              <p className="mx-auto mt-2 max-w-[230px] text-[10px] leading-4 text-black/40">
                Gifts sent to
                your account will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredGifts.map(
              (gift) => (
                <GiftCard
                  key={
                    gift.id
                  }
                  gift={
                    gift
                  }
                />
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function GiftCard({
  gift,
}: {
  gift: GiftRecord;
}) {
  const countdown =
    useCountdown(
      gift.expires_at,
    );

  const effectiveStatus =
    gift.status ===
      "pending" &&
    countdown.expired
      ? "expired"
      : gift.status;

  return (
    <article className="overflow-hidden rounded-[18px] border border-black/5 bg-white/55 shadow-sm backdrop-blur-sm">
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
              Gift from
            </p>

            <p className="mt-1 truncate text-[15px] font-black text-[#444]">
              {
                gift.sender_name
              }
            </p>
          </div>

          <StatusBadge
            status={
              effectiveStatus
            }
          />
        </div>

        <div className="mt-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-black/30">
            Gift amount
          </p>

          <p className="mt-1 text-[30px] font-black tracking-[-0.04em] text-[#5daa7e]">
            {formatMoney(
              gift.amount,
              gift.currency,
            )}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniDetail
            label="Redemption fee"
            value={formatMoney(
              gift.redemption_fee,
              gift.currency,
            )}
          />

          <MiniDetail
            label="Account"
            value={
              gift.account_number
                ? `•••• ${gift.account_number.slice(
                    -4,
                  )}`
                : "—"
            }
          />
        </div>

        {gift.message && (
          <div className="mt-4 rounded-[12px] bg-white/60 px-3 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-black/30">
              Message
            </p>

            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-black/55">
              {gift.message}
            </p>
          </div>
        )}

        {gift.status ===
          "pending" && (
          <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-[#FFF8D8] px-3 py-3">
            <Clock3
              size={16}
              className={
                countdown.expired
                  ? "text-red-500"
                  : "text-[#1D4ED8]"
              }
            />

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-black/30">
                {countdown.expired
                  ? "Response window"
                  : "Time remaining"}
              </p>

              <p
                className={`mt-1 text-[11px] font-black tabular-nums ${
                  countdown.expired
                    ? "text-red-600"
                    : "text-[#1D4ED8]"
                }`}
              >
                {countdown.expired
                  ? "Expired"
                  : `${pad(
                      countdown.days,
                    )}d ${pad(
                      countdown.hours,
                    )}h ${pad(
                      countdown.minutes,
                    )}m ${pad(
                      countdown.seconds,
                    )}s`}
              </p>
            </div>
          </div>
        )}

        {gift.status ===
          "redemption_pending_review" && (
          <div className="mt-4 rounded-[12px] bg-blue-50 px-3 py-3 text-[10px] font-semibold text-blue-700">
            Your payment proof
            is awaiting review.
          </div>
        )}

        {gift.status ===
          "redemption_rejected" && (
          <div className="mt-4 rounded-[12px] bg-red-50 px-3 py-3 text-[10px] font-semibold text-red-700">
            Your payment proof
            was rejected. Open
            the gift to submit
            another receipt.
          </div>
        )}
      </div>

      <Link
        href={`/donations-gift/gifts/${encodeURIComponent(
          gift.id,
        )}`}
        className="flex h-[46px] items-center justify-center border-t border-black/5 bg-[#1D4ED8] text-[12px] font-bold text-white transition active:bg-[#173FC0]"
      >
        {actionLabel(
          effectiveStatus,
        )}
      </Link>
    </article>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-[36px] rounded-full px-4 text-[10px] font-bold transition ${
        active
          ? "bg-[#1D4ED8] text-white"
          : "border border-black/5 bg-white/50 text-black/50"
      }`}
    >
      {label}
    </button>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[12px] bg-white/60 px-3 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-black/30">
        {label}
      </p>

      <p className="mt-1 text-[19px] font-black text-[#333]">
        {value}
      </p>
    </div>
  );
}

function MiniDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[11px] bg-white/60 px-3 py-3">
      <p className="text-[9px] text-black/35">
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-bold text-[#444]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles:
    Record<
      string,
      string
    > = {
      pending:
        "bg-amber-50 text-amber-700",

      accepted:
        "bg-green-50 text-green-700",

      redemption_pending_review:
        "bg-blue-50 text-blue-700",

      redemption_rejected:
        "bg-red-50 text-red-700",

      processed:
        "bg-green-100 text-green-700",

      declined:
        "bg-red-50 text-red-700",

      cancelled:
        "bg-gray-100 text-gray-600",

      expired:
        "bg-red-50 text-red-700",
    };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${
        styles[status] ??
        "bg-gray-100 text-gray-600"
      }`}
    >
      {statusLabel(
        status,
      )}
    </span>
  );
}

function actionLabel(
  status: string,
) {
  switch (status) {
    case "pending":
      return "View & Respond";

    case "accepted":
      return "Continue Redemption";

    case "redemption_rejected":
      return "Resubmit Proof";

    case "redemption_pending_review":
      return "View Submission";

    case "processed":
      return "View Gift";

    default:
      return "View Gift";
  }
}

function statusLabel(
  status: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
      pending:
        "Pending",

      accepted:
        "Accepted",

      redemption_pending_review:
        "Under Review",

      redemption_rejected:
        "Proof Rejected",

      processed:
        "Processed",

      declined:
        "Declined",

      cancelled:
        "Cancelled",

      expired:
        "Expired",
    };

  return (
    labels[status] ??
    status.replaceAll(
      "_",
      " ",
    )
  );
}

function useCountdown(
  expiresAt:
    | string
    | null,
) {
  const [
    now,
    setNow,
  ] = useState(
    Date.now(),
  );

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setNow(
            Date.now(),
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, []);

  if (!expiresAt) {
    return {
      expired: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const difference =
    new Date(
      expiresAt,
    ).getTime() -
    now;

  if (
    difference <= 0
  ) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds =
    Math.floor(
      difference /
        1000,
    );

  return {
    expired: false,

    days:
      Math.floor(
        totalSeconds /
          86400,
      ),

    hours:
      Math.floor(
        (
          totalSeconds %
          86400
        ) /
          3600,
      ),

    minutes:
      Math.floor(
        (
          totalSeconds %
          3600
        ) /
          60,
      ),

    seconds:
      totalSeconds %
      60,
  };
}

function pad(
  value: number,
) {
  return String(
    value,
  ).padStart(
    2,
    "0",
  );
}

function formatMoney(
  amount:
    | string
    | number,
  currency: string,
) {
  const numeric =
    Number(amount);

  try {
    return new Intl.NumberFormat(
      "en",
      {
        style:
          "currency",
        currency,
        maximumFractionDigits:
          2,
      },
    ).format(
      numeric,
    );
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}