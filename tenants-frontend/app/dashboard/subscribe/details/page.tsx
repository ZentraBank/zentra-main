"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Video } from "lucide-react";

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
  }
> = {
  bronze: {
    name: "Bronze",
    price: "$40",
    title: "Bronze Plan",
    description:
      "Send in-app notifications to front-end users regarding account updates or upgrades.",
    accent: "#8B4A2B",
  },
  gold: {
    name: "Gold",
    price: "$80",
    title: "Gold Plan",
    description:
      "Edit client account balance, transaction records, payment receipts, and important account information.",
    accent: "#D4AF37",
  },
  diamond: {
    name: "Diamond",
    price: "$120",
    title: "Diamond Plan",
    description:
      "Get full premium access to control client account visibility, notifications, receipts, donations, upgrades, and more.",
    accent: "#2563EB",
  },
};

export default function SubscribeDetailsPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan")?.toLowerCase();

  const selectedPlan: PlanKey =
    planParam === "gold" || planParam === "diamond" || planParam === "bronze"
      ? planParam
      : "bronze";

  const currentPlan = planDetails[selectedPlan];

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
        <Link href="/subscribe" className="absolute left-4 top-4 z-30 text-white">
          <ArrowLeft size={20} />
        </Link>

        <h1 className="text-center text-[36px] font-semibold leading-none tracking-[1.5px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[56px]">
          Subscribe!
        </h1>

        <section className="mt-8 rounded-none bg-white px-4 pb-2 pt-2 shadow-[0_0_12px_rgba(255,255,255,0.25)]">
          <h2 className="text-center text-[20px] font-black leading-6 text-black">
            Choose Plan
          </h2>

          <div className="mt-2 grid grid-cols-3 gap-2">
            {plans.map((plan) => {
              const slug = plan.toLowerCase() as PlanKey;
              const active = slug === selectedPlan;

              return (
                <Link
                  key={plan}
                  href={`/subscribe/details?plan=${slug}`}
                  className={`flex h-[18px] items-center justify-center rounded-[6px] text-[11px] font-medium transition ${
                    active
                      ? "bg-blue-700 text-black"
                      : "bg-gray-500 text-black"
                  }`}
                >
                  {plan}
                </Link>
              );
            })}
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

          <div className="absolute top-1/2 flex h-[24px] w-[152px] -translate-y-1/2 items-center justify-center border-2 border-green-500 bg-white/5 text-[16px] font-semibold tracking-[4px] text-blue-700">
            Subscribe!
          </div>
        </section>

        <section className="mt-5">
          <div
            className="flex h-[16px] items-center justify-between px-2 text-[10px] font-bold text-white"
            style={{ backgroundColor: currentPlan.accent }}
          >
            <span>{currentPlan.name}</span>
            <span>{currentPlan.price}</span>
          </div>

          <div className="rounded-[16px] bg-white px-3 py-3 text-black shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
            <h2 className="text-[27px] font-black leading-[30px] tracking-[-0.5px]">
              {currentPlan.title}: {currentPlan.description}
            </h2>
          </div>
        </section>

        <div className="mt-3 flex justify-center">
          <Link
            href="/subscribe/features"
            className="rounded-full bg-white px-4 py-1 text-[12px] font-medium text-black shadow"
          >
            See all plan features
          </Link>
        </div>

        <div className="mt-3 flex justify-end">
          <Link
            href="/subscribe/how-to-use"
            className="inline-flex h-[23px] items-center gap-2 rounded-full bg-white/30 px-3 text-[11px] font-medium text-white backdrop-blur"
          >
            How to use this website
            <Video size={15} className="text-black/70" />
          </Link>
        </div>

        <div className="mt-auto flex justify-center pt-10">
          <Link
            href={`/subscribe/checkout?plan=${selectedPlan}`}
            className="flex h-[30px] w-[206px] items-center justify-center gap-2 rounded-[9px] bg-blue-700 text-[14px] font-medium text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)] md:h-[46px] md:w-[300px] md:text-[17px]"
          >
            Subscribe now
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}