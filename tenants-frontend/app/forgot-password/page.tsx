// app/forgot-password/page.tsx

"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, X, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");

  return (
    <main className="auth-bg relative min-h-screen overflow-hidden">
      <Link href="/login" className="absolute left-3 top-5 z-50 !text-white">
        <ArrowLeft size={20} />
      </Link>

      <AuthCard>
        <div className="relative mb-4">
          <h1 className="text-center text-[30px] font-bold leading-none text-white">
            Reset Password
          </h1>

          <Link
            href="/login"
            className="absolute right-1 top-1/2 -translate-y-1/2 !text-white"
          >
            <X size={20} />
          </Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-br-none rounded-tr-[58px] bg-gradient-to-r from-[#246BFF] via-[#2F73FF] to-[#A9A9A9]">
          <div className="flex h-[84px] items-center justify-center">
            <Image
              src="/images/register.png"
              alt="Reset password illustration"
              width={108}
              height={98}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <p className="mb-3 text-[12px] leading-[15px] text-white">
          Enter your email or phone number. We&apos;ll send you a reset code.
        </p>

        <form className="space-y-3">
          <div className="overflow-hidden rounded-t-[10px] border border-[#1647BD]">
            <div className="grid h-[30px] grid-cols-2">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`relative flex items-center justify-center text-[11px] font-bold transition-all ${
                  method === "email"
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                Email
                {method === "email" && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#2458E8]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`relative flex items-center justify-center text-[11px] font-bold transition-all ${
                  method === "phone"
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                Phone
                {method === "phone" && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#2458E8]" />
                )}
              </button>
            </div>
          </div>

          {method === "email" ? (
            <input
              type="email"
              placeholder="example@gmail.com"
              className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white"
            />
          ) : (
            <div className="flex h-[30px] w-full items-center border-b border-white/70">
              <select title="Country code"
                defaultValue="+44"
                className="h-full bg-transparent pr-1 text-[13px] text-white outline-none"
              >
                <option className="text-black" value="+44">
                  🇬🇧 +44
                </option>
                <option className="text-black" value="+234">
                  🇳🇬 +234
                </option>
                <option className="text-black" value="+1">
                  🇺🇸 +1
                </option>
                <option className="text-black" value="+33">
                  🇫🇷 +33
                </option>
                <option className="text-black" value="+91">
                  🇮🇳 +91
                </option>
              </select>

              <input
                type="tel"
                placeholder="Phone number"
                className="h-full flex-1 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white"
              />
            </div>
          )}

          <Link
            href="/forgot-password/otp"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-[8px] bg-[#2458E8] py-3 text-center text-[13px] font-semibold !text-white"
          >
            Send reset code
            <Send size={16} className="!text-white" />
          </Link>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-[12px] font-medium !text-[#2458E8]">
            Remember password? Log in
          </Link>
        </div>

        <div className="mt-20 flex justify-center gap-8 text-[11px] text-white">
          <Link href="/privacy-policy" className="!text-white">
            Privacy Policy
          </Link>

          <Link href="/terms" className="!text-white">
            Terms and Conditions
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}