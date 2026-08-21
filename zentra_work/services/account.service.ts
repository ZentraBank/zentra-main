import { apiRequest } from "@/lib/api-client";
import type { ClientAccount } from "@/types/account";

export type CreateAccountPayload = {
  accountName: string;
  accountType:
    | "wallet"
    | "savings"
    | "current";
  currency: string;
};

export type AccountActivity = {
  id: string;
  tenant_id: string;
  account_id: string;

  transfer_id?: string | null;

  entry_type:
    | "credit"
    | "debit";

  amount: string | number;

  balance_after:
    | string
    | number;

  description?:
    | string
    | null;

  account_number: string;
  account_name: string;
  account_type: string;
  currency: string;

  created_at: string;
};

export type AccountActivityResponse = {
  activity: AccountActivity[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type TransferDestination = {
  accountNumber: string;
  accountName: string;
  accountType: string;
  currency: string;

  bankName: string;
  bankCode: string;

  isOwnAccount: boolean;
};

export const accountService = {
  listMine(): Promise<ClientAccount[]> {
    return apiRequest<ClientAccount[]>(
      "/accounts/me",
    );
  },

    
  getMine(
    accountId: string,
  ): Promise<ClientAccount> {
    return apiRequest<ClientAccount>(
      `/accounts/me/${encodeURIComponent(
        accountId,
      )}`,
    );
  },

  createMine(
    payload: CreateAccountPayload,
  ): Promise<ClientAccount> {
    return apiRequest<ClientAccount>(
      "/accounts",
      {
        method: "POST",
        body: JSON.stringify(
          payload,
        ),
      },
    );
  },

  listMyActivity(
    page = 1,
    pageSize = 20,
  ): Promise<AccountActivityResponse> {
    const params =
      new URLSearchParams({
        page:
          String(page),

        pageSize:
          String(pageSize),
      });

    return apiRequest<AccountActivityResponse>(
      `/accounts/me/activity?${params.toString()}`,
    );
  },
  
  lookupTransferDestination(
  accountNumber: string,
): Promise<TransferDestination> {
  return apiRequest<TransferDestination>(
    `/accounts/transfer-destination/${encodeURIComponent(
      accountNumber,
    )}`,
  );
},
};