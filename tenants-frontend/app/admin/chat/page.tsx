import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

const messages = [
  {
    from: "client",
    avatar: "/images/client-avatar.png",
    text: "This is honestly ridiculous. I just transferred $2,000 and it's nowhere to be found in my transaction history. What kind of system are you people running??",
  },
  {
    from: "admin",
    avatar: "/images/admin-avatar.png",
    text: "Hi Michael, I’m really sorry for the frustration this has caused you. I understand how concerning it is when money seems to go missing. Let me help you sort this out right away.",
  },
  {
    from: "client",
    avatar: "/images/client-avatar.png",
    text: "‘Sort this out’? I need my money, not apologies. It’s been over an hour already!",
  },
  {
    from: "admin",
    avatar: "/images/admin-avatar.png",
    text: "I completely understand your urgency. I’ve checked your account, and I can see the transfer you initiated. It’s currently in a pending state, which means it hasn’t been fully processed yet.",
  },
  {
    from: "client",
    avatar: "/images/client-avatar.png",
    text: "Pending?? Why wasn’t I told that before I sent it? The app just said ‘successful’!",
  },
  {
    from: "admin",
    avatar: "/images/admin-avatar.png",
    text: "You’re right to expect clarity. “Successful” in this case means the request was submitted successfully, but the actual processing can take some time depending on the transfer type and receiving bank.",
  },
  {
    from: "client",
    avatar: "/images/client-avatar.png",
    text: "That’s misleading. Very misleading. What if something goes wrong?",
  },
  {
    from: "admin",
    avatar: "/images/admin-avatar.png",
    text: "I understand why that feels confusing, Michael. I’ll keep tracking the transfer and update you as soon as the final status changes.",
  },
];

export default function AdminChatPage() {
  return (
    <main className="min-h-screen bg-black text-white md:bg-[radial-gradient(circle_at_top,#1a1a1a,#000_65%)]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col border-x border-white/10 px-4 pb-3 pt-11 md:max-w-[1100px] md:px-8">
        <header className="mb-4 flex items-center gap-3 md:mb-8">
          <Link href="/dashboard" className="text-white">
            <ArrowLeft size={18} />
          </Link>

          <Image
            src="/images/admin-avatar.png"
            alt="Admin"
            width={24}
            height={24}
            className="rounded-full md:h-10 md:w-10"
          />

          <h1 className="text-[12px] font-bold md:text-xl">
            Bank manager/Admin Chat
          </h1>
        </header>

        <section className="flex-1 overflow-y-auto pb-4 md:mx-auto md:w-full md:max-w-[780px] md:rounded-[28px] md:border md:border-white/10 md:bg-white/[0.03] md:p-6">
          <div className="space-y-3 md:space-y-5">
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
                      className="rounded-full md:h-10 md:w-10"
                    />
                  )}

                  <div
                    className={`max-w-[245px] rounded-[20px] px-3 py-2 text-[12px] leading-[1.15] md:max-w-[520px] md:px-5 md:py-4 md:text-base ${
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
                      className="-ml-5 rounded-full md:-ml-7 md:h-10 md:w-10"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-2 flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ffffff,#5aa2ff,#1c4be8)] p-1 md:mx-auto md:mt-5 md:w-full md:max-w-[780px]">
          <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1d4ed8] md:h-11 md:w-11">
            <Sparkles size={18} />
          </button>

          <input
            placeholder="Type your message"
            className="h-8 flex-1 rounded-full bg-white px-4 text-[13px] text-black placeholder:text-gray-400 outline-none md:h-11 md:text-base"
          />

          <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2458ff] text-white md:h-11 md:w-11">
            <Send size={17} />
          </button>
        </footer>
      </div>
    </main>
  );
}