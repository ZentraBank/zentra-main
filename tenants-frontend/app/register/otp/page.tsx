"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterOtpPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-10 pt-28 text-white"
      style={{
        background:
          "radial-gradient(ellipse 100% 85% at 0% 100%, #d8d8d8 0%, #c91515 38%, #141414 100%)",
      }}
    >
      {/* OTP CARD WRAPPER */}
      <div className="relative mx-auto max-w-[420px]">
        {/* BACK ARROW - attached to card */}
        <Link
          href="/register"
          className="absolute -left-9 top-2 z-30 text-white transition hover:text-white/70 max-sm:left-0 max-sm:-top-9"
        >
          <ArrowLeft size={24} />
        </Link>

        {/* CARD */}
        <section className="rounded-[10px] border-[4px] border-[#d6c51f] bg-black px-4 pb-7 pt-7 shadow-2xl">
          <h1 className="mb-3 text-center text-[24px] font-extrabold leading-none text-white">
            tier-1 OTP
          </h1>

          {/* SMALL BUTTON BAR */}
          <div className="mb-9 grid h-[24px] grid-cols-2 overflow-hidden rounded-[3px] bg-[#8d8d93] text-center text-[12px] text-black">
            <button className="border-r border-black/20">Button</button>
            <button>Button</button>
          </div>

          {/* IMAGE */}
          <div className="flex justify-center">
            <Image
              src="/images/otp.png"
              alt="OTP verification"
              width={255}
              height={170}
              className="object-contain"
              priority
            />
          </div>

          {/* TEXT */}
          <div className="mt-8 text-center text-[14px] font-bold leading-[17px] text-white">
            <p>Here’s the chance to finally get that long awaited funds</p>

            <p className="mt-3">
              Reach out to our customer care agent for account upgrade,
              genuity check, and OTP!
            </p>
          </div>

          <div className="my-5 border-b border-white/50" />

          {/* OTP INPUT */}
          <label className="text-[14px] font-bold text-white">Input OTP</label>

          <div className="mt-3 grid grid-cols-6 gap-4 max-sm:gap-3">
            {[...Array(6)].map((_, i) => (
              <input title="input"
                key={i}
                type="password"
                maxLength={1}
                className="h-[48px] rounded-[4px] bg-white text-center text-lg font-bold text-black outline-none"
              />
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="mt-9 block w-full rounded-[8px] bg-[#2458e8] py-4 text-center text-[15px] font-bold text-white transition hover:bg-[#1f4fd3]"
          >
            Get OTP
          </Link>
        </section>
      </div>
    </main>
  );
}