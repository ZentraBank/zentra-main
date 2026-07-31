import { apiRequest } from "@/lib/api-client";
import type { ClientAccount } from "@/types/account";

export const accountService = {
  listMine(): Promise<ClientAccount[]> {
    return apiRequest<ClientAccount[]>("/accounts/me");
  },

  getMine(accountId: string): Promise<ClientAccount> {
    return apiRequest<ClientAccount>(`/accounts/me/${encodeURIComponent(accountId)}`);
  },
};
