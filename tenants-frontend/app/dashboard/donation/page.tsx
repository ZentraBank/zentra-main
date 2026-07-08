import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  HandHeart,
  ShieldCheck,
  Users,
} from "lucide-react";

const donorStats = [
  { label: "Active Donors", value: "128" },
  { label: "Pending Requests", value: "34" },
  { label: "Completed Funding", value: "$2.4M" },
];

const benefits = [
  {
    icon: HandHeart,
    title: "Support verified users",
    text: "Help clients receive funds through secure donation channels.",
  },
  {
    icon: ShieldCheck,
    title: "Verified donor profile",
    text: "Register your profile and become visible to approved clients.",
  },
  {
    icon: Gift,
    title: "Multiple funding methods",
    text: "Donate with crypto, gift card, or direct bank transfer.",
  },
];

export default function DonorPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[430px] flex-col px-4 pb-10 pt-10 md:max-w-[1180px] md:px-10">
        <Link href="/dashboard/donation" className="mb-6 inline-flex text-white">
          <ArrowLeft size={20} />
        </Link>

        <section className="grid flex-1 items-center gap-8 md:grid-cols-[1fr_420px]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[12px] font-bold backdrop-blur-md md:text-sm">
              <Users size={16} />
              Funds Donor Portal
            </div>

            <h1 className="text-[42px] font-black leading-[0.92] tracking-[-1px] md:text-[76px]">
              Become a
              <br />
              <span className="text-[#d6c51f]">Funds Donor</span>
            </h1>

            <p className="mt-5 max-w-[560px] text-[14px] font-medium leading-[21px] text-white/80 md:text-lg md:leading-7">
              Register as a verified donor and support clients through crypto,
              gift cards, or direct bank transfer.
            </p>

            <Link
              href="/dashboard/donation/donor/register"
              className="mt-8 inline-flex h-[50px] w-full max-w-[320px] items-center justify-center gap-3 rounded-[12px] bg-[#2447d8] text-[15px] font-black text-white shadow-xl transition hover:bg-[#1f3fc0] md:h-[56px]"
            >
              Register Donor
              <ArrowRight size={19} />
            </Link>
          </div>

          <div className="rounded-[24px] border border-white/15 bg-white/90 p-4 text-black shadow-2xl backdrop-blur-xl md:p-5">
            <Image
              src="/images/David.png"
              alt="Donor"
              width={420}
              height={300}
              className="h-[230px] w-full rounded-[18px] object-cover md:h-[280px]"
            />

            <div className="mt-4 grid grid-cols-3 gap-2">
              {donorStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[14px] bg-black px-2 py-3 text-center text-white"
                >
                  <p className="text-[15px] font-black md:text-xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-white/60 md:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-3 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-[18px] border border-white/15 bg-black/55 p-4 backdrop-blur-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2447d8]">
                  <Icon size={19} />
                </div>

                <h3 className="text-[15px] font-black">{benefit.title}</h3>

                <p className="mt-2 text-[12px] leading-[17px] text-white/65 md:text-sm md:leading-5">
                  {benefit.text}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}