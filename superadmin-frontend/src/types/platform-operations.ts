export type CrossTenantUser = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  status: string;
  created_at: string;
};

export type CrossTenantAccount = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_number: string;
  account_type: string;
  currency: string;
  balance: string | number;
  status: string;
  created_at: string;
};

export type CrossTenantTransaction = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
  account_id: string;
  reference: string;
  transaction_type: string;
  amount: string | number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
};

export type PlatformNotification = {
  id: string;
  notification_type: string;
  severity:
    | "info"
    | "low"
    | "medium"
    | "high"
    | "critical";
  title: string;
  message: string;
  tenant_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
};

export type PlatformSetting = {
  id: string;
  setting_key: string;
  setting_value: unknown;
  is_secret: boolean;
  description: string | null;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type PlatformAuditLog = {
  id: string;
  actor_platform_user_id: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  tenant_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};
