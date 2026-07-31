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
      className="min-h-screen overflow-hidden bg-[#8EF2A8] px-5 pb-6 pt-5 text-[#5f5f5f]"
      style={{
        backgroundImage: "url('/images/gifts-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        <header className="relative flex items-center justify-center">
          <Link href="/donation" className="absolute left-0 text-[#333]">
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Gift
          </h1>
        </header>

        <div className="mt-5 flex flex-col items-center">
          <div className="relative flex h-[220px] w-[220px] items-center justify-center ">
            <div className="absolute inset-[10px]  " />

            <Image
              src="/images/gifts-avatar.png"
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