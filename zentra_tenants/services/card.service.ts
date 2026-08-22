import { api } from "@/lib/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type TenantCardPurchaseRequest = {
  id: string;
  tenant_id: string;
  user_id: string;
  account_id: string;

  card_type: string;
  card_brand: string;

  price: string | number;
  currency: string;

  payment_method: string;
  payment_reference?: string | null;
  payment_proof_url?: string | null;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

  rejection_reason?: string | null;

  issued_card_id?: string | null;

  reviewed_by?: string | null;
  reviewed_at?: string | null;

  created_at: string;

  account_number: string;
  account_name: string;
  account_currency: string;

  customer_name: string;
  customer_email: string;
};

export type TenantCard = {
  id: string;
  user_id: string;
  account_id: string;

  card_type: string;
  card_brand: string;

  masked_pan: string;
  pan_last4: string;

  expiry_month: number;
  expiry_year: number;

  status:
    | "pending"
    | "active"
    | "frozen"
    | "blocked"
    | "inactive"
    | "expired";

  is_virtual: boolean;

  daily_spend_limit:
    | string
    | number;

  account_number: string;
  account_name: string;
  currency: string;

  created_at: string;
};

export type CardRequestListResponse = {
  requests: TenantCardPurchaseRequest[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export const cardService = {
  async listPurchaseRequests(
    status?: string,
    page = 1,
    pageSize = 50,
  ): Promise<CardRequestListResponse> {
    const params =
      new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

    if (status) {
      params.set(
        "status",
        status,
      );
    }

    const response =
      await api.get<
        ApiResponse<CardRequestListResponse>
      >(
        `/cards/admin/purchase-requests?${params.toString()}`,
      );

    return response.data.data;
  },

  async approvePurchaseRequest(
    requestId: string,
  ) {
    const response =
      await api.patch(
        `/cards/admin/purchase-requests/${encodeURIComponent(
          requestId,
        )}/approve`,
        {},
      );

    return response.data.data;
  },

  async rejectPurchaseRequest(
    requestId: string,
    rejectionReason: string,
  ) {
    const response =
      await api.patch(
        `/cards/admin/purchase-requests/${encodeURIComponent(
          requestId,
        )}/reject`,
        {
          rejectionReason,
        },
      );

    return response.data.data;
  },

  async listIssuedCards(
  page = 1,
  pageSize = 50,
): Promise<TenantCardListResponse> {
  const params =
    new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

  const response =
    await api.get<
      ApiResponse<TenantCardListResponse>
    >(
      `/cards/admin?${params.toString()}`,
    );

  return response.data.data;
},

async getIssuedCard(
  cardId: string,
): Promise<TenantCard> {
  const response =
    await api.get<
      ApiResponse<TenantCard>
    >(
      `/cards/admin/${encodeURIComponent(
        cardId,
      )}`,
    );

  return response.data.data;
},

async changeIssuedCardStatus(
  cardId: string,
  status:
    | "active"
    | "frozen"
    | "blocked"
    | "inactive",
  reason?: string,
): Promise<TenantCard> {
  const response =
    await api.patch<
      ApiResponse<TenantCard>
    >(
      `/cards/admin/${encodeURIComponent(
        cardId,
      )}/status`,
      {
        status,
        ...(reason?.trim()
          ? {
              reason:
                reason.trim(),
            }
          : {}),
      },
    );

  return response.data.data;
},

};
export type TenantCardListResponse = {
  cards: TenantCard[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};