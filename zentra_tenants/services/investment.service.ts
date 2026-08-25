import {
  api,
  getApiErrorMessage,
} from "@/lib/api";

/*
|--------------------------------------------------------------------------
| Investment Product Types
|--------------------------------------------------------------------------
*/

export type TenantInvestmentProduct = {
  id: string;
  tenant_id: string;

  name: string;
  description: string | null;

  currency: string;

  minimum_amount:
    | string
    | number;

  maximum_amount:
    | string
    | number
    | null;

  annual_rate:
    | string
    | number;

  duration_days: number;

  payout_type: string;
  risk_level: string;

  status: string;

  created_by: string;

  created_at: string;
  updated_at?: string;
};

export type CreateInvestmentProductInput = {
  name: string;

  description?: string;

  currency: string;

  minimumAmount: number;

  maximumAmount?:
    | number
    | null;

  annualRate: number;

  durationDays: number;

  payoutType: string;

  riskLevel: string;

  status:
    | "active"
    | "inactive";
};

export type UpdateInvestmentProductInput =
  Partial<CreateInvestmentProductInput>;

/*
|--------------------------------------------------------------------------
| Investment Types
|--------------------------------------------------------------------------
*/

export type InvestmentGrowth = {
  startedAt: string;

  maturityDate: string;

  calculationType:
    | "simple_interest"
    | string;
};

export type TenantInvestment = {
  id: string;

  tenant_id: string;
  user_id: string;

  product_id: string;

  source_account_id: string;

  principal:
    | string
    | number;

  currency: string;

  annual_rate:
    | string
    | number;

  duration_days: number;

  expected_return:
    | string
    | number;

  maturity_amount:
    | string
    | number;

  accrued_return?:
    | string
    | number;

  current_value?:
    | string
    | number;

  growth_progress?: number;

  days_remaining?: number;

  growth?: InvestmentGrowth;

  status: string;

  started_at: string;

  maturity_date: string;

  completed_at?:
    | string
    | null;

  created_at?: string;

  /*
   * Product information returned
   * by the repository JOIN.
   */
  product_name?: string;

  payout_type?: string;

  risk_level?: string;

  /*
   * Client information returned
   * by tenant/admin investment
   * listings.
   */
  client_first_name?:
    | string
    | null;

  client_middle_name?:
    | string
    | null;

  client_last_name?:
    | string
    | null;

  client_email?:
    | string
    | null;
};

/*
|--------------------------------------------------------------------------
| Create Client Investment
|--------------------------------------------------------------------------
*/

export type CreateClientInvestmentInput = {
  clientUserId: string;

  productId: string;

  sourceAccountId: string;

  amount: number;
};

/*
|--------------------------------------------------------------------------
| Withdrawal Types
|--------------------------------------------------------------------------
*/

export type InvestmentWithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export type InvestmentWithdrawal = {
  id: string;

  tenant_id: string;

  investment_id: string;

  user_id: string;

  destination_account_id: string;

  amount:
    | string
    | number;

  currency: string;

  status:
    InvestmentWithdrawalStatus;

  reviewed_by?:
    | string
    | null;

  reviewed_at?:
    | string
    | null;

  rejection_reason?:
    | string
    | null;

  completed_at?:
    | string
    | null;

  created_at: string;

  product_id?: string;
};

/*
|--------------------------------------------------------------------------
| Common Types
|--------------------------------------------------------------------------
*/

type ApiEnvelope<T> = {
  success: boolean;

  message: string;

  data: T;
};

export type InvestmentListParams = {
  page?: number;

  pageSize?: number;

  status?: string;
};

/*
|--------------------------------------------------------------------------
| Investment Service
|--------------------------------------------------------------------------
*/

export const investmentService = {
  /*
  |--------------------------------------------------------------------------
  | Products
  |--------------------------------------------------------------------------
  */

  async listProducts(
    params: InvestmentListParams = {},
  ): Promise<
    TenantInvestmentProduct[]
  > {
    try {
      const response =
        await api.get<
          ApiEnvelope<
            TenantInvestmentProduct[]
          >
        >(
          "/investments/products",
          {
            params: {
              page:
                params.page ??
                1,

              pageSize:
                params.pageSize ??
                100,

              status:
                params.status,
            },
          },
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async createProduct(
    input:
      CreateInvestmentProductInput,
  ): Promise<TenantInvestmentProduct> {
    try {
      const response =
        await api.post<
          ApiEnvelope<
            TenantInvestmentProduct
          >
        >(
          "/investments/admin/products",
          input,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async updateProduct(
    productId: string,

    input:
      UpdateInvestmentProductInput,
  ): Promise<TenantInvestmentProduct> {
    try {
      const response =
        await api.patch<
          ApiEnvelope<
            TenantInvestmentProduct
          >
        >(
          `/investments/admin/products/${encodeURIComponent(
            productId,
          )}`,
          input,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Tenant Creates Investment For Client
  |--------------------------------------------------------------------------
  */

  async createClientInvestment(
    input:
      CreateClientInvestmentInput,
  ): Promise<TenantInvestment> {
    try {
      const response =
        await api.post<
          ApiEnvelope<
            TenantInvestment
          >
        >(
          "/investments/admin/client-investments",
          input,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Tenant Investment Portfolio
  |--------------------------------------------------------------------------
  */

  async listAll(
    params: InvestmentListParams = {},
  ): Promise<TenantInvestment[]> {
    try {
      const response =
        await api.get<
          ApiEnvelope<
            TenantInvestment[]
          >
        >(
          "/investments/admin/investments",
          {
            params: {
              page:
                params.page ??
                1,

              pageSize:
                params.pageSize ??
                100,

              status:
                params.status,
            },
          },
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Withdrawals
  |--------------------------------------------------------------------------
  */

  async listWithdrawals(
    params: InvestmentListParams = {},
  ): Promise<
    InvestmentWithdrawal[]
  > {
    try {
      const response =
        await api.get<
          ApiEnvelope<
            InvestmentWithdrawal[]
          >
        >(
          "/investments/admin/withdrawals",
          {
            params: {
              page:
                params.page ??
                1,

              pageSize:
                params.pageSize ??
                100,

              status:
                params.status ??
                "pending",
            },
          },
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async reviewWithdrawal(
    withdrawalId: string,

    input: {
      status:
        | "approved"
        | "rejected";

      rejectionReason?: string;
    },
  ): Promise<InvestmentWithdrawal> {
    try {
      const response =
        await api.patch<
          ApiEnvelope<
            InvestmentWithdrawal
          >
        >(
          `/investments/admin/withdrawals/${encodeURIComponent(
            withdrawalId,
          )}/review`,
          input,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async completeWithdrawal(
    withdrawalId: string,
  ): Promise<{
    withdrawalId: string;

    investmentId: string;

    amount:
      | string
      | number;

    currency: string;

    destinationAccountId: string;

    status: "completed";
  }> {
    try {
      const response =
        await api.post<
          ApiEnvelope<{
            withdrawalId: string;

            investmentId: string;

            amount:
              | string
              | number;

            currency: string;

            destinationAccountId: string;

            status:
              "completed";
          }>
        >(
          `/investments/admin/withdrawals/${encodeURIComponent(
            withdrawalId,
          )}/complete`,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Maturity
  |--------------------------------------------------------------------------
  */

  async markMatured(): Promise<{
    updatedCount: number;
  }> {
    try {
      const response =
        await api.post<
          ApiEnvelope<{
            updatedCount: number;
          }>
        >(
          "/investments/admin/mark-matured",
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },
};