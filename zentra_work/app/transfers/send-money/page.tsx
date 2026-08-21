"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

import BottomNav from "@/components/layout/BottomNav";
import ConfirmTransactionOverlay from "@/components/transfer/ConfirmTransactionOverlay";
import PinConfirmationOverlay from "@/components/transfer/PinConfirmationOverlay";

import {
  accountService,
  type TransferDestination,
} from "@/services/account.service";

import {
  transactionPinService,
} from "@/services/transaction-pin.service";

import {
  transferService,
} from "@/services/transfer.service";

import {
  fxService,
  type FxQuote,
} from "@/services/fx.service";

import { formatMoney } from "@/lib/formatters";

import type {
  ClientAccount,
} from "@/types/account";

export default function SendMoneyPage() {
  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | Main overlays
  |--------------------------------------------------------------------------
  */

  const [
    showConfirmOverlay,
    setShowConfirmOverlay,
  ] = useState(false);

  const [
    showPinOverlay,
    setShowPinOverlay,
  ] = useState(false);

  const [
    showCreatePin,
    setShowCreatePin,
  ] = useState(false);

  const [
    showResetPin,
    setShowResetPin,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Accounts
  |--------------------------------------------------------------------------
  */

  const [
    accounts,
    setAccounts,
  ] = useState<ClientAccount[]>([]);

  const [
    sourceAccountId,
    setSourceAccountId,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Destination
  |--------------------------------------------------------------------------
  */

  const [
    beneficiaryName,
    setBeneficiaryName,
  ] = useState("");

  const [
    accountNumber,
    setAccountNumber,
  ] = useState("");

  const [
    destination,
    setDestination,
  ] =
    useState<TransferDestination | null>(
      null,
    );

  const [
    isLookingUpDestination,
    setIsLookingUpDestination,
  ] = useState(false);

  const [
    destinationError,
    setDestinationError,
  ] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Transfer
  |--------------------------------------------------------------------------
  */

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    purpose,
    setPurpose,
  ] = useState("");

  const [
    transferType,
    setTransferType,
  ] =
    useState<
      "internal" | "external"
    >("internal");

  const [
    bankName,
    setBankName,
  ] = useState("ZentraBank");

  const [
    bankCode,
    setBankCode,
  ] = useState("ZENTRA");

  /*
  |--------------------------------------------------------------------------
  | FX
  |--------------------------------------------------------------------------
  */

  const [
    fxQuote,
    setFxQuote,
  ] = useState<FxQuote | null>(
    null,
  );

  const [
    isLoadingFxQuote,
    setIsLoadingFxQuote,
  ] = useState(false);

  const [
    fxError,
    setFxError,
  ] =
    useState<string | null>(
      null,
    );

  /*
  |--------------------------------------------------------------------------
  | PIN
  |--------------------------------------------------------------------------
  */

  const [
    pinStatus,
    setPinStatus,
  ] = useState<{
    isSet: boolean;
    isLocked: boolean;
  } | null>(null);

  /*
  |--------------------------------------------------------------------------
  | General state
  |--------------------------------------------------------------------------
  */

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /*
  |--------------------------------------------------------------------------
  | Initial page load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    setBeneficiaryName(
      params.get("name") || "",
    );

    setAccountNumber(
      (
        params.get(
          "accountNumber",
        ) || ""
      ).replace(/\D/g, ""),
    );

    setAmount(
      (
        params.get("amount") ||
        ""
      ).replace(
        /[^\d.]/g,
        "",
      ),
    );

    setTransferType(
      params.get(
        "transferType",
      ) === "external"
        ? "external"
        : "internal",
    );

    setBankName(
      params.get(
        "bankName",
      ) || "ZentraBank",
    );

    setBankCode(
      params.get(
        "bankCode",
      ) || "ZENTRA",
    );

    Promise.all([
      accountService.listMine(),
      transactionPinService.status(),
    ])
      .then(
        ([
          accountItems,
          status,
        ]) => {
          const activeAccounts =
            accountItems.filter(
              (account) =>
                account.status ===
                "active",
            );

          setAccounts(
            activeAccounts,
          );

          setPinStatus(
            status,
          );

          if (
            activeAccounts[0]
          ) {
            setSourceAccountId(
              activeAccounts[0]
                .id,
            );
          }
        },
      )
      .catch(
        (
          requestError,
        ) => {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load transfer information",
          );
        },
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Selected source account
  |--------------------------------------------------------------------------
  */

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            sourceAccountId,
        ) || null,
      [
        accounts,
        sourceAccountId,
      ],
    );

  const numericAmount =
    Number(amount);

  /*
  |--------------------------------------------------------------------------
  | Look up internal destination by account number
  |--------------------------------------------------------------------------
  |
  | A beneficiary is NOT required.
  |
  | The user can type any valid ZentraBank account number.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      transferType !==
        "internal" ||
      accountNumber.length < 8
    ) {
      setDestination(null);
      setDestinationError(null);
      setFxQuote(null);

      return;
    }

    let cancelled = false;

    const timer =
      window.setTimeout(
        async () => {
          setIsLookingUpDestination(
            true,
          );

          setDestinationError(
            null,
          );

          setDestination(null);
          setFxQuote(null);

          try {
            const result =
              await accountService.lookupTransferDestination(
                accountNumber,
              );

            if (cancelled) {
              return;
            }

            setDestination(
              result,
            );

            /*
             * Internal account name comes from
             * the backend, not user input.
             */
            setBeneficiaryName(
              result.accountName,
            );

            setBankName(
              result.bankName,
            );

            setBankCode(
              result.bankCode,
            );
          } catch (
            requestError
          ) {
            if (cancelled) {
              return;
            }

            setDestination(
              null,
            );

            setDestinationError(
              requestError instanceof
                Error
                ? requestError.message
                : "Unable to find this account",
            );
          } finally {
            if (!cancelled) {
              setIsLookingUpDestination(
                false,
              );
            }
          }
        },
        500,
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timer,
      );
    };
  }, [
    accountNumber,
    transferType,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Does this transfer require FX?
  |--------------------------------------------------------------------------
  */

  const requiresFx =
    Boolean(
      transferType ===
        "internal" &&
        selectedAccount &&
        destination &&
        selectedAccount.currency !==
          destination.currency,
    );

  /*
  |--------------------------------------------------------------------------
  | Create FX quote
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !requiresFx ||
      !selectedAccount ||
      !destination
    ) {
      setFxQuote(null);
      setFxError(null);
      setIsLoadingFxQuote(
        false,
      );

      return;
    }

    const sourceAmount =
      Number(amount);

    if (
      !Number.isFinite(
        sourceAmount,
      ) ||
      sourceAmount <= 0
    ) {
      setFxQuote(null);
      setFxError(null);

      return;
    }

    let cancelled = false;

    const timer =
      window.setTimeout(
        async () => {
          setIsLoadingFxQuote(
            true,
          );

          setFxError(null);
          setFxQuote(null);

          try {
            const result =
              await fxService.createTransferQuote(
                {
                  sourceCurrency:
                    selectedAccount.currency,

                  destinationCurrency:
                    destination.currency,

                  sourceAmount,
                },
              );

            if (cancelled) {
              return;
            }

            setFxQuote(
              result.quote,
            );
          } catch (
            requestError
          ) {
            if (cancelled) {
              return;
            }

            setFxQuote(null);

            setFxError(
              requestError instanceof
                Error
                ? requestError.message
                : "Unable to get an exchange rate",
            );
          } finally {
            if (!cancelled) {
              setIsLoadingFxQuote(
                false,
              );
            }
          }
        },
        500,
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timer,
      );
    };
  }, [
    amount,
    destination,
    requiresFx,
    selectedAccount,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const sameAccount =
    Boolean(
      selectedAccount &&
        destination &&
        selectedAccount
          .account_number ===
          destination.accountNumber,
    );

  const fxQuoteIsUsable =
    !requiresFx ||
    Boolean(
      fxQuote &&
        fxQuote.status ===
          "active" &&
        new Date(
          fxQuote.expires_at,
        ).getTime() >
          Date.now(),
    );

  const externalRecipientReady =
    transferType !==
      "external" ||
    Boolean(
      beneficiaryName.trim() &&
        bankName.trim() &&
        bankCode.trim(),
    );

  const destinationReady =
    transferType ===
      "external" ||
    Boolean(destination);

  const canSubmit =
    Boolean(
      selectedAccount &&
        accountNumber.length >=
          8 &&
        Number.isFinite(
          numericAmount,
        ) &&
        numericAmount > 0 &&
        numericAmount <=
          Number(
            selectedAccount.balance,
          ) &&
        destinationReady &&
        !sameAccount &&
        externalRecipientReady &&
        !isLookingUpDestination &&
        !isLoadingFxQuote &&
        fxQuoteIsUsable,
    );

  const displayAmount =
    selectedAccount
      ? formatMoney(
          numericAmount || 0,
          selectedAccount.currency,
        )
      : amount || "0.00";

  /*
  |--------------------------------------------------------------------------
  | PIN flow
  |--------------------------------------------------------------------------
  */

  const openPinFlow = () => {
    setShowConfirmOverlay(
      false,
    );

    setError(null);

    if (
      !pinStatus?.isSet
    ) {
      setShowCreatePin(true);
      return;
    }

    if (
      pinStatus.isLocked
    ) {
      setError(
        "Your transaction PIN is temporarily locked. Please try again later.",
      );

      return;
    }

    setShowPinOverlay(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Submit transfer
  |--------------------------------------------------------------------------
  */

  const submitTransfer =
    async (
      transactionPin: string,
    ) => {
      if (
        !canSubmit ||
        !selectedAccount ||
        isSubmitting
      ) {
        return;
      }

      if (
        requiresFx &&
        !fxQuote
      ) {
        setError(
          "An exchange-rate quote is required for this transfer.",
        );

        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const transfer =
          await transferService.create(
            {
              sourceAccountId:
                selectedAccount.id,

              destinationAccountNumber:
                accountNumber,

              amount:
                numericAmount,

              /*
               * Currency is always the
               * SOURCE account currency.
               */
              currency:
                selectedAccount.currency,

              transactionPin,

              transferType,

              ...(fxQuote
                ? {
                    fxQuoteId:
                      fxQuote.id,
                  }
                : {}),

              ...(transferType ===
              "external"
                ? {
                    destinationAccountName:
                      beneficiaryName,

                    destinationBankName:
                      bankName,

                    destinationBankCode:
                      bankCode,
                  }
                : {}),

              description:
                purpose.trim() ||
                undefined,
            },
          );

        setShowConfirmOverlay(
          false,
        );

        setShowPinOverlay(
          false,
        );

        router.push(
          `/receipt?transferId=${encodeURIComponent(
            transfer.id,
          )}`,
        );
      } catch (
        requestError
      ) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Transfer could not be completed",
        );

        setShowConfirmOverlay(
          false,
        );

        setShowPinOverlay(
          false,
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <main className="relative min-h-screen bg-[#E7EBF0] text-[#4A4A4A]">
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-[110px] pt-12">
        <header className="relative flex items-center justify-center">
          <Link
            href="/transfers"
            className="absolute left-0 text-black/60"
          >
            <ArrowLeft
              size={21}
            />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em]">
            Send money
          </h1>
        </header>

        <form
          className="mt-6"
          onSubmit={(
            event,
          ) => {
            event.preventDefault();

            if (canSubmit) {
              setShowConfirmOverlay(
                true,
              );
            }
          }}
        >
          {/* FROM ACCOUNT */}

          <div>
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">
              From account
            </label>

            <div className="relative">
              <select
                value={
                  sourceAccountId
                }
                onChange={(
                  event,
                ) => {
                  setSourceAccountId(
                    event.target
                      .value,
                  );

                  setFxQuote(
                    null,
                  );
                }}
                disabled={
                  isLoading
                }
                className="h-[38px] w-full appearance-none rounded-[7px] bg-white/80 px-3 pr-9 text-[13px] outline-none"
              >
                {accounts.map(
                  (
                    account,
                  ) => (
                    <option
                      key={
                        account.id
                      }
                      value={
                        account.id
                      }
                    >
                      {
                        account.account_name
                      }{" "}
                      •{" "}
                      {
                        account.account_number
                      }{" "}
                      •{" "}
                      {
                        account.currency
                      }
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          {/* ACCOUNT NUMBER */}

          <div className="mt-5">
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">
              Account number
            </label>

            <input
              inputMode="numeric"
              value={
                accountNumber
              }
              onChange={(
                event,
              ) => {
                setAccountNumber(
                  event.target.value
                    .replace(
                      /\D/g,
                      "",
                    )
                    .slice(
                      0,
                      20,
                    ),
                );

                setDestination(
                  null,
                );

                setDestinationError(
                  null,
                );

                setFxQuote(
                  null,
                );
              }}
              placeholder="Destination account number"
              className="h-[35px] w-full rounded-[7px] bg-white/80 px-3 text-[15px] outline-none placeholder:text-black/25"
            />

            {transferType ===
              "internal" &&
              isLookingUpDestination && (
                <p className="mt-2 text-[11px] text-black/40">
                  Checking
                  account…
                </p>
              )}

            {transferType ===
              "internal" &&
              destination && (
                <div className="mt-2 rounded-[8px] bg-green-50 px-3 py-2 text-[11px] text-green-800">
                  <p className="font-bold">
                    {
                      destination.accountName
                    }
                  </p>

                  <p className="mt-0.5">
                    {
                      destination.accountType
                    }{" "}
                    •{" "}
                    {
                      destination.currency
                    }
                    {destination.isOwnAccount
                      ? " • Your account"
                      : ""}
                  </p>
                </div>
              )}

            {destinationError && (
              <p className="mt-2 text-[11px] text-red-600">
                {
                  destinationError
                }
              </p>
            )}

            {sameAccount && (
              <p className="mt-2 text-[11px] text-red-600">
                You cannot
                transfer money
                to the same
                account.
              </p>
            )}
          </div>

          {/* BENEFICIARY NAME */}

          <div className="mt-5">
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">
              Beneficiary
            </label>

            <input
              value={
                beneficiaryName
              }
              onChange={(
                event,
              ) =>
                setBeneficiaryName(
                  event.target
                    .value,
                )
              }
              readOnly={
                transferType ===
                "internal"
              }
              placeholder={
                transferType ===
                "internal"
                  ? "Account holder will appear automatically"
                  : "Beneficiary name"
              }
              className="h-[35px] w-full rounded-[7px] bg-white/80 px-3 text-[15px] outline-none placeholder:text-black/25 read-only:text-black/60"
            />
          </div>

          {/* EXTERNAL TRANSFER INFO */}

          {transferType ===
            "external" && (
            <div className="mt-4 rounded-[7px] bg-blue-50 px-3 py-3 text-[11px] leading-4 text-blue-800">
              <strong>
                {bankName}
              </strong>{" "}
              demo transfer.
              The sender balance
              and ledger will
              update, but no real
              bank settlement
              will occur.
            </div>
          )}

          {/* AMOUNT */}

          <div className="mt-5 grid grid-cols-[70px_1fr] gap-4">
            <div className="pt-[21px]">
              <div className="flex h-[31px] items-center justify-center rounded-full bg-white px-2 text-[12px] shadow-sm">
                {selectedAccount?.currency ||
                  "—"}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">
                Amount
              </label>

              <input
                inputMode="decimal"
                value={amount}
                onChange={(
                  event,
                ) => {
                  setAmount(
                    event.target.value.replace(
                      /[^\d.]/g,
                      "",
                    ),
                  );

                  setFxQuote(
                    null,
                  );
                }}
                placeholder="0.00"
                className="h-[35px] w-full rounded-[7px] bg-white/80 px-3 text-[15px] outline-none placeholder:text-black/25"
              />

              <p className="mt-1 text-right text-[11px] font-bold tracking-[0.04em] text-black/35">
                balance:
                <span className="ml-2 text-black/45">
                  {selectedAccount
                    ? formatMoney(
                        selectedAccount.balance,
                        selectedAccount.currency,
                      )
                    : "—"}
                </span>
              </p>
            </div>
          </div>

          {/* FX PREVIEW */}

          {requiresFx && (
            <div className="mt-5 rounded-[12px] border border-blue-100 bg-blue-50/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-black text-blue-950">
                  Currency
                  conversion
                </p>

                <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                  FX
                </span>
              </div>

              {isLoadingFxQuote ? (
                <p className="mt-3 text-[12px] text-blue-700">
                  Getting
                  exchange
                  rate…
                </p>
              ) : fxQuote ? (
                <>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-black/40">
                        You send
                      </p>

                      <p className="mt-1 text-[18px] font-black text-black/80">
                        {formatMoney(
                          fxQuote.source_amount,
                          fxQuote.source_currency,
                        )}
                      </p>
                    </div>

                    <span className="pb-1 text-black/30">
                      →
                    </span>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-black/40">
                        Recipient
                        gets
                      </p>

                      <p className="mt-1 text-[18px] font-black text-blue-700">
                        {formatMoney(
                          fxQuote.destination_amount,
                          fxQuote.destination_currency,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-blue-100 pt-3 text-[11px] text-black/50">
                    <div className="flex justify-between gap-4">
                      <span>
                        Exchange
                        rate
                      </span>

                      <span className="text-right font-bold text-black/65">
                        1{" "}
                        {
                          fxQuote.source_currency
                        }{" "}
                        ={" "}
                        {Number(
                          fxQuote.customer_rate,
                        ).toFixed(
                          4,
                        )}{" "}
                        {
                          fxQuote.destination_currency
                        }
                      </span>
                    </div>

                    {Number(
                      fxQuote.fee_amount,
                    ) >
                      0 && (
                      <div className="mt-1 flex justify-between">
                        <span>
                          FX fee
                        </span>

                        <span>
                          {formatMoney(
                            fxQuote.fee_amount,
                            fxQuote.source_currency,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : fxError ? (
                <p className="mt-3 text-[11px] text-red-600">
                  {fxError}
                </p>
              ) : (
                <p className="mt-3 text-[11px] text-blue-700">
                  Enter an
                  amount to get
                  your exchange
                  rate.
                </p>
              )}
            </div>
          )}

          {/* PURPOSE */}

          <div className="mt-5">
            <label className="mb-1 block font-heading text-[12px] font-black tracking-[0.05em]">
              Purpose
            </label>

            <textarea
              value={purpose}
              onChange={(
                event,
              ) =>
                setPurpose(
                  event.target.value.slice(
                    0,
                    255,
                  ),
                )
              }
              placeholder="What’s this for?"
              className="h-[118px] w-full resize-none rounded-[7px] bg-white/80 px-3 py-2 text-[15px] outline-none placeholder:text-black/25"
            />

            <p className="-mt-1 text-right text-[11px] font-bold text-black/20">
              Optional
            </p>
          </div>

          {/* ERRORS */}

          {error && (
            <div className="mt-4 rounded-[7px] border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700">
              {error}
            </div>
          )}

          {!isLoading &&
            accounts.length ===
              0 && (
              <div className="mt-4 rounded-[7px] bg-amber-50 px-3 py-3 text-[12px] text-amber-800">
                You need an
                active account
                before you can
                make a transfer.
              </div>
            )}

          {selectedAccount &&
            numericAmount >
              Number(
                selectedAccount.balance,
              ) && (
              <p className="mt-2 text-[11px] text-red-600">
                The amount
                exceeds your
                available
                balance.
              </p>
            )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              !canSubmit ||
              isSubmitting ||
              isLoading
            }
            className="mt-20 flex h-[43px] w-full items-center justify-center rounded-[8px] bg-[#2458E8] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
          >
            {isSubmitting
              ? "Sending…"
              : isLoadingFxQuote
                ? "Getting rate…"
                : "Send money"}
          </button>
        </form>
      </section>

      <BottomNav />

      <ConfirmTransactionOverlay
        open={
          showConfirmOverlay
        }
        amount={
          displayAmount
        }
        onClose={() =>
          setShowConfirmOverlay(
            false,
          )
        }
        onConfirmFingerprint={
          openPinFlow
        }
        onUsePin={
          openPinFlow
        }
      />

      <PinConfirmationOverlay
        open={
          showPinOverlay
        }
        pinIsSet={
          pinStatus?.isSet ??
          false
        }
        onClose={() =>
          setShowPinOverlay(
            false,
          )
        }
        onSubmit={(
          pin,
        ) =>
          void submitTransfer(
            pin,
          )
        }
        onForgotPin={() => {
          setShowPinOverlay(
            false,
          );

          setShowResetPin(
            true,
          );
        }}
        onCreatePin={() => {
          setShowPinOverlay(
            false,
          );

          setShowCreatePin(
            true,
          );
        }}
      />

      <CreateTransactionPinOverlay
        open={
          showCreatePin
        }
        onClose={() =>
          setShowCreatePin(
            false,
          )
        }
        onCreated={async () => {
          const status =
            await transactionPinService.status();

          setPinStatus(
            status,
          );

          setShowCreatePin(
            false,
          );

          setShowPinOverlay(
            true,
          );
        }}
      />

      <ResetTransactionPinOverlay
        open={
          showResetPin
        }
        onClose={() =>
          setShowResetPin(
            false,
          )
        }
        onReset={async () => {
          const status =
            await transactionPinService.status();

          setPinStatus(
            status,
          );

          setShowResetPin(
            false,
          );

          setShowPinOverlay(
            true,
          );
        }}
      />
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Create transaction PIN
|--------------------------------------------------------------------------
*/

function CreateTransactionPinOverlay({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated:
    () =>
      | void
      | Promise<void>;
}) {
  const [
    password,
    setPassword,
  ] = useState("");

  const [
    pin,
    setPin,
  ] = useState("");

  const [
    confirmPin,
    setConfirmPin,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setPin("");
      setConfirmPin("");
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const submit =
    async () => {
      if (!password) {
        setError(
          "Enter your account password.",
        );
        return;
      }

      if (
        !/^\d{4}$/.test(
          pin,
        )
      ) {
        setError(
          "PIN must be exactly 4 digits.",
        );
        return;
      }

      if (
        pin !== confirmPin
      ) {
        setError(
          "PIN confirmation does not match.",
        );
        return;
      }

      setBusy(true);
      setError("");

      try {
        await transactionPinService.setup(
          {
            password,
            pin,
          },
        );

        await onCreated();
      } catch (
        requestError
      ) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to create transaction PIN",
        );
      } finally {
        setBusy(false);
      }
    };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-5">
      <section className="w-full max-w-[380px] rounded-[18px] bg-white p-5 shadow-xl">
        <h2 className="text-center text-[18px] font-black">
          Create
          Transaction PIN
        </h2>

        <p className="mt-2 text-center text-[12px] text-black/50">
          Confirm your
          account password
          and create a
          4-digit PIN.
        </p>

        <input
          type="password"
          value={password}
          onChange={(
            event,
          ) =>
            setPassword(
              event.target
                .value,
            )
          }
          placeholder="Account password"
          className="mt-6 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
        />

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(
            event,
          ) =>
            setPin(
              event.target.value
                .replace(
                  /\D/g,
                  "",
                )
                .slice(
                  0,
                  4,
                ),
            )
          }
          placeholder="4-digit PIN"
          className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
        />

        <input
          type="password"
          inputMode="numeric"
          value={
            confirmPin
          }
          onChange={(
            event,
          ) =>
            setConfirmPin(
              event.target.value
                .replace(
                  /\D/g,
                  "",
                )
                .slice(
                  0,
                  4,
                ),
            )
          }
          placeholder="Confirm PIN"
          className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
        />

        {error && (
          <p className="mt-3 text-[12px] text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            void submit()
          }
          disabled={busy}
          className="mt-5 h-[44px] w-full rounded-[10px] bg-[#2458E8] font-bold text-white disabled:opacity-50"
        >
          {busy
            ? "Creating…"
            : "Create PIN"}
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

/*
|--------------------------------------------------------------------------
| Reset forgotten transaction PIN
|--------------------------------------------------------------------------
*/

function ResetTransactionPinOverlay({
  open,
  onClose,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  onReset:
    () =>
      | void
      | Promise<void>;
}) {
  const [
    requested,
    setRequested,
  ] = useState(false);

  const [
    code,
    setCode,
  ] = useState("");

  const [
    newPin,
    setNewPin,
  ] = useState("");

  const [
    confirmPin,
    setConfirmPin,
  ] = useState("");

  const [
    developmentCode,
    setDevelopmentCode,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      setRequested(
        false,
      );

      setCode("");
      setNewPin("");
      setConfirmPin("");
      setDevelopmentCode(
        "",
      );
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const requestCode =
    async () => {
      setBusy(true);
      setError("");

      try {
        const result =
          await transactionPinService.requestReset();

        setRequested(
          true,
        );

        setDevelopmentCode(
          result.developmentCode ||
            "",
        );
      } catch (
        requestError
      ) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to request PIN reset",
        );
      } finally {
        setBusy(false);
      }
    };

  const resetPin =
    async () => {
      if (
        !/^\d{6}$/.test(
          code,
        )
      ) {
        setError(
          "Enter the 6-digit reset code.",
        );
        return;
      }

      if (
        !/^\d{4}$/.test(
          newPin,
        )
      ) {
        setError(
          "New PIN must be exactly 4 digits.",
        );
        return;
      }

      if (
        newPin !==
        confirmPin
      ) {
        setError(
          "PIN confirmation does not match.",
        );
        return;
      }

      setBusy(true);
      setError("");

      try {
        await transactionPinService.reset(
          {
            code,
            newPin,
          },
        );

        await onReset();
      } catch (
        requestError
      ) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to reset transaction PIN",
        );
      } finally {
        setBusy(false);
      }
    };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-5">
      <section className="w-full max-w-[380px] rounded-[18px] bg-white p-5 shadow-xl">
        <h2 className="text-center text-[18px] font-black">
          Reset
          Transaction PIN
        </h2>

        {!requested ? (
          <>
            <p className="mt-2 text-center text-[12px] text-black/50">
              We’ll send a
              verification
              code to your
              registered
              email.
            </p>

            <button
              type="button"
              onClick={() =>
                void requestCode()
              }
              disabled={
                busy
              }
              className="mt-6 h-[44px] w-full rounded-[10px] bg-[#2458E8] font-bold text-white disabled:opacity-50"
            >
              {busy
                ? "Requesting…"
                : "Send reset code"}
            </button>
          </>
        ) : (
          <>
            {developmentCode && (
              <div className="mt-4 rounded-[10px] bg-amber-50 px-3 py-2 text-center text-[12px] font-semibold text-amber-800">
                Development
                OTP:{" "}
                {
                  developmentCode
                }
              </div>
            )}

            <input
              inputMode="numeric"
              value={code}
              onChange={(
                event,
              ) =>
                setCode(
                  event.target.value
                    .replace(
                      /\D/g,
                      "",
                    )
                    .slice(
                      0,
                      6,
                    ),
                )
              }
              placeholder="6-digit verification code"
              className="mt-5 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
            />

            <input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(
                event,
              ) =>
                setNewPin(
                  event.target.value
                    .replace(
                      /\D/g,
                      "",
                    )
                    .slice(
                      0,
                      4,
                    ),
                )
              }
              placeholder="New 4-digit PIN"
              className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
            />

            <input
              type="password"
              inputMode="numeric"
              value={
                confirmPin
              }
              onChange={(
                event,
              ) =>
                setConfirmPin(
                  event.target.value
                    .replace(
                      /\D/g,
                      "",
                    )
                    .slice(
                      0,
                      4,
                    ),
                )
              }
              placeholder="Confirm new PIN"
              className="mt-3 h-[44px] w-full rounded-[10px] border border-gray-200 px-3 outline-none"
            />

            <button
              type="button"
              onClick={() =>
                void resetPin()
              }
              disabled={
                busy
              }
              className="mt-5 h-[44px] w-full rounded-[10px] bg-[#2458E8] font-bold text-white disabled:opacity-50"
            >
              {busy
                ? "Resetting…"
                : "Reset PIN"}
            </button>
          </>
        )}

        {error && (
          <p className="mt-3 text-[12px] text-red-600">
            {error}
          </p>
        )}

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