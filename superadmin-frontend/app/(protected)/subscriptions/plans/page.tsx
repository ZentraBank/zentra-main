import PageHeader from "@/components/shared/PageHeader";

const plans = [
  { name: "Bronze", price: "$10", features: "Core banking access" },
  { name: "Gold", price: "$20", features: "Cards and priority services" },
  { name: "Diamond", price: "$40", features: "All premium services" },
];

export default function PlansPage() {
  return (
    <main className="mx-auto max-w-[1200px]">
      <PageHeader eyebrow="Revenue" title="Subscription plans" description="Control plan pricing, features, visibility, and availability." />
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-[24px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
            <p className="text-sm font-bold text-[#2458e8]">{plan.name}</p>
            <p className="mt-4 text-4xl font-black">{plan.price}</p>
            <p className="mt-3 text-sm text-slate-500">{plan.features}</p>
            <button className="mt-6 h-11 w-full rounded-xl border border-[#2458e8] text-sm font-bold text-[#2458e8]">Edit plan</button>
          </article>
        ))}
      </div>
    </main>
  );
}
