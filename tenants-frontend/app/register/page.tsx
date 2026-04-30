"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthCard>
      <h1 className="mb-6 text-center text-2xl font-bold">Sign up</h1>

      <p className="mb-5 text-xs text-white/80">
        Signup to use this tool in making clients pay without anything from A-Z.
      </p>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="email"
            placeholder="Email"
            className="rounded-md border border-white/20 bg-white px-3 py-2 text-sm text-black outline-none"
          />

          <input
            type="tel"
            placeholder="Phone"
            className="rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <input
          type="password"
          placeholder="Create Password"
          className="w-full border-b border-white/40 bg-transparent px-1 py-2 text-sm text-white outline-none"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border-b border-white/40 bg-transparent px-1 py-2 text-sm text-white outline-none"
        />

        <Link
          href="/register/otp"
          className="block w-full rounded-lg bg-tenant py-3 text-center text-sm font-semibold"
        >
          Sign up
        </Link>
      </form>

      <div className="my-4 text-center text-xs text-white/60">
        Or Signup with:
      </div>

      <div className="flex justify-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
          f
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white">
          ◎
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
          G
        </button>
      </div>

      <p className="mt-5 text-center text-xs text-white/70">
        Have an Account?{" "}
        <Link href="/login" className="font-semibold text-white">
          Login
        </Link>
      </p>
    </AuthCard>
  );
}