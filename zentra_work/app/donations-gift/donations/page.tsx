/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  donationService,
  type Donor,
} from "@/services/donation.service";
import { resolveMediaUrl } from "@/lib/media";

export default function DonationDetailsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Desktop-only UI state.
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

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

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          donors
            .map((donor) => donor.country?.trim())
            .filter(
              (country): country is string =>
                Boolean(country),
            ),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [donors],
  );

  const filteredDonors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return donors.filter((donor) => {
      const description = getDonorDescription(donor);

      const matchesSearch =
        !query ||
        donor.full_name.toLowerCase().includes(query) ||
        donor.country?.toLowerCase().includes(query) ||
        donor.address?.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query);

      const matchesCountry =
        countryFilter === "all" ||
        donor.country === countryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [donors, searchQuery, countryFilter]);

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
      {/* =========================================================
          MOBILE
          Existing mobile design preserved.
          ========================================================= */}
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-10 pt-12 md:hidden">
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
          <Link
            href="/donations-gift/donations/requests"
            className="mt-5 flex h-[42px] w-full items-center justify-center rounded-[8px] bg-white/90 text-[13px] font-bold text-[#2458E8] shadow-sm"
          >
            View my donation requests
          </Link>

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
                <MobileDonorCard
                  key={donor.id}
                  donor={donor}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {/* =========================================================
          DESKTOP
          Purpose-built donor marketplace.
          ========================================================= */}
      <section className="hidden min-h-screen md:block">
        <div className="mx-auto min-h-screen w-full max-w-[1500px] px-8 py-7 lg:px-10 xl:px-14">
          <header className="flex h-[74px] items-center justify-between rounded-[22px] border border-white/35 bg-white/35 px-6 shadow-[0_12px_35px_rgba(36,88,232,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <Link
                href="/donations-gift"
                aria-label="Back"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/50 text-[#2458E8] shadow-sm transition hover:bg-white"
              >
                <ArrowLeft size={19} />
              </Link>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2458E8]/60">
                  ZentraBank
                </p>
                <h1 className="mt-0.5 text-[20px] font-black tracking-[-0.01em] text-[#172033]">
                  Donations
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void load()}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/50 text-[#2458E8] transition hover:bg-white"
                aria-label="Refresh donors"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              <Link
                href="/donations-gift/donations/requests"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2458E8] px-5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(36,88,232,0.25)] transition hover:bg-[#1d49c6]"
              >
                My donation requests
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-7 py-7 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[370px_minmax(0,1fr)] xl:gap-9">
            {/* LEFT SIDEBAR */}
            <aside className="self-start">
              <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/45 shadow-[0_24px_65px_rgba(16,93,48,0.10)] backdrop-blur-xl">
                <div className="relative h-[230px] w-full xl:h-[255px]">
                  <Image
                    src="/images/donation-hands.png"
                    alt="Donation"
                    fill
                    priority
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                  <span className="absolute bottom-5 left-5 rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                    Giving made accessible
                  </span>
                </div>

                <div className="p-6">
                  <h2 className="text-[28px] font-black leading-[1.08] tracking-[-0.03em] text-[#172033]">
                    Find support from available philanthropists.
                  </h2>

                  <p className="mt-4 text-[14px] leading-6 text-[#5d6678]">
                    Browse active donors and request financial
                    support directly through ZentraBank.
                  </p>

                  <div className="mt-6 rounded-[18px] border border-[#2458E8]/10 bg-[#EFF5FF] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-white text-[#2458E8] shadow-sm">
                        <Users size={19} />
                      </span>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/40">
                          Available now
                        </p>
                        <p className="mt-0.5 text-[23px] font-black text-[#172033]">
                          {loading ? "—" : donors.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-black/10 pt-5">
                    <p className="text-[13px] font-bold text-[#172033]">
                      Looking for support?
                    </p>

                    <p className="mt-2 text-[12px] leading-5 text-[#6c7482]">
                      Select a donor whose profile fits your
                      request and continue to the donation
                      request form.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN MARKETPLACE */}
            <div className="min-w-0">
              <div className="rounded-[28px] border border-white/60 bg-white/50 p-6 shadow-[0_24px_65px_rgba(36,88,232,0.08)] backdrop-blur-xl xl:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2458E8]">
                      Donor marketplace
                    </p>

                    <h2 className="mt-2 text-[30px] font-black tracking-[-0.025em] text-[#172033]">
                      Available donors
                    </h2>

                    <p className="mt-2 max-w-[650px] text-[13px] leading-5 text-[#697386]">
                      Search active philanthropists by name,
                      location or profile information.
                    </p>
                  </div>

                  {!loading && !error && (
                    <div className="rounded-full border border-black/5 bg-white/70 px-4 py-2 text-[12px] font-bold text-[#566070] shadow-sm">
                      {filteredDonors.length}
                      {filteredDonors.length === donors.length
                        ? ""
                        : ` of ${donors.length}`}{" "}
                      available
                    </div>
                  )}
                </div>

                {/* Search / filters */}
                <div className="mt-6 grid grid-cols-[minmax(0,1fr)_210px] gap-3">
                  <label className="relative block">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                    />

                    <input
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      type="search"
                      placeholder="Search donors by name, city, country..."
                      className="h-12 w-full rounded-[14px] border border-black/10 bg-white/80 pl-11 pr-4 text-[13px] text-[#202838] outline-none transition placeholder:text-black/35 focus:border-[#2458E8]/45 focus:ring-4 focus:ring-[#2458E8]/10"
                    />
                  </label>

                  <select
                    value={countryFilter}
                    onChange={(event) =>
                      setCountryFilter(event.target.value)
                    }
                    className="h-12 rounded-[14px] border border-black/10 bg-white/80 px-4 text-[13px] font-semibold text-[#4c5668] outline-none focus:border-[#2458E8]/45 focus:ring-4 focus:ring-[#2458E8]/10"
                  >
                    <option value="all">All countries</option>

                    {countries.map((country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="mt-6 rounded-[16px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
                    <div className="flex items-center justify-between gap-5">
                      <p>{error}</p>

                      <button
                        type="button"
                        onClick={() => void load()}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 font-bold shadow-sm"
                      >
                        <RefreshCw size={14} />
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  {loading ? (
                    <div className="grid min-h-[470px] place-items-center rounded-[20px] border border-white/70 bg-white/45">
                      <div className="text-center">
                        <Loader2
                          size={30}
                          className="mx-auto animate-spin text-[#2458E8]"
                        />

                        <p className="mt-4 text-[13px] font-semibold text-black/45">
                          Loading available donors...
                        </p>
                      </div>
                    </div>
                  ) : donors.length === 0 ? (
                    <div className="grid min-h-[390px] place-items-center rounded-[20px] border border-white/70 bg-white/50 px-8 text-center">
                      <div>
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#EFF5FF] text-[#2458E8]">
                          <Users size={23} />
                        </div>

                        <p className="mt-5 text-[18px] font-black text-[#172033]">
                          No donors available
                        </p>

                        <p className="mx-auto mt-2 max-w-[360px] text-[13px] leading-5 text-black/45">
                          There are currently no active donors
                          available for donation requests.
                        </p>
                      </div>
                    </div>
                  ) : filteredDonors.length === 0 ? (
                    <div className="grid min-h-[330px] place-items-center rounded-[20px] border border-white/70 bg-white/50 px-8 text-center">
                      <div>
                        <Search
                          size={25}
                          className="mx-auto text-[#2458E8]"
                        />

                        <p className="mt-4 text-[17px] font-black text-[#172033]">
                          No matching donors
                        </p>

                        <p className="mt-2 text-[13px] text-black/45">
                          Try another name, location or country.
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setCountryFilter("all");
                          }}
                          className="mt-4 text-[13px] font-bold text-[#2458E8]"
                        >
                          Clear filters
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 xl:gap-5">
                      {filteredDonors.map((donor) => (
                        <DesktopDonorCard
                          key={donor.id}
                          donor={donor}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MobileDonorCard({
  donor,
}: {
  donor: Donor;
}) {
  return (
    <article className="flex min-h-[82px] items-center gap-3 rounded-[7px] bg-[#eef5ff] px-2 py-2 shadow-sm">
      <div className="relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[5px] bg-white">
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

function DesktopDonorCard({
  donor,
}: {
  donor: Donor;
}) {
  const location = [donor.address, donor.country]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="group overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_10px_28px_rgba(31,54,89,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(31,54,89,0.12)]">
      <div className="flex gap-4 p-4 xl:p-5">
        <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[17px] bg-[#EFF5FF]">
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
  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
/>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-[#EAFBF0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#25814A]">
                Active donor
              </span>

              <h3 className="mt-2 truncate text-[20px] font-black tracking-[-0.015em] text-[#172033]">
                {donor.full_name}
              </h3>
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-[12px] leading-[18px] text-[#606A7B]">
            {getDonorDescription(donor)}
          </p>

          {location && (
            <p className="mt-2 flex items-center gap-1.5 truncate text-[11px] font-medium text-black/40">
              <MapPin
                size={13}
                className="shrink-0"
              />
              {location}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black/[0.06] bg-[#FAFCFF] px-5 py-3.5">
        <span className="text-[11px] font-semibold text-black/35">
          ZentraBank philanthropist
        </span>

        <Link
          href={`/donations-gift/donations/donationrequest?donor=${encodeURIComponent(
            donor.id,
          )}`}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-[#2458E8] px-4 text-[12px] font-bold text-white shadow-[0_7px_16px_rgba(36,88,232,0.22)] transition hover:bg-[#1d49c6]"
        >
          Request donation
          <Plus size={14} />
        </Link>
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
