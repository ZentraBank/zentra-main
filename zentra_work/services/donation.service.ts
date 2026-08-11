import { apiRequest } from "@/lib/api-client";

export type Donor = {
  id: string;
  tenant_id: string;
  created_by: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  profile_image_url: string | null;
  address: string | null;
  country: string | null;
  status: "active" | "inactive" | "blocked";
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type DonationRequest = {
  id: string;
  tenant_id: string;
  donor_id: string;
  beneficiary_user_id: string;
  account_id: string;
  amount: string | number;
  currency: string;
  purpose: string | null;
  appreciation: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "funded"
    | "redeemed";
  donor_name?: string;
  donor_email?: string | null;
  account_number?: string;
  account_name?: string;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export const donationService = {
  listDonors(input?: {
    page?: number;
    pageSize?: number;
    status?: "active" | "inactive" | "blocked";
    search?: string;
    excludeDonorId?: string;
  }) {
    const params = new URLSearchParams();

    params.set(
      "page",
      String(input?.page ?? 1),
    );

    params.set(
      "pageSize",
      String(input?.pageSize ?? 20),
    );

    if (input?.status) {
      params.set("status", input.status);
    }

    if (input?.search?.trim()) {
      params.set(
        "search",
        input.search.trim(),
      );
    }

    if (input?.excludeDonorId) {
      params.set(
        "excludeDonorId",
        input.excludeDonorId,
      );
    }

    return apiRequest<Donor[]>(
      `/donations/donors?${params.toString()}`,
    );
  },

  getDonor(donorId: string) {
    return apiRequest<Donor>(
      `/donations/donors/${encodeURIComponent(donorId)}`,
    );
  },

  createRequest(input: {
    donorId: string;
    accountId: string;
    amount: number;
    currency: string;
    purpose: string;
    appreciation: string;
  }) {
    return apiRequest<DonationRequest>(
      "/donations/requests",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  listMine(input?: {
    page?: number;
    pageSize?: number;
    status?: DonationRequest["status"];
  }) {
    const params = new URLSearchParams();

    params.set(
      "page",
      String(input?.page ?? 1),
    );

    params.set(
      "pageSize",
      String(input?.pageSize ?? 20),
    );

    if (input?.status) {
      params.set("status", input.status);
    }

    return apiRequest<DonationRequest[]>(
      `/donations/requests/me?${params.toString()}`,
    );
  },

  requestRedemption(requestId: string) {
    return apiRequest<{
      redemptionId: string;
      expiresAt: string;
      developmentOtp?: string;
    }>(
      `/donations/requests/${encodeURIComponent(requestId)}/redemptions`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  },

getMine(requestId: string) {
  return apiRequest<DonationRequest>(
    `/donations/requests/me/${encodeURIComponent(
      requestId,
    )}`,
  );
},

  verifyRedemptionOtp(
    redemptionId: string,
    otp: string,
  ) {
    return apiRequest(
      `/donations/redemptions/${encodeURIComponent(redemptionId)}/verify-otp`,
      {
        method: "POST",
        body: JSON.stringify({ otp }),
      },
    );
  },
};