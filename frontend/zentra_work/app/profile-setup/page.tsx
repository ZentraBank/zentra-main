import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function ProfileSetupIntroPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#b9c8ff] px-5 pt-5 text-[#4b4b4b]">
      {/* Close */}
      <Link
        href="/dashboard"
        className="absolute left-4 top-6 z-20 text-[24px] text-[#555]"
      >
        ×
      </Link>

      <section className="mx-auto flex min-h-screen max-w-[390px] flex-col items-center">
        <h1 className="font-heading text-center text-[30px] font-black leading-none text-[#4b4b4b]">
          Profile Setup
        </h1>

        {/* Image */}
        <div className="relative mt-7 h-[126px] w-[216px] overflow-hidden rounded-tl-[36px] rounded-br-[2px] bg-white shadow-[0_18px_35px_rgba(0,0,0,0.25)]">
          <Image
            src="/images/profile-setup.png"
            alt="Profile setup"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Text */}
        <p className="mt-6 w-full max-w-[350px] text-left text-[13px] font-medium leading-[15px] text-[#4c4c4c]">
          Setup your personal information to make your use of ZentraBank Online
          banking features very simple and automated.
        </p>

        {/* Buttons */}
        <div className="mt-12 w-full max-w-[350px] space-y-3">
          <Link
            href="/profile-setup/form"
            className="flex h-[34px] w-full items-center justify-center rounded-[8px] bg-[#2d55d9] text-[14px] font-bold text-white shadow-sm"
          >
            Continue
          </Link>

          <Link
            href="/dashboard"
            className="flex h-[34px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#9bb7ff] text-[14px] font-bold text-[#3f3f3f]"
          >
            Skip
            <LogIn size={16} className="text-[#258f86]" />
          </Link>
        </div>
      </section>
    </main>
  );
}