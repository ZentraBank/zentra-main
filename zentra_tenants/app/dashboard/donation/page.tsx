"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Edit2,
  Gift,
  HandHeart,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// 1. Define the Donor type so TypeScript knows what to expect
type Donor = {
  id: string;
  fullName: string;
  nationality: string;
  title: string;
  gender: string;
  profileImage: string;
  fundingMethods: string[];
  transactionDate: string;
  major: string;
};

const STORAGE_KEY = "zentra_donors";

const benefits = [
  {
    icon: HandHeart,
    title: "Support verified users",
    text: "Help clients receive funds through secure donation channels.",
  },
  {
    icon: ShieldCheck,
    title: "Verified donor profile",
    text: "Register your profile and become visible to approved clients.",
  },
  {
    icon: Gift,
    title: "Multiple funding methods",
    text: "Donate with crypto, gift card, or direct bank transfer.",
  },
];

export default function DonorPage() {
  const router = useRouter(); 

  // Set up state to hold the saved donors and the currently clicked card
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  // Fetch donors from localStorage when the page loads
  useEffect(() => {
    const storedDonors = localStorage.getItem(STORAGE_KEY);
    if (storedDonors) {
      setDonors(JSON.parse(storedDonors));
    }
  }, []);

  // ADDED: Dynamic Stats calculated from the actual data!
  const dynamicDonorStats = [
    { label: "Active Donors", value: donors.length.toString() },
    { label: "Pending Requests", value: "34" }, // Placeholder for future features
    { label: "Completed Funding", value: "$2.4M" }, // Placeholder for future features
  ];

  // Handle Deleting a donor
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this donor?")) return;

    const updatedDonors = donors.filter((donor) => donor.id !== id);
    setDonors(updatedDonors);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDonors));
    setSelectedDonorId(null);
  };

  // Handle Editing a donor
  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/dashboard/donation/donor/edit/${id}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[430px] flex-col px-4 pb-10 pt-10 md:max-w-[1180px] md:px-10">
        <Link href="/dashboard" className="mb-6 inline-flex text-white hover:text-white/80 transition-colors">
          <ArrowLeft size={20} />
        </Link>

        {/* Hero Section */}
        <section className="grid flex-shrink-0 items-center gap-8 md:grid-cols-[1fr_420px]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[12px] font-bold backdrop-blur-md md:text-sm">
              <Users size={16} />
              Funds Donor Portal
            </div>

            <h1 className="text-[42px] font-black leading-[0.92] tracking-[-1px] text-center md:text-left md:text-[76px]">
              Become a
              <br />
              <span className="text-[#d6c51f]">Funds Donor</span>
            </h1>

            <p className="mx-auto mt-5 max-w-[560px] text-center text-[14px] font-medium leading-[21px] text-white/80 md:mx-0 md:text-left md:text-lg md:leading-7">
              Register as a verified donor and support clients through crypto,
              gift cards, or direct bank transfer.
            </p>

            <Link
              href="/dashboard/donation/donor/register"
              className="mx-auto mt-8 flex h-[50px] w-full max-w-[320px] items-center justify-center gap-3 rounded-[12px] bg-[#2447d8] text-[15px] font-black text-white shadow-xl transition hover:bg-[#1f3fc0] md:mx-0 md:h-[56px]"
            >
              Register Donor
              <ArrowRight size={19} />
            </Link>
          </div>

          {/* Stats Card Section */}
          <div className="rounded-[24px] border border-white/15 bg-white/90 p-4 text-black shadow-2xl backdrop-blur-xl md:p-5">
            <Image
              src={donors.length > 0 ? donors[0].profileImage : "/images/David.png"}
              alt="Donor"
              width={420}
              height={300}
              className="h-[230px] w-full rounded-[18px] object-cover md:h-[280px]"
            />

            {/* Responsive Grid handling the dynamic stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 min-[430px]:grid-cols-3 md:gap-3">
              {dynamicDonorStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col justify-center rounded-[14px] bg-black px-2 py-3 text-center text-white shadow-lg ${
                    index === 2 ? "col-span-2 min-[430px]:col-span-1" : ""
                  }`}
                >
                  <p className="text-[18px] font-black md:text-[22px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-white/70 md:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-8 grid flex-shrink-0 gap-3 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-[18px] border border-white/15 bg-black/55 p-4 backdrop-blur-md transition-all hover:bg-black/70"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2447d8]">
                  <Icon size={19} />
                </div>
                <h3 className="text-[15px] font-black">{benefit.title}</h3>
                <p className="mt-2 text-[12px] leading-[17px] text-white/65 md:text-sm md:leading-5">
                  {benefit.text}
                </p>
              </div>
            );
          })}
        </section>

        {/* Display Registered Donors Grid */}
        {donors.length > 0 && (
          <section className="mt-10 md:mt-16">
            <h2 className="mb-6 text-[22px] font-black text-white md:text-[32px]">
              Registered Donors
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {donors.map((donor) => (
                <div
                  key={donor.id}
                  onClick={() => setSelectedDonorId(donor.id === selectedDonorId ? null : donor.id)}
                  className="relative cursor-pointer overflow-hidden rounded-[20px] border border-white/15 bg-white/5 p-4 shadow-lg backdrop-blur-md transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={donor.profileImage}
                      alt={donor.fullName}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover shadow-md"
                    />
                    <div>
                      <h3 className="text-[16px] font-bold leading-tight text-white truncate max-w-[200px]">
                        {donor.fullName}
                      </h3>
                      <p className="text-[13px] font-medium text-[#d6c51f] truncate max-w-[200px]">
                        {donor.title}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 rounded-[12px] bg-black/40 p-3 text-[12px] text-white/80">
                    <p>
                      <strong className="text-white">Nationality:</strong>{" "}
                      {donor.nationality}
                    </p>
                    <p>
                      <strong className="text-white">Methods:</strong>{" "}
                      {donor.fundingMethods.length > 0
                        ? donor.fundingMethods.join(", ")
                        : "None selected"}
                    </p>
                    <p>
                      <strong className="text-white">Date:</strong>{" "}
                      {donor.transactionDate || "N/A"}
                    </p>
                  </div>

                  {/* The Interactive Overlay UI */}
                  {selectedDonorId === donor.id && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/85 p-4 backdrop-blur-sm transition-all duration-300 animate-in fade-in zoom-in-95">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDonorId(null);
                        }}
                        className="absolute right-3 top-3 p-1 text-white/60 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                      
                      <p className="mb-2 text-[14px] font-bold text-white/90">Manage Donor</p>
                      
                      <div className="flex w-full gap-2">
                        <button
                          onClick={(e) => handleEdit(e, donor.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/20 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-white/30"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, donor.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600/80 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red-600"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}