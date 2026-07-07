"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

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
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto min-h-[100svh] max-w-[430px]">
        <header className="bg-[#B00000] px-4 pb-4 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-white">
              <ArrowLeft size={18} />
            </Link>

            <h1 className="text-[20px] font-black leading-none">
              Customer Care Agent
            </h1>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 px-9">
            {["Chat", "Codes", "Format"].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`flex h-[18px] items-center justify-center rounded-[6px] text-[11px] font-medium ${
                  index === 0 ? "bg-blue-700 text-white" : "bg-[#8F969F] text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <section className="bg-black px-5 pb-7 pt-2">
          {clients.map((client) => (
            <article key={client.id} className="mt-3">
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

              <div className="mt-3 rounded-br-[8px] rounded-tl-[10px] rounded-tr-[3px] bg-white px-5 pb-3 pt-2 text-black">
                <div className="flex justify-end">
                  <span className="text-[10px] font-medium text-black/60">
                    {client.date}
                  </span>
                </div>

                <p className="mt-2 max-w-[250px] text-[12px] font-medium leading-[15px] text-black/65">
                  {client.message}
                </p>

                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/admin/chat/${client.id}`}
                    className="flex h-[23px] min-w-[132px] items-center justify-center gap-2 rounded-full bg-[#E6E9ED] px-3 text-[11px] font-semibold !text-black/45"
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
  );
}