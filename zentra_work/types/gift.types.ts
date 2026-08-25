export type GiftStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "redemption_pending_review"
  | "redemption_rejected"
  | "processed"
  | "cancelled"
  | "expired";

export type Gift = {
  id: string;

  tenant_id: string;

  client_user_id: string;

  client_account_id: string;

  created_by_user_id: string;

  amount:
    | string
    | number;

  redemption_fee:
    | string
    | number;

  currency: string;

  sender_name: string;

  message:
    | string
    | null;

  expires_at:
    | string
    | null;

  status: GiftStatus;

  accepted_at:
    | string
    | null;

  declined_at:
    | string
    | null;

  processed_at:
    | string
    | null;

  cancelled_at:
    | string
    | null;

  expired_at:
    | string
    | null;

  transaction_id:
    | string
    | null;

  created_at: string;

  updated_at: string;

  account_number?:
    | string
    | null;

  account_name?:
    | string
    | null;
};

export type GiftListResponse = {
  gifts: Gift[];

  pagination: {
    page: number;

    pageSize: number;

    total: number;

    totalPages: number;
  };
};

export type GiftListParams = {
  page?: number;

  pageSize?: number;

  status?: GiftStatus;
};