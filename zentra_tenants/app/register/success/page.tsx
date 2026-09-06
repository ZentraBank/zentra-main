"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  completeTenantRegistration,
  type TenantRegistrationCompleteResponse,
} from "@/services/auth.service";

import {
  setTenantSlug,
} from "@/lib/tenant";

type PendingRegistration = {
  method: "email";
  email: string;
  phone: null;
  password: string;

  otpExpiresIn?: number;
  otpRequestedAt?: number;

  registrationToken?: string;
  registrationTokenExpiresIn?: number;

  emailVerified?: boolean;
  verifiedAt?: number;
};

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
};

const getErrorMessage = (
  error: unknown,
) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{
              message?: string;
            }>;
          };
        };
      }
    ).response;

    if (
      response?.data?.message
    ) {
      return response.data.message;
    }

    if (
      response?.data
        ?.errors?.[0]
        ?.message
    ) {
      return response.data
        .errors[0]
        .message as string;
    }
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Unable to complete registration. Please try again.";
};

const createOrganisationCode = (
  value: string,
) =>
  value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(
      0,
      100,
    );

export default function RegisterSuccessPage() {
  const [
    registration,
    setRegistration,
  ] =
    useState<PendingRegistration | null>(
      null,
    );

  const [
    registrationComplete,
    setRegistrationComplete,
  ] =
    useState<TenantRegistrationCompleteResponse | null>(
      null,
    );

  const [
    ownerFirstName,
    setOwnerFirstName,
  ] = useState("");

  const [
    ownerLastName,
    setOwnerLastName,
  ] = useState("");

  const [
    organisationName,
    setOrganisationName,
  ] = useState("");

  const [
    organisationCode,
    setOrganisationCode,
  ] = useState("");

  const [
    appName,
    setAppName,
  ] = useState("");

  const [
    primaryColor,
    setPrimaryColor,
  ] =
    useState("#2458E8");

  const [
    codeManuallyEdited,
    setCodeManuallyEdited,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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
  | Restore verified registration
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const raw =
      sessionStorage.getItem(
        "zentra_pending_tenant_registration",
      );

    if (!raw) {
      window.location.replace(
        "/register",
      );

      return;
    }

    try {
      const parsed =
        JSON.parse(
          raw,
        ) as PendingRegistration;

      const isValid =
        parsed.method ===
          "email" &&
        Boolean(
          parsed.email,
        ) &&
        Boolean(
          parsed.password,
        ) &&
        Boolean(
          parsed.registrationToken,
        ) &&
        parsed.emailVerified ===
          true;

      if (!isValid) {
        window.location.replace(
          "/register",
        );

        return;
      }

      setRegistration(
        parsed,
      );
    } catch {
      sessionStorage.removeItem(
        "zentra_pending_tenant_registration",
      );

      window.location.replace(
        "/register",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Organisation name -> organisation code
  |--------------------------------------------------------------------------
  */

  const handleOrganisationNameChange = (
    value: string,
  ) => {
    setOrganisationName(
      value,
    );

    if (
      !codeManuallyEdited
    ) {
      setOrganisationCode(
        createOrganisationCode(
          value,
        ),
      );
    }

    if (!appName) {
      setAppName(
        value,
      );
    }

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Organisation code
  |--------------------------------------------------------------------------
  */

  const handleOrganisationCodeChange = (
    value: string,
  ) => {
    setCodeManuallyEdited(
      true,
    );

    setOrganisationCode(
      createOrganisationCode(
        value,
      ),
    );

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Complete registration
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !registration
      ) {
        setError(
          "Your registration session could not be found. Please start again.",
        );

        return;
      }

      if (
        !registration.registrationToken
      ) {
        setError(
          "Your email verification is missing. Please verify your email again.",
        );

        return;
      }

      if (
        !ownerFirstName.trim()
      ) {
        setError(
          "Please enter your first name.",
        );

        return;
      }

      if (
        !ownerLastName.trim()
      ) {
        setError(
          "Please enter your last name.",
        );

        return;
      }

      if (
        organisationName
          .trim()
          .length <
        2
      ) {
        setError(
          "Please enter your organisation name.",
        );

        return;
      }

      if (
        organisationCode
          .trim()
          .length <
        2
      ) {
        setError(
          "Please enter a valid organisation code.",
        );

        return;
      }

      if (
        appName
          .trim()
          .length <
        2
      ) {
        setError(
          "Please enter your application name.",
        );

        return;
      }

      setSubmitting(
        true,
      );

      setError("");

      try {
        const result =
          await completeTenantRegistration(
            {
              email:
                registration.email,

              registrationToken:
                registration.registrationToken,

              ownerFirstName:
                ownerFirstName.trim(),

              ownerLastName:
                ownerLastName.trim(),

              ownerPassword:
                registration.password,

              name:
                organisationName.trim(),

              code:
                organisationCode.trim(),

              appName:
                appName.trim(),

              logoUrl:
                null,

              primaryColor,
            },
          );

                  /*
          |--------------------------------------------------------------------------
          | Bind browser to newly created tenant
          |--------------------------------------------------------------------------
          */

          setTenantSlug(
            result.tenant.code,
          );
  
        const onboardingContext:
          TenantOnboardingContext = {
          tenantId:
            result.tenant.id,

          tenantName:
            result.tenant.name,

          tenantCode:
            result.tenant.code,

          temporaryDomain:
            result.tenant
              .temporaryDomain,

          ownerId:
            result.owner.id,

          membershipId:
            result.owner.membershipId,

          email:
            result.owner.email,

          onboardingToken:
            result.onboardingToken,

          onboardingTokenExpiresIn:
            result.onboardingTokenExpiresIn,

          onboardingStartedAt:
            Date.now(),

          nextStep:
            result.nextStep,
        };

        sessionStorage.setItem(
          "zentra_tenant_onboarding",
          JSON.stringify(
            onboardingContext,
          ),
        );

        sessionStorage.removeItem(
          "zentra_pending_tenant_registration",
        );

        setRegistrationComplete(
          result,
        );
      } catch (
        error
      ) {
        setError(
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-5 text-white"
        style={{
          backgroundImage:
            "url('/images/Background.png')",

          backgroundRepeat:
            "no-repeat",

          backgroundSize:
            "cover",

          backgroundPosition:
            "top right",
        }}
      >
        <div className="flex items-center gap-3 rounded-xl bg-black/90 px-6 py-4">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span className="text-sm font-semibold">
            Loading registration...
          </span>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Core tenant registration complete
  |--------------------------------------------------------------------------
  */

  if (
    registrationComplete
  ) {
    return (
      <main
        className="relative min-h-screen overflow-hidden px-5 pb-10 pt-[120px] text-white md:flex md:items-center md:justify-center md:pt-0"
        style={{
          backgroundImage:
            "url('/images/Background.png')",

          backgroundRepeat:
            "no-repeat",

          backgroundSize:
            "cover",

          backgroundPosition:
            "top right",
        }}
      >
        <section className="relative mx-auto max-w-[360px] rounded-[16px] border-[4px] border-[#d6c51f] bg-black px-5 pb-7 pt-6 shadow-2xl md:max-w-[480px] md:p-10">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </div>

          <h1 className="font-heading mt-5 text-center text-[22px] font-black leading-tight text-white md:text-[28px]">
            Organisation Created
          </h1>

          <p className="font-body mt-4 text-center text-[14px] font-medium leading-[20px] text-white/75 md:text-[15px]">
            Your organisation has
            been created successfully.
            Choose a subscription plan
            to continue setting up
            your account.
          </p>

          <div className="mx-auto my-5 w-[86%] border-b border-white/20" />

          <div className="space-y-3 rounded-[12px] border border-white/10 bg-white/5 p-4 md:p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
                Organisation
              </p>

              <p className="mt-1 text-[14px] font-bold md:text-[15px]">
                {
                  registrationComplete
                    .tenant
                    .name
                }
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
                Organisation Code
              </p>

              <p className="mt-1 text-[14px] font-bold md:text-[15px]">
                {
                  registrationComplete
                    .tenant
                    .code
                }
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
                Temporary Domain
              </p>

              <p className="mt-1 break-all text-[13px] font-bold text-[#8dabff] md:text-[14px]">
                {
                  registrationComplete
                    .tenant
                    .temporaryDomain
                }
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
                Registration Status
              </p>

              <div className="mt-1 inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-[12px] font-bold text-blue-300">
                Subscription required
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-[12px] leading-[18px] text-white/55 md:text-[13px]">
            Select the subscription
            package that best suits
            your organisation to
            continue.
          </p>

          <Link
            href="/subscribe/details"
            className="font-heading mt-6 flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#2458e8] text-[15px] font-bold text-white transition hover:bg-[#1f4fd3] md:h-[46px]"
          >
            Continue to Subscription

            <ArrowRight
              size={17}
            />
          </Link>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Tenant setup form
  |--------------------------------------------------------------------------
  */

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-12 pt-[80px] text-white md:flex md:items-center md:justify-center md:py-12"
      style={{
        backgroundImage:
          "url('/images/Background.png')",

        backgroundRepeat:
          "no-repeat",

        backgroundSize:
          "cover",

        backgroundPosition:
          "top right",
      }}
    >
      <Link
        href="/register/otp"
        className="absolute left-4 top-12 z-30 text-white transition hover:text-white/70 md:left-8 md:top-8"
      >
        <ArrowLeft
          size={22}
        />
      </Link>

      <section className="relative mx-auto max-w-[390px] rounded-[16px] border-[4px] border-[#d6c51f] bg-black/95 px-5 pb-7 pt-6 shadow-2xl md:max-w-[560px] md:p-10">
        <h1 className="font-heading text-center text-[22px] font-black leading-none text-white md:text-[28px]">
          Set Up Your
          Organisation
        </h1>

        <p className="font-body mt-3 text-center text-[13px] font-medium leading-[19px] text-white/65 md:text-[14px]">
          Your email has been
          verified. Complete your
          organisation details before
          choosing your subscription.
        </p>

        <div className="mt-5 flex justify-center md:hidden">
          <Image
            src="/images/success.png"
            alt="Organisation setup"
            width={242}
            height={143}
            className="h-[125px] w-[220px] object-cover"
            priority
          />
        </div>

        {registration?.email && (
          <div className="mt-4 rounded-[10px] border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
            <p className="text-[11px] font-semibold text-green-300">
              Verified email
            </p>

            <p className="mt-1 break-all text-[12px] font-bold text-white">
              {
                registration.email
              }
            </p>
          </div>
        )}

        <div className="mx-auto my-5 w-[92%] border-b border-white/20" />

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4 md:space-y-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ownerFirstName"
                className="mb-2 block text-[12px] font-bold text-white/80"
              >
                First name
              </label>

              <input
                id="ownerFirstName"
                type="text"
                autoComplete="given-name"
                value={
                  ownerFirstName
                }
                disabled={
                  submitting
                }
                onChange={(
                  event,
                ) => {
                  setOwnerFirstName(
                    event.target.value,
                  );

                  setError("");
                }}
                className="h-[42px] w-full rounded-[10px] border border-white/15 bg-white/10 px-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/20 disabled:opacity-60 md:h-[44px]"
                placeholder="First name"
              />
            </div>

            <div>
              <label
                htmlFor="ownerLastName"
                className="mb-2 block text-[12px] font-bold text-white/80"
              >
                Last name
              </label>

              <input
                id="ownerLastName"
                type="text"
                autoComplete="family-name"
                value={
                  ownerLastName
                }
                disabled={
                  submitting
                }
                onChange={(
                  event,
                ) => {
                  setOwnerLastName(
                    event.target.value,
                  );

                  setError("");
                }}
                className="h-[42px] w-full rounded-[10px] border border-white/15 bg-white/10 px-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/20 disabled:opacity-60 md:h-[44px]"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="organisationName"
              className="mb-2 block text-[12px] font-bold text-white/80"
            >
              Organisation name
            </label>

            <input
              id="organisationName"
              type="text"
              value={
                organisationName
              }
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                handleOrganisationNameChange(
                  event.target.value,
                )
              }
              className="h-[42px] w-full rounded-[10px] border border-white/15 bg-white/10 px-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/20 disabled:opacity-60 md:h-[44px]"
              placeholder="Example Bank Ltd"
            />
          </div>

          <div>
            <label
              htmlFor="organisationCode"
              className="mb-2 block text-[12px] font-bold text-white/80"
            >
              Organisation code
            </label>

            <input
              id="organisationCode"
              type="text"
              value={
                organisationCode
              }
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                handleOrganisationCodeChange(
                  event.target.value,
                )
              }
              className="h-[42px] w-full rounded-[10px] border border-white/15 bg-white/10 px-3 text-[13px] lowercase text-white outline-none transition placeholder:text-white/30 focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/20 disabled:opacity-60 md:h-[44px]"
              placeholder="example-bank"
            />

            <p className="mt-1 text-[10px] leading-[15px] text-white/40">
              Used to identify your
              organisation and temporary
              tenant domain.
            </p>
          </div>

          <div>
            <label
              htmlFor="appName"
              className="mb-2 block text-[12px] font-bold text-white/80"
            >
              Banking app name
            </label>

            <input
              id="appName"
              type="text"
              value={
                appName
              }
              disabled={
                submitting
              }
              onChange={(
                event,
              ) => {
                setAppName(
                  event.target.value,
                );

                setError("");
              }}
              className="h-[42px] w-full rounded-[10px] border border-white/15 bg-white/10 px-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-[#d6c51f] focus:ring-2 focus:ring-[#d6c51f]/20 disabled:opacity-60 md:h-[44px]"
              placeholder="Example Bank"
            />
          </div>

          <div>
            <label
              htmlFor="primaryColor"
              className="mb-2 block text-[12px] font-bold text-white/80"
            >
              Brand colour
            </label>

            <div className="flex items-center gap-3">
              <input
                id="primaryColor"
                type="color"
                value={
                  primaryColor
                }
                disabled={
                  submitting
                }
                onChange={(
                  event,
                ) => {
                  setPrimaryColor(
                    event.target.value,
                  );

                  setError("");
                }}
                className="h-[42px] w-[55px] cursor-pointer rounded-[8px] border border-white/15 bg-white/10 p-1 disabled:opacity-60 md:h-[44px]"
              />

              <input
                type="text"
                value={
                  primaryColor
                }
                readOnly
                className="h-[42px] flex-1 rounded-[10px] border border-white/15 bg-white/5 px-3 text-[13px] uppercase text-white/70 outline-none md:h-[44px]"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 px-3 py-3">
              <p className="text-center text-[12px] font-semibold leading-[17px] text-red-400">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting
            }
            className="font-heading flex h-[44px] w-full items-center justify-center rounded-[10px] bg-[#2458e8] text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(36,88,232,0.35)] transition hover:bg-[#1f4fd3] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 md:h-[48px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Creating
                organisation...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}