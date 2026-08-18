export type BankAccount = {
  id: string;
  user_id: string;
  tenant_id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  currency: string;
  balance: string | number;
  status: string;
  created_at: string;
  updated_at?: string;
  client_name?: string | null;
client_email?: string | null;
client_phone?: string | null;
client_avatar_url?: string | null;
};

export type Transfer = {
  id: string;
  tenant_id: string;
  user_id: string;

  source_account_id: string;

  source_account_number?: string | null;
  source_account_name?: string | null;
  source_account_currency?: string | null;
  source_account_status?: string | null;

  destination_account_id?: string | null;
  destination_account_number: string;

  destination_account_name?: string | null;
  destination_account_name_resolved?: string | null;

  destination_bank_name?: string | null;
  destination_bank_code?: string | null;

  client_id?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  client_avatar_url?: string | null;

  amount: string | number;
  currency: string;

  description?: string | null;

  status: string;
  reference: string;

  created_at: string;
  updated_at?: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};
