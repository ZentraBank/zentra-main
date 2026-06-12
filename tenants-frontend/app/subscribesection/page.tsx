import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SubscribeSection() {
  return (
    <>
      {/* ================= MOBILE ================= */}
      <section className="relative h-[100svh] overflow-hidden bg-black px-6 py-35 pt-[92px] text-center md:hidden">
        <h1 className="mx-auto max-w-[340px] text-[38px] font-semibold leading-[0.92] tracking-[-0.04em] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_0.55)]">
          Subscribe and
          <br />
          enjoy your clients
          <br />
          chesting bills...
        </h1>

        <div className="mx-auto mt-7 h-[335px] w-full max-w-[360px] overflow-hidden rounded-xl shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          <Image
            src="/images/Laptop.png"
            alt="Subscribe and enjoy client billing"
            width={2400}
            height={700}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <div className="mt-9 flex justify-center">
          <Link
    href="/subscribesection"
    className="
      absolute
      left-1/2
      top-[655px]
      flex
      h-[35px]
      w-[250px]
      -translate-x-1/2
      items-center
      justify-center
      gap-[10px]
      rounded-[12px]
      bg-[#1E40AF]
      px-[16px]
      py-[8px]
      text-[16px]
      font-medium
      !text-white
      shadow-[inset_0px_0px_4px_rgba(0,0,0,0.1)]
    "
  >
    <span className="!text-white">See more</span>
    <ArrowRight size={18} className="!text-white" />
  </Link>
        </div>
      </section>

      {/* ================= IPAD + DESKTOP ================= */}
      <section className="relative hidden min-h-screen overflow-hidden bg-black px-8 py-25 md:block">
        <div className="absolute -left-32 top-20 h-[520px] w-[520px] rounded-full bg-blue-700/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[520px] w-[520px] rounded-full bg-red-700/20 blur-[120px]" />

        {/* <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-white/10 px-6 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <Link href="/" className="text-lg font-semibold text-white">
            ZentraBank
          </Link>

          <div className="flex items-center gap-8">
            {["Home", "Features", "Services", "Contact"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm font-medium text-white/65 transition hover:text-white"
              >
                {item}
              </Link>
            ))}
          </div>

          <Link
            href="/subscribe"
            className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600"
          >
            Subscribe
          </Link>
        </nav> */}

        <div className="relative z-20 mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl items-center gap-14 md:grid-cols-2">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/75 backdrop-blur-md">
              Premium client billing
            </div>

            <h1 className="text-[58px] font-semibold leading-[0.98] tracking-[-0.05em] text-blue-700 [text-shadow:_0px_2px_0px_rgb(255_255_255_/_0.35)] lg:text-[82px]">
              Subscribe and enjoy your clients chesting bills.
            </h1>

            <p className="mt-7 max-w-xl text-[20px] font-medium leading-[32px] text-white/70 lg:text-[22px]">
              Give your customers access to simple billing tools, subscription
              flows and client-ready payment formats from one clean banking
              platform.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <Link
                href="/subscribe"
                className="flex items-center gap-3 rounded-2xl bg-blue-700 px-7 py-4 text-[16px] font-semibold text-white shadow-[0_20px_50px_rgba(29,78,216,0.3)] transition hover:-translate-y-1 hover:bg-blue-600"
              >
                Subscribe now
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -right-6 -top-6 h-[430px] w-[430px] rounded-full bg-blue-700/25 blur-[70px]" />

            <div className="relative h-[560px] w-[440px] overflow-hidden rounded-[4rem] border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.55)]">
              <Image
                src="/images/Laptop.png"
                alt="Subscribe client billing"
                width={700}
                height={900}
                className="h-full w-full scale-[1.04] object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}