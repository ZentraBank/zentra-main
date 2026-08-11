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
};

export type Transfer = {
  id: string;
  tenant_id: string;
  user_id: string;
  source_account_id: string;
  destination_account_id?: string | null;
  destination_account_number: string;
  destination_account_name?: string | null;
  source_account_number?: string | null;
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
