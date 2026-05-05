"use client";

import { useEffect } from "react";
import { getCurrentTenant } from "@/services/tenant.service";
import { useTenantStore } from "@/store/tenant.store";

export default function TenantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setTenant = useTenantStore((state) => state.setTenant);
  const setTenantLoading = useTenantStore((state) => state.setTenantLoading);

  useEffect(() => {
    async function loadTenant() {
      try {
        setTenantLoading(true);

        const tenant = await getCurrentTenant();

        setTenant(tenant);

        document.documentElement.style.setProperty(
          "--tenant-primary",
          tenant.primary_color || "#DC2626"
        );

        document.title = tenant.app_name || "ZentraBank";
      } catch (error) {
        console.error("Failed to load tenant:", error);
      } finally {
        setTenantLoading(false);
      }
    }

    loadTenant();
  }, [setTenant, setTenantLoading]);

  return <>{children}</>;
}

//