"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/api";
// import { getMyAccounts, getMyTransfers } from "@/services/banking.service";
import {
  getTenantAccounts,
  getTenantTransfers,
} from "@/services/banking.service";
import { useAuthStore } from "@/store/auth.store";
import type { BankAccount, Transfer } from "@/types/banking.types";
import {
  Send, Smartphone, Globe2, CreditCard, Receipt, Gift, HeartHandshake,
  Settings, Wallet, Bell, ArrowRightLeft, UsersRound, UserCog,
  BadgeDollarSign, CircleDollarSign,Landmark,UserLock,
} from "lucide-react";

const mainServices = [
  { title: "Send money", icon: Send, href: "/dashboard/transfer" },
  { title: "FX", icon: Landmark, href: "/fx" },
  { title: "Kyc", icon: UserLock, href: "/dashboard/kyc" },
  { title: "Cards", icon: CreditCard, href: "/dashboard/card-lock" },
  { title: "Next-of-kin", icon: Receipt, href: "/nok" },
  { title: "Subscription", icon: CircleDollarSign, href: "/subscribe" },
  { title: "Investment", icon: Wallet, href: "/investments" },
  { title: "Donations", icon: HeartHandshake, href: "/dashboard/donation" },
  { title: "chat", icon: BadgeDollarSign, href: "/dashboard/communications/chat" },
  { title: "Gift", icon: Gift, href: "/dashboard/gift" },
  { title: "Card setting", icon: Settings, href: "/dashboard/card-lock" },
  { title: "Notifications", icon: Bell, href: "dashboard/communications/notifications" },
];

const accountServices = [
  { title: "My Clients", icon: UsersRound, href: "/clients" },
  { title: "Me as Agent", icon: UserCog, href: "/agent" },
  { title: "Chat Admin", icon: ArrowRightLeft, href: "/accounts" },
];

function ServiceCard({ title, icon: Icon, href }: { title: string; icon: React.ElementType; href: string }) {
  const disabled = href === "#";
  const content = (
    <>
      <div className="flex h-[45px] w-[45px] items-center justify-center rounded-[7px] bg-white text-emerald-700 shadow-[0_4px_10px_rgba(0,0,0,0.25)] md:h-[62px] md:w-[62px] md:rounded-[12px]">
        <Icon size={22} strokeWidth={2.2} className="md:h-8 md:w-8" />
      </div>
      <span className="mt-2 text-center text-[11px] font-medium leading-[12px] text-white md:text-[15px] md:font-semibold">{title}</span>
    </>
  );
  const classes = "flex h-[84px] flex-col items-center justify-center rounded-[6px] border border-red-500/40 bg-[linear-gradient(180deg,#d71919_0%,#9b0505_100%)] px-2 shadow-[0_8px_18px_rgba(0,0,0,0.48),inset_0_1px_2px_rgba(255,255,255,0.25)] transition active:scale-[0.97] md:h-[130px] md:rounded-[14px]";
  return disabled ? <button type="button" disabled title="Coming soon" className={`${classes} cursor-not-allowed opacity-55`}>{content}</button> : <Link href={href} className={classes}>{content}</Link>;
}

export default function ServicesPage() {
  const user = useAuthStore((state) => state.user);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
  getTenantAccounts(),
  getTenantTransfers({
    page: 1,
    pageSize: 5,
  }),
])
      .catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);

  const balances = useMemo(() => {
    const totals = new Map<string, number>();
    accounts.forEach((account) => totals.set(account.currency, (totals.get(account.currency) ?? 0) + Number(account.balance || 0)));
    return Array.from(totals.entries());
  }, [accounts]);

  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-80px)] overflow-x-hidden rounded-3xl bg-black text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.13),transparent_16%)]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-5 md:px-8">
          <section className="hidden md:block rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur md:p-5">
            <p className="text-sm text-white/70">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold">{user?.full_name || user?.email}</h1>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-black/35 p-3"><p className="text-xs text-white/55">Clients Accounts</p><p className="mt-1 text-xl font-bold">{accounts.length}</p></div>
              <div className="rounded-xl bg-black/35 p-3"><p className="text-xs text-white/55">Recent Client transfers</p><p className="mt-1 text-xl font-bold">{transfers.length}</p></div>
              <div className="rounded-xl bg-black/35 p-3"><p className="text-xs text-white/55">Balance</p><p className="mt-1 text-base font-bold">{balances.length ? balances.map(([currency, value]) => `${currency} ${value.toLocaleString()}`).join(" · ") : "No accounts"}</p></div>
            </div>
            {error ? <p className="mt-3 rounded-lg bg-red-950/80 p-3 text-sm text-red-100">{error}</p> : null}
          </section>

          <section className="mt-6 text-center md:mx-auto md:max-w-[760px]">
            <h2 className="font-heading text-[37px] font-black leading-[36px] tracking-[-0.8px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[64px] md:leading-[66px]">Control what your client sees on their own account</h2>
            <p className="mx-auto mt-4 max-w-[340px] text-[13px] font-medium leading-[17px] text-white md:max-w-[620px] md:text-[18px] md:leading-[28px]">Choose a service below. Connected services now load live account data from the backend.</p>
          </section>

          <section className="mt-6 grid grid-cols-3 gap-x-2 gap-y-4 md:mt-10 md:grid-cols-4 md:gap-5 lg:grid-cols-6">
            {mainServices.map((service) => <ServiceCard key={service.title} {...service} />)}
          </section>

          <section className="mt-7 text-center md:mt-12">
            <h2 className="font-heading text-[23px] font-black tracking-[0.6px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[42px]">Control my account</h2>
            <p className="mx-auto mt-3 max-w-[310px] text-[13px] font-medium leading-[17px] text-white md:max-w-[560px] md:text-[17px] md:leading-[26px]">Open your live accounts and transaction activity.</p>
          </section>
          <section className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 md:mt-7 md:gap-5 md:px-20 lg:px-52">
            {accountServices.map((service) => <ServiceCard key={service.title} {...service} />)}
          </section>
          <div className="mt-7 flex justify-center gap-3">
            <Link href="/accounts" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">Send Money</Link>
            <Link href="/transactions" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white">View transactions</Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
