// app/forgot-password/page.tsx

"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  requestPasswordReset,
} from "@/services/auth.service";

import {
  getApiErrorMessage,
} from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSendResetCode =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (loading) {
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

      setLoading(true);
      setError("");

      try {
        await requestPasswordReset(
          normalizedEmail,
        );

        /*
        |--------------------------------------------------------------------------
        | Keep email available for OTP/reset pages
        |--------------------------------------------------------------------------
        */

        sessionStorage.setItem(
          "zentrabank-password-reset-email",
          normalizedEmail,
        );

        /*
        |--------------------------------------------------------------------------
        | Clear any previous reset code
        |--------------------------------------------------------------------------
        */

        sessionStorage.removeItem(
          "zentrabank-password-reset-code",
        );

        router.push(
          "/forgot-password/otp",
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
    <main className="auth-bg relative min-h-screen overflow-hidden">
      <Link
        href="/login"
        className="absolute left-3 top-5 z-50 !text-white"
      >
        <ArrowLeft size={20} />
      </Link>

      <AuthCard>
        <div className="relative mb-4">
          <h1 className="text-center text-[30px] font-bold leading-none text-white">
            Reset Password
          </h1>

          <Link
            href="/login"
            className="absolute right-1 top-1/2 -translate-y-1/2 !text-white"
          >
            <X size={20} />
          </Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-br-none rounded-tr-[58px] bg-gradient-to-r from-[#246BFF] via-[#2F73FF] to-[#A9A9A9]">
          <div className="flex h-[84px] items-center justify-center">
            <Image
              src="/images/register.png"
              alt="Reset password illustration"
              width={108}
              height={98}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <p className="mb-5 text-[12px] leading-[15px] text-white">
          Enter your email address. We&apos;ll generate a
          password reset code.
        </p>

        <form
          onSubmit={
            handleSendResetCode
          }
          className="space-y-3"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(
                event.target.value,
              );

              if (error) {
                setError("");
              }
            }}
            placeholder="example@gmail.com"
            autoComplete="email"
            required
            disabled={loading}
            className="h-[36px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/70 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {error && (
            <p
              role="alert"
              className="text-[11px] leading-4 text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-[8px] bg-[#2458E8] py-3 text-center text-[13px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                Sending...
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              </>
            ) : (
              <>
                Send reset code
                <Send
                  size={16}
                  className="!text-white"
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-[12px] font-medium !text-[#2458E8]"
          >
            Remember password? Log in
          </Link>
        </div>

        <div className="mt-20 flex justify-center gap-8 text-[11px] text-white">
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