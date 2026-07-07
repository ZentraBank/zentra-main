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

  const handleFinishSignup = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    // Temporary test OTP. Replace with backend verification later.
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

      <section className="relative mx-auto max-w-[340px] rounded-[10px] border-[4px] border-[#d6c51f] bg-black px-3 pb-8 pt-5 shadow-2xl">
        <button
          type="button"
          className="absolute left-3 top-6 text-white/40"
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

        <label className="pl-1 text-[13px] font-bold">Input OTP</label>

        <div className="mt-2 grid grid-cols-6 gap-2 px-4">
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
              className="h-[38px] rounded-[4px] bg-white text-center text-lg font-bold text-[#2458e8] outline-none"
            />
          ))}
        </div>

        {error && (
          <p className="mt-3 text-center text-[12px] font-semibold text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={countdown > 0}
          onClick={() => setCountdown(30)}
          className={`font-roboto mx-auto mt-4 flex h-[36px] w-[86%] items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300 ${
            countdown > 0
              ? "cursor-not-allowed border border-white/20 bg-[#6f6f6f] text-white/45 opacity-60 shadow-inner"
              : "cursor-pointer bg-white text-black"
          }`}
        >
          {countdown > 0 ? `Get OTP (${countdown}s)` : "Get OTP"}
        </button>

        <button
          type="button"
          onClick={handleFinishSignup}
          className="mx-auto mt-10 block w-[86%] rounded-[10px] bg-[#2458e8] py-3 text-center text-[15px] font-bold text-white transition hover:bg-[#1f4bc7]"
        >
          Finish Signup
        </button>
      </section>
    </main>
  );
}