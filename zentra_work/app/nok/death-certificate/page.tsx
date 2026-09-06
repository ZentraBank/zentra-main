"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ImageIcon,
  Loader2,
  ShieldCheck,
  FileText,
} from "lucide-react";

import {
  nextOfKinService,
} from "@/services/next-of-kin.service";

import type {
  PodClaim,
  PodDocumentType,
  UploadedPodDocument,
} from "@/types/next-of-kin";

type Step =
  | "death"
  | "id"
  | "claim"
  | "success";

type UploadedFile = {
  file: File;
  previewUrl: string | null;
};

export default function PodUploadPage() {
  const [step, setStep] =
    useState<Step>("death");

  /*
  |--------------------------------------------------------------------------
  | Local preview files
  |--------------------------------------------------------------------------
  */

  const [
    deathCertificate,
    setDeathCertificate,
  ] =
    useState<UploadedFile | null>(
      null,
    );

  const [
    frontId,
    setFrontId,
  ] =
    useState<UploadedFile | null>(
      null,
    );

  const [
    backId,
    setBackId,
  ] =
    useState<UploadedFile | null>(
      null,
    );

  /*
  |--------------------------------------------------------------------------
  | Successfully uploaded backend files
  |--------------------------------------------------------------------------
  */

  const [
    deathCertificateUpload,
    setDeathCertificateUpload,
  ] =
    useState<UploadedPodDocument | null>(
      null,
    );

  const [
    frontIdUpload,
    setFrontIdUpload,
  ] =
    useState<UploadedPodDocument | null>(
      null,
    );

  const [
    backIdUpload,
    setBackIdUpload,
  ] =
    useState<UploadedPodDocument | null>(
      null,
    );

  /*
  |--------------------------------------------------------------------------
  | Upload state
  |--------------------------------------------------------------------------
  */

  const [
    uploading,
    setUploading,
  ] =
    useState<PodDocumentType | null>(
      null,
    );

  const [
    uploadError,
    setUploadError,
  ] =
    useState("");

  const [
    submittedClaim,
    setSubmittedClaim,
  ] =
    useState<PodClaim | null>(
      null,
    );

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const makeUploadedFile = (
    file: File,
  ): UploadedFile => ({
    file,

    previewUrl:
      file.type.startsWith(
        "image/",
      )
        ? URL.createObjectURL(
            file,
          )
        : null,
  });

  const uploadPodDocument =
    async (
      file: File,
      documentType:
        PodDocumentType,
    ) => {
      setUploading(
        documentType,
      );

      setUploadError("");

      try {
        return await nextOfKinService.uploadDocument(
          file,
          documentType,
        );
      } catch (error) {
        setUploadError(
          error instanceof Error
            ? error.message
            : "Unable to upload document.",
        );

        return null;
      } finally {
        setUploading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Death certificate
  |--------------------------------------------------------------------------
  */

  const handleDeathCertificate =
    async (file: File) => {
      setDeathCertificate(
        makeUploadedFile(file),
      );

      setDeathCertificateUpload(
        null,
      );

      const uploaded =
        await uploadPodDocument(
          file,
          "death_certificate",
        );

      if (uploaded) {
        setDeathCertificateUpload(
          uploaded,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Claimant ID front
  |--------------------------------------------------------------------------
  */

  const handleFrontId =
    async (file: File) => {
      setFrontId(
        makeUploadedFile(file),
      );

      setFrontIdUpload(null);

      const uploaded =
        await uploadPodDocument(
          file,
          "claimant_id_front",
        );

      if (uploaded) {
        setFrontIdUpload(
          uploaded,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Claimant ID back
  |--------------------------------------------------------------------------
  */

  const handleBackId =
    async (file: File) => {
      setBackId(
        makeUploadedFile(file),
      );

      setBackIdUpload(null);

      const uploaded =
        await uploadPodDocument(
          file,
          "claimant_id_back",
        );

      if (uploaded) {
        setBackIdUpload(
          uploaded,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Step navigation
  |--------------------------------------------------------------------------
  */

  const goToValidId = () => {
    if (
      !deathCertificateUpload
    ) {
      alert(
        uploading ===
          "death_certificate"
          ? "Please wait for the death certificate to finish uploading."
          : "Please successfully upload the death certificate first.",
      );

      return;
    }

    setStep("id");
  };

  const goToClaimForm = () => {
    if (!frontIdUpload) {
      alert(
        uploading ===
          "claimant_id_front"
          ? "Please wait for the front of your ID to finish uploading."
          : "Please successfully upload the front of your ID.",
      );

      return;
    }

    if (!backIdUpload) {
      alert(
        uploading ===
          "claimant_id_back"
          ? "Please wait for the back of your ID to finish uploading."
          : "Please successfully upload the back of your ID.",
      );

      return;
    }

    setStep("claim");
  };

  const goBack = () => {
    if (step === "claim") {
      setStep("id");
      return;
    }

    if (step === "id") {
      setStep("death");
    }
  };

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-5 pb-8 pt-12 text-[#1f1f1f]/80 lg:flex lg:items-center lg:justify-center lg:px-12 lg:py-16">
      {/* Mobile Layout Wrapper */}
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col lg:hidden">
        <header className="relative flex items-center justify-center">
          {step === "death" ||
          step === "success" ? (
            <Link
              href={
                step === "success"
                  ? "/dashboard"
                  : "/nok"
              }
              className="absolute left-0 text-[#555]"
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="absolute left-0 text-[#555]"
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <h1 className="font-heading font-sf-condensed text-[14px] font-bold tracking-[0.08em] text-[#1f1f1f]/80">
            POD Redemption
          </h1>
        </header>

        {step !== "success" && (
          <div className="mt-4 flex justify-center gap-1">
            {(
              [
                "death",
                "id",
                "claim",
              ] as Step[]
            ).map((item) => (
              <span
                key={item}
                className={`h-[6px] w-[6px] rounded-full ${
                  step === item
                    ? "bg-[#333]"
                    : "bg-black/15"
                }`}
              />
            ))}
          </div>
        )}

        {uploadError && (
          <div className="mt-4 rounded-[10px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
            {uploadError}
          </div>
        )}

        {step === "death" && (
          <DeathCertificateStep
            uploadedFile={
              deathCertificate
            }
            uploaded={Boolean(
              deathCertificateUpload,
            )}
            uploading={
              uploading ===
              "death_certificate"
            }
            onFileChange={
              handleDeathCertificate
            }
            onNext={goToValidId}
          />
        )}

        {step === "id" && (
          <ValidIdStep
            frontId={frontId}
            backId={backId}
            frontUploaded={Boolean(
              frontIdUpload,
            )}
            backUploaded={Boolean(
              backIdUpload,
            )}
            uploadingFront={
              uploading ===
              "claimant_id_front"
            }
            uploadingBack={
              uploading ===
              "claimant_id_back"
            }
            onFrontChange={
              handleFrontId
            }
            onBackChange={
              handleBackId
            }
            onProceed={
              goToClaimForm
            }
          />
        )}

        {step === "claim" &&
          deathCertificateUpload &&
          frontIdUpload &&
          backIdUpload && (
            <PodClaimFormStep
              deathCertificate={
                deathCertificateUpload
              }
              frontId={
                frontIdUpload
              }
              backId={
                backIdUpload
              }
              onSuccess={(
                claim,
              ) => {
                setSubmittedClaim(
                  claim,
                );

                setStep(
                  "success",
                );
              }}
            />
          )}

        {step === "success" && (
          <PodSuccessStep
            claim={submittedClaim}
          />
        )}
      </section>

      {/* Desktop Layout Wrapper */}
      <section className="hidden lg:mx-auto lg:flex lg:w-full lg:max-w-[1200px] lg:flex-col">
        {/* Top Header Bar */}
        <header className="relative mb-10 flex items-center justify-between rounded-[24px] border border-black/5 bg-white/70 px-8 py-6 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            {step === "death" || step === "success" ? (
              <Link
                href={step === "success" ? "/dashboard" : "/nok"}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#4A4A4A] shadow-md transition hover:bg-white/90"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={goBack}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#4A4A4A] shadow-md transition hover:bg-white/90"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <div>
              <h1 className="font-heading text-[22px] font-black tracking-tight text-[#1f1f1f]">
                POD Redemption & Verification Workflow
              </h1>
              <p className="mt-0.5 text-xs text-black/50">
                Complete your death certificate verification, government ID uploads, and formal beneficiary claim securely.
              </p>
            </div>
          </div>

          {step !== "success" && (
            <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2 border border-black/5 shadow-xs">
              {(["death", "id", "claim"] as Step[]).map((item, idx) => (
                <div key={item} className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      step === item
                        ? "bg-[#2458E8] text-white"
                        : "bg-black/5 text-black/40"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`text-xs font-bold capitalize ${step === item ? "text-[#1f1f1f]" : "text-black/40"}`}>
                    {item === "death" ? "Certificate" : item === "id" ? "Valid ID" : "Claim Form"}
                  </span>
                  {idx < 2 && <span className="mx-2 text-black/20">/</span>}
                </div>
              ))}
            </div>
          )}
        </header>

        {uploadError && (
          <div className="mb-8 rounded-[16px] bg-red-50 px-6 py-4 text-sm font-medium text-red-700 shadow-sm">
            {uploadError}
          </div>
        )}

        {/* Step Views in Desktop */}
        <div className="rounded-[32px] border border-black/5 bg-white/60 p-10 backdrop-blur-md shadow-xl">
          {step === "death" && (
            <DeathCertificateStepDesktop
              uploadedFile={deathCertificate}
              uploaded={Boolean(deathCertificateUpload)}
              uploading={uploading === "death_certificate"}
              onFileChange={handleDeathCertificate}
              onNext={goToValidId}
            />
          )}

          {step === "id" && (
            <ValidIdStepDesktop
              frontId={frontId}
              backId={backId}
              frontUploaded={Boolean(frontIdUpload)}
              backUploaded={Boolean(backIdUpload)}
              uploadingFront={uploading === "claimant_id_front"}
              uploadingBack={uploading === "claimant_id_back"}
              onFrontChange={handleFrontId}
              onBackChange={handleBackId}
              onProceed={goToClaimForm}
            />
          )}

          {step === "claim" &&
            deathCertificateUpload &&
            frontIdUpload &&
            backIdUpload && (
              <PodClaimFormStepDesktop
                deathCertificate={deathCertificateUpload}
                frontId={frontIdUpload}
                backId={backIdUpload}
                onSuccess={(claim) => {
                  setSubmittedClaim(claim);
                  setStep("success");
                }}
              />
            )}

          {step === "success" && (
            <PodSuccessStepDesktop claim={submittedClaim} />
          )}
        </div>
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Death Certificate
|--------------------------------------------------------------------------
*/

function DeathCertificateStep({
  uploadedFile,
  uploaded,
  uploading,
  onFileChange,
  onNext,
}: {
  uploadedFile:
    | UploadedFile
    | null;

  uploaded: boolean;
  uploading: boolean;

  onFileChange:
    (file: File) => void;

  onNext: () => void;
}) {
  return (
    <>
      <h2 className="mt-4 text-center font-sf-condensed text-[36px] font-bold leading-none text-[#2563EB]">
        Death Certificate
      </h2>

      <p className="mx-auto mt-5 max-w-[300px] text-center font-lato text-[13px] font-medium leading-[16px] text-black/95">
        Upload the certified death
        certificate of the person whose
        POD you are trying to redeem.
      </p>

      <UploadBox
        uploadedFile={
          uploadedFile
        }
        emptyLabel=""
        className="mt-12 h-[370px]"
      />

      <div className="mt-auto rounded-[2px] border border-white bg-white/20 p-1">
        <div className="grid grid-cols-[1fr_135px] items-center gap-3">
          <p className="px-3 text-[14px] text-[#1f1f1f]/80">
            Death Certificate?
          </p>

          {uploading ? (
            <button
              type="button"
              disabled
              className="flex h-[36px] items-center justify-center gap-2 rounded-[10px] bg-[#1D4ED8]/60 text-[13px] font-bold text-white"
            >
              <Loader2
                size={15}
                className="animate-spin"
              />

              Uploading...
            </button>
          ) : uploaded ? (
            <button
              type="button"
              onClick={onNext}
              className="flex h-[36px] items-center justify-center rounded-[10px] bg-[#27AE60] font-roboto text-[13px] font-bold text-white active:scale-[0.98]"
            >
              Next →
            </button>
          ) : (
            <label
              htmlFor="death-certificate-input"
              className="flex h-[36px] cursor-pointer items-center justify-center rounded-[10px] bg-[#1D4ED8] font-roboto text-[14px] font-bold text-white active:scale-[0.98]"
            >
              Upload
            </label>
          )}
        </div>
      </div>

      <input
        id="death-certificate-input"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        disabled={uploading}
        onChange={(event) => {
          const file =
            event.target
              .files?.[0];

          if (file) {
            void onFileChange(
              file,
            );
          }

          event.target.value =
            "";
        }}
      />
    </>
  );
}

function DeathCertificateStepDesktop({
  uploadedFile,
  uploaded,
  uploading,
  onFileChange,
  onNext,
}: {
  uploadedFile: UploadedFile | null;
  uploaded: boolean;
  uploading: boolean;
  onFileChange: (file: File) => void;
  onNext: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-10 items-center">
      <div className="col-span-6 space-y-6">
        <div>
          <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1 text-xs font-black uppercase tracking-wider text-[#2563EB] mb-3">
            Step 1 of 3
          </span>
          <h2 className="font-heading text-4xl font-black text-[#1f1f1f]">
            Certified Death Certificate
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-black/60">
            Upload the official certified death certificate of the account holder whose Payable on Death (POD) account you are redeeming. Ensure all text and seal stamps are clearly legible.
          </p>
        </div>

        <div className="rounded-[20px] bg-white p-6 border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/50">Document Status</span>
            {uploaded ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle2 size={14} /> Uploaded & Verified
              </span>
            ) : uploading ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Loader2 size={14} className="animate-spin" /> Uploading to Secure Vault...
              </span>
            ) : (
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                Pending Upload
              </span>
            )}
          </div>

          <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-4">
            <label
              htmlFor="death-certificate-input-desktop"
              className="flex-1 flex h-[50px] cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#1D4ED8] text-sm font-bold text-white shadow-md transition hover:bg-blue-600"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  {uploaded ? "Replace Document" : "Select Document File"}
                </>
              )}
            </label>

            {uploaded && (
              <button
                type="button"
                onClick={onNext}
                className="flex-1 flex h-[50px] items-center justify-center gap-2 rounded-[14px] bg-[#27AE60] text-sm font-bold text-white shadow-md transition hover:bg-emerald-600 active:scale-[0.99]"
              >
                Proceed to ID Upload →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-6">
        <div className="overflow-hidden rounded-[24px] bg-white border border-black/5 shadow-xl h-[400px] flex items-center justify-center">
          {uploadedFile?.previewUrl ? (
            <img
              src={uploadedFile.previewUrl}
              alt="Death certificate preview"
              className="h-full w-full object-cover"
            />
          ) : uploadedFile ? (
            <div className="text-center p-8">
              <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
              <p className="mt-4 text-base font-bold text-[#1f1f1f]">{uploadedFile.file.name}</p>
              <p className="mt-1 text-xs text-black/40">File ready for verification</p>
            </div>
          ) : (
            <div className="text-center p-8 text-black/30">
              <ImageIcon size={64} className="mx-auto mb-4" />
              <p className="text-sm font-bold">No file selected yet</p>
              <p className="text-xs mt-1">Accepts JPG, PNG, WEBP, or PDF</p>
            </div>
          )}
        </div>
      </div>

      <input
        id="death-certificate-input-desktop"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onFileChange(file);
          }
          event.target.value = "";
        }}
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Valid ID
|--------------------------------------------------------------------------
*/

function ValidIdStep({
  frontId,
  backId,
  frontUploaded,
  backUploaded,
  uploadingFront,
  uploadingBack,
  onFrontChange,
  onBackChange,
  onProceed,
}: {
  frontId:
    | UploadedFile
    | null;

  backId:
    | UploadedFile
    | null;

  frontUploaded: boolean;
  backUploaded: boolean;

  uploadingFront: boolean;
  uploadingBack: boolean;

  onFrontChange:
    (file: File) => void;

  onBackChange:
    (file: File) => void;

  onProceed:
    () => void;
}) {
  return (
    <>
      <h2 className="mt-4 text-center font-sf-condensed text-[36px] font-black leading-none text-[#2563EB]">
        Your valid ID
      </h2>

      <p className="mx-auto mt-5 max-w-[310px] text-center text-[13px] font-medium leading-[16px] text-black/95">
        Upload both sides of a valid
        government-issued ID.
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
          buttonText={
            uploadingFront
              ? "Uploading..."
              : frontUploaded
                ? "Uploaded ✓"
                : "Upload Front"
          }
          uploaded={
            frontUploaded
          }
          loading={
            uploadingFront
          }
          inputId={
            uploadingFront
              ? undefined
              : "front-id-input"
          }
        />

        <UploadActionRow
          label="Back of ID?"
          buttonText={
            uploadingBack
              ? "Uploading..."
              : backUploaded
                ? "Proceed →"
                : "Upload Back"
          }
          uploaded={
            backUploaded
          }
          loading={
            uploadingBack
          }
          onClick={
            backUploaded
              ? onProceed
              : undefined
          }
          inputId={
            !backUploaded &&
            !uploadingBack
              ? "back-id-input"
              : undefined
          }
        />
      </div>

      <input
        id="front-id-input"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        disabled={
          uploadingFront
        }
        onChange={(event) => {
          const file =
            event.target
              .files?.[0];

          if (file) {
            void onFrontChange(
              file,
            );
          }

          event.target.value =
            "";
        }}
      />

      <input
        id="back-id-input"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        disabled={
          uploadingBack
        }
        onChange={(event) => {
          if (!frontUploaded) {
            alert(
              "Please successfully upload the front of your ID first.",
            );

            return;
          }

          const file =
            event.target
              .files?.[0];

          if (file) {
            void onBackChange(
              file,
            );
          }

          event.target.value =
            "";
        }}
      />
    </>
  );
}

function ValidIdStepDesktop({
  frontId,
  backId,
  frontUploaded,
  backUploaded,
  uploadingFront,
  uploadingBack,
  onFrontChange,
  onBackChange,
  onProceed,
}: {
  frontId: UploadedFile | null;
  backId: UploadedFile | null;
  frontUploaded: boolean;
  backUploaded: boolean;
  uploadingFront: boolean;
  uploadingBack: boolean;
  onFrontChange: (file: File) => void;
  onBackChange: (file: File) => void;
  onProceed: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1 text-xs font-black uppercase tracking-wider text-[#2563EB] mb-3">
          Step 2 of 3
        </span>
        <h2 className="font-heading text-3xl font-black text-[#1f1f1f]">
          Government-Issued Valid ID (Front & Back)
        </h2>
        <p className="mt-2 text-sm text-black/60">
          Provide clear photographs of both the front and back of your valid government identification document for identity verification.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Front ID Card */}
        <div className="rounded-[24px] bg-white p-6 border border-black/5 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#1f1f1f]">1. Front of ID</h3>
          <div className="overflow-hidden rounded-[16px] bg-gray-50 border border-black/5 h-[200px] flex items-center justify-center">
            {frontId?.previewUrl ? (
              <img src={frontId.previewUrl} alt="Front ID preview" className="h-full w-full object-cover" />
            ) : frontId ? (
              <div className="text-center p-4">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-[#1f1f1f]">{frontId.file.name}</p>
              </div>
            ) : (
              <div className="text-center text-black/30">
                <ImageIcon size={40} className="mx-auto mb-2" />
                <p className="text-xs font-bold">Front ID missing</p>
              </div>
            )}
          </div>

          <label
            htmlFor="front-id-input-desktop"
            className="flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#1D4ED8] text-xs font-bold text-white shadow-sm transition hover:bg-blue-600"
          >
            {uploadingFront ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
            {frontUploaded ? "Replace Front ID" : "Upload Front ID"}
          </label>
        </div>

        {/* Back ID Card */}
        <div className="rounded-[24px] bg-white p-6 border border-black/5 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#1f1f1f]">2. Back of ID</h3>
          <div className="overflow-hidden rounded-[16px] bg-gray-50 border border-black/5 h-[200px] flex items-center justify-center">
            {backId?.previewUrl ? (
              <img src={backId.previewUrl} alt="Back ID preview" className="h-full w-full object-cover" />
            ) : backId ? (
              <div className="text-center p-4">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-[#1f1f1f]">{backId.file.name}</p>
              </div>
            ) : (
              <div className="text-center text-black/30">
                <ImageIcon size={40} className="mx-auto mb-2" />
                <p className="text-xs font-bold">Back ID missing</p>
              </div>
            )}
          </div>

          <label
            htmlFor="back-id-input-desktop"
            className="flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#1D4ED8] text-xs font-bold text-white shadow-sm transition hover:bg-blue-600"
          >
            {uploadingBack ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
            {backUploaded ? "Replace Back ID" : "Upload Back ID"}
          </label>
        </div>
      </div>

      {frontUploaded && backUploaded && (
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={onProceed}
            className="flex h-[52px] px-8 items-center justify-center gap-2 rounded-[14px] bg-[#27AE60] text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 active:scale-[0.99]"
          >
            Proceed to Claim Form →
          </button>
        </div>
      )}

      <input
        id="front-id-input-desktop"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        disabled={uploadingFront}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onFrontChange(file);
          }
          event.target.value = "";
        }}
      />

      <input
        id="back-id-input-desktop"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        disabled={uploadingBack}
        onChange={(event) => {
          if (!frontUploaded) {
            alert("Please successfully upload the front of your ID first.");
            return;
          }
          const file = event.target.files?.[0];
          if (file) {
            void onBackChange(file);
          }
          event.target.value = "";
        }}
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Claim Form
|--------------------------------------------------------------------------
*/

function PodClaimFormStep({
  deathCertificate,
  frontId,
  backId,
  onSuccess,
}: {
  deathCertificate:
    UploadedPodDocument;

  frontId:
    UploadedPodDocument;

  backId:
    UploadedPodDocument;

  onSuccess:
    (claim: PodClaim) => void;
}) {
  const [form, setForm] =
    useState({
      deceasedName: "",
      deceasedDateOfBirth:
        "",
      deceasedIdentificationNumber:
        "",
      deceasedAccountNumber:
        "",

      beneficiaryName: "",
      beneficiaryDateOfBirth:
        "",
      relationshipToDeceased:
        "",
      contactDetails: "",

      claimantIdType: "",
      claimantIdNumber: "",
      claimantIdExpiryDate:
        "",

      claimStatement: "",

      paymentMethod:
        "same_bank" as
          | "ach_wire"
          | "check"
          | "same_bank",

      indemnityFutureClaims:
        false,

      indemnityReturnErrorFunds:
        false,

      signatureDate: "",
    });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const updateForm = <
    K extends keyof typeof form,
  >(
    key: K,
    value:
      (typeof form)[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const submitClaim =
    async () => {
      setError("");

      if (
        !form.deceasedName.trim()
      ) {
        setError(
          "Enter the deceased account holder's full legal name.",
        );

        return;
      }

      if (
        !form.deceasedAccountNumber.trim()
      ) {
        setError(
          "Enter the deceased account number.",
        );

        return;
      }

      if (
        !form.beneficiaryName.trim()
      ) {
        setError(
          "Enter the beneficiary's full legal name.",
        );

        return;
      }

      if (
        !form.relationshipToDeceased.trim()
      ) {
        setError(
          "Enter your relationship to the deceased.",
        );

        return;
      }

      if (
        !form.contactDetails.trim()
      ) {
        setError(
          "Enter your contact details.",
        );

        return;
      }

      if (
        form.claimStatement
          .trim().length < 10
      ) {
        setError(
          "Please provide a complete claim declaration.",
        );

        return;
      }

      if (
        !form.indemnityFutureClaims ||
        !form.indemnityReturnErrorFunds
      ) {
        setError(
          "You must accept both indemnity declarations before submitting.",
        );

        return;
      }

      setSubmitting(true);

      try {
        const claim =
          await nextOfKinService.createClaim({
            deceasedName:
              form.deceasedName.trim(),

            deceasedDateOfBirth:
              form.deceasedDateOfBirth ||
              undefined,

            deceasedIdentificationNumber:
              form.deceasedIdentificationNumber.trim() ||
              undefined,

            deceasedAccountNumber:
              form.deceasedAccountNumber.trim(),

            beneficiaryName:
              form.beneficiaryName.trim(),

            beneficiaryDateOfBirth:
              form.beneficiaryDateOfBirth ||
              undefined,

            relationshipToDeceased:
              form.relationshipToDeceased.trim(),

            contactDetails:
              form.contactDetails.trim(),

            claimantIdType:
              form.claimantIdType ||
              undefined,

            claimantIdNumber:
              form.claimantIdNumber.trim() ||
              undefined,

            claimantIdExpiryDate:
              form.claimantIdExpiryDate ||
              undefined,

            claimStatement:
              form.claimStatement.trim(),

            paymentMethod:
              form.paymentMethod,

            indemnityFutureClaims:
              true,

            indemnityReturnErrorFunds:
              true,

            signatureDate:
              form.signatureDate ||
              undefined,

            documents: [
              {
                fileId:
                  deathCertificate.fileId,

                documentType:
                  "death_certificate",
              },
              {
                fileId:
                  frontId.fileId,

                documentType:
                  "claimant_id_front",
              },
              {
                fileId:
                  backId.fileId,

                documentType:
                  "claimant_id_back",
              },
            ],
          });

        onSuccess(claim);
      } catch (requestError) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to submit your POD claim.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <>
      <div className="mt-5 w-full rounded-[8px] border border-white/70 bg-white/20">
        <h2 className="mt-5 text-center font-sf-condensed text-[30px] font-black leading-none text-[#2563EB]">
          POD Claim Form
        </h2>

        <p className="mx-auto mt-5 max-w-[330px] text-center font-lato text-[14px] font-medium leading-[18px] text-[#666]">
          Complete this form carefully.
          Once submitted, your claim
          will be reviewed using the
          information and documents you
          provide.
        </p>

        <div className="mt-5 font-sf-condensed">
          <FormSection title="Deceased Account Holder Information">
            <Input
              placeholder="Full legal name"
              value={
                form.deceasedName
              }
              onChange={(value) =>
                updateForm(
                  "deceasedName",
                  value,
                )
              }
            />

            <Input
              type="date"
              placeholder="Date of birth"
              value={
                form.deceasedDateOfBirth
              }
              onChange={(value) =>
                updateForm(
                  "deceasedDateOfBirth",
                  value,
                )
              }
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Identification number"
                value={
                  form.deceasedIdentificationNumber
                }
                onChange={(value) =>
                  updateForm(
                    "deceasedIdentificationNumber",
                    value,
                  )
                }
              />

              <Input
                placeholder="Account number"
                value={
                  form.deceasedAccountNumber
                }
                onChange={(value) =>
                  updateForm(
                    "deceasedAccountNumber",
                    value,
                  )
                }
              />
            </div>
          </FormSection>

          <FormSection title="Beneficiary (Claimant) Information">
            <Input
              placeholder="Full legal name"
              value={
                form.beneficiaryName
              }
              onChange={(value) =>
                updateForm(
                  "beneficiaryName",
                  value,
                )
              }
            />

            <Input
              type="date"
              placeholder="Date of birth"
              value={
                form.beneficiaryDateOfBirth
              }
              onChange={(value) =>
                updateForm(
                  "beneficiaryDateOfBirth",
                  value,
                )
              }
            />

            <Input
              placeholder="Relationship to deceased"
              value={
                form.relationshipToDeceased
              }
              onChange={(value) =>
                updateForm(
                  "relationshipToDeceased",
                  value,
                )
              }
            />

            <textarea
              value={
                form.contactDetails
              }
              onChange={(event) =>
                updateForm(
                  "contactDetails",
                  event.target.value,
                )
              }
              placeholder="Contact details: address, phone and email"
              className="h-[85px] w-full resize-none rounded-[7px] bg-[#E1E6EC] px-3 py-2 text-[13px] outline-none placeholder:text-black/25"
            />
          </FormSection>

          <FormSection
            title="Identification detail"
            hasChevron
          >
            <SelectInput
              value={
                form.claimantIdType
              }
              onChange={(value) =>
                updateForm(
                  "claimantIdType",
                  value,
                )
              }
            />

            <Input
              placeholder="ID number"
              value={
                form.claimantIdNumber
              }
              onChange={(value) =>
                updateForm(
                  "claimantIdNumber",
                  value,
                )
              }
            />

            <p className="text-[12px] font-black text-[#777]">
              Expiry date
            </p>

            <Input
              type="date"
              placeholder="Expiry date"
              value={
                form.claimantIdExpiryDate
              }
              onChange={(value) =>
                updateForm(
                  "claimantIdExpiryDate",
                  value,
                )
              }
            />

            <UploadedDocumentSummary
              title="ID front"
              document={frontId}
            />

            <UploadedDocumentSummary
              title="ID back"
              document={backId}
            />
          </FormSection>

          <FormSection title="Claim Details / Declaration">
            <div className="rounded-[8px] bg-[#E1E6EC] px-3 py-3 text-[13px] leading-[16px] text-[#666]">
              <p>
                Make a statement
                confirming that:
              </p>

              <ul className="list-disc pl-5">
                <li>
                  The account holder is
                  deceased
                </li>

                <li>
                  You are the named POD
                  beneficiary
                </li>

                <li>
                  The information
                  provided is true and
                  correct
                </li>

                <li>
                  You acknowledge that
                  the bank may verify
                  your information
                </li>
              </ul>
            </div>

            <textarea
              value={
                form.claimStatement
              }
              onChange={(event) =>
                updateForm(
                  "claimStatement",
                  event.target.value,
                )
              }
              placeholder="Write your declaration..."
              className="h-[185px] w-full resize-none rounded-[8px] bg-white px-3 py-3 text-[14px] outline-none placeholder:text-black/25"
            />
          </FormSection>

          <FormSection title="Payment Instructions">
            <p className="text-[12px] font-black text-black/25">
              Choose how you would
              prefer to receive any
              approved funds.
            </p>

            <CheckRow
              label="Transfer to your bank account (ACH/wire)"
              checked={
                form.paymentMethod ===
                "ach_wire"
              }
              onClick={() =>
                updateForm(
                  "paymentMethod",
                  "ach_wire",
                )
              }
            />

            <CheckRow
              label="Issue of a check"
              checked={
                form.paymentMethod ===
                "check"
              }
              onClick={() =>
                updateForm(
                  "paymentMethod",
                  "check",
                )
              }
            />

            <CheckRow
              label="Deposit into an account with the same bank"
              checked={
                form.paymentMethod ===
                "same_bank"
              }
              onClick={() =>
                updateForm(
                  "paymentMethod",
                  "same_bank",
                )
              }
            />
          </FormSection>

          <FormSection title="Submitted Documents">
            <UploadedDocumentSummary
              title="Certified death certificate"
              document={
                deathCertificate
              }
            />

            <UploadedDocumentSummary
              title="Claimant ID — front"
              document={frontId}
            />

            <UploadedDocumentSummary
              title="Claimant ID — back"
              document={backId}
            />
          </FormSection>

          <FormSection title="Indemnity / Liability Clause">
            <p className="text-[12px] font-black text-black/25">
              You agree to:
            </p>

            <CheckRow
              label="Protect the bank from future claims relating to incorrect information supplied by me"
              checked={
                form.indemnityFutureClaims
              }
              onClick={() =>
                updateForm(
                  "indemnityFutureClaims",
                  !form.indemnityFutureClaims,
                )
              }
            />

            <CheckRow
              label="Return funds if paid in error"
              checked={
                form.indemnityReturnErrorFunds
              }
              onClick={() =>
                updateForm(
                  "indemnityReturnErrorFunds",
                  !form.indemnityReturnErrorFunds,
                )
              }
            />
          </FormSection>

          <FormSection title="Signature Section">
            <p className="text-[12px] font-black text-[#777]">
              Declaration date
            </p>

            <Input
              type="date"
              placeholder="Declaration date"
              value={
                form.signatureDate
              }
              onChange={(value) =>
                updateForm(
                  "signatureDate",
                  value,
                )
              }
            />
          </FormSection>

          <FormSection title="⚠ Important Tips!">
            <p className="text-[12px] font-bold leading-[17px] text-black/35">
              Ensure your information
              matches your official
              documents.
              <br />
              <br />
              Submit a certified death
              certificate rather than
              an uncertified copy.
              <br />
              <br />
              Additional evidence may
              be requested during
              review.
            </p>
          </FormSection>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-[10px] bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 mt-4 bg-white/90 px-5 py-3 backdrop-blur-sm">
        <div className="grid grid-cols-[1fr_150px] items-center gap-3 rounded-[2px] border border-white bg-white/20 p-1">
          <p className="px-3 text-[14px] text-[#444]">
            Claim form?
          </p>

          <button
            type="button"
            onClick={() =>
              void submitClaim()
            }
            disabled={submitting}
            className="flex h-[38px] items-center justify-center gap-2 rounded-[10px] bg-[#2458E8] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
          >
            {submitting && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Submitting..."
              : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
}

function PodClaimFormStepDesktop({
  deathCertificate,
  frontId,
  backId,
  onSuccess,
}: {
  deathCertificate: UploadedPodDocument;
  frontId: UploadedPodDocument;
  backId: UploadedPodDocument;
  onSuccess: (claim: PodClaim) => void;
}) {
  const [form, setForm] = useState({
    deceasedName: "",
    deceasedDateOfBirth: "",
    deceasedIdentificationNumber: "",
    deceasedAccountNumber: "",

    beneficiaryName: "",
    beneficiaryDateOfBirth: "",
    relationshipToDeceased: "",
    contactDetails: "",

    claimantIdType: "",
    claimantIdNumber: "",
    claimantIdExpiryDate: "",

    claimStatement: "",
    paymentMethod: "same_bank" as "ach_wire" | "check" | "same_bank",
    indemnityFutureClaims: false,
    indemnityReturnErrorFunds: false,
    signatureDate: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submitClaim = async () => {
    setError("");
    if (!form.deceasedName.trim()) {
      setError("Enter the deceased account holder's full legal name.");
      return;
    }
    if (!form.deceasedAccountNumber.trim()) {
      setError("Enter the deceased account number.");
      return;
    }
    if (!form.beneficiaryName.trim()) {
      setError("Enter the beneficiary's full legal name.");
      return;
    }
    if (!form.relationshipToDeceased.trim()) {
      setError("Enter your relationship to the deceased.");
      return;
    }
    if (!form.contactDetails.trim()) {
      setError("Enter your contact details.");
      return;
    }
    if (form.claimStatement.trim().length < 10) {
      setError("Please provide a complete claim declaration.");
      return;
    }
    if (!form.indemnityFutureClaims || !form.indemnityReturnErrorFunds) {
      setError("You must accept both indemnity declarations before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const claim = await nextOfKinService.createClaim({
        deceasedName: form.deceasedName.trim(),
        deceasedDateOfBirth: form.deceasedDateOfBirth || undefined,
        deceasedIdentificationNumber: form.deceasedIdentificationNumber.trim() || undefined,
        deceasedAccountNumber: form.deceasedAccountNumber.trim(),
        beneficiaryName: form.beneficiaryName.trim(),
        beneficiaryDateOfBirth: form.beneficiaryDateOfBirth || undefined,
        relationshipToDeceased: form.relationshipToDeceased.trim(),
        contactDetails: form.contactDetails.trim(),
        claimantIdType: form.claimantIdType || undefined,
        claimantIdNumber: form.claimantIdNumber.trim() || undefined,
        claimantIdExpiryDate: form.claimantIdExpiryDate || undefined,
        claimStatement: form.claimStatement.trim(),
        paymentMethod: form.paymentMethod,
        indemnityFutureClaims: true,
        indemnityReturnErrorFunds: true,
        signatureDate: form.signatureDate || undefined,
        documents: [
          { fileId: deathCertificate.fileId, documentType: "death_certificate" },
          { fileId: frontId.fileId, documentType: "claimant_id_front" },
          { fileId: backId.fileId, documentType: "claimant_id_back" },
        ],
      });
      onSuccess(claim);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to submit your POD claim."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1 text-xs font-black uppercase tracking-wider text-[#2563EB] mb-3">
          Step 3 of 3
        </span>
        <h2 className="font-heading text-3xl font-black text-[#1f1f1f]">
          Formal Payable on Death (POD) Claim Form
        </h2>
        <p className="mt-2 text-sm text-black/60">
          Complete the statutory details below regarding the deceased account holder and beneficiary claimant.
        </p>
      </div>

      {error && (
        <div className="rounded-[16px] bg-red-50 px-6 py-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {/* Deceased Info */}
        <div className="rounded-[24px] bg-white p-6 border border-black/5 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#1f1f1f]">Deceased Account Holder</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-black/60">Full Legal Name</label>
              <Input placeholder="e.g. John Doe" value={form.deceasedName} onChange={(v) => updateForm("deceasedName", v)} />
            </div>
            <div>
              <label className="text-xs font-bold text-black/60">Date of Birth</label>
              <Input type="date" placeholder="" value={form.deceasedDateOfBirth} onChange={(v) => updateForm("deceasedDateOfBirth", v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-black/60">ID Number</label>
                <Input placeholder="SSN / National ID" value={form.deceasedIdentificationNumber} onChange={(v) => updateForm("deceasedIdentificationNumber", v)} />
              </div>
              <div>
                <label className="text-xs font-bold text-black/60">Account Number</label>
                <Input placeholder="Bank Account #" value={form.deceasedAccountNumber} onChange={(v) => updateForm("deceasedAccountNumber", v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Beneficiary Info */}
        <div className="rounded-[24px] bg-white p-6 border border-black/5 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#1f1f1f]">Beneficiary (Claimant) Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-black/60">Full Legal Name</label>
              <Input placeholder="Your full name" value={form.beneficiaryName} onChange={(v) => updateForm("beneficiaryName", v)} />
            </div>
            <div>
              <label className="text-xs font-bold text-black/60">Relationship to Deceased</label>
              <Input placeholder="e.g. Son, Daughter, Spouse" value={form.relationshipToDeceased} onChange={(v) => updateForm("relationshipToDeceased", v)} />
            </div>
            <div>
              <label className="text-xs font-bold text-black/60">Contact Details</label>
              <textarea
                value={form.contactDetails}
                onChange={(e) => updateForm("contactDetails", e.target.value)}
                placeholder="Address, Phone, Email"
                className="h-[76px] w-full resize-none rounded-[7px] bg-[#E1E6EC] px-3 py-2 text-xs outline-none placeholder:text-black/25"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ID & Payment Instructions */}
      <div className="rounded-[24px] bg-white p-6 border border-black/5 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#1f1f1f]">Identification & Preferred Payout Method</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-black/60">ID Document Type</label>
            <SelectInput value={form.claimantIdType} onChange={(v) => updateForm("claimantIdType", v)} />
          </div>
          <div>
            <label className="text-xs font-bold text-black/60">ID Number</label>
            <Input placeholder="ID Card Number" value={form.claimantIdNumber} onChange={(v) => updateForm("claimantIdNumber", v)} />
          </div>
          <div>
            <label className="text-xs font-bold text-black/60">ID Expiry Date</label>
            <Input type="date" placeholder="" value={form.claimantIdExpiryDate} onChange={(v) => updateForm("claimantIdExpiryDate", v)} />
          </div>
        </div>

        <div className="pt-4 border-t border-black/5">
          <label className="text-xs font-bold text-black/60 block mb-2">Preferred Payout Method</label>
          <div className="grid grid-cols-3 gap-3">
            <CheckRow label="Same Bank Account" checked={form.paymentMethod === "same_bank"} onClick={() => updateForm("paymentMethod", "same_bank")} />
            <CheckRow label="ACH / Wire Transfer" checked={form.paymentMethod === "ach_wire"} onClick={() => updateForm("paymentMethod", "ach_wire")} />
            <CheckRow label="Physical Check" checked={form.paymentMethod === "check"} onClick={() => updateForm("paymentMethod", "check")} />
          </div>
        </div>
      </div>

      {/* Declaration & Indemnity */}
      <div className="rounded-[24px] bg-white p-6 border border-black/5 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#1f1f1f]">Declaration & Indemnity Agreement</h3>
        <textarea
          value={form.claimStatement}
          onChange={(e) => updateForm("claimStatement", e.target.value)}
          placeholder="Write your formal claim declaration statement here confirming truthfulness..."
          className="h-[120px] w-full resize-none rounded-[12px] bg-[#E1E6EC] px-4 py-3 text-xs outline-none placeholder:text-black/25"
        />

        <div className="space-y-2 pt-2">
          <CheckRow
            label="Protect the bank from future claims relating to incorrect information supplied by me"
            checked={form.indemnityFutureClaims}
            onClick={() => updateForm("indemnityFutureClaims", !form.indemnityFutureClaims)}
          />
          <CheckRow
            label="Return funds if paid in error"
            checked={form.indemnityReturnErrorFunds}
            onClick={() => updateForm("indemnityReturnErrorFunds", !form.indemnityReturnErrorFunds)}
          />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <div className="w-1/3">
            <label className="text-xs font-bold text-black/60">Declaration Date</label>
            <Input type="date" placeholder="" value={form.signatureDate} onChange={(v) => updateForm("signatureDate", v)} />
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void submitClaim()}
            className="flex h-[52px] px-10 items-center justify-center gap-2 rounded-[14px] bg-[#2458E8] text-base font-bold text-white shadow-lg transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? "Submitting Claim..." : "Submit POD Claim"}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Upload Action
|--------------------------------------------------------------------------
*/

function UploadActionRow({
  label,
  buttonText,
  uploaded,
  loading = false,
  inputId,
  onClick,
}: {
  label: string;
  buttonText: string;
  uploaded?: boolean;
  loading?: boolean;
  inputId?: string;
  onClick?: () => void;
}) {
  if (
    inputId &&
    !onClick
  ) {
    return (
      <div className="rounded-[2px] border border-white bg-white/20 p-1">
        <div className="grid grid-cols-[1fr_135px] items-center gap-3">
          <p className="px-3 text-[14px] text-[#444]">
            {label}
          </p>

          <label
            htmlFor={inputId}
            className={`flex h-[36px] cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[13px] font-bold text-white active:scale-[0.98] ${
              uploaded
                ? "bg-[#27AE60]"
                : "bg-[#2458E8]"
            }`}
          >
            {loading && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            {buttonText}
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2px] border border-white bg-white/20 p-1">
      <div className="grid grid-cols-[1fr_135px] items-center gap-3">
        <p className="px-3 text-[14px] text-[#444]">
          {label}
        </p>

        <button
          type="button"
          onClick={onClick}
          disabled={
            loading ||
            !onClick
          }
          className={`flex h-[36px] items-center justify-center gap-2 rounded-[10px] text-[13px] font-bold text-white disabled:opacity-60 active:scale-[0.98] ${
            uploaded
              ? "bg-[#27AE60]"
              : "bg-[#2458E8]"
          }`}
        >
          {loading && (
            <Loader2
              size={14}
              className="animate-spin"
            />
          )}

          {buttonText}
        </button>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| File Preview
|--------------------------------------------------------------------------
*/

function UploadBox({
  uploadedFile,
  emptyLabel,
  className = "",
}: {
  uploadedFile:
    | UploadedFile
    | null;

  emptyLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[7px] bg-white ${className}`}
    >
      {uploadedFile?.previewUrl ? (
        <img
          src={
            uploadedFile.previewUrl
          }
          alt="Uploaded preview"
          className="h-full w-full object-cover"
        />
      ) : uploadedFile ? (
        <div className="flex h-full items-center justify-center px-5 text-center">
          <div>
            <CheckCircle2
              size={34}
              className="mx-auto text-[#27AE60]"
            />

            <p className="mt-3 text-[13px] font-semibold text-[#2458E8]">
              {
                uploadedFile
                  .file.name
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center text-black/25">
            <ImageIcon size={40} />

            {emptyLabel && (
              <span className="mt-2 text-[13px]">
                {emptyLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Form Components
|--------------------------------------------------------------------------
*/

function FormSection({
  title,
  children,
  hasChevron = false,
}: {
  title: string;
  children:
    | React.ReactNode;

  hasChevron?: boolean;
}) {
  return (
    <section className="border-y border-black/10 bg-white px-2 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-black tracking-[0.05em] text-[#555]">
          {title}
        </h3>

        {hasChevron && (
          <ChevronDown
            size={17}
            className="text-black/35"
          />
        )}
      </div>

      <div className="space-y-2">
        {children}
      </div>
    </section>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;

  onChange:
    (value: string) => void;

  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      placeholder={placeholder}
      className="h-[38px] w-full rounded-[7px] bg-[#E1E6EC] px-3 text-[13px] outline-none placeholder:text-black/25"
    />
  );
}

function SelectInput({
  value,
  onChange,
}: {
  value: string;

  onChange:
    (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className="h-[38px] w-full rounded-[7px] border border-black/10 bg-white px-3 text-[13px] text-[#555] outline-none"
    >
      <option value="">
        Select ID Type
      </option>

      <option value="passport">
        Passport
      </option>

      <option value="drivers_license">
        Driver&apos;s licence
      </option>

      <option value="national_id">
        National ID
      </option>

      <option value="residence_permit">
        Residence permit
      </option>
    </select>
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
      className="flex min-h-[38px] w-full items-center gap-3 rounded-[7px] bg-[#E1E6EC] px-3 text-left text-[13px] text-[#555]"
    >
      <span
        className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[3px] border ${
          checked
            ? "border-[#2E8B57] bg-white text-[#2E8B57]"
            : "border-black/20"
        }`}
      >
        {checked
          ? "✓"
          : ""}
      </span>

      <span>
        {label}
      </span>
    </button>
  );
}

function UploadedDocumentSummary({
  title,
  document,
}: {
  title: string;

  document:
    | UploadedPodDocument
    | null;
}) {
  if (!document) return null;
  return (
    <div className="rounded-[8px] bg-[#EFF2F6] px-3 py-3">
      <div className="flex items-center gap-3">
        <CheckCircle2
          size={18}
          className="shrink-0 text-[#27AE60]"
        />

        <div className="min-w-0">
          <p className="text-[12px] font-bold text-[#555]">
            {title}
          </p>

          <p className="mt-1 truncate text-[11px] text-black/40">
            {
              document.originalName
            }
          </p>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Success
|--------------------------------------------------------------------------
*/

function PodSuccessStep({
  claim,
}: {
  claim:
    | PodClaim
    | null;
}) {
  return (
    <>
      <div className="mt-8 flex flex-1 flex-col items-center">
        <div className="flex h-[378px] w-[302px] items-center justify-center">
          <img
            src="/images/pod-success.png"
            alt="POD success"
            className="h-[378px] w-[302px] object-contain"
          />
        </div>

        <div className="mt-7 h-px w-[280px] bg-black/35" />

        <div className="mt-6 max-w-[310px] space-y-4 text-center font-lato text-[14px] leading-[18px] text-[#666]">
          <p>
            You have successfully
            submitted your POD claim as
            next of kin.
          </p>

          <p>
            Your claim is now awaiting
            review.
          </p>

          {claim && (
            <div className="rounded-[10px] bg-white px-4 py-3 text-left shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/35">
                Claim reference
              </p>

              <p className="mt-1 break-all text-[12px] font-bold text-[#2458E8]">
                {claim.id}
              </p>

              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-black/35">
                Status
              </p>

              <p className="mt-1 text-[12px] font-bold capitalize text-[#333]">
                {claim.status.replaceAll(
                  "_",
                  " ",
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto rounded-[12px] p-1">
        <Link
          href="/dashboard"
          className="flex h-[40px] w-full items-center justify-center rounded-[12px] bg-[#1D4ED8] font-roboto text-[14px] font-bold text-white"
        >
          Close
        </Link>
      </div>
    </>
  );
}

function PodSuccessStepDesktop({ claim }: { claim: PodClaim | null }) {
  return (
    <div className="flex flex-col items-center text-center py-12 max-w-xl mx-auto space-y-6">
      <div className="h-24 w-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
        <CheckCircle2 size={56} />
      </div>

      <h2 className="text-3xl font-black text-[#1f1f1f]">
        POD Claim Successfully Submitted!
      </h2>

      <p className="text-sm text-black/60 leading-relaxed">
        Your formal Payable on Death (POD) claim has been successfully filed under your next-of-kin profile. Our compliance team will review your certified documents and statement.
      </p>

      {claim && (
        <div className="w-full rounded-[20px] bg-white p-6 border border-black/5 shadow-sm text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/40 uppercase tracking-wider">Claim Reference ID</span>
            <span className="text-xs font-black text-[#2458E8]">{claim.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/40 uppercase tracking-wider">Current Status</span>
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-black uppercase text-amber-800">
              {claim.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      )}

      <div className="pt-4 w-full">
        <Link
          href="/dashboard"
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#1D4ED8] text-base font-bold text-white shadow-lg transition hover:bg-blue-600 active:scale-[0.99]"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}