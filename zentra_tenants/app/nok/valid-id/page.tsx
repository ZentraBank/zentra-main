"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  Download,
} from "lucide-react";
import { useState } from "react";

const idDocuments = [
  {
    title: "National Passport",
    file: "/documents/national-passport.pdf",
  },
  {
    title: "Voter’s Card",
    file: "/documents/voters-card.pdf",
  },
];

export default function ValidIdPage() {
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleDownload = (fileUrl: string, fileName: string) => {
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleSendNotification = async () => {
    if (notificationSent || isSending) return;

    setIsSending(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setNotificationSent(true);
    } catch (error) {
      console.error("Unable to send notification:", error);
      alert("The notification could not be sent.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-black text-white">
      {/* Page background */}
      <Image
        src="/images/Background_1.png"
        alt="Next-of-kin valid ID background"
        fill
        priority
        className="fixed object-cover object-center"
      />

      <div className="fixed inset-0 bg-black/5" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col px-5 pb-6 pt-9">
        {/* Header */}
        <header className="relative flex items-center justify-center">
          <Link
            href="/nok/death-certificate"
            aria-label="Go back"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={19} />
          </Link>

          <p className="font-sf-condensed text-[11px] font-bold tracking-[0.08em]">
            Next-of-kin Management
          </p>
        </header>

        {/* Heading */}
        <section className="mt-5 text-center">
          <h1 className="font-sf-condensed text-[36px] font-black leading-[0.95] tracking-[-0.8px]">
            McGregory&apos;s Next-
            <br />
            of-Kind I.D
          </h1>

          <p className="mx-auto mt-4 max-w-[330px] font-lato text-[13px] font-medium leading-[16px] text-white">
            Control and act as a next-of-kin funds account manager for your
            clients. Give them exactly what they want to see and get your
            massive cashout in a couple of days!
          </p>
        </section>

        {/* Download-only ID rows */}
        <section className="mt-4 space-y-3">
          {idDocuments.map((document) => (
            <div
              key={document.title}
              className="flex min-h-[44px] items-center justify-between rounded-[10px] bg-[#C3C8CC] px-3 text-[#555] shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
            >
              <span className="font-roboto text-[12px] font-medium">
                {document.title}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      document.file,
                      `${document.title.toLowerCase().replaceAll(" ", "-")}.pdf`
                    )
                  }
                  className="flex h-[25px] items-center gap-2 rounded-full bg-white/40 px-3 font-roboto text-[11px] font-medium text-[#555] transition hover:bg-white/60 active:scale-[0.98]"
                >
                  Download file
                  <Download size={15} />
                </button>

                <ChevronUp size={16} className="text-black/25" />
              </div>
            </div>
          ))}
        </section>

        {/* Driver's licence preview */}
        <section className="mt-3 overflow-hidden rounded-[11px] bg-[#BEC3C8] px-3 pb-3 pt-3 text-[#555] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between">
            <h2 className="font-roboto text-[12px] font-medium">
              Driver&apos;s Liscence
            </h2>

            <ChevronUp size={16} className="text-black/25" />
          </div>

          <div className="relative mt-2 h-[190px] w-full overflow-hidden bg-white">
            <Image
              src="/images/drivers-licence-preview.png"
              alt="Client driver's licence"
              fill
              className="object-cover object-top"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              handleDownload(
                "/documents/drivers-licence.pdf",
                "drivers-licence.pdf"
              )
            }
            className="mt-2 flex h-[30px] w-full items-center justify-center gap-2 rounded-[10px] bg-white/45 font-roboto text-[12px] font-medium text-[#555] transition hover:bg-white/60 active:scale-[0.99]"
          >
            Download file
            <Download size={15} />
          </button>
        </section>

        {/* Notification request */}
        <section className="mt-5">
                              <div className="relative grid min-h-[40px] grid-cols-[1fr_92px] items-center gap-2 overflow-hidden rounded-[8px] px-2 py-1 shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
  {/* Background Image */}
  <Image
    src="/images/ads-bg.png"
    alt="Notification Background"
    fill
    priority
    className="object-cover"
  />

  {/* Optional dark overlay */}
  <div className="absolute inset-0 bg-black/10" />

  {/* Content */}
  <p className="relative z-10 text-center font-roboto text-[12px] leading-[12px] text-white">
    Send a notification request to this
    <br />
    client to fill-up for this next-of-kin
    <br />
    document
  </p>


            <button
            type="button"
            onClick={handleSendNotification}
            disabled={notificationSent || isSending}
            className="relative flex h-[27px] w-[86px] items-center justify-center overflow-hidden rounded-full transition active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {/* Background Image */}
            <Image
              src={
                notificationSent
                  ? "/images/ads-bg.png" // optional success background
                  : "/images/ads-bg.png"
              }
              alt="Send Button"
              fill
              className="object-cover"
            />

            {/* Button Text */}
            <span className="relative z-10 font-roboto text-[12px] font-medium text-white">
              {notificationSent
                ? "Sent ✓"
                : isSending
                ? "Sending..."
                : "Send"}
            </span>
          </button>
          </div>
        </section>

        {/* Next */}
        <Link
          href="/nok/pod-form"
          className="mx-auto mt-10 flex h-[34px] w-[234px] items-center justify-center gap-3 rounded-[9px] bg-[#294CC9] font-roboto text-[14px] font-medium text-white transition hover:bg-[#1E40AF] active:scale-[0.98]"
        >
          Next
          <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}