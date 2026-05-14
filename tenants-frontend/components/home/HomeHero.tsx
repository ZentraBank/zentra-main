import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OnlineBankingSection() {
  return (
    <>
      <section className="relative h-[100svh] overflow-hidden bg-white px-6 pt-14 text-center md:hidden">

  {/* TEXT */}
      <div className="absolute top-[100px] left-1/2 w-full max-w-[320px] -translate-x-1/2 text-center">
      <h1 className="text-[46px] font-semibold leading-[0.95] tracking-[-0.04em] text-blue-700">
        ZentraBank
        <br />
        Online Banking
      </h1>

      <p className="mt-30 text-[20px] font-medium leading-[22px] text-black">
        Welcome to the one-stop app that can help make your work easier on the street...
      </p>
    </div>


  {/* BOTTOM DESIGN */}
<div className="absolute bottom-0 left-0 h-[48vh] w-full overflow-hidden">
  {/* BACKGROUND SHAPE */}
  <Image
    src="/images/Background.png"
    alt="background shape"
    fill
    className="object-cover object-top"
    priority
  />

  {/* BUILDING IMAGE */}
  <div className="absolute left-1/2 top-[70px] z-10 h-[345px] w-[345px] -translate-x-1/2 overflow-hidden rounded-[34%_34%_42%_42%/30%_30%_46%_46%] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
    <Image
      src="/images/polygon.png"
      alt="building"
      width={500}
      height={500}
      className="h-full w-full scale-[1.08] object-cover object-center"
      priority
    />
  </div>

  {/* OVERLAY BUTTON */}
  {/* OVERLAY BUTTON */}
<div className="absolute left-1/2 top-[255px] z-20 -translate-x-1/2">
  <Link
    href="/features"
    className="flex w-[230px] items-center justify-center gap-2.5 rounded-xl bg-blue-800 px-4 py-3 text-white shadow-[0_16px_35px_rgba(0,0,0,0.35)]"
  >
    <span className="text-[15px] font-medium">See more</span>
    <ArrowRight size={17} />
  </Link>
</div>
</div>
</section>

      {/* ================= IPAD + DESKTOP ================= */}
      <section className="relative hidden min-h-screen overflow-hidden bg-white px-8 py-8 md:block">
        <div className="absolute -left-32 bottom-0 h-[520px] w-[520px] rounded-full bg-red-700/25 blur-[100px]" />
        <div className="absolute -right-40 top-20 h-[560px] w-[560px] rounded-full bg-blue-700/20 blur-[120px]" />

        <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-black/10 bg-white/80 px-6 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <span className="text-lg font-semibold text-black">
            ZentraBank
          </span>

          <div className="flex items-center gap-8">
            {["Home", "About", "Services", "Contact"].map((item) => (
              <button
                key={item}
                className="text-sm font-medium text-black/65 transition hover:text-red-700"
              >
                {item}
              </button>
            ))}
          </div>

          <button className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5">
            Get Started
          </button>
        </nav>

        <div className="relative z-20 mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl items-center gap-14 md:grid-cols-2">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm font-medium text-black/70 backdrop-blur-md">
              Mobile-first banking
            </div>

            <h1 className="text-[58px] font-semibold leading-[0.98] tracking-[-0.05em] text-blue-700 lg:text-[82px]">
              ZentraBank
              <span className="block">Online Banking</span>
            </h1>

            <p className="mt-7 max-w-xl text-[20px] font-medium leading-[32px] text-black/70 lg:text-[22px]">
              Welcome to the one-stop app that makes your workflow easier.
              Manage billing formats, payments, upgrades and subscriptions from
              one clean banking experience.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <button className="flex items-center gap-3 rounded-2xl bg-blue-700 px-7 py-4 text-[16px] font-semibold text-white shadow-[0_20px_50px_rgba(29,78,216,0.25)] transition hover:-translate-y-1">
                See more
                <ArrowRight size={18} />
              </button>

              <div className="rounded-2xl border border-black/10 bg-white/70 px-5 py-4 text-left shadow-sm backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                  Built for
                </p>
                <p className="text-sm font-semibold text-black">
                  Fast onboarding
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
  {/* BACKGROUND SHAPES (TOP LAYER FEEL) */}
  <div className="absolute bottom-0 right-0 z-20 h-[470px] w-[470px] rounded-full bg-black" />
  <div className="absolute bottom-14 right-10 z-20 h-[420px] w-[420px] rounded-full bg-red-700" />

  {/* IMAGE (UNDERLAID) */}
      <div className="relative z-10 h-[520px] w-[420px] overflow-hidden rounded-[4rem] shadow-[0_35px_100px_rgba(0,0,0,0.28)]">
        <Image
          src="/images/hero-bg.png"
          alt="ZentraBank online banking"
          width={700}
          height={900}
          className="h-full w-full object-cover scale-[1.05]"
          priority
        />
      </div>
    </div>
    </div>
      </section>
    </>
  );
}