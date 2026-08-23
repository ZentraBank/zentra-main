"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
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
  PodDocumentType,
  UploadedPodDocument,
} from "@/types/next-of-kin";

export default function PodClaimDetailsPage() {
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
    error,
    setError,
  ] = useState("");

  const [
    responseMessage,
    setResponseMessage,
  ] = useState("");

  const [
    additionalDocuments,
    setAdditionalDocuments,
  ] =
    useState<
      UploadedPodDocument[]
    >([]);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const load =
    useCallback(
      async () => {
        if (!claimId) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          setClaim(
            await nextOfKinService.getMine(
              claimId,
            ),
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
    void load();
  }, [load]);

  const uploadAdditionalDocument =
    async (
      file: File,
    ) => {
      setUploading(true);
      setError("");
      setSuccessMessage("");

      try {
        const documentType:
          PodDocumentType =
          "additional_identity";

        const uploaded =
          await nextOfKinService.uploadDocument(
            file,
            documentType,
          );

        setAdditionalDocuments(
          (
            previous,
          ) => [
            ...previous,
            uploaded,
          ],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to upload supporting document.",
        );
      } finally {
        setUploading(false);
      }
    };

  const submitAdditionalInformation =
  
    async () => {
      if (
        !claimId ||
        !claim
      ) {
        return;
      }

      if (
        responseMessage
          .trim().length < 3
      ) {
        setError(
          "Please enter your response before submitting.",
        );

        return;
      }

      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      try {
        const updated =
          await nextOfKinService.submitAdditionalInformation(
            claimId,
            {
              message:
                responseMessage.trim(),

              documents:
                additionalDocuments.map(
                  (
                    document,
                  ) => ({
                    fileId:
                      document.fileId,

                    documentType:
                      document.documentType,
                  }),
                ),
            },
          );

        setClaim(
          updated,
        );

        setResponseMessage(
          "",
        );

        setAdditionalDocuments(
          [],
        );

        setSuccessMessage(
          "Your additional information has been submitted successfully.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit additional information.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-5 pb-10 pt-12">
      <section className="mx-auto w-full max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/nok/claims"
            className="absolute left-0 text-[#555]"
          >
            <ArrowLeft
              size={22}
            />
          </Link>

          <h1 className="text-[14px] font-bold text-[#444]">
            POD Claim Details
          </h1>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={loading}
            className="absolute right-0 grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm disabled:opacity-50"
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
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-5 flex items-start gap-2 rounded-[12px] bg-green-50 px-4 py-3 text-[12px] text-green-700">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>
              {
                successMessage
              }
            </span>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-[320px] place-items-center rounded-[18px] bg-white">
            <Loader2 className="animate-spin text-[#2458E8]" />
          </div>
        ) : claim ? (
          <div className="mt-8 space-y-4">
            <section className="overflow-hidden rounded-[20px] bg-white shadow-sm">
              <div className="border-b border-black/5 px-5 py-5">
                <p className="text-[10px] uppercase tracking-wider text-black/35">
                  Claim reference
                </p>

                <p className="mt-1 break-all text-[12px] font-bold text-[#2458E8]">
                  {
                    claim.id
                  }
                </p>
              </div>

              <div className="space-y-4 px-5 py-5">
                <Detail
                  label="Status"
                  value={claim.status.replaceAll(
                    "_",
                    " ",
                  )}
                />

                <Detail
                  label="Deceased"
                  value={
                    claim.deceased_name
                  }
                />

                <Detail
                  label="Account"
                  value={`•••• ${claim.deceased_account_number.slice(
                    -4,
                  )}`}
                />

                <Detail
                  label="Beneficiary"
                  value={
                    claim.beneficiary_name
                  }
                />

                <Detail
                  label="Relationship"
                  value={
                    claim.relationship_to_deceased
                  }
                />

                <Detail
                  label="Payment method"
                  value={claim.payment_method.replaceAll(
                    "_",
                    " ",
                  )}
                />

                <div>
                  <p className="text-[11px] font-semibold text-black/40">
                    Claim statement
                  </p>

                  <p className="mt-1 text-[12px] leading-5 text-[#333]">
                    {
                      claim.claim_statement
                    }
                  </p>
                </div>

                {claim.more_information_request && (
                  <div className="rounded-[12px] border border-orange-200 bg-orange-50 px-4 py-4">
                    <p className="text-[11px] font-bold text-orange-700">
                      More information required
                    </p>

                    <p className="mt-2 text-[12px] leading-5 text-orange-800">
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
                  </div>
                )}

                {claim.additional_information_response && (
                  <div className="rounded-[12px] border border-green-200 bg-green-50 px-4 py-4">
                    <p className="text-[11px] font-bold text-green-700">
                      Your response
                    </p>

                    <p className="mt-2 text-[12px] leading-5 text-green-800">
                      {
                        claim.additional_information_response
                      }
                    </p>

                    {claim.additional_information_responded_at && (
                      <p className="mt-3 text-[10px] text-green-700/60">
                        Submitted{" "}
                        {formatDate(
                          claim.additional_information_responded_at,
                        )}
                      </p>
                    )}
                  </div>
                )}

                {claim.rejection_reason && (
                  <div className="rounded-[12px] bg-red-50 px-4 py-3">
                    <p className="text-[11px] font-bold text-red-700">
                      Rejection reason
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-red-700">
                      {
                        claim.rejection_reason
                      }
                    </p>
                  </div>
                )}

                {claim.documents &&
                  claim.documents.length >
                    0 && (
                    <div>
                      <p className="mb-2 text-[11px] font-semibold text-black/40">
                        Submitted documents
                      </p>

                      <div className="space-y-2">
                        {claim.documents.map(
                          (
                            document,
                          ) => (
                            <div
                              key={
                                document.id
                              }
                              className="flex items-center gap-3 rounded-[10px] bg-[#F4F6F8] px-3 py-3"
                            >
                              <FileText
                                size={
                                  17
                                }
                                className="text-[#2458E8]"
                              />

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
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </section>

            {claim.status ===
              "more_information_required" && (
              <section className="rounded-[20px] bg-white px-5 py-5 shadow-sm">
                <h2 className="text-[15px] font-black text-[#222]">
                  Respond to request
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-black/45">
                  Provide the requested clarification and upload any supporting document if needed.
                </p>

                <textarea
                  value={
                    responseMessage
                  }
                  onChange={(
                    event,
                  ) =>
                    setResponseMessage(
                      event.target.value,
                    )
                  }
                  placeholder="Write your response..."
                  className="mt-4 h-[120px] w-full resize-none rounded-[12px] bg-[#F1F3F6] px-3 py-3 text-[12px] outline-none placeholder:text-black/25"
                />

                <div className="mt-4">
                  <input
                    id="additional-pod-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden"
                    disabled={
                      uploading ||
                      submitting
                    }
                    onChange={(
                      event,
                    ) => {
                      const file =
                        event.target
                          .files?.[0];

                      if (file) {
                        void uploadAdditionalDocument(
                          file,
                        );
                      }

                      event.target.value =
                        "";
                    }}
                  />

                  <label
                    htmlFor="additional-pod-file"
                    className={`flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#2458E8]/20 bg-[#EEF4FF] text-[12px] font-bold text-[#2458E8] ${
                      uploading ||
                      submitting
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2
                          size={
                            15
                          }
                          className="animate-spin"
                        />

                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload
                          size={
                            15
                          }
                        />

                        Add supporting document
                      </>
                    )}
                  </label>
                </div>

                {additionalDocuments.length >
                  0 && (
                  <div className="mt-4 space-y-2">
                    {additionalDocuments.map(
                      (
                        document,
                      ) => (
                        <div
                          key={
                            document.fileId
                          }
                          className="flex items-center gap-3 rounded-[10px] bg-green-50 px-3 py-3"
                        >
                          <CheckCircle2
                            size={
                              16
                            }
                            className="shrink-0 text-green-600"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-green-800">
                              {
                                document.originalName
                              }
                            </p>

                            <p className="mt-0.5 text-[9px] capitalize text-green-700/60">
                              {document.documentType.replaceAll(
                                "_",
                                " ",
                              )}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void submitAdditionalInformation()
                  }
                  disabled={
                    submitting ||
                    uploading
                  }
                  className="mt-5 flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#2458E8] text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? "Submitting..."
                    : "Submit additional information"}
                </button>
              </section>
            )}
          </div>
        ) : null}
      </section>
    </main>
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
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-black/40">
        {label}
      </span>

      <span className="max-w-[230px] text-right text-[12px] font-semibold capitalize text-[#333]">
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