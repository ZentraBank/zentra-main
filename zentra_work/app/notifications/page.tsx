"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Gift,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { notificationService } from "@/services/notification.service";
import type { ClientNotification } from "@/types/notification";

export default function NotificationsPage() {
  const [items, setItems] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((item) => !Boolean(item.is_read)).length,
    [items],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await notificationService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openNotification = async (item: ClientNotification) => {
    const nextExpanded = expandedId === item.id ? null : item.id;
    setExpandedId(nextExpanded);
    if (!item.is_read) {
      setWorkingId(item.id);
      try {
        const updated = await notificationService.markRead(item.id);
        setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to mark notification as read.");
      } finally {
        setWorkingId(null);
      }
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setError("");
    try {
      await notificationService.markAllRead();
      setItems((current) => current.map((item) => ({ ...item, is_read: true, read_at: item.read_at ?? new Date().toISOString() })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const archive = async (notificationId: string) => {
    setWorkingId(notificationId);
    setError("");
    try {
      await notificationService.archive(notificationId);
      setItems((current) => current.filter((item) => item.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to archive notification.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#E8EDF3] pb-[90px]">
      <section className="mx-auto max-w-[430px] px-5 pt-11 lg:max-w-[900px]">
        <header className="relative mb-4 flex items-center justify-center">
          <Link href="/dashboard" className="absolute left-0 top-1/2 -translate-y-1/2">
            <ArrowLeft size={20} className="text-[#666]" />
          </Link>
          <div className="text-center">
            <h1 className="text-[20px] font-semibold text-[#444]">Notifications</h1>
            {!loading && <p className="mt-1 text-xs text-[#777]">{unreadCount} unread</p>}
          </div>
          <button
            type="button"
            onClick={() => void markAllRead()}
            disabled={markingAll || unreadCount === 0}
            className="absolute right-0 grid h-9 w-9 place-items-center rounded-full bg-white text-[#2852D8] shadow-sm disabled:opacity-40"
            aria-label="Mark all notifications as read"
          >
            {markingAll ? <Loader2 size={17} className="animate-spin" /> : <CheckCheck size={18} />}
          </button>
        </header>

        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <Loader2 className="animate-spin text-[#2852D8]" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <BellRing className="mx-auto text-[#2F9158]" />
            <h2 className="mt-3 font-semibold text-[#444]">No notifications yet</h2>
            <p className="mt-1 text-sm text-[#777]">Updates about your account will appear here.</p>
            <button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2852D8] px-5 py-2 text-sm font-medium text-white">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const expanded = expandedId === item.id;
              const unread = !Boolean(item.is_read);
              return (
                <article
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 shadow-sm transition ${unread ? "border-[#9EB5FF] bg-white" : "border-[#D6D9DE] bg-[#F3F5F8]"}`}
                >
                  <button type="button" onClick={() => void openNotification(item)} className="flex w-full items-start gap-3 text-left">
                    <NotificationIcon type={item.notification_type} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#444]">{item.title}</h3>
                        {unread && <span className="h-2 w-2 rounded-full bg-[#2852D8]" />}
                      </div>
                      <p className={`${expanded ? "" : "truncate"} mt-1 text-[12px] leading-4 text-[#7C7C7C]`}>{item.message}</p>
                      <p className="mt-2 text-[10px] text-[#999]">{formatDate(item.created_at)}</p>
                    </div>
                    {workingId === item.id ? <Loader2 size={17} className="animate-spin text-[#777]" /> : expanded ? <ChevronUp size={18} className="text-[#777]" /> : <ChevronDown size={18} className="text-[#777]" />}
                  </button>

                  {expanded && (
                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#D6D9DE] pt-3">
                      {item.action_url && (
                        <Link href={item.action_url} className="rounded-full bg-[#2852D8] px-4 py-2 text-xs font-medium text-white">
                          Take action
                        </Link>
                      )}
                      <button type="button" onClick={() => void archive(item.id)} disabled={workingId === item.id} className="inline-flex items-center gap-1 rounded-full border border-[#D6D9DE] bg-white px-4 py-2 text-xs font-medium text-[#666]">
                        <Trash2 size={13} /> Archive
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
      <BottomNav />
    </main>
  );
}

function NotificationIcon({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  if (normalized.includes("donation") || normalized.includes("gift")) return <Gift size={22} className="mt-0.5 text-[#2962FF]" />;
  if (normalized.includes("security") || normalized.includes("kyc")) return <ShieldCheck size={22} className="mt-0.5 text-[#2F9158]" />;
  return <Info size={22} className="mt-0.5 text-[#2F9158]" />;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
