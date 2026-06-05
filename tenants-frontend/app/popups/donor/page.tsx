"use client";

import { ArrowRight, X } from "lucide-react";

export default function DonorActionVerificationPopup({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[380px] rounded-xl border-[4px] border-[#d4bd37] bg-black px-5 py-5 text-white shadow-2xl">
        <button type="button" onClick={onClose} className="text-white">
          <X size={18} />
        </button>

        <h2 className="-mt-5 text-center text-[22px] font-black">
          Action Verification!
        </h2>

        <div className="mt-3 h-px bg-white/70" />

        <p className="mx-auto mt-5 max-w-[310px] text-center text-[12px] font-semibold leading-tight">
          This information you have provided shall the checkmarked by
          ZentraBank Admin, for scrutinization and adjustment, if need be,
          before listing you as one of our funds Donator, for clients’
          potential pick
        </p>

        <p className="mx-auto mt-4 max-w-[310px] text-center text-[12px] font-semibold leading-tight">
          Are you sure this action action you are taking is your final choice
          and that there is no mistake contained therein?
        </p>

        <div className="my-5 h-px bg-white/70" />

        <button
          type="button"
          onClick={onConfirm}
          className="mx-auto flex h-[40px] w-[285px] items-center justify-center gap-3 rounded-lg bg-[#2447d8] text-[14px] font-bold text-white transition hover:bg-[#3158ff]"
        >
          Yes, list me
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}