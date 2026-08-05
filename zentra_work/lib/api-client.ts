import { authToken } from "@/lib/auth-token";
import { getTenantSlug } from "@/lib/tenant";
import type {
  ApiFailure,
  ApiSuccess,
} from "@/types/api";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function parseResponse<T>(
  response: Response,
): Promise<ApiSuccess<T>> {
  const body = (await response
    .json()
    .catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (
    !response.ok ||
    !body ||
    body.success === false
  ) {
    const failure =
      body as ApiFailure | null;

    throw new ApiError(
      failure?.message ??
        `Request failed with status ${response.status}`,
      response.status,
      failure?.errors,
    );
  }

  return body as ApiSuccess<T>;
}

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Tenant-Slug": getTenantSlug(),
        },
        body: JSON.stringify({}),
      },
    )
      .then((response) =>
        parseResponse<{
          accessToken: string;
        }>(response),
      )
      .then((result) => {
        authToken.set(
          result.data.accessToken,
        );

        return true;
      })
      .catch(() => {
        authToken.clear();
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    skipAuth = false,
    retryOnUnauthorized = true,
    headers,
    ...requestInit
  } = options;

  const token = authToken.get();
  const requestHeaders = new Headers(headers);

  requestHeaders.set(
    "X-Tenant-Slug",
    getTenantSlug(),
  );

  requestHeaders.set(
    "Accept",
    "application/json",
  );

  const hasBody =
    requestInit.body !== undefined &&
    requestInit.body !== null;

  const isFormData =
    typeof FormData !== "undefined" &&
    requestInit.body instanceof FormData;

  if (
    hasBody &&
    !isFormData &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json",
    );
  }

  if (!skipAuth && token) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const requestUrl =
    `${API_BASE_URL}${
      path.startsWith("/")
        ? path
        : `/${path}`
    }`;

  const response = await fetch(
    requestUrl,
    {
      ...requestInit,
      credentials: "include",
      headers: requestHeaders,
    },
  );

  if (
    response.status === 401 &&
    !skipAuth &&
    retryOnUnauthorized
  ) {
    const refreshed =
      await refreshSession();

    if (refreshed) {
      return apiRequest<T>(
        path,
        {
          ...options,
          retryOnUnauthorized:
            false,
        },
      );
    }
  }

  const result =
    await parseResponse<T>(response);

  return result.data;
}

export {
  API_BASE_URL,
  refreshSession,
};