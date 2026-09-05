const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

export function resolveTenantSlug():
  string | null {
  const configured =
    process.env
      .NEXT_PUBLIC_TENANT_SLUG
      ?.trim()
      .toLowerCase();

  if (configured) {
    return configured;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const hostname =
    window.location.hostname.toLowerCase();

  if (LOCAL_HOSTS.has(hostname)) {
    return null;
  }

  const parts = hostname
    .replace(/^www\./, "")
    .split(".");

  return parts.length > 2
    ? parts[0]
    : null;
}

export function getTenantSlug(): string {
  const slug =
    resolveTenantSlug();

  if (!slug) {
    throw new Error(
      "Unable to determine tenant. Configure NEXT_PUBLIC_TENANT_SLUG for local development.",
    );
  }

  return slug;
}