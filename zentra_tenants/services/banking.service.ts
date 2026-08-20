import { api } from "@/lib/api";
import type { ApiEnvelope, BankAccount, Transfer } from "@/types/banking.types";

export async function getMyAccounts(): Promise<BankAccount[]> {
  const response = await api.get<ApiEnvelope<BankAccount[]>>("/accounts/me");
  return response.data.data;
}

export async function getMyAccount(accountId: string): Promise<BankAccount> {
  const response = await api.get<ApiEnvelope<BankAccount>>(`/accounts/me/${accountId}`);
  return response.data.data;
}

export async function getMyTransfers(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Transfer[]> {
  const response = await api.get<ApiEnvelope<Transfer[]>>("/transfers/me", {
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
    },
  });
  return response.data.data;
}

export async function getTenantAccounts() {
  const response = await api.get<{
    data: BankAccount[];
  }>("/accounts/tenant");

  return response.data.data;
}

export async function getTenantTransfers(
  params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  },
) {
  const response = await api.get<{
    data:
      | Transfer[]
      | {
          transfers: Transfer[];
          pagination?: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
          };
        };
  }>("/transfers/tenant", {
    params,
  });

  const data = response.data.data;

  if (Array.isArray(data)) {
    return data;
  }

  return data.transfers || [];
}

export async function getMyTransfer(transferId: string): Promise<Transfer> {
  const response = await api.get<ApiEnvelope<Transfer>>(`/transfers/me/${transferId}`);
  return response.data.data;
}

export type AccountBalanceAdjustmentInput = {
  type: "credit" | "debit";
  amount: number;
  description?: string;
};

export async function getTenantAccount(
  accountId: string,
): Promise<BankAccount> {
  const response =
    await api.get<
      ApiEnvelope<BankAccount>
    >(
      `/accounts/tenant/${encodeURIComponent(
        accountId,
      )}`,
    );

  return response.data.data;
}

export async function adjustTenantAccountBalance(
  accountId: string,
  input: AccountBalanceAdjustmentInput,
): Promise<BankAccount> {
  const response =
    await api.post<
      ApiEnvelope<BankAccount>
    >(
      `/accounts/tenant/${encodeURIComponent(
        accountId,
      )}/adjustment`,
      input,
    );

  return response.data.data;
}