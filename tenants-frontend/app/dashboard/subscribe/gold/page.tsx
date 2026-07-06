import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Sparkles,
  Video,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const plans = ["Read", "Gold", "Diamond"];

export default function SubscribePage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background.png"
        alt="Subscribe background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-3 pb-8 pt-9 text-center lg:max-w-6xl lg:px-10 lg:pt-16">
        <Link
          href="/dashboard"
          className="absolute left-3 top-11 z-20 text-white lg:left-10 lg:top-10"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* MOBILE VERSION */}
        <div className="flex min-h-[calc(100svh-68px)] flex-col lg:hidden">
          <h1 className="font-heading text-[34px] font-semibold leading-none tracking-[1px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)]">
            Subscribe!
          </h1>

          <section className="mt-9 overflow-hidden border-y border-blue-500 bg-white/95 py-2 text-black">
            <h2 className="text-[20px] font-extrabold leading-5">
              Choose Plan
            </h2>

            <div className="mt-2 grid grid-cols-3 gap-2 px-3">
              {plans.map((plan, index) => (
                <button
                  key={plan}
                  className={`h-6 rounded-md text-[11px] font-medium ${
                    index === 1
                      ? "bg-blue-700 text-white"
                      : "bg-gray-400 text-black"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </section>

          <div className="relative mt-5 flex justify-center">
            <Image
              src="/images/ring2.png"
              alt="Subscribe ring"
              width={130}
              height={130}
              priority
              className="h-[118px] w-[118px] object-contain"
            />
          </div>

          <div className="mx-2 mt-5 flex items-center justify-between text-[10px] font-bold">
            <span>Gold</span>
            <span>$40</span>
          </div>

          <section className="mx-2 rounded-xl bg-white px-3 py-2 text-left text-black shadow-[0_0_8px_rgba(37,99,235,0.85)]">
            <h2 className="font-heading text-[28px] font-extrabold leading-[36px] tracking-[0.4px]">
              Gold plan: Send in-app notifications to front-end users regarding
              account updates or upgrades.
            </h2>
          </section>

          <div className="mt-3 flex justify-center">
            <Link
              href="/subscribe/features"
              className="inline-flex h-7 items-center justify-center rounded-full bg-white px-5 shadow-md"
            >
              <span className="text-[11px] font-semibold !text-black">
                See all plan features
              </span>
            </Link>
          </div>

          <div className="mt-4 flex justify-end pr-2">
            <Link
              href="/help"
              className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-[11px] font-medium text-white"
            >
              How to use this website
              <Video size={13} />
            </Link>
          </div>

          <div className="flex-1" />

          <div className="flex justify-center pb-3">
            <Link
              href="/subscribe/checkout"
              className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
            >
              Subscribe now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* DESKTOP VERSION */}
        <div className="hidden min-h-[calc(100svh-100px)] items-center lg:grid lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          <section className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 backdrop-blur">
              <Crown size={16} />
              Gold subscription plan
            </div>

            <h1 className="mt-6 max-w-[560px] font-heading text-[72px] font-semibold leading-[76px] tracking-[-1.5px] text-blue-500 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_0.8)]">
              Upgrade to Gold
            </h1>

            <p className="mt-6 max-w-[580px] text-[18px] font-medium leading-[30px] text-white/80">
              Send in-app notifications to front-end users regarding account
              updates, upgrades, alerts, and important client actions.
            </p>

            <div className="mt-8 grid max-w-[560px] grid-cols-3 gap-3">
              {[
                {
                  icon: Sparkles,
                  title: "Notifications",
                  desc: "Trigger updates",
                },
                {
                  icon: ShieldCheck,
                  title: "Control",
                  desc: "Manage accounts",
                },
                {
                  icon: CheckCircle2,
                  title: "Gold Access",
                  desc: "$40 package",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur"
                >
                  <Icon size={22} className="text-yellow-300" />
                  <h3 className="mt-3 text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-white/55">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex items-center gap-4">
              <Link
                href="/subscribe/checkout"
                className="inline-flex h-14 w-[260px] items-center justify-center gap-3 rounded-2xl bg-blue-700 text-[16px] font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)] transition hover:bg-blue-800"
              >
                Subscribe now
                <ArrowRight size={20} />
              </Link>

              <Link
                href="/help"
                className="inline-flex h-14 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-5 text-sm font-semibold text-white/85 backdrop-blur transition hover:bg-white/[0.12]"
              >
                How to use this website
                <Video size={16} />
              </Link>
            </div>
          </section>

          <section className="rounded-[34px] border border-white/15 bg-white/[0.08] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <h2 className="text-[32px] font-extrabold text-white">
              Choose Plan
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white p-3">
              {plans.map((plan, index) => (
                <button
                  key={plan}
                  className={`h-12 rounded-xl text-[15px] font-bold ${
                    index === 1
                      ? "bg-blue-700 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Image
                src="/images/ring2.png"
                alt="Subscribe ring"
                width={230}
                height={230}
                priority
                className="h-[230px] w-[230px] object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
              />
            </div>

            <div className="mt-7 flex items-center justify-between rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-bold">
              <span>Gold</span>
              <span>$40</span>
            </div>

            <div className="mt-3 rounded-2xl bg-white p-5 text-left text-black shadow-[0_0_12px_rgba(37,99,235,0.55)]">
              <h3 className="font-heading text-[30px] font-extrabold leading-[38px]">
                Gold plan: Send in-app notifications to front-end users
                regarding account updates or upgrades.
              </h3>
            </div>

            <Link
              href="/subscribe/features"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 shadow-md"
            >
              <span className="text-sm font-semibold !text-black">
                See all plan features
              </span>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}