"use client";

import AuthCard from "@/components/auth/AuthCard";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-client";

import Link from "next/link";
import Image from "next/image";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  X,
  LogIn,
} from "lucide-react";

type RegisterForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [method, setMethod] =
    useState<"email" | "phone">(
      "email",
    );

  const [form, setForm] =
    useState<RegisterForm>({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      countryCode: "+44",
      password: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const update = (
    key: keyof RegisterForm,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const firstName =
      form.firstName.trim();

    const middleName =
      form.middleName.trim();

    const lastName =
      form.lastName.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    const phone =
      form.phone.trim();

    if (
      firstName.length < 2
    ) {
      setError(
        "First name must be at least 2 characters.",
      );
      return;
    }

    if (
      lastName.length < 2
    ) {
      setError(
        "Last name must be at least 2 characters.",
      );
      return;
    }

    if (!email) {
      setError(
        "Enter your email address.",
      );
      return;
    }

    if (
      form.password.length < 8
    ) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (
      !/[A-Za-z]/.test(
        form.password,
      ) ||
      !/[0-9]/.test(
        form.password,
      )
    ) {
      setError(
        "Password must contain at least one letter and one number.",
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    const fullPhone =
      phone
        ? `${form.countryCode}${phone.replace(
            /^0+/,
            "",
          )}`
        : undefined;

    setLoading(true);

    try {
      const result =
        await authService.register({
          firstName,

          ...(middleName
            ? {
                middleName,
              }
            : {}),

          lastName,

          email,

          ...(fullPhone
            ? {
                phone:
                  fullPhone,
              }
            : {}),

          password:
            form.password,
        });

      /*
       * Store registration email so
       * the OTP page can recover it
       * even after refresh/navigation.
       */
      sessionStorage.setItem(
        "zentra_registration_email",
        result.email,
      );

      /*
       * Useful during local development
       * if the backend returns the OTP.
       */
      if (
        result.developmentCode
      ) {
        sessionStorage.setItem(
          "zentra_registration_development_code",
          result.developmentCode,
        );
      } else {
        sessionStorage.removeItem(
          "zentra_registration_development_code",
        );
      }

      router.push(
        `/register/otp?email=${encodeURIComponent(
          result.email,
        )}`,
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
        ),
      );
    } finally {
      setLoading(false);
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
        backgroundSize: "cover",
        backgroundPosition:
          "top right",
      }}
    >
      <Link
        href="/"
        className="absolute left-3 top-5 z-50 !text-white"
      >
        <ArrowLeft size={20} />
      </Link>

      <AuthCard>
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

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={
                form.firstName
              }
              onChange={(event) =>
                update(
                  "firstName",
                  event.target.value,
                )
              }
              placeholder="First name"
              autoComplete="given-name"
              className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/70"
            />

            <input
              type="text"
              value={
                form.lastName
              }
              onChange={(event) =>
                update(
                  "lastName",
                  event.target.value,
                )
              }
              placeholder="Last name"
              autoComplete="family-name"
              className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/70"
            />
          </div>

          <input
            type="text"
            value={
              form.middleName
            }
            onChange={(event) =>
              update(
                "middleName",
                event.target.value,
              )
            }
            placeholder="Middle name (optional)"
            autoComplete="additional-name"
            className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/70"
          />

          <div className="overflow-hidden rounded-t-[10px] border border-[#1647BD]">
            <div className="grid h-[30px] grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setMethod(
                    "email",
                  )
                }
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
                onClick={() =>
                  setMethod(
                    "phone",
                  )
                }
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

          {method === "email" ? (
            <input
              type="email"
              value={
                form.email
              }
              onChange={(event) =>
                update(
                  "email",
                  event.target.value,
                )
              }
              placeholder="example@gmail.com"
              autoComplete="email"
              className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white"
            />
          ) : (
            <div className="space-y-3">
              <div className="flex h-[30px] w-full items-center border-b border-white/70">
                <select
                  title="Country code"
                  value={
                    form.countryCode
                  }
                  onChange={(event) =>
                    update(
                      "countryCode",
                      event.target.value,
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
                  value={
                    form.phone
                  }
                  onChange={(event) =>
                    update(
                      "phone",
                      event.target.value,
                    )
                  }
                  placeholder="Phone number"
                  autoComplete="tel"
                  className="h-full flex-1 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white"
                />
              </div>

              <input
                type="email"
                value={
                  form.email
                }
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="Email address"
                autoComplete="email"
                className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-white">
              Create Password:
            </label>

            <input
              type="password"
              value={
                form.password
              }
              onChange={(event) =>
                update(
                  "password",
                  event.target.value,
                )
              }
              placeholder="8+ characters, letters and numbers"
              autoComplete="new-password"
              className="mt-1.5 h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white">
              Confirm Password:
            </label>

            <input
              type="password"
              value={
                form.confirmPassword
              }
              onChange={(event) =>
                update(
                  "confirmPassword",
                  event.target.value,
                )
              }
              placeholder="Repeat password"
              autoComplete="new-password"
              className="mt-1.5 h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/60"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/15 px-3 py-2 text-[11px] text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 block w-full rounded-[8px] bg-[#2458E8] py-3 text-center text-[13px] font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating account..."
              : "Sign up"}
          </button>
        </form>

        <div className="mx-auto mt-1.5 h-[2px] w-[130px] bg-white/60" />

        <p className="mt-2 text-center text-[11px] text-white">
          Or Signup with:
        </p>

        <div className="mt-3 flex justify-center gap-5">
          <button
            type="button"
            disabled
            title="Facebook signup coming later"
            className="cursor-not-allowed opacity-50"
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
            disabled
            title="Instagram signup coming later"
            className="cursor-not-allowed opacity-50"
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
            disabled
            title="Google signup coming later"
            className="cursor-not-allowed opacity-50"
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={40}
              height={40}
            />
          </button>
        </div>

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