import AppShell from "@/components/layout/AppShell";

export default function ClientProfilePage() {
  return (
    <AppShell>
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">Client Profile</h1>

        {/* Profile Card */}
        <div className="rounded-2xl bg-blue-600 p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/30" />

            <div>
              <h2 className="text-xl font-bold">Gregory Winter</h2>
              <p className="text-sm">
                An up coming Philanthropist
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Contact Detail</h2>

          <p className="mt-2 text-sm text-gray-600">
            gregorywinter@yahoo.com
          </p>
          <p className="text-sm text-gray-600">
            +272 4748 8487
          </p>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Account Information</h2>

          <p className="mt-2 text-sm">
            Account Number: 827 938 9889
          </p>
          <p className="text-sm">Account Type: Savings</p>
          <p className="text-sm text-yellow-600">
            Status: Dormant
          </p>
        </div>
      </div>
    </AppShell>
  );
}