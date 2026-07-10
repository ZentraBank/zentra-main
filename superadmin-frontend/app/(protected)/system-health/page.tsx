import PageHeader from "@/components/shared/PageHeader";

const services = ["Frontend", "Backend API", "Database", "Authentication", "Email service", "File storage", "Notification service", "Background jobs"];

export default function SystemHealthPage() {
  return (
    <main className="mx-auto max-w-[1200px]">
      <PageHeader eyebrow="Operations" title="System health" description="Monitor the availability of core platform services." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => <article key={service} className="rounded-[22px] bg-white p-5 shadow-[0_14px_35px_rgba(22,54,112,0.08)]"><p className="font-black">{service}</p><p className="mt-3 text-sm font-bold text-green-600">● Operational</p></article>)}
      </div>
    </main>
  );
}
