import AuthCard from "@/components/auth/AuthCard";
import BackButton from "@/components/auth/BackButton";
import FingerprintIcon from "@/components/auth/FingerprintIcon";
import LegalLinks from "@/components/auth/LegalLinks";

export default function BiometricLoginPage() {
  return (
    <AuthCard>
      <BackButton />

      <h1 className="text-2xl font-bold">Thumbprint Login</h1>
      <p className="mt-2 text-sm text-white/80">Approve with thumbprint.</p>

      <FingerprintIcon />

      <LegalLinks />
    </AuthCard>
  );
}
