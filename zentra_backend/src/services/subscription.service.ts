import api from "@/lib/api";

export type PlanCode =
  | "bronze"
  | "gold"
  | "diamond";

export type SubscriptionPlan = {
  id: string;
  name: string;
  code: PlanCode;
  price?: number | string | null;
  description?: string | null;
};

export type TenantSubscription = {
  id: string;
  tenant_id: string;
  user_id?: string | null;
  plan_id: string;

  plan_name?: string;
  plan_code?: PlanCode;

  status: string;

  starts_at?: string | null;
  expires_at?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type SubscriptionRequest = {
  id: string;

  tenant_id: string;
  user_id: string;
  plan_id: string;

  plan_name?: string;
  plan_code?: PlanCode;

  status:
    | "pending_payment"
    | "payment_submitted"
    | "approved"
    | "rejected"
    | string;

  payment_reference?: string | null;
  payment_proof_file_id?: string | null;
  payment_note?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type SubscriptionEntitlements =
  Record<
    string,
    boolean | number | string | null
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
  success: boolean;
  message: string;
  data: T;
};

const unwrap = <T>(
  response: {
    data: ApiResponse<T>;
  }
): T => response.data.data;

/*
|--------------------------------------------------------------------------
| Subscription catalogue
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
        "/subscriptions"
      );

    return unwrap(response);
  };

/*
|--------------------------------------------------------------------------
| Current tenant subscription
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

    return unwrap(response);
  };

/*
|--------------------------------------------------------------------------
| Request plan change
|--------------------------------------------------------------------------
*/

const requestPlanChange =
  async (
    planCode: PlanCode
  ): Promise<
    SubscriptionRequest
  > => {
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

    return unwrap(response);
  };

const uploadPaymentProof =
  async (
    file: File
  ): Promise<{
    fileId: string;
    documentType: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
  }> => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await api.post<
        ApiResponse<{
          fileId: string;
          documentType: string;
          originalName: string;
          mimeType: string;
          sizeBytes: number;
        }>
      >(
        "/subscriptions/payment-proof/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return unwrap(response);
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
  }): Promise<
    SubscriptionRequest
  > => {
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

    return unwrap(response);
  };

export const subscriptionService = {
  getPlans,
  getMine,
  requestPlanChange,
    uploadPaymentProof,
  submitPaymentProof,
};