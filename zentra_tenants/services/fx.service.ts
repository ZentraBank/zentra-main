import { api } from "@/lib/api";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type FxRateSource = {
  id: string;
  tenant_id: string | null;

  code: string;
  name: string;

  provider_type:
    | "manual"
    | "api"
    | "central_bank"
    | "market_data"
    | "internal";

  priority: number;

  status:
    | "active"
    | "inactive";

  metadata?: Record<string, unknown> | null;

  created_at?: string;
  updated_at?: string;
};

export type FxRate = {
  id: string;
  tenant_id: string | null;

  rate_source_id: string;

  base_currency: string;
  quote_currency: string;

  bid_rate: string | number;
  ask_rate: string | number;
  mid_rate: string | number;

  effective_at: string;
  expires_at?: string | null;

  external_reference?: string | null;

  status?: string;

  metadata?: Record<string, unknown> | null;

  created_at?: string;
  updated_at?: string;
};

export type FxSpreadRule = {
  id: string;
  tenant_id: string;

  code: string;
  name: string;

  base_currency?: string | null;
  quote_currency?: string | null;

  customer_segment?: string | null;
  transaction_type?: string | null;

  spread_type:
    | "basis_points"
    | "percentage"
    | "fixed";

  spread_value:
    | string
    | number;

  minimum_fee?:
    | string
    | number
    | null;

  maximum_fee?:
    | string
    | number
    | null;

  priority: number;

  status:
    | "active"
    | "inactive"
    | "draft";

  created_at?: string;
  updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Create payloads
|--------------------------------------------------------------------------
*/

export type CreateFxRateSourceInput = {
  code: string;
  name: string;

  providerType:
    | "manual"
    | "api"
    | "central_bank"
    | "market_data"
    | "internal";

  priority?: number;

  status?:
    | "active"
    | "inactive";

  global?: boolean;

  metadata?: Record<string, unknown>;
};

export type CreateFxRateInput = {
  rateSourceId: string;

  baseCurrency: string;
  quoteCurrency: string;

  bidRate: number;
  askRate: number;
  midRate: number;

  effectiveAt: string;

  expiresAt?: string;

  externalReference?: string;

  global?: boolean;

  metadata?: Record<string, unknown>;
};

export type CreateFxSpreadRuleInput = {
  code: string;
  name: string;

  baseCurrency?: string;
  quoteCurrency?: string;

  customerSegment?: string;

  transactionType?: string;

  spreadType:
    | "basis_points"
    | "percentage"
    | "fixed";

  spreadValue: number;

  minimumFee?: number;
  maximumFee?: number;

  priority?: number;

  status?:
    | "active"
    | "inactive"
    | "draft";
};

/*
|--------------------------------------------------------------------------
| Response helper
|--------------------------------------------------------------------------
|
| Your backend wraps responses as:
|
| {
|   success: true,
|   data: ...
| }
|
| Axios therefore gives us response.data.data.
|--------------------------------------------------------------------------
*/

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

/*
|--------------------------------------------------------------------------
| FX service
|--------------------------------------------------------------------------
*/

export const fxService = {
  /*
  |--------------------------------------------------------------------------
  | Create rate source
  |--------------------------------------------------------------------------
  */

  async createRateSource(
    payload: CreateFxRateSourceInput,
  ): Promise<FxRateSource> {
    const response =
      await api.post<
        ApiResponse<FxRateSource>
      >(
        "/fx/rate-sources",
        payload,
      );

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Publish rate
  |--------------------------------------------------------------------------
  */

  async createRate(
    payload: CreateFxRateInput,
  ): Promise<FxRate> {
    const response =
      await api.post<
        ApiResponse<FxRate>
      >(
        "/fx/rates",
        payload,
      );

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create spread rule
  |--------------------------------------------------------------------------
  */

  async createSpreadRule(
    payload: CreateFxSpreadRuleInput,
  ): Promise<FxSpreadRule> {
    const response =
      await api.post<
        ApiResponse<FxSpreadRule>
      >(
        "/fx/spread-rules",
        payload,
      );

    return response.data.data;
  },

  async listRateSources(): Promise<FxRateSource[]> {
  const response =
    await api.get<
      ApiResponse<FxRateSource[]>
    >(
      "/fx/rate-sources",
    );

  return response.data.data;
},

async listRates(): Promise<FxRate[]> {
  const response =
    await api.get<
      ApiResponse<FxRate[]>
    >(
      "/fx/rates",
    );

  return response.data.data;
},

async listSpreadRules(): Promise<FxSpreadRule[]> {
  const response =
    await api.get<
      ApiResponse<FxSpreadRule[]>
    >(
      "/fx/spread-rules",
    );

  return response.data.data;
},
};