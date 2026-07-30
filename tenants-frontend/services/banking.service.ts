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

export async function getMyTransfer(transferId: string): Promise<Transfer> {
  const response = await api.get<ApiEnvelope<Transfer>>(`/transfers/me/${transferId}`);
  return response.data.data;
}
