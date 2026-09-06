import {api} from "@/lib/api";

export type PlanCode =
  | "bronze"
  | "gold"
  | "diamond";

export type SubscriptionPlan = {
  id: string;
  name: string;
  code: PlanCode;

  description?:
    | string
    | null;

  price?:
    | string
    | number
    | null;

  monthly_price?:
    | string
    | number
    | null;

  is_active?: boolean;
};

export type TenantSubscription = {
  id: string;

  tenant_id?: string;
  user_id?: string;

  plan_id?: string;

  plan_name?: string;
  plan_code?: PlanCode;

  status: string;

  starts_at?:
    | string
    | null;

  expires_at?:
    | string
    | null;

  created_at?: string;
  updated_at?: string;
};

export type SubscriptionRequest = {
  id: string;

  tenant_id?: string;
  user_id?: string;

  plan_id?: string;

  plan_name?: string;
  plan_code?: PlanCode;

  status: string;

  payment_reference?:
    | string
    | null;

  payment_proof_file_id?:
    | string
    | null;

  payment_note?:
    | string
    | null;

  created_at?: string;
  updated_at?: string;
};

export type SubscriptionEntitlementValue =
  | boolean
  | number
  | string
  | null;

export type SubscriptionEntitlements =
  Record<
    string,
    SubscriptionEntitlementValue
  >;

export type MySubscriptionResponse = {
  subscription:
    | TenantSubscription
    | null;

  entitlements:
    SubscriptionEntitlements;

  openRequest:
    | SubscriptionRequest
    | null;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

type UploadedPaymentProof = {
  fileId: string;
  documentType: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

/*
|--------------------------------------------------------------------------
| Response unwrap
|--------------------------------------------------------------------------
*/

const unwrap = <T>(
  response: {
    data: ApiResponse<T>;
  }
): T => {
  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| Get available plans
|--------------------------------------------------------------------------
*/

const getPlans =
  async (): Promise<
    SubscriptionPlan[]
  > => {
    const response =
      await api.get<
        ApiResponse<
          SubscriptionPlan[]
        >
      >(
        "/subscriptions/plans"
      );

    return unwrap(
      response
    );
  };

/*
|--------------------------------------------------------------------------
| Get tenant subscription
|--------------------------------------------------------------------------
*/

const getMine =
  async (): Promise<
    MySubscriptionResponse
  > => {
    const response =
      await api.get<
        ApiResponse<
          MySubscriptionResponse
        >
      >(
        "/subscriptions/me"
      );

    return unwrap(
      response
    );
  };

/*
|--------------------------------------------------------------------------
| Request plan change
|--------------------------------------------------------------------------
*/

const requestPlanChange =
  async (
    planCode: PlanCode
  ): Promise<SubscriptionRequest> => {
    const response =
      await api.post<
        ApiResponse<
          SubscriptionRequest
        >
      >(
        "/subscriptions/requests",
        {
          planCode,
        }
      );

    return unwrap(
      response
    );
  };

/*
|--------------------------------------------------------------------------
| Upload authenticated payment proof
|--------------------------------------------------------------------------
*/

const uploadPaymentProof =
  async (
    file: File
  ): Promise<UploadedPaymentProof> => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await api.post<
        ApiResponse<
          UploadedPaymentProof
        >
      >(
        "/subscriptions/payment-proof/upload",
        formData
      );

    return unwrap(
      response
    );
  };

/*
|--------------------------------------------------------------------------
| Submit payment proof metadata
|--------------------------------------------------------------------------
*/

const submitPaymentProof =
  async ({
    requestId,
    paymentReference,
    paymentProofFileId,
    paymentNote,
  }: {
    requestId: string;

    paymentReference: string;

    paymentProofFileId: string;

    paymentNote?: string;
  }): Promise<SubscriptionRequest> => {
    const response =
      await api.patch<
        ApiResponse<
          SubscriptionRequest
        >
      >(
        `/subscriptions/requests/${requestId}/payment-proof`,
        {
          paymentReference,
          paymentProofFileId,
          paymentNote:
            paymentNote ?? "",
        }
      );

    return unwrap(
      response
    );
  };

/*
|--------------------------------------------------------------------------
| Export service
|--------------------------------------------------------------------------
*/

export const subscriptionService = {
  getPlans,
  getMine,

  requestPlanChange,

  uploadPaymentProof,
  submitPaymentProof,
};