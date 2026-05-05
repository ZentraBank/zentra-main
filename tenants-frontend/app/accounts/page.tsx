import AppShell from "@/components/layout/AppShell";
import { Wallet } from "lucide-react";

export default function AccountsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-sm text-gray-500">
          View and manage your wallet account.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-tenant/10 text-tenant">
          <Wallet size={24} />
        </div>

        <p className="text-sm text-gray-500">Available Balance</p>
        <h2 className="mt-2 text-3xl font-bold">₦250,000</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Account Number</p>
            <p className="font-semibold">3022222222</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Account Type</p>
            <p className="font-semibold">Wallet</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-semibold text-green-600">Active</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}