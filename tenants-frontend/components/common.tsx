export function InlineError({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
      {message}
    </div>
  );
}

export function InlineLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-white/80">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      {label}
    </div>
  );
}
