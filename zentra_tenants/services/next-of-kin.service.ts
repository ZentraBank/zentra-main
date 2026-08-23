import {
  api,
  getApiErrorMessage,
} from "@/lib/api";

import type {
  PodClaim,
  PodClaimListParams,
  PodClaimsResponse,
  UpdatePodClaimStatusInput,
} from "@/types/next-of-kin.types";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const nextOfKinService = {
  async listClaims(
    params: PodClaimListParams = {},
  ) {
    try {
      const response =
        await api.get<
          ApiEnvelope<PodClaimsResponse>
        >(
          "/next-of-kin/claims",
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

  async getClaim(
    claimId: string,
  ) {
    try {
      const response =
        await api.get<
          ApiEnvelope<PodClaim>
        >(
          `/next-of-kin/claims/${encodeURIComponent(
            claimId,
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

  async updateClaimStatus(
    claimId: string,
    input: UpdatePodClaimStatusInput,
  ) {
    try {
      const response =
        await api.patch<
          ApiEnvelope<PodClaim>
        >(
          `/next-of-kin/claims/${encodeURIComponent(
            claimId,
          )}/status`,
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
  async getClaimFile(
  claimId: string,
  fileId: string,
) {
  try {
    const response =
      await api.get<Blob>(
        `/next-of-kin/claims/${encodeURIComponent(
          claimId,
        )}/files/${encodeURIComponent(
          fileId,
        )}`,
        {
          responseType: "blob",
        },
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
      ),
    );
  }
},
};