import { authStorage } from "@/src/lib/auth-storage";
import { ApiError } from "@/src/lib/api-error";

import type {
  ApiErrorPayload,
  ApiResponse,
} from "@/src/types/api";

import type {
  PlatformAuthResponse,
} from "@/src/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured."
  );
}

let refreshPromise:
  | Promise<PlatformAuthResponse>
  | null = null;

let redirectingToLogin = false;

type RequestOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

const buildHeaders = (
  headers?: HeadersInit
): Headers => {
  const output = new Headers(headers);

  if (!output.has("Content-Type")) {
    output.set(
      "Content-Type",
      "application/json"
    );
  }

  return output;
};

const parseResponse = async <T>(
  response: Response
): Promise<ApiResponse<T> & ApiErrorPayload> => {
  const text = await response.text();

  if (!text) {
    return {
      success: response.ok,
      message: response.ok
        ? "Request completed successfully."
        : "The request failed.",
      data: null as T,
    };
  }

  try {
    return JSON.parse(text) as ApiResponse<T> &
      ApiErrorPayload;
  } catch {
    return {
      success: response.ok,
      message: text,
      data: null as T,
    };
  }
};

const sendToLogin = () => {
  authStorage.clear();

  if (
    typeof window === "undefined" ||
    redirectingToLogin
  ) {
    return;
  }

  const pathname =
    window.location.pathname;

  /*
   * Never redirect the login page
   * back to itself.
   */
  if (pathname === "/login") {
    return;
  }

  redirectingToLogin = true;

  const returnUrl =
    pathname + window.location.search;

  window.location.replace(
    `/login?returnUrl=${encodeURIComponent(
      returnUrl
    )}`
  );
};

const refreshSession =
  async (): Promise<PlatformAuthResponse> => {
    let response: Response;

    try {
      response = await fetch(
        `${API_BASE_URL}/superadmin/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceName:
              typeof navigator !== "undefined"
                ? navigator.userAgent
                : undefined,
          }),
        }
      );
    } catch {
      throw new ApiError(
        "Unable to connect to the server.",
        0
      );
    }

    const payload =
      await parseResponse<PlatformAuthResponse>(
        response
      );

    if (
      !response.ok ||
      !payload.data?.accessToken
    ) {
      authStorage.clear();

      throw new ApiError(
        payload.message ||
          "Your session has expired.",
        response.status || 401,
        payload
      );
    }

    authStorage.setAccessToken(
      payload.data.accessToken
    );

    return payload.data;
  };

const getRefreshedSession = () => {
  if (!refreshPromise) {
    refreshPromise =
      refreshSession().finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    auth = true,
    retryOnUnauthorized = true,
    ...requestOptions
  } = options;

  const headers = buildHeaders(
    requestOptions.headers
  );

  if (auth) {
    const accessToken =
      authStorage.getAccessToken();

    if (accessToken) {
      headers.set(
        "Authorization",
        `Bearer ${accessToken}`
      );
    }
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...requestOptions,
        credentials: "include",
        headers,
      }
    );
  } catch {
    throw new ApiError(
      "Unable to connect to the server.",
      0
    );
  }

  /*
   * Access token expired or missing.
   * Try the HttpOnly refresh cookie once.
   */
  if (
    response.status === 401 &&
    auth &&
    retryOnUnauthorized
  ) {
    try {
      await getRefreshedSession();

      return apiRequest<T>(path, {
        ...options,
        retryOnUnauthorized: false,
      });
    } catch (error) {
      /*
       * Do not create a redirect loop
       * when the current page is /login.
       */
      sendToLogin();

      throw error;
    }
  }

  const payload =
    await parseResponse<T>(response);

  if (!response.ok) {
    if (
      response.status === 401 &&
      auth
    ) {
      sendToLogin();
    }

    throw new ApiError(
      payload.message ||
        "The request could not be completed.",
      response.status,
      payload
    );
  }

  return payload;
}