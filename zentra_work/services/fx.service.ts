import { apiRequest } from "@/lib/api-client";

export type ClientFxRate = {
  id: string;

  sourceCurrency: string;
  destinationCurrency: string;

  rate: number;

  inverse: boolean;

  effectiveAt: string;
};

export const fxService = {
  getRate({
    sourceCurrency,
    destinationCurrency,
  }: {
    sourceCurrency: string;
    destinationCurrency: string;
  }): Promise<ClientFxRate> {
    const params =
      new URLSearchParams({
        sourceCurrency,
        destinationCurrency,
      });

    return apiRequest<ClientFxRate>(
      `/fx/rate?${params.toString()}`,
    );
  },
};