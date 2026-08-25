import {
  apiRequest,
  getApiErrorMessage,
} from "@/lib/api-client";

import type {
  Gift,
  GiftListResponse,
} from "@/types/gift.types";

export type RedemptionProof = {
  id: string;
  tenant_id: string;
  gift_id: string;
  client_user_id: string;

  file_id: string;

  amount_paid:
    | string
    | number;

  payment_reference:
    | string
    | null;

  payment_method:
    | string
    | null;

  note:
    | string
    | null;

  status:
    | "submitted"
    | "approved"
    | "rejected";

  rejection_reason:
    | string
    | null;

  original_name?: string;
  mime_type?: string;
  size_bytes?: number;

  submitted_at: string;
  reviewed_at:
    | string
    | null;
};

type RedemptionSubmitResponse = {
  gift: Gift;
  proof: RedemptionProof;
};

type UploadedProofFile = {
  fileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  documentType: string;
};

export const giftService = {
  async listMine(
    params?: {
      page?: number;
      pageSize?: number;
      status?: string;
    },
  ): Promise<GiftListResponse> {
    try {
      const searchParams =
        new URLSearchParams();

      if (
        params?.page
      ) {
        searchParams.set(
          "page",
          String(
            params.page,
          ),
        );
      }

      if (
        params?.pageSize
      ) {
        searchParams.set(
          "pageSize",
          String(
            params.pageSize,
          ),
        );
      }

      if (
        params?.status
      ) {
        searchParams.set(
          "status",
          params.status,
        );
      }

      const query =
        searchParams.toString();

      return await apiRequest<GiftListResponse>(
        `/gifts/me${
          query
            ? `?${query}`
            : ""
        }`,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to load gifts.",
        ),
      );
    }
  },

  async getMine(
    giftId: string,
  ): Promise<Gift> {
    try {
      return await apiRequest<Gift>(
        `/gifts/me/${encodeURIComponent(
          giftId,
        )}`,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to load gift.",
        ),
      );
    }
  },

  async decide(
    giftId: string,
    decision:
      | "accepted"
      | "declined",
  ): Promise<Gift> {
    try {
      return await apiRequest<Gift>(
        `/gifts/me/${encodeURIComponent(
          giftId,
        )}/decision`,
        {
          method: "POST",

          body:
            JSON.stringify({
              decision,
            }),
        },
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to update gift.",
        ),
      );
    }
  },

  async uploadRedemptionProofFile(
    giftId: string,
    file: File,
  ): Promise<UploadedProofFile> {
    try {
      const formData =
        new FormData();

      /*
       * Your upload middleware must use
       * upload.single("file") for this
       * field name.
       */
      formData.append(
        "file",
        file,
      );

      return await apiRequest<UploadedProofFile>(
        `/gifts/me/${encodeURIComponent(
          giftId,
        )}/redemption-proof/file`,
        {
          method: "POST",
          body: formData,
        },
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to upload payment proof.",
        ),
      );
    }
  },

  async submitRedemptionProof(
    giftId: string,
    input: {
      fileId: string;

      amountPaid: number;

      paymentReference?: string;

      paymentMethod:
        | "bank_transfer"
        | "card"
        | "cash_deposit"
        | "other";

      note?: string;
    },
  ): Promise<RedemptionSubmitResponse> {
    try {
      return await apiRequest<RedemptionSubmitResponse>(
        `/gifts/me/${encodeURIComponent(
          giftId,
        )}/redemption-proof`,
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
          "Unable to submit redemption proof.",
        ),
      );
    }
  },

  async getMyRedemptionProof(
    giftId: string,
  ): Promise<RedemptionProof> {
    try {
      return await apiRequest<RedemptionProof>(
        `/gifts/me/${encodeURIComponent(
          giftId,
        )}/redemption-proof`,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unable to load redemption proof.",
        ),
      );
    }
  },
};