"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordOtpPage() {
  const router = useRouter();

  const [otp, setOtp] =
    useState([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const inputRefs =
    useRef<
      Array<HTMLInputElement | null>
    >([]);

  /*
  |--------------------------------------------------------------------------
  | Restore password reset email
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const storedEmail =
      sessionStorage.getItem(
        "zentrabank-password-reset-email",
      );

    if (!storedEmail) {
      router.replace(
        "/forgot-password",
      );

      return;
    }

    setEmail(storedEmail);
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | OTP input
  |--------------------------------------------------------------------------
  */

  const handleOtpChange = (
    value: string,
    index: number,
  ) => {
    const digit = value
      .replace(/\D/g, "")
      .slice(0, 1);

    const newOtp = [...otp];

    newOtp[index] = digit;

    setOtp(newOtp);
    setError("");

    if (
      digit &&
      index < 5
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (
      event.key ===
        "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Paste complete OTP
  |--------------------------------------------------------------------------
  */

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    const pastedOtp =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pastedOtp) {
      return;
    }

    const digits = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pastedOtp
      .split("")
      .forEach(
        (
          digit,
          index,
        ) => {
          digits[index] =
            digit;
        },
      );

    setOtp(digits);
    setError("");

    const nextIndex =
      Math.min(
        pastedOtp.length,
        5,
      );

    inputRefs.current[
      nextIndex
    ]?.focus();
  };

  /*
  |--------------------------------------------------------------------------
  | Continue to password reset
  |--------------------------------------------------------------------------
  |
  | The backend performs the real OTP verification when /auth/reset-password
  | is called on the next page.
  |
  */

  const handleVerifyOtp =
    () => {
      const enteredOtp =
        otp.join("");

      if (
        enteredOtp.length !==
        6
      ) {
        setError(
          "Please enter the 6-digit reset code.",
        );

        return;
      }

      if (
        !/^\d{6}$/.test(
          enteredOtp,
        )
      ) {
        setError(
          "Reset code must contain 6 digits.",
        );

        return;
      }

      if (!email) {
        setError(
          "Your password reset session has expired. Please request a new code.",
        );

        return;
      }

      sessionStorage.setItem(
        "zentrabank-password-reset-code",
        enteredOtp,
      );

      router.push(
        "/forgot-password/reset-password",
      );
    };

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 py-8 text-white"
      style={{
        backgroundImage:
          "url('/images/Background_2.png')",

        backgroundRepeat:
          "no-repeat",

        backgroundSize:
          "cover",

        backgroundPosition:
          "top right",
      }}
    >
      <div className="absolute inset-0 bg-black/25" />

      <Link
        href="/forgot-password"
        className="absolute left-4 top-10 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md"
      >
        <ArrowLeft
          size={21}
        />
      </Link>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[430px] items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/15 bg-black/80 px-5 pb-7 pt-6 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#2458e8] shadow-lg">
            <ShieldCheck
              size={28}
            />
          </div>

          <h1 className="text-center text-[27px] font-black leading-none">
            Verify Reset Code
          </h1>

          <p className="mx-auto mt-3 max-w-[320px] text-center text-[14px] leading-[19px] text-white/75">
            Enter the
            6-digit reset
            code generated
            for{" "}
            {email ? (
              <span className="font-semibold text-white">
                {email}
              </span>
            ) : (
              "your email"
            )}
            .
          </p>

          <div className="mt-6 flex justify-center">
            <Image
              src="/images/otp.png"
              alt="OTP verification"
              width={230}
              height={136}
              className="h-[136px] w-[230px] rounded-[18px] object-cover"
              priority
            />
          </div>

          <div className="mt-7">
            <label className="text-[13px] font-bold text-white/90">
              Reset Code
            </label>

            <div className="mt-3 grid grid-cols-6 gap-2">
              {otp.map(
                (
                  digit,
                  index,
                ) => (
                  <input
                    key={
                      index
                    }
                    ref={(
                      element,
                    ) => {
                      inputRefs.current[
                        index
                      ] =
                        element;
                    }}
                    title={`Digit ${
                      index +
                      1
                    }`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index ===
                      0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={
                      1
                    }
                    value={
                      digit
                    }
                    onChange={(
                      event,
                    ) =>
                      handleOtpChange(
                        event
                          .target
                          .value,
                        index,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) =>
                      handleKeyDown(
                        event,
                        index,
                      )
                    }
                    onPaste={
                      index ===
                      0
                        ? handlePaste
                        : undefined
                    }
                    className="h-[46px] rounded-[12px] border border-white/10 bg-white text-center text-xl font-black text-[#2458e8] outline-none ring-0 transition focus:border-[#d6c51f] focus:shadow-[0_0_0_3px_rgba(214,197,31,0.25)]"
                  />
                ),
              )}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 text-center text-[12px] font-semibold text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={
              handleVerifyOtp
            }
            className="mt-8 h-[50px] w-full rounded-[14px] bg-[#2458e8] text-[15px] font-black text-white shadow-lg transition hover:bg-[#1f4bc7]"
          >
            Continue
          </button>

          <p className="mt-5 text-center text-[12px] leading-[18px] text-white/55">
            Development
            mode: check the
            backend terminal
            for the password
            reset code.
          </p>
        </div>
      </section>
    </main>
  );
}