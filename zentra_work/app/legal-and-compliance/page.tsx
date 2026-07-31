"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

const legalItems = [
  {
    title: "Terms & Agreements",
    content:
      "View the terms and conditions that apply to your account, transactions, and use of the platform.",
  },
  {
    title: "Privacy & Data",
    content:
      "Learn how your personal data is collected, protected, stored, and used.",
  },
  {
    title: "Regulatory Disclosures",
    content:
      "Access important regulatory information and required disclosures.",
  },
  {
    title: "Compliance Policies (KYC, AML)",
    content:
      "Review our Know Your Customer and Anti-Money Laundering compliance requirements.",
  },
  {
    title: "Disputes & Complaints",
    content:
      "Find information on how to raise a dispute or submit a formal complaint.",
  },
  {
    title: "Fees & Transparency",
    content:
      "See applicable fees, service charges, and transparent pricing information.",
  },
  {
    title: "Document Center",
    content:
      "Access downloadable documents, policies, forms, and compliance resources.",
  },
];

export default function LegalCompliancePage() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-5 pt-10 text-[1f1f1f]/80 font-roboto">
      <div className="mx-auto max-w-[430px]">
        {/* Header */}
        <header className="relative flex h-8 items-center justify-center">
          <Link
            href="/support/help-support"
            className="absolute left-0 flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={24} className="text-[#1f1f1f]/80" />
          </Link>

          <h1 className="font-heading text-[13px] font-black tracking-[0.04em] text-[#333333]">
            Legal & Compliance
          </h1>
        </header>

        {/* Accordion List */}
        <section className="mt-5 space-y-3">
  {legalItems.map((item, index) => {
    const isOpen = openItem === index;

    return (
      <div
        key={item.title}
        className="overflow-hidden rounded-[12px] bg-white"
      >
        <button
          type="button"
          onClick={() => setOpenItem(isOpen ? null : index)}
          className="flex h-[35px] w-full items-center justify-between rounded-[12px] bg-white px-4 text-left"
        >
          <span className="text-[13px] font-semibold text-[#3f434a]">
            {item.title}
          </span>

          <ChevronDown
            size={17}
            className={`text-[#3f444a] transition-transform duration-300 ${
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
            <div className="px-[29px] pb-2 pt-1">
              <p className="rounded-[7px] bg-white px-4 py-2 text-[14px] leading-[16px] text-[#222]">
                {item.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</section>
      </div>
    </main>
  );
}