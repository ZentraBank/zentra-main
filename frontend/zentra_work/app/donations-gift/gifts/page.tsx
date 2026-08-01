"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeft } from "lucide-react";

const giftedFund = {
  amount: "$100,000",
  status: "Gift Received!",
  sender: "Mark Parkersburg",
  accountStatus: "Unverified!",
  redemptionFee: "$700",
  date: "Sun. July 03, 2025",
  availableBalance: "$101,234.56",
  time: "03:02 PM",
  serviceCharge: "$121.95",
  transactionId: "98234723948",
  customerCare: "1-800-XXX-XXXX",
  type: "InterBank",
  authorizationCode: "009823",
  countdown: {
    days: "10",
    hours: "07",
    minutes: "00",
  },
};

export default function GiftedFundsPage() {
  const handleRedeem = () => {
    console.log("Redeem with OTP:", giftedFund);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FEF08A] text-[#454545]">
      <section className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-7 pt-12">
        <header className="relative flex items-center justify-center">
          <Link href="/donations-gift" className="absolute left-0 text-[#777]">
            <ArrowLeft size={24} />
          </Link>

          <h1 className="font-heading text-[14px] font-bold tracking-[0.13em]">
            Gifted Received
          </h1>
        </header>

        <div className="relative mt-5 flex flex-col items-center">
          <div className="flex h-[168px] w-[168px] items-center justify-center rounded-full bg-[#ffe041] shadow-[0_7px_14px_rgba(0,0,0,0.16)]">
            <Image
              src="/images/gifts.png"
              alt="Gift"
              width={58}
              height={58}
              priority
              className="object-contain"
            />
          </div>

          <Image
            src="/images/gifts-blur.png"
            alt=""
            width={150}
            height={150}
            className="pointer-events-none absolute -left-4 top-[230px] opacity-70 blur-[1px]"
          />

          <Image
            src="/images/gifts-blur-2.png"
            alt=""
            width={121}
            height={116}
            className="pointer-events-none absolute -right-4 bottom-[-480px] opacity-70 blur-[1px]"
          />

          <h2 className="mt-5 text-[35px] font-semibold tracking-[0.03em] text-[#5daa7e]">
            {giftedFund.amount}
          </h2>

          <p className="mt-1 text-[13px] font-semibold text-[#1D4ED8]">
            {giftedFund.status}
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 text-[#222]">
            <span className="text-[16px] font-black">
              {giftedFund.countdown.days}
            </span>
            <span className="-ml-2 text-[13px]">Days</span>

            <span className="text-[16px] font-black">
              {giftedFund.countdown.hours}
            </span>
            <span className="-ml-2 text-[13px]">Hrs</span>

            <span className="text-[16px] font-black">
              {giftedFund.countdown.minutes}
            </span>
            <span className="-ml-2 text-[13px]">Min</span>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[13px] font-medium text-[#777]">
              Incoming from{" "}
              <ArrowDownLeft
                size={14}
                className="ml-2 inline-block text-[#168d5a]"
              />
            </p>

            <p className="mt-1 text-[17px] font-bold text-[#555]">
              {giftedFund.sender}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Detail
            label="Current account status"
            value={giftedFund.accountStatus}
            valueClassName="font-bold text-[#1D4ED8]"
          />

          <Detail
            label="Teir-2 Redemption fee"
            value={giftedFund.redemptionFee}
            valueClassName="font-bold text-[#d85b4f]"
          />

          <Detail label="Transaction date" value={giftedFund.date} />
          <Detail label="Available Balance" value={giftedFund.availableBalance} />
          <Detail label="Transaction time" value={giftedFund.time} />
          <Detail label="Service charge" value={giftedFund.serviceCharge} />
          <Detail label="Transaction ID" value={giftedFund.transactionId} />
          <Detail label="Customer Care" value={giftedFund.customerCare} />
          <Detail label="Type" value={giftedFund.type} />
          <Detail label="Authorization Code" value={giftedFund.authorizationCode} />
        </div>

        <p className="mt-4 text-center text-[15px] font-medium text-[#555]">
          You can redeem this Gift as fast as you can
        </p>

        <p className="mt-7 text-center text-[14px] font-black text-[#444]">
          {giftedFund.redemptionFee}
        </p>

        <button
          onClick={handleRedeem}
          className="mt-2 h-[41px] w-full rounded-[10px] bg-[#1D4ED8] text-[16px] font-bold text-white shadow-md transition active:scale-[0.98]"
        >
          Redeem with OTP
        </button>
      </section>
    </main>
  );
}

function Detail({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 text-[14px]">
      <p className="shrink-0 text-[#777]">{label}</p>
      <p className={`text-right font-medium text-[#444] ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}








