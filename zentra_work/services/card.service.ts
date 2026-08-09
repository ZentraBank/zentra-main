import { apiRequest } from "@/lib/api-client";
import type { ClientCard } from "@/types/card";

export type CardPurchaseRequest = {
  id: string;
  tenant_id: string;
  user_id: string;
  account_id: string;
  account_number?: string;
  account_name?: string;
  account_currency?: string;
  card_type: string;
  card_brand: string;
  price: string | number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  payment_proof_url: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  issued_card_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};
export const cardService = {
  listMine() {
    return apiRequest<ClientCard[]>("/cards/me");
  },
  getMine(cardId: string) {
    return apiRequest<ClientCard>(`/cards/me/${encodeURIComponent(cardId)}`);
  },
  create(input: { accountId: string; cardType: string; cardBrand?: string }) {
    return apiRequest<ClientCard>("/cards", { method: "POST", body: JSON.stringify(input) });
  },
  changeStatus(cardId: string, status: "active" | "frozen") {
  return apiRequest<ClientCard>(
    `/cards/me/${encodeURIComponent(cardId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
},

changeLimit(cardId: string, dailySpendLimit: number) {
  return apiRequest<ClientCard>(
    `/cards/me/${encodeURIComponent(cardId)}/limit`,
    {
      method: "PATCH",
      body: JSON.stringify({ dailySpendLimit }),
    },
  );
},
  submitPurchaseRequest(input: {
  accountId: string;
  cardType: string;
  cardBrand?: string;
  paymentMethod?: "cryptocurrency";
  paymentReference?: string;
  paymentProofUrl?: string;
}) {
  return apiRequest<CardPurchaseRequest>("/cards/purchase-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
},

listMyPurchaseRequests() {
  return apiRequest<CardPurchaseRequest[]>(
    "/cards/purchase-requests/me",
  );
},

getMyPurchaseRequest(requestId: string) {
  return apiRequest<CardPurchaseRequest>(
    `/cards/purchase-requests/me/${encodeURIComponent(requestId)}`,
  );
},

cancelPurchaseRequest(requestId: string) {
  return apiRequest<CardPurchaseRequest>(
    `/cards/purchase-requests/me/${encodeURIComponent(requestId)}/cancel`,
    {
      method: "PATCH",
    },
  );
},
};
