// app/register/otp/page.tsx

import AuthCard from "@/components/auth/AuthCard";
import BackButton from "@/components/auth/BackButton";
import Link from "next/link";

export default function RegisterOtpPage() {
  return (
    <AuthCard bordered>
      <BackButton />

      <h1 className="text-center text-xl font-bold">tier-1 OTP</h1>

      <div className="my-6 h-32 rounded-t-full bg-white/20" />

      <p className="text-center text-sm text-white/80">
        Reach out to our customer care agent for account upgrade, genuity check,
        and OTP.
      </p>

      <div className="mt-6">
        <label className="text-xs font-semibold">Input OTP</label>

        <div className="mt-3 grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <input title="input"
              key={index}
              maxLength={1}
              className="h-10 rounded-md bg-white text-center text-black outline-none"
            />
          ))}
        </div>
      </div>

      <Link
        href="/register/biometric"
        className="mt-8 block w-full rounded-lg bg-tenant py-3 text-center text-sm font-semibold"
      >
        Get OTP
      </Link>
    </AuthCard>
  );
}