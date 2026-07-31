export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: unknown;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors?: unknown;
};
