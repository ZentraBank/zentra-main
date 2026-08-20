import { apiRequest } from "@/lib/api-client";
import type { ClientAccount } from "@/types/account";

export type CreateAccountInput = {
  accountName: string;
  accountType:
    | "wallet"
    | "savings"
    | "current";
  currency: string;
};
export type CreateAccountPayload = {
  accountName: string;
  accountType: "wallet" | "savings" | "current";
  currency: string;
};

export const accountService = {
  listMine(): Promise<ClientAccount[]> {
    return apiRequest<ClientAccount[]>("/accounts/me");
  },

  getMine(accountId: string): Promise<ClientAccount> {
    return apiRequest<ClientAccount>(
      `/accounts/me/${encodeURIComponent(accountId)}`
    );
  },

  createMine(
    payload: CreateAccountPayload
  ): Promise<ClientAccount> {
    return apiRequest<ClientAccount>("/accounts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

