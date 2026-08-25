/**
 * Pure date/number formatting helpers. All countdown math is deterministic and
 * runs at request time on the server (days-granularity — no live ticking), so
 * there is no client/server hydration mismatch and no layout shift.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type DeadlineUrgency = "expired" | "urgent" | "soon" | "open" | "none";

/** Whole days until `deadline` (negative if past). `null` when no deadline. */
export function getDaysRemaining(
  deadline: string | null,
  now: Date = new Date(),
): number | null {
  if (!deadline) return null;
  const end = new Date(deadline).getTime();
  if (Number.isNaN(end)) return null;
  // Compare at day granularity from the start of "today".
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.ceil((end - startOfToday) / MS_PER_DAY);
}

export function getDeadlineUrgency(
  deadline: string | null,
  now: Date = new Date(),
): DeadlineUrgency {
  const days = getDaysRemaining(deadline, now);
  if (days === null) return "none";
  if (days < 0) return "expired";
  if (days <= 7) return "urgent";
  if (days <= 30) return "soon";
  return "open";
}

/** Short label for the countdown chip, e.g. "5 days left", "Closes today". */
export function getDeadlineLabel(
  deadline: string | null,
  now: Date = new Date(),
): string {
  const days = getDaysRemaining(deadline, now);
  if (days === null) return "Rolling / no deadline";
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/** e.g. "30 Aug 2026". Locale-stable, avoids CLS from long month names. */
export function formatDeadlineDate(deadline: string | null): string {
  if (!deadline) return "Rolling";
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return "Rolling";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Render CGPA on the 5.0 scale, e.g. "3.50 / 5.0". */
export function formatCgpa(cgpa: number | null): string {
  if (cgpa === null) return "No minimum";
  return `${cgpa.toFixed(2)} / 5.0`;
}
