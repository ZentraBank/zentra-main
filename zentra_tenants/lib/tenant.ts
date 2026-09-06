const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

const TENANT_STORAGE_KEY =
  "zentra_tenant_slug";

/*
|--------------------------------------------------------------------------
| Store tenant
|--------------------------------------------------------------------------
*/

export function setTenantSlug(
  slug: string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const normalized =
    slug
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");

  window.localStorage.setItem(
    TENANT_STORAGE_KEY,
    normalized,
  );
}

/*
|--------------------------------------------------------------------------
| Clear tenant
|--------------------------------------------------------------------------
*/

export function clearTenantSlug() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    TENANT_STORAGE_KEY,
  );
}

/*
|--------------------------------------------------------------------------
| Resolve tenant
|--------------------------------------------------------------------------
*/

export function resolveTenantSlug():
  string | null {
  /*
  |--------------------------------------------------------------------------
  | Browser stored tenant
  |--------------------------------------------------------------------------
  */

  if (
    typeof window !==
    "undefined"
  ) {
    const stored =
      window.localStorage
        .getItem(
          TENANT_STORAGE_KEY,
        )
        ?.trim()
        .toLowerCase();

    if (stored) {
      return stored;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Domain/subdomain
  |--------------------------------------------------------------------------
  */

  if (
    typeof window !==
    "undefined"
  ) {
    const hostname =
      window.location.hostname
        .toLowerCase();

    if (
      !LOCAL_HOSTS.has(
        hostname,
      )
    ) {
      const parts =
        hostname
          .replace(
            /^www\./,
            "",
          )
          .split(".");

      if (
        parts.length > 2
      ) {
        return parts[0];
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Development fallback
  |--------------------------------------------------------------------------
  */

  const configured =
    process.env
      .NEXT_PUBLIC_TENANT_SLUG
      ?.trim()
      .toLowerCase();

  if (configured) {
    return configured;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Required tenant
|--------------------------------------------------------------------------
*/

export function getTenantSlug(): string {
  const slug =
    resolveTenantSlug();

  if (!slug) {
    throw new Error(
      "Unable to determine tenant.",
    );
  }

  return slug;
}