const ACCESS_TOKEN_KEY =
  "zentrabank_platform_access_token";

const isBrowser = () =>
  typeof window !== "undefined";

export const authStorage = {
  getAccessToken(): string | null {
    if (!isBrowser()) {
      return null;
    }

    return window.sessionStorage.getItem(
      ACCESS_TOKEN_KEY
    );
  },

  setAccessToken(accessToken: string) {
    if (!isBrowser()) {
      return;
    }

    window.sessionStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken
    );
  },

  clear() {
    if (!isBrowser()) {
      return;
    }

    window.sessionStorage.removeItem(
      ACCESS_TOKEN_KEY
    );

    /*
     * Clean up tokens left behind by the
     * previous localStorage-based implementation.
     */
    window.localStorage.removeItem(
      "zentrabank_platform_access_token"
    );

    window.localStorage.removeItem(
      "zentrabank_platform_refresh_token"
    );
  },
};