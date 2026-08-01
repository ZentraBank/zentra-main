"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type PinConfirmationOverlayProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
};

export default function PinConfirmationOverlay({
  open,
  onClose,
  onSubmit,
}: PinConfirmationOverlayProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!open) {
      setPin("");
    }
  }, [open]);

  if (!open) return null;

  const handleNumber = (number: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + number);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      onSubmit(pin);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-5">
      <section className="w-full max-w-[380px] rounded-[16px] bg-white px-5 pb-6 pt-4 text-[#4A4A4A] shadow-xl">
        <div className="flex justify-end">
          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <h2 className="text-center font-heading text-[17px] font-black">
          Enter Transaction PIN
        </h2>

        <p className="mt-2 text-center text-[13px] text-black/45">
          Please enter your 4-digit PIN to confirm this transfer.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px] border border-black/15 bg-[#F6F7F9] text-[24px] font-black"
            >
              {pin[item] ? "•" : ""}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => handleNumber(number)}
              className="h-[48px] rounded-[10px] bg-[#F4F6F8] text-[18px] font-bold active:scale-95"
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            onClick={handleDelete}
            className="h-[48px] rounded-[10px] bg-[#F4F6F8] text-[18px] font-bold active:scale-95"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => handleNumber("0")}
            className="h-[48px] rounded-[10px] bg-[#F4F6F8] text-[18px] font-bold active:scale-95"
          >
            0
          </button>

          <button
            type="button"
            disabled={pin.length !== 4}
            onClick={handleSubmit}
            className="h-[48px] rounded-[10px] bg-[#2458E8] text-[14px] font-bold text-white disabled:opacity-40 active:scale-95"
          >
            OK
          </button>
        </div>
      </section>
    </div>
  );
}