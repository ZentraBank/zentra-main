"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, X, LogIn } from "lucide-react";

export default function RegisterPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  

  return (
    <main className="relative min-h-screen overflow-hidden"
    style={{
    backgroundImage: "url('/images/Background_2.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top right",
  }}
    >
      {/* Back Arrow - outside card */}
      <Link href="/" className="absolute left-3 top-5 z-50 !text-white">
        <ArrowLeft size={20} />
      </Link>

      <AuthCard>
        {/* Title + Cancel */}
        <div className="relative mb-4">
          <h1 className="text-center text-[32px] font-bold leading-none text-white">
            Sign up
          </h1>

          <Link
            href="/"
            className="absolute right-1 top-1/2 -translate-y-1/2 !text-white"
          >
            <X size={20} />
          </Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-br-none rounded-tr-[58px] bg-gradient-to-r from-[#246BFF] via-[#2F73FF] to-[#A9A9A9]">
          <div className="flex h-[84px] items-center justify-center">
            <Image
              src="/images/register.png"
              alt="Signup illustration"
              width={108}
              height={98}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <p className="mb-3 text-[12px] leading-[15px] text-white">
          Signup to use this tool in making clients pay without anything from
          A-Z.
        </p>

        <form className="space-y-3">
          {/* Email / Phone Switch */}
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

          {/* Dynamic Input */}
          {method === "email" ? (
            <input
              type="email"
              placeholder="example@gmail.com"
              className="h-[25px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white"
            />
          ) : (
            <div className="flex h-[25px] w-full items-center border-b border-white/70">
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

          <div>
            <label className="text-[11px] font-semibold text-white">
              Create Password:
            </label>

            <div className="mt-1.5 flex justify-center gap-4">
              {[...Array(5)].map((_, i) => (
                <input title="Create Password"
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
                <input title="Confirm Password"
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
            className="mt-7 block w-full rounded-[8px] bg-[#2458E8] py-3 text-center text-[13px] font-semibold !text-white"
          >
            Sign up
          </Link>
        </form>

        <div className="mx-auto mt-1.5 h-[2px] w-[130px] bg-white/60" />

        <p className="mt-2 text-center text-[11px] text-white">
          Or Signup with:
        </p>

        <div className="mt-3 flex justify-center gap-5">
          <button className="transition hover:scale-110">
            <Image src="/images/facebook.png" alt="Facebook" width={40} height={40} />
          </button>

          <button className="transition hover:scale-110">
            <Image src="/images/instagram.png" alt="Instagram" width={40} height={40} />
          </button>

          <button className="transition hover:scale-110">
            <Image src="/images/google.png" alt="Google" width={40} height={40} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-9 text-[11px] text-white">
          <span>Have an Account?</span>

          <Link href="/login" className="flex items-center gap-3 !text-white">
            Login
            <LogIn size={14} className="text-green-500" />
          </Link>
        </div>

        <div className="mt-7 flex justify-center gap-8 text-[11px] text-white">
          <Link href="#" className="!text-white">
            Privacy Policy
          </Link>

          <Link href="#" className="!text-white">
            Terms and Conditions
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}