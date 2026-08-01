"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, MessageCircle, Plus, RefreshCw } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/store/auth.store";
import type { ChatConversation, ChatMessage } from "@/types/chat";

export default function CustomerCareChatPage() {
  const user = useAuthStore((state) => state.user);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Account support");
  const [firstMessage, setFirstMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (conversationId: string, quiet = false) => {
    try {
      if (!quiet) setError("");
      const result = await chatService.messages(conversationId);
      setMessages(result);
    } catch (err) {
      if (!quiet) setError(err instanceof Error ? err.message : "Unable to load messages");
    }
  }, []);

  const loadConversation = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const conversations = await chatService.conversations("open");
      const active = conversations[0] ?? null;
      setConversation(active);
      if (active) await loadMessages(active.id);
      else setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customer care chat");
    } finally {
      setLoading(false);
    }
  }, [loadMessages]);

  useEffect(() => { void loadConversation(); }, [loadConversation]);

  useEffect(() => {
    if (!conversation) return;
    const timer = window.setInterval(() => void loadMessages(conversation.id, true), 5000);
    return () => window.clearInterval(timer);
  }, [conversation, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function startConversation(event: FormEvent) {
    event.preventDefault();
    if (!firstMessage.trim()) return;
    try {
      setSending(true);
      setError("");
      const result = await chatService.start(subject.trim() || "Account support", firstMessage.trim());
      const active: ChatConversation = {
        id: result.conversation_id,
        user_id: String(user?.id ?? ""),
        subject: subject.trim() || "Account support",
        status: "open",
        created_at: new Date().toISOString(),
      };
      setConversation(active);
      setFirstMessage("");
      await loadMessages(active.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start conversation");
    } finally {
      setSending(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!conversation || !message.trim() || conversation.status === "closed") return;
    const text = message.trim();
    setMessage("");
    try {
      setSending(true);
      setError("");
      await chatService.send(conversation.id, text);
      await loadMessages(conversation.id);
    } catch (err) {
      setMessage(text);
      setError(err instanceof Error ? err.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 pb-4 pt-12 text-[#3f3f3f]" style={{ backgroundImage: "url('/images/chat-bg.png')", backgroundSize: "cover", backgroundPosition: "bottom center", backgroundRepeat: "no-repeat" }}>
      <section className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-[430px] flex-col">
        <header className="relative flex items-center justify-center">
          <Link href="/dashboard" className="absolute left-0 text-[#555]"><ArrowLeft size={20} /></Link>
          <div className="absolute left-9 h-[21px] w-[21px] overflow-hidden rounded-full"><Image src="/images/chat-icon.png" alt="Customer care" fill className="object-cover" /></div>
          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-[#555]">Customer Care Chat</h1>
          <button type="button" title="Refresh chat" onClick={() => void loadConversation()} className="absolute right-0 text-[#555]"><RefreshCw size={18} /></button>
        </header>

        {error && <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-700">{error}</div>}

        {loading ? (
          <div className="flex flex-1 items-center justify-center"><LoaderCircle className="animate-spin text-[#2458E8]" /></div>
        ) : !conversation ? (
          <form onSubmit={startConversation} className="my-auto rounded-[22px] bg-white/95 p-5 shadow-sm">
            <div className="mb-4 flex justify-center"><MessageCircle size={34} className="text-[#2458E8]" /></div>
            <h2 className="text-center text-base font-semibold">Start a support conversation</h2>
            <p className="mt-1 text-center text-xs text-[#777]">Describe what you need help with. A tenant support officer can reply here.</p>
            <label className="mt-5 block text-xs font-medium">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2458E8]" />
            <label className="mt-4 block text-xs font-medium">Message</label>
            <textarea value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} maxLength={2000} rows={5} placeholder="How can we help?" className="mt-1 w-full resize-none rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-[#2458E8]" />
            <button disabled={sending || !firstMessage.trim()} className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#2458E8] text-sm font-semibold text-white disabled:opacity-50">
              {sending ? <LoaderCircle size={18} className="animate-spin" /> : "Start conversation"}
            </button>
          </form>
        ) : (
          <>
            <div className="mt-4 rounded-xl bg-white/80 px-3 py-2 text-center text-xs text-[#666]">
              <strong>{conversation.subject}</strong> · {conversation.status === "open" ? "Open" : "Closed"}
            </div>
            <div className="mt-3 flex-1 space-y-4 overflow-y-auto pb-4">
              {messages.length === 0 ? <p className="pt-8 text-center text-xs text-[#777]">No messages yet.</p> : messages.map((item) => (
                <ChatBubble key={item.id} isUser={String(item.sender_id) === String(user?.id)} text={item.message} timestamp={item.created_at} />
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <button title="Attachments are not supported yet" type="button" disabled className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full bg-white opacity-50 shadow-sm"><Plus size={26} className="text-[#2458E8]" /></button>
              <input value={message} onChange={(e) => setMessage(e.target.value)} disabled={conversation.status === "closed"} maxLength={2000} type="text" placeholder={conversation.status === "closed" ? "This conversation is closed" : "Type your message"} className="h-[41px] flex-1 rounded-full bg-[#f0f0f0] px-4 text-[14px] outline-none shadow-[inset_0_0_4px_rgba(0,0,0,0.15)] placeholder:text-[#aaa] disabled:opacity-60" />
              <button title="Send message" type="submit" disabled={sending || !message.trim() || conversation.status === "closed"} className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full bg-[#2458E8] shadow-sm active:scale-95 disabled:opacity-50">
                {sending ? <LoaderCircle size={19} className="animate-spin text-white" /> : <ArrowRight size={28} className="text-white" />}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function ChatBubble({ isUser, text, timestamp }: { isUser: boolean; text: string; timestamp: string }) {
  return <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
    <div className={`relative max-w-[83%] rounded-[15px] px-4 py-3 text-[14px] leading-[18px] shadow-sm ${isUser ? "rounded-tr-[6px] bg-[#5EA4FF] text-[#1f1f1f]" : "rounded-tl-[6px] bg-white text-[#4a4a4a]"}`}>
      <p className="whitespace-pre-line">{text}</p>
      <p className="mt-1 text-right text-[9px] opacity-60">{new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
    </div>
  </div>;
}
