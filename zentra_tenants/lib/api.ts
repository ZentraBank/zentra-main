import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import type {
  AuthSessionResponse,
} from "@/types/auth.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const TENANT_SLUG =
  process.env.NEXT_PUBLIC_TENANT_SLUG ||
  "zentra-bank";

let accessToken:
  | string
  | null = null;

let refreshPromise:
  | Promise<AuthSessionResponse>
  | null = null;

let sessionListener:
  | ((
      session:
        | AuthSessionResponse
        | null,
    ) => void)
  | null = null;

export const setAccessToken = (
  token: string | null,
) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const setSessionListener = (
  listener: (
    session:
      | AuthSessionResponse
      | null,
  ) => void,
) => {
  sessionListener =
    listener;

  return () => {
    if (
      sessionListener ===
      listener
    ) {
      sessionListener =
        null;
    }
  };
};

export const api =
  axios.create({
    baseURL:
      API_BASE_URL,

    withCredentials:
      true,

    headers: {
      "X-Zentra-App":
        "tenant",
    },
  });

/*
|--------------------------------------------------------------------------
| Request interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    config.headers.set(
      "X-Tenant-Slug",
      TENANT_SLUG,
    );

    if (accessToken) {
      config.headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }

    if (
      typeof FormData !==
        "undefined" &&
      config.data instanceof
        FormData
    ) {
      config.headers.delete(
        "Content-Type",
      );
    }

    return config;
  },
);

/*
|--------------------------------------------------------------------------
| Refresh session
|--------------------------------------------------------------------------
*/

const refreshSession =
  async (): Promise<AuthSessionResponse> => {
    if (!refreshPromise) {
      refreshPromise =
        axios
          .post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials:
                true,

              headers: {
                "X-Tenant-Slug":
                  TENANT_SLUG,

                "X-Zentra-App":
                  "tenant",
              },
            },
          )
          .then(
            (response) =>
              response.data
                .data as AuthSessionResponse,
          )
          .then(
            (session) => {
              setAccessToken(
                session.accessToken,
              );

              sessionListener?.(
                session,
              );

              return session;
            },
          )
          .finally(() => {
            refreshPromise =
              null;
          });
    }

    return refreshPromise;
  };

/*
|--------------------------------------------------------------------------
| Public endpoints
|--------------------------------------------------------------------------
|
| These endpoints must NEVER trigger automatic refresh.
|
| Tenant registration happens before the user has authenticated, therefore
| there is no refresh token yet. If one of these endpoints returns 401, the
| original error must be returned instead of calling /auth/refresh.
|
*/

const isPublicEndpoint = (
  url?: string,
) => {
  if (!url) {
    return false;
  }

const publicEndpoints = [
  "/auth/login",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",

  "/tenant-registration/request",
  "/tenant-registration/verify",
  "/tenant-registration/resend",
  "/tenant-registration/complete",
];

  return publicEndpoints.some(
    (endpoint) =>
      url.includes(
        endpoint,
      ),
  );
};

/*
|--------------------------------------------------------------------------
| Response interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) =>
    response,

  async (
    error: AxiosError,
  ) => {
    const original =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    /*
    |--------------------------------------------------------------------------
    | Return immediately when refresh should not happen
    |--------------------------------------------------------------------------
    */

    if (
      error.response
        ?.status !== 401 ||
      !original ||
      original._retry ||
      isPublicEndpoint(
        original.url,
      )
    ) {
      return Promise.reject(
        error,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Retry protected request once after refreshing session
    |--------------------------------------------------------------------------
    */

    original._retry =
      true;

    try {
      const session =
        await refreshSession();

      original.headers.set(
        "Authorization",
        `Bearer ${session.accessToken}`,
      );

      return api(
        original,
      );
    } catch (
      refreshError
    ) {
      /*
      |--------------------------------------------------------------------------
      | Session is no longer valid
      |--------------------------------------------------------------------------
      */

      setAccessToken(
        null,
      );

      sessionListener?.(
        null,
      );

      return Promise.reject(
        refreshError,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| API error helper
|--------------------------------------------------------------------------
*/

export const getApiErrorMessage = (
  error: unknown,
) => {
  if (
    axios.isAxiosError(
      error,
    )
  ) {
    const data =
      error.response
        ?.data as
        | {
            message?: string;
          }
        | undefined;

    return (
      data?.message ||
      error.message ||
      "Request failed"
    );
  }

  return error instanceof
    Error
    ? error.message
    : "Something went wrong";
};