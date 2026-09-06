"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";

import {
  subscriptionService,
  type MySubscriptionResponse,
  type PlanCode,
  type SubscriptionPlan,
} from "@/services/subscription.service";

const PLAN_ORDER: Record<PlanCode, number> = {
  bronze: 1,
  gold: 2,
  diamond: 3,
};

const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

const formatPrice = (
  value?:
    | string
    | number
    | null
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const numeric =
    Number(value);

  if (
    Number.isFinite(
      numeric
    )
  ) {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency: "GBP",
      }
    ).format(numeric);
  }

  return String(value);
};

const formatFeatureName = (
  key: string
) =>
  key
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );

export default function SubscriptionsPage() {
  const [
    subscriptionData,
    setSubscriptionData,
  ] =
    useState<
      MySubscriptionResponse | null
    >(null);

  const [
    plans,
    setPlans,
  ] =
    useState<
      SubscriptionPlan[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    submittingPlan,
    setSubmittingPlan,
  ] =
    useState<
      PlanCode | null
    >(null);

  const [
    proofFile,
    setProofFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    paymentReference,
    setPaymentReference,
  ] =
    useState("");

  const [
    paymentNote,
    setPaymentNote,
  ] =
    useState("");

  const [
    submittingProof,
    setSubmittingProof,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load subscription state
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async (
        silent = false
      ) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const [
            mine,
            availablePlans,
          ] =
            await Promise.all([
              subscriptionService
                .getMine(),

              subscriptionService
                .getPlans(),
            ]);

          setSubscriptionData(
            mine
          );

          setPlans(
            availablePlans
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load subscription information."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Derived subscription state
  |--------------------------------------------------------------------------
  */

  const currentSubscription =
    subscriptionData
      ?.subscription ??
    null;

  const openRequest =
    subscriptionData
      ?.openRequest ??
    null;

  const currentPlanCode =
    currentSubscription
      ?.plan_code ??
    null;

  const currentPlan =
    useMemo(
      () =>
        plans.find(
          (plan) =>
            plan.code ===
            currentPlanCode
        ) ?? null,
      [
        plans,
        currentPlanCode,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Poll pending platform review
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      openRequest?.status !==
      "payment_submitted"
    ) {
      return;
    }

    const intervalId =
      window.setInterval(
        () => {
          void load(true);
        },
        5000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    openRequest?.status,
    load,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Reset proof form when request disappears
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!openRequest) {
      setProofFile(null);
      setPaymentReference("");
      setPaymentNote("");
    }
  }, [openRequest]);

  /*
  |--------------------------------------------------------------------------
  | Request plan change
  |--------------------------------------------------------------------------
  */

  const handlePlanChange =
    async (
      planCode: PlanCode
    ) => {
      if (openRequest) {
        setError(
          "You already have an open subscription request."
        );

        return;
      }

      setSubmittingPlan(
        planCode
      );

      setError("");
      setSuccess("");

      try {
        await subscriptionService
          .requestPlanChange(
            planCode
          );

        setSuccess(
          "Subscription request created successfully. Please submit your payment proof."
        );

        await load(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create subscription request."
        );
      } finally {
        setSubmittingPlan(
          null
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Select payment proof
  |--------------------------------------------------------------------------
  */

  const handleProofFileChange =
    (
      event:
        React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setError("");
      setSuccess("");

      if (
        !ACCEPTED_FILE_TYPES.includes(
          file.type
        )
      ) {
        setProofFile(null);

        setError(
          "Please upload a PNG, JPG, JPEG or PDF file."
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setProofFile(null);

        setError(
          "Payment proof must not exceed 10MB."
        );

        event.target.value =
          "";

        return;
      }

      setProofFile(file);
    };

  /*
  |--------------------------------------------------------------------------
  | Upload and submit payment proof
  |--------------------------------------------------------------------------
  */

  const handleSubmitProof =
    async () => {
      if (
        !openRequest ||
        openRequest.status !==
          "pending_payment"
      ) {
        setError(
          "There is no subscription request awaiting payment."
        );

        return;
      }

      if (!proofFile) {
        setError(
          "Please select a payment proof file."
        );

        return;
      }

      if (
        !paymentReference.trim()
      ) {
        setError(
          "Please enter your payment reference."
        );

        return;
      }

      setSubmittingProof(
        true
      );

      setError("");
      setSuccess("");

      try {
        /*
        |--------------------------------------------------------------------------
        | Step 1 - Upload private payment proof
        |--------------------------------------------------------------------------
        */

        const uploaded =
          await subscriptionService
            .uploadPaymentProof(
              proofFile
            );

        if (!uploaded.fileId) {
          throw new Error(
            "The server did not return a payment proof file ID."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Step 2 - Attach proof to subscription request
        |--------------------------------------------------------------------------
        */

        await subscriptionService
          .submitPaymentProof({
            requestId:
              openRequest.id,

            paymentReference:
              paymentReference.trim(),

            paymentProofFileId:
              uploaded.fileId,

            paymentNote:
              paymentNote.trim(),
          });

        setProofFile(null);
        setPaymentReference("");
        setPaymentNote("");

        setSuccess(
          "Payment proof submitted successfully. Your subscription request is now awaiting platform approval."
        );

        await load(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit payment proof."
        );
      } finally {
        setSubmittingProof(
          false
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />

          Loading subscription...
        </div>
      </div>
    );
  }

  
    return (
  <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    {/* Back to dashboard */}

    <Link
      href="/dashboard"
      className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />

      Back to Dashboard
    </Link>


      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Billing & subscription
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Subscription
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            View your current
            subscription, compare
            available plans and
            request an upgrade or
            downgrade.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void load(true)
          }
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* Messages */}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {/* Current subscription */}

      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current plan
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold capitalize">
                {currentSubscription
                  ?.plan_name ??
                  currentPlan
                    ?.name ??
                  currentPlanCode ??
                  "No active plan"}
              </h2>

              {currentSubscription ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {
                    currentSubscription
                      .status
                  }
                </span>
              ) : null}
            </div>

            {currentPlan ? (
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                {currentPlan
                  .description ??
                  "Your current ZentraBank subscription plan."}
              </p>
            ) : null}
          </div>

          {currentPlan ? (
            <div className="rounded-2xl bg-muted/50 px-5 py-4 md:text-right">
              <p className="text-sm text-muted-foreground">
                Plan price
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {formatPrice(
                  currentPlan.price
                ) ?? "—"}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Started
            </p>

            <p className="mt-1 font-medium">
              {formatDate(
                currentSubscription
                  ?.starts_at
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Expires
            </p>

            <p className="mt-1 font-medium">
              {formatDate(
                currentSubscription
                  ?.expires_at
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Open subscription request */}

      {openRequest ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Subscription request
              in progress
            </p>

            <h3 className="mt-1 text-xl font-semibold capitalize text-amber-950">
              {openRequest
                .plan_name ??
                openRequest
                  .plan_code ??
                "Plan change"}
            </h3>

            <p className="mt-2 text-sm text-amber-800">
              Status:{" "}
              <span className="font-semibold">
                {
                  openRequest.status
                }
              </span>
            </p>
          </div>

          {/* Pending payment */}

          {openRequest.status ===
          "pending_payment" ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Complete payment
                </p>

                <p className="mt-1 text-sm text-amber-800">
                  Upload your
                  payment proof to
                  send this
                  subscription
                  request for
                  platform review.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-amber-950">
                    Payment
                    reference
                  </label>

                  <input
                    type="text"
                    value={
                      paymentReference
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentReference(
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. TXN-483920"
                    disabled={
                      submittingProof
                    }
                    className="h-11 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-amber-950">
                    Payment note

                    <span className="ml-1 font-normal text-amber-700">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      paymentNote
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentNote(
                        event.target
                          .value
                      )
                    }
                    placeholder="Additional payment information"
                    disabled={
                      submittingProof
                    }
                    className="h-11 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-amber-950">
                  Payment proof
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-amber-300 bg-white p-4 transition hover:bg-amber-50 ${
                    submittingProof
                      ? "pointer-events-none opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      {proofFile ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {proofFile
                          ? proofFile.name
                          : "Choose payment proof"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        PNG, JPG,
                        JPEG or PDF.
                        Maximum 10MB.
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg border px-3 py-2 text-xs font-medium text-slate-700">
                    {proofFile
                      ? "Replace"
                      : "Browse"}
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    disabled={
                      submittingProof
                    }
                    onChange={
                      handleProofFileChange
                    }
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-xs text-amber-800">
                  Your active plan
                  remains unchanged
                  until the payment
                  has been reviewed
                  and approved by
                  the platform.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void handleSubmitProof()
                  }
                  disabled={
                    submittingProof ||
                    !proofFile ||
                    !paymentReference.trim()
                  }
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-950 px-5 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingProof ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />

                      Submit payment
                      proof
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {/* Waiting for platform */}

          {openRequest.status ===
          "payment_submitted" ? (
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/60 p-4">
              <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-amber-700" />

              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Awaiting platform
                  approval
                </p>

                <p className="mt-1 text-sm text-amber-800">
                  Your payment proof
                  has been submitted
                  successfully. This
                  page checks for an
                  update automatically
                  every few seconds.
                </p>
              </div>
            </div>
          ) : null}

          {/* Rejected */}

          {openRequest.status ===
          "rejected" ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Subscription
                request rejected
              </p>

              <p className="mt-1 text-sm text-red-700">
                Please review the
                payment information
                or contact platform
                support.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Plans */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold">
            Available plans
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select another plan to
            request a subscription
            change.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map(
            (plan) => {
              const isCurrent =
                plan.code ===
                currentPlanCode;

              const currentOrder =
                currentPlanCode
                  ? PLAN_ORDER[
                      currentPlanCode
                    ]
                  : 0;

              const targetOrder =
                PLAN_ORDER[
                  plan.code
                ];

              const action =
                targetOrder >
                currentOrder
                  ? "Upgrade"
                  : targetOrder <
                      currentOrder
                    ? "Downgrade"
                    : "Current plan";

              const disabled =
                isCurrent ||
                Boolean(
                  openRequest
                ) ||
                submittingPlan !==
                  null;

              return (
                <article
                  key={plan.id}
                  className={`flex min-h-[340px] flex-col rounded-3xl border p-6 shadow-sm transition ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold">
                        {
                          plan.name
                        }
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {plan
                          .description ??
                          "ZentraBank subscription plan."}
                      </p>
                    </div>

                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <Check className="h-3.5 w-3.5" />

                        Current
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <p className="text-3xl font-semibold">
                      {formatPrice(
                        plan.price
                      ) ?? "—"}
                    </p>
                  </div>

                  <div className="mt-auto pt-8">
                    <button
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        void handlePlanChange(
                          plan.code
                        )
                      }
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingPlan ===
                      plan.code ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          Creating
                          request...
                        </>
                      ) : isCurrent ? (
                        "Current plan"
                      ) : (
                        <>
                          {action} to{" "}
                          {
                            plan.name
                          }

                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>

      {/* Entitlements */}

      {subscriptionData ? (
        <section className="rounded-3xl border bg-card p-6">
          <div>
            <h2 className="text-lg font-semibold">
              Plan entitlements
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              These are the
              features currently
              enabled by your
              active subscription.
            </p>
          </div>

          {Object.keys(
            subscriptionData
              .entitlements
          ).length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
              No subscription
              entitlements are
              currently configured.
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(
                subscriptionData
                  .entitlements
              ).map(
                ([
                  key,
                  value,
                ]) => (
                  <div
                    key={key}
                    className="rounded-2xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {formatFeatureName(
                          key
                        )}
                      </p>

                      {typeof value ===
                      "boolean" ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            value
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {value
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      ) : null}
                    </div>

                    {typeof value !==
                    "boolean" ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {value ===
                        null
                          ? "Unlimited"
                          : String(
                              value
                            )}
                      </p>
                    ) : null}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}