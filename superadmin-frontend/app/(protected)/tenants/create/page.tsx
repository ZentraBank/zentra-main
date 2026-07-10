import PageHeader from "@/components/shared/PageHeader";

const fields = ["Tenant name", "Tenant code", "Business email", "Country", "Currency", "Primary domain", "Subscription plan", "Initial administrator email"];

export default function CreateTenantPage() {
  return (
    <main className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Tenant onboarding" title="Create tenant" description="Register a new tenant and configure its initial platform access." />
      <form className="mt-6 rounded-[28px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)] sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field} className="block">
              <span className="text-sm font-bold text-slate-700">{field}</span>
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#2458e8]" placeholder={field} />
            </label>
          ))}
        </div>
        <button type="button" className="mt-7 h-12 rounded-xl bg-[#2458e8] px-7 text-sm font-bold text-white">Create tenant</button>
      </form>
    </main>
  );
}
