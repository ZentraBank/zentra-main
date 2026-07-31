export type KycStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

export type KycDocument = {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
};

export type KycProfile = {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  residential_address: string;
  city: string;
  state_region: string | null;
  postal_code: string | null;
  country: string;
  identity_type: "passport" | "national_id" | "drivers_license" | "residence_permit";
  identity_number: string;
  identity_expiry_date: string | null;
  status: KycStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  documents: KycDocument[];
};

export type SaveKycProfileInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  residentialAddress: string;
  city: string;
  stateRegion?: string;
  postalCode?: string;
  country: string;
  identityType: KycProfile["identity_type"];
  identityNumber: string;
  identityExpiryDate?: string;
};
