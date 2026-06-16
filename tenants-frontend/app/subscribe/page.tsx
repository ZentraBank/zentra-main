"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Video,
  Gem,
  BellRing,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

const planDetails = {
  Bronze: {
    price: "$10",
    bandColor: "#CD7F32", // Bronze
    buttonColor: "#B87333",
    ring: "/images/ring1.png",
    title: "Bronze Plan",
    feature:
      "View client account information, account balances, receipts, transaction history, next-of-kin information, and profile details without editing permissions.",
  },

  Gold: {
    price: "$20",
    bandColor: "#D4AF37", // Gold
    buttonColor: "#C9A227",
    ring: "/images/ring1.png",
    title: "Gold Plan",
    feature:
      "Edit client account balances, modify receipts, update next-of-kin details, manage account information, and perform selected account administration tasks.",
  },

  Diamond: {
    price: "$40",
    bandColor: "#3D8D69", // Emerald
    buttonColor: "#2D6E53",
    ring: "/images/ring1.png",
    title: "Diamond Plan",
    feature:
      "Diamond Plan: Send in-app notifications to front-end users regarding account updates or upgrades.",
  },
} as const;

const plans = Object.keys(planDetails) as Array<keyof typeof planDetails>;

export default function DiamondSubscribePage() {
  const [selectedPlan, setSelectedPlan] =
  useState<keyof typeof planDetails>("Diamond");

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

      <div className="relative z-50 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-3 pb-8 pt-9 text-center lg:max-w-6xl lg:px-10 lg:pt-16">
        <Link
          href="/dashboard"
          className="absolute left-3 top-11 z-50 text-white lg:left-10 lg:top-10"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* MOBILE */}
        <div className="lg:hidden">
          <h1 className="text-[34px] font-semibold leading-none tracking-[1px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)]">
            Subscribe!
          </h1>

          <PlanSelector
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />

          <div className="relative mt-5 flex justify-center">
            <Image
              src={currentPlan.ring}
              alt={currentPlan.title}
              width={130}
              height={130}
              priority
              className="h-[118px] w-[118px] object-contain"
            />
          </div>

          <FeatureCard
            title={currentPlan.title}
            price={currentPlan.price}
            feature={currentPlan.feature}
            bandColor={currentPlan.bandColor}
          />

          <div className="mt-3 flex justify-center">
            <Link
              href={`/subscribe/features/${selectedPlan.toLowerCase()}`}
              className="inline-flex h-7 items-center justify-center rounded-full bg-white px-5 shadow-md"
            >
              <span className="text-[11px] font-semibold !text-black">
                See all plan features
              </span>
            </Link>
          </div>

          <div className="mt-4 flex justify-end pr-2">
            <Link
              href="/help"
              className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-[11px] font-medium text-white"
            >
              How to use this website
              <Video size={13} />
            </Link>
          </div>

          <div className="flex-1" />

          <div className="mt-10 flex justify-center pb-3">
            <Link
              href={`/subscribe/checkout?plan=${selectedPlan.toLowerCase()}`}
              className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
            >
              Subscribe to {selectedPlan}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden min-h-[calc(100svh-90px)] items-center lg:grid lg:grid-cols-[1fr_420px] lg:gap-12">
          <section className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 backdrop-blur">
              <Gem size={16} />
              {currentPlan.title}
            </div>

            <h1 className="mt-6 max-w-[650px] text-[70px] font-extrabold leading-[76px] tracking-[-1.8px] text-blue-500 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_0.8)]">
              Upgrade to {selectedPlan} access
            </h1>

            <p className="mt-6 max-w-[580px] text-[18px] font-medium leading-[30px] text-white/75">
              Get full subscription access and unlock advanced client-facing
              controls for updates, account messages, and premium actions.
            </p>

            <div className="mt-8 grid max-w-[620px] grid-cols-3 gap-4">
              {[
                { icon: BellRing, title: "Notify", desc: "Send updates" },
                { icon: ShieldCheck, title: "Control", desc: "Manage access" },
                { icon: WalletCards, title: "Billing", desc: "Client actions" },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur"
                >
                  <Icon size={24} className="text-blue-300" />
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-white/55">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <Link
                href={`/subscribe/checkout?plan=${selectedPlan.toLowerCase()}`}
                className="inline-flex h-14 w-[280px] items-center justify-center gap-3 rounded-2xl bg-blue-700 text-[16px] font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)] transition hover:bg-blue-800"
              >
                Subscribe to {selectedPlan}
                <ArrowRight size={20} />
              </Link>

              <Link
                href={`/subscribe/features/${selectedPlan.toLowerCase()}`}
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 text-[15px] font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                See all features
              </Link>
            </div>
          </section>

          <section className="rounded-[34px] border border-white/15 bg-white/[0.08] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <PlanSelector
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              desktop
            />

            <div className="mt-8 flex justify-center">
              <Image
                src={currentPlan.ring}
                alt={currentPlan.title}
                width={300}
                height={300}
                priority
                className="h-[300px] w-[300px] object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
              />
            </div>

            <FeatureCard
            title={currentPlan.title}
            price={currentPlan.price}
            feature={currentPlan.feature}
            bandColor={currentPlan.bandColor}
            desktop
          />

            <Link
              href="/help"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white"
            >
              How to use this website
              <Video size={15} />
            </Link>
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
  selectedPlan: keyof typeof planDetails;
  setSelectedPlan: (plan: keyof typeof planDetails) => void;
  desktop?: boolean;
}) {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 9999,
        marginTop: desktop ? "0px" : "36px",
        borderRadius: desktop ? "18px" : "0px",
        borderTop: "2px solid #2563eb",
        borderBottom: "2px solid #2563eb",
        borderLeft: desktop ? "2px solid #2563eb" : "none",
        borderRight: desktop ? "2px solid #2563eb" : "none",
        backgroundColor: "#ffffff",
        padding: desktop ? "16px" : "8px 12px 10px",
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
          gap: desktop ? "14px" : "8px",
        }}
      >
        {plans.map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => setSelectedPlan(plan)}
            style={{
              height: desktop ? "46px" : "24px",
              borderRadius: desktop ? "12px" : "6px",
              border: "none",
              cursor: "pointer",
              transition: "all .3s ease",
              backgroundColor:
                selectedPlan === plan
                  ? planDetails[plan].buttonColor
                  : "#9CA3AF",
              color:
                selectedPlan === plan
                  ? "#FFFFFF"
                  : "#000000",
              fontSize: desktop ? "15px" : "11px",
              fontWeight: 700,
              boxShadow:
                selectedPlan === plan
                  ? "0 0 12px rgba(255,255,255,.25)"
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

function FeatureCard({
  title,
  price,
  feature,
  bandColor,
  desktop = false,
}: {
  title: string;
  price: string;
  feature: string;
  bandColor: string;
  desktop?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden border border-white/20 shadow-[0_0_12px_rgba(37,99,235,0.45)] ${
        desktop
          ? "mt-8 rounded-[24px]"
          : "mx-2 mt-5 rounded-[20px]"
      }`}
    >
      <div
        style={{
          backgroundColor: bandColor,
        }}
        className={`flex items-center justify-between font-bold text-white ${
          desktop
            ? "h-[32px] px-5 text-[14px]"
            : "h-[22px] px-3 text-[11px]"
        }`}
      >
        <span>{title}</span>
        <span>{price}</span>
      </div>

      <div className="bg-[#F5F5F5] px-4 py-4 text-left md:p-5">
        <h2
          className={`font-black text-black ${
            desktop
              ? "text-[28px] leading-[38px]"
              : "text-[28px] leading-[36px]"
          }`}
        >
          {feature}
        </h2>
      </div>
    </section>
  );
}