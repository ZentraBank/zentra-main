import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function AgentIntroPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/agent-page.png"
        alt="Customer care agent background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-7 pb-10 pt-4">
        <Link href="/dashboard" className="absolute left-3 top-4 text-white">
          <ArrowLeft size={18} />
        </Link>

        <section className="pt-7 text-center">
          <h1 className="text-[31px] font-black leading-[33px] tracking-[-0.6px] text-white underline decoration-blue-700 decoration-[3px] underline-offset-2">
            Chat, and approve clients’ activities, as a Customer Care Agent
          </h1>
        </section>

        <section className="mx-[-28px] mt-[155px] bg-black px-7 py-5">
          <p className="text-[13px] font-medium leading-[14px] text-white">
            As a Customer Care Agent, you can chat and bill clients using
            different format like;
          </p>

          <ul className="mt-1 list-disc pl-5 text-[13px] font-medium leading-[14px] text-white">
            <li>The Need For Account Upgrade,</li>
            <li>Donation Redemption,</li>
            <li>Initial Deposit Etc...</li>
          </ul>
        </section>

        <div className="mt-auto flex justify-center">
          <Link
            href="/admin/chat"
            className="flex h-[28px] w-[240px] items-center justify-center gap-4 rounded-[8px] bg-blue-700 text-[12px] font-bold !text-white shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
          >
            Continue as Agent.
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}