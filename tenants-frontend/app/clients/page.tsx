"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Share2,
  MessageCircle,
  Users,
  Bell,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const clients = [
  {
    id: 1,
    name: "Gregory Winter",
    desc: "An upcoming Philanthropist.",
    unreadCount: 4,
    image: "/images/greg.png",
    chatUrl: "/chat",
  },
  {
    id: 2,
    name: "Paul Smith",
    desc: "An over-view of first few words of the client...",
    unreadCount: 3,
    image: "/images/paul.png",
    chatUrl: "/chat",
  },
  {
    id: 3,
    name: "Anna Smith",
    desc: "An over-view of first few words of the client...",
    unreadCount: 5,
    image: "/images/anna.png",
    chatUrl: "/chat",
  },
  {
    id: 4,
    name: "Jane Doe",
    desc: "An over-view of first few words of the client...",
    unreadCount: 0,
    image: "/images/jane.png",
    chatUrl: "/chat",
  },
  {
    id: 5,
    name: "Jeffrey Smith",
    desc: "An over-view of first few words of the client...",
    unreadCount: 3,
    image: "/images/jeff.png",
    chatUrl: "/chat",
  },
];

const adverts = ["/images/advert.png", "/images/advert.png", "/images/advert.png"];

const bottomAdverts = [
  {
    image: "/images/carousel.png",
    bg: "bg-[linear-gradient(90deg,#100000,#d00000,#160000)]",
    button: "bg-[#2458e8]",
  },
  {
    image: "/images/carousel.png",
    bg: "bg-[#d4b82f]",
    button: "bg-[#d89400]",
  },
  {
    image: "/images/carousel.png",
    bg: "bg-[linear-gradient(90deg,#110000,#d00000,#120000)]",
    button: "bg-[#2458e8]",
  },
];

const helpItems = [
  "How to use this website",
  "Chat an admin",
  "Make complains",
  "How your subscription works",
  
];

export default function ClientsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const totalUnread = clients.reduce(
    (total, client) => total + client.unreadCount,
    0
  );

  const filteredClients =
    activeFilter === "all"
      ? clients
      : clients.filter((client) => client.unreadCount > 0);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const interval = setInterval(() => {
      const cardWidth = 346;

      if (
        carousel.scrollLeft + carousel.clientWidth >=
        carousel.scrollWidth - 10
      ) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white lg:bg-[#070707]">
      <div className="mx-auto max-w-[430px] px-4 pb-8 pt-5 lg:max-w-7xl lg:px-8 lg:py-8">
        <Link
          href="/dashboard"
          className="mb-7 inline-flex items-center gap-2 text-white/90 lg:mb-8"
        >
          <ArrowLeft size={20} />
          <span className="hidden text-sm font-semibold lg:inline">
            Back to dashboard
          </span>
        </Link>

        <div className="lg:grid lg:grid-cols-[300px_1fr_320px] lg:gap-6">
          <aside className="hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl lg:block">
            <h1 className="font-heading text-[30px] font-black">
              Your Clients
            </h1>
            <p className="font-body mt-2 text-sm leading-6 text-white/55">
              Manage conversations, unread messages, adverts, and client support
              actions from one workspace.
            </p>

            <div className="mt-6 space-y-3">
              <StatCard
                icon={<Users size={19} />}
                label="Total Clients"
                value={clients.length}
              />
              <StatCard
                icon={<Bell size={19} />}
                label="Unread Messages"
                value={totalUnread}
              />
              <StatCard
                icon={<MessageCircle size={19} />}
                label="Active Chats"
                value={filteredClients.length}
              />
            </div>

            <div className="mt-6 rounded-[22px] bg-[linear-gradient(135deg,#2458e8,#111827)] p-5">
              <p className="font-body text-sm text-white/70">Featured</p>
              <h2 className="font-heading mt-2 text-2xl font-black">
                Glowing Season
              </h2>
              <p className="font-body mt-2 text-xs leading-5 text-white/70">
                Promote offers, campaigns, and client updates here.
              </p>
            </div>
          </aside>

          <section>
            <div className="mb-3 flex items-center justify-between lg:mb-5">
          <div>
            <h1 className="font-heading text-[22px] font-extrabold lg:text-[32px]">
              Your Clients
            </h1>

            <p className="font-body mt-1 hidden text-sm text-white/55 lg:block">
              {filteredClients.length} clients showing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/clients/add"
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-xl
                bg-[#2458e8]
                px-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#1d4ed8]
                lg:h-11
              "
            >
              <Users size={16} />
              <span className="hidden lg:block">Add Client</span>
            </Link>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white lg:h-11 lg:w-11 lg:border-white/15 lg:bg-white/10"
            >
              <SlidersHorizontal size={21} />
            </button>
          </div>
        </div>

            <div className="grid grid-cols-2 gap-2 px-2 lg:w-[280px] lg:px-0">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`h-[20px] rounded-[6px] text-[13px] font-medium lg:h-10 lg:rounded-xl ${
                  activeFilter === "all" ? "bg-[#2458e8]" : "bg-[#8d929c]"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("unread")}
                className={`h-[20px] rounded-[6px] text-[13px] font-medium lg:h-10 lg:rounded-xl ${
                  activeFilter === "unread" ? "bg-[#2458e8]" : "bg-[#8d929c]"
                }`}
              >
                Unread
              </button>
            </div>

            <div className="mx-auto mt-3 flex h-[29px] w-[82%] items-center rounded-full bg-[#eee9f1] px-4 text-black lg:mx-0 lg:h-12 lg:w-full lg:rounded-2xl">
              <input
                placeholder="Search client"
                className="font-body w-full bg-transparent text-[15px] outline-none placeholder:text-[#5c5761] lg:text-sm"
              />
              <Search size={21} className="text-[#aaa4ad]" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 lg:hidden">
              {adverts.map((ad, index) => (
                <div
                  key={index}
                  className="h-[68px] overflow-hidden rounded-[4px] border border-red-600 bg-red-700"
                >
                  <Image
                    src={ad}
                    alt={`Advert Card ${index + 1}`}
                    width={120}
                    height={70}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex h-[41px] overflow-hidden rounded-[4px] border border-red-600 bg-[linear-gradient(90deg,#d00000,#050000)] lg:hidden">
              <div className="w-[29%] bg-[#cad45e]">
                <Image
                  src="/images/bell.png"
                  alt="Subscription"
                  width={120}
                  height={50}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 items-center justify-around px-3">
                <h2 className="font-heading text-[8px] font-bold">
                  Subscription
                </h2>
                <p className="font-body max-w-[170px] text-[6px] leading-[8px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-2 lg:rounded-[22px] lg:border lg:border-white/10 lg:bg-white/[0.05] lg:p-4 lg:transition lg:hover:-translate-y-1 lg:hover:bg-white/[0.08]"
                >
                  <Link
                    href={`/clients/${client.id}`}
                    className="relative h-[48px] w-[48px] shrink-0 rounded-full border-2 border-[#2458e8] bg-white/20 lg:h-[58px] lg:w-[58px]"
                  >
                    <Image
                      src={client.image}
                      alt={client.name}
                      width={58}
                      height={58}
                      className="h-full w-full rounded-full object-cover"
                    />

                    {client.unreadCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1 text-[11px] font-bold text-white lg:h-6 lg:min-w-6 lg:text-xs">
                        {client.unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={`/clients/${client.id}`}
                    className="min-w-0 flex-1"
                  >
                    <h2 className="font-heading truncate text-[15px] font-extrabold leading-[17px] text-white lg:text-[17px] lg:leading-5">
                      {client.name}
                    </h2>
                    <p className="font-body truncate text-[14px] leading-[16px] text-white lg:text-sm lg:text-white/55">
                      {client.desc}
                    </p>
                  </Link>

                  <Link
                    href={client.chatUrl}
                    className="rounded-full bg-white px-5 py-1 text-[13px] font-semibold !text-black lg:flex lg:h-10 lg:w-10 lg:items-center lg:justify-center lg:px-0"
                  >
                    <span className="lg:hidden">Chat client</span>
                    <MessageCircle size={18} className="hidden lg:block" />
                  </Link>

                  <Link
                    href={`/clients/${client.id}`}
                    className="shrink-0 text-white/80"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              ))}
            </div>

            <p className="font-body mt-8 text-center text-[13px] text-white/75">
              That’s all your clients
            </p>

            <div className="mt-6 h-[41px] overflow-hidden rounded-[4px] border border-red-600 bg-red-700 lg:hidden">
              <Image
                src="/images/advert.png"
                alt="Advert Card"
                width={390}
                height={45}
                className="h-full w-full object-cover"
              />
            </div>
          </section>

          <aside className="hidden space-y-5 lg:block">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <h2 className="font-heading mb-3 text-lg font-black">
                Quick Help
              </h2>

              <div className="space-y-3">
                {helpItems.map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="font-body flex h-[44px] items-center justify-between rounded-[14px] bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    {item}
                    <ArrowRight size={18} className="text-white/45" />
                  </Link>
                ))}
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {bottomAdverts.map((ad, index) => (
                <div
                  key={index}
                  className={`flex min-w-[300px] snap-center items-center justify-between rounded-[24px] border border-white/20 px-4 py-3 ${ad.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={ad.image}
                      alt={`Share advert ${index + 1}`}
                      width={52}
                      height={52}
                      className="h-13 w-13 rounded-full object-cover"
                    />

                    <div>
                      <p className="font-heading text-[12px] font-bold text-[#5d86ff]">
                        Get subscription discount!
                      </p>
                      <p className="font-body text-[14px] text-white">
                        Share this website
                      </p>
                    </div>
                  </div>

                  <Link
                    href="#"
                    className={`flex h-10 items-center gap-1 rounded-[12px] px-4 text-[14px] font-bold text-white ${ad.button}`}
                  >
                    Go
                    <Share2 size={15} />
                  </Link>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-2 px-4 lg:hidden">
          <h2 className="font-heading mb-3 text-[16px] font-extrabold">
            Get Help
          </h2>

          <div className="space-y-3">
            {helpItems.map((item) => (
              <Link
                key={item}
                href="#"
                className="font-body flex h-[37px] items-center justify-between rounded-[10px] bg-white px-4 text-[13px] font-semibold !text-black"
              >
                {item}
                <ArrowRight size={18} className="text-black/45" />
              </Link>
            ))}
          </div>
        </section>

        <div
          ref={carouselRef}
          className="mt-8 flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden"
        >
          {bottomAdverts.map((ad, index) => (
            <div
              key={index}
              className={`flex min-w-[330px] snap-center items-center justify-between rounded-[18px] border border-white/25 px-3 py-2 ${ad.bg}`}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={ad.image}
                  alt={`Share advert ${index + 1}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div>
                  <p className="font-heading text-[12px] font-bold text-[#2458e8]">
                    Get subscription discount!
                  </p>

                  <p className="font-body text-[15px] text-white">
                    Share this website with friends
                  </p>
                </div>
              </div>

              <Link
                href="#"
                className={`flex h-10 items-center gap-1 rounded-[12px] px-4 text-[14px] font-bold text-white ${ad.button}`}
              >
                Go
                <Share2 size={15} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.06] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
        {icon}
      </div>

      <div>
        <p className="font-body text-xs text-white/45">{label}</p>
        <p className="font-heading text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}