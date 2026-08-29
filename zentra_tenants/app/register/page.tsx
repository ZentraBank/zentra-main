"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import Image from "next/image";

import {
  FormEvent,
  useState,
} from "react";

import {
  ArrowLeft,
  X,
  LogIn,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  requestTenantRegistrationOtp,
} from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [method, setMethod] =
    useState<"email" | "phone">(
      "email",
    );

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [
    countryCode,
    setCountryCode,
  ] = useState("+44");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Password validation
  |--------------------------------------------------------------------------
  */

  const hasMinLength =
    password.length >= 12;

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasLowercase =
    /[a-z]/.test(password);

  const hasNumber =
    /[0-9]/.test(password);

  const hasSpecialCharacter =
    /[^A-Za-z0-9]/.test(
      password,
    );

  const isPasswordValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const validatePassword = (
    value: string,
  ) => {
    if (value.length < 12) {
      return "Password must be at least 12 characters.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number.";
    }

    if (
      !/[^A-Za-z0-9]/.test(
        value,
      )
    ) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  /*
  |--------------------------------------------------------------------------
  | API error message
  |--------------------------------------------------------------------------
  */

  const getErrorMessage = (
    err: unknown,
  ) => {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err
    ) {
      const response = (
        err as {
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
        return response.data
          .message;
      }
    }

    if (
      err instanceof Error &&
      err.message
    ) {
      return err.message;
    }

    return "Unable to start registration. Please try again.";
  };

  /*
  |--------------------------------------------------------------------------
  | Registration submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    /*
    |--------------------------------------------------------------------------
    | Tenant self-registration currently requires email verification
    |--------------------------------------------------------------------------
    */

    if (method !== "email") {
      setError(
        "Phone registration is not available yet. Please register with your email address.",
      );

      return;
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    const passwordError =
      validatePassword(
        password,
      );

    if (passwordError) {
      setError(
        passwordError,
      );

      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your password.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | Request real OTP from backend
      |--------------------------------------------------------------------------
      */

      const otpResponse =
        await requestTenantRegistrationOtp(
          normalizedEmail,
        );

      /*
      |--------------------------------------------------------------------------
      | Store pending registration
      |--------------------------------------------------------------------------
      |
      | Password is needed later when registration is completed.
      |
      | It must be removed from sessionStorage after successful completion.
      |
      */

      const registrationData = {
        method:
          "email" as const,

        email:
          normalizedEmail,

        phone:
          null,

        password,

        otpExpiresIn:
          otpResponse.expiresIn,

        otpRequestedAt:
          Date.now(),
      };

      sessionStorage.setItem(
        "zentra_pending_tenant_registration",
        JSON.stringify(
          registrationData,
        ),
      );

      /*
      |--------------------------------------------------------------------------
      | Continue to OTP page
      |--------------------------------------------------------------------------
      */

      router.push(
        "/register/otp",
      );
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden"
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
      {/* Back Arrow */}

      <Link
        href="/"
        className="absolute left-3 top-5 z-50 !text-white"
      >
        <ArrowLeft
          size={20}
        />
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

        {/* Illustration */}

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
          Create your account
          to start setting up
          your banking platform.
        </p>

        <form
          className="space-y-3"
          onSubmit={
            handleSubmit
          }
        >
          {/* Email / Phone Switch */}

          <div className="overflow-hidden rounded-t-[10px] border border-[#1647BD]">
            <div className="grid h-[30px] grid-cols-2">
              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() => {
                  setMethod(
                    "email",
                  );

                  setError("");
                }}
                className={`relative flex items-center justify-center text-[11px] font-bold transition-all ${
                  method ===
                  "email"
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                Email

                {method ===
                  "email" && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#2458E8]" />
                )}
              </button>

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() => {
                  setMethod(
                    "phone",
                  );

                  setError("");
                }}
                className={`relative flex items-center justify-center text-[11px] font-bold transition-all ${
                  method ===
                  "phone"
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                Phone

                {method ===
                  "phone" && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#2458E8]" />
                )}
              </button>
            </div>
          </div>

          {/* Email */}

          {method ===
          "email" ? (
            <input
              type="email"
              value={email}
              disabled={
                isSubmitting
              }
              onChange={(
                event,
              ) => {
                setEmail(
                  event.target
                    .value,
                );

                setError("");
              }}
              placeholder="example@gmail.com"
              autoComplete="email"
              className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white disabled:opacity-60"
            />
          ) : (
            /* Phone */

            <div className="flex h-[30px] w-full items-center border-b border-white/70">
              <select
                title="Country code"
                value={
                  countryCode
                }
                disabled={
                  isSubmitting
                }
                onChange={(
                  event,
                ) =>
                  setCountryCode(
                    event.target
                      .value,
                  )
                }
                className="h-full bg-transparent pr-1 text-[13px] text-white outline-none"
              >
                <option
                  className="text-black"
                  value="+44"
                >
                  🇬🇧 +44
                </option>

                <option
                  className="text-black"
                  value="+234"
                >
                  🇳🇬 +234
                </option>

                <option
                  className="text-black"
                  value="+1"
                >
                  🇺🇸 +1
                </option>

                <option
                  className="text-black"
                  value="+33"
                >
                  🇫🇷 +33
                </option>

                <option
                  className="text-black"
                  value="+91"
                >
                  🇮🇳 +91
                </option>
              </select>

              <input
                type="tel"
                value={phone}
                disabled={
                  isSubmitting
                }
                onChange={(
                  event,
                ) => {
                  setPhone(
                    event.target
                      .value,
                  );

                  setError("");
                }}
                placeholder="Phone number"
                autoComplete="tel"
                className="h-full flex-1 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white disabled:opacity-60"
              />
            </div>
          )}

          {/* Create Password */}

          <div>
            <label
              htmlFor="password"
              className="text-[11px] font-semibold text-white"
            >
              Create Password:
            </label>

            <input
              id="password"
              type="password"
              value={password}
              disabled={
                isSubmitting
              }
              onChange={(
                event,
              ) => {
                setPassword(
                  event.target
                    .value,
                );

                setError("");
              }}
              placeholder="Minimum 12 characters"
              autoComplete="new-password"
              className="mt-1.5 h-[32px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/60 disabled:opacity-60"
            />

            {/* Password Requirements */}

            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
              <p
                className={
                  hasMinLength
                    ? "text-green-400"
                    : "text-white/60"
                }
              >
                {hasMinLength
                  ? "✓"
                  : "○"}{" "}
                12+ characters
              </p>

              <p
                className={
                  hasUppercase
                    ? "text-green-400"
                    : "text-white/60"
                }
              >
                {hasUppercase
                  ? "✓"
                  : "○"}{" "}
                Uppercase letter
              </p>

              <p
                className={
                  hasLowercase
                    ? "text-green-400"
                    : "text-white/60"
                }
              >
                {hasLowercase
                  ? "✓"
                  : "○"}{" "}
                Lowercase letter
              </p>

              <p
                className={
                  hasNumber
                    ? "text-green-400"
                    : "text-white/60"
                }
              >
                {hasNumber
                  ? "✓"
                  : "○"}{" "}
                Number
              </p>

              <p
                className={
                  hasSpecialCharacter
                    ? "text-green-400"
                    : "text-white/60"
                }
              >
                {hasSpecialCharacter
                  ? "✓"
                  : "○"}{" "}
                Special character
              </p>
            </div>
          </div>

          {/* Confirm Password */}

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-[11px] font-semibold text-white"
            >
              Confirm Password:
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={
                confirmPassword
              }
              disabled={
                isSubmitting
              }
              onChange={(
                event,
              ) => {
                setConfirmPassword(
                  event.target
                    .value,
                );

                setError("");
              }}
              placeholder="Confirm password"
              autoComplete="new-password"
              className="mt-1.5 h-[32px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/60 disabled:opacity-60"
            />

            {confirmPassword.length >
              0 && (
              <p
                className={`mt-1 text-[10px] ${
                  passwordsMatch
                    ? "text-green-400"
                    : "text-red-300"
                }`}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "Passwords do not match"}
              </p>
            )}
          </div>

          {/* Validation Error */}

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-500/10 px-2 py-1.5 text-center text-[10px] font-medium text-red-300"
            >
              {error}
            </p>
          )}

          {/* Sign Up */}

          <button
            type="submit"
            disabled={
              !isPasswordValid ||
              !passwordsMatch ||
              isSubmitting
            }
            className={`mt-7 flex w-full items-center justify-center gap-2 rounded-[8px] py-3 text-center text-[13px] font-semibold text-white transition ${
              isPasswordValid &&
              passwordsMatch &&
              !isSubmitting
                ? "bg-[#2458E8] hover:bg-[#1f4fd0]"
                : "cursor-not-allowed bg-[#2458E8]/50"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                />

                Sending code...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <div className="mx-auto mt-1.5 h-[2px] w-[130px] bg-white/60" />

        <p className="mt-2 text-center text-[11px] text-white">
          Or Signup with:
        </p>

        {/* Social Signup */}

        <div className="mt-3 flex justify-center gap-5">
          <button
            type="button"
            className="transition hover:scale-110"
            aria-label="Sign up with Facebook"
          >
            <Image
              src="/images/facebook.png"
              alt="Facebook"
              width={40}
              height={40}
            />
          </button>

          <button
            type="button"
            className="transition hover:scale-110"
            aria-label="Sign up with Instagram"
          >
            <Image
              src="/images/instagram.png"
              alt="Instagram"
              width={40}
              height={40}
            />
          </button>

          <button
            type="button"
            className="transition hover:scale-110"
            aria-label="Sign up with Google"
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={40}
              height={40}
            />
          </button>
        </div>

        {/* Login */}

        <div className="mt-5 flex items-center justify-center gap-9 text-[11px] text-white">
          <span>
            Have an Account?
          </span>

          <Link
            href="/login"
            className="flex items-center gap-3 !text-white"
          >
            Login

            <LogIn
              size={14}
              className="text-green-500"
            />
          </Link>
        </div>

        {/* Footer */}

        <div className="mt-7 flex justify-center gap-8 text-[11px] text-white">
          <Link
            href="#"
            className="!text-white"
          >
            Privacy Policy
          </Link>

          <Link
            href="#"
            className="!text-white"
          >
            Terms and Conditions
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}