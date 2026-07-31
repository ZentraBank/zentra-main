"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Image from "next/image";

const donors = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: "McCatherine Thyler",
  description:
    "Cybersecurity expert with 5 years in the field. A renowned Philanthropist.",
  image: "/images/donations-avatar-2.png",
}));

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RequestDonationOverlay({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm">
      <section
  className="
    absolute
    bottom-0
    left-0
    right-0
    mx-auto
    h-[92vh]
    max-w-[430px]
    overflow-y-auto
    rounded-t-[24px]
    px-5
    pt-6
    animate-in
    slide-in-from-bottom
  "
  style={{
    backgroundImage: "url('/images/cards-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
        <header className="relative flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute left-0"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="font-heading text-[13px] font-bold text-white tracking-[0.08em]">
            Donation
          </h1>
        </header>

        <form className="mt-6">
          <label className="text-[13px] font-semibold">
            Purpose
          </label>

          <textarea
            placeholder="Clearly explain why this funds should be released to you?"
            className="mt-2 h-[120px] w-full resize-none rounded-[8px] bg-white px-3 py-3 outline-none"
          />

          <p className="mt-5 text-[13px] font-semibold">
            Appreciation
          </p>

          <label className="mt-2 block text-[12px]">
            Other means of transaction
          </label>

          <textarea
            placeholder="How will you repay this goodwill if this fund is successfully granted?"
            className="mt-2 h-[130px] w-full resize-none rounded-[8px] bg-white px-3 py-3 outline-none"
          />

          <p className="mt-2 text-right text-[11px] font-semibold">
            Compulsory
          </p>

          <section className="mt-4 rounded-[10px] bg-[#8FC2FF] p-2">
            <h2 className="mb-2 text-[13px] font-black">
              Available donors
            </h2>

            <div className="space-y-2">
              {donors.map((donor) => (
                <article
                  key={donor.id}
                  className="flex items-center gap-2 rounded-[8px] bg-white p-2"
                >
                  <div className="relative h-[60px] w-[60px] overflow-hidden rounded-[5px]">
                    <Image
                      src={donor.image}
                      alt={donor.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[15px] font-medium">
                      {donor.name}
                    </h3>

                    <p className="text-[11px] leading-[12px]">
                      {donor.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex h-[28px] items-center gap-1 rounded-full bg-[#2458E8] px-3 text-[12px] text-white"
                  >
                    Request
                    <Plus size={13} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="sticky bottom-0 mt-5 bg-[#E7EBF0] py-4">
            <button
              type="submit"
              className="h-[44px] w-full rounded-[10px] bg-[#2458E8] font-bold text-white"
            >
              Confirm request
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}