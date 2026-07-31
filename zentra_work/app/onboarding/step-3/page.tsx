// app/onboarding/signup/page.tsx

import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function SignupOnboardingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
       {/* Background */}
      <Image
        src="/images/onboarding_4.png"
        alt="Take Financial Control"
        fill
        priority
        className="object-cover"
      />
     
      

      {/* Mobile */}
      <section className="relative z-10 flex min-h-screen flex-col items-center px-8 py-14 md:hidden">
        <h1 className="mt-6 text-center font-sf-condensed text-[48px] leading-[43px] text-black/95">
          Sign up
          <br />
          to begin...
        </h1>

        <Image
          src="/images/onboarding_3.png"
          alt="Sign up illustration"
          width={276}
          height={234}
          priority
          className="mt-8 object-contain"
        />

        <div className="mt-12 max-w-[300px] text-center">
          <h2 className="font-lato text-[16px] font-bold uppercase tracking-wide text-[#1f1f1f]">
            TRANSPARENCY!
          </h2>

          <p className="mt-4 font-lato text-[14px] leading-[18px] text-[#1f1f1f] text-align-center">
            No more App Crashes, Maintenance Outages, Transaction Errors, Lack
            of Clarity, or Surprise Charges.{" "}
            <span className="font-bold">Very Simple!</span>
          </p>
        </div>

        <div className="mt-auto mb-9 w-full max-w-[320px]">
          <Link
            href="/register"
            className="mx-auto flex h-[36px] w-[273px] items-center justify-center gap-3 rounded-[12px] bg-[#1D4ED8] font-roboto text-[16px] text-white shadow-lg"
          >
            Sign up
            <LogIn size={14} />
          </Link>
        </div>
      </section>

      {/* Desktop */}
      <section className="relative z-10 hidden min-h-screen items-center justify-center px-12 md:flex">
        <div className="grid w-full max-w-6xl grid-cols-2 items-center gap-14">
          <div>
            <h1 className="font-sf text-[76px] font-bold leading-[78px] text-[#555]">
              Sign up
              <br />
              to begin...
            </h1>

            <h2 className="mt-12 font-lato text-[17px] font-bold uppercase tracking-wide text-[#333]">
              TRANSPARENCY!
            </h2>

            <p className="mt-4 max-w-lg font-lato text-xl leading-8 text-[#4B4B4B]">
              No more app crashes, maintenance outages, transaction errors,
              lack of clarity, or surprise charges.{" "}
              <span className="font-bold">Very Simple!</span>
            </p>

            <Link
              href="/register"
              className="mt-12 inline-flex h-[56px] min-w-[190px] items-center justify-center gap-3 rounded-xl bg-[#2458E8] px-8 font-sf font-bold text-white shadow-lg"
            >
              Sign up
              <LogIn size={18} />
            </Link>
          </div>

          <div className="flex justify-center">
            <Image
              src="/images/onboarding_3.png"
              alt="Sign up illustration"
              width={560}
              height={560}
              priority
              className="object-contain"
            />
          </div>
        </div>
      </section>
    </main>
  );
}