import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <section className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">404</p>
        <h1 className="mt-3 text-4xl font-semibold">Page not found</h1>
        <Link href="/dashboard" className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Return to dashboard</Link>
      </section>
    </main>
  );
}
