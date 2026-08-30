"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Loader2,
} from "lucide-react";

type PlanCode =
  | "bronze"
  | "gold"
  | "diamond";

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
  selectedPlan?: PlanCode;
};

const plans: Record<
  PlanCode,
  {
    name: string;
    serviceType: string;
    price: string;
    amount: number;
  }
> = {
  bronze: {
    name: "Bronze Subscription",
    serviceType: "Bronze Plan",
    price: "$40",
    amount: 40,
  },

  gold: {
    name: "Gold Subscription",
    serviceType: "Gold Plan",
    price: "$80",
    amount: 80,
  },

  diamond: {
    name: "Diamond Subscription",
    serviceType: "Diamond Plan",
    price: "$120",
    amount: 120,
  },
};

const coins = [
  {
    name: "USDT",
    network: "TON Blockchain",

    address:
      process.env
        .NEXT_PUBLIC_USDT_PAYMENT_ADDRESS ||
      "",
  },

  {
    name: "BITCOIN",
    network:
      process.env
        .NEXT_PUBLIC_BITCOIN_PAYMENT_NETWORK ||
      "Bitcoin",

    address:
      process.env
        .NEXT_PUBLIC_BITCOIN_PAYMENT_ADDRESS ||
      "",
  },

  {
    name: "SOLANA",
    network:
      process.env
        .NEXT_PUBLIC_SOLANA_PAYMENT_NETWORK ||
      "Solana",

    address:
      process.env
        .NEXT_PUBLIC_SOLANA_PAYMENT_ADDRESS ||
      "",
  },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

const isPlanCode = (
  value: string,
): value is PlanCode => {
  return [
    "bronze",
    "gold",
    "diamond",
  ].includes(value);
};

export default function CheckoutPage() {
  
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <Loader2
            size={28}
            className="animate-spin"
          />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
    const router =
    useRouter();
  const searchParams =
    useSearchParams();

  const requestedPlan =
    (
      searchParams.get("plan") ||
      "bronze"
    ).toLowerCase();

  const selectedPlan: PlanCode =
    isPlanCode(requestedPlan)
      ? requestedPlan
      : "bronze";

  const currentPlan =
    plans[selectedPlan];

  const [
    onboarding,
    setOnboarding,
  ] =
    useState<TenantOnboardingContext | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    copiedCoin,
    setCopiedCoin,
  ] =
    useState<string | null>(
      null,
    );

    const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Restore tenant onboarding context
  |--------------------------------------------------------------------------
  |
  | This information is used only to maintain the registration flow.
  |
  | IMPORTANT:
  | tenantId from sessionStorage must NEVER be treated by the backend as
  | sufficient authorization to create or modify a subscription.
  |
  */

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(
          "zentra_tenant_onboarding",
        );

      if (!stored) {
        setOnboarding(
          null,
        );

        return;
      }

      const parsed =
        JSON.parse(
          stored,
        ) as TenantOnboardingContext;

            if (
        !parsed.tenantId ||
        !parsed.tenantName ||
        !parsed.email ||
        !parsed.onboardingToken ||
        !parsed.onboardingStartedAt ||
        !parsed.onboardingTokenExpiresIn
      ) {
        sessionStorage.removeItem(
          "zentra_tenant_onboarding"
        );

        setOnboarding(
          null,
        );

        return;
      }

      const expiresAt =
        parsed.onboardingStartedAt +
        parsed.onboardingTokenExpiresIn *
          1000;

      if (
        Date.now() >=
        expiresAt
      ) {
        sessionStorage.removeItem(
          "zentra_tenant_onboarding"
        );

        setOnboarding(
          null,
        );

        return;
      }

      setOnboarding(
        parsed,
      );
    } catch (
      error
    ) {
      console.error(
        "Unable to restore tenant onboarding context:",
        error,
      );

      setOnboarding(
        null,
      );
    } finally {
      setLoading(
        false,
      );
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Copy payment address
  |--------------------------------------------------------------------------
  */

  const copyAddress =
    async (
      coinName: string,
      address: string,
    ) => {
      if (!address) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          address,
        );

        setCopiedCoin(
          coinName,
        );

        window.setTimeout(
          () => {
            setCopiedCoin(
              null,
            );
          },
          1800,
        );
      } catch (
        error
      ) {
        console.error(
          "Unable to copy payment address:",
          error,
        );
      }
    };

      /*
  |--------------------------------------------------------------------------
  | Start onboarding subscription
  |--------------------------------------------------------------------------
  */

  const continueToPaymentProof =
    async () => {
      if (
        !onboarding ||
        submitting
      ) {
        return;
      }

      setSubmitting(true);
      setSubmitError("");

      try {
        /*
        |--------------------------------------------------------------------------
        | Reuse an existing request
        |--------------------------------------------------------------------------
        |
        | This prevents repeated clicks/back-navigation from creating duplicate
        | subscription requests during the same onboarding session.
        |
        */

        if (
          onboarding.subscriptionRequestId &&
          onboarding.selectedPlan ===
            selectedPlan
        ) {
          router.push(
            `/subscribe/payment-proof?plan=${selectedPlan}`
          );

          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/subscriptions/onboarding/requests`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "X-Onboarding-Token":
                  onboarding.onboardingToken,
              },

              body:
                JSON.stringify({
                  planCode:
                    selectedPlan,
                }),
            }
          );

        const payload =
          await response
            .json()
            .catch(
              () => null
            );

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              "Unable to create subscription request"
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Extract request ID
        |--------------------------------------------------------------------------
        */

        const requestId =
          payload?.data?.id ||
          payload?.data
            ?.requestId;

        if (!requestId) {
          throw new Error(
            "The server did not return a subscription request ID"
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Update onboarding context
        |--------------------------------------------------------------------------
        */

        const updatedOnboarding: TenantOnboardingContext =
          {
            ...onboarding,

            subscriptionRequestId:
              requestId,

            selectedPlan,

            nextStep:
              "submit_payment_proof",
          };

        sessionStorage.setItem(
          "zentra_tenant_onboarding",
          JSON.stringify(
            updatedOnboarding
          )
        );

        setOnboarding(
          updatedOnboarding
        );

        /*
        |--------------------------------------------------------------------------
        | Continue
        |--------------------------------------------------------------------------
        */

        router.push(
          `/subscribe/payment-proof?plan=${selectedPlan}`
        );
      } catch (error) {
        console.error(
          "Unable to create subscription request:",
          error
        );

        setSubmitError(
          error instanceof Error
            ? error.message
            : "Unable to continue with subscription"
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };
  /*
  |--------------------------------------------------------------------------
  | Loading onboarding data
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin"
          />

          <p className="text-[12px] text-white/70">
            Preparing checkout...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Missing registration context
  |--------------------------------------------------------------------------
  */

  if (!onboarding) {
    return (
      <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-5 text-white">
        <Image
          src="/images/Background_1.png"
          alt="Background"
          fill
          priority
          className="pointer-events-none object-cover"
        />

        <div className="relative z-10 w-full max-w-[390px] rounded-2xl border border-white/10 bg-black/80 px-5 py-8 text-center">
          <h1 className="text-[22px] font-extrabold">
            Registration information
            unavailable
          </h1>

          <p className="mt-3 text-[13px] leading-5 text-white/65">
            We could not find the
            organisation associated
            with this subscription.
            Complete organisation
            registration before
            continuing.
          </p>

          <Link
            href="/register"
            className="mt-6 flex h-[44px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold text-white"
          >
            Return to Registration
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto max-w-[430px] px-2 pb-8 pt-5">
        {/* Header */}

        <header className="relative flex items-center justify-center">
          <Link
            href={`/subscribe/details?plan=${selectedPlan}`}
            className="absolute left-1 text-white"
          >
            <ArrowLeft
              size={19}
            />
          </Link>

          <h2 className="text-[12px] font-bold">
            Payment
          </h2>
        </header>

        {/* Intro */}

        <section className="mt-9 grid grid-cols-[1fr_132px] items-center gap-2">
          <div>
            <h1 className="text-left text-[30px] font-extrabold leading-[34px] tracking-[-0.5px]">
              Purchase with
              cryptocurrency
            </h1>

            <p className="mt-4 max-w-[235px] text-left text-[13px] font-bold leading-[16px]">
              After this purchase,
              you will enjoy this
              Online Banking for the
              next 1 month.
              Re-subscribe once it is
              expired.
            </p>
          </div>

          <Image
            src="/images/payment-1.png"
            alt="Crypto payment"
            width={135}
            height={135}
            priority
            className="object-contain"
          />
        </section>

        {/* Organisation */}

        <section className="mt-5 rounded-lg border border-white/10 bg-black/45 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
            Organisation
          </p>

          <p className="mt-1 text-[13px] font-extrabold">
            {onboarding.tenantName}
          </p>

          <p className="mt-1 text-[11px] text-white/50">
            {onboarding.email}
          </p>
        </section>

        {/* Purchase summary */}

        <section className="relative mt-4 overflow-hidden rounded-lg border border-orange-500 bg-black/40 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
          <Image
            src="/images/payment-2.png"
            alt=""
            fill
            className="object-cover opacity-70"
          />

          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-y-1 px-3 py-3 text-left text-[12px] font-medium leading-4">
            <span>
              Purchase Amount:
            </span>

            <span className="text-[26px] font-extrabold leading-6">
              {currentPlan.price}
            </span>

            <span>
              Service subscribed:
            </span>

            <span className="font-extrabold">
              {
                currentPlan.serviceType
              }
            </span>

            <span>
              Subscription type:
            </span>

            <span className="font-extrabold">
              {
                currentPlan.name
              }
            </span>

            <span>
              Payment method:
            </span>

            <span className="font-extrabold">
              Cryptocurrency
            </span>
          </div>
        </section>

        {/* Payment coins */}

        <section className="mt-4 rounded-t-xl bg-white px-2 pb-7 pt-3 text-black shadow-[0_0_18px_rgba(255,255,255,0.35)]">
          <h2 className="mb-2 text-left text-[13px] font-extrabold">
            Choose Payment Coin
          </h2>

          <div className="space-y-3">
            {coins.map(
              (coin) => {
                const hasAddress =
                  Boolean(
                    coin.address,
                  );

                return (
                  <div
                    key={
                      coin.name
                    }
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-[13px] font-extrabold">
                        {
                          coin.name
                        }
                      </h3>

                      <span className="text-[11px] font-semibold">
                        {
                          coin.network
                        }
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={
                        !hasAddress
                      }
                      onClick={() =>
                        copyAddress(
                          coin.name,
                          coin.address,
                        )
                      }
                      className="flex h-[27px] w-full items-center justify-between rounded-full border border-black/15 px-3 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="truncate text-[11px] text-black">
                        {!hasAddress
                          ? "Payment address not configured"
                          : copiedCoin ===
                              coin.name
                            ? "Copied!"
                            : coin.address}
                      </span>

                      {copiedCoin ===
                      coin.name ? (
                        <Check
                          size={17}
                          className="shrink-0 text-green-600"
                        />
                      ) : (
                        <Copy
                          size={17}
                          className="shrink-0 text-blue-700"
                        />
                      )}
                    </button>
                  </div>
                );
              },
            )}
          </div>

          {/* Instructions */}

          <ul className="mt-6 list-disc space-y-2 pl-5 text-left text-[11px] leading-[13px] text-black/55">
            <li>
              Send payment only
              through the network
              displayed for your
              selected coin.
            </li>

            <li>
              Copy the payment
              address above and
              complete the transfer
              using your
              cryptocurrency
              wallet.
            </li>

            <li>
              After completing the
              payment, continue to
              upload your payment
              proof for review and
              activation.
            </li>
          </ul>

          {/* Continue */}

          <div className="mt-8">
  {submitError && (
    <div className="mb-3 rounded-lg border border-red-500/30 bg-red-50 px-3 py-2 text-left text-[11px] font-medium text-red-700">
      {submitError}
    </div>
  )}

  <button
    type="button"
    onClick={
      continueToPaymentProof
    }
    disabled={
      submitting
    }
    className="flex h-[42px] w-full items-center justify-center gap-3 rounded-xl bg-blue-700 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
  >
    {submitting ? (
      <>
        <Loader2
          size={18}
          className="animate-spin"
        />

        Creating subscription...
      </>
    ) : (
      <>
        Upload Payment Proof

        <ArrowRight
          size={18}
        />
      </>
    )}
  </button>
</div>
        </section>
      </div>
    </main>
  );
}