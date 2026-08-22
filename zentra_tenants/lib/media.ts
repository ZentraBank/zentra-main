const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const API_ORIGIN =
  API_BASE_URL.replace(
    /\/api\/v1\/?$/,
    "",
  );

export function resolveMediaUrl(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${API_ORIGIN}${value}`;
  }

  return value;
}