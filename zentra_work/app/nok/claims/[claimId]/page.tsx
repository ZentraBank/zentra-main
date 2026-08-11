"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { nextOfKinService } from "@/services/next-of-kin.service";
import type { PodClaim } from "@/types/next-of-kin";

export default function PodClaimDetailsPage() {
  const { claimId } = useParams<{ claimId: string }>();

  const [claim, setClaim] = useState<PodClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!claimId) return;

    setLoading(true);
    setError("");

    try {
      setClaim(
        await nextOfKinService.getMine(claimId),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this POD claim.",
      );
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-5 pb-10 pt-12">
      <section className="mx-auto w-full max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/nok/claims"
            className="absolute left-0 text-[#555]"
          >
            <ArrowLeft size={22} />
          </Link>

          <h1 className="text-[14px] font-bold text-[#444]">
            POD Claim Details
          </h1>

          <button
            type="button"
            onClick={() => void load()}
            className="absolute right-0 grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </header>

        {error && (
          <div className="mt-5 rounded-[12px] bg-red-50 px-4 py-3 text-[12px] text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-[320px] place-items-center rounded-[18px] bg-white">
            <Loader2 className="animate-spin text-[#2458E8]" />
          </div>
        ) : claim ? (
          <section className="mt-8 overflow-hidden rounded-[20px] bg-white shadow-sm">
            <div className="border-b border-black/5 px-5 py-5">
              <p className="text-[10px] uppercase tracking-wider text-black/35">
                Claim reference
              </p>

              <p className="mt-1 break-all text-[12px] font-bold text-[#2458E8]">
                {claim.id}
              </p>
            </div>

            <div className="space-y-4 px-5 py-5">
              <Detail
                label="Status"
                value={claim.status.replaceAll("_", " ")}
              />

              <Detail
                label="Deceased"
                value={claim.deceased_name}
              />

              <Detail
                label="Account"
                value={`•••• ${claim.deceased_account_number.slice(-4)}`}
              />

              <Detail
                label="Beneficiary"
                value={claim.beneficiary_name}
              />

              <Detail
                label="Relationship"
                value={claim.relationship_to_deceased}
              />

              <Detail
                label="Payment method"
                value={claim.payment_method.replaceAll("_", " ")}
              />

              <div>
                <p className="text-[11px] font-semibold text-black/40">
                  Claim statement
                </p>

                <p className="mt-1 text-[12px] leading-5 text-[#333]">
                  {claim.claim_statement}
                </p>
              </div>

              {claim.rejection_reason && (
                <div className="rounded-[12px] bg-red-50 px-4 py-3">
                  <p className="text-[11px] font-bold text-red-700">
                    Rejection reason
                  </p>

                  <p className="mt-1 text-[12px] text-red-700">
                    {claim.rejection_reason}
                  </p>
                </div>
              )}

              {claim.documents &&
                claim.documents.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-black/40">
                      Submitted documents
                    </p>

                    <div className="space-y-2">
                      {claim.documents.map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center gap-3 rounded-[10px] bg-[#F4F6F8] px-3 py-3"
                        >
                          <FileText
                            size={17}
                            className="text-[#2458E8]"
                          />

                          <div className="min-w-0">
                            <p className="text-[12px] font-bold capitalize text-[#333]">
                              {document.document_type.replaceAll("_", " ")}
                            </p>

                            <p className="truncate text-[10px] text-black/40">
                              {document.original_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-black/40">
        {label}
      </span>

      <span className="max-w-[230px] text-right text-[12px] font-semibold capitalize text-[#333]">
        {value}
      </span>
    </div>
  );
}