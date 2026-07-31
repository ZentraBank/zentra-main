// components/auth/AuthOverlay.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, X, LogIn } from "lucide-react";

type AuthStep = "register" | "otp" | "biometric" | "login";

type AuthOverlayProps = {
  open: boolean;
  mode: "register" | "login";
  onClose: () => void;
};

export default function AuthOverlay({ open, mode, onClose }: AuthOverlayProps) {
  const [step, setStep] = useState<AuthStep>(mode);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (open) {
      setStep(mode);
      setMethod("email");
      setCountdown(30);
    }
  }, [open, mode]);

  useEffect(() => {
    if (step !== "otp" || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4 py-6">
      <section className="relative max-h-[706px] w-full max-w-[360px] overflow-y-auto rounded-[18px] bg-white px-4 pb-6 pt-5 text-[#1f1f1f] shadow-xl md:max-w-[430px] md:px-6">
        {step === "otp" && (
          <button
            type="button"
            onClick={() => setStep("register")}
            className="absolute left-4 top-5 z-20 text-[#555]"
            aria-label="Back to signup"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-5 z-20 text-[#555]"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {step === "register" && (
          <>
            <AuthHeader
              title="Sign up"
              imageAlt="Signup illustration"
              description="Register to experience amazing online banking features and secure account services."
            />

            <form className="mt-3 space-y-3">
              <AuthMethodTabs method={method} setMethod={setMethod} />

              <AuthInput method={method} />

              <PasswordBoxes label="Create Password:" />
              <PasswordBoxes label="Confirm Password:" />

              <button
                type="button"
                onClick={() => {
                setStep("otp");
                setCountdown(30);
                }}
                className="mt-7 block w-full rounded-[10px] bg-[#1D4ED8] py-3 text-center font-roboto text-[13px] font-semibold text-white shadow-lg"
              >
                Sign up
              </button>
            </form>

            <SocialButtons text="Or Signup with:" />

            <div className="mt-5 flex items-center justify-center gap-3 font-lato text-[11px] text-[#555]">
              <span>Have an Account?</span>

              <button
                type="button"
                onClick={() => setStep("login")}
                className="flex items-center gap-2 text-[#555]"
              >
                Login
                <LogIn size={14} className="text-[#2E8B57]" />
              </button>
            </div>
          </>
        )}

        {step === "login" && (
          <>
            <AuthHeader
              title="Log in"
              imageAlt="Login illustration"
              description="Login to access your secure online banking dashboard and account services."
            />

            <form className="mt-3 space-y-3">
              <AuthMethodTabs method={method} setMethod={setMethod} />

              <AuthInput method={method} />

              <PasswordBoxes label="Password:" />

              <Link
                href="/forgot-password"
                className="block text-[12px] font-medium !text-[#2458E8]"
              >
                Forgot Password?
              </Link>

              <button
                type="button"
                onClick={() => setStep("biometric")}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-[10px] bg-[#1D4ED8] py-3 text-center font-roboto text-[13px] font-semibold !text-white shadow-lg"
                >
                Log in
                <LogIn size={16} className="!text-white" />
                </button>
            </form>

            <SocialButtons text="Or Login with:" />

            <div className="mt-5 flex items-center justify-center gap-3 font-lato text-[11px] text-[#555]">
              <span>Don&apos;t have an account?</span>

              <button
                type="button"
                onClick={() => setStep("register")}
                className="flex items-center gap-2 text-[#555]"
              >
                Sign up
                <LogIn size={14} className="text-[#2E8B57]" />
              </button>
            </div>
          </>
        )}

        {step === "biometric" && (
            <>
                <h1 className="text-center font-sf-condensed text-[36px] text-[#1f1f1f]/60">
                Fingerprint Login
                </h1>

                <div className="mt-5 overflow-hidden rounded-tr-[70px] bg-[#2458E8]">
                <div className="flex h-[120px] items-center justify-center bg-gradient-to-r from-white via-white/70 to-[#2458E8]">
                    <Image
                    src="/images/fingerprint.png"
                    alt="Fingerprint verification"
                    width={120}
                    height={120}
                    className="object-contain"
                    priority
                    />
                </div>
                </div>

                <p className="mt-5 text-center font-lato-medium text-[14px] leading-5 text-[#1f1f1f]/80">
                Use your fingerprint to continue securely into your ZentraBank account.
                </p>

                <button
                type="button"
                onClick={() => {
                    window.location.href = "/dashboard";
                }}
                className="mx-auto mt-8 flex h-[96px] w-[96px] items-center justify-center rounded-full border border-[#2458E8] bg-[#EEF4FF] shadow-lg"
                >
                <Image
                    src="/images/fingerprint.png"
                    alt="Scan fingerprint"
                    width={58}
                    height={58}
                    className="object-contain"
                />
                </button>

                <button
                type="button"
                onClick={() => {
                    window.location.href = "/dashboard";
                }}
                className="mt-8 block w-full rounded-[10px] bg-[#1D4ED8] py-3 text-center font-roboto text-[13px] font-semibold text-white shadow-lg"
                >
                Continue with Fingerprint
                </button>

                <Link
                href="/dashboard"
                className="mt-4 block text-center font-lato text-[12px] font-semibold text-[#555]"
                >
                Skip for now
                </Link>
            </>
            )}
        {step === "otp" && (
          <>
            <h1 className="mb-5 text-center font-sf-condensed text-[36px] text-[#1f1f1f]/60">
              OTP Verification
            </h1>

            <div className="flex justify-center">
              <Image
                src="/images/otp.png"
                alt="OTP verification"
                width={220}
                height={160}
                className="object-contain"
                priority
              />
            </div>

            <div className="mt-5 text-center">
              <p className="font-lato text-[15px] leading-5 text-[#555]">
                We&apos;ve sent a verification code to your registered email or
                phone number.
              </p>

              <p className="mt-2 font-lato text-[14px] leading-5 text-[#888]">
                Enter the 6-digit code below to continue.
              </p>
            </div>

            <div className="mx-auto my-5 h-[1px] w-[90%] bg-[#E5E7EB]" />

            <label className="font-sf-condensed text-[13px] font-bold text-[#555]">
              Enter OTP
            </label>

            <div className="mt-3 grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  title={`OTP digit ${i + 1}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="h-[44px] rounded-lg border border-[#D6D6D6] bg-white text-center text-lg font-bold text-[#2458E8] outline-none focus:border-[#2458E8]"
                />
              ))}
            </div>

            <button
              type="button"
              disabled={countdown > 0}
              onClick={() => setCountdown(30)}
              className={`ml-auto mt-4 flex h-[38px] items-center justify-center rounded-full px-5 text-[13px] font-bold transition-all ${
                countdown > 0
                  ? "cursor-not-allowed bg-[#E5E7EB] text-[#888]"
                  : "bg-[#2458E8] text-white"
              }`}
            >
              {countdown > 0 ? `Resend OTP (${countdown}s)` : "Resend OTP"}
            </button>

            <button
            type="button"
            onClick={() => setStep("biometric")}
            className="mt-8 block w-full rounded-[10px] bg-[#2458E8] py-3 text-center font-roboto text-[15px] font-bold text-white shadow-lg"
            >
            Verify & Continue
            </button>
          </>
        )}

        <div className="mt-7 flex justify-center gap-8 font-lato text-[11px] text-[#555]">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms and Conditions</Link>
        </div>
      </section>
    </div>
  );
}

function AuthHeader({
  title,
  description,
  imageAlt,
}: {
  title: string;
  description: string;
  imageAlt: string;
}) {
  return (
    <>
      <h1 className="text-center font-sf-condensed text-[36px] text-[#1f1f1f]/60">
        {title}
      </h1>

      <div className="mt-5 overflow-hidden rounded-tr-[70px] bg-[#2458E8]">
        <div className="flex h-[96px] items-center justify-center bg-gradient-to-r from-white via-white/70 to-[#2458E8]">
          <Image
            src="/images/register.png"
            alt={imageAlt}
            width={150}
            height={112}
            className="object-contain"
            priority
          />
        </div>
      </div>

      <p className="mt-4 text-center font-lato-medium text-[13px] leading-[15px] text-[#1f1f1f]/80">
        {description}
      </p>
    </>
  );
}

function AuthMethodTabs({
  method,
  setMethod,
}: {
  method: "email" | "phone";
  setMethod: (method: "email" | "phone") => void;
}) {
  return (
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
  );
}

function AuthInput({ method }: { method: "email" | "phone" }) {
  if (method === "email") {
    return (
      <input
        type="email"
        placeholder="example@gmail.com"
        className="h-[32px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6]"
      />
    );
  }

  return (
    <div className="flex h-[32px] w-full items-center border-b border-[#D6D6D6]">
      <select
        title="Country code"
        defaultValue="+44"
        className="h-full bg-transparent pr-1 font-lato text-[13px] text-[#333] outline-none"
      >
        <option value="+44">🇬🇧 +44</option>
        <option value="+234">🇳🇬 +234</option>
        <option value="+1">🇺🇸 +1</option>
        <option value="+33">🇫🇷 +33</option>
        <option value="+91">🇮🇳 +91</option>
      </select>

      <input
        type="tel"
        placeholder="Phone number"
        className="h-full flex-1 bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6]"
      />
    </div>
  );
}

function PasswordBoxes({ label }: { label: string }) {
  return (
    <div>
      <label className="font-sf-condensed text-[12px] font-bold text-[#1f1f1f]/80">
        {label}
      </label>

      <div className="mt-1.5 flex justify-center gap-4">
        {[...Array(5)].map((_, i) => (
          <input
            key={i}
            title={`${label} digit ${i + 1}`}
            type="password"
            maxLength={1}
            className="h-7 w-7 border-b border-[#D6D6D6] bg-transparent text-center text-[13px] font-bold text-[#333] outline-none focus:border-[#2458E8]"
          />
        ))}
      </div>
    </div>
  );
}

function SocialButtons({ text }: { text: string }) {
  return (
    <>
      <div className="mx-auto mt-4 h-[1px] w-[130px] bg-[#D6D6D6]" />

      <p className="mt-2 text-center font-lato text-[11px] text-[#555]">
        {text}
      </p>

      <div className="mt-3 flex justify-center gap-5 rounded-[8px] border border-dashed border-purple-400 py-2">
        <button
          title="Continue with Facebook"
          type="button"
          className="transition hover:scale-110"
        >
          <Image
            src="/images/facebook.png"
            alt="Facebook"
            width={34}
            height={34}
          />
        </button>

        <button
          title="Continue with Instagram"
          type="button"
          className="transition hover:scale-110"
        >
          <Image
            src="/images/instagram.png"
            alt="Instagram"
            width={34}
            height={34}
          />
        </button>

        <button
          title="Continue with Google"
          type="button"
          className="transition hover:scale-110"
        >
          <Image src="/images/google.png" alt="Google" width={34} height={34} />
        </button>
      </div>
    </>
  );
}