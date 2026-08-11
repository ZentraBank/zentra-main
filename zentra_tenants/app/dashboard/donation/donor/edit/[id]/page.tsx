"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronDown,
  Save,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
const fundingOptions = ["Cryptocurrency", "Gift card", "Direct bank transfer"];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const years = ["2024", "2025", "2026", "2027", "2028"];

export default function EditDonorPage() {
  const router = useRouter();
  const params = useParams(); // Gets the [id] from the URL
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileImage, setProfileImage] = useState("/images/David.png");
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("");
  const [title, setTitle] = useState("");
  const [gender, setGender] = useState("Male");
  const [fundingMethods, setFundingMethods] = useState<string[]>([]);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");

  // Load the donor's existing data when the page loads
  useEffect(() => {
    if (!params.id) return;

    const storedDonors = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Donor[];
    const donorToEdit = storedDonors.find((d) => d.id === params.id);

    if (donorToEdit) {
      setProfileImage(donorToEdit.profileImage);
      setFullName(donorToEdit.fullName);
      setNationality(donorToEdit.nationality);
      setTitle(donorToEdit.title);
      setGender(donorToEdit.gender);
      setFundingMethods(donorToEdit.fundingMethods);
      setMajor(donorToEdit.major);

      // Split the transaction date back into day, month, year
      if (donorToEdit.transactionDate) {
        const [d, m, y] = donorToEdit.transactionDate.split(" ");
        if (d) setDay(d);
        if (m) setMonth(m);
        if (y) setYear(y);
      }
    } else {
      // If someone types a random ID in the URL, send them back
      router.push("/dashboard/donation");
    }
  }, [params.id, router]);

  const toggleFundingMethod = (method: string) => {
    setFundingMethods((prev) =>
      prev.includes(method)
        ? prev.filter((item) => item !== method)
        : [...prev, method]
    );
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateDonor = () => {
    const storedDonors = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Donor[];
    
    // Map through existing donors and update the one that matches our ID
    const updatedDonors = storedDonors.map((donor) => {
      if (donor.id === params.id) {
        return {
          ...donor,
          fullName,
          nationality,
          title,
          gender,
          profileImage,
          fundingMethods,
          transactionDate: `${day} ${month} ${year}`.trim(),
          major,
        };
      }
      return donor;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDonors));
    router.push("/dashboard/donation");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Image src="/images/Background_1.png" alt="Background" fill priority className="object-cover" />

      <div className="relative z-10 mx-auto min-h-screen max-w-[430px] px-3 pb-10 pt-10 md:max-w-[1180px] md:px-10">
        <Link href="/dashboard/donation" className="mb-4 inline-flex text-white">
          <ArrowLeft size={18} />
        </Link>

        <p className="mb-4 text-center text-[12px] font-bold md:text-base">
          Update Donor Profile
        </p>

        <h1 className="text-center text-[35px] font-black leading-[0.92] tracking-[-1px] md:text-[68px]">
          Edit <span className="underline underline-offset-4 text-[#d6c51f]">Funds Donator</span>
        </h1>

        <section className="mx-auto mt-6 grid max-w-[980px] gap-4 md:mt-10 md:grid-cols-[360px_1fr]">
          <div className="rounded-xl bg-white p-3 text-black/90 md:p-4">
            <h2 className="mb-3 text-[13px] font-black pt-4">Editable Donor Profile</h2>
            <div className="grid grid-cols-[96px_1fr] gap-3 md:grid-cols-1">
              <div className="relative">
                <Image
                  src={profileImage}
                  alt="Donor profile"
                  width={300}
                  height={300}
                  className="h-[200px] w-[200px] rounded-[9px] object-cover md:h-[230px] md:w-full md:rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full !bg-[#2447d8] text-white"
                >
                  <Camera size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />
              </div>

              <div className="rounded-lg border border-blue-700 p-2 md:mt-3">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-md border border-blue-200 px-2 py-2 text-[18px] font-black outline-none md:text-2xl"
                />
                <div className="mt-3 rounded-lg bg-black p-3 text-white">
                  <input
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Nationality"
                    className="mb-2 w-full rounded-md bg-white px-2 py-2 text-[13px] text-black outline-none"
                  />
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Donor title"
                    className="mb-2 w-full rounded-md bg-white px-2 py-2 text-[13px] text-black outline-none"
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-md bg-white px-2 py-2 text-[13px] text-black outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg bg-white p-2 text-black md:rounded-2xl md:p-5">
            <section className="flex-1 rounded-lg bg-[#a7a7a7] p-2 md:p-4">
              <h2 className="mb-3 text-[14px] font-black">Fill-in Your Funds Donator Information</h2>
              <div className="rounded-lg bg-gray-100 p-3">
                <div className="mb-2 flex items-center justify-between text-[12px]">
                  <span>Preferred means of funding</span>
                  <ChevronDown size={14} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {fundingOptions.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => toggleFundingMethod(method)}
                      className={`h-[28px] rounded-md px-3 text-left text-[12px] transition ${
                        fundingMethods.includes(method) ? "!bg-[#2447d8] text-white" : "!bg-white !text-black"
                      } ${method === "Direct bank transfer" ? "col-span-2" : ""}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <label className="mt-4 block text-[12px] font-black text-gray-700">Transaction date</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <select value={day} onChange={(e) => setDay(e.target.value)} className="h-[34px] rounded-lg bg-white px-3 text-[12px] outline-none">
                  <option value="">Day</option>
                  {days.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="h-[34px] rounded-lg bg-white px-3 text-[12px] outline-none">
                  <option value="">Month</option>
                  {months.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="h-[34px] rounded-lg bg-white px-3 text-[12px] outline-none">
                  <option value="">Year</option>
                  {years.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>

              <label className="mt-4 block text-[12px] font-black text-gray-700">Your major</label>
              <textarea
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Tell our website users who you are."
                className="mt-1 min-h-[140px] w-full resize-none rounded-lg bg-white p-3 text-[13px] text-black outline-none md:min-h-[190px]"
              />
            </section>
          </div>
        </section>

        <div className="mt-8 flex justify-center md:mt-12">
          <button
            type="button"
            onClick={handleUpdateDonor}
            className="flex h-[45px] w-[300px] max-w-full items-center justify-center gap-3 rounded-lg !bg-[#2447d8] text-[15px] font-bold text-white transition-transform hover:scale-105 active:scale-95 md:h-14 md:w-[400px]"
          >
            <Save size={18} />
            Update Donor
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </main>
  );
}