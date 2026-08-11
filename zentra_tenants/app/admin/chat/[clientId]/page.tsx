"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = {
  from: "client" | "admin";
  avatar: string;
  text: string;
};

const clients = {
  "mccarthrine-tyler": {
    name: "McCarthrine Tyler",
    avatar: "/images/client-avatar.png",
  },
  "michael-brown": {
    name: "Michael Brown",
    avatar: "/images/client-avatar.png",
  },
};

const initialMessages: Message[] = [
  {
    from: "client",
    avatar: "/images/client-avatar.png",
    text: "Hello there, I’m experiencing some difficulties. Can someone help me fix it?",
  },
  {
    from: "admin",
    avatar: "/images/admin-avatar.png",
    text: "Hello, I’m here to help. Please explain the issue you’re having with your account.",
  },
];

export default function IndividualAdminChatPage({
  params,
}: {
  params: { clientId: string };
}) {
  const client =
    clients[params.clientId as keyof typeof clients] || clients["michael-brown"];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        from: "admin",
        avatar: "/images/admin-avatar.png",
        text: input.trim(),
      },
    ]);

    setInput("");
  };

  const insertSmartReply = () => {
    setInput(
      `Hello ${client.name.split(" ")[0]}, I understand your concern. I’ll check this immediately and guide you through the next step.`
    );
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col border-x border-white/10">
        <header className="bg-[#B00000] px-4 pb-4 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/chat" className="text-white">
              <ArrowLeft size={18} />
            </Link>

            <Image
              src={client.avatar}
              alt={client.name}
              width={28}
              height={28}
              className="rounded-full object-cover"
            />

            <div>
              <h1 className="text-[15px] font-black leading-none">
                {client.name}
              </h1>
              <p className="mt-1 text-[10px] font-semibold text-green-300">
                Online now
              </p>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isAdmin = message.from === "admin";

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    isAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isAdmin && (
                    <Image
                      src={message.avatar}
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  )}

                  <div
                    className={`max-w-[245px] rounded-[20px] px-3 py-2 text-[12px] leading-[16px] ${
                      isAdmin
                        ? "rounded-tr-sm bg-[#5aa2ff] text-[#02234f]"
                        : "rounded-tl-sm bg-white text-[#333]"
                    }`}
                  >
                    {message.text}
                  </div>

                  {isAdmin && (
                    <Image
                      src={message.avatar}
                      alt=""
                      width={28}
                      height={28}
                      className="-ml-5 rounded-full"
                    />
                  )}
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </section>

        <footer className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ffffff,#5aa2ff,#1c4be8)] p-1">
            <button
              type="button"
              onClick={insertSmartReply}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1d4ed8]"
            >
              <Sparkles size={18} />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder={`Reply to ${client.name}`}
              className="h-8 flex-1 rounded-full bg-white px-4 text-[13px] text-black placeholder:text-gray-400 outline-none"
            />

            <button
              type="button"
              onClick={sendMessage}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2458ff] text-white"
            >
              <Send size={17} />
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}