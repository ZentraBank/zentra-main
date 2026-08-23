"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
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
  PodClaimDocument,
  PodClaimStatus,
} from "@/types/next-of-kin.types";

export default function TenantPodClaimPage() {
  const { claimId } =
    useParams<{
      claimId: string;
    }>();

  const [
    claim,
    setClaim,
  ] =
    useState<PodClaim | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<
      PodClaimStatus | null
    >(null);

  const [
    fileLoading,
    setFileLoading,
  ] =
    useState<string | null>(
      null,
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    moreInformationRequest,
    setMoreInformationRequest,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load claim
  |--------------------------------------------------------------------------
  */

  const loadClaim =
    useCallback(
      async () => {
        if (!claimId) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const result =
            await nextOfKinService.getClaim(
              claimId,
            );

          setClaim(
            result,
          );

          setRejectionReason(
            result.rejection_reason ??
              "",
          );

          setMoreInformationRequest(
            "",
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this POD claim.",
          );
        } finally {
          setLoading(false);
        }
      },
      [claimId],
    );

  useEffect(() => {
    void loadClaim();
  }, [loadClaim]);

  /*
  |--------------------------------------------------------------------------
  | Update claim status
  |--------------------------------------------------------------------------
  */

  const updateStatus =
    async (
      status: PodClaimStatus,
    ) => {
      if (
        !claimId ||
        !claim
      ) {
        return;
      }

      if (
        status === "rejected" &&
        rejectionReason.trim().length <
          3
      ) {
        setError(
          "Enter a rejection reason before rejecting this claim.",
        );

        return;
      }

      if (
        status ===
          "more_information_required" &&
        moreInformationRequest.trim()
          .length < 3
      ) {
        setError(
          "Enter the additional information you need from the client.",
        );

        return;
      }

      setActionLoading(
        status,
      );

      setError("");

      try {
        const updated =
          await nextOfKinService.updateClaimStatus(
            claimId,
            {
              status,

              rejectionReason:
                status ===
                "rejected"
                  ? rejectionReason.trim()
                  : undefined,

              moreInformationRequest:
                status ===
                "more_information_required"
                  ? moreInformationRequest.trim()
                  : undefined,
            },
          );

        setClaim(
          updated,
        );

        if (
          status ===
          "more_information_required"
        ) {
          setMoreInformationRequest(
            "",
          );
        }

        if (
          status ===
          "rejected"
        ) {
          setRejectionReason(
            "",
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update the POD claim.",
        );
      } finally {
        setActionLoading(
          null,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Open private claim document
  |--------------------------------------------------------------------------
  */

  const openDocument =
    async (
      document:
        PodClaimDocument,
    ) => {
      if (!claimId) {
        return;
      }

      setFileLoading(
        document.file_id,
      );

      setError("");

      try {
        const blob =
          await nextOfKinService.getClaimFile(
            claimId,
            document.file_id,
          );

        const url =
          URL.createObjectURL(
            blob,
          );

        const newWindow =
          window.open(
            url,
            "_blank",
            "noopener,noreferrer",
          );

        if (!newWindow) {
          URL.revokeObjectURL(
            url,
          );

          throw new Error(
            "Your browser blocked the document window. Allow pop-ups and try again.",
          );
        }

        window.setTimeout(
          () => {
            URL.revokeObjectURL(
              url,
            );
          },
          60_000,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to open this document.",
        );
      } finally {
        setFileLoading(
          null,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-5 pb-10 pt-10 text-[#333]">
      <section className="mx-auto w-full max-w-[760px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/nok"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-[#555] transition hover:bg-black/5"
            aria-label="Back"
          >
            <ArrowLeft
              size={20}
            />
          </Link>

          <h1 className="text-[14px] font-bold tracking-[0.06em] text-[#444]">
            POD Claim Review
          </h1>

          <button
            type="button"
            onClick={() =>
              void loadClaim()
            }
            disabled={loading}
            className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-50"
            aria-label="Refresh claim"
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
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-[360px] place-items-center rounded-[20px] bg-white shadow-sm">
            <Loader2
              size={30}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : claim ? (
          <div className="mt-8 space-y-5">
            {/* Claim summary */}

            <section className="overflow-hidden rounded-[20px] bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 px-5 py-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
                    Claim reference
                  </p>

                  <p className="mt-1 break-all text-[12px] font-bold text-[#2458E8]">
                    {claim.id}
                  </p>
                </div>

                <StatusBadge
                  status={
                    claim.status
                  }
                />
              </div>

              <div className="grid gap-5 px-5 py-5 md:grid-cols-2">
                <DetailSection
                  title="Deceased account holder"
                >
                  <Detail
                    label="Full name"
                    value={
                      claim.deceased_name
                    }
                  />

                  <Detail
                    label="Date of birth"
                    value={formatOptionalDate(
                      claim.deceased_date_of_birth,
                    )}
                  />

                  <Detail
                    label="Identification number"
                    value={
                      claim.deceased_identification_number ||
                      "Not provided"
                    }
                  />

                  <Detail
                    label="Account number"
                    value={
                      claim.deceased_account_number
                    }
                  />
                </DetailSection>

                <DetailSection
                  title="Beneficiary / claimant"
                >
                  <Detail
                    label="Full name"
                    value={
                      claim.beneficiary_name
                    }
                  />

                  <Detail
                    label="Date of birth"
                    value={formatOptionalDate(
                      claim.beneficiary_date_of_birth,
                    )}
                  />

                  <Detail
                    label="Relationship"
                    value={
                      claim.relationship_to_deceased
                    }
                  />

                  <Detail
                    label="Contact details"
                    value={
                      claim.contact_details
                    }
                  />
                </DetailSection>

                <DetailSection
                  title="Identification"
                >
                  <Detail
                    label="ID type"
                    value={
                      claim.claimant_id_type
                        ? claim.claimant_id_type.replaceAll(
                            "_",
                            " ",
                          )
                        : "Not provided"
                    }
                  />

                  <Detail
                    label="ID number"
                    value={
                      claim.claimant_id_number ||
                      "Not provided"
                    }
                  />

                  <Detail
                    label="ID expiry"
                    value={formatOptionalDate(
                      claim.claimant_id_expiry_date,
                    )}
                  />
                </DetailSection>

                <DetailSection
                  title="Payment instructions"
                >
                  <Detail
                    label="Payment method"
                    value={
                      claim.payment_method.replaceAll(
                        "_",
                        " ",
                      )
                    }
                  />

                  <Detail
                    label="Signature date"
                    value={formatOptionalDate(
                      claim.signature_date,
                    )}
                  />
                </DetailSection>
              </div>
            </section>

            {/* Claim declaration */}

            <section className="rounded-[20px] bg-white px-5 py-5 shadow-sm">
              <h2 className="text-[14px] font-black text-[#333]">
                Claim declaration
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-black/65">
                {
                  claim.claim_statement
                }
              </p>
            </section>

            {/* Existing information request */}

            {claim.more_information_request && (
              <section className="rounded-[20px] border border-orange-200 bg-orange-50 px-5 py-5">
                <h2 className="text-[13px] font-black text-orange-700">
                  Information requested
                  from client
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-orange-800">
                  {
                    claim.more_information_request
                  }
                </p>

                {claim.more_information_requested_at && (
                  <p className="mt-3 text-[10px] text-orange-700/60">
                    Requested{" "}
                    {formatDate(
                      claim.more_information_requested_at,
                    )}
                  </p>
                )}
              </section>
            )}

            {/* Submitted documents */}

            <section className="rounded-[20px] bg-white px-5 py-5 shadow-sm">
              <h2 className="text-[14px] font-black text-[#333]">
                Submitted documents
              </h2>

              {claim.documents &&
              claim.documents.length >
                0 ? (
                <div className="mt-4 space-y-3">
                  {claim.documents.map(
                    (
                      document,
                    ) => (
                      <button
                        key={
                          document.id
                        }
                        type="button"
                        onClick={() =>
                          void openDocument(
                            document,
                          )
                        }
                        disabled={
                          fileLoading ===
                          document.file_id
                        }
                        className="flex w-full items-center justify-between gap-3 rounded-[12px] bg-[#F4F6F8] px-4 py-3 text-left transition hover:bg-[#EDF1F6] disabled:opacity-60"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#2458E8]/10 text-[#2458E8]">
                            {fileLoading ===
                            document.file_id ? (
                              <Loader2
                                size={
                                  17
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <FileText
                                size={
                                  17
                                }
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-[12px] font-bold capitalize text-[#333]">
                              {document.document_type.replaceAll(
                                "_",
                                " ",
                              )}
                            </p>

                            <p className="truncate text-[10px] text-black/40">
                              {
                                document.original_name
                              }
                            </p>
                          </div>
                        </div>

                        <ExternalLink
                          size={16}
                          className="shrink-0 text-black/35"
                        />
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-black/40">
                  No documents are
                  attached to this
                  claim.
                </p>
              )}
            </section>

            {/* Timeline */}

            <section className="rounded-[20px] bg-white px-5 py-5 shadow-sm">
              <h2 className="text-[14px] font-black text-[#333]">
                Claim timeline
              </h2>

              <div className="mt-4 space-y-3">
                <TimelineRow
                  label="Submitted"
                  value={
                    claim.submitted_at ??
                    claim.created_at
                  }
                />

                {claim.reviewed_at && (
                  <TimelineRow
                    label="Reviewed"
                    value={
                      claim.reviewed_at
                    }
                  />
                )}

                {claim.more_information_requested_at && (
                  <TimelineRow
                    label="More information requested"
                    value={
                      claim.more_information_requested_at
                    }
                  />
                )}

                {claim.approved_at && (
                  <TimelineRow
                    label="Approved"
                    value={
                      claim.approved_at
                    }
                  />
                )}

                {claim.completed_at && (
                  <TimelineRow
                    label="Completed"
                    value={
                      claim.completed_at
                    }
                  />
                )}
              </div>
            </section>

            {/* Rejection */}

            {claim.rejection_reason && (
              <section className="rounded-[20px] border border-red-100 bg-red-50 px-5 py-5">
                <h2 className="text-[13px] font-black text-red-700">
                  Rejection reason
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-red-700">
                  {
                    claim.rejection_reason
                  }
                </p>
              </section>
            )}

            {/* Review controls */}

            <ReviewActions
              claim={claim}
              loading={
                actionLoading
              }
              rejectionReason={
                rejectionReason
              }
              onRejectionReasonChange={
                setRejectionReason
              }
              moreInformationRequest={
                moreInformationRequest
              }
              onMoreInformationRequestChange={
                setMoreInformationRequest
              }
              onStatusChange={
                updateStatus
              }
            />
          </div>
        ) : (
          <div className="mt-8 rounded-[20px] bg-white px-5 py-10 text-center shadow-sm">
            <p className="text-[13px] text-black/45">
              POD claim not found.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Review actions
|--------------------------------------------------------------------------
*/

function ReviewActions({
  claim,
  loading,
  rejectionReason,
  onRejectionReasonChange,
  moreInformationRequest,
  onMoreInformationRequestChange,
  onStatusChange,
}: {
  claim: PodClaim;

  loading:
    | PodClaimStatus
    | null;

  rejectionReason: string;

  onRejectionReasonChange: (
    value: string,
  ) => void;

  moreInformationRequest: string;

  onMoreInformationRequestChange: (
    value: string,
  ) => void;

  onStatusChange: (
    status: PodClaimStatus,
  ) => Promise<void>;
}) {
  const canReview =
    claim.status ===
      "submitted" ||
    claim.status ===
      "more_information_required";

  const canRequestInfo =
    claim.status ===
      "submitted" ||
    claim.status ===
      "under_review";

  const canDecide =
    claim.status ===
      "submitted" ||
    claim.status ===
      "under_review" ||
    claim.status ===
      "more_information_required";

  const canComplete =
    claim.status ===
    "approved";

  const terminal =
    claim.status ===
      "rejected" ||
    claim.status ===
      "completed" ||
    claim.status ===
      "cancelled";

  if (terminal) {
    return (
      <section className="rounded-[20px] bg-white px-5 py-5 shadow-sm">
        <p className="text-center text-[12px] font-semibold text-black/45">
          This claim is in a
          terminal state and
          cannot be changed.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] bg-white px-5 py-5 shadow-sm">
      <h2 className="text-[14px] font-black text-[#333]">
        Review actions
      </h2>

      <p className="mt-1 text-[11px] leading-5 text-black/40">
        Update the claim only
        after reviewing the
        submitted information
        and documents.
      </p>

      {/* Request more information */}

      {canRequestInfo && (
        <div className="mt-5">
          <label className="text-[11px] font-bold text-black/45">
            Information required
            from client
          </label>

          <textarea
            value={
              moreInformationRequest
            }
            onChange={(event) =>
              onMoreInformationRequestChange(
                event.target.value,
              )
            }
            placeholder="Explain exactly what additional information or documents the client needs to provide..."
            className="mt-2 h-[110px] w-full resize-none rounded-[10px] bg-[#F1F3F6] px-3 py-3 text-[12px] outline-none placeholder:text-black/25 focus:ring-2 focus:ring-[#2458E8]/20"
          />

          <p className="mt-1 text-[10px] text-black/30">
            Be specific about what
            the client needs to
            provide before the
            claim can continue.
          </p>
        </div>
      )}

      {/* Rejection */}

      {canDecide && (
        <div className="mt-5">
          <label className="text-[11px] font-bold text-black/45">
            Rejection reason
          </label>

          <textarea
            value={
              rejectionReason
            }
            onChange={(event) =>
              onRejectionReasonChange(
                event.target.value,
              )
            }
            placeholder="Required only when rejecting the claim"
            className="mt-2 h-[100px] w-full resize-none rounded-[10px] bg-[#F1F3F6] px-3 py-3 text-[12px] outline-none placeholder:text-black/25 focus:ring-2 focus:ring-[#2458E8]/20"
          />
        </div>
      )}

      {/* Actions */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {canReview && (
          <ActionButton
            label="Start review"
            status="under_review"
            loading={
              loading ===
              "under_review"
            }
            disabled={
              loading !==
              null
            }
            onClick={
              onStatusChange
            }
          />
        )}

        {canRequestInfo && (
          <ActionButton
            label="Request more information"
            status="more_information_required"
            loading={
              loading ===
              "more_information_required"
            }
            disabled={
              loading !==
                null ||
              moreInformationRequest.trim()
                .length < 3
            }
            onClick={
              onStatusChange
            }
          />
        )}

        {canDecide && (
          <>
            <ActionButton
              label="Approve claim"
              status="approved"
              loading={
                loading ===
                "approved"
              }
              disabled={
                loading !==
                null
              }
              onClick={
                onStatusChange
              }
            />

            <ActionButton
              label="Reject claim"
              status="rejected"
              loading={
                loading ===
                "rejected"
              }
              disabled={
                loading !==
                  null ||
                rejectionReason.trim()
                  .length < 3
              }
              danger
              onClick={
                onStatusChange
              }
            />
          </>
        )}

        {canComplete && (
          <ActionButton
            label="Mark as completed"
            status="completed"
            loading={
              loading ===
              "completed"
            }
            disabled={
              loading !==
              null
            }
            onClick={
              onStatusChange
            }
          />
        )}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Action button
|--------------------------------------------------------------------------
*/

function ActionButton({
  label,
  status,
  loading,
  disabled,
  danger = false,
  onClick,
}: {
  label: string;
  status: PodClaimStatus;
  loading: boolean;
  disabled: boolean;
  danger?: boolean;

  onClick: (
    status: PodClaimStatus,
  ) => Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        void onClick(
          status,
        )
      }
      disabled={
        disabled
      }
      className={`flex h-[42px] items-center justify-center gap-2 rounded-[10px] px-4 text-[12px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "bg-red-600 hover:bg-red-700"
          : "bg-[#2458E8] hover:bg-[#1E4ED0]"
      }`}
    >
      {loading && (
        <Loader2
          size={15}
          className="animate-spin"
        />
      )}

      {label}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Detail section
|--------------------------------------------------------------------------
*/

function DetailSection({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] bg-[#F7F8FA] px-4 py-4">
      <h2 className="text-[12px] font-black uppercase tracking-[0.04em] text-black/50">
        {title}
      </h2>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-black/35">
        {label}
      </p>

      <p className="mt-1 break-words text-[12px] font-semibold capitalize leading-5 text-[#333]">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Timeline
|--------------------------------------------------------------------------
*/

function TimelineRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-3 last:border-0 last:pb-0">
      <span className="text-[11px] text-black/40">
        {label}
      </span>

      <span className="text-right text-[12px] font-semibold text-[#333]">
        {formatDate(
          value,
        )}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Status badge
|--------------------------------------------------------------------------
*/

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
      label:
        "Under review",
      className:
        "bg-blue-50 text-blue-700",
      icon: Clock3,
    },

    more_information_required: {
      label:
        "More info required",
      className:
        "bg-orange-50 text-orange-700",
      icon: Clock3,
    },

    approved: {
      label:
        "Approved",
      className:
        "bg-green-50 text-green-700",
      icon:
        CheckCircle2,
    },

    rejected: {
      label:
        "Rejected",
      className:
        "bg-red-50 text-red-700",
      icon:
        XCircle,
    },

    completed: {
      label:
        "Completed",
      className:
        "bg-green-50 text-green-700",
      icon:
        CheckCircle2,
    },

    cancelled: {
      label:
        "Cancelled",
      className:
        "bg-gray-100 text-gray-600",
      icon:
        XCircle,
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

/*
|--------------------------------------------------------------------------
| Date helpers
|--------------------------------------------------------------------------
*/

function formatOptionalDate(
  value:
    | string
    | null,
) {
  if (!value) {
    return "Not provided";
  }

  return formatDate(
    value,
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