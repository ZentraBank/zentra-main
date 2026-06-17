import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FingerprintIcon from "@/components/auth/FingerprintIcon";

export default function BiometricLoginPage() {
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
      <Link href="/login" className="absolute left-4 top-4 text-white">
        <ArrowLeft size={16} />
      </Link>

      <section className="mx-auto mt-28 max-w-[390px] rounded-[9px] bg-black px-4 pb-7 pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/login" className="text-white">
            <ArrowLeft size={18} />
          </Link>

          <h1 className="text-[25px] font-extrabold leading-none">
            Thumbprint Login
          </h1>
        </div>

        <p className="text-[12px] leading-[15px] text-white">
          Approve with thumbprint
        </p>

        <div className="my-16 flex justify-center">
          <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[8px] bg-[#5f6168]">
            <FingerprintIcon />
          </div>
        </div>

        <div className="mt-14 flex justify-center gap-9 text-[11px] text-white">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms and Conditions</Link>
        </div>
      </section>
    </main>
  );
}