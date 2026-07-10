import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4ff] p-5 text-center">
      <div className="max-w-md rounded-[28px] bg-white p-8 shadow-xl">
        <p className="text-sm font-bold text-red-600">Access denied</p>
        <h1 className="mt-2 text-3xl font-black">Unauthorized</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Your account does not have permission to access this Superadmin resource.</p>
        <Link href="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2458e8] px-5 text-sm font-bold text-white">Return to login</Link>
      </div>
    </main>
  );
}
