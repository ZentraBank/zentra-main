import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { AuthSessionResponse } from "@/types/auth.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const TENANT_SLUG =
  process.env.NEXT_PUBLIC_TENANT_SLUG || "zentra-bank";

let accessToken: string | null = null;
let refreshPromise: Promise<AuthSessionResponse> | null = null;
let sessionListener: ((session: AuthSessionResponse | null) => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setSessionListener = (
  listener: (session: AuthSessionResponse | null) => void
) => {
  sessionListener = listener;
  return () => {
    if (sessionListener === listener) sessionListener = null;
  };
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  config.headers.set("X-Tenant-Slug", TENANT_SLUG);
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

const refreshSession = async (): Promise<AuthSessionResponse> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { "X-Tenant-Slug": TENANT_SLUG },
        }
      )
      .then((response) => response.data.data as AuthSessionResponse)
      .then((session) => {
        setAccessToken(session.accessToken);
        sessionListener?.(session);
        return session;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

    const isAuthEndpoint = original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/refresh");

    if (error.response?.status !== 401 || !original || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const session = await refreshSession();
      original.headers.set("Authorization", `Bearer ${session.accessToken}`);
      return api(original);
    } catch (refreshError) {
      setAccessToken(null);
      sessionListener?.(null);
      return Promise.reject(refreshError);
    }
  }
);

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || "Request failed";
  }
  return error instanceof Error ? error.message : "Something went wrong";
};
