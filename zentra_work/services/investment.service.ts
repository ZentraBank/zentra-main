import {
  apiRequest,
  getApiErrorMessage,
} from "@/lib/api-client";

import type {
  Investment,
  InvestmentProduct,
  InvestmentWithdrawal,
  SubscribeInvestmentInput,
} from "@/types/investment.types";

export const investmentService = {
  async listProducts(
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<
    InvestmentProduct[]
  > {
    try {
      const searchParams =
        new URLSearchParams();

      searchParams.set(
        "page",
        String(
          params?.page ?? 1,
        ),
      );

      searchParams.set(
        "pageSize",
        String(
          params?.pageSize ??
            100,
        ),
      );

      return await apiRequest<
        InvestmentProduct[]
      >(
        `/investments/products?${searchParams.toString()}`,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to load investment products.",
        ),
      );
    }
  },

  async subscribe(
    input:
      SubscribeInvestmentInput,
  ): Promise<Investment> {
    try {
      return await apiRequest<
        Investment
      >(
        "/investments",
        {
          method: "POST",

          body:
            JSON.stringify(
              input,
            ),
        },
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to start investment.",
        ),
      );
    }
  },

  async listMine(
    params?: {
      page?: number;
      pageSize?: number;
      status?: string;
    },
  ): Promise<
    Investment[]
  > {
    try {
      const searchParams =
        new URLSearchParams();

      searchParams.set(
        "page",
        String(
          params?.page ?? 1,
        ),
      );

      searchParams.set(
        "pageSize",
        String(
          params?.pageSize ??
            100,
        ),
      );

      if (
        params?.status
      ) {
        searchParams.set(
          "status",
          params.status,
        );
      }

      return await apiRequest<
        Investment[]
      >(
        `/investments/me?${searchParams.toString()}`,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to load your investments.",
        ),
      );
    }
  },

  async requestWithdrawal(
    investmentId: string,
    destinationAccountId: string,
  ): Promise<
    InvestmentWithdrawal
  > {
    try {
      return await apiRequest<
        InvestmentWithdrawal
      >(
        `/investments/${encodeURIComponent(
          investmentId,
        )}/withdrawals`,
        {
          method: "POST",

          body:
            JSON.stringify({
              destinationAccountId,
            }),
        },
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to request investment withdrawal.",
        ),
      );
    }
  },
};