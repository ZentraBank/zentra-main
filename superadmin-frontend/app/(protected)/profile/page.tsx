import PageHeader from "@/components/shared/PageHeader";

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Account" title="Superadmin profile" description="Manage your identity, password, two-factor authentication, and active sessions." />
      <div className="mt-6 rounded-[28px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
        <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2458e8] text-xl font-black text-white">SA</div><div><p className="text-xl font-black">Super Admin</p><p className="text-sm text-slate-500">superadmin@zentrabank.com</p></div></div>
      </div>
    </main>
  );
}
