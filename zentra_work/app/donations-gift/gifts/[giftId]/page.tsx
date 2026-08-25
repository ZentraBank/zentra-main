"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Gift,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  giftService,
} from "@/services/gift.service";

import type {
  RedemptionProof,
} from "@/services/gift.service";

import type {
  Gift as GiftRecord,
} from "@/types/gift.types";

type PaymentMethod =
  | "bank_transfer"
  | "card"
  | "cash_deposit"
  | "other";

export default function GiftedFundsPage() {
  const { giftId } =
    useParams<{
      giftId: string;
    }>();

  const [
    gift,
    setGift,
  ] =
    useState<GiftRecord | null>(
      null,
    );

  const [
    proof,
    setProof,
  ] =
    useState<RedemptionProof | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deciding,
    setDeciding,
  ] = useState<
    | "accepted"
    | "declined"
    | null
  >(null);

  const [
    proofFile,
    setProofFile,
  ] = useState<File | null>(
    null,
  );

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "bank_transfer",
    );

  const [
    proofNote,
    setProofNote,
  ] = useState("");

  const [
    submittingProof,
    setSubmittingProof,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load gift
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        if (!giftId) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const giftResult =
            await giftService.getMine(
              giftId,
            );

          setGift(
            giftResult,
          );

          const proofStatuses = [
            "redemption_pending_review",
            "redemption_rejected",
            "processed",
          ];

          if (
            proofStatuses.includes(
              giftResult.status,
            )
          ) {
            try {
              const proofResult =
                await giftService.getMyRedemptionProof(
                  giftId,
                );

              setProof(
                proofResult,
              );
            } catch {
              setProof(
                null,
              );
            }
          } else {
            setProof(
              null,
            );
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this gift.",
          );
        } finally {
          setLoading(false);
        }
      },
      [giftId],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const countdown =
    useCountdown(
      gift?.expires_at ??
        null,
    );

  /*
  |--------------------------------------------------------------------------
  | Accept / decline
  |--------------------------------------------------------------------------
  */

  const decide =
    async (
      decision:
        | "accepted"
        | "declined",
    ) => {
      if (
        !giftId ||
        !gift ||
        gift.status !==
          "pending" ||
        countdown.expired
      ) {
        return;
      }

      if (
        decision ===
        "declined"
      ) {
        const confirmed =
          window.confirm(
            "Are you sure you want to decline this gift?",
          );

        if (!confirmed) {
          return;
        }
      }

      setDeciding(
        decision,
      );

      setError("");

      try {
        const updated =
          await giftService.decide(
            giftId,
            decision,
          );

        setGift(
          updated,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update this gift.",
        );
      } finally {
        setDeciding(
          null,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Submit redemption proof
  |--------------------------------------------------------------------------
  */

  const submitProof =
    async () => {
      if (
        !giftId ||
        !gift
      ) {
        return;
      }

      if (!proofFile) {
        setError(
          "Select a payment receipt first.",
        );

        return;
      }

      setSubmittingProof(
        true,
      );

      setError("");

      try {
        const uploaded =
          await giftService.uploadRedemptionProofFile(
            giftId,
            proofFile,
          );

        const result =
          await giftService.submitRedemptionProof(
            giftId,
            {
              fileId:
                uploaded.fileId,

              amountPaid:
                Number(
                  gift.redemption_fee,
                ),

              paymentReference:
                paymentReference.trim() ||
                undefined,

              paymentMethod,

              note:
                proofNote.trim() ||
                undefined,
            },
          );

        setGift(
          result.gift,
        );

        setProof(
          result.proof,
        );

        setProofFile(
          null,
        );

        setPaymentReference(
          "",
        );

        setProofNote(
          "",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit redemption proof.",
        );
      } finally {
        setSubmittingProof(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FEF08A]">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#1D4ED8]"
          />

          <p className="mt-3 text-[11px] font-semibold text-black/40">
            Loading gift...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Missing gift
  |--------------------------------------------------------------------------
  */

  if (!gift) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FEF08A] px-5">
        <div className="text-center">
          <XCircle
            size={38}
            className="mx-auto text-red-500"
          />

          <p className="mt-4 text-[14px] font-black text-red-600">
            {error ||
              "Gift not found."}
          </p>

          <Link
            href="/donations-gift/gifts"
            className="mt-5 inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#1D4ED8] px-5 text-[12px] font-bold text-white"
          >
            Go back
          </Link>
        </div>
      </main>
    );
  }

  const effectiveStatus =
    countdown.expired &&
    gift.status ===
      "pending"
      ? "expired"
      : gift.status;

  const actionable =
    gift.status ===
      "pending" &&
    !countdown.expired;

  const canSubmitProof =
    gift.status ===
      "accepted" ||
    gift.status ===
      "redemption_rejected";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FEF08A] text-[#454545]">
      <section className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-8 pt-12">
        {/* Header */}

        <header className="relative flex items-center justify-center">
          <Link
            href="/donations-gift/gifts"
            className="absolute left-0 text-[#777]"
            aria-label="Back"
          >
            <ArrowLeft
              size={24}
            />
          </Link>

          <h1 className="font-heading text-[14px] font-bold tracking-[0.13em]">
            Gift Received
          </h1>
        </header>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[11px] font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Gift visual */}

        <div className="relative mt-6 flex flex-col items-center">
          <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#FFE041] shadow-[0_8px_18px_rgba(0,0,0,0.2)]">
            <Gift
              size={62}
              className="text-blue-700"
            />
          </div>

          <h2 className="mt-5 text-[35px] font-semibold tracking-[0.03em] text-[#5daa7e]">
            {formatMoney(
              gift.amount,
              gift.currency,
            )}
          </h2>

          <p className="mt-1 text-[13px] font-bold text-[#1D4ED8]">
            {statusText(
              effectiveStatus,
            )}
          </p>

          {gift.status ===
            "pending" && (
            <Countdown
              countdown={
                countdown
              }
            />
          )}

          <div className="mt-6 text-center">
            <p className="text-[13px] font-medium text-[#777]">
              Incoming from{" "}
              <ArrowDownLeft
                size={14}
                className="ml-1 inline-block text-[#168d5a]"
              />
            </p>

            <p className="mt-1 text-[17px] font-bold text-[#555]">
              {
                gift.sender_name
              }
            </p>
          </div>
        </div>

        {/* Gift message */}

        {gift.message && (
          <div className="mt-6 rounded-[15px] border border-black/5 bg-white/45 px-4 py-4 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.08em] text-black/30">
              Message from sender
            </p>

            <p className="mt-2 text-[12px] leading-5 text-[#555]">
              {gift.message}
            </p>
          </div>
        )}

        {/* Receipt */}

        <div className="mt-6 space-y-3">
          <Detail
            label="Gift amount"
            value={formatMoney(
              gift.amount,
              gift.currency,
            )}
            valueClassName="font-bold text-[#168d5a]"
          />

          <Detail
            label="Tier-2 Redemption fee"
            value={formatMoney(
              gift.redemption_fee,
              gift.currency,
            )}
            valueClassName="font-bold text-[#d85b4f]"
          />

          <Detail
            label="You will receive"
            value={formatMoney(
              gift.amount,
              gift.currency,
            )}
            valueClassName="font-bold text-[#168d5a]"
          />

          <Detail
            label="Account"
            value={
              gift.account_number
                ? `•••• ${gift.account_number.slice(
                    -4,
                  )}`
                : "—"
            }
          />

          <Detail
            label="Date received"
            value={formatDate(
              gift.created_at,
            )}
          />

          <Detail
            label="Status"
            value={effectiveStatus.replaceAll(
              "_",
              " ",
            )}
            valueClassName="font-bold capitalize text-[#1D4ED8]"
          />

          <Detail
            label="Transaction ID"
            value={
              gift.transaction_id ||
              "Pending"
            }
          />

          <Detail
            label="Type"
            value="Gifted Funds"
          />

          <Detail
            label="Expires"
            value={
              gift.expires_at
                ? formatDateTime(
                    gift.expires_at,
                  )
                : "—"
            }
          />
        </div>

        {/* Pending decision */}

        {actionable && (
          <div className="mt-8 grid gap-3">
            <button
              type="button"
              disabled={
                deciding !==
                null
              }
              onClick={() =>
                void decide(
                  "accepted",
                )
              }
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#1D4ED8] text-[15px] font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              {deciding ===
              "accepted" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2
                  size={17}
                />
              )}

              Accept Gift
            </button>

            <button
              type="button"
              disabled={
                deciding !==
                null
              }
              onClick={() =>
                void decide(
                  "declined",
                )
              }
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-red-300 bg-white/40 text-[14px] font-bold text-red-600 disabled:opacity-50"
            >
              {deciding ===
              "declined" ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <XCircle
                  size={16}
                />
              )}

              Decline Gift
            </button>
          </div>
        )}

        {/* Accepted / rejected -> payment proof */}

        {canSubmitProof && (
          <>
            {gift.status ===
              "redemption_rejected" &&
              proof
                ?.rejection_reason && (
                <div className="mt-7 rounded-[14px] border border-red-200 bg-red-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                      <p className="text-[11px] font-black text-red-700">
                        Payment proof
                        rejected
                      </p>

                      <p className="mt-2 text-[12px] leading-5 text-red-700">
                        {
                          proof.rejection_reason
                        }
                      </p>

                      <p className="mt-2 text-[10px] text-red-600/70">
                        Upload a new
                        proof below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <RedemptionProofForm
              gift={gift}
              proofFile={
                proofFile
              }
              paymentReference={
                paymentReference
              }
              paymentMethod={
                paymentMethod
              }
              proofNote={
                proofNote
              }
              submitting={
                submittingProof
              }
              onFileChange={
                setProofFile
              }
              onReferenceChange={
                setPaymentReference
              }
              onPaymentMethodChange={
                setPaymentMethod
              }
              onNoteChange={
                setProofNote
              }
              onSubmit={() =>
                void submitProof()
              }
            />
          </>
        )}

        {/* Awaiting tenant review */}

        {gift.status ===
          "redemption_pending_review" &&
          proof && (
            <ProofStatusCard
              proof={
                proof
              }
              currency={
                gift.currency
              }
            />
          )}

        {/* Processed */}

        {gift.status ===
          "processed" && (
          <div className="mt-8 rounded-[16px] border border-green-200 bg-green-50 px-4 py-5 text-center">
            <CheckCircle2
              size={30}
              className="mx-auto text-green-600"
            />

            <p className="mt-3 text-[15px] font-black text-green-700">
              Redemption
              approved
            </p>

            <p className="mt-2 text-[11px] leading-5 text-green-700/70">
              Your redemption
              payment proof has
              been approved.
            </p>
          </div>
        )}

        {/* Other final states */}

        {[
          "declined",
          "cancelled",
          "expired",
        ].includes(
          effectiveStatus,
        ) && (
          <DecisionState
            status={
              effectiveStatus
            }
          />
        )}
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Redemption proof form
|--------------------------------------------------------------------------
*/

function RedemptionProofForm({
  gift,
  proofFile,
  paymentReference,
  paymentMethod,
  proofNote,
  submitting,
  onFileChange,
  onReferenceChange,
  onPaymentMethodChange,
  onNoteChange,
  onSubmit,
}: {
  gift: GiftRecord;

  proofFile:
    | File
    | null;

  paymentReference: string;

  paymentMethod:
    PaymentMethod;

  proofNote: string;

  submitting: boolean;

  onFileChange: (
    file: File | null,
  ) => void;

  onReferenceChange: (
    value: string,
  ) => void;

  onPaymentMethodChange: (
    value: PaymentMethod,
  ) => void;

  onNoteChange: (
    value: string,
  ) => void;

  onSubmit: () => void;
}) {
  return (
    <div className="mt-8 rounded-[18px] border border-black/5 bg-white/65 px-4 py-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#EEF4FF] text-[#1D4ED8]">
          <Upload
            size={18}
          />
        </div>

        <div>
          <h3 className="text-[15px] font-black text-[#333]">
            Redemption Payment
          </h3>

          <p className="mt-1 text-[10px] leading-4 text-black/45">
            Pay the redemption
            fee and submit your
            payment receipt for
            review.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[13px] bg-[#FFF8D8] px-4 py-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-black/35">
          Redemption fee
        </p>

        <p className="mt-1 text-[25px] font-black text-[#d85b4f]">
          {formatMoney(
            gift.redemption_fee,
            gift.currency,
          )}
        </p>

        <p className="mt-2 text-[10px] leading-4 text-black/40">
          Your full gift
          remains{" "}
          <strong>
            {formatMoney(
              gift.amount,
              gift.currency,
            )}
          </strong>
          . The redemption fee
          is handled separately.
        </p>
      </div>

      <div className="mt-5">
        <label className="text-[11px] font-bold text-black/55">
          Payment method
        </label>

        <select
          value={
            paymentMethod
          }
          onChange={(
            event,
          ) =>
            onPaymentMethodChange(
              event.target
                .value as PaymentMethod,
            )
          }
          className="mt-2 h-[46px] w-full rounded-[10px] border border-black/10 bg-white px-3 text-[12px] font-semibold outline-none"
        >
          <option value="bank_transfer">
            Bank transfer
          </option>

          <option value="card">
            Card
          </option>

          <option value="cash_deposit">
            Cash deposit
          </option>

          <option value="other">
            Other
          </option>
        </select>
      </div>

      <div className="mt-4">
        <label className="text-[11px] font-bold text-black/55">
          Payment reference
        </label>

        <input
          value={
            paymentReference
          }
          onChange={(
            event,
          ) =>
            onReferenceChange(
              event.target.value,
            )
          }
          placeholder="Optional payment reference"
          maxLength={180}
          className="mt-2 h-[46px] w-full rounded-[10px] border border-black/10 bg-white px-3 text-[12px] outline-none"
        />
      </div>

      <div className="mt-4">
        <label className="text-[11px] font-bold text-black/55">
          Payment receipt
        </label>

        <label className="mt-2 flex min-h-[100px] cursor-pointer items-center justify-center rounded-[12px] border border-dashed border-[#1D4ED8]/30 bg-[#EEF4FF]/60 px-4 text-center transition hover:bg-[#E6EEFF]">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={(
              event,
            ) =>
              onFileChange(
                event.target
                  .files?.[0] ??
                  null,
              )
            }
          />

          {proofFile ? (
            <div>
              <FileText
                size={22}
                className="mx-auto text-[#1D4ED8]"
              />

              <p className="mt-2 break-all text-[11px] font-black text-[#1D4ED8]">
                {
                  proofFile.name
                }
              </p>

              <p className="mt-1 text-[9px] text-black/40">
                {formatFileSize(
                  proofFile.size,
                )}
                {" · "}
                Click to replace
              </p>
            </div>
          ) : (
            <div>
              <Upload
                size={22}
                className="mx-auto text-[#1D4ED8]"
              />

              <p className="mt-2 text-[11px] font-bold text-[#1D4ED8]">
                Upload payment
                receipt
              </p>

              <p className="mt-1 text-[9px] text-black/40">
                JPG, PNG, WEBP
                or PDF
              </p>
            </div>
          )}
        </label>
      </div>

      <div className="mt-4">
        <label className="text-[11px] font-bold text-black/55">
          Note
        </label>

        <textarea
          value={
            proofNote
          }
          onChange={(
            event,
          ) =>
            onNoteChange(
              event.target.value,
            )
          }
          maxLength={1000}
          placeholder="Optional note about your payment"
          className="mt-2 h-[90px] w-full resize-none rounded-[10px] border border-black/10 bg-white px-3 py-3 text-[12px] outline-none"
        />

        <p className="mt-1 text-right text-[9px] text-black/30">
          {
            proofNote.length
          }
          /1000
        </p>
      </div>

      <button
        type="button"
        disabled={
          submitting ||
          !proofFile
        }
        onClick={
          onSubmit
        }
        className="mt-5 flex h-[45px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#1D4ED8] text-[13px] font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Submitting...
          </>
        ) : (
          <>
            <Upload
              size={16}
            />

            Submit Payment Proof
          </>
        )}
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Submitted proof
|--------------------------------------------------------------------------
*/

function ProofStatusCard({
  proof,
  currency,
}: {
  proof: RedemptionProof;
  currency: string;
}) {
  return (
    <div className="mt-8 rounded-[16px] border border-blue-200 bg-blue-50 px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
          <FileText
            size={18}
          />
        </div>

        <div>
          <p className="text-[13px] font-black text-blue-700">
            Payment proof
            submitted
          </p>

          <p className="mt-1 text-[10px] leading-4 text-blue-700/70">
            Your receipt is
            waiting for review.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Detail
          label="Amount paid"
          value={formatMoney(
            proof.amount_paid,
            currency,
          )}
        />

        <Detail
          label="Payment method"
          value={
            proof.payment_method
              ?.replaceAll(
                "_",
                " ",
              ) ||
            "—"
          }
          valueClassName="capitalize"
        />

        <Detail
          label="Payment reference"
          value={
            proof.payment_reference ||
            "—"
          }
        />

        <Detail
          label="Receipt"
          value={
            proof.original_name ||
            "Uploaded receipt"
          }
        />

        <Detail
          label="Status"
          value={
            proof.status
          }
          valueClassName="font-bold capitalize text-blue-700"
        />

        <Detail
          label="Submitted"
          value={
            proof.submitted_at
              ? formatDateTime(
                  proof.submitted_at,
                )
              : "—"
          }
        />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Countdown
|--------------------------------------------------------------------------
*/

function Countdown({
  countdown,
}: {
  countdown: {
    expired: boolean;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}) {
  if (
    countdown.expired
  ) {
    return (
      <div className="mt-7 rounded-[10px] bg-red-50 px-4 py-3 text-center">
        <p className="text-[12px] font-black text-red-600">
          Gift expired
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-[#222]">
      <Time
        value={
          countdown.days
        }
        label="Days"
      />

      <TimeSeparator />

      <Time
        value={
          countdown.hours
        }
        label="Hrs"
      />

      <TimeSeparator />

      <Time
        value={
          countdown.minutes
        }
        label="Min"
      />

      <TimeSeparator />

      <Time
        value={
          countdown.seconds
        }
        label="Sec"
      />
    </div>
  );
}

function Time({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-[50px] text-center">
      <p className="text-[17px] font-black tabular-nums">
        {String(
          value,
        ).padStart(
          2,
          "0",
        )}
      </p>

      <p className="mt-1 text-[9px] font-semibold text-black/45">
        {label}
      </p>
    </div>
  );
}

function TimeSeparator() {
  return (
    <span className="pb-4 text-[15px] font-black text-black/25">
      :
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

function DecisionState({
  status,
}: {
  status: string;
}) {
  const config:
    Record<
      string,
      {
        title: string;
        message: string;
        className: string;
      }
    > = {
      declined: {
        title:
          "Gift Declined",

        message:
          "You declined this gift.",

        className:
          "border-red-200 bg-red-50 text-red-700",
      },

      cancelled: {
        title:
          "Gift Cancelled",

        message:
          "This gift was cancelled by the sender.",

        className:
          "border-gray-200 bg-gray-100 text-gray-600",
      },

      expired: {
        title:
          "Gift Expired",

        message:
          "The response deadline for this gift has passed.",

        className:
          "border-red-200 bg-red-50 text-red-700",
      },
    };

  const current =
    config[status];

  if (!current) {
    return null;
  }

  return (
    <div
      className={`mt-8 rounded-[14px] border px-4 py-4 text-center ${current.className}`}
    >
      <p className="text-[13px] font-black">
        {current.title}
      </p>

      <p className="mt-1 text-[10px] opacity-70">
        {current.message}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

function Detail({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 text-[13px]">
      <p className="shrink-0 text-[#777]">
        {label}
      </p>

      <p
        className={`max-w-[230px] break-words text-right font-medium text-[#444] ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Countdown hook
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function statusText(
  status: string,
) {
  const labels:
    Record<string, string> =
    {
      pending:
        "Gift Received!",

      accepted:
        "Gift Accepted!",

      declined:
        "Gift Declined",

      redemption_pending_review:
        "Payment Under Review",

      redemption_rejected:
        "Payment Proof Rejected",

      processed:
        "Gift Processed",

      cancelled:
        "Gift Cancelled",

      expired:
        "Gift Expired",
    };

  return (
    labels[status] ||
    status.replaceAll(
      "_",
      " ",
    )
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
    },
  ).format(date);
}

function formatDateTime(
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

function formatFileSize(
  size: number,
) {
  if (
    size <
    1024
  ) {
    return `${size} B`;
  }

  if (
    size <
    1024 * 1024
  ) {
    return `${(
      size /
      1024
    ).toFixed(
      1,
    )} KB`;
  }

  return `${(
    size /
    1024 /
    1024
  ).toFixed(
    1,
  )} MB`;
}