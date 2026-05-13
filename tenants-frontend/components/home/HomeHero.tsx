import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <main className="relative overflow-hidden">

      {/* ================= MOBILE ================= */}
      <section className="relative h-screen overflow-hidden bg-white lg:hidden">
    <Image
      src="/images/HomePage.png"
      alt="ZentraBank Online Banking"
      fill
      priority
      sizes="100vw"
      className="object-cover object-center"
    />

    {/* Overlay gradient (optional but improves contrast) */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10" />

    {/* Button */}
    <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
      <Link
        href="/login"
        className="flex h-[52px] w-[240px] items-center justify-center gap-3 rounded-2xl bg-[var(--primary)] text-sm font-semibold text-white shadow-2xl"
      >
        See more
        <ArrowRight size={18} />
      </Link>
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