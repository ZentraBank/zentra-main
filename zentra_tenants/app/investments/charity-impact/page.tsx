"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function CharityImpactInvestmentPage() {
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = async () => {
    if (notificationSent || isSending) return;

    setIsSending(true);

    try {
      /*
        Replace this with your backend request later:

        const response = await fetch("/api/notifications/investment-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investmentType: "charity-impact",
            clientId: "CLIENT_ID",
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to send notification.");
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

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-black text-white">
      {/* Background */}
      <Image
        src="/images/Background_1.png"
        alt="Charity investment background"
        fill
        priority
        className="fixed object-cover object-center"
      />

      <div className="relative z-10 mx-auto min-h-[100svh] w-full max-w-[430px] pb-10">
        {/* Header */}
        <header className="relative flex h-[74px] items-center justify-center px-4">
          <Link
            href="/investments/categories"
            aria-label="Go back"
            className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </Link>

          <p className="font-sf-condensed text-[12px] font-bold tracking-[0.05em]">
            Charity &amp; Impact Investments
          </p>
        </header>

        {/* Main image card */}
        <section className="overflow-hidden rounded-b-[15px] border-b border-r border-white/30 bg-black/20 shadow-[0_10px_25px_rgba(0,0,0,0.3)] h-[692px] w-full max-w-[430px]">
          <div className="relative h-[541px] w-full">
            <Image
              src="/images/charity-impact-children.png"
              alt="Children supported by a charity investment"
              fill
              priority
              className="object-cover object-center"
            />

            {/* Text overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-white/55 px-3 py-4 backdrop-blur-[1px]">
              <p className="text-justify font-lato text-[14px] font-semibold leading-[18px] text-black">
                Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                vulputate libero et velit interdum, ac aliquet odio mattis.
                Class aptent taciti sociosqu ad litora torquent per conubia
                nostra, per inceptos himenaeos.
              </p>
            </div>
          </div>

          {/* Bottom action area */}
          <div className="px-10 pb-5 pt-5">
            {/* Notification request */}
            <div
              className="grid min-h-[42px] grid-cols-[1fr_86px] items-center gap-2 rounded-[8px] bg-cover bg-center bg-no-repeat px-2 py-1 shadow-[0_3px_7px_rgba(0,0,0,0.5)]"
              style={{
                backgroundImage:
                  "url('/images/ads-bg.png')",
              }}
            >
              <p className="text-center font-roboto text-[10px] leading-[10px] text-white">
                Send a notification now;
                <br />
                requesting this client to make
                <br />
                this investment
              </p>

              <button
                type="button"
                onClick={handleSendNotification}
                disabled={notificationSent || isSending}
                className="relative flex h-[23px] items-center justify-center overflow-hidden rounded-full font-roboto text-[10px] text-white transition active:scale-[0.98] disabled:cursor-not-allowed"
              >
                {!notificationSent && (
                  <Image
                    src="/images/ads-bg.png"
                    alt=""
                    fill
                    className="object-fill"
                  />
                )}

                {notificationSent && (
                  <span className="absolute inset-0 bg-green-600" />
                )}

                <span className="relative z-10">
                  {notificationSent
                    ? "Sent ✓"
                    : isSending
                      ? "Sending..."
                      : "Send"}
                </span>
              </button>
            </div>

            {/* View more */}
            <Link
              href="/investments/charity-impact/details"
              className="mx-auto mt-7 flex h-[34px] w-full max-w-[252px] items-center justify-center gap-3 rounded-[10px] bg-[#294CC9] font-roboto text-[14px] font-medium text-white transition hover:bg-[#1E40AF] active:scale-[0.98]"
            >
              View more
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}