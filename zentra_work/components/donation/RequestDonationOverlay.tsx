"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { accountService } from "@/services/account.service";
import {
  donationService,
  type Donor,
  type DonationRequest,
} from "@/services/donation.service";
import type { ClientAccount } from "@/types/account";
import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
  donor: Donor;
};

export default function RequestDonationOverlay({
  open,
  onClose,
  donor,
}: Props) {
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [appreciation, setAppreciation] = useState("");

  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState<DonationRequest | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadAccounts = async () => {
      setLoadingAccounts(true);
      setError("");

      try {
        const result = await accountService.listMine();

        if (cancelled) {
          return;
        }

        const activeAccounts = result.filter(
          (account) => account.status === "active",
        );

        setAccounts(activeAccounts);

        if (activeAccounts.length === 1) {
          setAccountId(activeAccounts[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your accounts.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAccounts(false);
        }
      }
    };

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (account) => account.id === accountId,
      ) ?? null,
    [accounts, accountId],
  );

  const resetForm = () => {
    setAccountId("");
    setAmount("");
    setPurpose("");
    setAppreciation("");
    setError("");
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedAccount) {
      setError("Please select a destination account.");
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Enter a valid donation amount.");
      return;
    }

    if (purpose.trim().length < 3) {
      setError(
        "Please explain the purpose of your donation request.",
      );
      return;
    }

    if (appreciation.trim().length < 3) {
      setError(
        "Please explain how you intend to appreciate this goodwill.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const request =
        await donationService.createRequest({
          donorId: donor.id,
          accountId: selectedAccount.id,
          amount: numericAmount,
          currency: selectedAccount.currency,
          purpose: purpose.trim(),
          appreciation: appreciation.trim(),
        });

      setSuccess(request);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your donation request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-black/35">
        <section
          className="absolute bottom-0 left-0 right-0 mx-auto min-h-[55vh] max-w-[430px] rounded-t-[24px] px-5 pb-8 pt-6"
          style={{
            backgroundImage:
              "url('/images/cards-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <header className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={handleClose}
              className="absolute left-0 text-white"
              aria-label="Close"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
              Donation
            </h1>
          </header>

          <div className="mt-14 rounded-[20px] bg-white px-5 py-8 text-center shadow-lg">
            <CheckCircle2
              size={58}
              className="mx-auto text-[#2E8B57]"
            />

            <h2 className="mt-5 text-[21px] font-black text-[#222]">
              Request submitted
            </h2>

            <p className="mt-3 text-[13px] leading-5 text-black/60">
              Your donation request to{" "}
              <span className="font-bold text-[#222]">
                {donor.full_name}
              </span>{" "}
              has been submitted successfully.
            </p>

            <div className="mt-5 rounded-[14px] bg-[#F3F6FA] p-4 text-left">
              <SummaryRow
                label="Amount"
                value={`${success.currency} ${Number(
                  success.amount,
                ).toLocaleString()}`}
              />

              <SummaryRow
                label="Status"
                value={success.status}
              />

              {success.account_number && (
                <SummaryRow
                  label="Destination"
                  value={success.account_number}
                />
              )}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="h-[44px] rounded-[10px] border border-[#2458E8] font-bold text-[#2458E8]"
          >
            Done
          </button>

          <Link
            href="/donations-gift/donations/requests"
            className="flex h-[44px] items-center justify-center rounded-[10px] bg-[#2458E8] text-[13px] font-bold text-white"
          >
            View request
          </Link>
        </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/35">
      <section
        className="absolute bottom-0 left-0 right-0 mx-auto h-[92vh] max-w-[430px] overflow-y-auto rounded-t-[24px] px-5 pt-6"
        style={{
          backgroundImage:
            "url('/images/cards-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <header className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={handleClose}
            className="absolute left-0 text-white"
            aria-label="Close"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Donation
          </h1>
        </header>

        <div className="mt-6 rounded-[10px] bg-white/90 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
            Requesting from
          </p>

          <p className="mt-1 text-[16px] font-bold text-[#222]">
            {donor.full_name}
          </p>
        </div>

        <form
          className="mt-5"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="donation-account"
            className="text-[13px] font-semibold"
          >
            Destination account
          </label>

          {loadingAccounts ? (
            <div className="mt-2 flex h-[48px] items-center justify-center rounded-[8px] bg-white">
              <Loader2
                size={18}
                className="animate-spin text-[#2458E8]"
              />
            </div>
          ) : (
            <select
              id="donation-account"
              value={accountId}
              onChange={(event) =>
                setAccountId(event.target.value)
              }
              className="mt-2 h-[48px] w-full rounded-[8px] bg-white px-3 text-[13px] outline-none"
            >
              <option value="">
                Select account
              </option>

              {accounts.map((account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.account_name} -{" "}
                  {account.account_number} (
                  {account.currency})
                </option>
              ))}
            </select>
          )}

          {!loadingAccounts &&
            accounts.length === 0 && (
              <p className="mt-2 text-[11px] font-medium text-red-700">
                You do not have an active account
                available to receive this donation.
              </p>
            )}

          <label
            htmlFor="donation-amount"
            className="mt-5 block text-[13px] font-semibold"
          >
            Amount requested
          </label>

          <div className="relative mt-2">
            {selectedAccount && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-black/50">
                {selectedAccount.currency}
              </span>
            )}

            <input
              id="donation-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="0.00"
              className={`h-[48px] w-full rounded-[8px] bg-white pr-3 outline-none ${
                selectedAccount
                  ? "pl-14"
                  : "pl-3"
              }`}
            />
          </div>

          <label
            htmlFor="donation-purpose"
            className="mt-5 block text-[13px] font-semibold"
          >
            Purpose
          </label>

          <textarea
            id="donation-purpose"
            value={purpose}
            onChange={(event) =>
              setPurpose(event.target.value)
            }
            placeholder="Clearly explain why these funds should be released to you?"
            maxLength={500}
            className="mt-2 h-[120px] w-full resize-none rounded-[8px] bg-white px-3 py-3 outline-none"
          />

          <div className="mt-5">
            <p className="text-[13px] font-semibold">
              Appreciation
            </p>

            <label
              htmlFor="donation-appreciation"
              className="mt-2 block text-[12px]"
            >
              Other means of transaction
            </label>

            <textarea
              id="donation-appreciation"
              value={appreciation}
              onChange={(event) =>
                setAppreciation(event.target.value)
              }
              placeholder="How will you repay this goodwill if this fund is successfully granted?"
              maxLength={1000}
              className="mt-2 h-[130px] w-full resize-none rounded-[8px] bg-white px-3 py-3 outline-none"
            />

            <p className="mt-2 text-right text-[11px] font-semibold">
              Compulsory
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-[9px] bg-red-50 px-3 py-3 text-[12px] font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="sticky bottom-0 mt-5 bg-[#E7EBF0]/95 py-4 backdrop-blur">
            <button
              type="submit"
              disabled={
                submitting ||
                loadingAccounts ||
                accounts.length === 0
              }
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#2458E8] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "Submitting..."
                : "Confirm request"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-2 last:border-b-0">
      <span className="text-[12px] text-black/45">
        {label}
      </span>

      <span className="max-w-[190px] truncate text-right text-[13px] font-bold capitalize text-[#222]">
        {value}
      </span>
    </div>
  );
}