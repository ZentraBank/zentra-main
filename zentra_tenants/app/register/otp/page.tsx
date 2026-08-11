"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterOtpPage() {
  const router = useRouter();

  const [countdown, setCountdown] = useState(30);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = digit;

    setOtp(newOtp);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleGetOtp = () => {
    setCountdown(30);
    setError("");
  };

  const handleFinishSignup = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (enteredOtp === "123456") {
      router.push("/register/success");
      return;
    }

    setError("Invalid OTP. Please try again.");
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-10 pt-[126px] text-white"
      style={{
        backgroundImage: "url('/images/Background_2.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "top right",
      }}
    >
      <Link href="/register" className="absolute left-4 top-12 z-30 text-white">
        <ArrowLeft size={22} />
      </Link>

      <section className="relative mx-auto max-w-[340px] rounded-[16px] border-[4px] border-[#d6c51f] bg-black/95 px-4 pb-8 pt-5 shadow-2xl">
        <button
          type="button"
          className="absolute left-3 top-6 text-white/40 transition hover:text-white"
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

        <div className="font-lato mt-6 text-center text-[14px] font-medium leading-[17px]">
          <p>Here’s the chance to finally get that long awaited funds</p>

          <p className="mt-3">
            Reach out to our customer care agent for account upgrade, genuity
            check, and OTP!
          </p>
        </div>

        <div className="mx-auto my-5 w-[86%] border-b border-white/70" />

        <div className="mt-6">
          <label className="pl-1 text-[13px] font-bold text-white/90">
            Input OTP
          </label>

          <div className="mt-3 grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                title={`OTP digit ${index + 1}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="h-[44px] rounded-[10px] border border-white/20 bg-white text-center text-[18px] font-black text-[#2458e8] shadow-[0_6px_14px_rgba(0,0,0,0.35)] outline-none transition focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/50"
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-3 text-center text-[12px] font-semibold text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 mx-auto w-[250px]">
          <button
            type="button"
            disabled={countdown > 0}
            onClick={handleGetOtp}
            className={`font-roboto flex h-[39px] w-[250px] items-center justify-center rounded-[14px] text-[14px] font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${
              countdown > 0
                ? "cursor-not-allowed border border-white/10 bg-white/10 text-white/45 shadow-inner"
                : "!bg-white !text-black hover:bg-gray-100"
            }`}
          >
            {countdown > 0 ? `Get OTP in ${countdown}s` : "Get OTP"}
          </button>

          <button
            type="button"
            onClick={handleFinishSignup}
            className="font-roboto flex h-[39px] w-[250px] items-center justify-center rounded-[14px] !bg-[#2458e8] text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(36,88,232,0.45)] transition hover:bg-[#1f4bc7] active:scale-[0.98]"
          >
            Finish Signup
          </button>
        </div>
      </section>
    </main>
  );
}