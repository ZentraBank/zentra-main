import { apiRequest } from "@/lib/api-client";

export type ClientDonor = {
  id: string;
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

  metadata?: {
    nationality?: string | null;
    title?: string | null;
    gender?: string | null;
    fundingMethods?: string[];
    transactionDate?: string | null;
    major?: string | null;

    [key: string]: unknown;
  } | null;

  created_at: string;
};

export type ClientDonationRequest = {
  id: string;
  tenant_id: string;

  donor_id: string;
  beneficiary_user_id: string;
  account_id: string;

  amount: string | number;
  currency: string;

  purpose: string;
  appreciation: string;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "funded"
    | "redeemed";

  rejection_reason?: string | null;

  donor_name: string;

  account_number: string;
  account_name: string;

  created_at: string;
};

export type CreateDonationRequestInput = {
  donorId: string;
  accountId: string;

  amount: number;
  currency: string;

  purpose: string;
  appreciation: string;
};

export const donationService = {
  async listDonors(
    options?: {
      search?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<ClientDonor[]> {
    const params =
      new URLSearchParams({
        /*
         * Client must only request
         * active donors.
         */
        status: "active",

        page: String(
          options?.page ?? 1,
        ),

        pageSize: String(
          options?.pageSize ?? 50,
        ),
      });

    if (
      options?.search?.trim()
    ) {
      params.set(
        "search",
        options.search.trim(),
      );
    }

    return apiRequest<ClientDonor[]>(
      `/donations/donors?${params.toString()}`,
    );
  },

  async getDonor(
    donorId: string,
  ): Promise<ClientDonor> {
    return apiRequest<ClientDonor>(
      `/donations/donors/${encodeURIComponent(
        donorId,
      )}`,
    );
  },

  async createRequest(
    payload:
      CreateDonationRequestInput,
  ): Promise<ClientDonationRequest> {
    return apiRequest<ClientDonationRequest>(
      "/donations/requests",
      {
        method: "POST",
        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  async listMine(
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
    ClientDonationRequest[]
  > {
    const params =
      new URLSearchParams({
        page: String(
          options?.page ?? 1,
        ),

        pageSize: String(
          options?.pageSize ?? 50,
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

    return apiRequest<
      ClientDonationRequest[]
    >(
      `/donations/requests/me?${params.toString()}`,
    );
  },
};