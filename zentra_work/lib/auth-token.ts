const TOKEN_KEY = "zentrabank_access_token";

const readStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(TOKEN_KEY);
};

let accessToken: string | null = null;

export const authToken = {
  get(): string | null {
    if (accessToken) {
      return accessToken;
    }

    accessToken = readStoredToken();
    return accessToken;
  },

  set(token: string | null): void {
  console.log("AUTH TOKEN SET:", token);

  accessToken = token;

  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.sessionStorage.setItem(
      TOKEN_KEY,
      token,
    );
  } else {
    window.sessionStorage.removeItem(
      TOKEN_KEY,
    );
  }
},

  clear(): void {
    accessToken = null;

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  },
};