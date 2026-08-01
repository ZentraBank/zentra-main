"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { accountService } from "@/services/account.service";
import type { ClientAccount } from "@/types/account";

type SupportedCardType =
  | "virtual"
  | "physical"
  | "celebrity"
  | "cryptocurrency"
  | "official"
  | "merchant";

type CardProduct = {
  type: SupportedCardType;
  title: string;
  image: string;
  price: number;
  currency: "GBP";
  description: string;
  features: string[];
};

const cardProducts: Record<SupportedCardType, CardProduct> = {
  virtual: {
    type: "virtual",
    title: "Virtual Card",
    image: "/images/celebrity-card.png",
    price: 10,
    currency: "GBP",
    description:
      "An instantly issued virtual card for subscriptions and secure online payments.",
    features: [
      "Instant digital issuance",
      "Online payments",
      "Freeze and unfreeze controls",
      "Linked directly to your account",
    ],
  },

  celebrity: {
    type: "celebrity",
    title: "Celebrity Card",
    image: "/images/celebrity-card.png",
    price: 20,
    currency: "GBP",
    description:
      "A premium themed card with a distinctive design for personal spending.",
    features: [
      "Premium card design",
      "Online payments",
      "Freeze and unfreeze controls",
      "Linked directly to your account",
    ],
  },

  cryptocurrency: {
    type: "cryptocurrency",
    title: "Cryptocurrency Card",
    image: "/images/crypto-card.jpeg",
    price: 25,
    currency: "GBP",
    description:
      "A digital-first card designed for customers interested in cryptocurrency services.",
    features: [
      "Digital-first experience",
      "Online transactions",
      "Secure card controls",
      "Linked directly to your account",
    ],
  },

  official: {
    type: "official",
    title: "Official Card",
    image: "/images/official-card.jpeg",
    price: 30,
    currency: "GBP",
    description:
      "A formal everyday card suitable for personal and professional spending.",
    features: [
      "Premium official design",
      "Online and retail payments",
      "Freeze and unfreeze controls",
      "Linked directly to your account",
    ],
  },

  merchant: {
    type: "merchant",
    title: "Merchant Card",
    image: "/images/merchant-card.png",
    price: 40,
    currency: "GBP",
    description:
      "A business-focused card for merchant purchases and expense management.",
    features: [
      "Business-focused design",
      "Merchant payments",
      "Expense management",
      "Linked directly to your account",
    ],
  },

  physical: {
    type: "physical",
    title: "Physical Card",
    image: "/images/love-card.png",
    price: 35,
    currency: "GBP",
    description:
      "A physical payment card for retail, contactless and ATM transactions.",
    features: [
      "Physical card issuance",
      "Contactless payments",
      "ATM access",
      "Freeze and unfreeze controls",
    ],
  },
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatAccountBalance = (
  amount: string | number,
  currency: string,
) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function CardProductReviewPage() {
  const params = useParams<{ cardType: string }>();
  const router = useRouter();

  const cardType = params.cardType?.toLowerCase() as SupportedCardType;
  const product = cardProducts[cardType];

  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await accountService.listMine();

        const activeAccounts = result.filter(
          (account) => account.status === "active",
        );

        setAccounts(activeAccounts);

        if (activeAccounts.length > 0) {
          setSelectedAccountId(activeAccounts[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your accounts.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAccounts();
  }, []);

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (account) => account.id === selectedAccountId,
      ) ?? null,
    [accounts, selectedAccountId],
  );

  const continueToPayment = () => {
    if (!product) {
      setError("The selected card type is not supported.");
      return;
    }

    if (!selectedAccountId) {
      setError("Select an account to link to this card.");
      return;
    }

    setContinuing(true);

    const query = new URLSearchParams({
      cardType: product.type,
      accountId: selectedAccountId,
    });

    router.push(
      `/cards/purchase-crypto?${query.toString()}`,
    );
  };

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#E7EBF0] px-5">
        <section className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-sm">
          <CreditCard
            size={38}
            className="mx-auto text-[#2458E8]"
          />

          <h1 className="mt-4 text-xl font-black">
            Card not found
          </h1>

          <p className="mt-2 text-sm text-black/50">
            The selected card type is not available.
          </p>

          <Link
            href="/cards/cards-purchase"
            className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-[#2458E8] font-bold text-white"
          >
            Return to card catalogue
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E7EBF0] text-[#252525]">
      <section className="mx-auto max-w-[430px] px-4 pb-28 pt-12 lg:max-w-[1180px] lg:px-8 lg:py-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href="/cards/cards-purchase"
            className="absolute left-0 text-black/60 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:shadow-sm"
          >
            <ArrowLeft size={21} />
          </Link>

          <div className="text-center lg:text-left">
            <h1 className="font-heading text-[18px] font-bold lg:text-[26px]">
              Review your card
            </h1>

            <p className="mt-1 hidden text-sm text-black/50 lg:block">
              Confirm your card and linked account.
            </p>
          </div>

          <div className="hidden w-11 lg:block" />
        </header>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <article className="overflow-hidden rounded-[30px] bg-white shadow-sm lg:col-span-7">
            <div className="relative h-[230px] lg:h-[390px]">
              <Image
                src={product.image}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white lg:p-8">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                  {product.type}
                </span>

                <h2 className="mt-3 text-[28px] font-black lg:text-[44px]">
                  {product.title}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 lg:text-base">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between rounded-[20px] bg-[#F5F8FC] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/40">
                    Card price
                  </p>

                  <p className="mt-1 text-[28px] font-black text-[#2458E8]">
                    {formatMoney(
                      product.price,
                      product.currency,
                    )}
                  </p>
                </div>

                <CreditCard
                  size={34}
                  className="text-[#2458E8]"
                />
              </div>

              <h3 className="mt-7 text-lg font-black">
                Included features
              </h3>

              <ul className="mt-4 space-y-3">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-black/60"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-50 text-green-600">
                      <CheckCircle2 size={15} />
                    </span>

                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside className="lg:col-span-5">
            <section className="rounded-[30px] bg-white p-6 shadow-sm lg:sticky lg:top-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E8F0FF] text-[#2458E8]">
                  <Wallet size={21} />
                </span>

                <div>
                  <h2 className="font-black">
                    Link an account
                  </h2>

                  <p className="text-xs text-black/45">
                    Choose the account this card will use.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid min-h-[220px] place-items-center">
                  <Loader2 className="animate-spin text-[#2458E8]" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="mt-6 rounded-[20px] bg-[#F7FAFC] p-5 text-center">
                  <p className="text-sm font-semibold">
                    No active account is available.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-black/45">
                    You need an active account before creating a card.
                  </p>

                  <Link
                    href="/wallet"
                    className="mt-4 block font-bold text-[#2458E8]"
                  >
                    View accounts
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-6 space-y-3">
                    {accounts.map((account) => {
                      const selected =
                        account.id === selectedAccountId;

                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() =>
                            setSelectedAccountId(account.id)
                          }
                          className={`w-full rounded-[20px] border p-4 text-left transition ${
                            selected
                              ? "border-[#2458E8] bg-[#EEF4FF]"
                              : "border-black/5 bg-[#F8FAFC]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold">
                                {account.account_name}
                              </p>

                              <p className="mt-1 text-xs text-black/45">
                                {account.account_number}
                              </p>
                            </div>

                            <span
                              className={`grid h-5 w-5 place-items-center rounded-full border ${
                                selected
                                  ? "border-[#2458E8] bg-[#2458E8] text-white"
                                  : "border-black/20"
                              }`}
                            >
                              {selected && (
                                <CheckCircle2 size={13} />
                              )}
                            </span>
                          </div>

                          <p className="mt-4 text-lg font-black text-[#2458E8]">
                            {formatAccountBalance(
                              account.balance,
                              account.currency,
                            )}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {selectedAccount && (
                    <div className="mt-5 rounded-[18px] bg-[#F7FAFC] px-4 py-3 text-xs text-black/50">
                      This card will be linked to account ending in{" "}
                      <strong className="text-black/75">
                        {selectedAccount.account_number.slice(-4)}
                      </strong>
                      .
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={continueToPayment}
                    disabled={
                      continuing || !selectedAccountId
                    }
                    className="mt-6 flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] bg-[#2458E8] font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {continuing ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <>
                        Continue —{" "}
                        {formatMoney(
                          product.price,
                          product.currency,
                        )}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </>
              )}
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}