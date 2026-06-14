"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function RegisterOtpPage() {

  const [countdown, setCountdown] = useState(30);

useEffect(() => {
  if (countdown <= 0) return;

  const timer = setInterval(() => {
    setCountdown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [countdown]);
  return (
    <main
      className=" relative min-h-screen overflow-hidden px-5 pb-10 pt-[126px] text-white"
style={{
        background:
          "radial-gradient(ellipse 100% 85% at 0% 100%, #d8d8d8 0%, #c91515 42%, #151515 100%)",
      }}
    >
      <Link href="/register" className="absolute left-4 top-12 z-30 text-white">
        <ArrowLeft size={22} />
      </Link>

      <section className="relative mx-auto max-w-[340px] rounded-[10px] border-[4px] border-[#d6c51f] bg-black px-3 pb-8 pt-5 shadow-2xl">
        <button
          type="button"
          className="absolute left-3 top-6 text-black/40"
          aria-label="close"
        >
          <X size={16} />
        </button>

        <h1 className="mb-6 text-center text-[22px] font-extrabold leading-none">
          tier-1 OTP
        </h1>

        <div className="flex justify-center">
          <Image
            src="/images/otp.png"
            alt="OTP verification"
            width={242}
            height={143}
            className="h-[143px] w-[242px] object-cover"
            priority
          />
        </div>

        <div className=" font-lato mt-6 text-center text-[14px] font-medium leading-[17px]">
          <p>Here’s the chance to finally get that long awaited funds</p>

          <p className="mt-3">
            Reach out to our customer care agent for account upgrade, genuity
            check, and OTP!
          </p>
        </div>

        <div className="mx-auto my-5 w-[86%] border-b border-white/70" />

        <label className="pl-1 text-[13px] font-bold">Input OTP</label>

        <div className="mt-2 grid grid-cols-6 gap-2 px-4">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              title={`OTP digit ${i + 1}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              className="h-[38px] rounded-[4px] bg-white text-center text-lg font-bold text-[#b7d8c9] outline-none"
            />
          ))}
        </div>

        <button
  type="button"
  disabled={countdown > 0}
  onClick={() => setCountdown(30)}
  className={`font-roboto mt-3 ml-auto flex h-[36px] w-[500px] items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300 ${
    countdown > 0
      ? "cursor-not-allowed border border-white/20 bg-[#6f6f6f] text-white/45 opacity-60 shadow-inner"
      : "cursor-pointer"
  }`}
>
  {countdown > 0 ? `Get OTP (${countdown}s)` : "Get OTP"}
</button>

        <Link
          href="/dashboard"
          className="mt-10 block w-[86%] mx-auto rounded-[10px] bg-[#2458e8] py-3 text-center text-[15px] font-bold text-white"
        >
          Finish Signup
        </Link>
      </section>
    </main>
  );
}