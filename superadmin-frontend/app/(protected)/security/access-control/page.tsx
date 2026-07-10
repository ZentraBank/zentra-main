import PageHeader from "@/components/shared/PageHeader";

const permissions = ["Manage tenants", "Manage administrators", "View users", "Freeze accounts", "Reverse transactions", "Approve payment proofs", "Manage settings", "View audit logs"];

export default function AccessControlPage() {
  return (
    <main className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Security" title="Access control" description="Define role capabilities and restrict privileged operations." />
      <div className="mt-6 rounded-[28px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
        <h2 className="text-xl font-black">Superadmin permissions</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {permissions.map((permission) => <label key={permission} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold"><input type="checkbox" defaultChecked />{permission}</label>)}
        </div>
      </div>
    </main>
  );
}
