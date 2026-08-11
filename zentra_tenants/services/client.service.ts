import { api } from "@/lib/api";

export type TenantClient = {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string | null;
  status: string;
  membership_status: string;
  role_code: "customer";
  created_at: string;
};

export type ClientAccount = {
  id: string;
  user_id: string;
  tenant_id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  currency: string;
  balance: string | number;
  status: string;
};

export type CreateClientInput = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phone?: string | null;
  password?: string;
  account?: {
    accountName?: string;
    accountType: "wallet" | "savings" | "current" | "investment";
    currency: string;
  };
};

export type CreateClientResult = {
  client: TenantClient;
  account: ClientAccount | null;
  temporaryPassword?: string;
};

export async function createClient(input: CreateClientInput) {
  const response = await api.post<{ data: CreateClientResult }>("/clients", input);
  return response.data.data;
}

export async function listClients() {
  const response = await api.get<{ data: TenantClient[] }>("/clients");
  return response.data.data;
}

export async function getClient(clientId: string) {
  const response = await api.get<{ data: TenantClient & { accounts: ClientAccount[] } }>(
    `/clients/${clientId}`,
  );
  return response.data.data;
}
