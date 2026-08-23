import { api } from "@/lib/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type TenantKycDocument = {
  id: string;
  document_type:
    | "identity_front"
    | "identity_back"
    | "selfie"
    | "proof_of_address"
    | "supporting_document";

  file_url: string;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
};

export type TenantKycApplication = {
  id: string;

  tenant_id: string;
  user_id: string;

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

  identity_type:
    | "passport"
    | "national_id"
    | "drivers_license"
    | "residence_permit";

  identity_number: string;
  identity_expiry_date: string | null;

  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected";

  risk_level:
    | "low"
    | "medium"
    | "high"
    | null;

  rejection_reason: string | null;

  submitted_at: string | null;
  reviewed_at?: string | null;
  approved_at: string | null;

  customer_name?: string | null;
  customer_email?: string | null;

  documents?: TenantKycDocument[];
};

export type KycApplicationListResponse =
  | TenantKycApplication[]
  | {
      applications: TenantKycApplication[];
      pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    };

export type ReviewKycInput = {
  status:
    | "under_review"
    | "approved"
    | "rejected";

  riskLevel?:
    | "low"
    | "medium"
    | "high";

  rejectionReason?: string;
};

export const kycService = {
  async listApplications(options?: {
    status?: "submitted" | "under_review";
    page?: number;
    pageSize?: number;
  }): Promise<TenantKycApplication[]> {
    const params =
      new URLSearchParams({
        page: String(
          options?.page ?? 1,
        ),

        pageSize: String(
          options?.pageSize ?? 50,
        ),

        status:
          options?.status ??
          "submitted",
      });

    const response =
      await api.get<
        ApiResponse<KycApplicationListResponse>
      >(
        `/kyc/admin/applications?${params.toString()}`,
      );

    const data =
      response.data.data;

    if (Array.isArray(data)) {
      return data;
    }

    return data.applications ?? [];
  },

  async reviewApplication(
    profileId: string,
    payload: ReviewKycInput,
  ): Promise<TenantKycApplication> {
    const response =
      await api.patch<
        ApiResponse<TenantKycApplication>
      >(
        `/kyc/admin/applications/${encodeURIComponent(
          profileId,
        )}/review`,
        payload,
      );

    return response.data.data;
  },

  async getApplication(
  profileId: string,
): Promise<TenantKycApplication> {
  const response =
    await api.get<
      ApiResponse<TenantKycApplication>
    >(
      `/kyc/admin/applications/${encodeURIComponent(
        profileId,
      )}`,
    );

  return response.data.data;
},

};

