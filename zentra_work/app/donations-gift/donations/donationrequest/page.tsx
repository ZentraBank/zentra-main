/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Star,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import RequestDonationOverlay from "@/components/donation/RequestDonationOverlay";
import {
  donationService,
  type Donor,
} from "@/services/donation.service";

export default function DonationRequestPage() {
  const searchParams = useSearchParams();
  const donorId = searchParams.get("donor");

  const [selectedDonor, setSelectedDonor] =
    useState<Donor | null>(null);

  const [otherDonors, setOtherDonors] =
    useState<Donor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showRequestForm, setShowRequestForm] =
    useState(false);

  const load = useCallback(async () => {
    if (!donorId) {
      setError("No donor was selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [
        donor,
        others,
      ] = await Promise.all([
        donationService.getDonor(
          donorId
        ),

        donationService.listDonors({
          status: "active",
          excludeDonorId:
            donorId,
          page: 1,
          pageSize: 6,
        }),
      ]);

      setSelectedDonor(donor);
      setOtherDonors(others);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load donor information.",
      );
    } finally {
      setLoading(false);
    }
  }, [donorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const donorDescription =
    useMemo(() => {
      if (!selectedDonor) {
        return "";
      }

      const metadata =
        selectedDonor.metadata;

      if (
        metadata &&
        typeof metadata.description ===
          "string"
      ) {
        return metadata.description;
      }

      if (
        metadata &&
        typeof metadata.bio ===
          "string"
      ) {
        return metadata.bio;
      }

      if (
        selectedDonor.country
      ) {
        return `Philanthropist based in ${selectedDonor.country}.`;
      }

      return "ZentraBank verified philanthropist.";
    }, [selectedDonor]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#2f6df2]">
        <div className="text-center text-white">
          <Loader2
            size={30}
            className="mx-auto animate-spin"
          />

          <p className="mt-3 text-sm">
            Loading donor...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#2f6df2] px-4 pb-6 pt-10 text-[#111]"
      style={{
        backgroundImage:
          "url('/images/donations-bg.png')",
        backgroundSize: "cover",
        backgroundPosition:
          "center",
        backgroundRepeat:
          "no-repeat",
      }}
    >
      <section className="mx-auto max-w-[430px]">
        <header className="relative flex items-center justify-center">
          <Link
            href="/donations-gift/donations"
            className="absolute left-0 text-white"
          >
            <ArrowLeft size={21} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Donation
          </h1>
        </header>

        {error && (
          <div className="mt-5 rounded-[10px] bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {selectedDonor && (
          <section className="mt-7 overflow-hidden rounded-[7px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            <div className="grid grid-cols-[1.05fr_1fr] gap-3 bg-[#eef5ff] p-2">
              <div className="relative h-[128px] overflow-hidden rounded-[3px]">
                <Image
                  src={
                    selectedDonor.profile_image_url ||
                    "/images/donations-avatar-2.png"
                  }
                  alt={
                    selectedDonor.full_name
                  }
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="pt-1">
                <h2 className="text-[16px] font-medium leading-none">
                  {
                    selectedDonor.full_name
                  }
                </h2>

                <p className="mt-2 text-[12px] leading-[13px]">
                  {donorDescription}
                </p>

                {selectedDonor.country && (
                  <p className="mt-2 text-[11px] text-black/45">
                    {
                      selectedDonor.country
                    }
                  </p>
                )}

                <div className="mt-2 flex items-center gap-[2px] text-[#ffd233]">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <Star
                        key={item}
                        size={13}
                        fill="currentColor"
                      />
                    ),
                  )}

                  <Star
                    size={13}
                    fill="currentColor"
                    className="opacity-40"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(135deg,#11863B_0%,#53B879_42%,#F8F8F8_68%,#159B45_100%)] pt-1">
              <div className="relative mx-auto h-[167px] w-full overflow-hidden rounded-[50%]">
                <Image
                  src="/images/donation-hands.png"
                  alt="Donation hands"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="border-t border-black/10 px-4 pb-5 pt-4">
                <h2 className="text-center text-[22px] font-black">
                  Donations
                </h2>

                <p className="mt-3 text-[13px] leading-[16px]">
                  ZentraBank connects
                  customers with
                  tenant-approved
                  philanthropists who
                  are willing to provide
                  financial support.
                </p>

                <p className="mt-4 text-[13px] leading-[16px]">
                  Submit your request,
                  explain your purpose,
                  and select the account
                  where approved funds
                  should be received.
                </p>

                <p className="mt-5 text-[13px] font-medium">
                  Request for donation
                  now...
                </p>
              </div>
            </div>

            <div className="bg-white px-4 pb-6 pt-3">
              <h3 className="text-[14px] font-black">
                Benefits
              </h3>

              <ul className="mt-2 list-disc space-y-2 pl-5 text-[13px] leading-[16px]">
                <li>
                  Request financial
                  support from approved
                  donors.
                </li>

                <li>
                  Choose the account
                  where approved funds
                  should be received.
                </li>

                <li>
                  Track your request and
                  redemption status.
                </li>
              </ul>
            </div>
          </section>
        )}

        {otherDonors.length > 0 && (
          <section className="mt-5 rounded-[10px] bg-[#8FC2FF] p-2">
            <h2 className="mb-2 text-[13px] font-black">
              Other available donors
            </h2>

            <div className="space-y-2">
              {otherDonors.map(
                (donor) => (
                  <article
                    key={donor.id}
                    className="flex items-center gap-2 rounded-[8px] bg-white p-2"
                  >
                    <div className="relative h-[60px] w-[60px] overflow-hidden rounded-[5px]">
                      <Image
                        src={
                          donor.profile_image_url ||
                          "/images/donations-avatar-2.png"
                        }
                        alt={
                          donor.full_name
                        }
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-medium">
                        {
                          donor.full_name
                        }
                      </h3>

                      <p className="line-clamp-2 text-[11px] leading-[12px]">
                        {
                          getDonorDescription(
                            donor,
                          )
                        }
                      </p>
                    </div>

                    <Link
                      href={`/donations-gift/donations/donationrequest?donor=${encodeURIComponent(
                        donor.id,
                      )}`}
                      className="flex h-[28px] items-center gap-1 rounded-full bg-[#2458E8] px-3 text-[12px] text-white"
                    >
                      Select
                      <Plus size={13} />
                    </Link>
                  </article>
                ),
              )}
            </div>
          </section>
        )}

        {selectedDonor && (
          <div className="sticky bottom-0 mt-5 bg-white/80 py-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={() =>
                setShowRequestForm(
                  true
                )
              }
              className="flex h-[43px] w-full items-center justify-center rounded-[9px] bg-[#2458E8] text-[14px] font-bold text-white shadow-sm active:scale-[0.98]"
            >
              Request donation
            </button>
          </div>
        )}
      </section>

      {selectedDonor && (
        <RequestDonationOverlay
          open={showRequestForm}
          onClose={() =>
            setShowRequestForm(
              false
            )
          }
          donor={
            selectedDonor
          }
        />
      )}
    </main>
  );
}

function getDonorDescription(
  donor: Donor,
): string {
  const metadata =
    donor.metadata;

  if (
    metadata &&
    typeof metadata.description ===
      "string" &&
    metadata.description.trim()
  ) {
    return metadata.description;
  }

  if (
    metadata &&
    typeof metadata.bio ===
      "string" &&
    metadata.bio.trim()
  ) {
    return metadata.bio;
  }

  if (donor.country) {
    return `Philanthropist based in ${donor.country}.`;
  }

  return "ZentraBank verified philanthropist.";
}