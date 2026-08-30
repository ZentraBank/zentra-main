"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";

import { ApiError } from "@/src/lib/api-error";
import {
  platformSubscriptionsService,
  type SubscriptionRequest,
  type SubscriptionRequestStatus,
} from "@/src/services/platform-subscriptions.service";

const dateFormatter =
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const moneyFormatter = (
  amount: number | string,
  currency: string
) => {
  const numericAmount =
    typeof amount === "string"
      ? Number(amount)
      : amount;

  try {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
      }
    ).format(
      Number.isFinite(numericAmount)
        ? numericAmount
        : 0
    );
  } catch {
    return `${currency} ${numericAmount}`;
  }
};

const formatFileSize = (
  bytes: number | null
) => {
  if (!bytes) {
    return null;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
};

const statusStyles: Record<
  SubscriptionRequestStatus,
  string
> = {
  pending_payment:
    "border-amber-400/20 bg-amber-400/10 text-amber-300",

  payment_submitted:
    "border-blue-400/20 bg-blue-400/10 text-blue-300",

  approved:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

  rejected:
    "border-red-400/20 bg-red-400/10 text-red-300",

  cancelled:
    "border-neutral-400/20 bg-neutral-400/10 text-neutral-300",
};

const statusLabels: Record<
  SubscriptionRequestStatus,
  string
> = {
  pending_payment:
    "Pending payment",

  payment_submitted:
    "Awaiting review",

  approved:
    "Approved",

  rejected:
    "Rejected",

  cancelled:
    "Cancelled",
};

export default function PaymentProofList() {
  const [requests, setRequests] =
    useState<SubscriptionRequest[]>([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      SubscriptionRequestStatus | ""
    >("payment_submitted");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [
    openingProofId,
    setOpeningProofId,
  ] = useState<string | null>(null);

  const [
    approvingId,
    setApprovingId,
  ] = useState<string | null>(null);

  const [
    rejectingRequest,
    setRejectingRequest,
  ] =
    useState<SubscriptionRequest | null>(
      null
    );

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    isRejecting,
    setIsRejecting,
  ] = useState(false);

  const loadRequests =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await platformSubscriptionsService.listRequests(
            {
              page,
              limit: 10,
              search:
                search.trim() ||
                undefined,
              status,
            }
          );

        setRequests(
          response.data || []
        );

        setTotalPages(
          response.meta?.totalPages ||
            1
        );
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load payment proofs."
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      page,
      search,
      status,
    ]);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadRequests();
      }, 250);

    return () =>
      window.clearTimeout(timer);
  }, [loadRequests]);

  const handleViewProof =
    async (
      request: SubscriptionRequest
    ) => {
      setOpeningProofId(
        request.id
      );

      setError(null);

      try {
        const blob =
          await platformSubscriptionsService.getPaymentProof(
            request.id
          );

        const url =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = url;

        link.target = "_blank";

        link.rel =
          "noopener noreferrer";

        link.click();

        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 60_000);
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to open the payment proof."
        );
      } finally {
        setOpeningProofId(null);
      }
    };

  const handleApprove =
    async (
      request: SubscriptionRequest
    ) => {
      if (
        request.status !==
        "payment_submitted"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Approve the payment submitted by ${request.tenant_name} for the ${request.plan_name} plan?`
        );

      if (!confirmed) {
        return;
      }

      setApprovingId(request.id);
      setError(null);
      setSuccess(null);

      try {
        await platformSubscriptionsService.approveRequest(
          request.id
        );

        setSuccess(
          `${request.tenant_name} has been approved and its subscription activated.`
        );

        await loadRequests();
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to approve the subscription request."
        );
      } finally {
        setApprovingId(null);
      }
    };

  const openRejectModal = (
    request: SubscriptionRequest
  ) => {
    setError(null);
    setSuccess(null);

    setRejectingRequest(
      request
    );

    setRejectionReason("");
  };

  const closeRejectModal = () => {
    if (isRejecting) {
      return;
    }

    setRejectingRequest(null);
    setRejectionReason("");
  };

  const handleReject =
    async () => {
      if (!rejectingRequest) {
        return;
      }

      const reason =
        rejectionReason.trim();

      if (reason.length < 3) {
        setError(
          "Please enter a rejection reason."
        );

        return;
      }

      setIsRejecting(true);
      setError(null);
      setSuccess(null);

      try {
        await platformSubscriptionsService.rejectRequest(
          rejectingRequest.id,
          reason
        );

        setSuccess(
          `${rejectingRequest.tenant_name}'s payment proof was rejected.`
        );

        setRejectingRequest(null);
        setRejectionReason("");

        await loadRequests();
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to reject the subscription request."
        );
      } finally {
        setIsRejecting(false);
      }
    };

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );

                setPage(1);
              }}
              placeholder="Search tenant, email, plan or payment reference"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm outline-none transition focus:border-white/30"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target
                  .value as
                  | SubscriptionRequestStatus
                  | ""
              );

              setPage(1);
            }}
            className="h-11 rounded-xl border border-white/10 bg-neutral-900 px-4 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">
              All statuses
            </option>

            <option value="payment_submitted">
              Awaiting review
            </option>

            <option value="pending_payment">
              Pending payment
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                  <th className="px-5 py-4">
                    Submitted by
                  </th>

                  <th className="px-5 py-4">
                    Tenant
                  </th>

                  <th className="px-5 py-4">
                    Plan
                  </th>

                  <th className="px-5 py-4">
                    Amount
                  </th>

                  <th className="px-5 py-4">
                    Submitted
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-neutral-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Loading payment proofs…
                      </div>
                    </td>
                  </tr>
                ) : requests.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center"
                    >
                      <p className="font-medium text-neutral-300">
                        No payment
                        proofs found.
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Submitted
                        payment evidence
                        will appear here
                        for review.
                      </p>
                    </td>
                  </tr>
                ) : (
                  requests.map(
                    (request) => {
                      const canReview =
                        request.status ===
                        "payment_submitted";

                      return (
                        <tr
                          key={
                            request.id
                          }
                          className="bg-black/10 transition hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium">
                              {
                                request.user_email
                              }
                            </p>

                            {request.payment_proof_original_name && (
                              <p className="mt-1 max-w-[220px] truncate text-xs text-neutral-500">
                                {
                                  request.payment_proof_original_name
                                }

                                {formatFileSize(
                                  request.payment_proof_size_bytes
                                )
                                  ? ` · ${formatFileSize(
                                      request.payment_proof_size_bytes
                                    )}`
                                  : ""}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium">
                              {
                                request.tenant_name
                              }
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {
                                request.tenant_slug
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium">
                              {
                                request.plan_name
                              }
                            </p>

                            <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                              {
                                request.plan_billing_interval
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-300">
                            {moneyFormatter(
                              request.plan_price,
                              request.plan_currency
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-400">
                            {dateFormatter.format(
                              new Date(
                                request.updated_at ||
                                  request.created_at
                              )
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                statusStyles[
                                  request
                                    .status
                                ]
                              }`}
                            >
                              {
                                statusLabels[
                                  request
                                    .status
                                ]
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {request.payment_proof_file_id && (
                                <button
                                  type="button"
                                  disabled={
                                    openingProofId ===
                                    request.id
                                  }
                                  onClick={() =>
                                    void handleViewProof(
                                      request
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {openingProofId ===
                                  request.id ? (
                                    <Loader2
                                      size={
                                        15
                                      }
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <ExternalLink
                                      size={
                                        15
                                      }
                                    />
                                  )}

                                  View proof
                                </button>
                              )}

                              {canReview && (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      approvingId ===
                                      request.id
                                    }
                                    onClick={() =>
                                      void handleApprove(
                                        request
                                      )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {approvingId ===
                                    request.id ? (
                                      <Loader2
                                        size={
                                          15
                                        }
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2
                                        size={
                                          15
                                        }
                                      />
                                    )}

                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openRejectModal(
                                        request
                                      )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                                  >
                                    <XCircle
                                      size={
                                        15
                                      }
                                    />

                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((value) =>
                Math.max(
                  1,
                  value - 1
                )
              )
            }
            className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <p className="text-sm text-neutral-500">
            Page {page} of{" "}
            {totalPages}
          </p>

          <button
            type="button"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage((value) =>
                Math.min(
                  totalPages,
                  value + 1
                )
              )
            }
            className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>

      {rejectingRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#10182b] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">
              Reject payment proof
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              You are rejecting the
              payment submitted by{" "}
              <span className="font-medium text-white">
                {
                  rejectingRequest.tenant_name
                }
              </span>{" "}
              for the{" "}
              <span className="font-medium text-white">
                {
                  rejectingRequest.plan_name
                }
              </span>{" "}
              plan.
            </p>

            <label className="mt-6 block">
              <span className="text-sm font-medium text-neutral-300">
                Reason for rejection
              </span>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(
                  event
                ) =>
                  setRejectionReason(
                    event.target
                      .value
                  )
                }
                rows={5}
                maxLength={500}
                placeholder="For example: payment amount could not be verified."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={
                  isRejecting
                }
                onClick={
                  closeRejectModal
                }
                className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-neutral-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isRejecting ||
                  rejectionReason.trim()
                    .length < 3
                }
                onClick={() =>
                  void handleReject()
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRejecting && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                Reject payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}