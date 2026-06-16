"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const plans = ["Bronze", "Gold", "Diamond"];

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState("Bronze");

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Subscribe background"
        fill
        priority
        className="pointer-events-none z-0 object-cover"
      />

      <div className="relative z-50 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-4 pb-8 pt-[76px] text-center md:max-w-[720px] md:px-8 md:pt-14 lg:max-w-6xl lg:px-10 lg:pt-16">
        <Link
          href="/dashboard"
          className="absolute left-4 top-[95px] z-50 inline-flex text-white md:left-8 md:top-[110px] lg:left-10 lg:top-10"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* MOBILE + TABLET */}
        <div className="lg:hidden">
          <h1 className="text-[36px] font-semibold leading-none tracking-[1.5px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[56px]">
            Subscribe!
          </h1>

          <p className="mx-auto mt-8 max-w-[315px] text-[13px] font-medium leading-[17px] text-white md:mt-10 md:max-w-[520px] md:text-[18px] md:leading-[28px]">
            You can edit what the client sees in their ZentraBank account such
            as, money transfer receipt, account balance, next-of-kin details,
            donations, etc... You can serve as your client’s bank manager and
            also control all that happens to your clients account.
          </p>

          <p className="mt-5 text-[13px] font-medium md:text-[18px]">
            Subscribe to get started!
          </p>

          <PlanSelector
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />

          <div className="relative mt-7 flex justify-center md:mt-12">
            <Image
              src="/images/ring1.png"
              alt="Subscribe ring"
              width={270}
              height={270}
              priority
              className="h-[245px] w-[245px] object-contain md:h-[360px] md:w-[360px]"
            />
          </div>

          <div className="mt-8 flex justify-center md:mt-10">
            <Link
              href={`/subscribe/checkout?plan=${selectedPlan.toLowerCase()}`}
              className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)] md:w-[340px] md:rounded-2xl md:py-4 md:text-[18px]"
            >
              Subscribe now {selectedPlan}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden min-h-[calc(100svh-100px)] items-center lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <section className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
              <Sparkles size={16} />
              Premium account control
            </div>

            <h1 className="mt-6 max-w-[560px] text-[72px] font-semibold leading-[76px] tracking-[-1.5px] text-blue-500 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_0.8)]">
              Subscribe to unlock ZentraBank
            </h1>

            <p className="mt-6 max-w-[580px] text-[18px] font-medium leading-[30px] text-white/80">
              Edit what the client sees in their ZentraBank account, including
              money transfer receipts, account balance, next-of-kin details,
              donations, and more.
            </p>

            <div className="mt-8 grid max-w-[560px] grid-cols-3 gap-3">
              {[
                { icon: Crown, title: "Premium", desc: "Unlock all tiers" },
                { icon: ShieldCheck, title: "Control", desc: "Manage clients" },
                { icon: Sparkles, title: "Fast", desc: "Instant access" },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur"
                >
                  <Icon size={22} className="text-blue-300" />
                  <h3 className="mt-3 text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-white/55">{desc}</p>
                </div>
              ))}
            </div>

            <Link
              href={`/subscribe/checkout?plan=${selectedPlan.toLowerCase()}`}
              className="mt-10 inline-flex h-14 w-[290px] items-center justify-center gap-3 rounded-2xl bg-blue-700 text-[16px] font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)] transition hover:bg-blue-800"
            >
              Subscribe now {selectedPlan}
              <ArrowRight size={20} />
            </Link>
          </section>

          <section className="rounded-[34px] border border-white/15 bg-white/[0.08] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <PlanSelector
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              desktop
            />

            <div className="mt-10 flex justify-center">
              <Image
                src="/images/ring1.png"
                alt="Subscribe ring"
                width={430}
                height={430}
                priority
                className="h-[430px] w-[430px] object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
              />
            </div>

            <p className="mx-auto mt-6 max-w-[430px] text-[15px] leading-6 text-white/65">
              Select a package, confirm your plan, and activate your
              subscription instantly.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

function PlanSelector({
  selectedPlan,
  setSelectedPlan,
  desktop = false,
}: {
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  desktop?: boolean;
}) {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 9999,
        marginTop: desktop ? "0px" : "16px",
        borderRadius: desktop ? "18px" : "14px",
        border: "2px solid #2563eb",
        backgroundColor: "#ffffff",
        padding: desktop ? "16px" : "8px 14px 10px",
        boxShadow: "0 0 12px rgba(37,99,235,0.95)",
      }}
    >
      <h2
        style={{
          color: "#000000",
          fontSize: desktop ? "28px" : "20px",
          fontWeight: 900,
          lineHeight: desktop ? "34px" : "24px",
          textAlign: "center",
          marginBottom: desktop ? "16px" : "8px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Choose Plan
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: desktop ? "14px" : "10px",
        }}
      >
        {plans.map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => setSelectedPlan(plan)}
            style={{
              height: desktop ? "46px" : "22px",
              borderRadius: desktop ? "12px" : "6px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.25s ease",
              backgroundColor:
                selectedPlan === plan ? "#1d4ed8" : "#6b7280",
              color: selectedPlan === plan ? "#ffffff" : "#000000",
              fontSize: desktop ? "15px" : "11px",
              fontWeight: 700,
              fontFamily: "Arial, sans-serif",
              boxShadow:
                selectedPlan === plan
                  ? "0 0 10px rgba(29,78,216,0.55)"
                  : "none",
            }}
          >
            {plan}
          </button>
        ))}
      </div>
    </section>
  );
}



