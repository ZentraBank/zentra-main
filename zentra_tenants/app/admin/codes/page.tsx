"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCodesPage() {
  const [otp, setOtp] = useState(["8", "8", "X", "T", "7", "1"]);

  const controls = [
  {
    title: "Account Upgrade Control",
    height: "h-[182px]",
    padding: "p-3",
    actions: [
      {
        label: "Approve Tier-1 for client",
        action: "upgrade-tier-1",
      },
      {
        label: "Approve Tier-2 for client",
        action: "upgrade-tier-2",
      },
      {
        label: "Approve Tier-3 for client",
        action: "upgrade-tier-3",
      },
    ],
  },
  {
    title: "Initial Deposit Control",
    height: "h-[182px]",
    padding: "p-4",
    actions: [
      {
        label: "Approve Tier-1 for client",
        action: "deposit-tier-1",
      },
      {
        label: "Approve Tier-2 for client",
        action: "deposit-tier-2",
      },
      {
        label: "Approve Tier-3 for client",
        action: "deposit-tier-3",
      },
    ],
  },
  {
    title: "Donation Redemption Control",
    height: "h-[182px]",
    padding: "p-5",
    actions: [
      {
        label: "Approve Tier-1 for client",
        action: "redeem-tier-1",
      },
      {
        label: "Approve Tier-2 for client",
        action: "redeem-tier-2",
      },
      {
        label: "Approve Tier-3 for client",
        action: "redeem-tier-3",
      },
    ],
  },
];

  const generateOtp = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const newOtp = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    );

    setOtp(newOtp);
  };

  

const router = useRouter();

const handleAction = (action: string) => {
  switch (action) {
    case "upgrade-tier-1":
      router.push("/admin/account-upgrade/tier-1");
      break;

    case "upgrade-tier-2":
      router.push("/admin/account-upgrade/tier-2");
      break;

    case "upgrade-tier-3":
      router.push("/admin/account-upgrade/tier-3");
      break;

    case "deposit-tier-1":
      router.push("/admin/deposit/tier-1");
      break;

    case "deposit-tier-2":
      router.push("/admin/deposit/tier-2");
      break;

    case "deposit-tier-3":
      router.push("/admin/deposit/tier-3");
      break;

    case "redeem-tier-1":
      router.push("/admin/redemption/tier-1");
      break;

    case "redeem-tier-2":
      router.push("/admin/redemption/tier-2");
      break;

    case "redeem-tier-3":
      router.push("/admin/redemption/tier-3");
      break;

    default:
      console.log(action);
  }
};
  const copyOtp = async () => {
    const code = otp.join("");

    try {
      await navigator.clipboard.writeText(code);
      alert(`OTP copied: ${code}`);
    } catch {
      alert("Could not copy OTP");
    }
  };

  const handleActionClick = (controlTitle: string, action: string) => {
    alert(`${controlTitle}: ${action}`);

    // Backend connection later:
    // await fetch("/api/admin/control-action", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     controlTitle,
    //     action,
    //   }),
    // });
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover opacity-60"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col">
        <header className="px-4 pb-4 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/agent" className="text-white hover:text-white/80">
              <ArrowLeft size={20} />
            </Link>

            <h1 className="font-sf-condensed text-[24px] font-bold leading-none">
              Customer Care Agent
            </h1>
          </div>

          <div className="mt-4 flex justify-center gap-2 px-6">
            <Link
              href="/admin/chat"
              className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] !bg-[#5A6270] text-[12px] font-medium text-white transition hover:bg-gray-500"
            >
              Chat
            </Link>

            <Link
              href="/admin/codes"
              className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] !bg-[#1E40AF] text-[12px] font-medium text-white transition"
            >
              Codes
            </Link>

            <Link
              href="/admin/format"
              className="flex h-[24px] flex-1 items-center justify-center rounded-[8px] !bg-[#5A6270] text-[12px] font-medium text-white transition hover:bg-gray-500"
            >
              Format
            </Link>
          </div>
        </header>

        <div className="mx-auto h-[943px] w-[344px] flex-1 overflow-y-auto px-4 pb-10 pt-4 md:w-[400px] lg:w-[500px]">
          <section className="rounded-[12px] border-2 border-[#D6C51F] bg-[#1E40AF] p-5 shadow-2xl">
            <h2 className="text-center text-[24px] font-bold text-white">
              Generate OTP
            </h2>

            <p className="font-lato mx-auto mt-2 text-center text-[11.5px] leading-[16px] text-white/90">
              Generate OTP for this client, but make sure you have already
              billed the client and have them paid already before you release
              the OTP
            </p>

            <div className="mt-5 border-b border-white/20 pb-5">
              <p className="font-roboto mb-2 text-[11px] font-bold text-white">
                Generate OTP
              </p>

              <div className="grid grid-cols-6 gap-2">
                {otp.map((char, i) => (
                  <div
                    key={i}
                    className="flex h-10 w-full items-center justify-center rounded bg-white text-[18px] font-black text-black shadow-inner"
                  >
                    {char}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={generateOtp}
                  className="inline-flex items-center justify-center rounded-[12px] bg-[#2563eb] px-4 py-1 text-[12px] font-bold text-white shadow-md transition hover:bg-blue-600 active:scale-95"
                >
                  Generate OTP
                </button>

                <button
                  type="button"
                  onClick={copyOtp}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-white transition hover:text-white/70"
                >
                  Copy <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="mb-3 mt-3 space-y-4">
              {controls.map((control, idx) => (
                <div
                  key={idx}
                  className={`rounded-[8px] border border-white/40 ${control.padding} ${control.height}`}
                >
                  <h3 className="font-sf-condensed mb-2 text-[14px] font-bold text-white">
                    {control.title}
                  </h3>

                  <div className="flex flex-col items-center gap-2 pt-1.5">
                    {control.actions.map((action, aIdx) => (
                      <button
                    key={aIdx}
                    type="button"
                    onClick={() => handleAction(action.action)}
                    className="h-[39px] w-full max-w-[284px] rounded-[12px] !bg-white px-4 py-2 font-roboto text-[16px] font-bold !text-black/80 shadow-sm transition hover:bg-gray-100 active:scale-[0.98]"
                  >
                    {action.label}
                  </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}