const TENANT_STORAGE_KEY =
  "zentra_tenant_slug";

const ENV_TENANT_SLUG =
  process.env.NEXT_PUBLIC_TENANT_SLUG?.trim();

function normalizeTenantSlug(
  value: string | null | undefined,
): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getStoredTenantSlug():
  string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value =
      window.localStorage.getItem(
        TENANT_STORAGE_KEY,
      );

    const normalized =
      normalizeTenantSlug(value);

    return normalized || null;
  } catch {
    return null;
  }
}

function getHostnameTenantSlug():
  string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hostname =
    window.location.hostname
      .trim()
      .toLowerCase();

  /*
   * Local development does not provide
   * tenant information through hostname.
   */
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return null;
  }

  const parts =
    hostname.split(".");

  /*
   * Example:
   *
   * ugotenant3.zentrabank.com
   *      ↓
   * ugotenant3
   */
  if (parts.length >= 3) {
    const slug =
      normalizeTenantSlug(
        parts[0],
      );

    if (
      slug &&
      slug !== "www"
    ) {
      return slug;
    }
  }

  return null;
}

export function getTenantSlug():
  string {
  /*
   * 1. Explicit tenant selected/stored
   *    by invitation or onboarding.
   */
  const stored =
    getStoredTenantSlug();

  if (stored) {
    return stored;
  }

  /*
   * 2. Production tenant subdomain.
   */
  const hostname =
    getHostnameTenantSlug();

  if (hostname) {
    return hostname;
  }

  /*
   * 3. Environment fallback.
   *
   * Useful during local development
   * before an invitation establishes
   * the actual tenant.
   */
  const envSlug =
    normalizeTenantSlug(
      ENV_TENANT_SLUG,
    );

  if (envSlug) {
    return envSlug;
  }

  /*
   * Final development fallback.
   */
  return "zentra-bank";
}

export function setTenantSlug(
  tenantSlug: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalized =
    normalizeTenantSlug(
      tenantSlug,
    );

  if (!normalized) {
    return;
  }

  try {
    window.localStorage.setItem(
      TENANT_STORAGE_KEY,
      normalized,
    );
  } catch {
    // Ignore unavailable localStorage.
  }
}

export function clearTenantSlug():
  void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(
      TENANT_STORAGE_KEY,
    );
  } catch {
    // Ignore unavailable localStorage.
  }
}