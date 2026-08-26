const TENANT_SLUG =
  process.env.NEXT_PUBLIC_TENANT_SLUG ??
  "zentra-bank";

export function getTenantSlug() {
  return TENANT_SLUG;
}