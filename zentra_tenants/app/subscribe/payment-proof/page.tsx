"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  UploadCloud,
  XCircle,
} from "lucide-react";

type PlanCode =
  | "bronze"
  | "gold"
  | "diamond";

type TenantOnboardingContext = {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  temporaryDomain: string;

  ownerId: string;
  membershipId: string;
  email: string;

  onboardingToken: string;
  onboardingTokenExpiresIn: number;
  onboardingStartedAt: number;

  nextStep: string;

  subscriptionRequestId?: string;
  selectedPlan?: PlanCode;

  paymentProofFileId?: string;
};

const plans: Record<
  PlanCode,
  {
    name: string;
    price: string;
    amount: number;
  }
> = {
  bronze: {
    name: "Bronze Plan",
    price: "$40",
    amount: 40,
  },

  gold: {
    name: "Gold Plan",
    price: "$80",
    amount: 80,
  },

  diamond: {
    name: "Diamond Plan",
    price: "$120",
    amount: 120,
  },
};

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";
const isPlanCode = (
  value: string,
): value is PlanCode => {
  return [
    "bronze",
    "gold",
    "diamond",
  ].includes(value);
};

export default function PaymentProofPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <Loader2
            size={28}
            className="animate-spin"
          />
        </main>
      }
    >
      <PaymentProofContent />
    </Suspense>
  );
}

function PaymentProofContent() {
  const searchParams =
    useSearchParams();

  const requestedPlan =
    (
      searchParams.get("plan") ||
      "bronze"
    ).toLowerCase();

  const selectedPlan: PlanCode =
    isPlanCode(requestedPlan)
      ? requestedPlan
      : "bronze";

  const currentPlan =
    plans[selectedPlan];

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    onboarding,
    setOnboarding,
  ] =
    useState<TenantOnboardingContext | null>(
      null,
    );

  const [
    loadingContext,
    setLoadingContext,
  ] =
    useState(true);

  const [
    proofFile,
    setProofFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Restore onboarding context
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(
          "zentra_tenant_onboarding",
        );

      if (!stored) {
        setOnboarding(
          null,
        );

        return;
      }

      const parsed =
        JSON.parse(
          stored,
        ) as TenantOnboardingContext;

            if (
        !parsed.tenantId ||
        !parsed.tenantName ||
        !parsed.email ||
        !parsed.onboardingToken ||
        !parsed.onboardingStartedAt ||
        !parsed.onboardingTokenExpiresIn ||
        !parsed.subscriptionRequestId
      ) {
        setOnboarding(
          null,
        );

        return;
      }

      const expiresAt =
        parsed.onboardingStartedAt +
        parsed.onboardingTokenExpiresIn *
          1000;

      if (
        Date.now() >=
        expiresAt
      ) {
        sessionStorage.removeItem(
          "zentra_tenant_onboarding"
        );

        setOnboarding(
          null,
        );

        return;
      }

      setOnboarding(
        parsed,
      );
    } catch (
      restoreError
    ) {
      console.error(
        "Unable to restore tenant onboarding context:",
        restoreError,
      );

      setOnboarding(
        null,
      );
    } finally {
      setLoadingContext(
        false,
      );
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Select payment proof
  |--------------------------------------------------------------------------
  */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSubmitted(false);

    if (
      !ACCEPTED_FILE_TYPES.includes(
        file.type,
      )
    ) {
      setProofFile(
        null,
      );

      setError(
        "Please upload a PNG, JPG, JPEG or PDF file.",
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setProofFile(
        null,
      );

      setError(
        "The payment proof must not exceed 10MB.",
      );

      event.target.value =
        "";

      return;
    }

    setProofFile(
      file,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Replace payment proof
  |--------------------------------------------------------------------------
  */

  const handleReplaceFile =
    () => {
      setError("");
      setSubmitted(false);

      fileInputRef.current?.click();
    };

  /*
  |--------------------------------------------------------------------------
  | Submit payment proof
  |--------------------------------------------------------------------------
  |
  | We intentionally do not send tenantId directly as trusted authorization.
  |
  | The backend subscription/payment endpoint still needs to be wired to a
  | secure onboarding identity/token before this becomes a real upload.
  |
  */

   /*
  |--------------------------------------------------------------------------
  | Submit payment proof
  |--------------------------------------------------------------------------
  |
  | Step 1:
  | Upload the actual file to private storage.
  |
  | Step 2:
  | Attach the returned private file ID to the subscription request.
  |
  */

  const handleSubmit =
    async () => {
      if (
        !proofFile ||
        !onboarding ||
        !onboarding.subscriptionRequestId ||
        submitting
      ) {
        return;
      }

      setError("");
      setSubmitting(true);

      try {
        /*
        |--------------------------------------------------------------------------
        | Step 1 - Upload private payment proof
        |--------------------------------------------------------------------------
        */

        const formData =
          new FormData();

        formData.append(
          "file",
          proofFile
        );

        const uploadResponse =
          await fetch(
            `${API_BASE_URL}/subscriptions/onboarding/payment-proof/upload`,
            {
              method:
                "POST",

              headers: {
                "X-Onboarding-Token":
                  onboarding.onboardingToken,
              },

              body:
                formData,
            }
          );

        const uploadPayload =
          await uploadResponse
            .json()
            .catch(
              () => null
            );

        if (!uploadResponse.ok) {
          throw new Error(
            uploadPayload?.message ||
              "Unable to upload payment proof"
          );
        }

        const paymentProofFileId =
          uploadPayload?.data
            ?.fileId;

        if (
          !paymentProofFileId
        ) {
          throw new Error(
            "The server did not return a payment proof file ID"
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Step 2 - Submit proof against subscription request
        |--------------------------------------------------------------------------
        */

        const proofResponse =
          await fetch(
            `${API_BASE_URL}/subscriptions/onboarding/requests/${onboarding.subscriptionRequestId}/payment-proof`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                "X-Onboarding-Token":
                  onboarding.onboardingToken,
              },

              body:
                JSON.stringify({
                  paymentReference:
                    `PROOF-${Date.now()}`,

                  paymentProofFileId,

                  paymentNote:
                    `Payment proof submitted for ${currentPlan.name}`,
                }),
            }
          );

        const proofPayload =
          await proofResponse
            .json()
            .catch(
              () => null
            );

        if (!proofResponse.ok) {
          throw new Error(
            proofPayload?.message ||
              "Unable to submit payment proof"
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Preserve updated onboarding state
        |--------------------------------------------------------------------------
        */

        const updatedOnboarding: TenantOnboardingContext =
          {
            ...onboarding,

            paymentProofFileId,

            nextStep:
              "awaiting_subscription_review",
          };

        sessionStorage.setItem(
          "zentra_tenant_onboarding",
          JSON.stringify(
            updatedOnboarding
          )
        );

        setOnboarding(
          updatedOnboarding
        );

        setSubmitted(
          true
        );
      } catch (
        submitError
      ) {
        console.error(
          "Unable to submit payment proof:",
          submitError
        );

        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to submit payment proof."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loadingContext) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin"
          />

          <p className="text-[12px] text-white/70">
            Loading payment
            information...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Missing onboarding context
  |--------------------------------------------------------------------------
  */

  if (!onboarding) {
    return (
      <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-5 text-white">
        <Image
          src="/images/Background_1.png"
          alt="Background"
          fill
          priority
          className="pointer-events-none object-cover"
        />

        <div className="relative z-10 w-full max-w-[390px] rounded-2xl border border-white/10 bg-black/80 px-5 py-8 text-center">
          <XCircle
            size={48}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-4 text-[22px] font-extrabold">
            Registration
            information unavailable
          </h1>

          <p className="mt-3 text-[13px] leading-5 text-white/65">
            We could not determine
            which organisation this
            payment belongs to.
            Complete organisation
            registration before
            continuing.
          </p>

          <Link
            href="/register"
            className="mt-6 flex h-[44px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold text-white"
          >
            Return to Registration
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-3 pb-6 pt-5">
        {/* Header */}

        <header className="relative flex items-center justify-center">
          <Link
            href={`/subscribe/checkout?plan=${selectedPlan}`}
            className="absolute left-1 text-white"
          >
            <ArrowLeft
              size={19}
            />
          </Link>

          <h2 className="text-[12px] font-bold">
            Upload Payment Proof
          </h2>
        </header>

        {/* Heading */}

        <section className="mt-8 text-center">
          <h1 className="text-[31px] font-extrabold leading-[34px] tracking-[-0.5px]">
            Confirm Your Payment
          </h1>

          <p className="mx-auto mt-3 max-w-[310px] text-[13px] font-bold leading-[17px] text-white/85">
            Upload your crypto
            payment receipt so your
            subscription can be
            confirmed and activated.
          </p>
        </section>

        {/* Organisation */}

        <section className="mt-5 rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
            Organisation
          </p>

          <p className="mt-1 text-[13px] font-extrabold">
            {
              onboarding.tenantName
            }
          </p>

          <p className="mt-1 text-[11px] text-white/55">
            {
              onboarding.email
            }
          </p>
        </section>

        {/* Subscription Summary */}

        <section className="relative mt-4 overflow-hidden rounded-xl border border-orange-500 bg-black/45 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
          <Image
            src="/images/payment-2.png"
            alt=""
            fill
            className="object-cover opacity-65"
          />

          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-y-2 px-4 py-4 text-[12px] font-medium">
            <span>
              Subscription:
            </span>

            <span className="font-extrabold">
              {
                currentPlan.name
              }
            </span>

            <span>
              Amount Paid:
            </span>

            <span className="text-[22px] font-extrabold leading-5">
              {
                currentPlan.price
              }
            </span>

            <span>
              Status:
            </span>

            <span
              className={`font-extrabold ${
                submitted
                  ? "text-green-300"
                  : "text-yellow-300"
              }`}
            >
              {submitted
                ? "Proof Submitted"
                : "Awaiting Confirmation"}
            </span>
          </div>
        </section>

        {/* Upload */}

        <section className="mt-5 rounded-t-[24px] bg-white px-4 pb-6 pt-5 text-black shadow-[0_0_18px_rgba(255,255,255,0.35)]">
          <input
            ref={
              fileInputRef
            }
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf,.png,.jpg,.jpeg,.webp,.pdf"
            onChange={
              handleFileChange
            }
            className="hidden"
          />

          {/* Error */}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-3 text-left">
              <XCircle
                size={18}
                className="mt-[1px] shrink-0 text-red-600"
              />

              <p className="text-[11px] font-semibold leading-4 text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* No file */}

          {!proofFile && (
            <>
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-blue-700 bg-blue-50 px-4 text-center"
              >
                <UploadCloud
                  size={46}
                  className="text-blue-700"
                />

                <p className="mt-3 text-[15px] font-extrabold">
                  Upload receipt or
                  screenshot
                </p>

                <p className="mt-1 text-[11px] font-semibold text-black/55">
                  PNG, JPG, JPEG or
                  PDF accepted
                </p>

                <p className="mt-1 text-[10px] font-semibold text-black/40">
                  Maximum file size:
                  10MB
                </p>
              </button>

              <p className="mt-4 text-center text-[11px] font-semibold leading-[15px] text-black/55">
                Your subscription
                will be activated
                after your payment
                proof has been
                reviewed.
              </p>
            </>
          )}

          {/* File selected */}

          {proofFile &&
            !submitted && (
              <div className="text-center">
                <CheckCircle
                  size={54}
                  className="mx-auto text-green-700"
                />

                <h2 className="mt-3 text-[19px] font-black text-green-700">
                  Proof Ready to
                  Submit
                </h2>

                <p className="mx-auto mt-2 max-w-[290px] text-[12px] font-bold leading-[16px] text-black/60">
                  Your file has been
                  selected. Click
                  below to confirm
                  your upload.
                </p>

                <div className="mx-auto mt-4 flex max-w-[290px] items-center gap-2 rounded-xl bg-white px-3 py-3 shadow-sm">
                  <FileText
                    size={18}
                    className="shrink-0 text-blue-700"
                  />

                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[12px] font-bold text-black">
                      {
                        proofFile.name
                      }
                    </p>

                    <p className="mt-1 text-[10px] text-black/45">
                      {(
                        proofFile.size /
                        1024 /
                        1024
                      ).toFixed(
                        2,
                      )}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={
                      handleSubmit
                    }
                    className="flex h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Submitting...
                      </>
                    ) : (
                      "Confirm and Submit Upload"
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={
                      handleReplaceFile
                    }
                    className="flex h-[40px] w-full items-center justify-center rounded-xl bg-black/10 text-[13px] font-bold text-black disabled:opacity-50"
                  >
                    Replace File
                  </button>
                </div>
              </div>
            )}

          {/* Submitted */}

          {proofFile &&
            submitted && (
              <div className="text-center">
                <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-green-100">
                  <CheckCircle
                    size={38}
                    className="text-green-700"
                  />
                </div>

                <h2 className="mt-4 text-[24px] font-black leading-7 text-blue-700">
                  Upload Confirmed
                </h2>

                <p className="mx-auto mt-3 max-w-[310px] text-[12px] font-bold leading-[17px] text-black/65">
                  Your proof of
                  payment has been
                  received. Our admin
                  team will review
                  your receipt and
                  confirm your
                  subscription.
                </p>

                <div className="mt-5 rounded-[16px] bg-[#F4F6FA] px-4 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Clock
                      size={18}
                      className="text-yellow-600"
                    />

                    <h3 className="text-[14px] font-black">
                      Pending Review
                    </h3>
                  </div>

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[12px] font-semibold leading-[16px] text-black/65">
                    <li>
                      Your receipt
                      will be reviewed
                      for payment
                      confirmation.
                    </li>

                    <li>
                      Your
                      subscription
                      will be
                      activated after
                      approval.
                    </li>

                    <li>
                      You may receive
                      a notification
                      after
                      activation.
                    </li>

                    <li>
                      Keep your
                      payment receipt
                      until your
                      account is
                      activated.
                    </li>
                  </ul>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href={`/subscribe/status?plan=${selectedPlan}`}
                    className="flex h-[43px] w-full items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold !text-white"
                  >
                    View Subscription
                    Status
                  </Link>

                  <Link
                    href="/support"
                    className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-blue-700 bg-white text-[13px] font-bold !text-blue-700"
                  >
                    <MessageCircle
                      size={17}
                    />

                    Chat Help Line
                  </Link>

                  <Link
                    href={`/subscribe/details?plan=${selectedPlan}`}
                    className="flex h-[40px] w-full items-center justify-center rounded-xl bg-black/10 text-[13px] font-bold !text-black"
                  >
                    Back to
                    Subscription
                  </Link>
                </div>

                <p className="mt-4 text-[11px] font-semibold leading-[15px] text-black/55">
                  While waiting, you
                  can chat the help
                  line if you need
                  support or feel
                  unsure.
                </p>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}