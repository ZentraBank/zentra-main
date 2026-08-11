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
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from "lucide-react";

import BottomNav from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/auth.store";
import { useClientOverview } from "@/hooks/use-client-overview";
import { formatMoney } from "@/lib/formatters";
import type { ClientTransfer } from "@/types/transfer";
import type { ClientNotification } from "@/types/notification";

const quickActions = [
  {
    title: "Airtime",
    icon: "/images/airtime-3.png",
    href: "/airtime",
  },
  {
    title: "Data",
    icon: "/images/data-3.png",
    href: "/data",
  },
  {
    title: "Transfer",
    icon: "/images/transfer-2.png",
    href: "/transfers",
  },
  {
    title: "Card Lock",
    icon: "/images/card-lock-2.png",
    href: "/cards/active-cards",
  },
];

const services = [
  {
    title: "Gift",
    icon: "/images/gifts-3.png",
    href: "/donations-gift/gifts",
  },
  {
    title: "Donations",
    icon: "/images/donations-2.png",
    href: "/donations-gift/donations",
  },
  {
    title: "Admin. services",
    icon: "/images/admin-services-2.png",
    href: "/admin-services",
  },
  {
    title: "Investment",
    icon: "/images/admin-services-2.png",
    href: "/investment",
  },
  {
    title: "Cards",
    icon: "/images/cards-2.png",
    href: "/cards/active-cards",
  },
  {
    title: "Bill Pay",
    icon: "/images/send-money-2.png",
    href: "/bill-pay",
  },
];

const allServices = [
  {
    title: "Airtime",
    icon: "/images/airtime-3.png",
    href: "/airtime",
  },
  {
    title: "Send money",
    icon: "/images/send-money-2.png",
    href: "/transfers",
  },
  {
    title: "Pay Bill",
    icon: "/images/bill-pay.png",
    href: "/pay-bill",
  },
  {
    title: "Gift",
    icon: "/images/gifts-2.png",
    href: "/gift",
  },
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
  {
    title: "Investment",
    icon: "/images/admin-services-2.png",
    href: "/investment",
  },
  {
    title: "Cards",
    icon: "/images/cards-2.png",
    href: "/cards/active-cards",
  },
  {
    title: "Bill Pay",
    icon: "/images/bill-pay.png",
    href: "/bill-pay",
  },
  {
    title: "Subscription",
    icon: "/images/admin-services-2.png",
    href: "/subscribe",
  },
  {
    title: "Card setting",
    icon: "/images/card-lock-2.png",
    href: "/cards/active-cards",
  },
  {
    title: "Next-of-kin funds",
    icon: "/images/card-settings-2.png",
    href: "/nok",
    className: "col-span-2",
  },
  {
    title: "Trans. History",
    icon: "/images/transfer-2.png",
    href: "/transactions",
  },
];

export default function DashboardPage() {
  const [showMoreServices, setShowMoreServices] = useState(false);

  const user = useAuthStore((state) => state.user);

  const {
    accounts,
    transfers,
    cards,
    notifications,
    unreadNotificationCount,
    cardPurchaseRequests,
    isLoading,
    error,
    reload,
  } = useClientOverview();

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.status === "active"),
    [accounts],
  );

  const primaryCurrency =
    activeAccounts[0]?.currency ??
    accounts[0]?.currency ??
    "GBP";

  const totalBalance = useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            account.currency === primaryCurrency,
        )
        .reduce(
          (total, account) =>
            total + (Number(account.balance) || 0),
          0,
        ),
    [accounts, primaryCurrency],
  );

  const displayName =
    user?.full_name ||
    user?.email ||
    "ZentraBank client";

  const pendingCardRequest =
    cardPurchaseRequests.find(
      (request) => request.status === "pending",
    );

  const cardSummary = useMemo(() => {
    if (cards.length > 0) {
      const activeCount = cards.filter(
        (card) => card.status === "active",
      ).length;

      const frozenCount = cards.filter(
        (card) => card.status === "frozen",
      ).length;

      return {
        title: `${cards.length} issued card${
          cards.length === 1 ? "" : "s"
        }`,
        description:
          frozenCount > 0
            ? `${activeCount} active · ${frozenCount} frozen`
            : `${activeCount} active`,
        href: "/cards/active-cards",
      };
    }

    if (pendingCardRequest) {
      return {
        title: "Card request pending",
        description: `${pendingCardRequest.card_type.replaceAll(
          "_",
          " ",
        )} card awaiting verification`,
        href: `/cards/purchase-status/${pendingCardRequest.id}`,
      };
    }

    return {
      title: "No issued cards",
      description: "Create your first ZentraBank card",
      href: "/cards/cards-purchase",
    };
  }, [cards, pendingCardRequest]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#E7EBF0] pb-[92px] text-[#333] md:pb-10">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-12 md:max-w-[1180px] md:px-8 md:pt-8 xl:max-w-[1320px]">
        <header className="flex items-center justify-between rounded-[12px] md:rounded-[18px] md:bg-white/55 md:px-5 md:py-4 md:shadow-sm md:backdrop-blur-sm">
          <Link
            href="/profile"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white bg-[#B7D8FF] shadow-sm md:h-12 md:w-12">
              <Image
                src="/images/profile-avatar.png"
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h1 className="font-lato text-[13px] font-semibold md:text-[15px]">
                {displayName}
              </h1>

              <p className="font-lato text-[12px] font-medium md:text-[13px]">
                <span className="text-[#333333]">
                  {accounts[0]?.account_type || "Client"}
                </span>{" "}
                <span className="text-[#2B945D]">
                  {formatKycStatus(user?.kyc_status)}
                </span>
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-[#2B945D] md:gap-5">
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative"
            >
              <Bell size={18} />

              {unreadNotificationCount > 0 && (
                <span className="absolute -right-2 -top-2 grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </Link>

            <Link
              href="/settings"
              aria-label="Settings"
            >
              <Settings size={18} />
            </Link>
          </div>
        </header>

        <section className="mt-4 rounded-[9px] bg-[#2F9158] px-3 py-3 text-white shadow-sm md:mt-6 md:rounded-[18px] md:px-7 md:py-6 md:shadow-md">
          <div className="flex items-center gap-2 text-[12px] md:text-[14px]">
            <span>Balance</span>
            <EyeOff size={16} />
          </div>

          <div className="mt-2 flex items-end justify-between">
            <h2 className="text-[30px] font-semibold tracking-wide md:text-[42px]">
              {isLoading
                ? "Loading…"
                : formatMoney(
                    totalBalance,
                    primaryCurrency,
                  )}
            </h2>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-4 gap-4 rounded-[8px] md:mt-6 md:grid-cols-4 md:gap-5">
          {quickActions.map((item) => (
            <SmallActionCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </section>

        <div className="mt-4 flex items-center justify-between md:mt-7">
          <h3 className="text-[13px] font-bold tracking-wide md:text-[16px]">
            Services
          </h3>

          <button
            type="button"
            onClick={() => setShowMoreServices(true)}
            className="text-[12px] text-black/50 md:text-[13px]"
          >
            View all
          </button>
        </div>

        <section className="mt-3 grid grid-cols-3 gap-4 font-lato md:grid-cols-6 md:gap-5">
          {services.map((item) => (
            <DashboardServiceCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </section>

        <section className="mt-4 rounded-[10px] bg-white px-3 py-3 shadow-sm md:mt-6 md:rounded-[16px] md:px-5 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#E8F0FF] text-[#2458E8]">
                <CreditCard size={19} />
              </span>

              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-black/40">
                  Cards
                </p>

                <p className="truncate text-[14px] font-bold">
                  {cardSummary.title}
                </p>

                <p className="truncate text-[11px] text-black/45">
                  {cardSummary.description}
                </p>
              </div>
            </div>

            <Link
              href={cardSummary.href}
              className="shrink-0 text-[12px] font-bold text-[#2458E8]"
            >
              View
            </Link>
          </div>
        </section>

        <div className="mt-4 flex items-center justify-between md:mt-7">
          <h3 className="text-[13px] font-bold tracking-wide md:text-[16px]">
            Transaction History
          </h3>

          <Link
            href="/transactions"
            className="text-[12px] text-black/50 md:text-[13px]"
          >
            View all
          </Link>
        </div>

        <section className="mt-2 space-y-2 font-lato md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          {error ? (
            <div className="rounded-[7px] border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => void reload()}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : isLoading ? (
            <div className="rounded-[7px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              Loading recent activity…
            </div>
          ) : transfers.length === 0 ? (
            <div className="rounded-[7px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              No transfers yet. Your recent activity will
              appear here.
            </div>
          ) : (
            transfers
              .slice(0, 3)
              .map((transfer) => (
                <LiveTransactionCard
                  key={transfer.id}
                  transfer={transfer}
                />
              ))
          )}
        </section>

        <section className="mt-4 overflow-hidden rounded-[8px] border border-[#55AE62] bg-white shadow-[0_0_8px_rgba(47,145,88,0.8)] md:mt-7 md:rounded-[16px]">
          <div className="flex">
            <div className="relative h-[96px] w-[96px] shrink-0 md:h-[132px] md:w-[150px]">
              <Image
                src="/images/donations-avatar-2.png"
                alt="Redeem"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-center px-3 text-center md:px-8 md:text-left">
              <h2 className="font-sf-condensed text-[22px] font-black leading-[22px] text-[#2E8B57] md:text-[30px] md:leading-[32px]">
                Register to Redeem Funds!
              </h2>

              <p className="mt-2 font-lato text-[12px] text-black/55 md:text-[14px]">
                Get redemption code for gifts, donations
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between md:mt-7">
          <h3 className="text-[13px] font-bold tracking-wide md:text-[16px]">
            Recent Updates
          </h3>

          <Link
            href="/notifications"
            className="text-[12px] text-black/50 md:text-[13px]"
          >
            View all
          </Link>
        </div>

        <section className="mt-3 space-y-2 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          {isLoading ? (
            <div className="rounded-[10px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              Loading updates…
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-[10px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              No recent updates.
            </div>
          ) : (
            notifications
              .slice(0, 3)
              .map((notification) => (
                <LiveUpdateCard
                  key={notification.id}
                  notification={notification}
                />
              ))
          )}
        </section>

        <section className="mt-8 md:mt-10 md:rounded-[18px] md:bg-white/60 md:p-5 md:shadow-sm">
          <svg
            viewBox="0 0 330 150"
            className="h-[150px] w-full md:h-[220px]"
          >
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

            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
              (x) => (
                <line
                  key={x}
                  x1={30 + x * 32}
                  x2={30 + x * 32}
                  y1="20"
                  y2="140"
                  stroke="#cbd2da"
                  strokeWidth="1"
                />
              ),
            )}

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
                  [
                    "#2B945D",
                    "#FF6EA8",
                    "#7E39FF",
                    "#3E53D9",
                  ][index]
                }
              />
            ))}
          </svg>
        </section>

        <section className="mt-7 md:mt-10">
          <div className="flex items-center justify-between">
            <h3 className="font-sf-condensed text-[13px] font-bold tracking-wide">
              Offers
            </h3>

            <div className="flex gap-4">
              <ChevronLeft
                size={18}
                className="text-black/30"
              />
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-3 scrollbar-hide md:grid md:grid-cols-4 md:gap-5 md:overflow-visible">
            {[1, 2, 3, 4].map((item) => (
              <AdvertCard key={item} />
            ))}
          </div>
        </section>
      </section>

      {showMoreServices && (
        <MoreServicesOverlay
          onClose={() =>
            setShowMoreServices(false)
          }
        />
      )}

      <div className="md:hidden">
        <BottomNav />
      </div>
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
    <Link
      href={href}
      className="block text-center md:rounded-[14px] md:bg-white/50 md:px-3 md:py-4 md:shadow-sm md:transition md:hover:-translate-y-0.5 md:hover:shadow-md"
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white shadow-md md:h-14 md:w-14">
        <Image
          src={icon}
          alt={title}
          width={25}
          height={25}
          className="object-contain"
        />
      </div>

      <p className="mt-2 text-[12px] text-[#2B945D] md:text-[13px] md:font-semibold">
        {title}
      </p>
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
      className="block h-[70px] rounded-[5px] border border-black/10 bg-gradient-to-br from-white via-[#B8E6D1] to-[#A7D0EF] text-center shadow-md md:h-[96px] md:rounded-[14px] md:pt-2 md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg"
    >
      <div className="mx-auto mt-1 grid h-11 w-11 place-items-center rounded-md bg-white shadow-md md:h-12 md:w-12">
        <Image
          src={icon}
          alt={title}
          width={25}
          height={25}
          className="object-contain"
        />
      </div>

      <p className="mt-1 text-[12px] leading-none md:mt-2 md:text-[13px] md:font-semibold">
        {title}
      </p>
    </Link>
  );
}

function MoreServicesOverlay({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[#E7EBF0] px-6 pb-[100px] pt-5 md:bg-black/35 md:px-8 md:py-10 md:backdrop-blur-sm">
      <section className="mx-auto max-w-[390px] md:max-w-[980px] md:rounded-[22px] md:bg-[#E7EBF0] md:p-7 md:shadow-2xl">
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

        <div className="grid grid-cols-4 gap-3 md:grid-cols-6 md:gap-5">
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
      className={`block h-[74px] rounded-[5px] border border-black/10 bg-gradient-to-br from-white via-[#B8E6D1] to-[#A7D0EF] text-center shadow-md md:h-[96px] md:rounded-[14px] md:pt-2 md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg ${className}`}
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

      <p className="mt-1 text-[11px] leading-tight">
        {title}
      </p>
    </Link>
  );
}

function LiveTransactionCard({
  transfer,
}: {
  transfer: ClientTransfer;
}) {
  const destination =
    transfer.destination_account_name ||
    transfer.destination_account_number ||
    "Recipient";

  return (
    <TransactionCard
      type="out"
      name={
        transfer.description ||
        `Transfer to ${destination}`
      }
      bank={destination}
      amount={`-${formatMoney(
        transfer.amount,
        transfer.currency,
      )}`}
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
    <div className="flex items-center justify-between rounded-[7px] border border-black/10 bg-[#F2F5F8] px-3 py-2 shadow-sm md:min-h-[78px] md:rounded-[14px] md:bg-white md:px-4 md:py-3">
      <div className="flex items-center gap-3">
        {isIn ? (
          <ArrowDownLeft
            size={14}
            className="text-[#2B945D]"
          />
        ) : (
          <ArrowUpRight
            size={14}
            className="text-[#E0443E]"
          />
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
          isIn
            ? "text-[#2E8B57]/80"
            : "text-[#C0392B]/80"
        }`}
      >
        {amount}
      </p>
    </div>
  );
}

function LiveUpdateCard({
  notification,
}: {
  notification: ClientNotification;
}) {
  const Icon =
    notification.notification_type?.includes(
      "card",
    )
      ? CreditCard
      : notification.notification_type?.includes(
            "transfer",
          )
        ? SendHorizontal
        : notification.notification_type?.includes(
              "donation",
            )
          ? Gift
          : Info;

  return (
    <Link
      href={
        notification.action_url ||
        "/notifications"
      }
      className="flex w-full items-center gap-3 rounded-[10px] border border-black/10 bg-[#F3F6FA] px-3 py-2 text-left shadow-sm md:min-h-[86px] md:rounded-[14px] md:bg-white md:px-4 md:py-3"
    >
      <Icon
        size={20}
        className="shrink-0 text-[#2B945D]"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-[13px] font-semibold">
            {notification.title}
          </h4>

          {!notification.read_at && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#2458E8]" />
          )}
        </div>

        <p className="truncate text-[11px] text-black/55">
          {notification.message}
        </p>
      </div>

      <ChevronDown
        size={17}
        className="shrink-0 text-black/45"
      />
    </Link>
  );
}

function AdvertCard() {
  return (
    <article className="min-w-[108px] rounded-[5px] bg-white p-2 shadow-md md:min-w-0 md:rounded-[14px] md:p-4">
      <div className="grid h-[68px] place-items-center rounded-md bg-white shadow-md md:h-[110px] md:bg-[#F6F8FA]">
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

      <p className="mt-2 text-[9px] font-semibold">
        More offers coming soon
      </p>

      <p className="mt-1 text-[8px] leading-[10px] text-black/70">
        Promotions and personalised offers will appear
        here when available.
      </p>
    </article>
  );
}

function formatKycStatus(
  status?: string,
): string {
  switch (status) {
    case "approved":
    case "verified":
      return "Verified!";

    case "submitted":
      return "KYC submitted";

    case "under_review":
      return "KYC in review";

    case "rejected":
      return "KYC needs attention";

    default:
      return "KYC pending";
  }
}