"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Camera,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";

type Step = "death" | "id" | "claim" | "success";

type UploadedFile = {
  file: File;
  previewUrl: string | null;
};

export default function PodUploadPage() {
  const [step, setStep] = useState<Step>("death");

  const [deathCertificate, setDeathCertificate] =
    useState<UploadedFile | null>(null);
  const [frontId, setFrontId] = useState<UploadedFile | null>(null);
  const [backId, setBackId] = useState<UploadedFile | null>(null);

  const makeUploadedFile = (file: File): UploadedFile => ({
    file,
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null,
  });

  const goToValidId = () => {
    if (!deathCertificate) {
      alert("Please upload the death certificate first.");
      return;
    }

    setStep("id");
  };

  const goToClaimForm = () => {
    if (!frontId) {
      alert("Please upload the front of your ID.");
      return;
    }

    if (!backId) {
      alert("Please upload the back of your ID.");
      return;
    }

    setStep("claim");
  };

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-5 pb-8 pt-12 text-[#1f1f1f]/80">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        <header className="relative flex items-center justify-center">
          <button title="Back"
            type="button"
            onClick={() => {
              if (step === "claim") {
                setStep("id");
              } else if (step === "id") {
                setStep("death");
              }
            }}
            className="absolute left-0 text-[#555]"
          >
           <Link href="/nok" className="absolute left-0 text-[#555]">
            <ArrowLeft size={24} />
          </Link>
          </button>

          <h1 className="font-heading text-[14px] font-sf-condensed font-bold text-[#1f1f1f]/80 tracking-[0.08em]">
            POD Redemption
          </h1>
        </header>

        <div className="mt-4 flex justify-center gap-1">
          {(["death", "id", "claim"] as Step[]).map((item) => (
            <span
              key={item}
              className={`h-[6px] w-[6px] rounded-full ${
                step === item ? "bg-[#333]" : "bg-black/15"
              }`}
            />
          ))}
        </div>

        {step === "death" && (
          <DeathCertificateStep
            uploadedFile={deathCertificate}
            onFileChange={(file) => setDeathCertificate(makeUploadedFile(file))}
            onNext={goToValidId}
          />
        )}

        {step === "id" && (
          <ValidIdStep
            frontId={frontId}
            backId={backId}
            onFrontChange={(file) => setFrontId(makeUploadedFile(file))}
            onBackChange={(file) => setBackId(makeUploadedFile(file))}
            onProceed={goToClaimForm}
          />
        )}

        {step === "claim" && (
  <PodClaimFormStep onSubmit={() => setStep("success")} />
)}

{step === "success" && <PodSuccessStep />}
      </section>
    </main>
  );
}

function DeathCertificateStep({
  uploadedFile,
  onFileChange,
  onNext,
}: {
  uploadedFile: UploadedFile | null;
  onFileChange: (file: File) => void;
  onNext: () => void;
}) {
  const hasFile = Boolean(uploadedFile);

  return (
    <>
      <h2 className="mt-4 text-center text-[36px] font-bold font-sf-condensed leading-none text-[#2563EB]">
        Death Certificate
      </h2>

      <p className="mx-auto mt-5 max-w-[300px] text-center text-[13px] font-medium font-lato leading-[16px] text-[#000000]/95">
        Upload the death certificate of the person who’s POD you’re trying to
        redeem
      </p>

      <UploadBox
        uploadedFile={uploadedFile}
        emptyLabel=""
        className="mt-12 h-[370px]"
      />

      <div className="mt-auto rounded-[2px] border border-white bg-white/20 p-1">
        <div className="grid grid-cols-[1fr_135px] items-center gap-3">
          <p className="px-3 text-[14px] text-[#1f1f1f]/80">Death Certificate?</p>

          {hasFile ? (
            <button
              type="button"
              onClick={onNext}
              className="flex h-[36px] items-center justify-center rounded-[10px] bg-[#1D4ED8] text-[14px] font-bold text-white font-roboto active:scale-[0.98]"
            >
              Next →
            </button>
          ) : (
            <label
              htmlFor="death-certificate-input"
              className="flex h-[36px] cursor-pointer items-center justify-center rounded-[10px] bg-[#1D4ED8] text-[14px] font-bold font-roboto text-white active:scale-[0.98]"
            >
              Upload
            </label>
          )}
        </div>
      </div>

      <input
        id="death-certificate-input"
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) onFileChange(selectedFile);
        }}
      />
    </>
  );
}

function ValidIdStep({
  frontId,
  backId,
  onFrontChange,
  onBackChange,
  onProceed,
}: {
  frontId: UploadedFile | null;
  backId: UploadedFile | null;
  onFrontChange: (file: File) => void;
  onBackChange: (file: File) => void;
  onProceed: () => void;
}) {
  return (
    <>
      <h2 className="mt-4 text-center text-[36px] font-sf-condensed font-black leading-none text-[#2563EB]">
        Your valid ID
      </h2>

      <p className="mx-auto mt-5 max-w-[310px] text-center text-[13px] font-medium leading-[16px] text-black/95">
        Upload the both sides of a valid ID of yourself
      </p>

      <UploadBox
        uploadedFile={frontId}
        emptyLabel="Front"
        className="mt-12 h-[165px]"
      />

      <UploadBox
        uploadedFile={backId}
        emptyLabel="Back"
        className="mt-5 h-[165px]"
      />

      <div className="mt-auto space-y-3">
        <UploadActionRow
          label="Your valid ID?"
          buttonText={frontId ? "Uploaded ✓" : "Upload Front"}
          uploaded={Boolean(frontId)}
          inputId="front-id-input"
        />

        <UploadActionRow
          label="Back of ID?"
          buttonText={backId ? "Proceed →" : "Upload Back"}
          uploaded={Boolean(backId)}
          onClick={backId ? onProceed : undefined}
          inputId={!backId ? "back-id-input" : undefined}
        />
      </div>

      <input title="input"
        id="front-id-input"
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) onFrontChange(selectedFile);
        }}
      />

      <input
        id="back-id-input"
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          if (!frontId) {
            alert("Please upload the front of your ID first.");
            return;
          }

          const selectedFile = e.target.files?.[0];
          if (selectedFile) onBackChange(selectedFile);
        }}
      />
    </>
  );
}

function PodClaimFormStep({ onSubmit }: { onSubmit: () => void }) {
  const [form, setForm] = useState({
    deceasedName: "",
    dob: "",
    proceed: "",
    ssn: "",
    accountNumber: "",
    beneficiaryName: "",
    beneficiaryDob: "",
    relationship: "",
    contactDetails: "",
    idType: "",
    idNumber: "",
    claimStatement: "",
    achWire: true,
    issueCheck: true,
    sameBank: true,
    indemnityOne: true,
    indemnityTwo: true,
  });

  const updateForm = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className="mt-5 rounded-[8px] border border-white/70 bg-white/20 w-[345px]">
        <h2 className="mt-5 text-center text-[30px] font-black font-sf-condensed leading-none text-[#2563EB]">
          POD Claim Form
        </h2>

        <p className="mx-auto mt-5 max-w-[330px] text-center text-[14px] font-lato font-medium leading-[16px] text-[#666]">
          You need to fill this form below just to clarify to the Bank that you
          are not a fraud. Please not that once you submit this form, there is no
          correction that can be made, therefore, do well to crosscheck your
          information properly before submitting
        </p>

        <div className="mt-5 font-sf-condensed">
          <FormSection title="Deceased Account Holder Information">
            <Input
              placeholder="Full legal name"
              value={form.deceasedName}
              onChange={(v) => updateForm("deceasedName", v)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Date of birth"
                value={form.dob}
                onChange={(v) => updateForm("dob", v)}
              />
              <Input
                placeholder="Proceed"
                value={form.proceed}
                onChange={(v) => updateForm("proceed", v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="(SSN)"
                value={form.ssn}
                onChange={(v) => updateForm("ssn", v)}
              />
              <Input
                placeholder="Account number"
                value={form.accountNumber}
                onChange={(v) => updateForm("accountNumber", v)}
              />
            </div>
          </FormSection>

          <FormSection title="Beneficiary (Claimant) Information">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Full legal name"
                value={form.beneficiaryName}
                onChange={(v) => updateForm("beneficiaryName", v)}
              />
              <Input
                placeholder="Date of birth"
                value={form.beneficiaryDob}
                onChange={(v) => updateForm("beneficiaryDob", v)}
              />
            </div>

            <Input
              placeholder="Relationship to deceased"
              value={form.relationship}
              onChange={(v) => updateForm("relationship", v)}
            />

            <Input
              placeholder="Contact details (address, phone, email)"
              value={form.contactDetails}
              onChange={(v) => updateForm("contactDetails", v)}
            />
          </FormSection>

          <FormSection title="Identification detail" hasChevron>
            <div className="rounded-[6px] border border-black/10 bg-white p-2">
              <h3 className="text-[12px] font-black tracking-[0.05em] text-[#777]">
                Government-issued ID
              </h3>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Select placeholder="ID Type" />
                <Input
                  placeholder="ID number"
                  value={form.idNumber}
                  onChange={(v) => updateForm("idNumber", v)}
                />
              </div>

              <p className="mt-2 text-[12px] font-black text-[#777]">
                Expiry date
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Select placeholder="day" />
                <Select placeholder="mnth" />
              </div>

              <div className="mt-2">
                <Select placeholder="year" />
              </div>
            </div>

            <UploadDocumentBox title="Upload ID Document" buttonText="Button" />
          </FormSection>

          <FormSection title="Claim Details / Declaration">
            <div className="rounded-[8px] bg-[#E1E6EC] px-3 py-3 text-[13px] leading-[16px] text-[#666]">
              <p>Make a Statement confirming that:</p>
              <ul className="list-disc pl-5">
                <li>The account holder is deceased</li>
                <li>You are the named POD beneficiary</li>
                <li>The information provided is true and correct</li>
                <li>Acknowledgment that the bank may verify details</li>
              </ul>
            </div>

            <textarea
              value={form.claimStatement}
              onChange={(e) => updateForm("claimStatement", e.target.value)}
              placeholder="Write..."
              className="h-[185px] w-full resize-none rounded-[8px] bg-white px-3 py-3 text-[14px] outline-none placeholder:text-black/25"
            />
          </FormSection>

          <FormSection title="Payment Instructions">
            <p className="text-[12px] font-black text-black/25">
              You’ll choose how you want to receive the funds:
            </p>

            <CheckRow
              label="Transfer to your bank account (ACH/wire)"
              checked={form.achWire}
              onClick={() => updateForm("achWire", !form.achWire)}
            />

            <CheckRow
              label="Issue of a check"
              checked={form.issueCheck}
              onClick={() => updateForm("issueCheck", !form.issueCheck)}
            />

            <CheckRow
              label="Deposit into an account with the same bank"
              checked={form.sameBank}
              onClick={() => updateForm("sameBank", !form.sameBank)}
            />
          </FormSection>

          <FormSection title="Payment Instructions">
            <p className="text-[12px] font-black text-black/25">
              Upload your IRS Form W-9
            </p>

            <UploadDocumentBox title="Upload ID Document" buttonText="Button" />
          </FormSection>

          <FormSection title="Required Attachments Checklist">
            <p className="text-[12px] font-black text-black/25">
              You Must upload certain documents for further verification sake
            </p>

            <UploadDocumentBox title="Proof of address" buttonText="Upload" />
            <UploadDocumentBox
              title="Additional identity verification documents"
              buttonText="Upload"
            />
          </FormSection>

          <FormSection title="Indemnity / Liability Clause">
            <p className="text-[12px] font-black text-black/25">
              You agree to:
            </p>

            <CheckRow
              label="Protect the bank from future claims"
              checked={form.indemnityOne}
              onClick={() => updateForm("indemnityOne", !form.indemnityOne)}
            />

            <CheckRow
              label="Return funds if paid in error"
              checked={form.indemnityTwo}
              onClick={() => updateForm("indemnityTwo", !form.indemnityTwo)}
            />
          </FormSection>

          <FormSection title="Signature Section">
            <p className="text-[12px] font-black text-black/25">
              You agree to:
            </p>

            <UploadDocumentBox title="Your signature:" buttonText="Upload" />

            <p className="text-[12px] font-black text-[#777]">Select date:</p>

            <div className="grid grid-cols-3 gap-2">
              <Select placeholder="Day" />
              <Select placeholder="Month" />
              <Select placeholder="Year" />
            </div>
          </FormSection>

          <FormSection title="⚠ Important Tips!">
            <p className="text-[12px] font-bold leading-[16px] text-black/25">
              Always ensure your name matches exactly what is on the account
              <br />
              Submit certified, not photocopied, death certificates
              <br />
              Some banks may require notarization or large amounts
              <br />
              Customize for a specific bank.
            </p>
          </FormSection>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-4 bg-white/80 px-5 py-3 backdrop-blur-sm">
        <div className="grid grid-cols-[1fr_150px] items-center gap-3 rounded-[2px] border border-white bg-white/20 p-1">
          <p className="px-3 text-[14px] text-[#444]">Claim form?</p>

          <button
            type="button"
            onClick={onSubmit}
            className="flex h-[38px] items-center justify-center rounded-[10px] bg-[#2458E8] text-[14px] font-bold text-white active:scale-[0.98]"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

function UploadActionRow({
  label,
  buttonText,
  uploaded,
  inputId,
  onClick,
}: {
  label: string;
  buttonText: string;
  uploaded?: boolean;
  inputId?: string;
  onClick?: () => void;
}) {
  if (inputId && !onClick) {
    return (
      <div className="rounded-[2px] border border-white bg-white/20 p-1">
        <div className="grid grid-cols-[1fr_135px] items-center gap-3">
          <p className="px-3 text-[14px] text-[#444]">{label}</p>

          <label
            htmlFor={inputId}
            className={`flex h-[36px] cursor-pointer items-center justify-center rounded-[10px] text-[14px] font-bold text-white active:scale-[0.98] ${
              uploaded ? "bg-[#27AE60]" : "bg-[#2458E8]"
            }`}
          >
            {buttonText}
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2px] border border-white bg-white/20 p-1">
      <div className="grid grid-cols-[1fr_135px] items-center gap-3">
        <p className="px-3 text-[14px] text-[#444]">{label}</p>

        <button
          type="button"
          onClick={onClick}
          className={`flex h-[36px] items-center justify-center rounded-[10px] text-[14px] font-bold text-white active:scale-[0.98] ${
            uploaded ? "bg-[#27AE60]" : "bg-[#2458E8]"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function UploadBox({
  uploadedFile,
  emptyLabel,
  className = "",
}: {
  uploadedFile: UploadedFile | null;
  emptyLabel?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[7px] bg-white ${className}`}>
      {uploadedFile?.previewUrl ? (
        <img
          src={uploadedFile.previewUrl}
          alt="Uploaded preview"
          className="h-full w-full object-cover"
        />
      ) : uploadedFile ? (
        <div className="flex h-full items-center justify-center px-5 text-center">
          <p className="text-[13px] font-semibold text-[#2458E8]">
            {uploadedFile.file.name}
          </p>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center text-black/25">
            <ImageIcon size={40} />
            {emptyLabel && (
              <span className="mt-2 text-[13px]">{emptyLabel}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormSection({
  title,
  children,
  hasChevron = false,
}: {
  title: string;
  children: React.ReactNode;
  hasChevron?: boolean;
}) {
  return (
    <section className="border-t border-b border-black/10 bg-white px-2 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-black tracking-[0.05em] text-[#555]">
          {title}
        </h3>

        {hasChevron && <ChevronDown size={17} className="text-black/35" />}
      </div>

      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-[31px] w-full rounded-[7px] bg-[#E1E6EC] px-3 text-[13px] outline-none placeholder:text-black/25"
    />
  );
}

function Select({ placeholder }: { placeholder: string }) {
  return (
    <button
      type="button"
      className="flex h-[31px] w-full items-center justify-between rounded-full border border-black/10 bg-white px-3 text-[13px] text-black/35"
    >
      {placeholder}
      <ChevronDown size={15} />
    </button>
  );
}

function UploadDocumentBox({
  title,
  buttonText,
}: {
  title: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-[6px] border border-black/10 bg-white px-3 py-3">
      <h4 className="text-[12px] font-black tracking-[0.05em] text-[#777]">
        {title}
      </h4>

      <div className="mx-auto mt-5 flex h-[58px] w-[220px] items-center justify-center rounded-[5px] border border-black/15 bg-[#EFF2F6]">
        <button
          type="button"
          className="flex h-[24px] min-w-[94px] items-center justify-center gap-1 rounded-full bg-white px-3 text-[12px] font-medium text-[#777] shadow-sm"
        >
          {buttonText}
          <Camera size={16} className="text-[#2E8B57]" />
        </button>
      </div>

      <p className="mx-auto mt-3 max-w-[260px] text-center text-[12px] leading-[13px] text-black/20">
        You may have to do a Selfie/Live Photo for identity verification
      </p>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[30px] w-full items-center gap-3 rounded-[7px] bg-[#E1E6EC] px-3 text-left text-[13px] text-black/25"
    >
      <span
        className={`flex h-[17px] w-[17px] items-center justify-center rounded-[3px] border ${
          checked
            ? "border-[#2E8B57] bg-white text-[#2E8B57]"
            : "border-black/20"
        }`}
      >
        {checked ? "✓" : ""}
      </span>

      <span>{label}</span>
    </button>
  );
}
function PodSuccessStep() {
  return (
    <>
      <div className="mt-8 flex flex-1 flex-col items-center">
        <div className="flex h-[378px] w-[302px] items-center justify-center ">
          <img
            src="/images/pod-success.png"
            alt="POD success"
            className="h-[378px] w-[30p2x] object-contain"
          />
        </div>

        <div className="mt-7 h-px w-[280px] bg-black/35" />

        <div className="mt-6 max-w-[310px] space-y-4 text-center text-[14px] leading-[18px] text-[#666] font-lato">
          <p>
            You have successfully submitted your request for POD as next-of-kin.
          </p>

          <p>Kindly wait for our Bank Manager to attend to you.</p>

          <p>Kindly be patient as, response take about 24hours.</p>
        </div>
      </div>

      <div className="mt-auto rounded-[12px]  p-1">
        <Link
          href="/dashboard"
          className="flex h-[35px] w-full items-center justify-center rounded-[12px] bg-[#1D4ED8] text-[14px] font-roboto font-bold text-white"
        >
          Close
        </Link>
      </div>
    </>
  );
}