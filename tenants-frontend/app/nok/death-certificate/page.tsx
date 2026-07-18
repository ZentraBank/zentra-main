"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  Download,
  Video,
} from "lucide-react";
import { useState } from "react";

export default function DeathCertificatePage() {
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = async () => {
    if (notificationSent || isSending) return;

    setIsSending(true);

    try {
      /*
        Connect to your backend later:

        const response = await fetch("/api/notifications/death-certificate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: "CLIENT_ID",
            documentType: "death-certificate",
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to send notification");
        }
      */

      await new Promise((resolve) => setTimeout(resolve, 600));

      setNotificationSent(true);
    } catch (error) {
      console.error("Unable to send notification:", error);
      alert("The notification could not be sent.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = () => {
    const documentUrl = "/documents/death-certificate.pdf";

    const anchor = document.createElement("a");
    anchor.href = documentUrl;
    anchor.download = "death-certificate.pdf";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-black text-white">
      {/* Background */}
      <Image
        src="/images/Background_1.png"
        alt="Death certificate background"
        fill
        priority
        className="fixed object-cover object-center"
      />

      <div className="fixed inset-0 bg-black/5" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col px-4 pb-5 pt-10">
        {/* Header */}
        <header className="relative flex items-center justify-center">
          <Link
            href="/nok"
            aria-label="Go back"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={21} />
          </Link>

          <p className="font-sf-condensed text-[13px] font-bold tracking-[0.08em]">
            Next-of-kin Management
          </p>
        </header>

        {/* Heading */}
        <section className="mt-5 text-center">
          <h1 className="font-sf-condensed text-[39px] font-semibold  leading-[1.02] tracking-[-1px] underline decoration-[#19A7FF] decoration-[3px] underline-offset-[4px]">
            McGregory&apos;s Next-
            <br />
            of-Kind Death Cert.
          </h1>

          <p className="mx-auto mt-5 max-w-[330px] font-lato text-[14px] font-medium leading-[17px] text-white">
            Control and act as a next-of-kin funds account manager for your
            clients. Give them exactly what they want to see and get your
            massive cashout in a couple of days!
          </p>
        </section>

        {/* Certificate card */}
        <section className="mx-auto mt-4 w-full max-w-[345px] overflow-hidden rounded-[12px] bg-[#BFC4C9] px-3 pb-3 pt-3 text-[#555] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <h2 className="font-roboto text-[14px] font-medium">
              Death certificate
            </h2>

            <ChevronUp size={17} className="text-black/25" />
          </div>

          {/* Document preview */}
          <div className="relative mt-7 h-[455px] w-full overflow-hidden bg-white">
            <Image
              src="/images/death-certificate-preview.png"
              alt="Client death certificate"
              fill
              className="object-cover object-top"
            />

            <button
              type="button"
              aria-label="Open document preview"
              className="absolute right-2 top-2 flex h-[31px] w-[43px] items-center justify-center rounded-[3px] border border-black/10 bg-white/90 text-[#555] shadow-sm"
            >
              <Video size={15} />
            </button>
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="mt-6 flex h-[32px] w-full items-center justify-center gap-2 rounded-[11px] bg-white/45 font-roboto text-[14px] font-medium text-[#555] transition hover:bg-white/60 active:scale-[0.99]"
          >
            Download file
            <Download size={18} />
          </button>
        </section>

        {/* Notification */}
        <section className="mt-4">
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

        {/* Next button */}
        <Link
          href="/nok/valid-id"
          className="mx-auto mt-10 flex h-[34px] w-[234px] items-center justify-center gap-3 rounded-[10px] bg-[#294CC9] font-roboto text-[15px] font-medium text-white transition hover:bg-[#1E40AF] active:scale-[0.98]"
        >
          Next
          <ArrowRight size={19} />
        </Link>
      </div>
    </main>
  );
}