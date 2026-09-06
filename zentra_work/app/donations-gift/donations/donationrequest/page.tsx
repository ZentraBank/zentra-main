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
import {
  resolveMediaUrl,
} from "@/lib/media";

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
      className="min-h-screen bg-[#2f6df2] px-4 pb-6 pt-10 text-[#111] lg:px-12 lg:py-16"
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
      {/* Mobile Layout Wrapper */}
      <section className="mx-auto max-w-[430px] lg:hidden">
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
    resolveMediaUrl(
      selectedDonor.profile_image_url,
    ) ||
    "/images/donations-avatar-2.png"
  }
  alt={`${selectedDonor.full_name} profile`}
  fill
  unoptimized
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
    resolveMediaUrl(
      donor.profile_image_url,
    ) ||
    "/images/donations-avatar-2.png"
  }
  alt={`${donor.full_name} profile`}
  fill
  unoptimized
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

      {/* Desktop Layout Wrapper */}
      <section className="hidden lg:mx-auto lg:flex lg:w-full lg:max-w-[1300px] lg:flex-col">
        <header className="relative mb-8 flex items-center justify-between rounded-[24px] border border-white/20 bg-white/10 px-8 py-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/donations-gift/donations"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#2f6df2] shadow-md transition hover:bg-white/90"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="font-heading text-[22px] font-black tracking-tight text-white">
                Philanthropic Donation Portal
              </h1>
              <p className="mt-0.5 text-xs text-white/70">
                Review donor credentials, explore program benefits, and submit your verified funding request.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-[14px] bg-red-50 px-6 py-4 text-center text-sm font-medium text-red-700 shadow-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Selected Donor Profile & Request CTA */}
          <div className="col-span-5 flex flex-col justify-between">
            {selectedDonor && (
              <div className="rounded-[28px] border border-white/20 bg-white p-8 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-5">
                  <div className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-[18px] shadow-md">
                    <Image
                      src={
                        resolveMediaUrl(
                          selectedDonor.profile_image_url,
                        ) ||
                        "/images/donations-avatar-2.png"
                      }
                      alt={`${selectedDonor.full_name} profile`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold text-[#111]">
                      {selectedDonor.full_name}
                    </h2>
                    {selectedDonor.country && (
                      <p className="mt-1 text-xs font-semibold text-black/50">
                        {selectedDonor.country}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[#ffd233]">
                      {[1, 2, 3, 4].map((item) => (
                        <Star key={item} size={15} fill="currentColor" />
                      ))}
                      <Star size={15} fill="currentColor" className="opacity-40" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[16px] bg-[#eef5ff] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2458E8]">
                    Donor Bio & Focus
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#444]">
                    {donorDescription}
                  </p>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(true)}
                    className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2458E8] text-base font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600 active:scale-[0.99]"
                  >
                    Request donation from {selectedDonor.full_name}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Platform Overview & Other Available Donors */}
          <div className="col-span-7 space-y-8">
            {/* Program Details Card */}
            <div className="rounded-[28px] border border-white/20 bg-white/90 p-8 shadow-xl backdrop-blur-md">
              <div className="grid grid-cols-12 gap-6 items-center">
                <div className="col-span-5">
                  <div className="relative h-[200px] w-full overflow-hidden rounded-[20px] shadow-inner">
                    <Image
                      src="/images/donation-hands.png"
                      alt="Donation hands"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="col-span-7">
                  <h3 className="text-xl font-black text-[#111]">
                    ZentraBank Donation Ecosystem
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-black/60">
                    ZentraBank connects verified customers with tenant-approved philanthropists willing to provide direct financial assistance. Submit your structured request, designate your target account, and track your approval status transparently.
                  </p>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-[#111]">Key Benefits:</p>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-black/60">
                      <li>Direct financial support from vetted donors</li>
                      <li>Customizable receiving account selection</li>
                      <li>Secure real-time request tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Available Donors Section */}
            {otherDonors.length > 0 && (
              <div className="rounded-[28px] border border-white/20 bg-[#8FC2FF]/40 p-6 shadow-xl backdrop-blur-md">
                <h3 className="mb-4 text-base font-black text-[#111]">
                  Other Available Donors
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {otherDonors.map((donor) => (
                    <article
                      key={donor.id}
                      className="flex items-center justify-between gap-3 rounded-[18px] bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px]">
                          <Image
                            src={
                              resolveMediaUrl(
                                donor.profile_image_url,
                              ) ||
                              "/images/donations-avatar-2.png"
                            }
                            alt={`${donor.full_name} profile`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-[#111]">
                            {donor.full_name}
                          </h4>
                          <p className="truncate text-[11px] text-black/50">
                            {donor.country || "Verified Philanthropist"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/donations-gift/donations/donationrequest?donor=${encodeURIComponent(
                          donor.id,
                        )}`}
                        className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-[#2458E8] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-blue-600"
                      >
                        Select
                        <Plus size={13} />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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