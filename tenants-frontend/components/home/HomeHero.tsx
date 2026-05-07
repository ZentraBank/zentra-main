import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <main className="relative overflow-hidden">

      {/* ================= MOBILE ================= */}
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#F5F5F5] lg:hidden">

        {/* TOP CONTENT */}
        <div className="relative z-20 px-6 pt-20 text-center">
          <h1 className="font-heading text-[42px] font-bold leading-[0.92] text-[var(--primary)]">
            ZentraBank
            <br />
            Online Banking
          </h1>
          <p className="mx-auto mt-5 max-w-[320px] font-body text-[17px] leading-[1.5] text-black">
            Welcome to the one-stop app that can help make your work easier —
            manage billing, transfers and lots more from one place.
          </p>
        </div>

        {/* BACKGROUND SHAPE — replaced broken /images/.png with CSS gradient */}
        <div className="absolute bottom-0 left-0 right-0 top-[270px] z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(192,57,43,0.12)_0%,transparent_70%)]" />

        {/* BUILDING IMAGE — FIX: removed mt-auto from outer div, kept on wrapper */}
        <div className="relative z-20 mt-auto flex justify-center">
          <div className="relative w-full max-w-[340px]">
            <Image
              src="/images/HeroImage1.png"
              alt="ZentraBank Building"
              width={340}
              height={400}
              priority
              className="w-full object-contain" 
            />
            <Link
              href="/login"
              className="absolute bottom-[16%] left-1/2 flex h-[48px] w-[220px] -translate-x-1/2 items-center justify-center gap-3 rounded-xl bg-[var(--primary)] text-sm font-semibold text-white shadow-2xl"
            >
              See more
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= DESKTOP ================= */}
      <section className="relative hidden min-h-screen overflow-hidden bg-black lg:flex">

        {/* BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* LEFT CONTENT */}
        <div className="relative z-20 flex w-1/2 items-center px-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              Modern Digital Banking
            </div>
            <h1 className="font-heading text-7xl font-bold leading-[0.95] text-white">
              ZentraBank
              <span className="mt-2 block text-[var(--primary)]">
                Online Banking
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/75">
              Manage customers, accounts, transfers and subscriptions from one
              modern banking platform designed for growth.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-2xl bg-[var(--primary)] px-8 py-4 text-sm font-semibold text-white shadow-2xl transition hover:bg-[var(--primary-dark)]"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/register"
                className="rounded-2xl border border-white/10 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE — FIX: explicit h-[520px] w-[520px] on circle, object-cover inside */}
        <div className="relative z-20 flex w-1/2 items-center justify-center">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 scale-110 rounded-full bg-red-600/20 blur-3xl" />

            {/* Circle: explicit width AND height so it never stretches */}
            <div className="relative h-[520px] w-[520px] overflow-hidden rounded-full border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
              <Image
                src="/images/banking-building.png"
                alt="Building"
                fill                      // ✅ fill + object-cover inside fixed container
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}