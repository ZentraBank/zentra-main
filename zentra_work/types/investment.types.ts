export type InvestmentProductStatus =
  | "active"
  | "inactive";

export type InvestmentRiskLevel =
  | "low"
  | "medium"
  | "high"
  | string;

export type InvestmentProduct = {
  id: string;
  tenant_id: string;

  name: string;
  description: string | null;

  currency: string;

  minimum_amount:
    | string
    | number;

  maximum_amount:
    | string
    | number
    | null;

  annual_rate:
    | string
    | number;

  duration_days: number;

  payout_type: string;
  risk_level:
    InvestmentRiskLevel;

  status:
    InvestmentProductStatus;

  created_by: string;

  created_at: string;
  updated_at?: string;
};

export type InvestmentStatus =
  | "active"
  | "matured"
  | "withdrawal_requested"
  | "completed";

export type Investment = {
  id: string;
  tenant_id: string;
  user_id: string;

  product_id: string;
  source_account_id: string;

  principal:
    | string
    | number;

  currency: string;

  annual_rate:
    | string
    | number;

  duration_days: number;

  expected_return:
    | string
    | number;

  maturity_amount:
    | string
    | number;

  status:
    InvestmentStatus;

  started_at: string;
  maturity_date: string;

  completed_at:
    | string
    | null;

  created_at: string;
  updated_at?: string;

  product_name?: string;
  risk_level?: string;
  payout_type?: string;
};

export type SubscribeInvestmentInput = {
  productId: string;
  sourceAccountId: string;
  amount: number;
};

export type InvestmentWithdrawal = {
  id: string;
  tenant_id: string;

  investment_id: string;
  user_id: string;

  destination_account_id: string;

  amount:
    | string
    | number;

  currency: string;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "completed";

  rejection_reason:
    | string
    | null;

  reviewed_at:
    | string
    | null;

  completed_at:
    | string
    | null;

  created_at: string;
  updated_at?: string;
};