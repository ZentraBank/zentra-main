import { ArrowRight, X } from "lucide-react";

export default function ActionVerificationPopup({
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[380px] rounded-xl border-[4px] border-[#d4bd37] bg-black px-6 py-5 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="mb-3 text-white"
        >
          <X size={18} />
        </button>

        <h2 className="text-center text-[21px] font-black">
          Action Verification!
        </h2>

        <p className="mx-auto mt-5 max-w-[290px] text-center text-[13px] font-semibold leading-tight">
          Are you sure this action you are taking is your final choice and that
          there is no mistake contained therein?
        </p>

        <div className="my-5 h-px bg-white/70" />

        <button
          type="button"
          onClick={onConfirm}
          className="mx-auto flex h-[38px] w-[250px] items-center justify-center gap-3 rounded-lg bg-[#2447d8] text-[14px] font-bold text-white transition hover:bg-[#3158ff]"
        >
          Yes, I’m sure
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}