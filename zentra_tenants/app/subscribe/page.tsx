"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Video, X } from "lucide-react";
import { Suspense, useState } from "react";

const plans = ["Bronze", "Gold", "Diamond"] as const;

type PlanKey = "bronze" | "gold" | "diamond";

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

function SubscribeContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan")?.toLowerCase();
  const [showFeatures, setShowFeatures] = useState(false);

  const selectedPlan: PlanKey =
    planParam === "gold" || planParam === "diamond" || planParam === "bronze"
      ? planParam
      : "bronze";

  const currentPlan = planDetails[selectedPlan];

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white md:flex md:items-center md:justify-center">
      <Image
        src="/images/Background_1.png"
        alt="Subscribe background"
        fill
        priority
        className="pointer-events-none z-0 object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-4 pb-7 pt-4 md:min-h-0 md:max-w-[900px] md:rounded-[28px] md:border md:border-white/10 md:bg-black/80 md:p-12 md:shadow-2xl md:backdrop-blur-xl lg:max-w-[1000px]">
        <Link href="/dashboard" className="absolute left-4 top-4 z-30 text-white md:left-8 md:top-8">
          <ArrowLeft size={20} />
        </Link>

        <h1 className="text-center text-[36px] font-semibold leading-none tracking-[1.5px] text-blue-500 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[52px]">
          Subscribe!
        </h1>

        <section className="mt-8 rounded-[10px] bg-white px-4 py-3 shadow-[0_0_12px_rgba(255,255,255,0.25)] md:mx-auto md:w-full md:max-w-[500px]">
          <h2 className="text-center text-[20px] font-black leading-6 text-black md:text-[22px]">
            Choose Plan
          </h2>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {plans.map((plan) => {
              const slug = plan.toLowerCase() as PlanKey;
              const active = slug === selectedPlan;

              return (
                <Link
                  key={plan}
                  href={`/subscribe/details?plan=${slug}`}
                  className={`flex h-[32px] items-center justify-center rounded-[8px] text-[13px] font-bold transition md:h-[38px] md:text-[14px] ${
                    active ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {plan}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid md:grid-cols-[240px_1fr] md:items-center md:gap-8 md:mt-8">
          <section className="relative mt-6 flex justify-center md:mt-0">
            <Image
              src="/images/ring1.png"
              alt="Subscribe ring"
              width={240}
              height={240}
              priority
              className="h-[150px] w-[150px] object-contain md:h-[220px] md:w-[220px]"
            />
          </section>

          <div className="space-y-3">
            <section className="mt-5 md:mt-0">
              <div
                className="flex h-[20px] items-center justify-between px-3 text-[11px] font-bold text-white md:rounded-t-[8px]"
                style={{ backgroundColor: currentPlan.accent }}
              >
                <span>{currentPlan.name}</span>
                <span>{currentPlan.price}</span>
              </div>

              <div className="rounded-[16px] bg-white px-4 py-4 text-black shadow-[0_8px_18px_rgba(0,0,0,0.25)] md:rounded-t-none">
                <h2 className="text-[22px] font-black leading-[28px] tracking-[-0.5px] md:text-[26px]">
                  {currentPlan.title}: {currentPlan.description}
                </h2>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFeatures(true)}
                className="rounded-full bg-white px-4 py-1.5 text-[12px] font-semibold text-black shadow transition hover:bg-gray-100"
              >
                See all plan features
              </button>

              <Link
                href="/subscribe/how-to-use"
                className="inline-flex h-[28px] items-center gap-2 rounded-full bg-white/20 px-3.5 text-[12px] font-medium !text-white backdrop-blur transition hover:bg-white/30"
              >
                How to use this website
                <Video size={15} className="text-white" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-8 md:pt-10">
          <Link
            href={`/subscribe/checkout?plan=${selectedPlan}`}
            className="flex h-[42px] w-[220px] items-center justify-center gap-2 rounded-[10px] bg-blue-600 text-[15px] font-bold !text-white shadow-[0_8px_18px_rgba(37,99,235,0.4)] transition hover:bg-blue-500 md:h-[50px] md:w-[320px] md:text-[17px]"
          >
            Subscribe now
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {showFeatures && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-3 pb-4 backdrop-blur-sm md:items-center md:p-6">
          <section className="relative max-h-[86svh] w-full max-w-[430px] overflow-y-auto rounded-[24px] bg-white px-4 pb-6 pt-12 text-black shadow-2xl md:max-w-[900px] md:p-10">
            <button
              type="button"
              onClick={() => setShowFeatures(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition hover:bg-gray-800"
            >
              <X size={18} />
            </button>

            <h2 className="text-center text-[25px] font-black leading-none text-blue-600 md:text-[36px]">
              All Plan Features
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
              {(Object.keys(planDetails) as PlanKey[]).map((key) => {
                const plan = planDetails[key];

                return (
                  <article
                    key={plan.name}
                    className="flex flex-col overflow-hidden rounded-[18px] border border-black/10 bg-[#F4F6FA] shadow-md"
                  >
                    <div
                      className="flex items-center justify-between px-4 py-2.5 text-[13px] font-black text-white"
                      style={{ backgroundColor: plan.accent }}
                    >
                      <span>{plan.name}</span>
                      <span>{plan.price}</span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-[18px] font-black leading-6 md:text-[20px]">
                        {plan.title}
                      </h3>

                      <p className="mt-2 text-[12px] font-medium leading-5 text-black/70 md:text-[13px]">
                        {plan.description}
                      </p>

                      <ul className="mt-4 flex-1 space-y-2">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="rounded-[10px] bg-white px-3 py-2 text-[12px] font-bold leading-4 shadow-sm"
                          >
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={`/subscribe/checkout?plan=${key}`}
                        className="mt-5 flex h-[38px] items-center justify-center rounded-[10px] bg-blue-600 text-[13px] font-bold !text-white transition hover:bg-blue-500"
                      >
                        Choose {plan.name}
                      </Link>
                    </div>
                  </article>
                );
              })}
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
          <p>Loading subscription details...</p>
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  );
}