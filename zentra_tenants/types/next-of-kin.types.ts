export type PodDocumentType =
  | "death_certificate"
  | "claimant_id_front"
  | "claimant_id_back"
  | "claimant_id_document"
  | "w9"
  | "proof_of_address"
  | "additional_identity"
  | "signature";

export type PodClaimStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_information_required"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export type PodPaymentMethod =
  | "ach_wire"
  | "check"
  | "same_bank";

export type PodClaimDocument = {
  id: string;
  document_type: PodDocumentType;
  file_id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export type PodClaim = {
  id: string;
  tenant_id: string;
  claimant_user_id: string;

  deceased_name: string;
  deceased_date_of_birth: string | null;
  deceased_identification_number: string | null;
  deceased_account_number: string;

  beneficiary_name: string;
  beneficiary_date_of_birth: string | null;
  relationship_to_deceased: string;
  contact_details: string;

  claimant_id_type: string | null;
  claimant_id_number: string | null;
  claimant_id_expiry_date: string | null;

  claim_statement: string;

  payment_method: PodPaymentMethod;

  indemnity_future_claims:
    | number
    | boolean;

  indemnity_return_error_funds:
    | number
    | boolean;

  signature_date: string | null;

  status: PodClaimStatus;
  rejection_reason: string | null;
  more_information_request: string | null;
  more_information_requested_at: string | null;

  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;

  documents?: PodClaimDocument[];
};

export type PodClaimsResponse = {
  claims: PodClaim[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PodClaimListParams = {
  page?: number;
  pageSize?: number;
  status?: PodClaimStatus;
};

export type UpdatePodClaimStatusInput = {
  status:
    | "submitted"
    | "under_review"
    | "more_information_required"
    | "approved"
    | "rejected"
    | "completed"
    | "cancelled";

  rejectionReason?: string;

  moreInformationRequest?: string;
};