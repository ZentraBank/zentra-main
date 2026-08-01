const configuredTenant =
  process.env.NEXT_PUBLIC_TENANT_SLUG ??
  process.env.NEXT_PUBLIC_TENANT_CODE;

function isIpAddress(hostname: string): boolean {
  const ipv4Pattern =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

  return ipv4Pattern.test(hostname);
}

export function getTenantSlug(): string {
  if (configuredTenant?.trim()) {
    return configuredTenant.trim();
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();

    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1";

    if (!isLocalHost && !isIpAddress(host)) {
      const parts = host.split(".");

      // Example:
      // bank-a.zentrabank.com -> bank-a
      if (parts.length > 2 && parts[0] !== "www") {
        return parts[0];
      }
    }
  }

  return "zentrabank";
}