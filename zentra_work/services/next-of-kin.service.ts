import { apiRequest } from "@/lib/api-client";

import type {
  PodClaim,
  PodClaimsResponse,
  PodDocumentType,
  UploadedPodDocument,
} from "@/types/next-of-kin";

type CreatePodClaimInput = {
  deceasedName: string;
  deceasedDateOfBirth?: string;
  deceasedIdentificationNumber?: string;
  deceasedAccountNumber: string;

  beneficiaryName: string;
  beneficiaryDateOfBirth?: string;
  relationshipToDeceased: string;
  contactDetails: string;

  claimantIdType?: string;
  claimantIdNumber?: string;
  claimantIdExpiryDate?: string;

  claimStatement: string;

  paymentMethod:
    | "ach_wire"
    | "check"
    | "same_bank";

  indemnityFutureClaims: true;
  indemnityReturnErrorFunds: true;

  signatureDate?: string;

  documents: Array<{
    fileId: string;
    documentType: PodDocumentType;
  }>;
};

export const nextOfKinService = {
  uploadDocument(
    file: File,
    documentType: PodDocumentType,
  ) {
    const formData = new FormData();

    formData.append(
      "documentType",
      documentType,
    );

    formData.append(
      "file",
      file,
    );

    return apiRequest<UploadedPodDocument>(
      "/next-of-kin/files",
      {
        method: "POST",
        body: formData,
      },
    );
  },

  createClaim(
    input: CreatePodClaimInput,
  ) {
    return apiRequest<PodClaim>(
      "/next-of-kin/claims",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  listMine() {
    return apiRequest<PodClaimsResponse>(
      "/next-of-kin/claims/me",
    );
  },

  getMine(
    claimId: string,
  ) {
    return apiRequest<PodClaim>(
      `/next-of-kin/claims/me/${encodeURIComponent(
        claimId,
      )}`,
    );
  },
};