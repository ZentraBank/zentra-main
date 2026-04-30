"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthCard>
      <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-md border border-white/20 bg-white px-3 py-3 text-sm text-black outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border-b border-white/40 bg-transparent px-1 py-3 text-sm text-white outline-none"
        />

        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-tenant py-3 text-center text-sm font-semibold"
        >
          Login
        </Link>
      </form>

      <Link
        href="/login/biometric"
        className="mt-4 block text-center text-xs text-white/70"
      >
        Login with thumbprint
      </Link>

      <p className="mt-5 text-center text-xs text-white/70">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-white">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}