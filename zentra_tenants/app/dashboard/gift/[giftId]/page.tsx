"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Gift as GiftIcon,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  bankingService,
} from "@/services/banking.service";

import {
  giftService,
} from "@/services/gift.service";

import type {
  BankAccount,
} from "@/types/banking.types";

import type {
  Gift,
  GiftStatus,
} from "@/types/gift.types";

type TimerOption =
  | "1_hour"
  | "6_hours"
  | "24_hours"
  | "3_days"
  | "10_days"
  | "custom";

const timerOptions: Array<{
  label: string;
  value: TimerOption;
}> = [
  {
    label: "1 Hour",
    value: "1_hour",
  },
  {
    label: "6 Hours",
    value: "6_hours",
  },
  {
    label: "24 Hours",
    value: "24_hours",
  },
  {
    label: "3 Days",
    value: "3_days",
  },
  {
    label: "10 Days",
    value: "10_days",
  },
  {
    label: "Custom",
    value: "custom",
  },
];

type EditForm = {
  accountId: string;
  amount: string;
  redemptionFee: string;
  senderName: string;
  message: string;
  timer: TimerOption;
  customExpiry: string;
};

const emptyForm: EditForm = {
  accountId: "",
  amount: "",
  redemptionFee: "",
  senderName: "",
  message: "",
  timer: "custom",
  customExpiry: "",
};

export default function GiftDetailsPage() {
    const router = useRouter();
  const { giftId } =
    useParams<{
      giftId: string;
    }>();

  const [
    gift,
    setGift,
  ] = useState<Gift | null>(
    null,
  );

  const [
    accounts,
    setAccounts,
  ] = useState<
    BankAccount[]
  >([]);

  const [
    form,
    setForm,
  ] =
    useState<EditForm>(
      emptyForm,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        if (!giftId) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const [
            giftResult,
            accountResult,
          ] =
            await Promise.all([
              giftService.get(
                giftId,
              ),

              bankingService.getTenantAccounts(),
            ]);

          setGift(
            giftResult,
          );

          const activeAccounts =
            accountResult.filter(
              (account) =>
                account.status ===
                "active",
            );

          setAccounts(
            activeAccounts,
          );

          const matchingAccount =
            activeAccounts.find(
              (account) =>
                account.id ===
                giftResult.client_account_id,
            );

          setForm({
            accountId:
              matchingAccount?.id ||
              giftResult.client_account_id,

            amount:
              String(
                giftResult.amount,
              ),

            redemptionFee:
              String(
                giftResult.redemption_fee ??
                  0,
              ),

            senderName:
              giftResult.sender_name,

            message:
              giftResult.message ??
              "",

            timer:
              "custom",

            customExpiry:
              toDateTimeLocal(
                giftResult.expires_at,
              ),
          });
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this gift.",
          );
        } finally {
          setLoading(false);
        }
      },
      [giftId],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            form.accountId,
        ) ?? null,
      [
        accounts,
        form.accountId,
      ],
    );

  const countdown =
    useCountdown(
      gift?.expires_at ??
        null,
    );

  const editable =
    gift?.status ===
      "pending" &&
    !countdown.expired;

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  const updateField = <
    K extends keyof EditForm,
  >(
    name: K,
    value: EditForm[K],
  ) => {
    setForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );

    setError("");
    setSuccess("");
  };

  const resolveEditedExpiry =
    () => {
      if (
        form.timer ===
        "custom"
      ) {
        if (
          !form.customExpiry
        ) {
          return null;
        }

        const date =
          new Date(
            form.customExpiry,
          );

        if (
          Number.isNaN(
            date.getTime(),
          )
        ) {
          return null;
        }

        return date.toISOString();
      }

      const durations: Record<
        Exclude<
          TimerOption,
          "custom"
        >,
        number
      > = {
        "1_hour":
          60 * 60 * 1000,

        "6_hours":
          6 *
          60 *
          60 *
          1000,

        "24_hours":
          24 *
          60 *
          60 *
          1000,

        "3_days":
          3 *
          24 *
          60 *
          60 *
          1000,

        "10_days":
          10 *
          24 *
          60 *
          60 *
          1000,
      };

      return new Date(
        Date.now() +
          durations[
            form.timer
          ],
      ).toISOString();
    };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const saveChanges =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !giftId ||
        !gift ||
        !editable
      ) {
        return;
      }

      setError("");
      setSuccess("");

      if (!selectedAccount) {
        setError(
          "Select a valid client account.",
        );

        return;
      }

      const amount =
        Number(
          form.amount,
        );

      const redemptionFee =
        Number(
          form.redemptionFee,
        );

      if (
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        setError(
          "Enter a valid gift amount.",
        );

        return;
      }

      if (
        !Number.isFinite(
          redemptionFee,
        ) ||
        redemptionFee < 0
      ) {
        setError(
          "Enter a valid redemption fee.",
        );

        return;
      }

      if (
        form.senderName.trim()
          .length < 2
      ) {
        setError(
          "Enter who the gift is from.",
        );

        return;
      }

      const expiresAt =
        resolveEditedExpiry();

      if (!expiresAt) {
        setError(
          "Enter a valid expiry time.",
        );

        return;
      }

      if (
        new Date(
          expiresAt,
        ).getTime() <=
        Date.now()
      ) {
        setError(
          "Expiry must be in the future.",
        );

        return;
      }

      setSaving(true);

      try {
        await giftService.update(
            giftId,
            {
                accountNumber:
                selectedAccount.account_number,

                amount,

                redemptionFee,

                currency:
                selectedAccount.currency,

                senderName:
                form.senderName.trim(),

                message:
                form.message.trim() ||
                null,

                expiresAt,
            },
            );

            /*
            * Return to the Gifted Funds page
            * and tell it which gift receipt
            * should be displayed.
            */
            router.push(
            `/dashboard/gift?giftId=${encodeURIComponent(
                giftId,
            )}&updated=1`,
            );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update gift.",
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  const cancelGift =
    async () => {
      if (
        !giftId ||
        !gift ||
        !editable
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Cancel this gift? The client will no longer be able to accept it.",
        );

      if (!confirmed) {
        return;
      }

      setCancelling(true);
      setError("");
      setSuccess("");

      try {
        const updated =
          await giftService.cancel(
            giftId,
          );

        setGift(
          updated,
        );

        setSuccess(
          "Gift cancelled successfully.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to cancel gift.",
        );
      } finally {
        setCancelling(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-5 py-7 text-[#222]">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="flex items-center justify-between">
          <Link
            href="/dashboard/gift"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-black/55"
          >
            <ArrowLeft
              size={17}
            />

            Back to Gifts
          </Link>

          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/35">
            Gift Management
          </span>
        </header>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-[12px] bg-green-50 px-4 py-3 text-[12px] font-medium text-green-700">
            <CheckCircle2
              size={16}
              className="mt-0.5"
            />

            {success}
          </div>
        )}

        {loading ? (
          <div className="mt-7 grid min-h-[420px] place-items-center rounded-[20px] bg-white shadow-sm">
            <Loader2
              size={30}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : gift ? (
          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <form
              onSubmit={
                saveChanges
              }
              className="rounded-[22px] bg-white p-5 shadow-sm md:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-[25px] font-black">
                    View / Edit Gift
                  </h1>

                  <p className="mt-1 text-[12px] text-black/40">
                    Reference:{" "}
                    {gift.id}
                  </p>
                </div>

                <StatusBadge
                  status={
                    gift.status
                  }
                />
              </div>

              {!editable && (
                <div className="mt-5 rounded-[12px] bg-[#F1F3F6] px-4 py-3 text-[11px] leading-5 text-black/50">
                  This gift can no
                  longer be edited
                  because it is{" "}
                  <strong>
                    {gift.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </strong>
                  .
                </div>
              )}

              <Field
                label="Client Account"
              >
                <select
                  value={
                    form.accountId
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "accountId",
                      event.target.value,
                    )
                  }
                  disabled={
                    !editable
                  }
                  className="h-[52px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[12px] font-semibold outline-none disabled:bg-[#F4F6F8] disabled:text-black/40"
                >
                  <option value="">
                    Select client
                  </option>

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
                        {formatAccount(
                          account,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Gift Amount"
              >
                <MoneyInput
                  currency={
                    selectedAccount?.currency ??
                    gift.currency
                  }
                  value={
                    form.amount
                  }
                  disabled={
                    !editable
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "amount",
                      value,
                    )
                  }
                />
              </Field>

              <Field
                label="Tier-2 Redemption Fee"
              >
                <MoneyInput
                  currency={
                    selectedAccount?.currency ??
                    gift.currency
                  }
                  value={
                    form.redemptionFee
                  }
                  disabled={
                    !editable
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "redemptionFee",
                      value,
                    )
                  }
                />

                <p className="mt-1 text-[9px] text-black/35">
                  This fee is
                  separate from the
                  gifted amount.
                </p>
              </Field>

              <Field
                label="Gift From"
              >
                <input
                  value={
                    form.senderName
                  }
                  disabled={
                    !editable
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "senderName",
                      event.target.value,
                    )
                  }
                  className="h-[52px] w-full rounded-[12px] border border-black/10 px-4 text-[13px] font-semibold outline-none disabled:bg-[#F4F6F8]"
                />
              </Field>

              <Field
                label="Message"
              >
                <textarea
                  value={
                    form.message
                  }
                  disabled={
                    !editable
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "message",
                      event.target.value,
                    )
                  }
                  maxLength={2000}
                  className="h-[110px] w-full resize-none rounded-[12px] border border-black/10 px-4 py-3 text-[12px] leading-5 outline-none disabled:bg-[#F4F6F8]"
                />
              </Field>

              {editable && (
                <Field
                  label="Response Timer"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {timerOptions.map(
                      (
                        option,
                      ) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() =>
                            updateField(
                              "timer",
                              option.value,
                            )
                          }
                          className={`h-[42px] rounded-[10px] border text-[10px] font-bold ${
                            form.timer ===
                            option.value
                              ? "border-[#2458E8] bg-[#EEF4FF] text-[#2458E8]"
                              : "border-black/10 text-black/45"
                          }`}
                        >
                          {
                            option.label
                          }
                        </button>
                      ),
                    )}
                  </div>
                </Field>
              )}

              {editable &&
                form.timer ===
                  "custom" && (
                  <Field
                    label="Custom Expiry"
                  >
                    <input
                      type="datetime-local"
                      value={
                        form.customExpiry
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "customExpiry",
                          event.target.value,
                        )
                      }
                      className="h-[52px] w-full rounded-[12px] border border-black/10 px-4 text-[12px] font-semibold outline-none"
                    />
                  </Field>
                )}

              {editable && (
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      cancelling
                    }
                    className="flex h-[46px] items-center justify-center gap-2 rounded-[11px] bg-[#2458E8] text-[12px] font-bold text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={15}
                      />
                    )}

                    Save Changes
                  </button>

                  <button
                    type="button"
                    disabled={
                      saving ||
                      cancelling
                    }
                    onClick={() =>
                      void cancelGift()
                    }
                    className="flex h-[46px] items-center justify-center gap-2 rounded-[11px] bg-red-50 text-[12px] font-bold text-red-600 disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2
                        size={15}
                      />
                    )}

                    Cancel Gift
                  </button>
                </div>
              )}
            </form>

            <section className="rounded-[22px] bg-white p-5 shadow-sm md:p-7">
              <div className="mx-auto grid h-[150px] w-[150px] place-items-center rounded-full bg-[#FFE446] shadow-md">
                <GiftIcon
                  size={64}
                  className="text-[#1375B9]"
                />
              </div>

              <h2 className="mt-5 text-center text-[22px] font-black">
                Gifted Funds
              </h2>

              <p className="mt-2 text-center text-[40px] font-black tracking-[-0.04em] text-[#49A476]">
                {formatMoney(
                  gift.amount,
                  gift.currency,
                )}
              </p>

              <StatusBadgeLarge
                status={
                  gift.status
                }
              />

              <CountdownCard
                countdown={
                  countdown
                }
              />

              <div className="mt-7 space-y-4">
                <ReceiptRow
                  label="Sent to"
                  value={
                    [
                      gift.client_first_name,
                      gift.client_middle_name,
                      gift.client_last_name,
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(" ") ||
                    gift.account_name ||
                    "Client"
                  }
                />

                <ReceiptRow
                  label="Account"
                  value={
                    gift.account_number
                      ? `•••• ${gift.account_number.slice(
                          -4,
                        )}`
                      : "—"
                  }
                />

                <ReceiptRow
                  label="Gift amount"
                  value={formatMoney(
                    gift.amount,
                    gift.currency,
                  )}
                  success
                />

                <ReceiptRow
                  label="Redemption fee"
                  value={formatMoney(
                    gift.redemption_fee,
                    gift.currency,
                  )}
                  danger
                />

                <ReceiptRow
                  label="Client receives"
                  value={formatMoney(
                    gift.amount,
                    gift.currency,
                  )}
                  success
                />

                <ReceiptRow
                  label="Expires"
                  value={
                    gift.expires_at
                      ? formatDateTime(
                          gift.expires_at,
                        )
                      : "No expiry"
                  }
                />

                <ReceiptRow
                  label="Transaction ID"
                  value={
                    gift.transaction_id ||
                    "Pending"
                  }
                />

                <ReceiptRow
                  label="Created"
                  value={formatDateTime(
                    gift.created_at,
                  )}
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| UI
|--------------------------------------------------------------------------
*/

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <label className="text-[11px] font-black text-black/55">
        {label}
      </label>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

function MoneyInput({
  currency,
  value,
  disabled,
  onChange,
}: {
  currency: string;
  value: string;
  disabled: boolean;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="flex h-[52px] overflow-hidden rounded-[12px] border border-black/10">
      <div className="grid min-w-[65px] place-items-center border-r border-black/10 text-[11px] font-black">
        {currency}
      </div>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="min-w-0 flex-1 px-4 text-[14px] font-bold outline-none disabled:bg-[#F4F6F8]"
      />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: GiftStatus;
}) {
  return (
    <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-[10px] font-black capitalize text-[#2458E8]">
      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function StatusBadgeLarge({
  status,
}: {
  status: GiftStatus;
}) {
  const labels: Record<
    GiftStatus,
    string
  > = {
    pending:
      "Awaiting client response",
    accepted:
      "Gift accepted",
    declined:
      "Gift declined",
    processed:
      "Gift processed",
    cancelled:
      "Gift cancelled",
    expired:
      "Gift expired",
  };

  return (
    <p className="mt-1 text-center text-[13px] font-bold text-[#2458E8]">
      {labels[status]}
    </p>
  );
}

function CountdownCard({
  countdown,
}: {
  countdown: Countdown;
}) {
  if (
    countdown.expired
  ) {
    return (
      <div className="mt-5 rounded-[12px] bg-red-50 py-4 text-center text-[12px] font-black text-red-600">
        Expired
      </div>
    );
  }

  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <TimeBox
        value={
          countdown.days
        }
        label="Days"
      />

      <Separator />

      <TimeBox
        value={
          countdown.hours
        }
        label="Hrs"
      />

      <Separator />

      <TimeBox
        value={
          countdown.minutes
        }
        label="Min"
      />

      <Separator />

      <TimeBox
        value={
          countdown.seconds
        }
        label="Sec"
      />
    </div>
  );
}

function Separator() {
  return (
    <span className="pb-5 text-[15px] font-black text-black/20">
      :
    </span>
  );
}

function TimeBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-[56px] rounded-[11px] border border-black/5 px-2 py-3 text-center shadow-sm">
      <p className="text-[20px] font-black tabular-nums">
        {String(
          value,
        ).padStart(
          2,
          "0",
        )}
      </p>

      <p className="mt-1 text-[8px] font-semibold text-black/40">
        {label}
      </p>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  danger = false,
  success = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-[11px] text-black/45">
        {label}
      </span>

      <span
        className={`max-w-[230px] text-right text-[12px] font-bold ${
          danger
            ? "text-red-500"
            : success
              ? "text-green-600"
              : "text-[#333]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Countdown
|--------------------------------------------------------------------------
*/

type Countdown = {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function useCountdown(
  expiresAt:
    | string
    | null,
): Countdown {
  const [
    now,
    setNow,
  ] = useState(
    Date.now(),
  );

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setNow(
            Date.now(),
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, []);

  if (!expiresAt) {
    return {
      expired: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const difference =
    new Date(
      expiresAt,
    ).getTime() -
    now;

  if (
    difference <= 0
  ) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds =
    Math.floor(
      difference /
        1000,
    );

  return {
    expired: false,

    days:
      Math.floor(
        totalSeconds /
          86400,
      ),

    hours:
      Math.floor(
        (
          totalSeconds %
          86400
        ) /
          3600,
      ),

    minutes:
      Math.floor(
        (
          totalSeconds %
          3600
        ) /
          60,
      ),

    seconds:
      totalSeconds %
      60,
  };
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function toDateTimeLocal(
  value:
    | string
    | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      offset,
  )
    .toISOString()
    .slice(
      0,
      16,
    );
}

function formatAccount(
  account:
    BankAccount,
) {
  const name =
    account.client_name ||
    account.account_name ||
    "Client";

  return `${name} — ••••${account.account_number.slice(
    -4,
  )} — ${account.currency}`;
}

function formatMoney(
  amount:
    | string
    | number,
  currency: string,
) {
  const numeric =
    Number(amount);

  try {
    return new Intl.NumberFormat(
      "en",
      {
        style:
          "currency",
        currency,
      },
    ).format(
      numeric,
    );
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}