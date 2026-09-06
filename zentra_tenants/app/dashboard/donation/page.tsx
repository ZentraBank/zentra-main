"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Ban,
  Check,
  Clock3,
  Edit2,
  Gift,
  HandCoins,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AppShell from "@/components/layout/AppShell";
import {
  donationService,
  type TenantDonor,
  type TenantDonationRequest,
  type TenantDonationRedemption,
} from "@/services/donation.service";

import { resolveMediaUrl } from "@/lib/media";

import {
  getApiErrorMessage,
} from "@/lib/api";

type MainTab =
  | "donors"
  | "requests"
  | "redemptions";

type DonorFilter =
  | "all"
  | "active"
  | "inactive"
  | "blocked";

type RequestFilter =
  | "pending"
  | "approved"
  | "rejected"
  | "funded"
  | "redeemed";

type RedemptionFilter =
  | "pending_otp"
  | "approved"
  | "completed";

export default function DonationManagementPage() {
  const [
    mainTab,
    setMainTab,
  ] =
    useState<MainTab>(
      "donors",
    );

  const [
    donors,
    setDonors,
  ] =
    useState<TenantDonor[]>(
      [],
    );

  const [
    requests,
    setRequests,
  ] =
    useState<
      TenantDonationRequest[]
    >([]);

  const [
    redemptions,
    setRedemptions,
  ] =
    useState<
      TenantDonationRedemption[]
    >([]);

  const [
    donorFilter,
    setDonorFilter,
  ] =
    useState<DonorFilter>(
      "all",
    );

  const [
    requestFilter,
    setRequestFilter,
  ] =
    useState<RequestFilter>(
      "pending",
    );

  const [
    redemptionFilter,
    setRedemptionFilter,
  ] =
    useState<RedemptionFilter>(
      "approved",
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionId,
    setActionId,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    selectedRequest,
    setSelectedRequest,
  ] =
    useState<
      TenantDonationRequest | null
    >(null);

  const [
    rejectionRequest,
    setRejectionRequest,
  ] =
    useState<
      TenantDonationRequest | null
    >(null);

  const [
    redemptionToComplete,
    setRedemptionToComplete,
  ] =
    useState<
      TenantDonationRedemption | null
    >(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD DONORS
  |--------------------------------------------------------------------------
  */

  const loadDonors =
    useCallback(
      async (
        silent = false,
      ) => {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        try {
          const items =
            await donationService.listDonors(
              {
                status:
                  donorFilter ===
                  "all"
                    ? undefined
                    : donorFilter,

                search:
                  search.trim() ||
                  undefined,

                page: 1,
                pageSize: 100,
              },
            );

          setDonors(
            items,
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load donors.",
            ),
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [
        donorFilter,
        search,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | LOAD REQUESTS
  |--------------------------------------------------------------------------
  */

  const loadRequests =
    useCallback(
      async (
        silent = false,
      ) => {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        try {
          const items =
            await donationService.listRequests(
              {
                status:
                  requestFilter,

                page: 1,
                pageSize: 100,
              },
            );

          setRequests(
            items,
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load donation requests.",
            ),
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [requestFilter],
    );

  /*
  |--------------------------------------------------------------------------
  | LOAD REDEMPTIONS
  |--------------------------------------------------------------------------
  */

  const loadRedemptions =
    useCallback(
      async (
        silent = false,
      ) => {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        try {
          const result =
            await donationService.listRedemptions(
              {
                status:
                  redemptionFilter,

                search:
                  search.trim() ||
                  undefined,

                page: 1,
                pageSize: 100,
              },
            );

          setRedemptions(
            result.redemptions,
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load redemptions.",
            ),
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [
        redemptionFilter,
        search,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | TAB LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      mainTab ===
      "donors"
    ) {
      void loadDonors();
      return;
    }

    if (
      mainTab ===
      "requests"
    ) {
      void loadRequests();
      return;
    }

    void loadRedemptions();
  }, [
    mainTab,
    loadDonors,
    loadRequests,
    loadRedemptions,
  ]);

  /*
  |--------------------------------------------------------------------------
  | DONOR STATUS
  |--------------------------------------------------------------------------
  */

  const changeDonorStatus =
    async (
      donor: TenantDonor,
      status:
        | "active"
        | "inactive"
        | "blocked",
    ) => {
      setActionId(
        donor.id,
      );

      setError("");
      setMessage("");

      try {
        const updated =
          await donationService.updateDonor(
            donor.id,
            {
              status,
            },
          );

        setDonors(
          (
            current,
          ) =>
            current.map(
              (
                item,
              ) =>
                item.id ===
                updated.id
                  ? updated
                  : item,
            ),
        );

        setMessage(
          `${updated.full_name} is now ${status}.`,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to update donor.",
          ),
        );
      } finally {
        setActionId("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | APPROVE DONATION REQUEST
  |--------------------------------------------------------------------------
  */

  const approveRequest =
    async (
      request:
        TenantDonationRequest,
    ) => {
      setActionId(
        request.id,
      );

      setError("");
      setMessage("");

      try {
        await donationService.reviewRequest(
          request.id,
          {
            status:
              "approved",
          },
        );

        setMessage(
          "Donation request approved.",
        );

        setSelectedRequest(
          null,
        );

        await loadRequests(
          true,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to approve donation request.",
          ),
        );
      } finally {
        setActionId("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REJECT REQUEST
  |--------------------------------------------------------------------------
  */

  const rejectRequest =
    async (
      requestId: string,
      reason: string,
    ) => {
      setActionId(
        requestId,
      );

      setError("");
      setMessage("");

      try {
        await donationService.reviewRequest(
          requestId,
          {
            status:
              "rejected",

            rejectionReason:
              reason,
          },
        );

        setRejectionRequest(
          null,
        );

        setSelectedRequest(
          null,
        );

        setMessage(
          "Donation request rejected.",
        );

        await loadRequests(
          true,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to reject donation request.",
          ),
        );
      } finally {
        setActionId("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | COMPLETE REDEMPTION
  |--------------------------------------------------------------------------
  */

  const completeRedemption =
    async (
      redemption:
        TenantDonationRedemption,
    ) => {
      setActionId(
        redemption.id,
      );

      setError("");
      setMessage("");

      try {
        await donationService.completeRedemption(
          redemption.id,
        );

        setRedemptionToComplete(
          null,
        );

        setMessage(
          `${formatMoney(
            redemption.amount,
            redemption.currency,
          )} was credited successfully.`,
        );

        await loadRedemptions(
          true,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to complete redemption.",
          ),
        );
      } finally {
        setActionId("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const donorStats =
    useMemo(
      () => ({
        active:
          donors.filter(
            (
              donor,
            ) =>
              donor.status ===
              "active",
          ).length,

        inactive:
          donors.filter(
            (
              donor,
            ) =>
              donor.status ===
              "inactive",
          ).length,

        blocked:
          donors.filter(
            (
              donor,
            ) =>
              donor.status ===
              "blocked",
          ).length,
      }),
      [donors],
    );

  const refresh =
    () => {
      if (
        mainTab ===
        "donors"
      ) {
        void loadDonors();
      } else if (
        mainTab ===
        "requests"
      ) {
        void loadRequests();
      } else {
        void loadRedemptions();
      }
    };

  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-80px)] overflow-x-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.13),transparent_16%)] bg-black px-4 py-8 text-white md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1180px]">

          {/* TOP */}

          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <ArrowLeft
                size={20}
              />
            </Link>

            <button
              type="button"
              onClick={
                refresh
              }
              disabled={
                loading
              }
              className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-bold transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* HERO */}

          <section className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">
                <Gift
                  size={15}
                />
                Donation Management
              </div>

              <h1 className="mt-5 text-[42px] font-black leading-[0.92] tracking-[-1px] md:text-[68px]">
                Funds
                <br />
                <span className="text-[#fde047]">
                  Donations
                </span>
              </h1>

              <p className="mt-5 max-w-[620px] text-sm leading-6 text-white/65 md:text-base">
                Manage verified donors, review client donation requests and complete approved fund redemptions.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/donation/donor/register"
                  className="flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-500"
                >
                  <Users
                    size={17}
                  />
                  Register Donor
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setMainTab(
                      "requests",
                    )
                  }
                  className="flex h-12 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-bold backdrop-blur transition hover:bg-white/15"
                >
                  <HandCoins
                    size={17}
                  />
                  Review Requests
                </button>
              </div>
            </div>

            {/* SUMMARY */}

            <div className="rounded-[28px] border border-white/10 bg-white/95 p-5 text-neutral-900 shadow-2xl">
              <div className="grid grid-cols-3 gap-3">
                <SummaryBox
                  label="Active donors"
                  value={String(
                    donorStats.active,
                  )}
                />

                <SummaryBox
                  label="Requests"
                  value={
                    mainTab ===
                    "requests"
                      ? String(
                          requests.length,
                        )
                      : "—"
                  }
                />

                <SummaryBox
                  label="Redemptions"
                  value={
                    mainTab ===
                    "redemptions"
                      ? String(
                          redemptions.length,
                        )
                      : "—"
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl bg-[#F7FAFC] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                  Donor health
                </p>

                <div className="mt-3 space-y-2 text-sm">
                  <SmallRow
                    label="Inactive"
                    value={String(
                      donorStats.inactive,
                    )}
                  />

                  <SmallRow
                    label="Blocked"
                    value={String(
                      donorStats.blocked,
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* MESSAGE */}

          {(error ||
            message) && (
            <div
              className={`mt-7 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${
                error
                  ? "border-red-500/30 bg-red-950/70 text-red-100"
                  : "border-emerald-500/30 bg-emerald-950/70 text-emerald-100"
              }`}
            >
              {error ||
                message}
            </div>
          )}

          {/* MAIN NAV */}

          <div className="mt-8 grid grid-cols-3 rounded-2xl bg-white/10 p-1 backdrop-blur">
            <MainTabButton
              active={
                mainTab ===
                "donors"
              }
              label="Donors"
              icon={
                <Users
                  size={16}
                />
              }
              onClick={() =>
                setMainTab(
                  "donors",
                )
              }
            />

            <MainTabButton
              active={
                mainTab ===
                "requests"
              }
              label="Requests"
              icon={
                <HandCoins
                  size={16}
                />
              }
              onClick={() =>
                setMainTab(
                  "requests",
                )
              }
            />

            <MainTabButton
              active={
                mainTab ===
                "redemptions"
              }
              label="Redemptions"
              icon={
                <WalletCards
                  size={16}
                />
              }
              onClick={() =>
                setMainTab(
                  "redemptions",
                )
              }
            />
          </div>

          {/* DONORS */}

          {mainTab ===
            "donors" && (
            <>
              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2 overflow-x-auto">
                  {(
                    [
                      "all",
                      "active",
                      "inactive",
                      "blocked",
                    ] as const
                  ).map(
                    (
                      status,
                    ) => (
                      <FilterButton
                        key={
                          status
                        }
                        active={
                          donorFilter ===
                          status
                        }
                        onClick={() =>
                          setDonorFilter(
                            status,
                          )
                        }
                        label={
                          status
                        }
                      />
                    ),
                  )}
                </div>

                <SearchBox
                  value={
                    search
                  }
                  onChange={
                    setSearch
                  }
                  placeholder="Search donors"
                />
              </div>

              {loading ? (
                <LoadingState
                  label="Loading donors…"
                />
              ) : donors.length ===
                0 ? (
                <EmptyState
                  title="No donors found"
                  description="Register a donor to make them available to eligible clients."
                />
              ) : (
                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {donors.map(
                    (
                      donor,
                    ) => (
                      <DonorCard
                        key={
                          donor.id
                        }
                        donor={
                          donor
                        }
                        busy={
                          actionId ===
                          donor.id
                        }
                        onStatusChange={(
                          status,
                        ) =>
                          void changeDonorStatus(
                            donor,
                            status,
                          )
                        }
                      />
                    ),
                  )}
                </section>
              )}
            </>
          )}

          {/* REQUESTS */}

          {mainTab ===
            "requests" && (
            <>
              <div className="mt-5 flex gap-2 overflow-x-auto">
                {(
                  [
                    "pending",
                    "approved",
                    "rejected",
                    "funded",
                    "redeemed",
                  ] as const
                ).map(
                  (
                    status,
                  ) => (
                    <FilterButton
                      key={
                        status
                      }
                      active={
                        requestFilter ===
                        status
                      }
                      onClick={() =>
                        setRequestFilter(
                          status,
                        )
                      }
                      label={
                        status
                      }
                    />
                  ),
                )}
              </div>

              {loading ? (
                <LoadingState
                  label="Loading donation requests…"
                />
              ) : requests.length ===
                0 ? (
                <EmptyState
                  title={`No ${requestFilter} requests`}
                  description="Client donation requests will appear here."
                />
              ) : (
                <section className="mt-6 grid gap-4 lg:grid-cols-2">
                  {requests.map(
                    (
                      request,
                    ) => (
                      <DonationRequestCard
                        key={
                          request.id
                        }
                        request={
                          request
                        }
                        busy={
                          actionId ===
                          request.id
                        }
                        onOpen={() =>
                          setSelectedRequest(
                            request,
                          )
                        }
                        onApprove={() =>
                          void approveRequest(
                            request,
                          )
                        }
                        onReject={() =>
                          setRejectionRequest(
                            request,
                          )
                        }
                      />
                    ),
                  )}
                </section>
              )}
            </>
          )}

          {/* REDEMPTIONS */}

          {mainTab ===
            "redemptions" && (
            <>
              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2 overflow-x-auto">
                  {(
                    [
                      "pending_otp",
                      "approved",
                      "completed",
                    ] as const
                  ).map(
                    (
                      status,
                    ) => (
                      <FilterButton
                        key={
                          status
                        }
                        active={
                          redemptionFilter ===
                          status
                        }
                        onClick={() =>
                          setRedemptionFilter(
                            status,
                          )
                        }
                        label={
                          status ===
                          "pending_otp"
                            ? "Waiting OTP"
                            : status
                        }
                      />
                    ),
                  )}
                </div>

                <SearchBox
                  value={
                    search
                  }
                  onChange={
                    setSearch
                  }
                  placeholder="Search redemptions"
                />
              </div>

              {loading ? (
                <LoadingState
                  label="Loading redemptions…"
                />
              ) : redemptions.length ===
                0 ? (
                <EmptyState
                  title="No redemptions found"
                  description="Donation redemption activity will appear here."
                />
              ) : (
                <section className="mt-6 grid gap-4 lg:grid-cols-2">
                  {redemptions.map(
                    (
                      redemption,
                    ) => (
                      <RedemptionCard
                        key={
                          redemption.id
                        }
                        redemption={
                          redemption
                        }
                        busy={
                          actionId ===
                          redemption.id
                        }
                        onComplete={() =>
                          setRedemptionToComplete(
                            redemption,
                          )
                        }
                      />
                    ),
                  )}
                </section>
              )}
            </>
          )}
        </div>

        <RequestDetailsOverlay
          request={
            selectedRequest
          }
          busy={
            Boolean(
              selectedRequest &&
                actionId ===
                  selectedRequest.id,
            )
          }
          onClose={() =>
            setSelectedRequest(
              null,
            )
          }
          onApprove={() => {
            if (
              selectedRequest
            ) {
              void approveRequest(
                selectedRequest,
              );
            }
          }}
          onReject={() => {
            if (
              selectedRequest
            ) {
              setRejectionRequest(
                selectedRequest,
              );
            }
          }}
        />

        <RejectRequestOverlay
          request={
            rejectionRequest
          }
          busy={
            Boolean(
              rejectionRequest &&
                actionId ===
                  rejectionRequest.id,
            )
          }
          onClose={() =>
            setRejectionRequest(
              null,
            )
          }
          onReject={(
            reason,
          ) => {
            if (
              rejectionRequest
            ) {
              void rejectRequest(
                rejectionRequest.id,
                reason,
              );
            }
          }}
        />

        <CompleteRedemptionOverlay
          redemption={
            redemptionToComplete
          }
          busy={
            Boolean(
              redemptionToComplete &&
                actionId ===
                  redemptionToComplete.id,
            )
          }
          onClose={() =>
            setRedemptionToComplete(
              null,
            )
          }
          onConfirm={() => {
            if (
              redemptionToComplete
            ) {
              void completeRedemption(
                redemptionToComplete,
              );
            }
          }}
        />
      </main>
    </AppShell>
  );
}

/*
|--------------------------------------------------------------------------
| DONOR CARD
|--------------------------------------------------------------------------
*/

function DonorCard({
  donor,
  busy,
  onStatusChange,
}: {
  donor: TenantDonor;
  busy: boolean;

  onStatusChange: (
    status:
      | "active"
      | "inactive"
      | "blocked",
  ) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-white/10 bg-white/95 text-neutral-900 shadow-xl">
      <div className="relative h-[190px] bg-[#E9EEF7]">
        {donor.profile_image_url ? (
          <Image
          src={
            resolveMediaUrl(
              donor.profile_image_url,
            ) ||
            "/images/David.png"
          }
          alt={donor.full_name}
          fill
          unoptimized
          className="object-cover"
        />
        ) : (
          <div className="grid h-full place-items-center">
            <Users
              size={46}
              className="text-black/20"
            />
          </div>
        )}

        <div className="absolute right-3 top-3">
          <StatusBadge
            status={
              donor.status
            }
          />
        </div>
      </div>

      <div className="p-5">
        <h2 className="text-lg font-black text-neutral-900">
          {
            donor.full_name
          }
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          {
            donor.email ||
            "No email"
          }
        </p>

        <div className="mt-4 space-y-2 rounded-xl border border-neutral-100 bg-[#F7FAFC] p-3 text-sm">
          <SmallRow
            label="Country"
            value={
              donor.country ||
              "—"
            }
          />

          <SmallRow
            label="Phone"
            value={
              donor.phone_number ||
              "—"
            }
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/dashboard/donation/donor/edit/${donor.id}`}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200"
          >
            <Edit2
              size={15}
            />
            Edit
          </Link>

          {donor.status ===
          "active" ? (
            <button
              type="button"
              disabled={
                busy
              }
              onClick={() =>
                onStatusChange(
                  "inactive",
                )
              }
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
            >
              <UserX
                size={15}
              />
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              disabled={
                busy
              }
              onClick={() =>
                onStatusChange(
                  "active",
                )
              }
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              <UserCheck
                size={15}
              />
              Activate
            </button>
          )}
        </div>

        {donor.status !==
          "blocked" && (
          <button
            type="button"
            disabled={
              busy
            }
            onClick={() =>
              onStatusChange(
                "blocked",
              )
            }
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            {busy ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Ban
                size={15}
              />
            )}

            Block donor
          </button>
        )}
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| DONATION REQUEST CARD
|--------------------------------------------------------------------------
*/

function DonationRequestCard({
  request,
  busy,
  onOpen,
  onApprove,
  onReject,
}: {
  request:
    TenantDonationRequest;
  busy: boolean;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white p-5 text-neutral-900 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Donation Request
          </p>

          <h2 className="mt-1 text-xl font-black text-neutral-900">
            {formatMoney(
              request.amount,
              request.currency,
            )}
          </h2>
        </div>

        <StatusBadge
          status={
            request.status
          }
        />
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-neutral-100 bg-[#F7FAFC] p-4 text-sm">
        <SmallRow
          label="Donor"
          value={
            request.donor_name
          }
        />

        <SmallRow
          label="Account"
          value={`${request.account_name} •••• ${request.account_number.slice(
            -4,
          )}`}
        />

        <SmallRow
          label="Purpose"
          value={
            request.purpose ||
            "—"
          }
        />

        <SmallRow
          label="Submitted"
          value={new Date(
            request.created_at,
          ).toLocaleString()}
        />
      </div>

      <button
        type="button"
        onClick={
          onOpen
        }
        className="mt-4 h-10 w-full rounded-xl border border-neutral-200 bg-neutral-100 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200"
      >
        View details
      </button>

      {request.status ===
        "pending" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              onReject
            }
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            <XCircle
              size={15}
            />
            Reject
          </button>

          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              onApprove
            }
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500"
          >
            {busy ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Check
                size={15}
              />
            )}

            Approve
          </button>
        </div>
      )}
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| REDEMPTION
|--------------------------------------------------------------------------
*/

function RedemptionCard({
  redemption,
  busy,
  onComplete,
}: {
  redemption:
    TenantDonationRedemption;
  busy: boolean;
  onComplete: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white p-5 text-neutral-900 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Redemption
          </p>

          <h2 className="mt-1 text-xl font-black text-neutral-900">
            {formatMoney(
              redemption.amount,
              redemption.currency,
            )}
          </h2>
        </div>

        <StatusBadge
          status={
            redemption.status
          }
        />
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-neutral-100 bg-[#F7FAFC] p-4 text-sm">
        <SmallRow
          label="Beneficiary"
          value={
            redemption.beneficiary_name ||
            redemption.beneficiary_email ||
            "—"
          }
        />

        <SmallRow
          label="Donor"
          value={
            redemption.donor_name ||
            "—"
          }
        />

        <SmallRow
          label="Account"
          value={
            redemption.account_number
              ? `•••• ${redemption.account_number.slice(
                  -4,
                )}`
              : "—"
          }
        />

        <SmallRow
          label="OTP"
          value={
            redemption.status ===
            "pending_otp"
              ? "Waiting for verification"
              : redemption.otp_verified_at
                ? "Verified"
                : "—"
          }
        />
      </div>

      {redemption.status ===
        "approved" && (
        <button
          type="button"
          onClick={
            onComplete
          }
          disabled={
            busy
          }
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-black text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
        >
          {busy ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <ShieldCheck
              size={16}
            />
          )}

          Complete & credit account
        </button>
      )}
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| REQUEST DETAILS
|--------------------------------------------------------------------------
*/

function RequestDetailsOverlay({
  request,
  busy,
  onClose,
  onApprove,
  onReject,
}: {
  request:
    TenantDonationRequest | null;
  busy: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!request) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-[26px] bg-white p-6 text-neutral-900 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Donation request
            </p>

            <h2 className="mt-1 text-2xl font-black text-neutral-900">
              {formatMoney(
                request.amount,
                request.currency,
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 transition hover:bg-neutral-200"
          >
            <X
              size={17}
            />
          </button>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-neutral-100 bg-[#F7FAFC] p-4 text-sm">
          <SmallRow
            label="Donor"
            value={
              request.donor_name
            }
          />

          <SmallRow
            label="Purpose"
            value={
              request.purpose ||
              "—"
            }
          />

          <SmallRow
            label="Appreciation"
            value={
              request.appreciation ||
              "—"
            }
          />

          <SmallRow
            label="Account"
            value={`${request.account_name} •••• ${request.account_number.slice(
              -4,
            )}`}
          />
        </div>

        {request.status ===
          "pending" && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={
                onReject
              }
              disabled={
                busy
              }
              className="h-11 rounded-xl border border-red-200 bg-red-50 font-bold text-red-600 transition hover:bg-red-100"
            >
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
              className="h-11 rounded-xl bg-blue-600 font-bold text-white shadow-sm transition hover:bg-blue-500"
            >
              Approve
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| REJECT OVERLAY
|--------------------------------------------------------------------------
*/

function RejectRequestOverlay({
  request,
  busy,
  onClose,
  onReject,
}: {
  request:
    TenantDonationRequest | null;
  busy: boolean;
  onClose: () => void;
  onReject: (
    reason: string,
  ) => void;
}) {
  const [
    reason,
    setReason,
  ] =
    useState("");

  useEffect(() => {
    if (!request) {
      setReason("");
    }
  }, [request]);

  if (!request) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[24px] bg-white p-6 text-neutral-900 shadow-2xl">
        <h2 className="text-xl font-black text-neutral-900">
          Reject donation request
        </h2>

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
          maxLength={
            1000
          }
          placeholder="Reason for rejection"
          className="mt-5 h-28 w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm text-neutral-900 outline-none transition focus:border-red-400"
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="h-11 rounded-xl border border-neutral-200 bg-neutral-100 font-bold text-neutral-700 transition hover:bg-neutral-200"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              busy ||
              reason.trim()
                .length <
                3
            }
            onClick={() =>
              onReject(
                reason.trim(),
              )
            }
            className="h-11 rounded-xl bg-red-600 font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMPLETE REDEMPTION
|--------------------------------------------------------------------------
*/

function CompleteRedemptionOverlay({
  redemption,
  busy,
  onClose,
  onConfirm,
}: {
  redemption:
    TenantDonationRedemption | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!redemption) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[24px] bg-white p-6 text-neutral-900 shadow-2xl">
        <h2 className="text-xl font-black text-neutral-900">
          Complete redemption
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          This will credit{" "}
          <strong>
            {formatMoney(
              redemption.amount,
              redemption.currency,
            )}
          </strong>{" "}
          to the client&apos;s linked account.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="h-11 rounded-xl border border-neutral-200 bg-neutral-100 font-bold text-neutral-700 transition hover:bg-neutral-200"
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
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
          >
            {busy && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Credit account
          </button>
        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMMON COMPONENTS
|--------------------------------------------------------------------------
*/

function MainTabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon:
    React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-black transition ${
        active
          ? "bg-white text-black shadow-sm"
          : "text-white/55 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterButton({
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
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white/10 text-white/55 hover:bg-white/15 hover:text-white"
      }`}
    >
      {label.replaceAll(
        "_",
        " ",
      )}
    </button>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full md:max-w-[280px]">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
      />

      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className="h-10 w-full rounded-xl border border-white/10 bg-white/10 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
      />
    </div>
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
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-4 text-center text-neutral-900">
      <p className="text-xl font-black text-neutral-900">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
    </div>
  );
}

function SmallRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-neutral-400 font-medium">
        {label}
      </span>

      <span className="text-right font-semibold text-neutral-800">
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
  const classes =
    status ===
      "active" ||
    status ===
      "approved" ||
    status ===
      "completed" ||
    status ===
      "redeemed"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : status ===
          "pending" ||
        status ===
          "pending_otp"
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : status ===
            "blocked" ||
          status ===
            "rejected"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-neutral-100 text-neutral-600 border border-neutral-200";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${classes}`}
    >
      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function LoadingState({
  label,
}: {
  label: string;
}) {
  return (
    <div className="grid min-h-[320px] place-items-center">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-blue-500" />

        <p className="mt-3 text-sm text-white/45">
          {label}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 grid min-h-[280px] place-items-center rounded-[24px] border border-dashed border-white/15 bg-white/5 px-6 text-center">
      <div>
        <Gift
          size={36}
          className="mx-auto text-white/20"
        />

        <p className="mt-4 font-black">
          {title}
        </p>

        <p className="mt-2 text-sm text-white/40">
          {description}
        </p>
      </div>
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
      style:
        "currency",
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