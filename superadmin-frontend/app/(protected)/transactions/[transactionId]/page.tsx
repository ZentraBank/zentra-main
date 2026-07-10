import PageHeader from "@/components/shared/PageHeader";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;

  return (
    <main className="mx-auto max-w-[1200px]">
      <PageHeader eyebrow="Transaction record" title="Transaction details" description={`Viewing record: ${transactionId}`} />
      <div className="mt-6 rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
        <p className="text-sm text-slate-500">Connect this page to the transactions detail endpoint.</p>
      </div>
    </main>
  );
}
