"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

const donors = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: "McCatherine Thyler",
  description:
    "Cyrbersecurity expert with 5 years in the field. A renowned Philanthropist.",
  image: "/images/donations-avatar-2.png",
}));

export default function DonationDetailsPage() {
  return (
    <main
      className="min-h-screen overflow-hidden bg-[#9AF0A8]"
      style={{
        backgroundImage: "url('/images/donations-bg-2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-8 pt-10">
        <header className="relative flex items-center justify-center">
          <Link href="/donations-gift" className="absolute left-0 text-[#3f3f3f]">
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Donation
          </h1>
        </header>

        <div className="mt-6 flex justify-center">
          <div className="relative h-[150px] w-[292px] overflow-hidden rounded-[50%] ]">
            <Image
              src="/images/donation-hands.png"
              alt="Donation"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[330px] space-y-4 text-center text-[15px] leading-[20px] text-[#6b6b6b]">
          <p>
            Experience how amazing it is to enjoy free-will donations from
            people you know and don’t know. Just pick from the list of
            Philanthropists who are touched by the natural experiences of the
            poor and needy, to get support.
          </p>

          <p>Do you need funds as an upcoming Philanthropist?</p>

          <p>Do need funds to help the poor and needy?</p>
        </div>

        <section className="mt-6 rounded-[8px] bg-[#8FC2FF] px-2 pb-3 pt-4 shadow-[0_0_8px_rgba(0,0,0,0.18)]">
          <h2 className="mb-2 text-[13px] font-black text-[#222]">
            Available donors
          </h2>

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {donors.map((donor) => (
              <article
                key={donor.id}
                className="flex min-h-[76px] items-center gap-3 rounded-[7px] bg-[#eef5ff] px-2 py-2 shadow-sm"
              >
                <div className="relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[5px]">
                  <Image
                    src={donor.image}
                    alt={donor.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[17px] font-medium leading-none text-[#222]">
                    {donor.name}
                  </h3>

                  <p className="mt-1 text-[12px] leading-[12px] text-[#333]">
                    {donor.description}
                  </p>
                </div>

                <div className="flex w-[78px] shrink-0 flex-col items-end gap-2">
                  
                  <Link
                  href={`/donations-gift/donations/donationrequest?donor=${donor.id}`}
                  className="flex h-[27px] w-[78px] items-center justify-center gap-1 rounded-full bg-[#2458E8] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#1d49c6] active:scale-95"
                >
                  Request
                  <Plus size={15} />
                </Link>

                  <span className="flex h-[22px] w-[78px] items-center justify-center rounded-full bg-white text-[13px] text-[#555] shadow-sm">
                    Donor
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
