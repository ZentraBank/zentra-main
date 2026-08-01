"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { useState } from "react";
import RequestDonationOverlay from "@/components/donation/RequestDonationOverlay";

const benefits = [
  "Dorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Dorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Dorem ipsum dolor sit amet, consectetur adipiscing elit.",
];

export default function DonationRequestPage() {
    const [showRequestForm, setShowRequestForm] = useState(false);
  return (
    <main
      className="min-h-screen bg-[#2f6df2] px-4 pb-6 pt-10 text-[#111]"
      style={{
        backgroundImage: "url('/images/donations-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        <header className="relative flex items-center justify-center">
          <Link href="/donations-gift/donations" className="absolute left-0 text-[#222]">
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Donation
          </h1>
        </header>

        <section className="mt-7 overflow-hidden rounded-[7px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {/* Donor Profile */}
          <div className="grid grid-cols-[1.05fr_1fr] gap-3 bg-[#eef5ff] p-2">
            <div className="relative h-[128px] overflow-hidden rounded-[3px]">
              <Image
                src="/images/donations-avatar-2.png"
                alt="McCatherine Thyler"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="pt-1">
              <h2 className="text-[16px] font-medium leading-none">
                McCatherine Thyler
              </h2>

              <p className="mt-2 text-[12px] leading-[13px]">
                Cyrbersecurity expert with 5 years in the field. A renowned
                Philanthropist.
              </p>

              <ul className="mt-2 space-y-1 text-[12px] leading-[13px]">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Phd. Bsc. Fellowship in Humanitarian services</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Brndford University</span>
                </li>
              </ul>

              <div className="mt-2 flex items-center gap-[2px] text-[#ffd233]">
                {[1, 2, 3, 4].map((item) => (
                  <Star key={item} size={13} fill="currentColor" />
                ))}
                <Star size={13} fill="currentColor" className="opacity-40" />
              </div>
            </div>
          </div>

          {/* Image + Donation Info */}
          <div className="bg-[linear-gradient(135deg,#11863B_0%,#53B879_42%,#F8F8F8_68%,#159B45_100%)] pt-1">
            <div className="relative mx-auto h-[167px] w-full overflow-hidden rounded-[50%]">
              <Image
                src="/images/donation-hands.png"
                alt="Donation hands"
                fill
                className="object-cover"
              />
            </div>

            <div className="border-t border-black/10 px-4 pb-5 pt-4">
              <h2 className="text-center text-[22px] font-black">Donations</h2>

              <p className="mt-3 text-[13px] leading-[16px]">
                ZentraBank works with Philanthropists, around the world, who are
                willing to make financial donation to help the poor and needy.
              </p>

              <p className="mt-4 text-[13px] leading-[16px]">
                If you are a compassionate soul and an aspiring Philanthropist,
                the is your best financial shot to begin...
              </p>

              <p className="mt-5 text-[13px] font-medium">
                Request for donation now...
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white px-4 pb-6 pt-3">
            <h3 className="text-[14px] font-black">Benefits</h3>

            <ul className="mt-2 list-disc space-y-2 pl-5 text-[13px] leading-[16px]">
              {benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </section>

        <div className="sticky bottom-0 mt-auto bg-white/80 px-0 pb-3 pt-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setShowRequestForm(true)}
            className="flex h-[43px] w-full items-center justify-center rounded-[9px] bg-[#2458E8] text-[14px] font-bold text-white shadow-sm active:scale-[0.98]"
            >
            Request donation
            </button>
        </div>
      </section>
      <RequestDonationOverlay
  open={showRequestForm}
  onClose={() => setShowRequestForm(false)}
/>
    </main>
  );
}

