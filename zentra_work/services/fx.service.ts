import { apiRequest } from "@/lib/api-client";

export type FxQuote = {
  id: string;
  tenant_id: string;
  user_id: string;

  quote_reference: string;

  source_currency: string;
  destination_currency: string;

  source_amount: string | number;
  destination_amount: string | number;

  market_rate: string | number;
  customer_rate: string | number;

  spread_amount: string | number;
  fee_amount: string | number;

  status: string;
  expires_at: string;

  created_at?: string;
  accepted_at?: string | null;
};

export type CreateFxQuotePayload = {
  sourceCurrency: string;
  destinationCurrency: string;
  sourceAmount: number;

  /**
   * Used by the backend to prevent duplicate
   * quotes from the same client action.
   */
  idempotencyKey: string;

  /**
   * Keep this short-lived for transfer preview.
   */
  validForSeconds?: number;

  /**
   * For now we use a transfer-specific type.
   * The backend can use this when applying
   * tenant spread rules.
   */
  transactionType?: string;

  customerSegment?: string;

  metadata?: Record<string, unknown>;
};

export type CreateFxQuoteResponse = {
  idempotent: boolean;
  quote: FxQuote;
};

const makeIdempotencyKey = () => {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return `transfer-fx-${crypto.randomUUID()}`;
  }

  return `transfer-fx-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

export const fxService = {
  createQuote(
    payload: CreateFxQuotePayload,
  ): Promise<CreateFxQuoteResponse> {
    return apiRequest<CreateFxQuoteResponse>(
      "/fx/quotes",
      {
        method: "POST",
        body: JSON.stringify({
          ...payload,

          validForSeconds:
            payload.validForSeconds ?? 60,

          transactionType:
            payload.transactionType ??
            "account_transfer",
        }),
      },
    );
  },

  createTransferQuote({
    sourceCurrency,
    destinationCurrency,
    sourceAmount,
  }: {
    sourceCurrency: string;
    destinationCurrency: string;
    sourceAmount: number;
  }): Promise<CreateFxQuoteResponse> {
    return this.createQuote({
      sourceCurrency,
      destinationCurrency,
      sourceAmount,

      idempotencyKey:
        makeIdempotencyKey(),

      validForSeconds: 60,

      transactionType:
        "account_transfer",

      metadata: {
        source:
          "zentra_work_transfer",
      },
    });
  },
};