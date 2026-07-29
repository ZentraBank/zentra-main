export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type ApiResponse<T> = {
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};
