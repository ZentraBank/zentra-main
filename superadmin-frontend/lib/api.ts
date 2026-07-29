const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured."
  );
}

const ACCESS_TOKEN_KEY =
  "platform_access_token";

const REFRESH_TOKEN_KEY =
  "platform_refresh_token";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
};

const getRefreshToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
};

const saveTokens = (
  accessToken: string,
  refreshToken?: string
) => {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  if (refreshToken) {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );
  }
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

let refreshPromise:
  | Promise<string>
  | null = null;

const refreshAccessToken =
  async (): Promise<string> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        "Refresh token is unavailable."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      clearTokens();

      throw new Error(
        data?.message ||
          "Your session has expired."
      );
    }

    const newAccessToken =
      data?.data?.accessToken ??
      data?.accessToken;

    const newRefreshToken =
      data?.data?.refreshToken ??
      data?.refreshToken;

    if (!newAccessToken) {
      clearTokens();

      throw new Error(
        "The refresh response did not contain an access token."
      );
    }

    saveTokens(
      newAccessToken,
      newRefreshToken
    );

    return newAccessToken;
  };

const getFreshAccessToken =
  async (): Promise<string> => {
    if (!refreshPromise) {
      refreshPromise =
        refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  };

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> => {
  const accessToken = getAccessToken();

  const headers = new Headers(
    options.headers
  );

  if (!headers.has("Content-Type")) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401 && retry) {
    try {
      const newAccessToken =
        await getFreshAccessToken();

      const retryHeaders = new Headers(
        options.headers
      );

      retryHeaders.set(
        "Content-Type",
        "application/json"
      );

      retryHeaders.set(
        "Authorization",
        `Bearer ${newAccessToken}`
      );

      const retryResponse = await fetch(
        `${API_BASE_URL}${path}`,
        {
          ...options,
          headers: retryHeaders,
        }
      );

      const retryData =
        await retryResponse.json();

      if (!retryResponse.ok) {
        throw new Error(
          retryData?.message ||
            "The request failed."
        );
      }

      return retryData as T;
    } catch (error) {
      clearTokens();

      if (
        typeof window !== "undefined"
      ) {
        window.location.href = "/login";
      }

      throw error;
    }
  }

  const data =
    (await response.json()) as
      | T
      | ApiErrorBody;

  if (!response.ok) {
    throw new Error(
      (data as ApiErrorBody)?.message ||
        (data as ApiErrorBody)?.error ||
        "The request failed."
    );
  }

  return data as T;
};