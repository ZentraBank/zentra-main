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
  created_at: string;
  updated_at: string;
};
