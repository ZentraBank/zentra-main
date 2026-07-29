export type SubscriptionPlanStatus =
  | "draft"
  | "active"
  | "inactive"
  | "retired";

export type BillingInterval =
  | "monthly"
  | "quarterly"
  | "annually"
  | "custom";

export type SubscriptionPlanFeature = {
  id?: string;
  plan_id?: string;
  feature_code?: string;
  featureCode?: string;
  is_enabled?: boolean;
  isEnabled?: boolean;
  usage_limit?: number | null;
  usageLimit?: number | null;
  metadata?: Record<string, unknown> | null;
};

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  billing_interval: BillingInterval;
  price: string | number;
  currency: string;
  status: SubscriptionPlanStatus;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  features?: SubscriptionPlanFeature[];
};

export type TenantSubscriptionRecord = {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  started_at?: string | null;
  renewed_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  plan_code: string;
  plan_name: string;
  plan_price: string | number;
  plan_currency: string;
  plan_billing_interval: BillingInterval;
};

export type TenantSubscriptionDetails = {
  subscription: TenantSubscriptionRecord;
  override: Record<string, unknown> | null;
  history: Array<Record<string, unknown>>;
};
