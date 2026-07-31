"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Settings,
  EyeOff,
  SendHorizontal,
  CreditCard,
  Gift,
  HeartHandshake,
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BadgeDollarSign,
  Users,
  History,
  X,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/auth.store";
import { useClientOverview } from "@/hooks/use-client-overview";
import { formatMoney } from "@/lib/formatters";
import type { ClientTransfer } from "@/types/transfer";

const quickActions = [
  { title: "Airtime", icon: "/images/airtime-3.png", href: "/airtime" },
  { title: "Data", icon: "/images/data-3.png", href: "/data" },
  { title: "Transfer", icon: "/images/transfer-2.png", href: "/transfers" },
  { title: "Card Lock", icon: "/images/card-lock-2.png", href: "/card-lock" },
];

const services = [
  { title: "Gift", icon: "/images/gifts-3.png", href: "/donations-gift/gifts" },
  { title: "Donations", icon: "/images/donations-2.png", href: "/donations-gift/donations" },
  { title: "Admin. services", icon: "/images/admin-services-2.png", href: "/admin-services" },
  { title: "Investment", icon: "/images/admin-services-2.png", href: "/investment" },
  { title: "Cards", icon: "/images/cards-2.png", href: "/cards" },
  { title: "Bill Pay", icon: "/images/send-money-2.png", href: "/bill-pay" },
];

const allServices = [
  { title: "Airtime", icon: "/images/airtime-3.png", href: "/airtime" },
  { title: "Send money", icon: "/images/send-money-2.png", href: "/send-money" },
  { title: "Pay Bill", icon: "/images/bill-pay.png", href: "/pay-bill" },
  { title: "Gift", icon: "/images/gifts-2.png", href: "/gift" },

  {
    title: "Donations",
    icon: "/images/donations-2.png",
    href: "/donations",
    className: "col-span-2",
  },
  {
    title: "Admin. services",
    icon: "/images/admin-services-2.png",
    href: "/admin-services",
    className: "col-span-2",
  },

  { title: "Investment", icon: "/images/admin-services-2.png", href: "/investment" },
  { title: "Cards", icon: "/images/cards-2.png", href: "/cards" },
  { title: "Bill Pay", icon: "/images/bill-pay.png", href: "/bill-pay" },
  { title: "Subscription", icon: "/images/admin-services-2.png", href: "/subscribe" },

  { title: "Card setting", icon: "/images/card-lock-2.png", href: "/cards" },
  {
    title: "Next-of-kin funds",
    icon: "/images/card-settings-2.png",
    href: "/nok",
    className: "col-span-2",
  },
  { title: "Trans. History", icon: "/images/transfer-2.png", href: "/transactions" },
];

const updates = [
  {
    icon: Info,
    title: "Up to $7m now convertible",
    text: "Congratulations! You have just upgraded your ZentraBa...",
  },
  {
    icon: Gift,
    title: "Charity Donation from Mark...",
    text: "Congratulations! You have just upgraded your ZentraBa...",
  },
];

export default function DashboardPage() {
  const [showMoreServices, setShowMoreServices] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { accounts, transfers, isLoading, error, reload } = useClientOverview();
  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.status === "active"),
    [accounts],
  );
  const primaryCurrency = activeAccounts[0]?.currency ?? accounts[0]?.currency ?? "NGN";
  const totalBalance = useMemo(
    () => accounts
      .filter((account) => account.currency === primaryCurrency)
      .reduce((total, account) => total + (Number(account.balance) || 0), 0),
    [accounts, primaryCurrency],
  );
  const displayName = user?.full_name || user?.email || "ZentraBank client";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#E7EBF0] pb-[92px] text-[#333]">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-12">
<header className="flex items-center justify-between rounded-[12px]">
  <Link
    href="/profile"
    className="flex items-center gap-3 transition-opacity hover:opacity-80"
  >
    <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white bg-[#B7D8FF] shadow-sm">
      <Image
        src="/images/profile-avatar.png"
        alt={displayName}
        fill
        className="object-cover"
      />
    </div>

    <div>
      <h1 className="font-lato text-[13px] font-semibold">
        {displayName}
      </h1>

      <p className="font-lato text-[12px] font-medium">
        <span className="text-[#333333]">{accounts[0]?.account_type || "Client"}</span>{" "}
        <span className="text-[#2B945D]">
          {user?.kyc_status === "verified" ? "Verified!" : "KYC pending"}
        </span>
      </p>
    </div>
  </Link>

  <div className="flex items-center gap-2 text-[#2B945D]">
    <Link href="/notifications" aria-label="Notifications">
      <Bell size={17} />
    </Link>

    <Link href="/settings" aria-label="Settings">
      <Settings size={17} />
    </Link>
  </div>
</header>

        <section className="mt-4 rounded-[9px] bg-[#2F9158] px-3 py-3 text-white shadow-sm">
          <div className="flex items-center gap-2 text-[12px]">
            <span>Balance</span>
            <EyeOff size={16} />
          </div>

          <div className="mt-2 flex items-end justify-between">
            <h2 className="text-[30px] font-semibold tracking-wide">
              {isLoading ? "Loading…" : formatMoney(totalBalance, primaryCurrency)}
            </h2>
            {/* <p className="text-[11px] text-black/55">Nonbank</p> */}
          </div>
        </section>

        <section className="mt-4 grid grid-cols-4 gap-4 rounded-[8px]  ">
          {quickActions.map((item) => (
            <SmallActionCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </section>

        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-[13px] font-bold tracking-wide">Services</h3>

          <button
            type="button"
            onClick={() => setShowMoreServices(true)}
            className="text-[12px] text-black/50"
          >
            View all
          </button>
        </div>

        <section className="mt-3 grid grid-cols-3 gap-4 font-lato">
          {services.map((item) => (
            <DashboardServiceCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </section>

        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-[13px] font-bold tracking-wide">
            Transaction History
          </h3>

          <Link href="/transactions" className="text-[12px] text-black/50">
            View all
          </Link>
        </div>

        <section className="mt-2 space-y-2 font-lato">
          {error ? (
            <div className="rounded-[7px] border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700">
              <p>{error}</p>
              <button type="button" onClick={() => void reload()} className="mt-2 font-semibold underline">
                Try again
              </button>
            </div>
          ) : isLoading ? (
            <div className="rounded-[7px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              Loading recent activity…
            </div>
          ) : transfers.length === 0 ? (
            <div className="rounded-[7px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              No transfers yet. Your recent activity will appear here.
            </div>
          ) : (
            transfers.slice(0, 2).map((transfer) => (
              <LiveTransactionCard key={transfer.id} transfer={transfer} />
            ))
          )}
        </section>

        <section className="mt-4 overflow-hidden rounded-[8px] border border-[#55AE62] bg-white shadow-[0_0_8px_rgba(47,145,88,0.8)]">
          <div className="flex">
            <div className="relative h-[96px] w-[96px] shrink-0">
              <Image
                src="/images/donations-avatar-2.png"
                alt="Redeem"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-center px-3 text-center">
              <h2 className="text-[22px] font-black font-sf-condensed leading-[22px] text-[#2E8B57]">
                Register to Redeem Funds!
              </h2>
              <p className="mt-2 text-[12px] text-black/55 font-lato">
                Get redemption code for gifts, donations
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between">
          <h3 className="text-[13px] font-bold tracking-wide">
            Recent Updates
          </h3>
          <Link href="" className="text-[12px] text-black/50">
            View all
          </Link>
        </div>

        <section className="mt-3 space-y-2">
          {updates.map((item) => (
            <UpdateCard
              key={item.title}
              title={item.title}
              text={item.text}
              icon={item.icon}
            />
          ))}
        </section>

        <section className="mt-8">
          <svg viewBox="0 0 330 150" className="h-[150px] w-full">
            {[0, 1, 2, 3, 4, 5, 6].map((y) => (
              <line
                key={y}
                x1="30"
                x2="320"
                y1={20 + y * 20}
                y2={20 + y * 20}
                stroke="#cbd2da"
                strokeWidth="1"
              />
            ))}

            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => (
              <line
                key={x}
                x1={30 + x * 32}
                x2={30 + x * 32}
                y1="20"
                y2="140"
                stroke="#cbd2da"
                strokeWidth="1"
              />
            ))}

            {[
              "40,55 70,42 102,50 135,92 168,68 200,72 230,38 265,70 300,44 320,62",
              "40,70 70,112 102,86 135,52 168,106 200,84 230,55 265,105 300,78 320,96",
              "40,92 70,60 102,120 135,62 168,115 200,52 230,74 265,78 300,64 320,88",
              "40,48 70,86 102,42 135,86 168,72 200,58 230,74 265,42 300,38 320,66",
            ].map((points, index) => (
              <polyline
                key={index}
                points={points}
                fill="none"
                strokeWidth="1.2"
                stroke={
                  ["#2B945D", "#FF6EA8", "#7E39FF", "#3E53D9"][index]
                }
              />
            ))}
          </svg>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold fot-sf-condensed tracking-wide">
              Recent Updates
            </h3>

            <div className="flex gap-4">
              <ChevronLeft size={18} className="text-black/30" />
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {[1, 2, 3, 4].map((item) => (
              <AdvertCard key={item} />
            ))}
          </div>
        </section>
      </section>

      {showMoreServices && (
        <MoreServicesOverlay onClose={() => setShowMoreServices(false)} />
      )}

      <BottomNav />
    </main>
  );
}

function SmallActionCard({
  title,
  icon,
  href,
}: {
  title: string;
  icon: string;
  href: string;
}) {
  return (
    <Link href={href} className="block text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white shadow-md">
        <Image
          src={icon}
          alt={title}
          width={25}
          height={25}
          className="object-contain"
        />
      </div>
      <p className="mt-2 text-[12px] text-[#2B945D]">{title}</p>
    </Link>
  );
}

function DashboardServiceCard({
  title,
  icon,
  href,
}: {
  title: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block h-[70px] rounded-[5px] border border-black/10 bg-gradient-to-br from-white via-[#B8E6D1] to-[#A7D0EF] text-center shadow-md"
    >
      <div className="mx-auto mt-1 grid h-11 w-11 place-items-center rounded-md bg-white shadow-md">
        <Image
          src={icon}
          alt={title}
          width={25}
          height={25}
          className="object-contain"
        />
      </div>

      <p className="mt-1 text-[12px] leading-none">{title}</p>
    </Link>
  );
}

function MoreServicesOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[#E7EBF0] px-6 pb-[100px] pt-5">
      <section className="mx-auto max-w-[390px]">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/30" />

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white shadow"
            aria-label="Close services"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {allServices.map((item) => (
            <MoreServiceCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
              className={item.className}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function MoreServiceCard({
  title,
  icon,
  href,
  className = "",
}: {
  title: string;
  icon: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`block h-[74px] rounded-[5px] border border-black/10 bg-gradient-to-br from-white via-[#B8E6D1] to-[#A7D0EF] text-center shadow-md ${className}`}
    >
      <div className="mx-auto mt-2 grid h-10 w-10 place-items-center rounded-md bg-white shadow-md">
        <Image
          src={icon}
          alt={title}
          width={24}
          height={24}
          className="object-contain"
        />
      </div>

      <p className="mt-1 text-[11px] leading-tight">{title}</p>
    </Link>
  );
}

function LiveTransactionCard({ transfer }: { transfer: ClientTransfer }) {
  const destination = transfer.destination_account_name || transfer.destination_account_number || "Recipient";
  return (
    <TransactionCard
      type="out"
      name={transfer.description || `Transfer to ${destination}`}
      bank={destination}
      amount={`-${formatMoney(transfer.amount, transfer.currency)}`}
    />
  );
}

function TransactionCard({
  type,
  name,
  bank,
  amount,
}: {
  type: "in" | "out";
  name: string;
  bank: string;
  amount: string;
}) {
  const isIn = type === "in";

  return (
    <div className="flex items-center justify-between rounded-[7px] border border-black/10 bg-[#F2F5F8] px-3 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        {isIn ? (
          <ArrowDownLeft size={14} className="text-[#2B945D]" />
        ) : (
          <ArrowUpRight size={14} className="text-[#E0443E]" />
        )}

        <div>
          <p className="font-lato text-[11px] text-black/30">
            {name}
          </p>

          <h4 className="font-lato text-[13px] leading-none text-black/60">
            {bank}
          </h4>
        </div>
      </div>

      <p
        className={`font-sf text-[14px] font-semibold ${
          isIn ? "text-[#2E8B57]/80" : "text-[#C0392B]/80"
        }`}
      >
        {amount}
      </p>
    </div>
  );
}

function UpdateCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-[10px] border border-black/10 bg-[#F3F6FA] px-3 py-2 text-left shadow-sm"
    >
      <Icon size={20} className="text-[#2B945D]" />

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[13px] font-semibold">{title}</h4>
        <p className="truncate text-[11px] text-black/55">{text}</p>
      </div>

      <ChevronDown size={17} className="text-black/45" />
    </button>
  );
}

function AdvertCard() {
  return (
    <article className="min-w-[108px] rounded-[5px] bg-white p-2 shadow-md">
      <div className="grid h-[68px] place-items-center rounded-md bg-white shadow-md">
        <Image
          src="/images/update-avatar-2.png"
          alt="Advert"
          width={42}
          height={42}
          className="object-contain"
        />
      </div>

      <h4 className="mt-3 text-center text-[14px] font-bold tracking-wide">
        Advert Card
      </h4>

      <p className="mt-2 text-[9px] font-semibold">Lorem ipsum dolor sit</p>
      <p className="mt-1 text-[8px] leading-[10px] text-black/70">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate
        libero et velit interdum, ac aliquet odio mattis.
      </p>
    </article>
  );
}