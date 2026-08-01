import { apiRequest } from "@/lib/api-client";
import type { MySubscription, SubscriptionPlan, SubscriptionRequest } from "@/types/subscription";

export const subscriptionService = {
  listPlans() {
    return apiRequest<SubscriptionPlan[]>("/subscriptions/plans", { skipAuth: true });
  },
  getMine() {
    return apiRequest<MySubscription>("/subscriptions/me");
  },
  startUpgrade(planCode: string) {
    return apiRequest<SubscriptionRequest>("/subscriptions/requests", {
      method: "POST",
      body: JSON.stringify({ planCode }),
    });
  },
  submitProof(requestId: string, input: { paymentReference: string; paymentProofUrl: string; paymentNote?: string }) {
    return apiRequest<SubscriptionRequest>(`/subscriptions/requests/${encodeURIComponent(requestId)}/payment-proof`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
