import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { ArrowLeft, Share2, FileText, ShieldCheck } from "lucide-react";

export default function ClientProfilePage() {
  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/clients"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-tenant"
        >
          <ArrowLeft size={16} />
          Back to clients
        </Link>

        <h1 className="text-2xl font-bold">Client Profile</h1>
        <p className="text-sm text-gray-500">
          View client identity, contact details, and account information.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl bg-tenant p-6 text-white shadow-sm xl:col-span-1">
          <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-4xl font-bold">
            G
          </div>

          <h2 className="text-center text-2xl font-bold">Gregory Winter</h2>
          <p className="mt-2 text-center text-sm text-white/80">
            An upcoming philanthropist
          </p>

          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900">
            Share Profile
            <Share2 size={16} />
          </button>
        </div>

        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold">Contact Detail</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Email" value="gregorywinter@yahoo.com" />
              <Info label="Phone" value="+272 4748 8487" />
              <Info
                label="Address"
                value="No. 3 Cooker Street, Melbourne Washington DC, USA"
              />
              <Info label="Nationality" value="American" />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold">Account Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Account Number" value="827 938 9889" />
              <Info label="Account Type" value="Savings" />
              <Info label="Account Status" value="Dormant" warning />
              <Info label="Date of Account Creation" value="Mon. 14 May, 2026" />
              <Info label="KYC / Identity Verification" value="Passport" />
              <Info label="Government-issued ID" value="XXX-XXX" />
              <Info label="Verification Status" value="Pending" warning />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-tenant px-4 py-3 text-sm font-semibold text-white">
                <FileText size={16} />
                View Documents
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">
                <ShieldCheck size={16} />
                Verify Client
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold">Security Settings</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Username" value="gregorywinter" />
              <Info label="Password" value="Already Set" />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">
                Change Username
              </button>

              <button className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">
                Change Option
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Info({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold ${
          warning ? "text-yellow-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}