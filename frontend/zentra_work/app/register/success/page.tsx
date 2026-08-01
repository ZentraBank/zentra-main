// app/register/success/page.tsx

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LogIn,X } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-10 pt-[168px] text-white bg-white"
      
    >
      <Link
        href="/register/otp"
        className="absolute left-4 top-12 z-30 text-black transition hover:text-white/70"
      >
        <ArrowLeft size={22} />
      </Link>

      <section className="relative mx-auto max-w-[340px] rounded-[10px] px-3 pb-5 pt-5 shadow-2xl"
      
      style={{
        background: "url('/images/profile-setup-bg.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      >
        <Link
          href="/"
          className="absolute left-4 top-5 text-[#555]"
          aria-label="close"
        >
          <X size={20} />
        </Link>

        <h1 className="font-heading text-center text-[22px] font-black leading-none text-black">
          Profile Setup
        </h1>

        <div className="mt-6 flex justify-center">
          <Image
            src="/images/profile_setup.png"
            alt="Account upgraded"
            width={250}
            height={146}
            className="h-[143px] w-[242px] object-cover"
            priority
          />
        </div>

        <div className="font-body mt-6 text-center text-[14px] font-bold leading-[17px] text-white">
          <p>
            Setup you personal information to make your use of ZentraBank Online banking features very simple and automated.
          </p>

        
        </div>

        <div className="mx-auto my-5 w-[86%] border-b border-white/70" />

        <div className="mt-8 space-y-3">
          <Link
            href="/profile"
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#2458E8] font-sf text-[14px] font-bold text-white bg-[#2458E8]"
          >
            Continue
            <LogIn size={16}
            className="text-green-500"
            />
          </Link>

          <Link
            href="/dashboard"
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#2458E8] bg-white font-sf text-[14px] font-bold text-black"
          >
            Skip
            <LogIn size={16}
            className="text-green-500"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}