import Link from "next/link";
import Image from "next/image";
// import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Menu,
  Search,
  SlidersHorizontal,
  MessageCircle,
} from "lucide-react";



function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
const clients = [
  {
    id: 1,
    name: "Gregory Winter",
    desc: "An up coming Philanthropist",
    badge: 4,
  },
  {
    id: 2,
    name: "Client’s name here",
    desc: "An over-view of first few words of the client...",
    badge: 2,
  },
  {
    id: 3,
    name: "Client’s name here",
    desc: "An over-view of first few words of the client...",
  },
  {
    id: 4,
    name: "Client’s name here",
    desc: "An over-view of first few words of the client...",
  },
  {
    id: 5,
    name: "Client’s name here",
    desc: "An over-view of first few words of the client...",
  },
];

const adverts = [
  "/images/advert-1.png",
  "/images/advert-2.png",
  "/images/advert-3.png",
];



export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-black text-white lg:bg-[#050505]">
      <div className="mx-auto max-w-[430px] px-2 pb-8 pt-28 lg:max-w-7xl lg:px-8 lg:py-32">
        <Link href="/dashboard" className="mb-3 inline-flex text-white">
          <ArrowLeft size={18} />
        </Link>

        <div className="lg:grid lg:grid-cols-[360px_1fr] lg:gap-8">
          {/* LEFT PANEL */}
          <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-64px)] lg:rounded-[28px] lg:border lg:border-white/10 lg:bg-white/[0.04] lg:p-6 lg:shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-[24px] font-extrabold leading-none lg:text-[34px]">
                Your Clients
              </h1>

              <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white lg:border-white/20 lg:bg-white/10">
                <SlidersHorizontal size={22} />
              </button>
            </div>

            <p className="hidden text-sm leading-6 text-white/60 lg:block">
              Manage your client messages, view support activity, and start
              conversations from one clean workspace.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Read", "Unread", "Personal"].map((tab, index) => (
                <button
                  key={tab}
                  className={`h-[28px] rounded-[8px] text-[14px] lg:h-10 lg:rounded-xl ${
                    index === 0
                      ? "bg-[#2458E8] text-white"
                      : "bg-[#9CA0AA] text-white lg:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Menu size={24} className="lg:hidden" />

              <div className="flex h-[30px] flex-1 items-center rounded-[10px] bg-[#eee9f1] px-3 text-black lg:h-12 lg:rounded-xl">
                <input
                  placeholder="Search client"
                  className="w-full bg-transparent text-[18px] outline-none placeholder:text-[#5c5761] lg:text-sm"
                />
                <Search size={22} className="text-[#9a959d]" />
              </div>
            </div>

            <div className="mt-6 hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#2458E8] to-[#0b1020] p-5 lg:block">
              <p className="text-sm text-white/70">Client activity</p>
              <h2 className="mt-2 text-4xl font-extrabold">24</h2>
              <p className="mt-2 text-sm text-white/70">
                active conversations this week
              </p>
            </div>

            <div className="mt-5 hidden grid-cols-2 gap-3 lg:grid">
              <div className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-xs text-white/50">Unread</p>
                <p className="mt-1 text-2xl font-bold">6</p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-xs text-white/50">Personal</p>
                <p className="mt-1 text-2xl font-bold">12</p>
              </div>
            </div>
          </aside>

          {/* RIGHT PANEL */}
          <section>
            {/* adverts mobile */}
            <div className="mt-5 grid grid-cols-3 gap-2 lg:hidden">
              {adverts.map((ad, i) => (
                <div
                  key={i}
                  className="h-[80px] overflow-hidden rounded-[4px] bg-[linear-gradient(135deg,#ff0033,#030000)] p-1"
                >
                  <Image
                    src={ad}
                    alt="Advert card"
                    width={120}
                    height={80}
                    className="h-full w-full rounded-[4px] object-cover"
                  />
                </div>
              ))}
            </div>

            {/* desktop hero advert */}
            <div className="hidden lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-5">
              <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#c90707] via-[#680707] to-[#111] p-6 shadow-2xl">
                <p className="text-sm font-semibold text-white/70">
                  Featured campaign
                </p>
                <h2 className="mt-2 text-4xl font-extrabold leading-tight">
                  Glowing Season
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                  Offers that never fail. Promote important updates, premium
                  services, or subscription prompts to clients.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm text-white/60">Subscription</p>
                <h3 className="mt-2 text-2xl font-bold">Upgrade clients</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Keep track of client tiers, chat status, and pending requests
                  in one place.
                </p>
              </div>
            </div>

            {/* subscription mobile */}
            <div className="mt-3 flex h-[47px] overflow-hidden rounded-[4px] bg-[linear-gradient(90deg,#d80606,#050000)] lg:hidden">
              <div className="w-[34%] bg-[#b8c574]">
                <Image
                  src="/images/subscription.png"
                  alt="Subscription"
                  width={130}
                  height={60}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 items-center justify-around px-3 text-[8px]">
                <h2 className="text-[9px] font-bold">Subscription</h2>
                <p className="max-w-[160px] leading-[10px]">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                </p>
              </div>
            </div>

              
            {/* client list */}
            <div className="mt-4 space-y-4 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-2 lg:rounded-3xl lg:border lg:border-white/10 lg:bg-white/[0.04] lg:p-4 lg:transition lg:hover:-translate-y-1 lg:hover:bg-white/[0.07]"
                  >
                   {client.image ? (
                  <Image
                    src={client.image}
                    alt={client.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(client.name)}</span>
                )}

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[17px] font-extrabold leading-[19px]">
                      {client.name}
                    </h2>
                    <p className="truncate text-[16px] leading-[18px] text-white lg:text-sm lg:text-white/60">
                      {client.desc}
                    </p>
                  </div>

                  <Link
                    href="/chat"
                    className="shrink-0 rounded-full bg-white px-5 py-1 text-[14px] font-semibold text-black lg:flex lg:h-10 lg:w-10 lg:items-center lg:justify-center lg:px-0"
                  >
                    <span className="lg:hidden">Chat client</span>
                    <MessageCircle size={18} className="hidden lg:block" />
                  </Link>

                  <Link href={`/clients/${client.id}`} className="shrink-0">
                    <ChevronRight size={24} />
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-[16px] text-white/80">
              That’s all your clients
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}