"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle,
  MessageCircle,
  Clock,
} from "lucide-react";

const plans = {
  bronze: { name: "Bronze Plan", price: "$40" },
  gold: { name: "Gold Plan", price: "$80" },
  diamond: { name: "Diamond Plan", price: "$120" },
};

export default function PaymentProofPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <PaymentProofContent />
    </Suspense>
  );
}

function PaymentProofContent() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan")?.toLowerCase() || "bronze";

  const currentPlan =
    plans[selectedPlan as keyof typeof plans] || plans.bronze;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];

  if (!file) return;

  setProofFile(file);
  setSubmitted(true);
};

  const handleSubmit = () => {
    if (!proofFile) return;

    // Later connect to backend API.
    // const formData = new FormData();
    // formData.append("plan", selectedPlan);
    // formData.append("amount", currentPlan.price);
    // formData.append("proof", proofFile);

    setSubmitted(true);
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-3 pb-6 pt-5">
        <header className="relative flex items-center justify-center">
          <Link
            href={`/subscribe/checkout?plan=${selectedPlan}`}
            className="absolute left-1 text-white"
          >
            <ArrowLeft size={19} />
          </Link>

          <h2 className="text-[12px] font-bold">Upload Payment Proof</h2>
        </header>

        <section className="mt-8 text-center">
          <h1 className="text-[31px] font-extrabold leading-[34px] tracking-[-0.5px]">
            Confirm Your Payment
          </h1>

          <p className="mx-auto mt-3 max-w-[310px] text-[13px] font-bold leading-[17px] text-white/85">
            Upload your crypto payment receipt so your subscription can be
            confirmed and activated.
          </p>
        </section>

        <section className="relative mt-7 overflow-hidden rounded-xl border border-orange-500 bg-black/45 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
          <Image
            src="/images/payment-2.png"
            alt=""
            fill
            className="object-cover opacity-65"
          />

          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-y-2 px-4 py-4 text-[12px] font-medium">
            <span>Subscription:</span>
            <span className="font-extrabold">{currentPlan.name}</span>

            <span>Amount Paid:</span>
            <span className="text-[22px] font-extrabold leading-5">
              {currentPlan.price}
            </span>

            <span>Status:</span>
            <span
              className={`font-extrabold ${
                submitted ? "text-green-300" : "text-yellow-300"
              }`}
            >
              {submitted ? "Proof Submitted" : "Awaiting Confirmation"}
            </span>
          </div>
        </section>

        <section className="mt-5 rounded-t-[24px] bg-white px-4 pb-6 pt-5 text-black shadow-[0_0_18px_rgba(255,255,255,0.35)]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {!proofFile && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-blue-700 bg-blue-50 px-4 text-center"
              >
                <UploadCloud size={46} className="text-blue-700" />

                <p className="mt-3 text-[15px] font-extrabold">
                  Upload receipt or screenshot
                </p>

                <p className="mt-1 text-[11px] font-semibold text-black/55">
                  PNG, JPG, JPEG or PDF accepted
                </p>
              </button>

              <p className="mt-4 text-center text-[11px] font-semibold leading-[15px] text-black/55">
                Your subscription will be activated after your payment proof has
                been reviewed.
              </p>
            </>
          )}

          {proofFile && !submitted && (
            <div className="text-center">
              <CheckCircle size={54} className="mx-auto text-green-700" />

              <h2 className="mt-3 text-[19px] font-black text-green-700">
                Proof Ready to Submit
              </h2>

              <p className="mx-auto mt-2 max-w-[290px] text-[12px] font-bold leading-[16px] text-black/60">
                Your file has been selected. Click below to confirm your upload.
              </p>

              <div className="mx-auto mt-4 flex max-w-[290px] items-center gap-2 rounded-xl bg-white px-3 py-3 shadow-sm">
                <FileText size={18} className="shrink-0 text-blue-700" />
                <p className="truncate text-[12px] font-bold text-black">
                  {proofFile.name}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex h-[44px] w-full items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold text-white"
                >
                  Confirm and Submit Upload
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[40px] w-full items-center justify-center rounded-xl bg-black/10 text-[13px] font-bold text-black"
                >
                  Replace File
                </button>
              </div>
            </div>
          )}

          {proofFile && submitted && (
            <div className="text-center">
              <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={38} className="text-green-700" />
              </div>

              <h2 className="mt-4 text-[24px] font-black leading-7 text-blue-700">
                Upload Confirmed
              </h2>

              <p className="mx-auto mt-3 max-w-[310px] text-[12px] font-bold leading-[17px] text-black/65">
                Your proof of payment has been received successfully. Our admin
                team will review your receipt and confirm your subscription.
              </p>

              <div className="mt-5 rounded-[16px] bg-[#F4F6FA] px-4 py-4 text-left">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-yellow-600" />
                  <h3 className="text-[14px] font-black">Pending Review</h3>
                </div>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-[12px] font-semibold leading-[16px] text-black/65">
                  <li>Your receipt will be reviewed for payment confirmation.</li>
                  <li>Your subscription will be activated after approval.</li>
                  <li>You may receive a notification after activation.</li>
                  <li>Keep your payment receipt until your account is activated.</li>
                </ul>
              </div>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/subscribe/status"
                  className="flex h-[43px] w-full items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
                >
                  View Subscription Status
                </Link>

                <Link
                  href="/support"
                  className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-blue-700 bg-white text-[13px] font-bold !text-blue-700"
                >
                  <MessageCircle size={17} />
                  Chat Help Line
                </Link>

                <Link
                  href={`/subscribe/details?plan=${selectedPlan}`}
                  className="flex h-[40px] w-full items-center justify-center rounded-xl bg-black/10 text-[13px] font-bold !text-black"
                >
                  Back to Subscription
                </Link>
              </div>

              <p className="mt-4 text-[11px] font-semibold leading-[15px] text-black/55">
                While waiting, you can chat the help line if you need support or
                feel unsure.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}