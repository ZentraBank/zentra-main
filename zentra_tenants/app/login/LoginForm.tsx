"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X, LogIn } from "lucide-react";
import { login } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const safeNextPath = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStore((state) => state.status);
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(safeNextPath(searchParams.get("next")));
    }
  }, [router, searchParams, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await login(email, password);
      setSession(session.user);
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/images/Background_2.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "top right",
      }}
    >
      <Link href="/" className="absolute left-3 top-5 z-50 !text-white">
        <ArrowLeft size={20} />
      </Link>

      <AuthCard>
        <div className="relative mb-4">
          <h1 className="text-center text-[32px] font-bold leading-none text-white">Log in</h1>
          <Link href="/" className="absolute right-1 top-1/2 -translate-y-1/2 !text-white">
            <X size={20} />
          </Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-br-none rounded-tr-[58px] bg-gradient-to-r from-[#246BFF] via-[#2F73FF] to-[#A9A9A9]">
          <div className="flex h-[84px] items-center justify-center">
            <Image src="/images/register.png" alt="Login illustration" width={108} height={98} className="object-contain" priority />
          </div>
        </div>

        <p className="mb-3 text-[12px] leading-[15px] text-white">Provide your login details...</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-t-[10px] border border-[#1647BD]">
            <div className="grid h-[30px] grid-cols-2">
              <button type="button" className="relative flex items-center justify-center bg-white text-[11px] font-bold text-black">
                Email<span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#2458E8]" />
              </button>
              <button type="button" disabled title="Phone login is not supported by the backend" className="cursor-not-allowed bg-black text-[11px] font-bold text-white/40">
                Phone
              </button>
            </div>
          </div>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@gmail.com"
            autoComplete="email"
            className="h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-white/70"
          />

          <div>
            <label htmlFor="password" className="text-[11px] font-semibold text-white">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-1.5 h-[30px] w-full border-b border-white/70 bg-transparent px-1 text-[13px] text-white outline-none"
            />
          </div>

          {error && <p role="alert" className="rounded-md bg-red-950/60 px-3 py-2 text-[11px] text-red-100">{error}</p>}

          <Link href="/forgot-password" className="block text-[12px] font-medium !text-[#2458E8]">Forgot Password?</Link>

          <button
            type="submit"
            disabled={isSubmitting || status === "loading"}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-[8px] bg-[#2458E8] py-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging in…" : "Log in"}
            <LogIn size={16} />
          </button>
        </form>

        <div className="mx-auto mt-4 h-[2px] w-[150px] bg-white/60" />
        <p className="mt-2 text-center text-[11px] text-white/60">Social login is not configured.</p>

        <div className="mt-5 flex items-center justify-center gap-9 text-[11px] text-white">
          <span>Don&apos;t have an account?</span>
          <Link href="/register" className="flex items-center gap-3 !text-white">Sign up<LogIn size={14} className="text-green-500" /></Link>
        </div>

        <div className="mt-7 flex justify-center gap-8 text-[11px] text-white">
          <Link href="/privacy-policy" className="!text-white">Privacy Policy</Link>
          <Link href="/terms" className="!text-white">Terms and Conditions</Link>
        </div>
      </AuthCard>
    </main>
  );
}
