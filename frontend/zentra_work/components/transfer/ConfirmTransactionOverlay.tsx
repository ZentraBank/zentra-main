"use client";

import { ArrowLeft, Fingerprint, LogIn } from "lucide-react";

type ConfirmTransactionOverlayProps = {
  open: boolean;
  amount: string;
  onClose: () => void;
  onConfirmFingerprint: () => void;
  onUsePin: () => void;
};

export default function ConfirmTransactionOverlay({
  open,
  amount,
  onClose,
  onConfirmFingerprint,
  onUsePin,
}: ConfirmTransactionOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#E7EBF0]/80 backdrop-blur-[1px]">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center">
        <section className="w-full rounded-[8px] bg-white px-2 pb-6 pt-5 text-[#4A4A4A] shadow-xl">
          <header className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-0 text-black/80"
            >
              <ArrowLeft size={20} />
            </button>

            <h2 className="font-heading text-[13px] font-black tracking-[0.08em]">
              Confirm Transaction
            </h2>
          </header>

          <p className="mt-5 text-center text-[31px] font-black leading-none text-[#D8665A]">
            {amount}
          </p>

          <p className="mx-auto mt-4 max-w-[390px] text-center text-[13px] font-medium leading-[15px]">
            Once transaction is confirmed, reversal cannot be made unless via
            scam escalation complaint.
          </p>

          <div className="mt-11 flex justify-center">
            <button
              type="button"
              onClick={onConfirmFingerprint}
              className="flex h-[62px] w-[62px] items-center justify-center rounded-[10px] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] active:scale-95"
            >
              <Fingerprint
                size={48}
                strokeWidth={1.8}
                className="text-[#2472FF]"
              />
            </button>
          </div>

          <button
            type="button"
            onClick={onUsePin}
            className="mx-auto mt-10 flex h-[42px] w-[305px] items-center justify-center gap-3 rounded-[10px] border border-black/5 bg-white text-[14px] font-black shadow-sm active:scale-95"
          >
            Use PIN
            <LogIn size={17} className="text-[#2E8B57]" />
          </button>

          <div className="mt-5 flex items-center justify-center gap-8 text-[11px] font-bold">
            <button type="button">Privacy Policy</button>
            <button type="button">Terms and Conditions</button>
          </div>
        </section>
      </div>
    </div>
  );
}