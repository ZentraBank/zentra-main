"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import HelpCenterOverlay from "@/components/HelpCenterOverlay";
import ReportIssueOverlay from "@/components/ReportIssueOverlay";
import TicketCaseTrackingOverlay from "@/components/TicketCaseTrackingOverlay";
import CustomerSupportOverlay from "@/components/ContactSupportOverlay";

const supportLinks = [
  { title: "Contact Support", overlay: "contact" },
  { title: "Help Center", overlay: "help" },
  { title: "Report an Issue", overlay: "report" },
  { title: "Ticket / Case\nTracking", overlay: "ticket" },
] as const;

const faqItems = [
  {
    title: "Forgot Password?",
    content:
      "Go to the login page, click Forgot Password, enter your email or phone number, then follow the OTP verification steps.",
  },
  {
    title: "Account & KYC",
    content:
      "Complete your personal information, identification details, contact information, and submit your documents for review.",
  },
  {
    title: "Transfers & payments",
    content:
      "You can make transfers, view payment history, and track pending transactions from your dashboard.",
  },
  {
    title: "Card issues",
    content:
      "For lost, blocked, declined, or stolen cards, use the card support option or contact support immediately.",
  },
];

export default function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<
    "contact" | "help" | "report" | "ticket" | null
  >(null);

  return (
    <main className="relative min-h-screen bg-[#E7EBF0] px-4 pb-10 pt-10 font-sf-condensed text-[#1f1f1f]/80">
      <div className="mx-auto max-w-[430px]">
        <header className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={24} className="text-[#5b5f66]" />
          </Link>

          <h1 className="font-sf-condensed text-[13px] font-black tracking-[0.04em] text-[#5d5d5d]">
            Help/Support
          </h1>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9cf4d] bg-white/40">
            <Image
              src="/images/help.png"
              alt="Support icon"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        </header>

        <div className="relative mx-auto mt-8 h-[189px] w-[230px]">
          <Image
            src="/images/profile-setting-2.png"
            alt="Settings support"
            fill
            priority
            className="object-contain"
          />
        </div>

        <section className="mt-6">
          <h2 className="font-sf-condensed text-[14px] font-black text-black/95">
            Support Links
          </h2>

          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-4">
            {supportLinks.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveOverlay(item.overlay)}
                className="flex h-[43px] w-full items-center justify-center rounded-[12px] bg-white/30 px-3 text-center font-roboto text-[14px] font-semibold leading-[16px] text-[#55585f] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
                {item.title.split("\n").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 w-full rounded-b-[12px] rounded-t-[10px] bg-[#2563EB] px-2 pb-3 pt-2">
          <h2 className="font-sf-condensed text-[12px] text-black/95">
            Frequently Asked Questions
          </h2>

          <div className="relative mt-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BDC3C7]"
            />

            <input
              type="text"
              placeholder="Search Questions"
              className="h-[28px] w-full rounded-[9px] border border-white/70 bg-white/25 pl-9 pr-3 text-[14px] text-white outline-none placeholder:text-[#BDC3C7]"
            />
          </div>

          <div className="mt-2 space-y-2">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={item.title}
                  className="overflow-hidden rounded-[9px] bg-white font-roboto shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex h-[36px] w-full items-center justify-between px-4 text-left"
                  >
                    <span className="font-roboto text-[13px] font-medium text-[#3f434a]">
                      {item.title}
                    </span>

                    <ChevronDown
                      size={17}
                      className={`text-[#4b5563] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-[#e8edf5] px-4 py-3 text-[12px] leading-5 text-[#60646c]">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <CustomerSupportOverlay
        open={activeOverlay === "contact"}
        onClose={() => setActiveOverlay(null)}
      />

      <HelpCenterOverlay
        open={activeOverlay === "help"}
        onClose={() => setActiveOverlay(null)}
      />

      <ReportIssueOverlay
        open={activeOverlay === "report"}
        onClose={() => setActiveOverlay(null)}
      />

      <TicketCaseTrackingOverlay
        open={activeOverlay === "ticket"}
        onClose={() => setActiveOverlay(null)}
      />
    </main>
  );
}