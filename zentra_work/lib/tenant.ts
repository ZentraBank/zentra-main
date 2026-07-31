const configuredTenant = process.env.NEXT_PUBLIC_TENANT_SLUG
  ?? process.env.NEXT_PUBLIC_TENANT_CODE;

export function getTenantSlug(): string {
  if (configuredTenant?.trim()) return configuredTenant.trim();

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 2 && parts[0] !== "www") return parts[0];
  }

  return "zentrabank";
}
