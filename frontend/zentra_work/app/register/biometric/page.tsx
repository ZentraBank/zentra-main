// app/register/biometric/page.tsx

import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import FingerprintIcon from "@/components/auth/FingerprintIcon";

export default function RegisterBiometricPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#E8EEF3] px-5 py-10">
      <Link
        href="/register/otp"
        className="absolute left-4 top-5 z-30 text-[#555]"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="w-full max-w-[360px] rounded-[18px] bg-white px-5 pb-8 pt-5 shadow-xl md:max-w-[430px] md:px-6">
        <h1 className="text-center font-sf text-[30px] font-bold text-[#555]">
          Set up Biometrics
        </h1>

        <p className="mx-auto mt-4 max-w-[280px] text-center font-lato text-[15px] leading-5 text-[#666]">
          Place your thumb on the fingerprint scanner to activate biometric
          login and make future sign-ins faster and more secure.
        </p>

        <div className="my-12 flex justify-center">
          <div className="flex h-[90px] w-[90px] items-center justify-center rounded-[20px] bg-[#EEF4FF] shadow-md">
            <FingerprintIcon />
          </div>
        </div>

        <div className="rounded-[12px] bg-[#F8FAFC] p-4">
          <p className="text-center font-lato text-[13px] leading-5 text-[#777]">
            Your biometric information never leaves your device and is used only
            for secure authentication.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            className="flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#2458E8] font-sf text-[14px] font-bold text-white shadow-lg"
          >
            Scan Fingerprint
          </button>

          <Link
            href="/register/success"
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#2458E8] bg-white font-sf text-[14px] font-bold text-[#2458E8]"
          >
            Skip for now
            <LogIn size={16} />
          </Link>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-[11px] text-[#666]">
          <Link href="/privacy-policy">
            Privacy Policy
          </Link>

          <Link href="/terms">
            Terms & Conditions
          </Link>
        </div>
      </section>
    </main>
  );
}