/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

type PodClaim = {
  deceasedName: string;
  deceasedDob: string;
  deceasedSsn: string;
  accountNumber: string;

  beneficiaryName: string;
  beneficiaryDob: string;
  relationship: string;
  contactDetails: string;

  idType: string;
  idNumber: string;
  idExpiryDate: string;

  claimStatement: string;
  paymentMethod: string;

  w9Document: string;
  proofOfAddress: string;
  identityDocument: string;
  signatureDocument: string;
  signatureDate: string;

  indemnityOne: boolean;
  indemnityTwo: boolean;
};

const defaultClaim: PodClaim = {
  deceasedName: "MacGregory Thyler",
  deceasedDob: "July 3rd, 1993",
  deceasedSsn: "20937048098320032",
  accountNumber: "6527929377",

  beneficiaryName: "Johnson Thyler",
  beneficiaryDob: "Saturday, February 4th, 2001",
  relationship: "Son",
  contactDetails: "6527929377",

  idType: "Passport",
  idNumber: "6219489",
  idExpiryDate: "July 6th, 2030",

  claimStatement:
    "I confirm that the account holder is deceased, I am the named POD beneficiary, and all the information provided is true and correct.",

  paymentMethod: "Transfer to your bank account (ACH/Wire)",

  w9Document: "IRS-W9-form.pdf",
  proofOfAddress: "proof-of-address.pdf",
  identityDocument: "identity-verification.pdf",
  signatureDocument: "signature.png",
  signatureDate: "July 16th, 2026",

  indemnityOne: true,
  indemnityTwo: true,
};

export default function PodClaimManagerPage() {
  const [claim, setClaim] = useState<PodClaim>(defaultClaim);
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const savedClaim = localStorage.getItem("pod-claim");

    if (!savedClaim) return;

    try {
      const parsedClaim = JSON.parse(savedClaim) as Partial<PodClaim>;

      setClaim((previousClaim) => ({
        ...previousClaim,
        ...parsedClaim,
      }));
    } catch (error) {
      console.error("Unable to read the saved POD claim:", error);
    }
  }, []);

  const handleSendNotification = async () => {
    if (notificationSent || isSending) return;

    setIsSending(true);

    try {
      /*
        Connect this to your backend later:

        const response = await fetch("/api/notifications/pod-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountNumber: claim.accountNumber,
            beneficiaryName: claim.beneficiaryName,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to send notification.");
        }
      */

      await new Promise((resolve) => setTimeout(resolve, 600));

      setNotificationSent(true);
    } catch (error) {
      console.error("Unable to send notification:", error);
      alert("The notification could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="POD claim background"
        fill
        priority
        className="fixed object-cover object-center"
      />

      <div className="fixed inset-0 bg-black/10" />

      <div className="relative z-10 mx-auto min-h-[100svh] w-full max-w-[380px] px-5 pb-8 pt-10">
        {/* Header */}
        <header className="relative flex items-center justify-center">
          <Link
            href="/nok"
            aria-label="Go back"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={21} />
          </Link>

          <p className="font-sf-condensed text-[13px] font-semibold tracking-[0.08em]">
            Next-of-kin Management
          </p>
        </header>

        {/* Page title */}
        <section className="mt-5 text-center">
          <h1 className="font-sf-condensed text-[38px] font-medium leading-[1.05] tracking-[-1px]">
            McGregory&apos;s Next-
            <br />
            of-Kin
          </h1>

          <h2 className="mt-4 font-sf-condensed font-semibold text-[24px] text-[#2563EB]">
            POD Claim Form
          </h2>
        </section>

        {/* Read-only POD form */}
        <section className="mt-4 overflow-hidden rounded-[9px] border shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
          <div className=" px-5 py-4">
            <p className="mx-auto max-w-[310px] text-center font-lato text-[14px] leading-[17px] text-white">
              This is the next-of-kin POD form information that has been
              provided for the funds redemption. You may now choose to use this
              information to communicate with this client.
            </p>
          </div>

          <FormSection title="Deceased Account Holder Information">
            <DetailsRow label="Full name:" value={claim.deceasedName} />
            <DetailsRow label="Born:" value={claim.deceasedDob} />
            <DetailsRow label="SSN:" value={claim.deceasedSsn} />
            <DetailsRow
              label="Account number:"
              value={claim.accountNumber}
            />
          </FormSection>

          <FormSection title="Beneficiary (Claimant) Information">
            <DetailsRow
              label="Full legal name:"
              value={claim.beneficiaryName}
            />

            <DetailsRow
              label="Date of birth:"
              value={claim.beneficiaryDob}
            />

            <DetailsRow
              label="Relationship to deceased:"
              value={claim.relationship}
            />

            <DetailsRow
              label="Contact details:"
              value={claim.contactDetails}
            />
          </FormSection>

          <FormSection title="Identification Detail" showChevron>
            <div className="rounded-[7px] border border-black/10 bg-white p-2 shadow-sm">
              <h4 className="mb-2 font-sf-condensed text-[13px] font-black tracking-[0.04em] text-[#666]">
                Government-issued ID
              </h4>

              <DetailsRow
                label="ID type:"
                value={claim.idType}
                shaded
              />

              <DetailsRow
                label="ID number:"
                value={claim.idNumber}
                shaded
              />

              <DetailsRow
                label="Expiry date:"
                value={claim.idExpiryDate}
                shaded
              />
            </div>

            <DocumentRow
              label="Uploaded ID document"
              value={claim.identityDocument}
            />
          </FormSection>

          <FormSection title="Claim Details / Declaration">
            <div className="rounded-[7px] bg-[#E1E6EC] px-3 py-3">
              <p className="font-lato text-[13px] leading-[17px] text-[#666]">
                {claim.claimStatement}
              </p>
            </div>
          </FormSection>

          <FormSection title="Payment Instructions">
            <DetailsRow
              label="Selected method:"
              value={claim.paymentMethod}
              stacked
            />

            <DocumentRow
              label="IRS Form W-9"
              value={claim.w9Document}
            />
          </FormSection>

          <FormSection title="Required Attachments Checklist">
            <DocumentRow
              label="Proof of address"
              value={claim.proofOfAddress}
            />

            <DocumentRow
              label="Identity verification"
              value={claim.identityDocument}
            />
          </FormSection>

          <FormSection title="Indemnity / Liability Clause">
            <CheckedRow
              label="Protect the bank from future claims"
              checked={claim.indemnityOne}
            />

            <CheckedRow
              label="Return funds if paid in error"
              checked={claim.indemnityTwo}
            />
          </FormSection>

          <FormSection title="Signature Section">
            <DocumentRow
              label="Signature"
              value={claim.signatureDocument}
            />

            <DetailsRow
              label="Date signed:"
              value={claim.signatureDate}
            />
          </FormSection>

          <FormSection title="⚠ Important Tips!">
            <p className="font-lato text-[12px] font-bold leading-[17px] text-black/30">
              Always ensure the beneficiary name matches the account records.
              <br />
              Confirm that the death certificate is valid and certified.
              <br />
              Review all supplied identity and address documents.
              <br />
              Contact the client where more information is required.
            </p>
          </FormSection>
        </section>

        {/* Notification section */}
        <section className="mt-4">
          <div className="relative grid min-h-[40px] grid-cols-[1fr_92px] items-center gap-2 overflow-hidden rounded-[8px] px-2 py-1 shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
  {/* Background Image */}
  <Image
    src="/images/ads-bg.png"
    alt="Notification Background"
    fill
    priority
    className="object-cover"
  />

  {/* Optional dark overlay */}
  <div className="absolute inset-0 bg-black/10" />

  {/* Content */}
  <p className="relative z-10 text-center font-roboto text-[12px] leading-[12px] text-white">
    Send a notification request to this
    <br />
    client to fill-up for this next-of-kin
    <br />
    document
  </p>


            <button
            type="button"
            onClick={handleSendNotification}
            disabled={notificationSent || isSending}
            className="relative flex h-[27px] w-[86px] items-center justify-center overflow-hidden rounded-full transition active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {/* Background Image */}
            <Image
              src={
                notificationSent
                  ? "/images/ads-bg.png" // optional success background
                  : "/images/ads-bg.png"
              }
              alt="Send Button"
              fill
              className="object-cover"
            />

            {/* Button Text */}
            <span className="relative z-10 font-roboto text-[12px] font-medium text-white">
              {notificationSent
                ? "Sent ✓"
                : isSending
                ? "Sending..."
                : "Send"}
            </span>
          </button>
          </div>

          <Link
            href="/dashboard"
            className="mx-auto mt-10 flex h-[32px] w-[234px] items-center justify-center gap-3 rounded-[10px] bg-[#294CC9] font-roboto text-[14px] font-medium text-white transition hover:bg-[#1E40AF] active:scale-[0.98]"
          >
            Go to Dashboard
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}

function FormSection({
  title,
  children,
  showChevron = false,
}: {
  title: string;
  children: React.ReactNode;
  showChevron?: boolean;
}) {
  return (
    <section className="border-t-[14px] border-[#B70000] bg-white px-2 pb-3 pt-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-sf-condensed text-[13px] font-black tracking-[0.05em] text-[#555]">
          {title}
        </h3>

        {showChevron && (
          <ChevronUp size={17} className="text-black/30" />
        )}
      </div>

      <div className="space-y-1">{children}</div>
    </section>
  );
}

function DetailsRow({
  label,
  value,
  shaded = false,
  stacked = false,
}: {
  label: string;
  value: string;
  shaded?: boolean;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div
        className={`rounded-[6px] px-3 py-2 ${
          shaded ? "bg-[#E1E6EC]" : ""
        }`}
      >
        <p className="text-[13px] text-black/30">{label}</p>

        <p className="mt-1 break-words text-[13px] font-medium text-[#555]">
          {value || "Not provided"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid min-h-[29px] grid-cols-[130px_1fr] items-start gap-2 rounded-[6px] px-3 py-1.5 ${
        shaded ? "bg-[#E1E6EC]" : ""
      }`}
    >
      <span className="font-lato text-[13px] text-black/30">
        {label}
      </span>

      <span className="break-words text-right font-lato text-[13px] font-medium text-[#555]">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function DocumentRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <button
      type="button"
      className="flex min-h-[38px] w-full items-center justify-between rounded-[7px] bg-[#E1E6EC] px-3 py-2 text-left"
    >
      <span className="font-lato text-[13px] text-black/30">
        {label}
      </span>

      <span className="max-w-[160px] truncate font-lato text-[13px] font-medium text-[#2458E8]">
        {value || "View document"}
      </span>
    </button>
  );
}

function CheckedRow({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <div className="flex min-h-[32px] items-center gap-3 rounded-[7px] bg-[#E1E6EC] px-3 py-2">
      <span
        className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[3px] border ${
          checked
            ? "border-[#2E8B57] bg-white text-[#2E8B57]"
            : "border-black/20 text-transparent"
        }`}
      >
        ✓
      </span>

      <span className="font-lato text-[13px] text-black/35">
        {label}
      </span>
    </div>
  );
}