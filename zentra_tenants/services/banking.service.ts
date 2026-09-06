import { api } from "@/lib/api";
import type {
  ApiEnvelope,
  BankAccount,
  Beneficiary,
  Transfer,
} from "@/types/banking.types";

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

export type TenantAccountActivity = {
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

  created_at: string;

  user_id?: string;

  account_number: string;
  account_name: string;
  account_type: string;
  currency: string;

  client_name?: string;
  client_email?: string;
};

type TenantActivityResponse = {
  activity:
    TenantAccountActivity[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export const getTenantAccountActivity =
  async ({
    page = 1,
    pageSize = 100,
  }: {
    page?: number;
    pageSize?: number;
  } = {}) => {
    const response =
      await api.get<{
        success: boolean;
        data: TenantActivityResponse;
      }>(
        "/accounts/tenant/activity",
        {
          params: {
            page,
            pageSize,
          },
        },
      );

    return (
      response.data.data
        .activity ?? []
    );
  };
  
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

export async function listBeneficiaries(): Promise<
  Beneficiary[]
> {
  const response =
    await api.get<
      ApiEnvelope<
        | Beneficiary[]
        | {
            beneficiaries: Beneficiary[];
          }
      >
    >("/beneficiaries");

  const data =
    response.data.data;

  if (Array.isArray(data)) {
    return data;
  }

  return data.beneficiaries ?? [];
}

export async function createInternalBeneficiary(
  input: {
    accountNumber: string;
    displayName?: string;
  },
): Promise<Beneficiary> {
  const response =
    await api.post<
      ApiEnvelope<Beneficiary>
    >(
      "/beneficiaries",
      {
        accountNumber:
          input.accountNumber,

        displayName:
          input.displayName?.trim() ||
          undefined,
      },
    );

  return response.data.data;
}

export async function deleteBeneficiary(
  beneficiaryId: string,
): Promise<void> {
  await api.delete(
    `/beneficiaries/${encodeURIComponent(
      beneficiaryId,
    )}`,
  );
}

export const bankingService = {
  getMyAccounts,
  getMyAccount,
  getMyTransfers,
  getMyTransfer,

  getTenantAccounts,
  getTenantAccount,
  getTenantTransfers,
  adjustTenantAccountBalance,

  listBeneficiaries,
  createInternalBeneficiary,
  deleteBeneficiary,
};