import type {
  TenantStatus,
} from "@/src/types/tenant";

const classes: Record<TenantStatus, string> = {
  pending:
    "border-amber-400/20 bg-amber-400/10 text-amber-300",
  active:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  suspended:
    "border-orange-400/20 bg-orange-400/10 text-orange-300",
  terminated:
    "border-red-400/20 bg-red-400/10 text-red-300",
};

export function TenantStatusBadge({
  status,
}: {
  status: TenantStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${classes[status]}`}
    >
      {status}
    </span>
  );
}
