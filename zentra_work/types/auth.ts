export type AuthRole = {
  id: string | number;
  name: string;
  code: string;
};

export type AuthUser = {
  id: string | number;
  full_name: string;
  email: string;
  phone: string | null;
  kyc_status: string;
  membership: {
    id: string | number;
    status: string;
  };
  role: AuthRole;
  permissions: string[];
  subscription: unknown | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresIn: number;
};
