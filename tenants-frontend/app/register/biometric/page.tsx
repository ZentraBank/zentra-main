// app/register/biometric/page.tsx

import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import FingerprintIcon from "@/components/auth/FingerprintIcon";

export default function RegisterBiometricPage() {
  return (
    <main
      className="relative min-h-screen px-3 py-35 text-white"
      style={{
    backgroundImage: "url('/images/Background_2.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top right",
  }}
    >
      {/* <Link href="/register/otp" className="absolute left-4 top-4 text-white">
        <ArrowLeft size={16} />
      </Link> */}

      <section className="mx-auto mt-20 max-w-[390px] rounded-[9px] bg-black px-4 pb-7 pt-6">
        <div className="mb-4 flex items-center gap-5">
          <Link href="/register" className="text-white">
            <ArrowLeft size={18} />
          </Link>

          <h1 className="text-[25px] font-extrabold leading-none">
            Set up Thumbprint
          </h1>
        </div>

        <p className="max-w-[280px] text-[12px] leading-[15px] text-white">
          Place your thumb on your phone to activate thumbprint login...
        </p>

        <div className="my-14 flex justify-center">
          <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[8px] bg-[#5f6168]">
            <FingerprintIcon />
          </div>
        </div>

        <Link
          href="/register/success"
          className="mx-auto flex h-[42px] w-[88%] items-center justify-center gap-3 rounded-[8px] bg-[#2458E8] text-[13px] font-semibold text-white"
        >
          Skip
          <LogIn size={14} />
        </Link>

        <div className="mt-7 flex justify-center gap-9 text-[11px] text-white">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms and Conditions</Link>
        </div>
      </section>
    </main>
  );
}