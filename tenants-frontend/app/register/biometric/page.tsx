// app/register/biometric/page.tsx

import AuthCard from "@/components/auth/AuthCard";
import BackButton from "@/components/auth/BackButton";
import FingerprintIcon from "@/components/auth/FingerprintIcon";
import LegalLinks from "@/components/auth/LegalLinks";
import Link from "next/link";

export default function RegisterBiometricPage() {
  return (
    <AuthCard>
      <BackButton />

      <h1 className="text-2xl font-bold">Set up Thumbprint</h1>
      <p className="mt-2 text-sm text-white/80">
        Place your thumb on your phone to activate thumbprint login.
      </p>

      <FingerprintIcon />

      <Link
        href="/register/success"
        className="block w-full rounded-lg bg-tenant py-3 text-center text-sm font-semibold"
      >
        Skip
      </Link>

      <LegalLinks />
    </AuthCard>
  );
}