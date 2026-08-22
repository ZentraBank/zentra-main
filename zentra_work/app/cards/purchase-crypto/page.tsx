"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { accountService } from "@/services/account.service";
import { cardService } from "@/services/card.service";
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
  price: number;
  currency: "GBP";
  image: string;
};

const cardProducts: Record<SupportedCardType, CardProduct> = {
  virtual: {
    type: "virtual",
    title: "Virtual Card",
    price: 10,
    currency: "GBP",
    image: "/images/celebrity-card.png",
  },
  celebrity: {
    type: "celebrity",
    title: "Celebrity Card",
    price: 20,
    currency: "GBP",
    image: "/images/celebrity-card.png",
  },
  cryptocurrency: {
    type: "cryptocurrency",
    title: "Cryptocurrency Card",
    price: 25,
    currency: "GBP",
    image: "/images/crypto-card.jpeg",
  },
  official: {
    type: "official",
    title: "Official Card",
    price: 30,
    currency: "GBP",
    image: "/images/official-card.jpeg",
  },
  physical: {
    type: "physical",
    title: "Physical Card",
    price: 35,
    currency: "GBP",
    image: "/images/love-card.png",
  },
  merchant: {
    type: "merchant",
    title: "Merchant Card",
    price: 40,
    currency: "GBP",
    image: "/images/merchant-card.png",
  },
};

const walletAddress =
  process.env.NEXT_PUBLIC_CARD_CRYPTO_WALLET_ADDRESS ??
  "shaoDLKJSIjLIDJ38793q9xn";

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export default function CryptoPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cardType = searchParams
    .get("cardType")
    ?.toLowerCase() as SupportedCardType | undefined;

  const accountId = searchParams.get("accountId") ?? "";

  const product = cardType ? cardProducts[cardType] : undefined;

  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const backHref = useMemo(() => {
    if (!product) return "/cards/cards-purchase";

    return `/cards/cards-purchase/${product.type}`;
  }, [product]);

  useEffect(() => {
    const loadAccount = async () => {
      if (!accountId) {
        setError("No linked account was selected.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await accountService.getMine(accountId);
        setAccount(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the selected account.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAccount();
  }, [accountId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the wallet address.");
    }
  };

 const submitForVerification = async () => {
  if (!product) {
    setError("The selected card type is invalid.");
    return;
  }

  if (!accountId || !account) {
    setError("A valid linked account is required.");
    return;
  }

  if (!paymentReference.trim()) {
    setError(
      "Enter your transaction hash or payment reference before submitting."
    );
    return;
  }

  setSubmitting(true);
  setError("");

  try {
    const request =
      await cardService.submitPurchaseRequest({
        accountId,
        cardType: product.type,
        cardBrand: "Zentra",
        paymentMethod: "cryptocurrency",
        paymentReference: paymentReference.trim(),
      });

    router.replace(
      `/cards/purchase-status/${request.id}`
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to submit your card request."
    );
  } finally {
    setSubmitting(false);
  }
};

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#E7EBF0] px-5">
        <section className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black">Invalid card selection</h1>

          <p className="mt-2 text-sm text-black/50">
            Return to the catalogue and select a supported card.
          </p>

          <Link
            href="/cards/cards-purchase"
            className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-[#2458E8] font-bold text-white"
          >
            View card catalogue
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#2F69E8] text-white lg:bg-[#E7EBF0] lg:text-[#252525]">
      <section className="mx-auto max-w-[430px] px-4 pb-12 pt-12 lg:max-w-[1180px] lg:px-8 lg:py-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href={backHref}
            className="absolute left-0 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:text-[#252525] lg:shadow-sm"
          >
            <ArrowLeft size={22} />
          </Link>

          <h1 className="font-heading text-[16px] font-bold tracking-[0.15em] lg:text-[24px] lg:tracking-normal">
            Cards
          </h1>

          <div className="hidden w-11 lg:block" />
        </header>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-6">
          <section className="relative mt-8 min-h-[230px] overflow-hidden lg:col-span-7 lg:mt-0 lg:min-h-[540px] lg:rounded-[32px] lg:bg-[#2F69E8] lg:p-10 lg:shadow-2xl">
            <div className="relative z-10 max-w-[240px] lg:max-w-[520px]">
              <h2 className="font-heading text-[32px] font-black leading-[38px] lg:text-[64px] lg:leading-[66px]">
                Purchase with cryptocurrency
              </h2>

              <p className="mt-6 text-[14px] font-semibold leading-6 lg:text-[18px] lg:leading-8">
                Pay for your {product.title.toLowerCase()} using the wallet
                address provided. Your request will remain pending until a
                tenant administrator verifies the payment.
              </p>
            </div>

            <div className="absolute right-[-10px] top-4 h-[190px] w-[150px] lg:bottom-8 lg:right-8 lg:top-auto lg:h-[300px] lg:w-[260px]">
              <Image
                src="/images/crypto-payment.png"
                alt="Crypto payment illustration"
                fill
                priority
                className="object-contain"
              />
            </div>
          </section>

          <aside className="mt-5 space-y-5 lg:col-span-5 lg:mt-0">
            <section className="rounded-[18px] bg-white p-5 text-[#252525] shadow-lg lg:rounded-[28px] lg:p-6 lg:shadow-sm">
              <h2 className="text-lg font-black">Payment summary</h2>

              <div className="mt-5 space-y-4">
                <SummaryRow
                  label="Purchase amount"
                  value={formatMoney(product.price, product.currency)}
                  highlighted
                />

                <SummaryRow label="Card type" value={product.title} />

                <SummaryRow
                  label="Payment method"
                  value="Cryptocurrency"
                />

                <SummaryRow
                  label="Approval status"
                  value="Tenant-admin verification"
                />

                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-black/50">
                    <Loader2 size={16} className="animate-spin" />
                    Loading linked account...
                  </div>
                ) : account ? (
                  <SummaryRow
                    label="Linked account"
                    value={`•••• ${account.account_number.slice(-4)}`}
                  />
                ) : null}
              </div>
            </section>

            <section className="rounded-[18px] border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-sm lg:rounded-[28px] lg:border-none lg:bg-white lg:p-6 lg:text-[#252525] lg:shadow-sm">
              <h3 className="text-[16px] font-black lg:text-[22px]">
                Crypto wallet address
              </h3>

              <div className="mt-4 rounded-[16px] bg-white p-4 text-black lg:bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex w-full items-center justify-between rounded-full border border-gray-300 bg-[#F6F6F6] px-4 py-3 transition hover:bg-[#EFEFEF]"
                >
                  <span className="truncate text-[14px] font-medium">
                    {walletAddress}
                  </span>

                  {copied ? (
                    <Check size={20} className="text-green-600" />
                  ) : (
                    <Copy size={20} className="text-[#2F69E8]" />
                  )}
                </button>

                {copied && (
                  <p className="mt-2 text-center text-[13px] font-medium text-green-600">
                    Wallet address copied successfully
                  </p>
                )}

                <p className="mt-4 text-[14px] font-semibold">
                  TON Blockchain
                </p>

                <ul className="mt-6 list-disc space-y-3 pl-5 text-[12px] leading-5 text-[#666666]">
                  <li>Use only the TON network for this payment.</li>
                  <li>
                    Send exactly{" "}
                    <strong>
                      {formatMoney(product.price, product.currency)}
                    </strong>
                    .
                  </li>
                  <li>
                    Your card will not become active until the tenant
                    administrator approves the request.
                  </li>
                </ul>

                <a
                  href="https://ton.org"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex h-[44px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#1D4ED8] text-[13px] font-bold text-white shadow-md"
                >
                  Open TON wallet
                  <ExternalLink size={17} />
                </a>
              </div>
            </section>

            <section className="rounded-[18px] bg-white p-5 text-[#252525] shadow-lg lg:rounded-[28px] lg:p-6 lg:shadow-sm">
              <label
                htmlFor="paymentReference"
                className="text-sm font-bold"
              >
                Payment reference
               
              </label>

              <input
                id="paymentReference"
                value={paymentReference}
                onChange={(event) =>
                  setPaymentReference(event.target.value)
                }
                placeholder="Enter transaction hash or payment reference"
                className="mt-3 h-12 w-full rounded-[14px] border border-black/10 bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#2458E8]"
              />

              <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#EEF4FF] p-4 text-xs leading-5 text-[#2458E8]">
                <ShieldCheck size={19} className="mt-0.5 shrink-0" />

                <p>
                  Submitting this request does not issue the card immediately.
                  A tenant administrator must verify and approve the payment.
                </p>
              </div>

              <button
                type="button"
                onClick={submitForVerification}
                disabled={
                  submitting ||
                  loading ||
                  !account ||
                  !paymentReference.trim()
                }
                className="mt-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#1D4ED8] text-[13px] font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Submitting request...
                  </>
                ) : (
                  "Submit payment for verification"
                )}
              </button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[14px] font-semibold text-black/55">
        {label}
      </span>

      <span
        className={`text-right text-[14px] font-black ${
          highlighted ? "text-[#2F69E8]" : "text-[#252525]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}