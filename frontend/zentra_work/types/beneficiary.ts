export type BeneficiaryType = "internal" | "external";

export type Beneficiary = {
  id: string;
  tenant_id: string;
  user_id: string;
  beneficiary_type: BeneficiaryType;
  display_name: string;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  bank_code: string | null;
  currency: string;
  internal_account_id: string | null;
  is_favourite: boolean | number;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
};

export type CreateBeneficiaryInput = {
  beneficiaryType: BeneficiaryType;
  displayName?: string;
  accountName?: string;
  accountNumber: string;
  bankName?: string;
  bankCode?: string;
  currency?: string;
};
