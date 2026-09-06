/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

import {
  setTenantSlug,
} from "@/lib/tenant";

type TenantOnboardingContext = {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  temporaryDomain: string;

  ownerId: string;
  membershipId: string;
  email: string;

  onboardingToken: string;
  onboardingTokenExpiresIn: number;
  onboardingStartedAt: number;

  nextStep: string;

  subscriptionRequestId?: string;
  selectedPlan?: string;

  paymentProofFileId?: string;
};

type SubscriptionRecord = {
  id: string;
  status: string;

  plan_name?: string;
  plan_code?: string;

  plan_price?: number | string;
  plan_currency?: string;

  starts_at?: string;
  expires_at?: string;
};

type SubscriptionRequest = {
  id: string;
  status: string;

  plan_name?: string;
  plan_code?: string;

  plan_price?: number | string;
  plan_currency?: string;

  payment_reference?: string;
  payment_proof_file_id?: string;
  payment_note?: string;

  rejection_reason?: string;

  created_at?: string;
  reviewed_at?: string;
};

type StatusResponse = {
  success?: boolean;
  message?: string;

  data?: {
    subscription:
      | SubscriptionRecord
      | null;

    openRequest:
      | SubscriptionRequest
      | null;
  };
};

export default function SubscriptionStatusPage() {
  const [
    onboarding,
    setOnboarding,
  ] =
    useState<TenantOnboardingContext | null>(
      null,
    );

  const [
    subscription,
    setSubscription,
  ] =
    useState<SubscriptionRecord | null>(
      null,
    );

  const [
    request,
    setRequest,
  ] =
    useState<SubscriptionRequest | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load subscription status
  |--------------------------------------------------------------------------
  */

useEffect(() => {
  let cancelled = false;

  let intervalId:
    ReturnType<typeof setInterval> | null =
    null;

  const loadStatus = async (
    showLoader = false,
  ) => {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const stored =
        sessionStorage.getItem(
          "zentra_tenant_onboarding",
        );

      if (!stored) {
        throw new Error(
          "Your onboarding session could not be found.",
        );
      }

      const parsed =
        JSON.parse(
          stored,
        ) as TenantOnboardingContext;

      if (!parsed.onboardingToken) {
        throw new Error(
          "Your onboarding session is invalid.",
        );
      }

      if (cancelled) {
        return;
      }

      setOnboarding(parsed);

      const response =
        await fetch(
          `${API_BASE_URL}/subscriptions/onboarding/status`,
          {
            method: "GET",

            headers: {
              "X-Onboarding-Token":
                parsed.onboardingToken,
            },

            cache: "no-store",
          },
        );

      const payload =
        (await response
          .json()
          .catch(
            () => null,
          )) as StatusResponse | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            "Unable to retrieve subscription status.",
        );
      }

      if (cancelled) {
        return;
      }

      const nextSubscription =
        payload?.data?.subscription ??
        null;

      const nextRequest =
        payload?.data?.openRequest ??
        null;

      setSubscription(
        nextSubscription,
      );

      setRequest(
        nextRequest,
      );

      /*
      |--------------------------------------------------------------------------
      | Stop polling once subscription becomes active
      |--------------------------------------------------------------------------
      */

      if (
        nextSubscription?.status ===
          "active" &&
        intervalId
      ) {
        clearInterval(
          intervalId,
        );

        intervalId = null;
      }
    } catch (loadError) {
      if (cancelled) {
        return;
      }

      console.error(
        "Unable to load subscription status:",
        loadError,
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load subscription status.",
      );
    } finally {
      if (
        !cancelled &&
        showLoader
      ) {
        setLoading(false);
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial load
  |--------------------------------------------------------------------------
  */

  void loadStatus(true);

  /*
  |--------------------------------------------------------------------------
  | Poll every 5 seconds
  |--------------------------------------------------------------------------
  */

  intervalId =
    setInterval(() => {
      void loadStatus(false);
    }, 5000);

  return () => {
    cancelled = true;

    if (intervalId) {
      clearInterval(
        intervalId,
      );
    }
  };
}, []);
  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={30}
            className="animate-spin"
          />

          <p className="text-[13px] text-white/70">
            Checking subscription
            status...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <main className="min-h-screen bg-black px-4 py-5 text-white">
        <div className="mx-auto max-w-[430px]">
          <header className="relative flex items-center justify-center">
            <Link
              href="/subscribe"
              className="absolute left-0"
            >
              <ArrowLeft
                size={20}
              />
            </Link>

            <h1 className="text-[14px] font-bold">
              Subscription Status
            </h1>
          </header>

          <section className="mt-10 rounded-3xl bg-white p-6 text-center text-black">
            <XCircle
              size={50}
              className="mx-auto text-red-600"
            />

            <h2 className="mt-4 text-[22px] font-black">
              Unable to Check Status
            </h2>

            <p className="mt-3 text-[13px] font-semibold leading-5 text-black/60">
              {error}
            </p>

            <Link
              href="/subscribe"
              className="mt-6 flex h-[43px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
            >
              Back to Subscription
            </Link>
          </section>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Active subscription
  |--------------------------------------------------------------------------
  */

 if (subscription) {
  return (
    <main className="min-h-screen bg-black px-4 py-5 text-white">
      <div className="mx-auto max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/subscribe"
            className="absolute left-0"
          >
            <ArrowLeft size={20} />
          </Link>

          <h1 className="text-[14px] font-bold">
            Subscription Status
          </h1>
        </header>

        <section className="mt-10 rounded-3xl bg-white p-6 text-center text-black">
          <CheckCircle
            size={54}
            className="mx-auto text-green-700"
          />

          <h2 className="mt-4 text-[24px] font-black">
            Subscription Active
          </h2>

          <p className="mx-auto mt-2 max-w-[300px] text-[13px] font-semibold leading-5 text-black/60">
            Your subscription has been approved and
            your organisation is now active.
          </p>

          <div className="mt-5 rounded-2xl bg-[#F4F6FA] px-4 py-4 text-left">
            <p className="text-[13px] font-bold">
              Organisation:{" "}
              <span className="text-black/60">
                {onboarding?.tenantName ||
                  "Organisation"}
              </span>
            </p>

            <p className="mt-2 text-[13px] font-bold">
              Plan:{" "}
              <span className="capitalize text-black/60">
                {subscription.plan_name ||
                  subscription.plan_code ||
                  "Active plan"}
              </span>
            </p>

            <p className="mt-2 text-[13px] font-bold">
              Status:{" "}
              <span className="capitalize text-green-700">
                {subscription.status}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (
                onboarding?.tenantCode
              ) {
                setTenantSlug(
                  onboarding.tenantCode,
                );
              }

              window.location.href =
                "/login";
            }}
            className="mt-6 flex h-[46px] w-full items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold text-white"
          >
            Continue to Login
          </button>
        </section>
      </div>
    </main>
  );
}

  /*
  |--------------------------------------------------------------------------
  | Open subscription request
  |--------------------------------------------------------------------------
  */

  if (request) {
    const paymentSubmitted =
      request.status ===
      "payment_submitted";

    const awaitingPayment =
      request.status ===
      "pending_payment";

    return (
      <main className="min-h-screen bg-black px-4 py-5 text-white">
        <div className="mx-auto max-w-[430px]">
          <header className="relative flex items-center justify-center">
            <Link
              href="/subscribe"
              className="absolute left-0"
            >
              <ArrowLeft
                size={20}
              />
            </Link>

            <h1 className="text-[14px] font-bold">
              Subscription Status
            </h1>
          </header>

          <section className="mt-10 rounded-3xl bg-white p-6 text-center text-black">
            <Clock
              size={52}
              className="mx-auto text-yellow-600"
            />

            <h2 className="mt-4 text-[24px] font-black">
              {paymentSubmitted
                ? "Awaiting Confirmation"
                : "Payment Required"}
            </h2>

            <p className="mx-auto mt-2 max-w-[310px] text-[13px] font-semibold leading-5 text-black/60">
              {paymentSubmitted
                ? "Your payment proof has been submitted and is waiting for administrator review."
                : "Your subscription request has been created but payment proof has not yet been submitted."}
            </p>

            <div className="mt-5 rounded-2xl bg-[#F4F6FA] px-4 py-4 text-left">
              <p className="text-[13px] font-bold">
                Organisation:{" "}
                <span className="text-black/60">
                  {onboarding?.tenantName ||
                    "Organisation"}
                </span>
              </p>

              <p className="mt-2 text-[13px] font-bold">
                Plan:{" "}
                <span className="capitalize text-black/60">
                  {request.plan_name ||
                    request.plan_code ||
                    "Selected plan"}
                </span>
              </p>

              <p className="mt-2 text-[13px] font-bold">
                Amount:{" "}
                <span className="text-black/60">
                  {request.plan_currency ||
                    "$"}
                  {
                    request.plan_price
                  }
                </span>
              </p>

              <p className="mt-2 text-[13px] font-bold">
                Status:{" "}
                <span className="capitalize text-yellow-700">
                  {paymentSubmitted
                    ? "Pending Review"
                    : "Awaiting Payment"}
                </span>
              </p>

              {request.payment_reference && (
                <p className="mt-2 break-all text-[13px] font-bold">
                  Reference:{" "}
                  <span className="text-black/60">
                    {
                      request.payment_reference
                    }
                  </span>
                </p>
              )}
            </div>

            {awaitingPayment && (
              <Link
                href={`/subscribe/payment-proof?plan=${
                  request.plan_code ||
                  onboarding?.selectedPlan ||
                  "bronze"
                }`}
                className="mt-6 flex h-[43px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
              >
                Upload Payment Proof
              </Link>
            )}

            {paymentSubmitted && (
              <>
                <div className="mt-5 rounded-2xl bg-yellow-50 px-4 py-4 text-left">
                  <p className="text-[12px] font-semibold leading-5 text-yellow-900">
                    Your receipt has
                    been received.
                    Once the platform
                    administrator
                    approves it, your
                    Bronze
                    subscription and
                    tenant account
                    will become active.
                  </p>
                </div>

                <Link
                  href="/support"
                  className="mt-4 flex h-[43px] items-center justify-center rounded-xl border border-blue-700 bg-white text-[14px] font-bold !text-blue-700"
                >
                  Chat Help Line
                </Link>
              </>
            )}
          </section>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Nothing found
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-black px-4 py-5 text-white">
      <div className="mx-auto max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/subscribe"
            className="absolute left-0"
          >
            <ArrowLeft
              size={20}
            />
          </Link>

          <h1 className="text-[14px] font-bold">
            Subscription Status
          </h1>
        </header>

        <section className="mt-10 rounded-3xl bg-white p-6 text-center text-black">
          <Clock
            size={48}
            className="mx-auto text-blue-700"
          />

          <h2 className="mt-4 text-[22px] font-black">
            No Subscription Request
          </h2>

          <p className="mt-3 text-[13px] font-semibold leading-5 text-black/60">
            We could not find an
            active subscription or
            open subscription request
            for this organisation.
          </p>

          <Link
            href="/subscribe"
            className="mt-6 flex h-[43px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
          >
            Choose Subscription
          </Link>
        </section>
      </div>
    </main>
  );
}