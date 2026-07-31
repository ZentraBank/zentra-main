// components/auth/RegisterOverlay.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X, LogIn } from "lucide-react";

type RegisterOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterOverlay({ open, onClose }: RegisterOverlayProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4 py-6">
      <section className="relative max-h-[706px] w-full max-w-[360px] overflow-y-auto rounded-[18px] bg-white px-4 pb-6 pt-5 shadow-xl md:max-w-[430px] md:px-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-5 z-20 text-[#555]"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h1 className="text-center font-sf-condensed text-[36px] text-[#1f1f1f]/60">
          Sign up
        </h1>

        <div className="mt-5 overflow-hidden rounded-tr-[70px] bg-[#2458E8]">
          <div className="flex h-[96px] items-center justify-center bg-gradient-to-r from-white via-white/70 to-[#2458E8]">
            <Image
              src="/images/register.png"
              alt="Signup illustration"
              width={150}
              height={112}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <p className="mt-4 font-lato-medium text-[13px] leading-[15px] text-[#1f1f1f]/80  text-align-center">
          Register to experience amazing online banking features and secure
          account services.
        </p>

        <form className="mt-3 space-y-3">
          <div className="grid h-[34px] grid-cols-2 overflow-hidden rounded-[10px] border border-[#2458E8] bg-[#EEF4FF]">
            <button
              type="button"
              
              onClick={() => setMethod("email")}
              className={`font-sf-condensed text-[14px] transition ${
                method === "email" ? "bg-white text-[#555]" : "text-[#777]"
              }`}
            >
              Email:
            </button>

            <button
              type="button"
              onClick={() => setMethod("phone")}
              className={`font-sf-condensed text-[14px] font-bold transition ${
                method === "phone" ? "bg-white text-[#555]" : "text-[#777]"
              }`}
            >
              Phone:
            </button>
          </div>

          {method === "email" ? (
            <input
              type="email"
              placeholder="example@gmail.com"
              className="h-[32px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6]"
            />
          ) : (
            <div className="flex h-[32px] w-full items-center border-b border-[#D6D6D6]">
              <select
                title="Country code"
                defaultValue="+44"
                className="h-full bg-transparent pr-1 font-lato text-[13px] text-[#333] outline-none"
              >
                <option value="+44">🇬🇧 +44</option>
                <option value="+234">🇳🇬 +234</option>
                <option value="+1">🇺🇸 +1</option>
              </select>

              <input
                type="tel"
                placeholder="Phone number"
                className="h-full flex-1 bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6]"
              />
            </div>
          )}

          <div>
            <label className="font-sf-condensed text-[12px] font-bold text-[#1f1f1f]/80">
              Create Password:
            </label>

            <div className="mt-1.5 flex justify-center gap-4">
              {[...Array(5)].map((_, i) => (
                <input
                  title={`Create password digit ${i + 1}`}
                  key={i}
                  type="password"
                  maxLength={1}
                  className="h-7 w-7 border-b border-[#D6D6D6] bg-transparent text-center text-[13px] font-bold text-[#333] outline-none focus:border-[#2458E8]"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-sf-condensed text-[12px] font-bold text-[#1f1f1f]/80">
              Confirm Password:
            </label>

            <div className="mt-1.5 flex justify-center gap-4">
              {[...Array(5)].map((_, i) => (
                <input
                  title={`Confirm password digit ${i + 1}`}
                  key={i}
                  type="password"
                  maxLength={1}
                  className="h-7 w-7 border-b border-[#D6D6D6] bg-transparent text-center text-[13px] font-bold text-[#333] outline-none focus:border-[#2458E8]"
                />
              ))}
            </div>
          </div>

          <Link
            href="/register/otp"
            className="mt-7 block w-full rounded-[10px] bg-[#1D4ED8] py-3 text-center font-roboto text-[13px] font-semibold text-white shadow-lg"
          >
            Sign up
          </Link>
        </form>

        <div className="mx-auto mt-4 h-[1px] w-[130px] bg-[#D6D6D6]" />

        <p className="mt-2 text-center font-lato text-[11px] text-[#555]">
          Or Signup with:
        </p>

        <div className="mt-3 flex justify-center gap-5 rounded-[8px] border border-dashed border-purple-400 py-2">
          <button title="Sign up with Facebook" type="button" className="transition hover:scale-110">
            <Image src="/images/facebook.png" alt="Facebook" width={34} height={34} />
          </button>

          <button title="Sign up with Instagram" type="button" className="transition hover:scale-110">
            <Image src="/images/instagram.png" alt="Instagram" width={34} height={34} />
          </button>

          <button title="sign up with google" type="button" className="transition hover:scale-110">
            <Image src="/images/google.png" alt="Google" width={34} height={34} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 font-lato text-[11px] text-[#555]">
          <span>Have an Account?</span>

          <Link href="/login" className="flex items-center gap-2 text-[#555]">
            Login
            <LogIn size={14} className="text-[#2E8B57]" />
          </Link>
        </div>

        <div className="mt-7 flex justify-center gap-8 font-lato text-[11px] text-[#555]">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms and Conditions</Link>
        </div>
      </section>
    </div>
  );
}