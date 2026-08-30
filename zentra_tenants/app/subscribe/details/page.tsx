"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Video,
  X,
} from "lucide-react";
import {
  Suspense,
  useEffect,
  useState,
} from "react";

const plans = [
  "Bronze",
  "Gold",
  "Diamond",
] as const;

type PlanKey =
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
};

const planDetails: Record<
  PlanKey,
  {
    name: string;
    price: string;
    title: string;
    description: string;
    accent: string;
    features: string[];
  }
> = {
  bronze: {
    name: "Bronze",
    price: "$40",
    title: "Bronze Plan",
    description:
      "Send in-app notifications to front-end users regarding account updates or upgrades.",
    accent: "#C0392B",
    features: [
      "Send account update notifications",
      "Send upgrade reminders",
      "Basic client visibility tools",
      "Access to notification controls",
    ],
  },

  gold: {
    name: "Gold",
    price: "$80",
    title: "Gold Plan",
    description:
      "Edit client account balance, transaction records, payment receipts, and important account information.",
    accent: "#F4D03F",
    features: [
      "Edit client balance",
      "Edit transaction records",
      "Update payment receipts",
      "Manage important account details",
      "Includes Bronze features",
    ],
  },

  diamond: {
    name: "Diamond",
    price: "$120",
    title: "Diamond Plan",
    description:
      "Get full premium access to control client account visibility, notifications, receipts, donations, upgrades, and more.",
    accent: "#2E8B57",
    features: [
      "Full premium access",
      "Control account visibility",
      "Manage notifications",
      "Manage receipts",
      "Manage donations",
      "Manage upgrades",
      "Includes Gold and Bronze features",
    ],
  },
};

function SubscribeDetailsContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const planParam =
    searchParams
      .get("plan")
      ?.toLowerCase();

  const [
    showFeatures,
    setShowFeatures,
  ] = useState(false);

  const [
    onboardingReady,
    setOnboardingReady,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Validate onboarding session
  |--------------------------------------------------------------------------
  |
  | Subscription onboarding happens before the tenant has a normal JWT.
  |
  | The temporary onboarding credential is kept in sessionStorage and will
  | eventually be sent only through the X-Onboarding-Token request header.
  |
  */

  useEffect(() => {
    const raw =
      sessionStorage.getItem(
        "zentra_tenant_onboarding"
      );

    if (!raw) {
      router.replace(
        "/register"
      );

      return;
    }

    try {
      const onboarding =
        JSON.parse(
          raw
        ) as TenantOnboardingContext;

      if (
        !onboarding.onboardingToken ||
        !onboarding.onboardingStartedAt ||
        !onboarding.onboardingTokenExpiresIn
      ) {
        sessionStorage.removeItem(
          "zentra_tenant_onboarding"
        );

        router.replace(
          "/register"
        );

        return;
      }

      const expiresAt =
        onboarding.onboardingStartedAt +
        onboarding.onboardingTokenExpiresIn *
          1000;

      if (
        Date.now() >=
        expiresAt
      ) {
        sessionStorage.removeItem(
          "zentra_tenant_onboarding"
        );

        router.replace(
          "/register"
        );

        return;
      }

      setOnboardingReady(
        true
      );
    } catch {
      sessionStorage.removeItem(
        "zentra_tenant_onboarding"
      );

      router.replace(
        "/register"
      );
    }
  }, [router]);

  const selectedPlan: PlanKey =
    planParam === "gold" ||
    planParam === "diamond" ||
    planParam === "bronze"
      ? planParam
      : "bronze";

  const currentPlan =
    planDetails[
      selectedPlan
    ];

  if (!onboardingReady) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-black text-white">
        <p>
          Loading subscription...
        </p>
      </div>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Subscribe background"
        fill
        priority
        className="pointer-events-none z-0 object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-4 pb-7 pt-4 md:max-w-[760px] md:px-8 lg:max-w-6xl lg:px-10">
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="absolute left-4 top-4 z-30 text-white"
          aria-label="Go back"
        >
          <ArrowLeft
            size={20}
          />
        </button>

        <h1 className="text-center text-[36px] font-semibold leading-none tracking-[1.5px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[56px]">
          Subscribe!
        </h1>

        <section className="mt-8 rounded-[6px] bg-white px-4 pb-2 pt-2 shadow-[0_0_12px_rgba(255,255,255,0.25)]">
          <h2 className="text-center text-[20px] font-black leading-6 text-black">
            Choose Plan
          </h2>

          <div className="mt-2 grid grid-cols-3 gap-2">
            {plans.map(
              (plan) => {
                const slug =
                  plan.toLowerCase() as PlanKey;

                const active =
                  slug ===
                  selectedPlan;

                return (
                  <Link
                    key={
                      plan
                    }
                    href={`/subscribe/details?plan=${slug}`}
                    className={`flex h-[18px] items-center justify-center rounded-[6px] text-[11px] font-medium transition ${
                      active
                        ? "bg-blue-700 text-black"
                        : "bg-[#6B7280] text-black"
                    }`}
                  >
                    {plan}
                  </Link>
                );
              }
            )}
          </div>
        </section>

        <section className="relative mt-6 flex justify-center">
          <Image
            src="/images/ring1.png"
            alt="Subscribe ring"
            width={240}
            height={240}
            priority
            className="h-[150px] w-[150px] object-contain md:h-[260px] md:w-[260px]"
          />
        </section>

        <section className="mt-5">
          <div
            className="flex h-[16px] items-center justify-between px-2 text-[10px] font-bold text-white"
            style={{
              backgroundColor:
                currentPlan.accent,
            }}
          >
            <span>
              {
                currentPlan.name
              }
            </span>

            <span>
              {
                currentPlan.price
              }
            </span>
          </div>

          <div className="rounded-[16px] bg-white px-3 py-3 text-black shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
            <h2 className="text-[27px] font-black leading-[30px] tracking-[-0.5px]">
              {
                currentPlan.title
              }
              :{" "}
              {
                currentPlan.description
              }
            </h2>
          </div>
        </section>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setShowFeatures(
                true
              )
            }
            className="rounded-full bg-white px-4 py-1 text-[12px] font-medium text-black shadow"
          >
            See all plan
            features
          </button>
        </div>

        <div className="mt-3 flex justify-end">
          <Link
            href="/subscribe/how-to-use"
            className="inline-flex h-[23px] items-center gap-2 rounded-full bg-white/30 px-3 text-[11px] font-medium !text-white backdrop-blur"
          >
            How to use this
            website

            <Video
              size={15}
              className="text-black/70"
            />
          </Link>
        </div>

        <div className="mt-auto flex justify-center pt-10">
          <Link
            href={`/subscribe/checkout?plan=${selectedPlan}`}
            className="flex h-[30px] w-[206px] items-center justify-center gap-2 rounded-[9px] bg-blue-700 text-[14px] font-medium !text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)] md:h-[46px] md:w-[300px] md:text-[17px]"
          >
            Subscribe now

            <ArrowRight
              size={17}
            />
          </Link>
        </div>
      </div>

      {showFeatures && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 px-3 pb-4 backdrop-blur-sm md:items-center">
          <section className="relative max-h-[86svh] w-full max-w-[430px] overflow-y-auto rounded-[24px] bg-white px-4 pb-5 pt-12 text-black shadow-2xl md:max-w-[860px] md:px-6">
            <button
              type="button"
              onClick={() =>
                setShowFeatures(
                  false
                )
              }
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
            >
              <X
                size={18}
              />
            </button>

            <h2 className="text-center text-[25px] font-black leading-none text-blue-700 md:text-[36px]">
              All Plan
              Features
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {(
                Object.keys(
                  planDetails
                ) as PlanKey[]
              ).map(
                (key) => {
                  const plan =
                    planDetails[
                      key
                    ];

                  return (
                    <article
                      key={
                        plan.name
                      }
                      className="overflow-hidden rounded-[18px] border border-black/10 bg-[#F4F6FA] shadow-md"
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2 text-[13px] font-black text-white"
                        style={{
                          backgroundColor:
                            plan.accent,
                        }}
                      >
                        <span>
                          {
                            plan.name
                          }
                        </span>

                        <span>
                          {
                            plan.price
                          }
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="text-[20px] font-black leading-6">
                          {
                            plan.title
                          }
                        </h3>

                        <p className="mt-2 text-[13px] font-medium leading-5 text-black/70">
                          {
                            plan.description
                          }
                        </p>

                        <ul className="mt-4 space-y-2">
                          {plan.features.map(
                            (
                              feature
                            ) => (
                              <li
                                key={
                                  feature
                                }
                                className="rounded-[10px] bg-white px-3 py-2 text-[12px] font-bold leading-4 shadow-sm"
                              >
                                {
                                  feature
                                }
                              </li>
                            )
                          )}
                        </ul>

                        <Link
                          href={`/subscribe/checkout?plan=${key}`}
                          className="mt-4 flex h-[34px] items-center justify-center rounded-[10px] bg-blue-700 text-[13px] font-bold !text-white"
                        >
                          Choose{" "}
                          {
                            plan.name
                          }
                        </Link>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default function SubscribeDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] items-center justify-center bg-black text-white">
          <p>
            Loading
            details...
          </p>
        </div>
      }
    >
      <SubscribeDetailsContent />
    </Suspense>
  );
}