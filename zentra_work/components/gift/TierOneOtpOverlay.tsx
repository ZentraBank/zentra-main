"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type TierOneOtpOverlayProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (otp: string) => void;
};

export default function TierOneOtpOverlay({
  open,
  onClose,
  onSubmit,
}: TierOneOtpOverlayProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  if (!open) return null;

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    const nextInput = document.getElementById(
      `tier-one-otp-${index + 1}`
    ) as HTMLInputElement | null;

    if (value && nextInput) {
      nextInput.focus();
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join("");

    if (onSubmit) {
      onSubmit(enteredOtp);
    }

    console.log("OTP:", enteredOtp);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4">
      <section
        className="
          relative
          w-full
          max-w-[330px]
          rounded-[9px]
          border-[3px]
          border-[#F4D03F]
          px-3
          pb-6
          pt-5
          text-center
          shadow-2xl
        "
        style={{
        backgroundImage: "url('/images/gifts-bg-otp.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      >
        <button title="close"
          type="button"
          onClick={onClose}
          className="absolute left-3 top-4 text-black/20"
        >
          <X size={17} />
        </button>

        <h2 className="text-[22px] font-black text-[#444]">
          tier-1 OTP
        </h2>

        <div className="relative mx-auto mt-5 h-[103px] w-[240px] overflow-hidden">
          {/* <Image
            src="/images/gift-bg-card.png"
            alt="Gift background"
            fill
            className="object-cover"
          /> */}

          <Image
            src="/images/gift-otp.png"
            alt="Gift box"
            width={250}
            height={146}
            className="
              absolute
              left-1/2
              top-1/2
              z-10
              -translate-x-1/2
              -translate-y-1/2
            "
          />
        </div>

        <p className="mx-auto mt-5 max-w-[285px] text-[13px] font-medium leading-[16px] text-[#EF3327]">
          Here's the chance to finally get that long awaited funds
        </p>

        <p className="mx-auto mt-3 max-w-[285px] text-[13px] font-medium leading-[17px] text-[#4e645b]">
          Reach out to our customer care agent for upgrade,
          genuity check, and OTP!
        </p>

        <div className="mx-auto mt-5 h-px w-[270px] bg-white/90" />

        <div className="mt-4 text-left">
          <label className="text-[12px] font-black text-[#4a5c55]">
            Input OTP
          </label>

          <div className="mt-2 grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`tier-one-otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                inputMode="numeric"
                onChange={(e) =>
                  handleOtpChange(e.target.value, index)
                }
                className="
                  h-[38px]
                  rounded-[5px]
                  bg-white
                  text-center
                  text-[18px]
                  font-black
                  text-[#2458E8]
                  shadow-md
                  outline-none
                "
                placeholder="*"
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="
            mt-8
            flex
            h-[39px]
            w-full
            items-center
            justify-center
            rounded-[9px]
            bg-[#2458E8]
            text-[14px]
            font-bold
            text-white
            shadow-md
            active:scale-[0.98]
          "
        >
          Get OTP
        </button>
      </section>
    </div>
  );
}