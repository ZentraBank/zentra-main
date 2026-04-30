// app/register/success/page.tsx

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <AuthCard bordered>
      <h1 className="text-center text-xl font-bold">Congratulations!</h1>

      <div className="my-8 h-32 rounded-t-full bg-white/20" />

      <p className="text-center text-sm text-white/80">
        Your account has been created successfully. You can now proceed to your dashboard.
      </p>

      <div className="mt-8 space-y-3">
        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-tenant py-3 text-center text-sm font-semibold"
        >
          Go to Dashboard
        </Link>

        <Link
          href="/profile/setup"
          className="block w-full rounded-lg bg-white py-3 text-center text-sm font-semibold text-black"
        >
          Set-up Profile
        </Link>
      </div>
    </AuthCard>
  );
}