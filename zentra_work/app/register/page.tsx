"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  LogIn,
  X,
} from "lucide-react";

import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-client";

type RegisterForm = {
  inviteCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
};

type Method = "email" | "phone";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteFromUrl =
    searchParams
      .get("invite")
      ?.trim()
      .toUpperCase() ?? "";

  const [method, setMethod] =
    useState<Method>("email");

  const [form, setForm] =
    useState<RegisterForm>({
      inviteCode: inviteFromUrl,
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

   const passwordHasLength =
  form.password.length >= 12;

const passwordHasUppercase =
  /[A-Z]/.test(form.password);

const passwordHasLowercase =
  /[a-z]/.test(form.password);

const passwordHasNumber =
  /[0-9]/.test(form.password);

const passwordHasSpecial =
  /[^A-Za-z0-9]/.test(
    form.password,
  );

const passwordsMatch =
  form.confirmPassword.length > 0 &&
  form.password ===
    form.confirmPassword;

  const update = (
    key: keyof RegisterForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    const inviteCode =
      form.inviteCode
        .trim()
        .toUpperCase();

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

    if (!inviteCode) {
      setError(
        "Enter the invitation code provided by your bank.",
      );
      return;
    }

    if (
      !/^ZB-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{2}$/.test(
        inviteCode,
      )
    ) {
      setError(
        "Enter a valid invitation code.",
      );
      return;
    }

    if (firstName.length < 2) {
      setError(
        "First name must be at least 2 characters.",
      );
      return;
    }

    if (lastName.length < 2) {
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

    if (!passwordHasLength) {
  setError(
    "Password must be at least 12 characters.",
  );
  return;
}

if (!passwordHasUppercase) {
  setError(
    "Password must contain at least one uppercase letter.",
  );
  return;
}

if (!passwordHasLowercase) {
  setError(
    "Password must contain at least one lowercase letter.",
  );
  return;
}

if (!passwordHasNumber) {
  setError(
    "Password must contain at least one number.",
  );
  return;
}

if (!passwordHasSpecial) {
  setError(
    "Password must contain at least one special character.",
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
          inviteCode,
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
                phone: fullPhone,
              }
            : {}),

          password:
            form.password,
        });

      sessionStorage.setItem(
        "zentra_registration_email",
        result.email,
      );

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
    <main className="relative min-h-screen overflow-y-auto bg-[#E8EEF3] px-4 py-6 text-[#555] md:flex md:items-center md:justify-center md:bg-gradient-to-br md:from-[#dbe8f5] md:via-white md:to-[#cbdaf3]">
      <Link
        href="/"
        className="absolute left-4 top-5 z-50"
        aria-label="Back home"
      >
        <ArrowLeft size={20} />
      </Link>

      <Link
        href="/"
        className="absolute right-4 top-5 z-50 md:hidden"
        aria-label="Close"
      >
        <X size={20} />
      </Link>

      <section className="mx-auto grid w-full max-w-[960px] overflow-hidden rounded-[24px] bg-white shadow-2xl md:grid-cols-[1fr_1.05fr]">
        {/* Left panel */}
        <div className="hidden bg-[#2458E8] p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <h2 className="font-sf-condensed text-[44px] leading-tight">
              Join Your Bank.
            </h2>

            <p className="mt-4 max-w-[360px] font-lato text-[15px] leading-6 text-white/85">
              Create your secure banking account
              using the invitation provided by
              your financial institution.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-white"
                />

                <p className="font-lato text-[13px] leading-5 text-white/80">
                  Your invitation securely links
                  your account to your bank.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-white"
                />

                <p className="font-lato text-[13px] leading-5 text-white/80">
                  Your identity is verified before
                  your account is activated.
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 h-[260px] w-full">
            <Image
              src="/images/register.png"
              alt="Registration illustration"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Registration form */}
        <div className="relative px-4 pb-6 pt-5 md:max-h-[90vh] md:overflow-y-auto md:px-10 md:py-8">
          <Link
            href="/"
            className="absolute right-4 top-5 hidden md:block"
            aria-label="Close"
          >
            <X size={20} />
          </Link>

          <h1 className="text-center font-sf-condensed text-[36px] md:text-[42px]">
            Create account
          </h1>

          {/* Mobile illustration */}
          <div className="mt-5 overflow-hidden rounded-tr-[70px] bg-[#2458E8] md:hidden">
            <div className="flex h-[96px] items-center justify-center bg-gradient-to-r from-white via-white/70 to-[#2458E8]">
              <Image
                src="/images/register.png"
                alt="Registration illustration"
                width={150}
                height={112}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <p className="mt-4 font-lato text-[14px] leading-[20px] text-[#1f1f1f]">
            Create your account using the
            invitation provided by your bank.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-4"
          >
            {/* Invitation */}
            <div
              className={`rounded-xl border p-3 ${
                inviteFromUrl
                  ? "border-[#2458E8]/25 bg-[#EEF4FF]"
                  : "border-[#D6D6D6] bg-[#FAFAFA]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="inviteCode"
                  className="font-lato text-[11px] font-bold text-[#555]"
                >
                  Bank invitation code
                </label>

                {inviteFromUrl ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2458E8]">
                    <CheckCircle2
                      size={13}
                    />
                    From invitation
                  </span>
                ) : null}
              </div>

              <input
                id="inviteCode"
                type="text"
                value={form.inviteCode}
                onChange={(event) =>
                  update(
                    "inviteCode",
                    event.target.value.toUpperCase(),
                  )
                }
                readOnly={
                  Boolean(inviteFromUrl)
                }
                placeholder="ZB-XXXX-XXXX-XX"
                autoComplete="off"
                spellCheck={false}
                maxLength={15}
                className={`mt-1.5 h-[38px] w-full border-b bg-transparent px-1 font-mono text-[13px] uppercase tracking-[0.08em] text-[#333] outline-none placeholder:text-[#B7B7B7] ${
                  inviteFromUrl
                    ? "cursor-default border-[#2458E8]/40"
                    : "border-[#D6D6D6] focus:border-[#2458E8]"
                }`}
              />

              <p className="mt-2 font-lato text-[10px] leading-4 text-[#777]">
                {inviteFromUrl
                  ? "This invitation was supplied through your bank's registration link."
                  : "Enter the invitation code provided by your bank."}
              </p>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={form.firstName}
                onChange={(event) =>
                  update(
                    "firstName",
                    event.target.value,
                  )
                }
                placeholder="First name"
                autoComplete="given-name"
                className="h-[38px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6] focus:border-[#2458E8]"
              />

              <input
                type="text"
                value={form.lastName}
                onChange={(event) =>
                  update(
                    "lastName",
                    event.target.value,
                  )
                }
                placeholder="Last name"
                autoComplete="family-name"
                className="h-[38px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6] focus:border-[#2458E8]"
              />
            </div>

            <input
              type="text"
              value={form.middleName}
              onChange={(event) =>
                update(
                  "middleName",
                  event.target.value,
                )
              }
              placeholder="Middle name (optional)"
              autoComplete="additional-name"
              className="h-[38px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6] focus:border-[#2458E8]"
            />

            {/* Email / phone tabs */}
            <div className="grid h-[38px] grid-cols-2 overflow-hidden rounded-[10px] border border-[#2458E8] bg-[#EEF4FF]">
              <button
                type="button"
                onClick={() =>
                  setMethod("email")
                }
                className={`font-sf text-[12px] font-bold transition ${
                  method === "email"
                    ? "bg-white text-[#2458E8]"
                    : "text-[#777]"
                }`}
              >
                Email
              </button>

              <button
                type="button"
                onClick={() =>
                  setMethod("phone")
                }
                className={`font-sf text-[12px] font-bold transition ${
                  method === "phone"
                    ? "bg-white text-[#2458E8]"
                    : "text-[#777]"
                }`}
              >
                Phone
              </button>
            </div>

            {method === "email" ? (
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="example@gmail.com"
                autoComplete="email"
                className="h-[38px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6] focus:border-[#2458E8]"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex h-[38px] w-full items-center border-b border-[#D6D6D6] focus-within:border-[#2458E8]">
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
                    className="h-full bg-transparent pr-1 font-lato text-[13px] text-[#333] outline-none"
                  >
                    <option value="+44">
                      🇬🇧 +44
                    </option>

                    <option value="+234">
                      🇳🇬 +234
                    </option>

                    <option value="+1">
                      🇺🇸 +1
                    </option>

                    <option value="+33">
                      🇫🇷 +33
                    </option>

                    <option value="+91">
                      🇮🇳 +91
                    </option>
                  </select>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      update(
                        "phone",
                        event.target.value,
                      )
                    }
                    placeholder="Phone number"
                    autoComplete="tel"
                    className="h-full flex-1 bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6]"
                  />
                </div>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    update(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder="Email address"
                  autoComplete="email"
                  className="h-[38px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6] focus:border-[#2458E8]"
                />
              </div>
            )}

           {/* Password */}
<div>
  <label
    htmlFor="password"
    className="font-lato text-[11px] font-bold text-[#555]"
  >
    Create Password:
  </label>

  <input
    id="password"
    type="password"
    value={form.password}
    onChange={(event) =>
      update(
        "password",
        event.target.value,
      )
    }
    placeholder="Create a secure password"
    autoComplete="new-password"
    minLength={12}
    maxLength={128}
    className="mt-1.5 h-[38px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6] focus:border-[#2458E8]"
  />

  <div className="mt-3 rounded-xl bg-[#F5F8FC] px-4 py-3">
    <p className="mb-2 font-lato text-[11px] font-bold text-[#555]">
      Your password must:
    </p>

    <div className="space-y-1.5">
      <PasswordRule
        valid={passwordHasLength}
        label="Be at least 12 characters long"
      />

      <PasswordRule
        valid={passwordHasUppercase}
        label="Contain at least one uppercase letter (A–Z)"
      />

      <PasswordRule
        valid={passwordHasLowercase}
        label="Contain at least one lowercase letter (a–z)"
      />

      <PasswordRule
        valid={passwordHasNumber}
        label="Contain at least one number (0–9)"
      />

      <PasswordRule
        valid={passwordHasSpecial}
        label="Contain at least one special character"
      />
    </div>
  </div>
</div>

            <div>
  <label
    htmlFor="confirmPassword"
    className="font-lato text-[11px] font-bold text-[#555]"
  >
    Confirm Password:
  </label>

  <input
    id="confirmPassword"
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
    minLength={12}
    maxLength={128}
    className="mt-1.5 h-[38px] w-full border-b border-[#D6D6D6] bg-transparent px-1 font-lato text-[13px] text-[#333] outline-none placeholder:text-[#C6C6C6] focus:border-[#2458E8]"
  />

  {form.confirmPassword ? (
    <div className="mt-2">
      <PasswordRule
        valid={passwordsMatch}
        label={
          passwordsMatch
            ? "Passwords match"
            : "Passwords do not match"
        }
      />
    </div>
  ) : null}
</div>

            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-[10px] bg-[#2458E8] py-3 text-center font-sf text-[13px] font-semibold text-white shadow-lg transition hover:bg-[#1d49c9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account…"
                : "Create account"}

              {!loading && (
                <LogIn size={16} />
              )}
            </button>
          </form>

          <div className="mx-auto mt-4 h-[1px] w-[130px] bg-[#D6D6D6]" />

          <div className="mt-5 flex items-center justify-center gap-3 font-lato text-[11px]">
            <span>
              Already have an account?
            </span>

            <Link
              href="/login"
              className="flex items-center gap-2 font-semibold text-[#2458E8]"
            >
              Log in

              <LogIn
                size={14}
                className="text-[#2E8B57]"
              />
            </Link>
          </div>

          <div className="mt-7 flex justify-center gap-8 font-lato text-[11px]">
            <Link href="/privacy-policy">
              Privacy Policy
            </Link>

            <Link href="/terms">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function PasswordRule({
  valid,
  label,
}: {
  valid: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
          valid
            ? "bg-[#2E8B57] text-white"
            : "bg-[#DDE4EC] text-[#8994A8]"
        }`}
      >
        ✓
      </span>

      <span
        className={`font-lato text-[10px] ${
          valid
            ? "text-[#2E8B57]"
            : "text-[#7A8498]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#E8EEF3]" />
      }
    >
      <RegisterContent />
    </Suspense>
  );
}