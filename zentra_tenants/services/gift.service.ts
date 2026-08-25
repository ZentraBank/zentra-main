import {
  api,
  getApiErrorMessage,
} from "@/lib/api";

import type {
  CreateGiftInput,
  Gift,
  GiftListParams,
  GiftListResponse,
  UpdateGiftInput,
} from "@/types/gift.types";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const giftService = {
  async create(
    input: CreateGiftInput,
  ) {
    try {
      const response =
        await api.post<
          ApiEnvelope<Gift>
        >(
          "/gifts",
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

  async list(
    params: GiftListParams = {},
  ) {
    try {
      const response =
        await api.get<
          ApiEnvelope<GiftListResponse>
        >(
          "/gifts",
          {
            params,
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

  async get(
    giftId: string,
  ) {
    try {
      const response =
        await api.get<
          ApiEnvelope<Gift>
        >(
          `/gifts/${encodeURIComponent(
            giftId,
          )}`,
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

  async update(
  giftId: string,
  input: UpdateGiftInput,
) {
  try {
    const response =
      await api.patch<
        ApiEnvelope<Gift>
      >(
        `/gifts/${encodeURIComponent(
          giftId,
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

  async cancel(
    giftId: string,
  ) {
    try {
      const response =
        await api.post<
          ApiEnvelope<Gift>
        >(
          `/gifts/${encodeURIComponent(
            giftId,
          )}/cancel`,
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