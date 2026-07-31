import { apiRequest } from "@/lib/api-client";
import type { ClientCard } from "@/types/card";

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
    return apiRequest<ClientCard>(`/cards/me/${encodeURIComponent(cardId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
