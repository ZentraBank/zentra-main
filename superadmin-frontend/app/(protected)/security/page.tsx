import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-[1200px]">
      <PageHeader eyebrow="Platform protection" title="Security" description="Monitor failed logins, risky sessions, 2FA adoption, and access controls." />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Link href="/security/sessions" className="rounded-[24px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <p className="text-xl font-black">Active sessions</p>
          <p className="mt-2 text-sm text-slate-500">Inspect and revoke active user and administrator sessions.</p>
        </Link>
        <Link href="/security/access-control" className="rounded-[24px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <p className="text-xl font-black">Access control</p>
          <p className="mt-2 text-sm text-slate-500">Manage roles, permissions, and privileged operations.</p>
        </Link>
      </div>
    </main>
  );
}
