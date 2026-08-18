import { api } from "@/lib/api";

export type TenantClient = {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string | null;

  avatar_url?: string | null;

  status: string;
  membership_status: string;
  role_code: "customer";

  created_at: string;
  email_verified_at?: string | null;

  account_count?: number;
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

  description?: string;
  gender?: string;
  nationality?: string;
  address?: string;

  kycType?: string;
  governmentId?: string;
  idNumber?: string;
  verificationStatus?: string;

  account?: {
    accountName?: string;

    accountType:
      | "wallet"
      | "savings"
      | "current"
      | "investment";

    currency: string;

    status?:
      | "active"
      | "dormant"
      | "suspended"
      | "closed";
  };
};

export type CreateClientResult = {
  client: TenantClient;

  account:
    | ClientAccount
    | null;

  temporaryPassword?: string;
};

export type UploadClientAvatarResult = {
  client: TenantClient;

  avatar: {
    url: string;
    fileId: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
  };
};

export async function resetClientPassword(
  clientId: string,
  password: string,
) {
  const response = await api.patch<{
    data: {
      clientId: string;
      email: string;
    };
  }>(
    `/clients/${clientId}/password`,
    {
      password,
    },
  );

  return response.data.data;
}
export async function createClient(
  input: CreateClientInput,
) {
  const response = await api.post<{
    data: CreateClientResult;
  }>("/clients", input);

  return response.data.data;
}

export async function listClients() {
  const response = await api.get<{
    data: TenantClient[];
  }>("/clients");

  return response.data.data;
}

export async function getClient(
  clientId: string,
) {
  const response = await api.get<{
    data: TenantClient & {
      accounts: ClientAccount[];
    };
  }>(`/clients/${clientId}`);

  return response.data.data;
}


export async function uploadClientAvatar(
  clientId: string,
  file: File,
) {
  const formData = new FormData();

  formData.append(
    "file",
    file,
    file.name,
  );

  const response = await api.patch<{
    data: UploadClientAvatarResult;
  }>(
    `/clients/${clientId}/avatar`,
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
      transformRequest: [
        (data) => data,
      ],
    },
  );



  return response.data.data;
}