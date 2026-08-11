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
  const setLoading = useTenantStore((state) => state.setLoading);
  const setError = useTenantStore((state) => state.setError);

  useEffect(() => {
    let active = true;

    async function loadTenant() {
      setLoading(true);
      setError(null);

      try {
        const tenant = await getCurrentTenant();
        if (!active) return;

        setTenant(tenant);

        document.documentElement.style.setProperty(
          "--tenant-primary",
          tenant.primary_color || "#2458E8",
        );
        document.documentElement.style.setProperty(
          "--tenant-secondary",
          tenant.secondary_color || tenant.primary_color || "#2458E8",
        );
        document.title = tenant.app_name || "ZentraBank";
      } catch (error) {
        if (!active) return;
        setError(
          error instanceof Error
            ? error.message
            : "Unable to resolve this banking tenant.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTenant();

    return () => {
      active = false;
    };
  }, [setError, setLoading, setTenant]);

  return children;
}
