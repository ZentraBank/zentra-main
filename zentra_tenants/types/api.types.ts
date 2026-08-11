export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorPayload = {
  success?: false;
  message?: string;
  errors?: unknown;
};
