import AppShell from "@/components/layout/AppShell";
import { Send, Search, Circle } from "lucide-react";

const conversations = [
  {
    id: 1,
    title: "Account issue",
    message: "Hello, I need help with my account.",
    status: "Open",
  },
  {
    id: 2,
    title: "Transfer support",
    message: "My transfer is still pending.",
    status: "Open",
  },
];

const messages = [
  {
    sender: "user",
    text: "Hello, I need help with my account.",
    time: "10:24 AM",
  },
  {
    sender: "admin",
    text: "We are checking this for you.",
    time: "10:26 AM",
  },
];

export default function ChatPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="text-sm text-gray-500">
          Message your tenant support team.
        </p>
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-3">
        <aside className="border-b border-gray-200 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <Search size={17} className="text-gray-400" />
            <input
              placeholder="Search conversations"
              className="w-full text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            {conversations.map((conversation, index) => (
              <button
                key={conversation.id}
                className={`w-full rounded-xl p-3 text-left ${
                  index === 0 ? "bg-tenant/10" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold">{conversation.title}</h2>

                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <Circle size={8} fill="currentColor" />
                    {conversation.status}
                  </span>
                </div>

                <p className="mt-1 truncate text-xs text-gray-500">
                  {conversation.message}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col lg:col-span-2">
          <div className="border-b border-gray-200 p-4">
            <h2 className="font-bold">Account issue</h2>
            <p className="text-xs text-gray-500">Support conversation</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => {
              const isAdmin = message.sender === "admin";

              return (
                <div
                  key={`${message.text}-${message.time}`}
                  className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isAdmin
                        ? "bg-white text-gray-900"
                        : "bg-tenant text-white"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`mt-2 text-[11px] ${
                        isAdmin ? "text-gray-400" : "text-white/70"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 border-t border-gray-200 p-4">
            <input
              placeholder="Type message..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tenant"
            />

            <button className="rounded-xl bg-tenant px-4 text-white">
              <Send size={18} />
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}