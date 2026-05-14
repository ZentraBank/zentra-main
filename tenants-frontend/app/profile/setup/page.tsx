import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ArrowRight } from "lucide-react";

const sections = [
  "Personal Information",
  "Identification detail",
  "Contact information:",
  "Communication preference",
  "Employment & Financial Information",
];

export default function ProfileSetupPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-30 text-white md:flex md:flex-col">
      <div className="mx-auto w-full max-w-[360px] md:max-w-[420px]">
        {/* HEADER */}
        <div className="relative mb-4 text-center">
          <Link href="/register/success" className="absolute left-0 top-0">
            <ArrowLeft size={18} />
          </Link>

          <p className="text-[12px] font-bold md:text-[13px]">
            Profile settings page
          </p>
        </div>

        {/* CARD */}
         <section className="rounded-[12px] border-[4px] border-[#d6c51f] bg-black px-4 pb-8 pt-5 shadow-xl">
          {/* TOP */}
          <div className="flex items-center gap-3">
            <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle,#f7f7f7_0%,#b9b9b9_45%,#111_78%)] md:h-[120px] md:w-[120px]">
              <Image
                src="/images/kyc.png"
                alt="KYC"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <div>
              <h1 className="text-[16px] font-extrabold text-[#6c8cff] md:text-[18px]">
                Complete Your KYC
              </h1>
              <p className="mt-2 text-[11px] font-semibold leading-[14px] text-white/80 md:text-[12px]">
                Completing your KYC is the only assured way of enjoying almost
                all our Banking features
              </p>
            </div>
          </div>

          {/* SELECT */}
          <select className="mt-4 h-[36px] w-full rounded-[8px] bg-white px-3 text-[12px] font-semibold text-black outline-none">
            <option>Scammer category?</option>
            <option>Basic user</option>
            <option>Verified user</option>
          </select>

          {/* BANNER */}
          <div className="mt-3 h-[80px] overflow-hidden rounded-[4px] bg-[radial-gradient(circle_at_80%_90%,#f0eef1_0%,#dfc5d5_35%,transparent_36%),linear-gradient(90deg,#b80d0d_0%,#b80d0d_65%,#d8c1cf_100%)] px-4 py-2 md:h-[90px]">
            <h2 className="text-[18px] font-extrabold leading-[20px]">
              Glowing
              <br />
              Season
            </h2>
            <p className="mt-1 text-[10px] font-semibold">
              Offers that never fail!
            </p>
          </div>

          {/* SECTIONS */}
          <div className="mt-4 space-y-3">
            {sections.map((section) => (
              <button
                key={section}
                className="flex w-full items-center justify-between border-b border-white/20 pb-2 text-left text-[12px] font-bold md:text-[13px]"
              >
                <span>{section}</span>
                <ChevronDown size={15} />
              </button>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="mx-auto mt-8 flex h-[40px] w-[85%] items-center justify-center gap-2 rounded-[8px] bg-[#2458E8] text-[13px] font-semibold text-white md:w-full"
          >
            Go to homepage
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </main>
  );
}