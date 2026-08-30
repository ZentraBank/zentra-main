import {
  apiBlobRequest,
  apiRequest,
} from "@/src/lib/api-client";

export type SubscriptionRequestStatus =
  | "pending_payment"
  | "payment_submitted"
  | "approved"
  | "rejected"
  | "cancelled";

export type SubscriptionRequest = {
  id: string;

  tenant_id: string;
  user_id: string;
  plan_id: string;

  status: SubscriptionRequestStatus;

  payment_reference: string | null;
  payment_proof_file_id: string | null;
  payment_note: string | null;

  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;

  created_at: string;
  updated_at: string;

  tenant_name: string;
  tenant_slug: string;
  tenant_domain: string | null;
  tenant_status: string;

  user_email: string;
  user_status: string;

  plan_code: string;
  plan_name: string;
  plan_price: number | string;
  plan_currency: string;
  plan_billing_interval: string;

  payment_proof_original_name:
    | string
    | null;

  payment_proof_mime_type:
    | string
    | null;

  payment_proof_size_bytes:
    | number
    | null;
};

export type SubscriptionRequestFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionRequestStatus | "";
};

export type ApprovalResponse = {
  requestId: string;
  subscriptionId: string;

  tenantId: string;
  userId: string;
  planId: string;

  status: "approved";
  subscriptionStatus: "active";
  tenantStatus: "active";

  startsAt: string;
  expiresAt: string;
};

export type RejectionResponse = {
  requestId: string;

  tenantId: string;
  userId: string;
  planId: string;

  status: "rejected";

  rejectionReason: string;

  tenantStatus: string;
};

const buildQuery = (
  filters: SubscriptionRequestFilters
) => {
  const query = new URLSearchParams();

  if (filters.page) {
    query.set(
      "page",
      String(filters.page)
    );
  }

  if (filters.limit) {
    query.set(
      "limit",
      String(filters.limit)
    );
  }

  if (filters.search) {
    query.set(
      "search",
      filters.search
    );
  }

  if (filters.status) {
    query.set(
      "status",
      filters.status
    );
  }

  const value = query.toString();

  return value
    ? `?${value}`
    : "";
};

export const platformSubscriptionsService = {
  listRequests(
    filters: SubscriptionRequestFilters = {}
  ) {
    return apiRequest<
      SubscriptionRequest[]
    >(
      `/superadmin/subscriptions/requests${buildQuery(
        filters
      )}`
    );
  },

  getRequest(
    requestId: string
  ) {
    return apiRequest<
      SubscriptionRequest
    >(
      `/superadmin/subscriptions/requests/${requestId}`
    );
  },

  getPaymentProof(
    requestId: string
  ) {
    return apiBlobRequest(
      `/superadmin/subscriptions/requests/${requestId}/payment-proof`
    );
  },

  approveRequest(
    requestId: string,
    durationDays = 30
  ) {
    return apiRequest<
      ApprovalResponse
    >(
      `/superadmin/subscriptions/requests/${requestId}/approve`,
      {
        method: "POST",

        body: JSON.stringify({
          durationDays,
        }),
      }
    );
  },

  rejectRequest(
    requestId: string,
    reason: string
  ) {
    return apiRequest<
      RejectionResponse
    >(
      `/superadmin/subscriptions/requests/${requestId}/reject`,
      {
        method: "POST",

        body: JSON.stringify({
          reason,
        }),
      }
    );
  },
};