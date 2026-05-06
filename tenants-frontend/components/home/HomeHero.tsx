import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Background composition */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Content */}
      <section className="relative z-20 mx-auto min-h-screen max-w-7xl px-6 pt-20 lg:grid lg:grid-cols-2 lg:items-center lg:px-16 lg:pt-0">
        {/* Text */}
        <div className="mx-auto max-w-sm text-center lg:mx-0 lg:max-w-xl lg:text-left">
          <h1 className="font-heading text-[40px] font-bold leading-[0.95] text-[var(--primary)] lg:text-[72px]">
            ZentraBank
            <br />
            Online Banking
          </h1>

          <p className="mx-auto mt-5 max-w-[330px] font-body text-[17px] leading-[1.15] text-black lg:mx-0 lg:mt-8 lg:max-w-lg lg:text-xl lg:leading-8">
            Welcome to the one-stop app that can help make your work easier on
            the street - this is the only app where you find so many billing
            format and lots more loading, even as a newbie...
          </p>
        </div>

        {/* Building image */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 z-30 w-[112%] max-w-[500px] -translate-x-1/2 lg:pointer-events-auto lg:relative lg:left-auto lg:bottom-auto lg:mx-auto lg:w-full lg:max-w-[620px] lg:translate-x-0">
          <div className="relative aspect-square overflow-hidden rounded-full">
            <Image
              src="/images/banking-building.png"
              alt="ZentraBank building"
              fill
              priority
              className="object-cover"
            />
          </div>

          <Link
            href="/login"
            className="pointer-events-auto absolute bottom-[16%] left-1/2 flex w-[240px] -translate-x-1/2 items-center justify-center gap-3 rounded-lg bg-[var(--primary)] px-6 py-3 font-body text-sm font-semibold text-white shadow-xl transition hover:bg-[var(--primary-dark)]"
          >
            See more
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}