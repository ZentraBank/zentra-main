"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronDown, LogIn } from "lucide-react";
import { beneficiaryService } from "@/services/beneficiary.service";
import { demoBankService } from "@/services/demo-bank.service";
import type { BeneficiaryType } from "@/types/beneficiary";
import type { DemoBank } from "@/types/demo-bank";

const fallbackBanks: DemoBank[] = [
  { name: "ZentraBank", code: "ZENTRA", country: "", currencies: ["USD"] },
  { name: "JPMorgan Chase", code: "CHASE", country: "US", currencies: ["USD"] },
  { name: "Bank of America", code: "BOA", country: "US", currencies: ["USD"] },
  { name: "Wells Fargo", code: "WELLS", country: "US", currencies: ["USD"] },
  { name: "Citibank", code: "CITI", country: "US", currencies: ["USD"] },
  { name: "HSBC", code: "HSBC", country: "GB", currencies: ["GBP"] },
  { name: "Barclays", code: "BARCLAYS", country: "GB", currencies: ["GBP"] },
];

export default function AddBankAccountPage() {
  const router = useRouter();
  const [beneficiaryType, setBeneficiaryType] = useState<BeneficiaryType>("internal");
  const [banks, setBanks] = useState<DemoBank[]>(fallbackBanks);
  const [isResolving, setIsResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [bankCode, setBankCode] = useState("ZENTRA");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedBank = banks.find((bank) => bank.code === bankCode) || fallbackBanks[0];
  const isInternal = beneficiaryType === "internal";
  const canSubmit = accountNumber.length >= 8 && (isInternal || (resolved && accountName.trim().length >= 2));

  useEffect(() => {
    demoBankService.list().then((items) => setBanks([fallbackBanks[0], ...items])).catch(() => undefined);
  }, []);

  const resolveExternalAccount = async () => {
    if (isInternal || accountNumber.length < 8 || isResolving) return;
    setIsResolving(true); setError(null); setResolved(false);
    try {
      const result = await demoBankService.resolve(bankCode, accountNumber);
      setAccountName(result.accountName);
      setCurrency(result.currency);
      setResolved(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Account could not be resolved");
    } finally { setIsResolving(false); }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await beneficiaryService.create({
        beneficiaryType,
        displayName: displayName.trim() || undefined,
        accountNumber,
        ...(isInternal ? {} : {
          accountName: accountName.trim(),
          bankName: selectedBank.name,
          bankCode: selectedBank.code,
          currency,
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/transfers"), 700);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Beneficiary could not be saved");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e9eef4] text-[#333]">
      <section className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden px-5 pb-10 pt-12">
        <Image src="/images/ring.png" alt="" width={614} height={613} priority className="pointer-events-none absolute right-0 top-[120px] h-[700px] w-[700px] object-contain" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <Link href="/transfers" className="text-[#555]"><ArrowLeft size={22} /></Link>
            <p className="font-heading text-[13px] font-bold tracking-[0.15em] text-[#333]">Add Beneficiary</p>
            <div className="w-[22px]" />
          </div>

          <h1 className="mx-auto mt-4 max-w-[370px] text-center font-heading text-[31px] font-black leading-[31px] tracking-[0.02em] text-[#2d8d55] sm:text-[34px] sm:leading-[35px]">Save an account for faster transfers</h1>
          <p className="mt-4 text-center text-[13px] font-medium text-[#555]">Internal ZentraBank beneficiaries can be used immediately.</p>

          <div className="mt-6 grid grid-cols-2 rounded-full bg-white/70 p-1">
            <button type="button" onClick={() => { setBeneficiaryType("internal"); setBankCode("ZENTRA"); setResolved(false); }} className={`h-9 rounded-full text-[12px] font-semibold ${isInternal ? "bg-[#1D4ED8] text-white" : "text-black/55"}`}>ZentraBank</button>
            <button type="button" onClick={() => { setBeneficiaryType("external"); setBankCode("CHASE"); setResolved(false); setAccountName(""); }} className={`h-9 rounded-full text-[12px] font-semibold ${!isInternal ? "bg-[#1D4ED8] text-white" : "text-black/55"}`}>External bank</button>
          </div>

          <div className="mt-4 space-y-3">
            {!isInternal && <div className="relative">
              <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="flex h-[45px] w-full items-center justify-between rounded-[5px] border border-[#d4d7dd] bg-white px-3 text-[13px] text-[#555] shadow-sm">
                <span>{selectedBank.name}</span><ChevronDown size={18} />
              </button>
              {dropdownOpen && <div className="absolute left-0 top-[50px] z-50 w-full overflow-hidden rounded-[8px] border border-[#d4d7dd] bg-white shadow-xl">
                {banks.filter((bank) => bank.code !== "ZENTRA").map((bank) => <button key={bank.code} type="button" onClick={() => { setBankCode(bank.code); setDropdownOpen(false); setResolved(false); setAccountName(""); setCurrency(bank.currencies[0] || "USD"); }} className="flex h-[44px] w-full items-center px-3 text-left text-[13px] hover:bg-[#eef4ff]">{bank.name}</button>)}
              </div>}
            </div>}

            <input value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 20)); setResolved(false); setAccountName(""); }} inputMode="numeric" placeholder="Account number" className="h-[38px] w-full rounded-full border border-[#d4d7dd] bg-white/80 px-4 text-[14px] outline-none placeholder:text-[#a9adb5]" />
            {!isInternal && <>
              <button type="button" onClick={() => void resolveExternalAccount()} disabled={accountNumber.length < 8 || isResolving} className="h-[38px] w-full rounded-full bg-[#2458E8] px-4 text-[12px] font-semibold text-white disabled:opacity-40">{isResolving ? "Resolving…" : "Resolve demo account"}</button>
              <input value={accountName} readOnly placeholder="Resolved account holder" className="h-[38px] w-full rounded-full border border-[#d4d7dd] bg-white/80 px-4 text-[14px] outline-none placeholder:text-[#a9adb5]" />
            </>}
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nickname (optional)" className="h-[38px] w-full rounded-full border border-[#d4d7dd] bg-white/80 px-4 text-[14px] outline-none placeholder:text-[#a9adb5]" />
            {!isInternal && <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))} placeholder="Currency e.g. USD" className="h-[38px] w-full rounded-full border border-[#d4d7dd] bg-white/80 px-4 text-[14px] outline-none placeholder:text-[#a9adb5]" />}

            {isInternal && <p className="rounded-[7px] bg-blue-50 px-3 py-3 text-[11px] leading-4 text-blue-800">The backend verifies the account number, account status, tenant, currency, duplicate status, and prevents saving your own account.</p>}
            {!isInternal && <p className="rounded-[7px] bg-amber-50 px-3 py-3 text-[11px] leading-4 text-amber-800">External beneficiaries are resolved using demo data. Transfers will update the sender ledger and dashboard, but no real bank settlement occurs.</p>}
            {error && <div className="rounded-[7px] border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700">{error}</div>}
            {success && <div className="flex items-center gap-2 rounded-[7px] bg-green-50 px-3 py-3 text-[12px] font-semibold text-green-700"><CheckCircle2 size={16} /> Beneficiary saved successfully</div>}
          </div>
        </div>

        <div className="relative z-10 mt-auto px-8 pt-10">
          <button onClick={() => void handleSubmit()} disabled={!canSubmit || isSubmitting || success} className="flex h-[40px] w-full items-center justify-center gap-3 rounded-[9px] bg-[#1D4ED8] text-[14px] font-semibold text-white transition disabled:opacity-40 active:scale-[0.98]">
            {isSubmitting ? "Saving…" : "Save beneficiary"}<LogIn size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
