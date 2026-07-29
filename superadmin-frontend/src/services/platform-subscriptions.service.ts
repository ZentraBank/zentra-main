import { apiRequest } from "@/src/lib/api-client";
import type {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionPlanFeature,
  SubscriptionPlanStatus,
  TenantSubscriptionDetails,
} from "@/src/types/subscription";

type PlanFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionPlanStatus | "";
};

const toQuery = (filters: PlanFilters) => {
  const query = new URLSearchParams();

  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));
  if (filters.search) query.set("search", filters.search);
  if (filters.status) query.set("status", filters.status);

  const value = query.toString();
  return value ? `?${value}` : "";
};

export const platformSubscriptionsService = {
  listPlans(filters: PlanFilters = {}) {
    return apiRequest<SubscriptionPlan[]>(
      `/superadmin/subscriptions/plans${toQuery(filters)}`
    );
  },

  getPlan(planId: string) {
    return apiRequest<SubscriptionPlan>(
      `/superadmin/subscriptions/plans/${planId}`
    );
  },

  createPlan(payload: {
    code: string;
    name: string;
    description?: string;
    billingInterval: BillingInterval;
    price: number;
    currency: string;
    status: SubscriptionPlanStatus;
    isPublic: boolean;
    features: Array<{
      featureCode: string;
      isEnabled: boolean;
      usageLimit?: number | null;
      metadata?: Record<string, unknown> | null;
    }>;
  }) {
    return apiRequest<SubscriptionPlan>(
      "/superadmin/subscriptions/plans",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  updatePlan(
    planId: string,
    payload: Partial<{
      name: string;
      description: string;
      billingInterval: BillingInterval;
      price: number;
      currency: string;
      status: SubscriptionPlanStatus;
      isPublic: boolean;
    }>
  ) {
    return apiRequest<SubscriptionPlan>(
      `/superadmin/subscriptions/plans/${planId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  updateFeatures(
    planId: string,
    features: SubscriptionPlanFeature[]
  ) {
    return apiRequest<SubscriptionPlan>(
      `/superadmin/subscriptions/plans/${planId}/features`,
      {
        method: "PUT",
        body: JSON.stringify({
          features: features.map((feature) => ({
            featureCode:
              feature.featureCode ??
              feature.feature_code ??
              "",
            isEnabled:
              feature.isEnabled ??
              feature.is_enabled ??
              false,
            usageLimit:
              feature.usageLimit ??
              feature.usage_limit ??
              null,
            metadata: feature.metadata ?? null,
          })),
        }),
      }
    );
  },

  getTenantSubscription(tenantId: string) {
    return apiRequest<TenantSubscriptionDetails>(
      `/superadmin/subscriptions/tenants/${tenantId}`
    );
  },

  changeTenantPlan(
    tenantId: string,
    payload: {
      planId: string;
      action: "upgraded" | "downgraded";
      reason?: string;
    }
  ) {
    return apiRequest(
      `/superadmin/subscriptions/tenants/${tenantId}/plan`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  changeTenantStatus(
    tenantId: string,
    payload: {
      status:
        | "active"
        | "suspended"
        | "cancelled"
        | "expired";
      action:
        | "cancelled"
        | "reactivated"
        | "suspended"
        | "expired";
      reason?: string;
    }
  ) {
    return apiRequest(
      `/superadmin/subscriptions/tenants/${tenantId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  renewTenantSubscription(
    tenantId: string,
    payload: {
      expiresAt: string;
      reason?: string;
    }
  ) {
    return apiRequest(
      `/superadmin/subscriptions/tenants/${tenantId}/renew`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
