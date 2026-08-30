"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  resendTenantRegistrationOtp,
  verifyTenantRegistrationOtp,
} from "@/services/auth.service";

type PendingRegistration = {
  method: "email";
  email: string;
  phone: null;
  password: string;

  otpExpiresIn?: number;
  otpRequestedAt?: number;

  registrationToken?: string;
  registrationTokenExpiresIn?: number;
  emailVerified?: boolean;
  verifiedAt?: number;
};

const getErrorMessage = (
  error: unknown,
) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (
      response?.data?.message
    ) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export default function RegisterOtpPage() {
  const router = useRouter();

  const [
    registration,
    setRegistration,
  ] =
    useState<PendingRegistration | null>(
      null,
    );

  const [
    countdown,
    setCountdown,
  ] = useState(30);

  const [otp, setOtp] =
    useState([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    isVerifying,
    setIsVerifying,
  ] = useState(false);

  const [
    isResending,
    setIsResending,
  ] = useState(false);

  const inputRefs =
    useRef<
      Array<HTMLInputElement | null>
    >([]);

  useEffect(() => {
    const raw =
      sessionStorage.getItem(
        "zentra_pending_tenant_registration",
      );

    if (!raw) {
      router.replace(
        "/register",
      );
      return;
    }

    try {
      const parsed =
        JSON.parse(
          raw,
        ) as PendingRegistration;

      if (
        !parsed.email ||
        parsed.method !==
          "email"
      ) {
        router.replace(
          "/register",
        );

        return;
      }

      setRegistration(
        parsed,
      );
    } catch {
      sessionStorage.removeItem(
        "zentra_pending_tenant_registration",
      );

      router.replace(
        "/register",
      );
    }
  }, [router]);

  useEffect(() => {
    if (
      countdown <= 0
    ) {
      return;
    }

    const timer =
      setInterval(() => {
        setCountdown(
          (prev) =>
            prev > 0
              ? prev - 1
              : 0,
        );
      }, 1000);

    return () =>
      clearInterval(
        timer,
      );
  }, [countdown]);

  const handleOtpChange = (
    value: string,
    index: number,
  ) => {
    const digit =
      value
        .replace(
          /\D/g,
          "",
        )
        .slice(
          0,
          1,
        );

    const newOtp = [
      ...otp,
    ];

    newOtp[index] =
      digit;

    setOtp(newOtp);
    setError("");
    setSuccess("");

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
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (
      e.key ===
        "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();

    const pasted =
      e.clipboardData
        .getData("text")
        .replace(
          /\D/g,
          "",
        )
        .slice(
          0,
          6,
        );

    if (!pasted) {
      return;
    }

    const newOtp = [
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
        (
          digit,
          index,
        ) => {
          newOtp[index] =
            digit;
        },
      );

    setOtp(newOtp);
    setError("");
    setSuccess("");

    const focusIndex =
      Math.min(
        pasted.length,
        6,
      ) - 1;

    if (
      focusIndex >= 0
    ) {
      inputRefs.current[
        focusIndex
      ]?.focus();
    }
  };

  const handleGetOtp =
    async () => {
      if (
        !registration
      ) {
        router.replace(
          "/register",
        );

        return;
      }

      if (
        countdown > 0 ||
        isResending
      ) {
        return;
      }

      setIsResending(true);
      setError("");
      setSuccess("");

      try {
        const result =
          await resendTenantRegistrationOtp(
            registration.email,
          );

        const updatedRegistration: PendingRegistration =
          {
            ...registration,

            otpExpiresIn:
              result.expiresIn,

            otpRequestedAt:
              Date.now(),

            registrationToken:
              undefined,

            registrationTokenExpiresIn:
              undefined,

            emailVerified:
              false,

            verifiedAt:
              undefined,
          };

        sessionStorage.setItem(
          "zentra_pending_tenant_registration",
          JSON.stringify(
            updatedRegistration,
          ),
        );

        setRegistration(
          updatedRegistration,
        );

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        setCountdown(30);

        setSuccess(
          "A new verification code has been generated.",
        );

        inputRefs.current[
          0
        ]?.focus();
      } catch (
        error
      ) {
        setError(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setIsResending(
          false,
        );
      }
    };

  const handleFinishSignup =
    async () => {
      if (
        !registration
      ) {
        router.replace(
          "/register",
        );

        return;
      }

      const enteredOtp =
        otp.join("");

      if (
        enteredOtp.length !==
        6
      ) {
        setError(
          "Please enter the 6-digit OTP.",
        );

        return;
      }

      if (
        isVerifying
      ) {
        return;
      }

      setIsVerifying(true);
      setError("");
      setSuccess("");

      try {
        const result =
          await verifyTenantRegistrationOtp(
            registration.email,
            enteredOtp,
          );

        const updatedRegistration: PendingRegistration =
          {
            ...registration,

            registrationToken:
              result.registrationToken,

            registrationTokenExpiresIn:
              result.registrationTokenExpiresIn,

            emailVerified:
              result.verified,

            verifiedAt:
              Date.now(),
          };

        sessionStorage.setItem(
          "zentra_pending_tenant_registration",
          JSON.stringify(
            updatedRegistration,
          ),
        );

        router.push(
          "/register/success",
        );
      } catch (
        error
      ) {
        setError(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setIsVerifying(
          false,
        );
      }
    };

  const isOtpComplete =
    otp.every(
      (digit) =>
        digit !== "",
    );

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
        <button
          type="button"
          onClick={() =>
            router.push(
              "/register",
            )
          }
          className="absolute left-3 top-6 text-white/40 transition hover:text-white"
          aria-label="close"
        >
          <X
            size={16}
          />
        </button>

        <h1 className="mb-6 text-center text-[22px] font-extrabold leading-none">
          Email Verification
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

        <div className="font-lato mt-6 text-center text-[14px] font-medium leading-[20px]">
          <p>
            Enter the
            6-digit
            verification
            code generated
            for your email
            address.
          </p>

          {registration?.email && (
            <p className="mt-3 break-all font-bold text-white">
              {
                registration.email
              }
            </p>
          )}

          <p className="mt-3 text-white/70">
            The code
            expires after
            10 minutes.
          </p>
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
                    el,
                  ) => {
                    inputRefs.current[
                      index
                    ] = el;
                  }}
                  title={`OTP digit ${
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
                  disabled={
                    isVerifying ||
                    isResending
                  }
                  onChange={(
                    e,
                  ) =>
                    handleOtpChange(
                      e
                        .target
                        .value,
                      index,
                    )
                  }
                  onKeyDown={(
                    e,
                  ) =>
                    handleOtpKeyDown(
                      e,
                      index,
                    )
                  }
                  onPaste={
                    handlePaste
                  }
                  className="h-[44px] rounded-[10px] border border-white/20 bg-white text-center text-[18px] font-black text-[#2458e8] shadow-[0_6px_14px_rgba(0,0,0,0.35)] outline-none transition focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              ),
            )}
          </div>
        </div>

        {error && (
          <p className="mt-3 text-center text-[12px] font-semibold text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-3 text-center text-[12px] font-semibold text-green-400">
            {
              success
            }
          </p>
        )}

        <div className="mx-auto mt-6 flex w-[250px] flex-col gap-3">
          <button
            type="button"
            disabled={
              countdown >
                0 ||
              isResending ||
              isVerifying
            }
            onClick={
              handleGetOtp
            }
            className={`font-roboto flex h-[39px] w-[250px] items-center justify-center rounded-[14px] text-[14px] font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${
              countdown >
                0 ||
              isResending
                ? "cursor-not-allowed border border-white/10 bg-white/10 text-white/45 shadow-inner"
                : "!bg-white !text-black hover:bg-gray-100"
            }`}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown >
              0 ? (
              `Resend OTP in ${countdown}s`
            ) : (
              "Resend OTP"
            )}
          </button>

          <button
            type="button"
            disabled={
              !isOtpComplete ||
              isVerifying ||
              isResending
            }
            onClick={
              handleFinishSignup
            }
            className="font-roboto flex h-[39px] w-[250px] items-center justify-center rounded-[14px] !bg-[#2458e8] text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(36,88,232,0.45)] transition hover:bg-[#1f4bc7] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Finish Signup"
            )}
          </button>
        </div>
      </section>
    </main>
  );
}