export type ClientTransfer = {
  id: string;
  tenant_id: string;
  user_id: string;
  source_account_id: string;
  destination_account_id: string | null;
  destination_account_number: string;
  transfer_type?: "internal" | "external";
  destination_bank_name?: string | null;
  destination_bank_code?: string | null;
  settlement_mode?: "internal" | "simulation" | "provider";
  is_simulated?: boolean | number;
  amount: string | number;
  currency: string;
  description: string | null;
  status: string;
  reference: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  source_account_number?: string | null;
  source_account_name?: string | null;
  destination_account_number_resolved?: string | null;
  destination_account_name?: string | null;
};


export type CreateTransferInput = {
  sourceAccountId: string;

  destinationAccountNumber: string;

  amount: number;

  currency: string;

  transactionPin: string;

  transferType:
    | "internal"
    | "external";

  fxRateId?: string;
  fxRate?: number;

  destinationAccountName?: string;

  destinationBankName?: string;

  destinationBankCode?: string;

  description?: string;
};