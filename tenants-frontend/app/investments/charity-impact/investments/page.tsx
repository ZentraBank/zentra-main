"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useState } from "react";

const notificationOptions = [
  "Crowdfunded Charity Project",
  "Nonprofit Investment Pools",
  "Social Impact Bonds",
  "Cause-driven Savings Plans",
  "Push a Bills Payment Notification",
];

export default function PushNotificationPage() {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState(
    "Crowdfunded Charity Project"
  );

  const [amount, setAmount] = useState("$15,000.00");

  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [second, setSecond] = useState("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [directToChat, setDirectToChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleNotifyClient = async () => {
    if (isSending || sent) return;

    if (!amount.trim()) {
      alert("Please enter an amount.");
      return;
    }

    setIsSending(true);

    try {
      const payload = {
        investmentType: selectedOption,
        amount,
        transactionTime: {
          hour,
          minute,
          second,
        },
        transactionDate: {
          day,
          month,
          year,
        },
        directToChat,
      };

      console.log("Notification payload:", payload);

      /*
        Replace this with your backend request later:

        const response = await fetch("/api/notifications/investment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Unable to notify client.");
        }
      */

      await new Promise((resolve) => setTimeout(resolve, 700));

      setSent(true);
    } catch (error) {
      console.error(error);
      alert("The notification could not be sent.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-black text-white">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/Background_1.png')",
        }}
      />

      <div className="fixed inset-0 bg-black/35 backdrop-blur-[1px]" />

      <div className="relative z-10 mx-auto flex min-h-[757px] w-full max-w-[430px] items-start justify-center px-4 py-10">
        <section className="relative w-full max-w-[345px] h-[757px] rounded-[14px] border-[4px] border-[#C8A514] bg-black px-3 pb-5 pt-4 shadow-[0_15px_35px_rgba(0,0,0,0.55)]">
          <Link
            href="/investments/charity-impact"
            aria-label="Close notification form"
            className="absolute left-2 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            <X size={19} />
          </Link>

          <h1 className="text-center font-sf-condensed text-[24px] font-black">
            Push A Notification
          </h1>

          <p className="mx-auto mt-4 max-w-[290px] text-center font-lato text-[13px] leading-[16px] text-white">
            If you “Push a Notification”, your clients will receive your
            information as a Bank notification and they will definitely take
            action about it on ZentraBank
          </p>

          <div className="mx-auto mt-5 h-px w-[255px] bg-white/80" />

          <section className="mt-4 overflow-hidden rounded-[10px]">
            <button
              type="button"
              onClick={() => setCategoryOpen((current) => !current)}
              className="flex h-[38px] w-full items-center justify-between bg-white px-3 text-left font-roboto text-[13px] font-medium text-[#666]"
            >
              <span>Charity &amp; Impact Investments</span>

              {categoryOpen ? (
                <ChevronUp size={16} className="text-black/40" />
              ) : (
                <ChevronDown size={16} className="text-black/40" />
              )}
            </button>

            <div
              className={`overflow-hidden bg-[#3F7B4B] transition-all duration-300 ${
                categoryOpen ? "max-h-[300px] px-4 py-1" : "max-h-0 px-4 py-0"
              }`}
            >
              <div className="space-y-1">
                {notificationOptions.map((option) => {
                  const selected = selectedOption === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedOption(option)}
                      className={`flex min-h-[32px] w-full items-center gap-2 rounded-[7px] px-2 text-left font-roboto text-[12px] font-medium text-white transition active:scale-[0.99] ${
                        selected
                          ? "bg-[#D21313]"
                          : "bg-[#B90E0E] hover:bg-[#C61212]"
                      }`}
                    >
                      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-white text-[13px]">
                        📑
                      </span>

                      <span className="truncate">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-3">
            <label
              htmlFor="notification-amount"
              className="font-sf-condensed text-[13px] font-black"
            >
              Amount
            </label>

            <input
              id="notification-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="$15,000.00"
              className="mt-1 h-[31px] w-full rounded-[7px] bg-white px-3 font-roboto text-[13px] text-[#555] outline-none placeholder:text-black/25"
            />
          </section>

          <section className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="font-sf-condensed text-[12px] font-black">
                Set transaction time
              </p>

              <div className="mt-1 rounded-[8px] bg-white p-1">
                <div className="grid grid-cols-2 gap-1">
                  <SelectField
                    value={hour}
                    onChange={setHour}
                    placeholder="Hr"
                    options={[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                    ]}
                  />

                  <SelectField
                    value={minute}
                    onChange={setMinute}
                    placeholder="Min"
                    options={["00", "15", "30", "45"]}
                  />
                </div>

                <div className="mt-1">
                  <SelectField
                    value={second}
                    onChange={setSecond}
                    placeholder="Sec"
                    options={["00", "15", "30", "45"]}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="font-sf-condensed text-[12px] font-black">
                Set transaction date
              </p>

              <div className="mt-1 rounded-[8px] bg-white p-1">
                <div className="grid grid-cols-2 gap-1">
                  <SelectField
                    value={day}
                    onChange={setDay}
                    placeholder="Day"
                    options={Array.from({ length: 31 }, (_, index) =>
                      String(index + 1)
                    )}
                  />

                  <SelectField
                    value={month}
                    onChange={setMonth}
                    placeholder="Month"
                    options={[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ]}
                  />
                </div>

                <div className="mt-1">
                  <SelectField
                    value={year}
                    onChange={setYear}
                    placeholder="Year"
                    options={["2026", "2027", "2028", "2029", "2030"]}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-3 flex min-h-[25px] items-center justify-between rounded-[7px] bg-white px-1">
            <span className="font-roboto text-[12px] text-[#555]">
              Direct this client to chat with you in-app
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={directToChat}
              onClick={() => setDirectToChat((current) => !current)}
              className={`relative h-[18px] w-[31px] rounded-full transition ${
                directToChat ? "bg-[#2458E8]" : "bg-[#AEB4B9]"
              }`}
            >
              <span
                className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition ${
                  directToChat ? "left-[15px]" : "left-[2px]"
                }`}
              />
            </button>
          </section>

          <button
            type="button"
            onClick={handleNotifyClient}
            disabled={isSending || sent}
            className={`mx-auto mt-8 flex h-[34px] w-[220px] items-center justify-center gap-3 rounded-[9px] font-roboto text-[14px] font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed ${
              sent ? "bg-[#27AE60]" : "bg-[#294CC9] hover:bg-[#1E40AF]"
            }`}
          >
            {sent
              ? "Client notified ✓"
              : isSending
                ? "Sending..."
                : "Notify client"}

            {!sent && <ArrowRight size={18} />}
          </button>
        </section>
      </div>
    </main>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        title={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[26px] w-full appearance-none rounded-full border border-black/10 bg-white px-3 pr-7 font-roboto text-[11px] text-[#777] outline-none"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black/30"
      />
    </div>
  );
}