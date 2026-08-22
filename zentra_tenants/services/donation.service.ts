import { api } from "@/lib/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

/*
|--------------------------------------------------------------------------
| Donors
|--------------------------------------------------------------------------
*/

export type DonorMetadata = {
  nationality?: string | null;
  title?: string | null;
  gender?: string | null;

  fundingMethods?: string[];

  transactionDate?: string | null;

  major?: string | null;

  description?: string | null;
  bio?: string | null;

  [key: string]: unknown;
};

export type TenantDonor = {
  id: string;
  tenant_id: string;
  created_by: string;

  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  address?: string | null;
  country?: string | null;

  status:
    | "active"
    | "inactive"
    | "blocked";

  metadata?: DonorMetadata | null;

  created_at: string;
  updated_at?: string | null;
};

export type Donor = {
  id: string;
  tenant_id: string;

  full_name: string;

  email?: string | null;
  phone_number?: string | null;

  profile_image_url?: string | null;

  address?: string | null;
  country?: string | null;

  status:
    | "active"
    | "inactive"
    | "blocked";

  metadata?: DonorMetadata | null;

  created_at: string;
  updated_at?: string;
};

export type CreateDonorInput = {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  address?: string;
  country?: string;
  metadata?: Record<
    string,
    unknown
  >;
};

export type UpdateDonorInput = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  address?: string;
  country?: string;

  status?:
    | "active"
    | "inactive"
    | "blocked";

  metadata?: Record<
    string,
    unknown
  >;
};

/*
|--------------------------------------------------------------------------
| Donation requests
|--------------------------------------------------------------------------
*/

export type TenantDonationRequest = {
  id: string;
  tenant_id: string;

  donor_id: string;
  beneficiary_user_id: string;
  account_id: string;

  amount:
    | string
    | number;

  currency: string;

  purpose?: string | null;
  appreciation?: string | null;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "funded"
    | "redeemed";

  rejection_reason?: string | null;

  approved_by?: string | null;
  approved_at?: string | null;

  rejected_by?: string | null;
  rejected_at?: string | null;

  donor_name: string;
  donor_email?: string | null;

  account_number: string;
  account_name: string;

  created_at: string;
  updated_at?: string | null;
};

export type DonationRequestListResponse = {
  requests:
    TenantDonationRequest[];

  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

/*
|--------------------------------------------------------------------------
| Redemptions
|--------------------------------------------------------------------------
*/

export type TenantDonationRedemption = {
  id: string;
  tenant_id: string;

  donation_request_id: string;
  user_id: string;

  amount:
    | string
    | number;

  currency: string;

  status:
    | "pending_otp"
    | "approved"
    | "completed";

  otp_attempts?: number;
  otp_verified_at?: string | null;

  donor_id?: string;
  beneficiary_user_id?: string;
  account_id?: string;

  donor_name?: string;

  beneficiary_name?: string;
  beneficiary_email?: string;

  account_number?: string;
  account_name?: string;
  account_currency?: string;

  purpose?: string | null;
  appreciation?: string | null;

  created_at: string;
  updated_at?: string | null;
};

export type RedemptionListResponse = {
  redemptions:
    TenantDonationRedemption[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

/*
|--------------------------------------------------------------------------
| Service
|--------------------------------------------------------------------------
*/

export const donationService = {
  /*
  |--------------------------------------------------------------------------
  | Donors
  |--------------------------------------------------------------------------
  */

  async listDonors(
    options?: {
      status?:
        | "active"
        | "inactive"
        | "blocked";

      search?: string;

      page?: number;
      pageSize?: number;

      excludeDonorId?: string;
    },
  ): Promise<
    TenantDonor[]
  > {
    const params =
      new URLSearchParams({
        page: String(
          options?.page ??
            1,
        ),

        pageSize: String(
          options?.pageSize ??
            100,
        ),
      });

    if (
      options?.status
    ) {
      params.set(
        "status",
        options.status,
      );
    }

    if (
      options?.search?.trim()
    ) {
      params.set(
        "search",
        options.search.trim(),
      );
    }

    if (
      options?.excludeDonorId
    ) {
      params.set(
        "excludeDonorId",
        options.excludeDonorId,
      );
    }

    const response =
      await api.get<
        ApiResponse<
          TenantDonor[]
        >
      >(
        `/donations/donors?${params.toString()}`,
      );

    return response.data.data;
  },

  async getDonor(
    donorId: string,
  ): Promise<TenantDonor> {
    const response =
      await api.get<
        ApiResponse<TenantDonor>
      >(
        `/donations/donors/${encodeURIComponent(
          donorId,
        )}`,
      );

    return response.data.data;
  },

async createDonor(payload: {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  address?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await api.post(
    "/donations/donors",
    payload
  );

  return response.data.data;
},

  async updateDonor(
    donorId: string,
    payload:
      UpdateDonorInput,
  ): Promise<TenantDonor> {
    const response =
      await api.patch<
        ApiResponse<TenantDonor>
      >(
        `/donations/donors/${encodeURIComponent(
          donorId,
        )}`,
        payload,
      );

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Donation requests
  |--------------------------------------------------------------------------
  */

  async listRequests(
    options?: {
      status?:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "funded"
        | "redeemed";

      page?: number;
      pageSize?: number;
    },
  ): Promise<
    TenantDonationRequest[]
  > {
    const params =
      new URLSearchParams({
        page: String(
          options?.page ??
            1,
        ),

        pageSize: String(
          options?.pageSize ??
            100,
        ),
      });

    if (
      options?.status
    ) {
      params.set(
        "status",
        options.status,
      );
    }

    const response =
      await api.get<
        ApiResponse<
          TenantDonationRequest[]
        >
      >(
        `/donations/admin/requests?${params.toString()}`,
      );

    return response.data.data;
  },

  async reviewRequest(
    requestId: string,
    payload: {
      status:
        | "approved"
        | "rejected";

      rejectionReason?: string;
    },
  ): Promise<
    TenantDonationRequest
  > {
    const response =
      await api.patch<
        ApiResponse<
          TenantDonationRequest
        >
      >(
        `/donations/admin/requests/${encodeURIComponent(
          requestId,
        )}/review`,
        payload,
      );

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Redemptions
  |--------------------------------------------------------------------------
  */

  async listRedemptions(
    options?: {
      status?:
        | "pending_otp"
        | "approved"
        | "completed";

      search?: string;

      page?: number;
      pageSize?: number;
    },
  ): Promise<
    RedemptionListResponse
  > {
    const params =
      new URLSearchParams({
        page: String(
          options?.page ??
            1,
        ),

        pageSize: String(
          options?.pageSize ??
            100,
        ),
      });

    if (
      options?.status
    ) {
      params.set(
        "status",
        options.status,
      );
    }

    if (
      options?.search?.trim()
    ) {
      params.set(
        "search",
        options.search.trim(),
      );
    }

    const response =
      await api.get<
        ApiResponse<
          RedemptionListResponse
        >
      >(
        `/donations/admin/redemptions?${params.toString()}`,
      );

    return response.data.data;
  },

  async completeRedemption(
    redemptionId: string,
  ): Promise<{
    redemptionId: string;
    requestId?: string;
    accountId?: string;
    amount?: number;
    currency?: string;
    balanceAfter?: number;
    status: "completed";
  }> {
    const response =
      await api.post<
        ApiResponse<{
          redemptionId: string;
          requestId?: string;
          accountId?: string;
          amount?: number;
          currency?: string;
          balanceAfter?: number;
          status: "completed";
        }>
      >(
        `/donations/admin/redemptions/${encodeURIComponent(
          redemptionId,
        )}/complete`,
        {},
      );

    return response.data.data;
  },
  
};