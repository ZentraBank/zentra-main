import { api } from "@/lib/api";

type UploadResponse = {
  success: boolean;
  message?: string;

  data: {
    url: string;
  };
};

export const uploadService = {
  async image(
    file: File,
  ): Promise<string> {
    const formData =
      new FormData();

    formData.append(
      "image",
      file,
      file.name,
    );

    const response =
      await api.post<UploadResponse>(
        "/uploads/images",
        formData,
      );

    // Return ONLY the string.
    return response.data.data.url;
  },
};