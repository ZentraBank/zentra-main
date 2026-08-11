export type UserRole = {
  id: number;
  name: string;
  code: string;
};

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  kyc_status?: string | null;
  membership: {
    id: number;
    status: string;
  };
  role: UserRole;
  permissions: string[];
  subscription: null | {
    id: number;
    status: string;
    starts_at?: string | null;
    expires_at?: string | null;
    plan: {
      id: number;
      name: string;
      code: string;
    };
    features: Record<string, { enabled: boolean; value?: unknown }>;
  };
};

export type AuthSessionResponse = {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresIn: number;
};
