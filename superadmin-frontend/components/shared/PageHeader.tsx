import Link from "next/link";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-bold text-[#2458e8]">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#14213d]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2458e8] px-5 text-sm font-bold text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
