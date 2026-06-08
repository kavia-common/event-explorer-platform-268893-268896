function safeDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

// PUBLIC_INTERFACE
export function formatDateTime(iso: string | null | undefined): string {
  const d = safeDate(iso);
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// PUBLIC_INTERFACE
export function formatDate(iso: string | null | undefined): string {
  const d = safeDate(iso);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

// PUBLIC_INTERFACE
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  const d = safeDate(iso);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// PUBLIC_INTERFACE
export function fromDatetimeLocalValue(v: string): string {
  // datetime-local has no timezone; interpret as local time then convert to ISO.
  const d = new Date(v);
  return d.toISOString();
}
