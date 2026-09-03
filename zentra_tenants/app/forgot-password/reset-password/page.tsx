"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  resetPassword,
} from "@/services/auth.service";

import {
  getApiErrorMessage,
} from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [resetCode, setResetCode] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Restore reset session
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const storedEmail =
      sessionStorage.getItem(
        "zentrabank-password-reset-email",
      );

    const storedCode =
      sessionStorage.getItem(
        "zentrabank-password-reset-code",
      );

    if (
      !storedEmail ||
      !storedCode
    ) {
      router.replace(
        "/forgot-password",
      );

      return;
    }

    setEmail(storedEmail);
    setResetCode(storedCode);
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | Password validation
  |--------------------------------------------------------------------------
  |
  | This matches the password rules used on tenant signup:
  |
  | - Minimum 12 characters
  | - Uppercase letter
  | - Lowercase letter
  | - Number
  | - Special character
  |
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

  const canSubmit =
    isPasswordValid &&
    passwordsMatch &&
    !loading;

  /*
  |--------------------------------------------------------------------------
  | Reset password
  |--------------------------------------------------------------------------
  */

  const handleResetPassword =
    async () => {
      if (loading) {
        return;
      }

      setError("");

      /*
      |--------------------------------------------------------------------------
      | Make sure reset session still exists
      |--------------------------------------------------------------------------
      */

      if (
        !email ||
        !resetCode
      ) {
        setError(
          "Your password reset session has expired. Please request a new code.",
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Validate password
      |--------------------------------------------------------------------------
      */

      if (
        password.length < 12
      ) {
        setError(
          "Password must be at least 12 characters.",
        );

        return;
      }

      if (
        !/[A-Z]/.test(
          password,
        )
      ) {
        setError(
          "Password must contain at least one uppercase letter.",
        );

        return;
      }

      if (
        !/[a-z]/.test(
          password,
        )
      ) {
        setError(
          "Password must contain at least one lowercase letter.",
        );

        return;
      }

      if (
        !/[0-9]/.test(
          password,
        )
      ) {
        setError(
          "Password must contain at least one number.",
        );

        return;
      }

      if (
        !/[^A-Za-z0-9]/.test(
          password,
        )
      ) {
        setError(
          "Password must contain at least one special character.",
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

      /*
      |--------------------------------------------------------------------------
      | Submit reset request
      |--------------------------------------------------------------------------
      */

      setLoading(true);

      try {
        await resetPassword({
          email,
          code:
            resetCode,
          newPassword:
            password,
        });

        /*
        |--------------------------------------------------------------------------
        | Remove temporary reset session
        |--------------------------------------------------------------------------
        */

        sessionStorage.removeItem(
          "zentrabank-password-reset-email",
        );

        sessionStorage.removeItem(
          "zentrabank-password-reset-code",
        );

        /*
        |--------------------------------------------------------------------------
        | Return to login
        |--------------------------------------------------------------------------
        */

        router.replace(
          "/login",
        );
      } catch (error) {
        setError(
          getApiErrorMessage(
            error,
          ),
        );
      } finally {
        setLoading(false);
      }
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

      {/* Back */}

      <Link
        href="/forgot-password/otp"
        className="absolute left-4 top-10 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md"
        aria-label="Back to reset code"
      >
        <ArrowLeft
          size={21}
        />
      </Link>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[430px] items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/15 bg-black/80 px-5 pb-7 pt-7 shadow-2xl backdrop-blur-xl">
          {/* Icon */}

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#2458e8] shadow-lg">
            <LockKeyhole
              size={27}
            />
          </div>

          {/* Heading */}

          <h1 className="text-center text-[27px] font-black leading-none">
            Reset Password
          </h1>

          <p className="mx-auto mt-3 max-w-[320px] text-center text-[14px] leading-[19px] text-white/75">
            Create a new
            password for{" "}
            {email ? (
              <span className="break-all font-semibold text-white">
                {email}
              </span>
            ) : (
              "your account"
            )}
            .
          </p>

          {/* Password inputs */}

          <div className="mt-8 space-y-5">
            {/* New password */}

            <div>
              <label
                htmlFor="new-password"
                className="text-[13px] font-bold text-white/90"
              >
                New Password
              </label>

              <div className="mt-2 flex h-[50px] items-center rounded-[14px] bg-white px-4">
                <input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    password
                  }
                  autoComplete="new-password"
                  disabled={
                    loading
                  }
                  onChange={(
                    event,
                  ) => {
                    setPassword(
                      event.target.value,
                    );

                    setError("");
                  }}
                  placeholder="Enter new password"
                  className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-black outline-none placeholder:text-black/40 disabled:opacity-60"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous,
                    )
                  }
                  disabled={
                    loading
                  }
                  className="ml-3 flex shrink-0 items-center justify-center text-black/50 transition hover:text-black disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}

            <div>
              <label
                htmlFor="confirm-password"
                className="text-[13px] font-bold text-white/90"
              >
                Confirm Password
              </label>

              <div className="mt-2 flex h-[50px] items-center rounded-[14px] bg-white px-4">
                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  autoComplete="new-password"
                  disabled={
                    loading
                  }
                  onChange={(
                    event,
                  ) => {
                    setConfirmPassword(
                      event.target.value,
                    );

                    setError("");
                  }}
                  placeholder="Confirm new password"
                  className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-black outline-none placeholder:text-black/40 disabled:opacity-60"
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous,
                    )
                  }
                  disabled={
                    loading
                  }
                  className="ml-3 flex shrink-0 items-center justify-center text-black/50 transition hover:text-black disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password requirements */}

          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] leading-[16px]">
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

            {confirmPassword.length >
              0 && (
              <p
                className={
                  passwordsMatch
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}
          </div>

          {/* API error */}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-center text-[12px] font-semibold text-red-400"
            >
              {error}
            </p>
          )}

          {/* Reset password */}

          <button
            type="button"
            disabled={
              !canSubmit
            }
            onClick={
              handleResetPassword
            }
            className={`mt-8 flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-black text-white shadow-lg transition ${
              canSubmit
                ? "bg-[#2458e8] hover:bg-[#1f4bc7] active:scale-[0.99]"
                : "cursor-not-allowed bg-[#6f6f6f] text-white/45"
            }`}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

          {/* Login */}

          <Link
            href="/login"
            className="mt-5 block text-center text-[13px] font-bold text-white/70 transition hover:text-white"
          >
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}