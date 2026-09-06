"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const clients = [
  {
    id: "mccarthrine-tyler",
    name: "McCarthrine Tyler",
    avatar: "/images/client-avatar.png",
    date: "Mon, 04 Oct, 2026",
    message:
      "Hello there, I’m experiencing some difficulties. And I’m here to ask if there is someone to help me fix it?",
  },
  {
    id: "michael-brown",
    name: "Michael Brown",
    avatar: "/images/client-avatar.png",
    date: "Today",
    message:
      "I just transferred $2,000 and it is nowhere to be found in my transaction history.",
  },
];

export default function AdminChatClientsPage() {
  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-80px)] overflow-x-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.13),transparent_16%)] bg-black px-4 py-8 text-white md:px-8">
        <Image
          src="/images/Background_1.png"
          alt="Background"
          fill
          priority
          className="pointer-events-none object-cover"
        />

        <div className="relative z-10 mx-auto min-h-[calc(100svh-80px)] max-w-[430px]">
          <header className="bg-[#B00000] px-4 pb-4 pt-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Link href="/agent" className="text-white">
                <ArrowLeft size={18} />
              </Link>

              <h1 className="text-[20px] font-black leading-none">
                Customer Care Agent
              </h1>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 px-9">
              <Link
                href="/admin/chat"
                className="flex h-[24px] items-center justify-center rounded-[6px] bg-blue-700 text-[11px] font-medium text-white shadow-sm"
              >
                Chat
              </Link>
              <Link
                href="/admin/codes"
                className="flex h-[24px] items-center justify-center rounded-[6px] bg-[#8F969F] text-[11px] font-medium text-white shadow-sm"
              >
                Codes
              </Link>
              <Link
                href="/admin/format"
                className="flex h-[24px] items-center justify-center rounded-[6px] bg-[#8F969F] text-[11px] font-medium text-white shadow-sm"
              >
                Format
              </Link>
            </div>
          </header>

          <section className="bg-black/90 px-5 pb-7 pt-2 rounded-b-2xl">
            {clients.map((client) => (
              <article key={client.id} className="mt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={client.avatar}
                    alt={client.name}
                    width={23}
                    height={23}
                    className="rounded-full object-cover"
                  />

                  <p className="text-[12px] font-black tracking-[0.5px]">
                    {client.name}
                  </p>
                </div>

                <div className="mt-3 rounded-br-[8px] rounded-tl-[10px] rounded-tr-[3px] bg-white px-5 pb-3 pt-2 text-black shadow-md">
                  <div className="flex justify-end">
                    <span className="text-[10px] font-medium text-black/60">
                      {client.date}
                    </span>
                  </div>

                  <p className="mt-2 max-w-[250px] text-[12px] font-medium leading-[15px] text-black/80">
                    {client.message}
                  </p>

                  <div className="mt-3 flex justify-end">
                    <Link
                      href={`/admin/chat/${client.id}`}
                      className="flex h-[26px] min-w-[132px] items-center justify-center gap-2 rounded-full bg-[#E6E9ED] px-3 text-[11px] font-semibold text-neutral-800 transition hover:bg-neutral-300"
                    >
                      Chat with client
                      <ChevronDown size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </AppShell>
  );
}