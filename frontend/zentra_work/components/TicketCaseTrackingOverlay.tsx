"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const contactOptions = [
  {
    title: "LIVE hat (24/7)",
    href: "/chat",
    icon: "/images/live-chat.png",
  },
  {
    title: "Call Support",
    href: "tel:+441234567890",
    icon: "/images/call-support.png",
  },
  {
    title: "Email Support",
    href: "mailto:support@example.com",
    icon: "/images/email.png",
  },
  {
    title: "Request a call back",
    href: "/support/callback",
    icon: "/images/request-call.png",
  },
];

type TicketCaseOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function TicketCaseOverlay({
  open,
  onClose,
}: TicketCaseOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/20 px-5 pt-[218px] backdrop-blur-[1px]">
      <section className="min-h-[326px] w-full max-w-[342px] rounded-[24px] bg-white px-4 pt-5 shadow-[0_4px_10px_rgba(0,0,0,0.22)]">
        <header className="relative flex items-center justify-center">
          <button title="Close"
            type="button"
            onClick={onClose}
            className="absolute left-0 flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={24} className="text-[#4f5358]" />
          </button>

          <h1 className="font-heading text-[13px] font-black tracking-[0.03em] text-black">
            Contact Support
          </h1>
        </header>

        <div className="mt-9 space-y-[10px] font-roboto">
          {contactOptions.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={onClose}
              className="relative flex h-[33px] items-center justify-center rounded-[10px] border border-[#eef0f4] bg-white text-[14px] font-semibold text-[#5a5a5a] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
            >
              <Image
                src={item.icon}
                alt={item.title}
                width={24}
                height={24}
                className="absolute left-[17px] object-contain"
              />

              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}