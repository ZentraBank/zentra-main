import { apiRequest, ApiError } from "@/lib/api-client";
import type { KycProfile, SaveKycProfileInput } from "@/types/kyc";

export const kycService = {
  async getMine(): Promise<KycProfile | null> {
    try {
      return await apiRequest<KycProfile>("/kyc/me");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  saveProfile(input: SaveKycProfileInput) {
    return apiRequest<KycProfile>("/kyc/me", { method: "PUT", body: JSON.stringify(input) });
  },
  uploadDocumentFile(input: { documentType: string; fileName: string; mimeType: string; base64Data: string }) {
    return apiRequest<{ documentId: string; fileUrl: string }>("/kyc/me/document-files", { method: "POST", body: JSON.stringify(input) });
  },
  addDocument(input: { documentType: string; fileUrl: string; fileName?: string; mimeType?: string }) {
    return apiRequest<{ documentId: string }>("/kyc/me/documents", { method: "POST", body: JSON.stringify(input) });
  },
  submit() {
    return apiRequest<KycProfile>("/kyc/me/submit", { method: "POST", body: JSON.stringify({}) });
  },
};
