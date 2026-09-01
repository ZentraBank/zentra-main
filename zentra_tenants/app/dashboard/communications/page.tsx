"use client";

import Link from "next/link";

import {
  Bell,
  Headphones,
  Lock,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";

export default function CommunicationsPage() {
  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[1100px]">
        <div>
          <h1 className="text-[26px] font-black tracking-[-0.035em]">
            Communications
          </h1>

          <p className="mt-1 text-[11px] text-black/40">
            Chat with clients, contact ZentraBank support and send targeted
            notifications.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Client Chat */}

          <Link
            href="/dashboard/communications/chat"
            className="group rounded-[22px] bg-[#14251D] p-6 text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#71D49B]/15 text-[#71D49B]">
                <MessageCircle size={22} />
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.05em] text-white/60">
                Chat
              </span>
            </div>

            <h2 className="mt-7 text-[22px] font-black">
              Client Chat
            </h2>

            <p className="mt-2 max-w-[360px] text-[11px] leading-5 text-white/50">
              Start and manage real-time conversations with clients in your
              tenant.
            </p>

            <div className="mt-7 flex items-center gap-2 text-[10px] font-bold text-[#71D49B]">
              <Users size={14} />

              Open conversations
            </div>
          </Link>

          {/* ZentraBank Platform Support */}

          <Link
            href="/dashboard/communications/support"
            className="group rounded-[22px] bg-[#1D2A44] p-6 text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/10 text-[#AFC8FF]">
                <Headphones size={22} />
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.05em] text-white/60">
                Support
              </span>
            </div>

            <h2 className="mt-7 text-[22px] font-black">
              ZentraBank Support
            </h2>

            <p className="mt-2 max-w-[360px] text-[11px] leading-5 text-white/50">
              Speak directly with the ZentraBank platform team about your
              tenant, subscription or technical support.
            </p>

            <div className="mt-7 flex items-center gap-2 text-[10px] font-bold text-[#AFC8FF]">
              <MessageCircle size={14} />

              Contact platform support
            </div>
          </Link>

          {/* Notifications */}

          <Link
            href="/dashboard/communications/notifications"
            className="group rounded-[22px] bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#EEF3FF] text-[#2458E8]">
                <Bell size={22} />
              </div>

              <span className="rounded-full bg-[#EEF3FF] px-3 py-1 text-[9px] font-black uppercase tracking-[0.05em] text-[#2458E8]">
                Notifications
              </span>
            </div>

            <h2 className="mt-7 text-[22px] font-black">
              Push Notifications
            </h2>

            <p className="mt-2 max-w-[360px] text-[11px] leading-5 text-black/45">
              Send targeted messages to one client, selected clients or
              everyone using reusable templates.
            </p>

            <div className="mt-7 flex items-center gap-2 text-[10px] font-bold text-[#2458E8]">
              <Send size={14} />

              Compose notification
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}