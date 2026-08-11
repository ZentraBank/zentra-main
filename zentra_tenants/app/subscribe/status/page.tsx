/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  getLatestPaymentProof,
  PaymentProof,
} from "@/lib/paymentProofStore";

export default function SubscriptionStatusPage() {
  const [proof, setProof] = useState<PaymentProof | null>(null);

  useEffect(() => {
    setProof(getLatestPaymentProof());
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-5 text-white">
      <div className="mx-auto max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link href="/subscribe" className="absolute left-0">
            <ArrowLeft size={20} />
          </Link>

          <h1 className="text-[14px] font-bold">Subscription Status</h1>
        </header>

        {!proof && (
          <section className="mt-10 rounded-3xl bg-white p-6 text-center text-black">
            <Clock className="mx-auto text-blue-700" size={46} />

            <h2 className="mt-4 text-[22px] font-black">
              No subscription request
            </h2>

            <p className="mt-2 text-[13px] font-semibold text-black/60">
              You have not uploaded any payment proof yet.
            </p>

            <Link
              href="/subscribe"
              className="mt-6 flex h-[43px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
            >
              Choose Subscription
            </Link>
          </section>
        )}

        {proof && (
          <section className="mt-10 rounded-3xl bg-white p-6 text-center text-black">
            {proof.status === "pending" && (
              <Clock className="mx-auto text-yellow-600" size={50} />
            )}

            {proof.status === "approved" && (
              <CheckCircle className="mx-auto text-green-700" size={50} />
            )}

            {proof.status === "rejected" && (
              <XCircle className="mx-auto text-red-700" size={50} />
            )}

            <h2 className="mt-4 text-[24px] font-black capitalize">
              {proof.status === "pending" && "Awaiting Confirmation"}
              {proof.status === "approved" && "Subscription Active"}
              {proof.status === "rejected" && "Payment Rejected"}
            </h2>

            <div className="mt-5 rounded-2xl bg-[#F4F6FA] px-4 py-4 text-left">
              <p className="text-[13px] font-bold">
                Plan: <span className="text-black/60">{proof.plan}</span>
              </p>

              <p className="mt-2 text-[13px] font-bold">
                Amount: <span className="text-black/60">{proof.amount}</span>
              </p>

              <p className="mt-2 text-[13px] font-bold">
                Status:{" "}
                <span className="capitalize text-black/60">
                  {proof.status}
                </span>
              </p>

              {proof.status === "approved" && (
                <p className="mt-2 text-[13px] font-bold">
                  Validity:{" "}
                  <span className="text-black/60">Active for 1 month</span>
                </p>
              )}

              {proof.status === "rejected" && (
                <p className="mt-2 text-[13px] font-bold">
                  Reason:{" "}
                  <span className="text-black/60">
                    {proof.rejectionReason}
                  </span>
                </p>
              )}
            </div>

            {proof.status === "pending" && (
              <Link
                href="/support"
                className="mt-6 flex h-[43px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
              >
                Chat Help Line
              </Link>
            )}

            {proof.status === "rejected" && (
              <Link
                href="/subscribe"
                className="mt-6 flex h-[43px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
              >
                Upload New Proof
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}