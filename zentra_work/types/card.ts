export type CardStatus = "pending" | "active" | "frozen" | "blocked" | "inactive" | "expired";

export type ClientCard = {
  id: string;
  user_id: string;
  account_id: string;

  card_type: string;
  card_brand: string;

  masked_pan: string;
  pan_last4: string;

  expiry_month: number;
  expiry_year: number;

  status:
    | "pending"
    | "active"
    | "frozen"
    | "blocked"
    | "inactive"
    | "expired";

  frozen_by_admin?: boolean;

  is_virtual: boolean;

  daily_spend_limit:
    | string
    | number;

  account_number: string;
  account_name: string;
  currency: string;

  created_at: string;
};
