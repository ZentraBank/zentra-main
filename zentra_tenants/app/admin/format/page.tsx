"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

const formatOptions = [
  "Initial Deposit(Response to client)",
  "Account Upgrade(Response to client)",
  "Initial Deposit(Response to client)",
  "More Format Text",
];

export default function AdminFormatPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover opacity-80"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col">
        <header className="px-4 pb-4 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/agent" className="text-white hover:text-white/80">
              <ArrowLeft size={20} />
            </Link>

            <h1 className="font-sf-condensed text-[24px] font-bold leading-none">
              Customer Care Agent
            </h1>
          </div>

          <div className="mt-3 flex justify-center gap-2 px-10">
            <Link
              href="/admin/chat"
              className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] !bg-[#5A6270] text-[12px] font-medium text-white"
            >
              Chat
            </Link>

            <Link
              href="/admin/codes"
              className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] !bg-[#5A6270] text-[12px] font-medium text-white"
            >
              Codes
            </Link>

            <Link
              href="/admin/format"
              className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] !bg-[#1E40AF] text-[12px] font-medium text-white"
            >
              Format
            </Link>
          </div>
        </header>

        <section className="mx-auto mt-10 w-[356px] rounded-[5px] bg-[#2547c5] px-3 pb-6 pt-7 shadow-xl">
          <h2 className="text-center font-sf-condensed text-[24px] font-bold">
            Format
          </h2>

          <p className="mx-auto mt-6 max-w-[285px] text-center font-lato text-[13px] font-bold leading-[16px] text-white">
            These write-up below are in-built and you should use them per-time
            to make your client think that you are legit.
            <br />
            Use it, depending on the format behind the billing that has brought
            them to request for code:
          </p>

          <div className="mt-6 space-y-4">
            {formatOptions.map((item, index) => (
              <div key={index} className="border-t border-white/70 pt-4">
                <button
                  type="button"
                  className="flex h-[50px] w-full items-center justify-between rounded-[4px] !bg-white px-3 text-left font-lato text-[14px] !text-black/55 shadow-sm"
                >
                  <span>{item}</span>
                  <ChevronDown size={18} className="text-black/50" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}