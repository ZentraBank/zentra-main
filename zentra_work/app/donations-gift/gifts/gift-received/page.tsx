"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeft } from "lucide-react";
import TierOneOtpOverlay from "@/components/gift/TierOneOtpOverlay";
import { useState } from "react";

const giftDetails = [
  ["Current account status", "Unverified!", "text-[#2458E8]"],
  ["Teir-2 Redemption fee", "$700", "text-[#E15A3E]"],
  ["Transaction date", "Sun. July 03, 2025"],
  ["Available Balance", "$101,234.56"],
  ["Transaction time", "03:02 PM"],
  ["Service charge", "$121.95"],
  ["Transaction ID", "98234723948"],
  ["Customer Care", "1-800-XXX-XXXX"],
  ["Type", "InterBank"],
];

export default function GiftReceivedPage() {
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#8EF2A8] px-5 pb-6 pt-5 text-[#5f5f5f] lg:px-12 lg:py-16"
      style={{
        backgroundImage: "url('/images/gifts-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Mobile Layout Wrapper */}
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col lg:hidden">
        <header className="relative flex items-center justify-center">
          <Link href="/donation" className="absolute left-0 text-[#333]">
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Gift
          </h1>
        </header>

        <div className="mt-5 flex flex-col items-center">
          <div className="relative flex h-[220px] w-[220px] items-center justify-center">
            <div className="absolute inset-[10px]" />

            <Image
              src="/images/gifts-avatar1.png"
              alt="Gift received"
              width={240}
              height={240}
              priority
              className="relative z-10 object-contain"
            />
          </div>

          <h2 className="mt-5 text-[33px] font-semibold leading-none tracking-[0.03em] text-[#2458E8]">
            $100,000
          </h2>

          <p className="mt-2 text-[13px] font-semibold text-[#222]">
            Gift Received!
          </p>

          <div className="mt-1 h-[16px] w-[270px] overflow-hidden rounded-full bg-white">
            <p className="text-center text-[12px] leading-[16px] text-[#E18A00]">
              Expires in 24hrs
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 text-[13px]">
            <span className="font-bold text-[#555]">00</span>
            <span className="text-[#222]">Days</span>

            <span className="font-bold text-[#111]">09</span>
            <span className="text-[#222]">Hrs</span>

            <span className="font-bold text-[#111]">02</span>
            <span className="text-[#222]">Min</span>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[12px] text-[#777]">
              Incoming from{" "}
              <ArrowDownLeft
                size={14}
                className="ml-2 inline-block text-[#168d5a]"
              />
            </p>

            <p className="mt-1 text-[18px] font-semibold text-[#3f3f3f]">
              McCray Jane
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {giftDetails.map(([label, value, valueClassName]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-5 text-[14px]"
            >
              <p className="shrink-0 text-[#666]">{label}</p>

              <p
                className={`text-right font-medium text-[#444] ${
                  valueClassName || ""
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 -mx-5 mt-auto bg-white/35 px-5 pb-4 pt-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setShowOtpOverlay(true)}
            className="flex h-[43px] w-full items-center justify-center rounded-[9px] bg-[#2458E8] text-[15px] font-bold text-white"
          >
            Redeem $700 - tier 1
          </button>

          <p className="mt-3 text-center text-[13px] font-medium text-[#E23A2E]">
            You can redeem this Gift as fast as you can
          </p>
        </div>
      </section>

      {/* Desktop Layout Wrapper */}
      <section className="hidden lg:mx-auto lg:flex lg:w-full lg:max-w-[1200px] lg:flex-col">
        <header className="relative mb-8 flex items-center justify-between rounded-[24px] border border-black/5 bg-white/40 px-8 py-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/donation"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#555] shadow-sm transition hover:bg-white/80"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="font-heading text-[22px] font-black tracking-tight text-[#222]">
                Gift Redemption Portal
              </h1>
              <p className="mt-0.5 text-xs text-black/50">
                Review incoming transfer details, account standing, and secure your funds.
              </p>
            </div>
          </div>

          <div className="rounded-full bg-amber-500/10 px-4 py-2 border border-amber-500/20">
            <p className="text-xs font-bold text-amber-700">Expires in 24hrs</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Hero & Countdown Column */}
          <div className="col-span-5 flex flex-col justify-between rounded-[28px] border border-black/5 bg-white/45 p-8 backdrop-blur-md shadow-sm">
            <div>
              <div className="relative flex justify-center py-6">
                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl" />
                <Image
                  src="/images/gifts-avatar1.png"
                  alt="Gift received"
                  width={220}
                  height={220}
                  priority
                  className="relative z-10 object-contain drop-shadow-lg"
                />
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-[44px] font-black tracking-tight text-[#2458E8]">
                  $100,000
                </h2>
                <p className="mt-1 text-base font-bold text-[#222]">
                  Gift Received!
                </p>

                <div className="mt-6 flex items-center justify-center gap-4 rounded-[16px] bg-white/60 p-4 border border-black/5">
                  <div className="text-center px-3">
                    <p className="text-xl font-black text-[#333]">00</p>
                    <p className="text-[10px] uppercase font-semibold text-black/40">Days</p>
                  </div>
                  <div className="text-black/25 font-bold text-lg">:</div>
                  <div className="text-center px-3">
                    <p className="text-xl font-black text-[#2458E8]">09</p>
                    <p className="text-[10px] uppercase font-semibold text-black/40">Hrs</p>
                  </div>
                  <div className="text-black/25 font-bold text-lg">:</div>
                  <div className="text-center px-3">
                    <p className="text-xl font-black text-[#2458E8]">02</p>
                    <p className="text-[10px] uppercase font-semibold text-black/40">Min</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-medium text-[#777]">
                    Incoming from{" "}
                    <ArrowDownLeft
                      size={14}
                      className="ml-1 inline-block text-[#168d5a]"
                    />
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-[#3f3f3f]">
                    McCray Jane
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-black/5">
              <button
                type="button"
                onClick={() => setShowOtpOverlay(true)}
                className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2458E8] text-base font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600 active:scale-[0.99]"
              >
                Redeem $700 - tier 1
              </button>

              <p className="mt-3 text-center text-xs font-semibold text-[#E23A2E]">
                You can redeem this Gift as fast as you can
              </p>
            </div>
          </div>

          {/* Right Details Grid Column */}
          <div className="col-span-7 rounded-[28px] border border-black/5 bg-white/45 p-8 backdrop-blur-md shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-[#333] mb-6">
                Transaction Breakdown & Verification
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {giftDetails.map(([label, value, valueClassName]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[16px] bg-white/60 px-5 py-4 border border-black/5 transition hover:bg-white/80"
                  >
                    <p className="text-sm font-medium text-[#666]">{label}</p>

                    <p
                      className={`text-sm font-bold text-[#444] ${
                        valueClassName || ""
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[16px] bg-blue-500/5 p-4 border border-blue-500/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#2458E8]">Need assistance with tier-1 verification?</p>
                <p className="text-[11px] text-black/50 mt-0.5">Our support team is available 24/7 to help process your gift transfer.</p>
              </div>
              <span className="text-xs font-bold text-[#2458E8] bg-white px-3 py-1.5 rounded-lg shadow-xs">
                Contact Care
              </span>
            </div>
          </div>
        </div>
      </section>

      <TierOneOtpOverlay
        open={showOtpOverlay}
        onClose={() => setShowOtpOverlay(false)}
        onSubmit={(otp) => {
          console.log("Entered OTP:", otp);

          // later:
          // router.push("/gift/success");
        }}
      />
    </main>
  );
}