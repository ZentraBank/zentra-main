"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  authService,
} from "@/services/auth.service";

import {
  getApiErrorMessage,
} from "@/lib/api-client";

import {
  setTenantSlug,
} from "@/lib/tenant";

export default function RegisterOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [countdown, setCountdown] =
    useState(30);

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

  const [message, setMessage] =
    useState("");

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const inputRefs =
    useRef<
      Array<HTMLInputElement | null>
    >([]);

useEffect(() => {
  const queryEmail =
    searchParams.get("email");

  const storedEmail =
    sessionStorage.getItem(
      "zentra_registration_email",
    );

  const storedTenantSlug =
    sessionStorage.getItem(
      "zentra_registration_tenant_slug",
    );

  /*
   * Restore the tenant that owns
   * this invitation/registration.
   */
  if (storedTenantSlug) {
    setTenantSlug(
      storedTenantSlug,
    );
  }

  const resolvedEmail =
    queryEmail ||
    storedEmail ||
    "";

  setEmail(resolvedEmail);

  if (!resolvedEmail) {
    setError(
      "Registration email is missing. Please start signup again.",
    );
  }

  const developmentCode =
    sessionStorage.getItem(
      "zentra_registration_development_code",
    );

  if (developmentCode) {
    setMessage(
      `Development OTP: ${developmentCode}`,
    );
  }
}, [searchParams]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setCountdown(
          (prev) => prev - 1,
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [countdown]);

  const handleOtpChange = (
    value: string,
    index: number,
  ) => {
    const digit =
      value
        .replace(/\D/g, "")
        .slice(0, 1);

    const newOtp = [...otp];

    newOtp[index] =
      digit;

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

  const handleOtpKeyDown = (
    event:
      React.KeyboardEvent<HTMLInputElement>,
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

  const handleOtpPaste = (
    event:
      React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pasted) {
      return;
    }

    event.preventDefault();

    const nextOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted
      .split("")
      .forEach(
        (digit, index) => {
          nextOtp[index] =
            digit;
        },
      );

    setOtp(nextOtp);
    setError("");

    const focusIndex =
      Math.min(
        pasted.length,
        6,
      ) - 1;

    inputRefs.current[
      Math.max(
        focusIndex,
        0,
      )
    ]?.focus();
  };

  const handleGetOtp =
    async () => {
      if (!email) {
        setError(
          "Registration email is missing. Please start signup again.",
        );
        return;
      }

      setResending(true);
      setError("");
      setMessage("");

      try {
        const result =
          await authService.resendRegistration(
            email,
          );

        setCountdown(30);

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        inputRefs.current[
          0
        ]?.focus();

        if (
          result.developmentCode
        ) {
          sessionStorage.setItem(
            "zentra_registration_development_code",
            result.developmentCode,
          );

          setMessage(
            `Development OTP: ${result.developmentCode}`,
          );
        } else {
          sessionStorage.removeItem(
            "zentra_registration_development_code",
          );

          setMessage(
            "A new OTP has been sent.",
          );
        }
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
          ),
        );
      } finally {
        setResending(false);
      }
    };

  const handleFinishSignup =
    async () => {
      const enteredOtp =
        otp.join("");

      setError("");
      setMessage("");

      if (!email) {
        setError(
          "Registration email is missing. Please start signup again.",
        );
        return;
      }

      if (
        enteredOtp.length !==
        6
      ) {
        setError(
          "Please enter the 6-digit OTP.",
        );
        return;
      }

      setVerifying(true);

      try {
        await authService.verifyRegistration(
          email,
          enteredOtp,
        );

        sessionStorage.removeItem(
          "zentra_registration_email",
        );

        sessionStorage.removeItem(
          "zentra_registration_development_code",
        );

        router.push(
          `/register/success?email=${encodeURIComponent(
            email,
          )}`,
        );
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
          ),
        );
      } finally {
        setVerifying(false);
      }
    };

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-10 pt-[126px] text-white"
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
      <Link
        href="/register"
        className="absolute left-4 top-12 z-30 text-white"
      >
        <ArrowLeft
          size={22}
        />
      </Link>

      <section className="relative mx-auto max-w-[340px] rounded-[16px] border-[4px] border-[#d6c51f] bg-black/95 px-4 pb-8 pt-5 shadow-2xl">
        <Link
          href="/register"
          className="absolute left-3 top-6 text-white/40 transition hover:text-white"
          aria-label="close"
        >
          <X size={16} />
        </Link>

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
          <p>
            Enter the verification
            code sent for your
            registration.
          </p>

          {email ? (
            <p className="mt-3 break-all text-white/70">
              {email}
            </p>
          ) : null}
        </div>

        <div className="mx-auto my-5 w-[86%] border-b border-white/70" />

        <div className="mt-6">
          <label className="pl-1 text-[13px] font-bold text-white/90">
            Input OTP
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
                  title={`OTP digit ${
                    index + 1
                  }`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={
                    index === 0
                      ? "one-time-code"
                      : "off"
                  }
                  maxLength={1}
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
                    handleOtpKeyDown(
                      event,
                      index,
                    )
                  }
                  onPaste={
                    handleOtpPaste
                  }
                  className="h-[44px] rounded-[10px] border border-white/20 bg-white text-center text-[18px] font-black text-[#2458e8] shadow-[0_6px_14px_rgba(0,0,0,0.35)] outline-none transition focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/50"
                />
              ),
            )}
          </div>
        </div>

        {message ? (
          <p className="mt-3 text-center text-[12px] font-semibold text-emerald-300">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 text-center text-[12px] font-semibold text-red-400">
            {error}
          </p>
        ) : null}

        <div className="mx-auto mt-6 flex w-[250px] flex-col gap-3">
          <button
            type="button"
            disabled={
              countdown >
                0 ||
              resending ||
              !email
            }
            onClick={
              handleGetOtp
            }
            className={`font-roboto flex h-[39px] w-[250px] items-center justify-center rounded-[14px] text-[14px] font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${
              countdown > 0 ||
              resending ||
              !email
                ? "cursor-not-allowed border border-white/10 bg-white/10 text-white/45 shadow-inner"
                : "!bg-white !text-black hover:bg-gray-100"
            }`}
          >
            {resending
              ? "Sending OTP..."
              : countdown >
                  0
                ? `Get OTP in ${countdown}s`
                : "Get OTP"}
          </button>

          <button
            type="button"
            onClick={
              handleFinishSignup
            }
            disabled={
              verifying ||
              !email
            }
            className="font-roboto flex h-[39px] w-[250px] items-center justify-center rounded-[14px] !bg-[#2458e8] text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(36,88,232,0.45)] transition hover:bg-[#1f4bc7] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying
              ? "Verifying..."
              : "Finish Signup"}
          </button>
        </div>
      </section>
    </main>
  );
}