"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ConfirmTransactionOverlay from "@/components/transfer/ConfirmTransactionOverlay";
import PinConfirmationOverlay from "@/components/transfer/PinConfirmationOverlay";
import { transactionPinService } from "@/services/transaction-pin.service";
import { accountService } from "@/services/account.service";
import { transferService } from "@/services/transfer.service";
import { formatMoney } from "@/lib/formatters";
import type { ClientAccount } from "@/types/account";

export default function SendMoneyPage() {
  const router = useRouter();
  const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
  const [showPinOverlay, setShowPinOverlay] = useState(false);
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [transferType, setTransferType] = useState<"internal" | "external">("internal");
  const [bankName, setBankName] = useState("ZentraBank");
  const [bankCode, setBankCode] = useState("ZENTRA");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinStatus, setPinStatus] = useState<{
  isSet: boolean;
  isLocked: boolean;
} | null>(null);

const [showCreatePin, setShowCreatePin] = useState(false);
const [showResetPin, setShowResetPin] = useState(false);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  setBeneficiaryName(params.get("name") || "");
  setAccountNumber(
    (params.get("accountNumber") || "").replace(/\D/g, "")
  );
  setAmount(
    (params.get("amount") || "").replace(/[^\d.]/g, "")
  );
  setTransferType(
    params.get("transferType") === "external"
      ? "external"
      : "internal"
  );
  setBankName(params.get("bankName") || "ZentraBank");
  setBankCode(params.get("bankCode") || "ZENTRA");

  Promise.all([
    accountService.listMine(),
    transactionPinService.status(),
  ])
    .then(([items, status]) => {
      const active = items.filter(
        (item) => item.status === "active"
      );

      setAccounts(active);
      setPinStatus(status);

      if (active[0]) {
        setSourceAccountId(active[0].id);
      }
    })
    .catch((requestError) =>
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load transfer information"
      )
    )
    .finally(() => setIsLoading(false));
}, []);

  const selectedAccount = useMemo(
    () => accounts.find((item) => item.id === sourceAccountId) || null,
    [accounts, sourceAccountId],
  );

  const numericAmount = Number(amount);
  const canSubmit = Boolean(
    selectedAccount &&
    accountNumber.length >= 8 &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= Number(selectedAccount.balance),
  );

  const displayAmount = selectedAccount
    ? formatMoney(numericAmount || 0, selectedAccount.currency)
    : amount || "0.00";

  function CreateTransactionPinOverlay({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setPin("");
      setConfirmPin("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!password) {
      setError("Enter your account password.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("PIN confirmation does not match.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await transactionPinService.setup({
        password,
        pin,
      });

      await onCreated();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create transaction PIN"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-5">
      <section className="w-full max-w-[380px] rounded-[18px] bg-white p-5 shadow-xl">
        <h2 className="text-center text-[18px] font-black">
          Create Transaction PIN
        </h2>

        <p className="mt-2 text-center text-[12px] text-black/50">
          Confirm your account password and create a 4-digit PIN.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Account password"
          className="mt-6 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
        />

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) =>
            setPin(
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 4)
            )
          }
          placeholder="4-digit PIN"
          className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
        />

        <input
          type="password"
          inputMode="numeric"
          value={confirmPin}
          onChange={(e) =>
            setConfirmPin(
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 4)
            )
          }
          placeholder="Confirm PIN"
          className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
        />

        {error ? (
          <p className="mt-3 text-[12px] text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="mt-5 h-[44px] w-full rounded-[10px] bg-[#2458E8] font-bold text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create PIN"}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="mt-2 h-[40px] w-full rounded-[10px] bg-gray-100 text-sm font-semibold"
        >
          Cancel
        </button>
      </section>
    </div>
  );
}

function ResetTransactionPinOverlay({
  open,
  onClose,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  onReset: () => void | Promise<void>;
}) {
  const [requested, setRequested] = useState(false);
  const [code, setCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [developmentCode, setDevelopmentCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setRequested(false);
      setCode("");
      setNewPin("");
      setConfirmPin("");
      setDevelopmentCode("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const requestCode = async () => {
    setBusy(true);
    setError("");

    try {
      const result =
        await transactionPinService.requestReset();

      setRequested(true);
      setDevelopmentCode(
        result.developmentCode || ""
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to request PIN reset"
      );
    } finally {
      setBusy(false);
    }
  };

  const resetPin = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit reset code.");
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setError("New PIN must be exactly 4 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setError("PIN confirmation does not match.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await transactionPinService.reset({
        code,
        newPin,
      });

      await onReset();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset transaction PIN"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-5">
      <section className="w-full max-w-[380px] rounded-[18px] bg-white p-5 shadow-xl">
        <h2 className="text-center text-[18px] font-black">
          Reset Transaction PIN
        </h2>

        {!requested ? (
          <>
            <p className="mt-2 text-center text-[12px] text-black/50">
              We’ll send a verification code to your registered email.
            </p>

            <button
              type="button"
              onClick={() => void requestCode()}
              disabled={busy}
              className="mt-6 h-[44px] w-full rounded-[10px] bg-[#2458E8] font-bold text-white disabled:opacity-50"
            >
              {busy ? "Requesting…" : "Send reset code"}
            </button>
          </>
        ) : (
          <>
            {developmentCode ? (
              <div className="mt-4 rounded-[10px] bg-amber-50 px-3 py-2 text-center text-[12px] font-semibold text-amber-800">
                Development OTP: {developmentCode}
              </div>
            ) : null}

            <input
              inputMode="numeric"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="6-digit verification code"
              className="mt-5 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
            />

            <input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) =>
                setNewPin(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4)
                )
              }
              placeholder="New 4-digit PIN"
              className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
            />

            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4)
                )
              }
              placeholder="Confirm new PIN"
              className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
            />

            <button
              type="button"
              onClick={() => void resetPin()}
              disabled={busy}
              className="mt-5 h-[44px] w-full rounded-[10px] bg-[#2458E8] font-bold text-white disabled:opacity-50"
            >
              {busy ? "Resetting…" : "Reset PIN"}
            </button>
          </>
        )}

        {error ? (
          <p className="mt-3 text-[12px] text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="mt-2 h-[40px] w-full rounded-[10px] bg-gray-100 text-sm font-semibold"
        >
          Cancel
        </button>
      </section>
    </div>
  );
}
    const openPinFlow = () => {
  setShowConfirmOverlay(false);
  setError(null);

  if (!pinStatus?.isSet) {
    setShowCreatePin(true);
    return;
  }

  if (pinStatus.isLocked) {
    setError(
      "Your transaction PIN is temporarily locked. Please try again later."
    );
    return;
  }

  setShowPinOverlay(true);
};

  const submitTransfer = async (transactionPin: string) => {
    if (!canSubmit || !selectedAccount || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const transfer = await transferService.create({
        sourceAccountId: selectedAccount.id,
        destinationAccountNumber: accountNumber,
        amount: numericAmount,
        currency: selectedAccount.currency,
        description: purpose.trim() || undefined,
        transactionPin,
        transferType,
        ...(transferType === "external" ? { destinationAccountName: beneficiaryName, destinationBankName: bankName, destinationBankCode: bankCode } : {}),
      });
      setShowConfirmOverlay(false);
      setShowPinOverlay(false);
      router.push(`/receipt?transferId=${encodeURIComponent(transfer.id)}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Transfer could not be completed");
      setShowConfirmOverlay(false);
      setShowPinOverlay(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#E7EBF0] text-[#4A4A4A]">
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-[110px] pt-12">
        <header className="relative flex items-center justify-center">
          <Link href="/transfers" className="absolute left-0 text-black/60"><ArrowLeft size={21} /></Link>
          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em]">Send money</h1>
        </header>

        <form className="mt-6" onSubmit={(e) => { e.preventDefault(); if (canSubmit) setShowConfirmOverlay(true); }}>
          <div>
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">From account</label>
            <div className="relative">
              <select value={sourceAccountId} onChange={(e) => setSourceAccountId(e.target.value)} disabled={isLoading} className="h-[38px] w-full appearance-none rounded-[7px] bg-white/80 px-3 pr-9 text-[13px] outline-none">
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.account_name} • {account.account_number}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">Beneficiary</label>
            <input value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} placeholder="Beneficiary name" className="h-[35px] w-full rounded-[7px] bg-white/80 px-3 text-[15px] outline-none placeholder:text-black/25" />
          </div>

          {transferType === "external" && <div className="mt-4 rounded-[7px] bg-blue-50 px-3 py-3 text-[11px] leading-4 text-blue-800"><strong>{bankName}</strong> demo transfer. The sender balance and ledger will update, but no real bank settlement will occur.</div>}

          <div className="mt-5">
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">Account number</label>
            <input inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 20))} placeholder="Destination account number" className="h-[35px] w-full rounded-[7px] bg-white/80 px-3 text-[15px] outline-none placeholder:text-black/25" />
          </div>

          <div className="mt-5 grid grid-cols-[70px_1fr] gap-4">
            <div className="pt-[21px]"><div className="flex h-[31px] items-center justify-center rounded-full bg-white px-2 text-[12px] shadow-sm">{selectedAccount?.currency || "—"}</div></div>
            <div>
              <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">Amount</label>
              <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" className="h-[35px] w-full rounded-[7px] bg-white/80 px-3 text-[15px] outline-none placeholder:text-black/25" />
              <p className="mt-1 text-right text-[11px] font-bold tracking-[0.04em] text-black/35">balance: <span className="ml-2 text-black/45">{selectedAccount ? formatMoney(selectedAccount.balance, selectedAccount.currency) : "—"}</span></p>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">Purpose</label>
            <textarea value={purpose} onChange={(e) => setPurpose(e.target.value.slice(0, 255))} placeholder="What’s this for?" className="h-[118px] w-full resize-none rounded-[7px] bg-white/80 px-3 py-2 text-[15px] outline-none placeholder:text-black/25" />
            <p className="-mt-1 text-right text-[11px] font-bold text-black/20">Optional</p>
          </div>

          {error && <div className="mt-4 rounded-[7px] border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700">{error}</div>}
          {!isLoading && accounts.length === 0 && <div className="mt-4 rounded-[7px] bg-amber-50 px-3 py-3 text-[12px] text-amber-800">You need an active account before you can make a transfer.</div>}
          {selectedAccount && numericAmount > Number(selectedAccount.balance) && <p className="mt-2 text-[11px] text-red-600">The amount exceeds your available balance.</p>}

          <button type="submit" disabled={!canSubmit || isSubmitting || isLoading} className="mt-20 flex h-[43px] w-full items-center justify-center rounded-[8px] bg-[#2458E8] text-[14px] font-bold text-white disabled:opacity-40 active:scale-[0.98]">
            {isSubmitting ? "Sending…" : "Send money"}
          </button>
        </form>
      </section>

      <BottomNav />
      <ConfirmTransactionOverlay
  open={showConfirmOverlay}
  amount={displayAmount}
  onClose={() => setShowConfirmOverlay(false)}
  onConfirmFingerprint={openPinFlow}
  onUsePin={openPinFlow}
/>

<PinConfirmationOverlay
  open={showPinOverlay}
  pinIsSet={pinStatus?.isSet ?? false}
  onClose={() => setShowPinOverlay(false)}
  onSubmit={(pin) => void submitTransfer(pin)}
  onForgotPin={() => {
    setShowPinOverlay(false);
    setShowResetPin(true);
  }}
  onCreatePin={() => {
    setShowPinOverlay(false);
    setShowCreatePin(true);
  }}
/>

<CreateTransactionPinOverlay
  open={showCreatePin}
  onClose={() => setShowCreatePin(false)}
  onCreated={async () => {
    const status =
      await transactionPinService.status();

    setPinStatus(status);
    setShowCreatePin(false);
    setShowPinOverlay(true);
  }}
/>

<ResetTransactionPinOverlay
  open={showResetPin}
  onClose={() => setShowResetPin(false)}
  onReset={async () => {
    const status =
      await transactionPinService.status();

    setPinStatus(status);
    setShowResetPin(false);
    setShowPinOverlay(true);
  }}
/>
    </main>
  );
}
