"use client";

import { ArrowRight, X } from "lucide-react";

const SelectBox = ({
  placeholder,
  options,
}: {
  placeholder: string;
  options: string[];
}) => (
  <select title={placeholder}
    defaultValue=""
    className="h-[31px] w-full rounded-lg bg-white px-3 text-[12px] text-gray-400 outline-none"
  >
    <option value="" disabled>
      {placeholder}
    </option>
    {options.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
);

export default function PushNotificationPopup({
  open,
  onClose,
  onNotify,
}: {
  open: boolean;
  onClose: () => void;
  onNotify: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[390px] rounded-xl border-[4px] border-[#d4bd37] bg-black px-4 py-4 text-white shadow-2xl">
        <button type="button" onClick={onClose} className="text-white">
          <X size={18} />
        </button>

        <h2 className="-mt-5 text-center text-[22px] font-black">
          Push A Notification
        </h2>

        <p className="mx-auto mt-5 max-w-[320px] text-center text-[13px] font-medium leading-tight">
          If you “Push a Notification”, your clients will receive your
          information as a Bank notification and they will definitely take action
          about it on ZentraBank
        </p>

        <div className="my-5 h-px bg-white/70" />

        <div className="space-y-3">
          <SelectBox
            placeholder="Push a Notification"
            options={[
              "New Donation Request!",
              "Redemption Request!",
              "Virtual Card!",
              "Complain",
              "Next-of-kin",
            ]}
          />

          <div>
            <label className="mb-1 block text-[12px] font-bold">Amount</label>
            <input
              placeholder="$15,000.00"
              className="h-[31px] w-full rounded-md bg-white px-2 text-[13px] text-black placeholder:text-gray-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[12px] font-bold">
                Set transaction time
              </label>

              <div className="grid grid-cols-2 gap-1">
                <SelectBox placeholder="Hr" options={["01", "02", "03"]} />
                <SelectBox placeholder="Min" options={["00", "15", "30"]} />
                <div className="col-span-2">
                  <SelectBox placeholder="Sec" options={["00", "15", "30"]} />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-bold">
                Set transaction date
              </label>

              <div className="grid grid-cols-2 gap-1">
                <SelectBox placeholder="Day" options={["01", "02", "03"]} />
                <SelectBox
                  placeholder="Month"
                  options={["Jan", "Feb", "Mar"]}
                />
                <div className="col-span-2">
                  <SelectBox placeholder="Year" options={["2025", "2026"]} />
                </div>
              </div>
            </div>
          </div>

          <label className="flex h-[25px] items-center justify-between rounded-md bg-white px-2 text-[12px] text-black">
            Direct this client to chat with you in-app
            <input type="checkbox" className="h-4 w-4 accent-blue-600" />
          </label>

          <button
            type="button"
            onClick={onNotify}
            className="mx-auto mt-5 flex h-[40px] w-[280px] items-center justify-center gap-3 rounded-lg bg-[#2447d8] text-[14px] font-bold text-white transition hover:bg-[#3158ff]"
          >
            Notify client
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}