// app/register/success/page.tsx

import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <main
      className="relative min-h-screen px-4 py-10 text-white"
      style={{
        background:
          "radial-gradient(ellipse 95% 85% at 0% 100%, #d9d9d9 0%, #c91515 42%, #171717 100%)",
      }}
    >
      <section className="mx-auto mt-24 max-w-[360px] rounded-[10px] border-[4px] border-[#d6c51f] bg-black px-5 pb-7 pt-5 shadow-2xl">
        <h1 className="text-center text-[20px] font-extrabold">
          Congratulations!
        </h1>

        <div className="mt-5 flex justify-center">
          <Image
            src="/images/success.png"
            alt="Account upgraded"
            width={260}
            height={150}
            className="object-contain"
            priority
          />
        </div>

        <p className="mt-5 text-center text-[12px] font-semibold leading-[15px]">
          Your account has just been upgraded from Basic to tier-1 and $2,500 has
          been released from your received donation of $10,000
        </p>

        <p className="mt-2 text-center text-[12px] font-semibold leading-[15px]">
          Proceed to tier-2 to redeem the next part...
        </p>

        <div className="my-5 border-b border-white/60" />

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full rounded-[8px] bg-[#2458E8] py-3 text-center text-[13px] font-bold text-white"
          >
            Go to Dashboard
          </Link>

          <Link
  href="/profile/setup"
  className="flex w-full items-center justify-center gap-3 rounded-[8px] bg-white py-3 text-center text-[13px] font-bold !text-black"
>
  Set-up Profile
  <LogIn size={15} className="text-green-500" />
</Link>
        </div>
      </section>
    </main>
  );
}