export type SubscriptionPlan = {
  id: string;
  name: string;
  code: string;
  price: string | number;
  currency: string;
  billing_interval: string;
};

export type UserSubscription = {
  id: string;
  plan_id: string;
  plan_name: string;
  plan_code: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
};

export type SubscriptionRequest = {
  id: string;
  plan_id: string;
  plan_name?: string;
  plan_code?: string;
  plan_price?: string | number;
  plan_currency?: string;
  status: "pending_payment" | "payment_submitted" | "approved" | "rejected";
  payment_reference?: string | null;
  payment_proof_url?: string | null;
  payment_note?: string | null;
  created_at: string;
};

export type MySubscription = {
  subscription: UserSubscription | null;
  openRequest: SubscriptionRequest | null;
};
