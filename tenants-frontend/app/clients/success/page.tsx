import AppShell from "@/components/layout/AppShell";

export default function ClientSuccessPage() {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-green-600 p-6 text-white shadow-xl">
          <h1 className="text-xl font-bold">
            Client Added Successfully
          </h1>

          <p className="mt-3 text-sm">
            Now that you have added this client successfully, you can now
            proceed to manage this client.
          </p>

          <div className="mt-6 rounded-xl bg-white p-4 text-black">
            <p className="text-sm text-gray-500">Account number</p>
            <h2 className="font-bold">827 938 9889</h2>

            <p className="mt-3 text-sm text-gray-500">Account name</p>
            <h2 className="font-bold">Gregory Winter</h2>
          </div>

          <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold">
            Manage client
          </button>
        </div>
      </div>
    </AppShell>
  );
}