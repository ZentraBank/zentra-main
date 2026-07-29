export type PlatformDashboard = {
  tenants: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
  };
  users: {
    total: number;
    tenantAdministrators: number;
    customers: number;
  };
  transactions: {
    total: number;
    volume: string;
  };
  subscriptions: {
    active: number;
    pastDue: number;
    cancelled: number;
  };
  resilience?: {
    openIncidents: number;
    criticalIncidents: number;
  };
};
