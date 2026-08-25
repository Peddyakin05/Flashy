import { CalendarClock, Clock } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { getDeadlineLabel, getDeadlineUrgency } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Scannable "days remaining" chip. Colour encodes urgency at a glance:
 * amber = closing within a week, red = closed, neutral = plenty of time.
 * The value is computed at request time (day granularity) so there's no
 * client/server hydration mismatch and no layout shift.
 */
export function DeadlineBadge({
  deadline,
  className,
}: {
  deadline: string | null;
  className?: string;
}) {
  const urgency = getDeadlineUrgency(deadline);
  const label = getDeadlineLabel(deadline);

  const variant: BadgeProps["variant"] =
    urgency === "expired"
      ? "destructive"
      : urgency === "urgent"
        ? "warning"
        : urgency === "none"
          ? "outline"
          : "secondary";

  const Icon = urgency === "none" ? CalendarClock : Clock;

  return (
    <Badge variant={variant} className={cn("font-semibold", className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </Badge>
  );
}
