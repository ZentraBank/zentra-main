"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  ArrowLeft,
  Clock,
} from "lucide-react";
import {
  getPaymentProofs,
  updatePaymentProof,
  PaymentProof,
} from "@/lib/paymentProofStore";

export default function AdminPaymentProofsPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [reason, setReason] = useState("");

  const loadProofs = () => {
    setProofs(getPaymentProofs());
  };

  useEffect(() => {
    loadProofs();
  }, []);

  const approveProof = (id: string) => {
    updatePaymentProof(id, {
      status: "approved",
    });

    loadProofs();
  };

  const rejectProof = (id: string) => {
    updatePaymentProof(id, {
      status: "rejected",
      rejectionReason: reason || "Payment proof could not be verified.",
    });

    setReason("");
    loadProofs();
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] px-4 py-5 text-white">
      <div className="mx-auto max-w-[900px]">
        <header className="flex items-center gap-4">
          <Link href="/admin" className="text-white">
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-[26px] font-black">Payment Proofs</h1>
            <p className="text-[13px] text-white/60">
              Review uploaded receipts and activate subscriptions.
            </p>
          </div>
        </header>

        <section className="mt-6 space-y-4">
          {proofs.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center text-black">
              <FileText className="mx-auto text-blue-700" size={42} />
              <h2 className="mt-3 text-[18px] font-black">
                No payment proofs yet
              </h2>
              <p className="mt-1 text-[13px] text-black/60">
                Uploaded client receipts will appear here.
              </p>
            </div>
          )}

          {proofs.map((proof) => (
            <article
              key={proof.id}
              className="rounded-2xl border border-white/10 bg-white p-4 text-black shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-black">{proof.plan}</h2>
                  <p className="mt-1 text-[13px] font-bold text-black/60">
                    Amount: {proof.amount}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-black/60">
                    File: {proof.fileName}
                  </p>
                  <p className="mt-1 text-[12px] text-black/50">
                    Uploaded: {new Date(proof.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-black ${
                    proof.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : proof.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {proof.status}
                </span>
              </div>

              {proof.status === "pending" && (
                <>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason if rejecting payment..."
                    className="mt-4 min-h-[80px] w-full rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none"
                  />

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => rejectProof(proof.id)}
                      className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-red-600 text-[13px] font-bold text-white"
                    >
                      <XCircle size={17} />
                      Reject
                    </button>

                    <button
                      onClick={() => approveProof(proof.id)}
                      className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-green-600 text-[13px] font-bold text-white"
                    >
                      <CheckCircle size={17} />
                      Approve
                    </button>
                  </div>
                </>
              )}

              {proof.status === "approved" && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-3 text-green-700">
                  <CheckCircle size={18} />
                  <p className="text-[12px] font-bold">
                    Subscription approved and activated.
                  </p>
                </div>
              )}

              {proof.status === "rejected" && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-red-700">
                  <XCircle size={18} />
                  <p className="text-[12px] font-bold">
                    Rejected: {proof.rejectionReason}
                  </p>
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}