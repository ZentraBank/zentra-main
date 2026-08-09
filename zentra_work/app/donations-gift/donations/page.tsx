/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  donationService,
  type Donor,
} from "@/services/donation.service";

export default function DonationDetailsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result =
        await donationService.listDonors({
          status: "active",
          page: 1,
          pageSize: 50,
        });

      setDonors(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load available donors.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#9AF0A8]"
      style={{
        backgroundImage:
          "url('/images/donations-bg-2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-10 pt-12">
        <header className="relative flex items-center justify-center">
          <Link
            href="/donations-gift"
            className="absolute left-0 text-white"
            aria-label="Back"
          >
            <ArrowLeft size={21} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em] text-white">
            Donation
          </h1>

          <button
            type="button"
            onClick={() => void load()}
            className="absolute right-0 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
            aria-label="Refresh donors"
          >
            <RefreshCw size={16} />
          </button>
        </header>

        <div className="mt-6 flex justify-center">
          <div className="relative h-[150px] w-[292px] overflow-hidden rounded-[50%]">
            <Image
              src="/images/donation-hands.png"
              alt="Donation"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[330px] space-y-4 text-center text-[15px] leading-[20px] text-[#6b6b6b]">
          <p>
            Experience how amazing it is to enjoy free-will
            donations from people you know and don&apos;t know.
            Pick from the available philanthropists and request
            financial support through ZentraBank.
          </p>

          <p>
            Do you need funds as an upcoming philanthropist?
          </p>

          <p>
            Do you need funds to help the poor and needy?
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-[10px] bg-red-50 px-4 py-3 text-center text-sm text-red-700 shadow-sm">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 inline-flex items-center gap-2 font-bold"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}

        <section className="mt-6 rounded-[8px] bg-[#8FC2FF] px-2 pb-3 pt-4 shadow-[0_0_8px_rgba(0,0,0,0.18)]">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[13px] font-black text-[#222]">
              Available donors
            </h2>

            {!loading && (
              <span className="text-[11px] font-semibold text-black/45">
                {donors.length} available
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid min-h-[260px] place-items-center rounded-[8px] bg-white/40">
              <div className="text-center">
                <Loader2
                  size={24}
                  className="mx-auto animate-spin text-[#2458E8]"
                />

                <p className="mt-3 text-[12px] font-medium text-black/50">
                  Loading available donors...
                </p>
              </div>
            </div>
          ) : donors.length === 0 ? (
            <div className="rounded-[8px] bg-white/70 px-4 py-8 text-center">
              <p className="text-[14px] font-bold text-[#222]">
                No donors available
              </p>

              <p className="mt-2 text-[12px] leading-5 text-black/50">
                There are currently no active donors available
                for donation requests.
              </p>
            </div>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {donors.map((donor) => (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function DonorCard({
  donor,
}: {
  donor: Donor;
}) {
  return (
    <article className="flex min-h-[82px] items-center gap-3 rounded-[7px] bg-[#eef5ff] px-2 py-2 shadow-sm">
      <div className="relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[5px] bg-white">
        <Image
          src={
            donor.profile_image_url ||
            "/images/donations-avatar-2.png"
          }
          alt={donor.full_name}
          fill
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[17px] font-medium leading-none text-[#222]">
          {donor.full_name}
        </h3>

        <p className="mt-1 line-clamp-2 text-[12px] leading-[14px] text-[#333]">
          {getDonorDescription(donor)}
        </p>

        {(donor.country || donor.address) && (
          <p className="mt-1 truncate text-[10px] font-medium text-black/40">
            {[donor.address, donor.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>

      <div className="flex w-[78px] shrink-0 flex-col items-end gap-2">
        <Link
          href={`/donations-gift/donations/donationrequest?donor=${encodeURIComponent(
            donor.id,
          )}`}
          className="flex h-[28px] w-[78px] items-center justify-center gap-1 rounded-full bg-[#2458E8] text-[12px] font-medium text-white shadow-sm transition hover:bg-[#1d49c6] active:scale-95"
        >
          Request
          <Plus size={14} />
        </Link>

        <span className="flex h-[22px] w-[78px] items-center justify-center rounded-full bg-white text-[12px] text-[#555] shadow-sm">
          Donor
        </span>
      </div>
    </article>
  );
}

function getDonorDescription(
  donor: Donor,
): string {
  const metadata = donor.metadata;

  if (
    metadata &&
    typeof metadata.description === "string" &&
    metadata.description.trim()
  ) {
    return metadata.description;
  }

  if (
    metadata &&
    typeof metadata.bio === "string" &&
    metadata.bio.trim()
  ) {
    return metadata.bio;
  }

  if (donor.country) {
    return `Philanthropist based in ${donor.country}.`;
  }

  return "ZentraBank verified philanthropist.";
}