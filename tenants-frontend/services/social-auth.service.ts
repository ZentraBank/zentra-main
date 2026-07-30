import { api } from "@/lib/api";

export type SocialProvider = "google" | "facebook";
export type SocialProviderAvailability = Record<SocialProvider, boolean>;

export async function getSocialProviders() {
  const response = await api.get<{ data: SocialProviderAvailability }>(
    "/auth/social/providers"
  );
  return response.data.data;
}

export function getSocialLoginUrl(provider: SocialProvider, next = "/dashboard") {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
  const tenant = process.env.NEXT_PUBLIC_TENANT_SLUG || "zentra-bank";
  const params = new URLSearchParams({ tenant, next });
  return `${apiBase}/auth/social/${provider}/start?${params.toString()}`;
}
