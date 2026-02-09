import { ScheduleStatus } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";

const labels: Record<ScheduleStatus, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  finished: "Finished",
};

export function StatusBadge({ status, className }: { status: ScheduleStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-display font-semibold tracking-wide uppercase",
        status === "ongoing" && "bg-ongoing/20 text-ongoing-foreground border border-ongoing/40",
        status === "upcoming" && "bg-upcoming/20 text-upcoming-foreground border border-upcoming/40 animate-pulse-gold",
        status === "finished" && "bg-finished/20 text-finished-foreground border border-finished/30",
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
