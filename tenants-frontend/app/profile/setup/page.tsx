// app/profile/setup/page.tsx

import AuthCard from "@/components/auth/AuthCard";
import BackButton from "@/components/auth/BackButton";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const sections = [
  "Personal Information",
  "Identification detail",
  "Contact information",
  "Communication preference",
  "Employment & Financial Information",
];

export default function ProfileSetupPage() {
  return (
    <AuthCard bordered>
      <BackButton />

      <p className="mb-4 text-center text-xs font-semibold">
        Profile settings page
      </p>

      <div className="flex items-center gap-4">
        <div className="h-28 w-28 rounded-full bg-white/20" />

        <div>
          <h1 className="text-lg font-bold text-blue-400">Complete Your KYC</h1>
          <p className="mt-2 text-xs text-white/80">
            Completing your KYC is the only assured way of enjoying almost all
            our banking features.
          </p>
        </div>
      </div>

      <select className="mt-5 w-full rounded-lg bg-white px-3 py-3 text-sm text-black">
        <option>Scammer category?</option>
        <option>Basic user</option>
        <option>Verified user</option>
      </select>

      <div className="mt-4 h-20 rounded-md bg-gradient-to-r from-red-700 to-white/40 p-4">
        <h2 className="text-lg font-bold">Glowing Season</h2>
        <p className="text-xs">Offers that never fail!</p>
      </div>

      <div className="mt-5 space-y-3">
        {sections.map((section) => (
          <button
            key={section}
            className="flex w-full items-center justify-between border-b border-white/20 pb-2 text-left text-xs font-semibold"
          >
            {section}
            <ChevronDown size={16} />
          </button>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="mt-8 block w-full rounded-lg bg-tenant py-3 text-center text-sm font-semibold"
      >
        Go to homepage →
      </Link>
    </AuthCard>
  );
}