const ACCESS_TOKEN_KEY = "zentrabank_platform_access_token";
const REFRESH_TOKEN_KEY = "zentrabank_platform_refresh_token";

const isBrowser = () => typeof window !== "undefined";

export const authStorage = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string) {
    if (!isBrowser()) return;

    window.localStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken
    );

    window.localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );
  },

  clear() {
    if (!isBrowser()) return;

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
