"use client";

import Image from "next/image";
import Link from "next/link";

import type {
  AccountActivity,
} from "@/services/account.service";

import {
  kycService,
} from "@/services/kyc.service";

import type {
  KycProfile,
} from "@/types/kyc";

import {
  useMemo,
  useState,
  useEffect,
} from "react";

import {
  Bell,
  Settings,
  Eye,
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
  Wallet,
  Plus,
} from "lucide-react";

import BottomNav from "@/components/layout/BottomNav";

import {
  useAuthStore,
} from "@/store/auth.store";

import {
  useClientOverview,
} from "@/hooks/use-client-overview";

import {
  accountService,
} from "@/services/account.service";

import {
  getApiErrorMessage,
} from "@/lib/api-client";

import {
  formatMoney,
} from "@/lib/formatters";

import type {
  ClientNotification,
} from "@/types/notification";

const quickActions = [
  {
    title: "chat",
    icon: "/images/airtime-3.png",
    href: "/chat",
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

type AccountType =
  | "wallet"
  | "savings"
  | "current";

type AccountFormState = {
  accountName: string;
  accountType: AccountType;
  currency: string;
};

export default function DashboardPage() {
  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState("");

  const [
    kyc,
    setKyc,
  ] =
    useState<KycProfile | null>(
      null,
    );

  const [
    kycLoading,
    setKycLoading,
  ] = useState(true);

  const [
    showMoreServices,
    setShowMoreServices,
  ] = useState(false);

  const [
    openAccountModal,
    setOpenAccountModal,
  ] = useState(false);

  const [
    creatingAccount,
    setCreatingAccount,
  ] = useState(false);

  const [
    accountError,
    setAccountError,
  ] = useState("");

  const [
    accountSuccess,
    setAccountSuccess,
  ] = useState("");

  const [
    accountForm,
    setAccountForm,
  ] =
    useState<AccountFormState>({
      accountName: "",
      accountType: "savings",
      currency: "GBP",
    });

  const [
    showBalance,
    setShowBalance,
  ] = useState(true);

  const user =
    useAuthStore(
      (state) => state.user,
    );

  const {
    accounts,
    activity,
    cards,
    notifications,
    unreadNotificationCount,
    cardPurchaseRequests,
    isLoading,
    error,
    reload,
  } = useClientOverview();

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            selectedAccountId,
        ) ||
        accounts[0] ||
        null,
      [
        accounts,
        selectedAccountId,
      ],
    );

  const selectedBalance =
    selectedAccount
      ? Number(
          selectedAccount.balance ||
            0,
        )
      : 0;

  const selectedCurrency =
    selectedAccount?.currency ||
    "GBP";

  const displayName =
    user?.full_name ||
    user?.email ||
    "ZentraBank client";

  const pendingCardRequest =
    cardPurchaseRequests.find(
      (request) =>
        request.status ===
        "pending",
    );

  const cardSummary =
    useMemo(() => {
      if (cards.length > 0) {
        const activeCount =
          cards.filter(
            (card) =>
              card.status ===
              "active",
          ).length;

        const frozenCount =
          cards.filter(
            (card) =>
              card.status ===
              "frozen",
          ).length;

        return {
          title: `${
            cards.length
          } issued card${
            cards.length === 1
              ? ""
              : "s"
          }`,

          description:
            frozenCount > 0
              ? `${activeCount} active · ${frozenCount} frozen`
              : `${activeCount} active`,

          href:
            "/cards/active-cards",
        };
      }

      if (pendingCardRequest) {
        return {
          title:
            "Card request pending",

          description: `${pendingCardRequest.card_type.replaceAll(
            "_",
            " ",
          )} card awaiting verification`,

          href:
            `/cards/purchase-status/${pendingCardRequest.id}`,
        };
      }

      return {
        title:
          "No issued cards",

        description:
          "Create your first ZentraBank card",

        href:
          "/cards/cards-purchase",
      };
    }, [
      cards,
      pendingCardRequest,
    ]);

  const openCreateAccount =
    () => {
      setAccountError("");
      setAccountSuccess("");

      setAccountForm(
        (current) => ({
          ...current,

          accountName:
            current.accountName ||
            `${
              user?.full_name ||
              "My"
            } Account`,
        }),
      );

      setOpenAccountModal(true);
    };

  const closeCreateAccount =
    () => {
      if (creatingAccount) {
        return;
      }

      setOpenAccountModal(false);
      setAccountError("");
    };

  const handleCreateAccount =
    async () => {
      const accountName =
        accountForm.accountName.trim();

      if (
        accountName.length < 2
      ) {
        setAccountError(
          "Account name must be at least 2 characters.",
        );

        return;
      }

      setCreatingAccount(true);
      setAccountError("");
      setAccountSuccess("");

      try {
        await accountService.createMine(
          {
            accountName,
            accountType:
              accountForm.accountType,
            currency:
              accountForm.currency,
          },
        );

        setAccountForm({
          accountName: "",
          accountType: "savings",
          currency: "GBP",
        });

        setOpenAccountModal(false);

        setAccountSuccess(
          "Your account was created successfully.",
        );

        await reload();
      } catch (
        requestError
      ) {
        setAccountError(
          getApiErrorMessage(
            requestError,
            "Unable to create account.",
          ),
        );
      } finally {
        setCreatingAccount(false);
      }
    };

  useEffect(() => {
    if (!accounts.length) {
      return;
    }

    const stillExists =
      accounts.some(
        (account) =>
          account.id ===
          selectedAccountId,
      );

    if (
      !selectedAccountId ||
      !stillExists
    ) {
      setSelectedAccountId(
        accounts[0].id,
      );
    }
  }, [
    accounts,
    selectedAccountId,
  ]);

  useEffect(() => {
    let active = true;

    const loadKyc =
      async () => {
        try {
          const result =
            await kycService.getMine();

          if (!active) {
            return;
          }

          setKyc(result);
        } catch (error) {
          console.error(
            "Unable to load KYC status:",
            error,
          );
        } finally {
          if (active) {
            setKycLoading(false);
          }
        }
      };

    void loadKyc();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#E7EBF0] pb-[92px] text-[#333] md:pb-10">
      {/* CHANGED: wider desktop dashboard */}
      <section className="mx-auto w-full max-w-[390px] px-5 pt-12 md:max-w-[1280px] md:px-8 md:pt-8 xl:max-w-[1500px]">
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
                <span className="capitalize text-[#333333]">
                  {selectedAccount
                    ?.account_type ||
                    "Client"}
                </span>{" "}

                <span className="text-[#2B945D]">
                  {kycLoading
                    ? "Checking KYC..."
                    : formatKycStatus(
                        kyc?.status,
                      )}
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

              {unreadNotificationCount >
                0 && (
                <span className="absolute -right-2 -top-2 grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                  {unreadNotificationCount >
                  99
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

        {accountSuccess ? (
          <div className="mt-4 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-700">
            {accountSuccess}
          </div>
        ) : null}

        <section className="mt-4 rounded-[9px] bg-[#2F9158] px-3 py-3 text-white shadow-sm md:mt-6 md:rounded-[18px] md:px-7 md:py-6 md:shadow-md">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setShowBalance(
                  !showBalance,
                )
              }
              className="flex items-center gap-2 text-[12px] transition-opacity hover:opacity-80 md:text-[14px]"
            >
              <span>Balance</span>

              {showBalance ? (
                <Eye size={16} />
              ) : (
                <EyeOff size={16} />
              )}
            </button>

            {accounts.length >
              0 && (
              <button
                type="button"
                onClick={
                  openCreateAccount
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-white/25 md:text-[12px]"
              >
                <Plus size={14} />
                Add account
              </button>
            )}
          </div>

          <div className="mt-2 flex items-end justify-between">
            <h2 className="text-[30px] font-semibold tracking-wide md:text-[42px]">
              {isLoading
                ? "Loading…"
                : showBalance
                  ? formatMoney(
                      selectedBalance,
                      selectedCurrency,
                    )
                  : "*********"}
            </h2>
          </div>

          {accounts.length >
            1 && (
            <div className="mt-3">
              <label className="mb-1 block text-[10px] text-white/60 md:text-[12px]">
                Select account
              </label>

              <div className="relative">
                <select
                  title="Select account"
                  value={
                    selectedAccount?.id ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setSelectedAccountId(
                      event.target
                        .value,
                    )
                  }
                  className="h-[38px] w-full appearance-none rounded-[8px] border border-white/20 bg-white/15 px-3 pr-9 text-[11px] font-semibold text-white outline-none backdrop-blur md:max-w-[320px] md:text-[13px]"
                >
                  {accounts.map(
                    (account) => (
                      <option
                        key={
                          account.id
                        }
                        value={
                          account.id
                        }
                        className="text-black"
                      >
                        {
                          account.account_name
                        }{" "}
                        ·{" "}
                        {
                          account.account_type
                        }{" "}
                        ·{" "}
                        {
                          account.account_number
                        }
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80"
                />
              </div>
            </div>
          )}

          {!isLoading &&
          selectedAccount ? (
            <div className="mt-3 flex items-end justify-between gap-4 border-t border-white/15 pt-3">
              <div>
                <p className="text-[10px] text-white/60 md:text-[12px]">
                  Account number
                </p>

                <p className="mt-0.5 text-[13px] font-semibold tracking-[0.08em] text-white md:text-[15px]">
                  {
                    selectedAccount.account_number
                  }
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-white/60 md:text-[12px]">
                  Account type
                </p>

                <p className="mt-0.5 text-[12px] font-semibold capitalize text-white md:text-[14px]">
                  {
                    selectedAccount.account_type
                  }
                </p>
              </div>
            </div>
          ) : null}

          {!isLoading &&
          accounts.length >
            0 ? (
            <p className="mt-2 text-[11px] text-white/70 md:text-[13px]">
              {accounts.length} account
              {accounts.length ===
              1
                ? ""
                : "s"}{" "}
              connected
            </p>
          ) : null}
        </section>

        {!isLoading &&
        accounts.length ===
          0 ? (
          <section className="mt-4 rounded-[10px] border border-[#2458E8]/20 bg-white p-4 shadow-sm md:mt-6 md:flex md:items-center md:justify-between md:rounded-[18px] md:px-6 md:py-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#E8F0FF] text-[#2458E8]">
                <Wallet size={21} />
              </span>

              <div>
                <p className="text-[14px] font-bold text-[#222] md:text-[17px]">
                  Open your first
                  account
                </p>

                <p className="mt-1 max-w-[500px] text-[12px] leading-5 text-black/50 md:text-[14px]">
                  Create a wallet,
                  savings or current
                  account to start
                  using your
                  ZentraBank banking
                  features.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                openCreateAccount
              }
              className="mt-4 h-[42px] w-full rounded-[10px] bg-[#2458E8] px-5 text-[13px] font-bold text-white transition hover:bg-[#1d49c9] md:mt-0 md:w-auto"
            >
              Open Account
            </button>
          </section>
        ) : null}

        <section className="mt-4 grid grid-cols-4 gap-4 rounded-[8px] md:mt-6 md:grid-cols-4 md:gap-5">
          {quickActions.map(
            (item) => (
              <SmallActionCard
                key={
                  item.title
                }
                title={
                  item.title
                }
                icon={
                  item.icon
                }
                href={
                  item.href
                }
              />
            ),
          )}
        </section>

        <div className="mt-4 flex items-center justify-between md:mt-7">
          <h3 className="text-[13px] font-bold tracking-wide md:text-[16px]">
            Services
          </h3>

          <button
            type="button"
            onClick={() =>
              setShowMoreServices(
                true,
              )
            }
            className="text-[12px] text-black/50 md:text-[13px]"
          >
            View all
          </button>
        </div>

        <section className="mt-3 grid grid-cols-3 gap-4 font-lato md:grid-cols-6 md:gap-5">
          {services.map(
            (item) => (
              <DashboardServiceCard
                key={
                  item.title
                }
                title={
                  item.title
                }
                icon={
                  item.icon
                }
                href={
                  item.href
                }
              />
            ),
          )}
        </section>

        <section className="mt-4 rounded-[10px] bg-white px-3 py-3 shadow-sm md:mt-6 md:rounded-[16px] md:px-5 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#E8F0FF] text-[#2458E8]">
                <CreditCard
                  size={19}
                />
              </span>

              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-black/40">
                  Cards
                </p>

                <p className="truncate text-[14px] font-bold">
                  {
                    cardSummary.title
                  }
                </p>

                <p className="truncate text-[11px] text-black/45">
                  {
                    cardSummary.description
                  }
                </p>
              </div>
            </div>

            <Link
              href={
                cardSummary.href
              }
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
                onClick={() =>
                  void reload()
                }
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : isLoading ? (
            <div className="rounded-[7px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              Loading recent
              activity…
            </div>
          ) : activity.length ===
            0 ? (
            <div className="rounded-[7px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              No transfers yet.
              Your recent activity
              will appear here.
            </div>
          ) : (
            activity
              .slice(0, 3)
              .map(
                (
                  activity,
                ) => (
                  <LiveActivityCard
                    key={
                      activity.id
                    }
                    activity={
                      activity
                    }
                  />
                ),
              )
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
                Register to Redeem
                Funds!
              </h2>

              <p className="mt-2 font-lato text-[12px] text-black/55 md:text-[14px]">
                Get redemption code
                for gifts, donations
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
          ) : notifications.length ===
            0 ? (
            <div className="rounded-[10px] bg-white/60 px-3 py-4 text-center text-[12px] text-black/50">
              No recent updates.
            </div>
          ) : (
            notifications
              .slice(0, 3)
              .map(
                (
                  notification,
                ) => (
                  <LiveUpdateCard
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                  />
                ),
              )
          )}
        </section>

        {/* CHANGED: slightly larger desktop chart card */}
        <section className="mt-8 md:mt-10 md:rounded-[18px] md:bg-white/60 md:p-6 md:shadow-sm">
          <svg
            viewBox="0 0 330 150"

            // CHANGED:
            // expands chart vertically on desktop
            // without duplicating the chart.
            preserveAspectRatio="none"
            className="h-[150px] w-full md:h-[300px] lg:h-[360px]"
          >
            {[
              0,
              1,
              2,
              3,
              4,
              5,
              6,
            ].map(
              (y) => (
                <line
                  key={y}
                  x1="30"
                  x2="320"
                  y1={
                    20 +
                    y * 20
                  }
                  y2={
                    20 +
                    y * 20
                  }
                  stroke="#cbd2da"
                  strokeWidth="1"
                />
              ),
            )}

            {[
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
            ].map(
              (x) => (
                <line
                  key={x}
                  x1={
                    30 +
                    x * 32
                  }
                  x2={
                    30 +
                    x * 32
                  }
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
            ].map(
              (
                points,
                index,
              ) => (
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
              ),
            )}
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

              <ChevronRight
                size={18}
              />
            </div>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-3 scrollbar-hide md:grid md:grid-cols-4 md:gap-5 md:overflow-visible">
            {[1, 2, 3, 4].map(
              (item) => (
                <AdvertCard
                  key={item}
                />
              ),
            )}
          </div>
        </section>
      </section>

      {showMoreServices && (
        <MoreServicesOverlay
          onClose={() =>
            setShowMoreServices(
              false,
            )
          }
        />
      )}

      {openAccountModal && (
        <CreateAccountModal
          form={
            accountForm
          }
          setForm={
            setAccountForm
          }
          error={
            accountError
          }
          creating={
            creatingAccount
          }
          onClose={
            closeCreateAccount
          }
          onCreate={() =>
            void handleCreateAccount()
          }
        />
      )}

      <div className="md:hidden">
        <BottomNav />
      </div>
    </main>
  );
}

function CreateAccountModal({
  form,
  setForm,
  error,
  creating,
  onClose,
  onCreate,
}: {
  form: AccountFormState;

  setForm:
    React.Dispatch<
      React.SetStateAction<AccountFormState>
    >;

  error: string;
  creating: boolean;

  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-5 backdrop-blur-sm">
      <section className="relative w-full max-w-[380px] rounded-[22px] bg-white p-5 shadow-2xl">
        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            creating
          }
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#E7EBF0] disabled:opacity-50"
          aria-label="Close account form"
        >
          <X size={17} />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#E8F0FF] text-[#2458E8]">
            <Wallet size={21} />
          </span>

          <div>
            <h2 className="text-[20px] font-black text-[#222]">
              Open Account
            </h2>

            <p className="mt-0.5 text-[12px] text-black/50">
              Create an account
              under your
              ZentraBank profile.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-black/55">
              Account name
            </label>

            <input
              type="text"
              value={
                form.accountName
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    accountName:
                      event.target
                        .value,
                  }),
                )
              }
              placeholder="e.g. Personal Savings"
              className="mt-1 h-[42px] w-full rounded-[10px] border border-gray-200 px-3 text-[13px] outline-none transition focus:border-[#2458E8]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-black/55">
              Account type
            </label>

            <select
              title="Account type"
              value={
                form.accountType
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    accountType:
                      event.target
                        .value as AccountType,
                  }),
                )
              }
              className="mt-1 h-[42px] w-full rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] outline-none transition focus:border-[#2458E8]"
            >
              <option value="wallet">
                Wallet
              </option>

              <option value="savings">
                Savings
              </option>

              <option value="current">
                Current
              </option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-black/55">
              Currency
            </label>

            <select
              title="Currency"
              value={
                form.currency
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    currency:
                      event.target
                        .value,
                  }),
                )
              }
              className="mt-1 h-[42px] w-full rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] outline-none transition focus:border-[#2458E8]"
            >
              <option value="GBP">
                GBP — British
                Pound
              </option>

              <option value="USD">
                USD — US Dollar
              </option>

              <option value="EUR">
                EUR — Euro
              </option>

              <option value="NGN">
                NGN — Nigerian
                Naira
              </option>
            </select>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-[10px] bg-red-50 px-3 py-2 text-[12px] text-red-700"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={
              onCreate
            }
            disabled={
              creating
            }
            className="h-[46px] w-full rounded-[12px] bg-[#2458E8] text-[14px] font-bold text-white transition hover:bg-[#1d49c9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating
              ? "Creating account..."
              : "Create Account"}
          </button>
        </div>
      </section>
    </div>
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
            onClick={
              onClose
            }
            className="grid h-8 w-8 place-items-center rounded-full bg-white shadow"
            aria-label="Close services"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 md:grid-cols-6 md:gap-5">
          {allServices.map(
            (item) => (
              <MoreServiceCard
                key={
                  item.title
                }
                title={
                  item.title
                }
                icon={
                  item.icon
                }
                href={
                  item.href
                }
                className={
                  item.className
                }
              />
            ),
          )}
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

function LiveActivityCard({
  activity,
}: {
  activity: AccountActivity;
}) {
  const isCredit =
    activity.entry_type ===
    "credit";

  const title =
    activity.transfer_id
      ? isCredit
        ? "Incoming transfer"
        : "Transfer sent"
      : isCredit
        ? "Incoming payment"
        : "Account debit";

  return (
    <TransactionCard
      type={
        isCredit
          ? "in"
          : "out"
      }
      name={
        activity.description ||
        title
      }
      bank={
        activity.account_name ||
        activity.account_number
      }
      amount={`${
        isCredit
          ? "+"
          : "-"
      }${formatMoney(
        activity.amount,
        activity.currency,
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
  const isIn =
    type === "in";

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
    notification.notification_type
      ?.includes("card")
      ? CreditCard
      : notification.notification_type
            ?.includes("transfer")
        ? SendHorizontal
        : notification.notification_type
              ?.includes("donation")
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
            {
              notification.title
            }
          </h4>

          {!notification
            .read_at && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#2458E8]" />
          )}
        </div>

        <p className="truncate text-[11px] text-black/55">
          {
            notification.message
          }
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
        More offers coming
        soon
      </p>

      <p className="mt-1 text-[8px] leading-[10px] text-black/70">
        Promotions and
        personalised offers
        will appear here when
        available.
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