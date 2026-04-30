"use client";

import { useTenantStore } from "@/store/tenant.store";

export function useTenantFeature(featureKey: string) {
  const tenant = useTenantStore((state) => state.tenant);

  if (!tenant?.tenant_features) return true;

  const feature = tenant.tenant_features.find(
    (item) => item.key === featureKey
  );

  return feature ? feature.enabled : true;
}