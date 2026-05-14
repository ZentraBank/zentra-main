"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";

export default function RegisterPage() {
  return (
    <AuthCard>
      {/* <h1 className="mt-10 mb-3 text-center text-[28px] font-extrabold leading-none text-amber-50">
        Sign up
      </h1> */}

      <div className="mb-10 overflow-hidden rounded-br-none rounded-tr-[58px] bg-gradient-to-r from-[#246BFF] via-[#2F73FF] to-[#A9A9A9]">
        <div className="flex h-[84px] items-center justify-center">
          <Image
            src="/images/register.png"
            alt="Signup illustration"
            width={98}
            height={98}
            className="object-contain"
            priority
          />
        </div>
      </div>

      <p className="mb-3 text-[12px] leading-[15px] text-white">
        Signup to use this tool in making clients pay without anything from A-Z.
      </p>

      <form className="space-y-3">
        <div className="grid h-[25px] grid-cols-2 overflow-hidden rounded-t-[10px] border border-[#1647BD]">
          <input
            type="email"
            placeholder="Email:"
            className="bg-white px-1.5 text-[11px] font-bold text-black outline-none placeholder:text-black"
          />
          <input
            type="tel"
            placeholder="Phone:"
            className="bg-black px-1.5 text-[11px] font-bold text-white outline-none placeholder:text-white"
          />
        </div>

        <input
          type="text"
          placeholder="+1-383-383-XXX"
          className="h-[25px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white"
        />

        <div>
          <label className="text-[11px] font-semibold text-white">
            Create Password:
          </label>

          <div className="mt-1.5 flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <input
                key={i}
                type="password"
                maxLength={1}
                className="h-6 w-7 border-b border-white/70 bg-transparent text-center text-[13px] text-white outline-none"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-white">
            Confirm Password:
          </label>

          <div className="mt-1.5 flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <input
                key={i}
                type="password"
                maxLength={1}
                className="h-6 w-7 border-b border-white/70 bg-transparent text-center text-[13px] text-white outline-none"
              />
            ))}
          </div>
        </div>

        <Link
          href="/register/otp"
          className="mt-7 block w-full rounded-[8px] bg-[#2458E8] py-3 text-center text-[13px] font-semibold text-white"
        >
          Sign up
        </Link>
      </form>

      <div className="mx-auto mt-1.5 h-[2px] w-[130px] bg-white/60" />

      <p className="mt-2 text-center text-[11px] text-white">
        Or Signup with:
      </p>

      <div className="mt-3 flex justify-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black text-lg">
          f
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white">
          ◎
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black text-lg">
          G
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-9 text-[11px] text-white">
        <span>Have an Account?</span>

        <Link href="/login" className="flex items-center gap-3">
          Login
          <LogIn size={14} className="text-green-500" />
        </Link>
      </div>

      <div className="mt-7 flex justify-center gap-8 text-[11px] text-white">
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms">Terms and Conditions</Link>
      </div>
    </AuthCard>
  );
}