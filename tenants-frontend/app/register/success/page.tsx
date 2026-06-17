// app/register/success/page.tsx

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-10 pt-[168px] text-white"
      style={{
    backgroundImage: "url('/images/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top right",
  }}
    >
      <Link
        href="/register/otp"
        className="absolute left-4 top-12 z-30 text-white transition hover:text-white/70"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="relative mx-auto max-w-[340px] rounded-[10px] border-[4px] border-[#d6c51f] bg-black px-3 pb-5 pt-5 shadow-2xl">
        <h1 className="font-heading text-center text-[22px] font-black leading-none text-white">
          Congratulations!
        </h1>

        <div className="mt-6 flex justify-center">
          <Image
            src="/images/success.png"
            alt="Account upgraded"
            width={242}
            height={143}
            className="h-[143px] w-[242px] object-cover"
            priority
          />
        </div>

        <div className="font-body mt-6 text-center text-[14px] font-bold leading-[17px] text-white">
          <p>
            Your account has just been upgraded from Basic to tier-1 and $2,500
            has been released from your received donation of $10,000
          </p>

          <p className="mt-3">
            Proceed to tier-2 to redeem the next part....
          </p>
        </div>

        <div className="mx-auto my-5 w-[86%] border-b border-white/70" />

        <div className="mx-auto w-[86%] space-y-2">
          <Link
            href="/dashboard"
            className="font-heading block rounded-[10px] bg-[#2458e8] py-3 text-center text-[15px] font-bold text-white transition hover:bg-[#1f4fd3]"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/profile/setup"
            className="font-heading flex items-center justify-center gap-3 rounded-[10px] bg-white py-3 text-center text-[15px] font-bold !text-[#4b4b4b] transition hover:bg-white/90"
          >
            Set-up Profile
            <LogIn size={17} className="text-green-500" />
          </Link>
        </div>
      </section>
    </main>
  );
}