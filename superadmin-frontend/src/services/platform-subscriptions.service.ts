import {
  apiBlobRequest,
  apiRequest,
} from "@/src/lib/api-client";

import type {
  SubscriptionPlan,
} from "@/src/types/subscription";

export type SubscriptionRequestStatus =
  | "pending_payment"
  | "payment_submitted"
  | "approved"
  | "rejected"
  | "cancelled";

export type SubscriptionPlanFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type PlanFeature = {
  id: string;
  plan_id: string;

  feature_key: string;
  is_enabled: boolean;

  feature_value:
    | string
    | number
    | boolean
    | null;
};

export type SubscriptionPlanDetails =
  Omit<
    SubscriptionPlan,
    "features"
  > & {
    features: PlanFeature[];
  };

export type UpdatePlanFeaturePayload = {
  featureKey: string;
  isEnabled: boolean;

  featureValue?:
    | string
    | number
    | boolean
    | null;
};

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
  status?:
    | SubscriptionRequestStatus
    | "";
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
  userStatus?: "active";

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

export type TenantPlanChangeAction =
  | "assigned"
  | "upgraded"
  | "downgraded";


export type ChangeTenantPlanPayload = {
  planId: string;
  action: TenantPlanChangeAction;
  reason?: string;
};

export type TenantSubscription = {
  id: string;

  tenant_id: string;
  user_id: string;
  plan_id: string;

  status: string;

  starts_at: string | null;
  expires_at: string | null;

  created_at?: string;
  updated_at?: string;

  plan_code?: string;
  plan_name?: string;

  plan_price?:
    | number
    | string;

  plan_currency?: string;

  plan_billing_interval?: string;

  user_email?: string;
};

export type TenantSubscriptionHistory = {
  id: string;

  tenant_id?: string;
  subscription_id?: string;

  previous_plan_id:
    | string
    | null;

  new_plan_id:
    | string
    | null;

  action?: string;

  previous_status?: string | null;
  new_status?: string | null;

  reason?: string | null;

  actor_user_id?: string | null;

  created_at?: string;
};

export type TenantSubscriptionOverride = {
  id?: string;

  tenant_id?: string;
  subscription_id?: string;

  custom_price?:
    | number
    | string
    | null;

  custom_currency?:
    | string
    | null;

  custom_billing_interval?:
    | string
    | null;

  contract_start_at?:
    | string
    | null;

  contract_end_at?:
    | string
    | null;

  notes?:
    | string
    | null;
};

export type TenantSubscriptionDetails = {
  subscription:
    | TenantSubscription
    | null;

  override:
    | TenantSubscriptionOverride
    | null;

  history:
    TenantSubscriptionHistory[];
};

const buildQuery = (
  filters:
    | SubscriptionRequestFilters
    | SubscriptionPlanFilters
) => {
  const query =
    new URLSearchParams();

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

  const value =
    query.toString();

  return value
    ? `?${value}`
    : "";
};

export const platformSubscriptionsService = {
  listPlans(
    filters: SubscriptionPlanFilters = {}
  ) {
    return apiRequest<
      SubscriptionPlan[]
    >(
      `/superadmin/subscriptions/plans${buildQuery(
        filters
      )}`
    );
  },

  getPlan(
    planId: string
  ) {
    return apiRequest<
      SubscriptionPlanDetails
    >(
      `/superadmin/subscriptions/plans/${planId}`
    );
  },

  updatePlanFeatures(
    planId: string,
    features: UpdatePlanFeaturePayload[]
  ) {
    return apiRequest<
      SubscriptionPlanDetails
    >(
      `/superadmin/subscriptions/plans/${planId}/features`,
      {
        method: "PUT",

        body: JSON.stringify({
          features,
        }),
      }
    );
  },

  getTenantSubscription(
    tenantId: string
  ) {
    return apiRequest<
      TenantSubscriptionDetails
    >(
      `/superadmin/subscriptions/tenants/${tenantId}`
    );
  },

  changeTenantPlan(
    tenantId: string,
    payload: ChangeTenantPlanPayload
  ) {
    return apiRequest<
      TenantSubscription
    >(
      `/superadmin/subscriptions/tenants/${tenantId}/plan`,
      {
        method: "PATCH",

        body: JSON.stringify({
          planId:
            payload.planId,

          action:
            payload.action,

          reason:
            payload.reason?.trim() ||
            undefined,
        }),
      }
    );
  },

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