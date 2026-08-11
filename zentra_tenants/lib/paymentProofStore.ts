export type PaymentStatus = "pending" | "approved" | "rejected";

export type PaymentProof = {
  id: string;
  plan: string;
  amount: string;
  fileName: string;
  status: PaymentStatus;
  createdAt: string;
  rejectionReason?: string;
};

const STORAGE_KEY = "payment_proofs";

export function getPaymentProofs(): PaymentProof[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePaymentProof(proof: PaymentProof) {
  const proofs = getPaymentProofs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([proof, ...proofs]));
}

export function updatePaymentProof(
  id: string,
  updates: Partial<PaymentProof>
) {
  const proofs = getPaymentProofs();

  const updated = proofs.map((proof) =>
    proof.id === id ? { ...proof, ...updates } : proof
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getLatestPaymentProof() {
  return getPaymentProofs()[0] || null;
}