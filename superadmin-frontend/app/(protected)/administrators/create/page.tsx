import PageHeader from "@/components/shared/PageHeader";

export default function CreateAdministratorPage() {
  return (
    <main className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Access management" title="Create administrator" description="Create an administrator, assign a tenant, role, and permissions." />
      <form className="mt-6 rounded-[28px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)] sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          {["First name", "Last name", "Email", "Phone", "Tenant", "Role"].map((field) => (
            <label key={field}>
              <span className="text-sm font-bold text-slate-700">{field}</span>
              <input placeholder={field} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#2458e8]" />
            </label>
          ))}
        </div>
        <label className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold">
          <input type="checkbox" defaultChecked /> Require two-factor authentication
        </label>
        <button type="button" className="mt-7 h-12 rounded-xl bg-[#2458e8] px-7 text-sm font-bold text-white">Create administrator</button>
      </form>
    </main>
  );
}
