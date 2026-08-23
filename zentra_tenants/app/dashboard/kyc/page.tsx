"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  kycService,
  type TenantKycApplication,
} from "@/services/kyc.service";

type Tab =
  | "submitted"
  | "under_review";

type RiskLevel =
  | "low"
  | "medium"
  | "high";

export default function TenantKycPage() {
  const [tab, setTab] =
    useState<Tab>("submitted");

  const [
    applications,
    setApplications,
  ] = useState<
    TenantKycApplication[]
  >([]);

  const [
    selected,
    setSelected,
  ] = useState<
    TenantKycApplication | null
  >(null);

  const [loading, setLoading] =
    useState(true);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [actionId, setActionId] =
    useState("");

  const [
    rejectionTarget,
    setRejectionTarget,
  ] = useState<
    TenantKycApplication | null
  >(null);

  const [
    reviewTarget,
    setReviewTarget,
  ] = useState<
    TenantKycApplication | null
  >(null);

  const [
    riskLevel,
    setRiskLevel,
  ] =
    useState<RiskLevel>("low");

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const result =
          await kycService.listApplications({
            status: tab,
            page: 1,
            pageSize: 100,
          });

        setApplications(
          result,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load KYC applications.",
        );
      } finally {
        setLoading(false);
      }
    }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredApplications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return applications;
      }

      return applications.filter(
        (application) => {
          return [
            application.customer_name,
            application.customer_email,
            application.first_name,
            application.middle_name,
            application.last_name,
            application.identity_number,
            application.country,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query),
            );
        },
      );
    }, [
      applications,
      search,
    ]);

  const openApplication =
    async (
      application:
        TenantKycApplication,
    ) => {
      setDetailsLoading(true);
      setError("");
      setMessage("");

      try {
        const details =
          await kycService.getApplication(
            application.id,
          );

        setSelected(
          details,
        );

        setRiskLevel(
          details.risk_level ??
            "low",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load KYC application.",
        );
      } finally {
        setDetailsLoading(false);
      }
    };

  const markUnderReview =
    async (
      application:
        TenantKycApplication,
    ) => {
      setActionId(
        application.id,
      );

      setError("");
      setMessage("");

      try {
        await kycService.reviewApplication(
          application.id,
          {
            status:
              "under_review",

            riskLevel,
          },
        );

        setMessage(
          "KYC application marked as under review.",
        );

        setSelected(null);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update KYC application.",
        );
      } finally {
        setActionId("");
      }
    };

  const approveApplication =
    async (
      application:
        TenantKycApplication,
    ) => {
      setActionId(
        application.id,
      );

      setError("");
      setMessage("");

      try {
        await kycService.reviewApplication(
          application.id,
          {
            status:
              "approved",

            riskLevel,
          },
        );

        setMessage(
          "KYC application approved.",
        );

        setReviewTarget(null);
        setSelected(null);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to approve KYC application.",
        );
      } finally {
        setActionId("");
      }
    };

  const rejectApplication =
    async (
      application:
        TenantKycApplication,
      reason: string,
    ) => {
      setActionId(
        application.id,
      );

      setError("");
      setMessage("");

      try {
        await kycService.reviewApplication(
          application.id,
          {
            status:
              "rejected",

            riskLevel,

            rejectionReason:
              reason,
          },
        );

        setMessage(
          "KYC application rejected.",
        );

        setRejectionTarget(null);
        setSelected(null);

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to reject KYC application.",
        );
      } finally {
        setActionId("");
      }
    };

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-4 pb-12 pt-10 text-[#2F3640] lg:px-8">
      <section className="mx-auto max-w-[1180px]">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft
                size={19}
              />
            </Link>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2458E8]">
                Compliance
              </p>

              <h1 className="mt-1 text-[26px] font-black tracking-[-0.02em] lg:text-[34px]">
                KYC Applications
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={loading}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#2458E8] shadow-sm disabled:opacity-50"
            aria-label="Refresh KYC applications"
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

        {(error ||
          message) && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              error
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error ||
              message}
          </div>
        )}

        <section className="mt-7 grid gap-5 lg:grid-cols-3">
          <SummaryCard
            label="Submitted"
            value={
              tab ===
              "submitted"
                ? applications.length
                : "—"
            }
            icon={
              <FileText
                size={20}
              />
            }
          />

          <SummaryCard
            label="Under review"
            value={
              tab ===
              "under_review"
                ? applications.length
                : "—"
            }
            icon={
              <ShieldCheck
                size={20}
              />
            }
          />

          <SummaryCard
            label="Current queue"
            value={
              applications.length
            }
            icon={
              <UserRoundCheck
                size={20}
              />
            }
          />
        </section>

        <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-2 rounded-xl bg-[#EEF2F6] p-1">
              <TabButton
                active={
                  tab ===
                  "submitted"
                }
                label="Submitted"
                onClick={() =>
                  setTab(
                    "submitted",
                  )
                }
              />

              <TabButton
                active={
                  tab ===
                  "under_review"
                }
                label="Under review"
                onClick={() =>
                  setTab(
                    "under_review",
                  )
                }
              />
            </div>

            <label className="relative block w-full lg:max-w-[320px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
              />

              <input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search applicant, email or ID"
                className="h-11 w-full rounded-xl border border-black/10 bg-[#F8FAFC] pl-10 pr-4 text-sm outline-none focus:border-[#2458E8]"
              />
            </label>
          </div>

          {loading ? (
            <div className="grid min-h-[360px] place-items-center">
              <div className="text-center">
                <Loader2
                  size={28}
                  className="mx-auto animate-spin text-[#2458E8]"
                />

                <p className="mt-3 text-sm text-black/40">
                  Loading KYC applications...
                </p>
              </div>
            </div>
          ) : filteredApplications.length ===
            0 ? (
            <EmptyState
              label={
                tab ===
                "submitted"
                  ? "No submitted KYC applications"
                  : "No applications under review"
              }
            />
          ) : (
            <div className="mt-6 space-y-3">
              {filteredApplications.map(
                (
                  application,
                ) => (
                  <ApplicationRow
                    key={
                      application.id
                    }
                    application={
                      application
                    }
                    onOpen={() =>
                      void openApplication(
                        application,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>
      </section>

      {(selected ||
        detailsLoading) && (
        <ApplicationOverlay
          application={
            selected
          }
          loading={
            detailsLoading
          }
          riskLevel={
            riskLevel
          }
          setRiskLevel={
            setRiskLevel
          }
          busy={
            Boolean(
              selected &&
                actionId ===
                  selected.id,
            )
          }
          onClose={() =>
            setSelected(
              null,
            )
          }
          onMarkUnderReview={() => {
            if (selected) {
              void markUnderReview(
                selected,
              );
            }
          }}
          onApprove={() => {
            if (selected) {
              setReviewTarget(
                selected,
              );
            }
          }}
          onReject={() => {
            if (selected) {
              setRejectionTarget(
                selected,
              );
            }
          }}
        />
      )}

      <ApproveOverlay
        application={
          reviewTarget
        }
        busy={
          Boolean(
            reviewTarget &&
              actionId ===
                reviewTarget.id,
          )
        }
        riskLevel={
          riskLevel
        }
        onClose={() =>
          setReviewTarget(
            null,
          )
        }
        onConfirm={() => {
          if (reviewTarget) {
            void approveApplication(
              reviewTarget,
            );
          }
        }}
      />

      <RejectOverlay
        application={
          rejectionTarget
        }
        busy={
          Boolean(
            rejectionTarget &&
              actionId ===
                rejectionTarget.id,
          )
        }
        onClose={() =>
          setRejectionTarget(
            null,
          )
        }
        onConfirm={(
          reason,
        ) => {
          if (rejectionTarget) {
            void rejectApplication(
              rejectionTarget,
              reason,
            );
          }
        }}
      />
    </main>
  );
}

function ApplicationRow({
  application,
  onOpen,
}: {
  application:
    TenantKycApplication;
  onOpen: () => void;
}) {
  const fullName =
    application.customer_name ||
    [
      application.first_name,
      application.middle_name,
      application.last_name,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <button
      type="button"
      onClick={
        onOpen
      }
      className="flex w-full items-center gap-4 rounded-2xl border border-black/[0.06] bg-[#FAFCFF] p-4 text-left transition hover:border-[#2458E8]/30 hover:bg-[#F6F9FF]"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EAF0FF] font-black text-[#2458E8]">
        {initials(
          fullName,
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-black">
            {fullName}
          </h2>

          <StatusBadge
            status={
              application.status
            }
          />
        </div>

        <p className="mt-1 truncate text-sm text-black/45">
          {application.customer_email ||
            application.phone_number}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-black/40">
          <span>
            {formatIdentityType(
              application.identity_type,
            )}
          </span>

          <span>
            {application.country}
          </span>

          {application.submitted_at && (
            <span>
              Submitted{" "}
              {formatDate(
                application.submitted_at,
              )}
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        size={19}
        className="shrink-0 text-black/30"
      />
    </button>
  );
}

function ApplicationOverlay({
  application,
  loading,
  riskLevel,
  setRiskLevel,
  busy,
  onClose,
  onMarkUnderReview,
  onApprove,
  onReject,
}: {
  application:
    TenantKycApplication | null;

  loading: boolean;

  riskLevel:
    RiskLevel;

  setRiskLevel: (
    value: RiskLevel,
  ) => void;

  busy: boolean;

  onClose: () => void;
  onMarkUnderReview: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/70 px-4 py-8">
      <div className="mx-auto w-full max-w-[900px] rounded-[28px] bg-[#F5F7FA] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] border-b border-black/5 bg-white px-5 py-4 lg:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2458E8]">
              KYC Review
            </p>

            <h2 className="mt-1 text-xl font-black">
              Application details
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="grid h-9 w-9 place-items-center rounded-full bg-[#EEF2F6]"
          >
            <XCircle
              size={18}
            />
          </button>
        </div>

        {loading ||
        !application ? (
          <div className="grid min-h-[420px] place-items-center">
            <Loader2 className="animate-spin text-[#2458E8]" />
          </div>
        ) : (
          <div className="space-y-5 p-5 lg:p-7">
            <section className="grid gap-4 lg:grid-cols-2">
              <InfoCard
                title="Personal information"
              >
                <InfoRow
                  label="Name"
                  value={
                    application.customer_name ||
                    [
                      application.first_name,
                      application.middle_name,
                      application.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                />

                <InfoRow
                  label="Email"
                  value={
                    application.customer_email ||
                    "—"
                  }
                />

                <InfoRow
                  label="Date of birth"
                  value={
                    formatDateOnly(
                      application.date_of_birth,
                    )
                  }
                />

                <InfoRow
                  label="Nationality"
                  value={
                    application.nationality
                  }
                />

                <InfoRow
                  label="Phone"
                  value={
                    application.phone_number
                  }
                />
              </InfoCard>

              <InfoCard
                title="Identity"
              >
                <InfoRow
                  label="ID type"
                  value={
                    formatIdentityType(
                      application.identity_type,
                    )
                  }
                />

                <InfoRow
                  label="ID number"
                  value={
                    application.identity_number
                  }
                />

                <InfoRow
                  label="Expiry"
                  value={
                    application.identity_expiry_date
                      ? formatDateOnly(
                          application.identity_expiry_date,
                        )
                      : "No expiry supplied"
                  }
                />

                <InfoRow
                  label="Status"
                  value={
                    application.status.replaceAll(
                      "_",
                      " ",
                    )
                  }
                />
              </InfoCard>
            </section>

            <InfoCard
              title="Residential address"
            >
              <InfoRow
                label="Address"
                value={
                  application.residential_address
                }
              />

              <InfoRow
                label="City"
                value={
                  application.city
                }
              />

              <InfoRow
                label="State / region"
                value={
                  application.state_region ||
                  "—"
                }
              />

              <InfoRow
                label="Postal code"
                value={
                  application.postal_code ||
                  "—"
                }
              />

              <InfoRow
                label="Country"
                value={
                  application.country
                }
              />
            </InfoCard>

            <InfoCard
              title="Uploaded documents"
            >
              {application.documents &&
              application.documents.length >
                0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {application.documents.map(
                    (
                      document,
                    ) => (
                      <DocumentCard
                        key={
                          document.id
                        }
                        document={
                          document
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-black/40">
                  No uploaded documents found.
                </p>
              )}
            </InfoCard>

            <InfoCard
              title="Risk assessment"
            >
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    "low",
                    "medium",
                    "high",
                  ] as const
                ).map(
                  (
                    value,
                  ) => (
                    <button
                      key={
                        value
                      }
                      type="button"
                      onClick={() =>
                        setRiskLevel(
                          value,
                        )
                      }
                      className={`h-10 rounded-xl text-sm font-bold capitalize ${
                        riskLevel ===
                        value
                          ? value ===
                            "low"
                            ? "bg-green-600 text-white"
                            : value ===
                                "medium"
                              ? "bg-amber-500 text-white"
                              : "bg-red-600 text-white"
                          : "bg-[#EEF2F6] text-black/55"
                      }`}
                    >
                      {value}
                    </button>
                  ),
                )}
              </div>
            </InfoCard>

            <div className="grid gap-3 sm:grid-cols-3">
              {application.status ===
                "submitted" && (
                <button
                  type="button"
                  onClick={
                    onMarkUnderReview
                  }
                  disabled={
                    busy
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-white disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <ShieldCheck
                      size={16}
                    />
                  )}

                  Mark under review
                </button>
              )}

              <button
                type="button"
                onClick={
                  onReject
                }
                disabled={
                  busy
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-50 font-bold text-red-700 disabled:opacity-50"
              >
                <XCircle
                  size={16}
                />
                Reject
              </button>

              <button
                type="button"
                onClick={
                  onApprove
                }
                disabled={
                  busy
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white disabled:opacity-50"
              >
                <CheckCircle2
                  size={16}
                />
                Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({
  document,
}: {
  document:
    NonNullable<
      TenantKycApplication["documents"]
    >[number];
}) {
  const isPdf =
    document.mime_type ===
    "application/pdf";

  return (
    <article className="rounded-2xl border border-black/[0.06] bg-[#FAFCFF] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF0FF] text-[#2458E8]">
          <FileText
            size={18}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black capitalize">
            {document.document_type.replaceAll(
              "_",
              " ",
            )}
          </p>

          <p className="mt-1 truncate text-xs text-black/40">
            {document.file_name ||
              "Uploaded document"}
          </p>
        </div>
      </div>

      <a
        href={
          document.file_url
        }
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex h-9 items-center justify-center rounded-xl bg-[#2458E8] text-xs font-bold text-white"
      >
        {isPdf
          ? "Open PDF"
          : "View document"}
      </a>
    </article>
  );
}

function ApproveOverlay({
  application,
  busy,
  riskLevel,
  onClose,
  onConfirm,
}: {
  application:
    TenantKycApplication | null;

  busy: boolean;

  riskLevel:
    RiskLevel;

  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!application) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-black/70 px-4">
      <section className="w-full max-w-md rounded-[24px] bg-white p-6">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2
            size={24}
          />
        </div>

        <h2 className="mt-4 text-xl font-black">
          Approve KYC?
        </h2>

        <p className="mt-2 text-sm leading-6 text-black/50">
          This customer will become KYC verified and restricted features can use the approved KYC status.
        </p>

        <div className="mt-4 rounded-xl bg-[#F7FAFC] p-3 text-sm">
          Risk level:{" "}
          <strong className="capitalize">
            {riskLevel}
          </strong>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="h-11 rounded-xl bg-[#EEF2F6] font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              busy
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white disabled:opacity-50"
          >
            {busy && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            Approve
          </button>
        </div>
      </section>
    </div>
  );
}

function RejectOverlay({
  application,
  busy,
  onClose,
  onConfirm,
}: {
  application:
    TenantKycApplication | null;

  busy: boolean;

  onClose: () => void;

  onConfirm: (
    reason: string,
  ) => void;
}) {
  const [
    reason,
    setReason,
  ] =
    useState("");

  useEffect(() => {
    if (!application) {
      setReason("");
    }
  }, [application]);

  if (!application) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-black/70 px-4">
      <section className="w-full max-w-md rounded-[24px] bg-white p-6">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <XCircle
            size={24}
          />
        </div>

        <h2 className="mt-4 text-xl font-black">
          Reject KYC
        </h2>

        <p className="mt-2 text-sm leading-6 text-black/50">
          Explain what the customer needs to correct before resubmitting.
        </p>

        <textarea
          value={
            reason
          }
          onChange={(
            event,
          ) =>
            setReason(
              event.target.value,
            )
          }
          maxLength={1000}
          placeholder="Reason for rejection"
          className="mt-5 min-h-[120px] w-full resize-none rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-red-400"
        />

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="h-11 rounded-xl bg-[#EEF2F6] font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              onConfirm(
                reason.trim(),
              )
            }
            disabled={
              busy ||
              reason.trim()
                .length ===
                0
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 font-bold text-white disabled:opacity-40"
          >
            {busy && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            Reject
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value:
    | string
    | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-black/45">
          {label}
        </span>

        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#EAF0FF] text-[#2458E8]">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-10 rounded-lg px-5 text-sm font-bold transition ${
        active
          ? "bg-white text-[#2458E8] shadow-sm"
          : "text-black/45"
      }`}
    >
      {label}
    </button>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-black">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </section>
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
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-black/40">
        {label}
      </span>

      <span className="text-right font-bold capitalize">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style =
    status ===
    "submitted"
      ? "bg-blue-50 text-blue-700"
      : status ===
          "under_review"
        ? "bg-amber-50 text-amber-700"
        : status ===
            "approved"
          ? "bg-green-50 text-green-700"
          : status ===
              "rejected"
            ? "bg-red-50 text-red-700"
            : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${style}`}
    >
      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function EmptyState({
  label,
}: {
  label: string;
}) {
  return (
    <div className="mt-6 grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-black/10 bg-[#FAFCFF] px-6 text-center">
      <div>
        <ShieldCheck
          size={36}
          className="mx-auto text-[#2458E8]/30"
        />

        <p className="mt-4 font-black">
          {label}
        </p>

        <p className="mt-2 text-sm text-black/40">
          New KYC activity will appear here.
        </p>
      </div>
    </div>
  );
}

function initials(
  value: string,
) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) =>
      item[0]?.toUpperCase(),
    )
    .join("");
}

function formatIdentityType(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDateOnly(
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
      dateStyle:
        "medium",
    },
  ).format(date);
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
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(date);
}