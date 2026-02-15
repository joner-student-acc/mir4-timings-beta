import { StatusBadge } from "@/components/StatusBadge";
import { ScheduleStatus } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { UnifiedRow } from "@/types/schedule";

interface Props {
  items: UnifiedRow[];
  label: string;
  status: ScheduleStatus;
  currentMin: number;
}

export function ScheduleTable({ items, label, status, currentMin }: Props) {
  if (items.length === 0) return null;

  const parseLabelToMin = (label: string): number | null => {
    const match = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  // For upcoming table, find the single globally-next time across all rows (after conversion)
  let nextDelta = Infinity;
  if (status === "upcoming") {
    items.forEach((row) => {
      row.timesDisplay.forEach((t) => {
        if (t.status !== "upcoming") return;
        const mins = parseLabelToMin(t.label);
        if (mins === null) return;
        const delta = ((mins - currentMin) % 1440 + 1440) % 1440;
        if (delta > 0 && delta < nextDelta) nextDelta = delta;
      });
    });
  }
  const hasGlobalNext = Number.isFinite(nextDelta);

  // Find the last row index that contains the global next time
  let lastRowWithNext = -1;
  if (status === "upcoming" && hasGlobalNext) {
    for (let i = items.length - 1; i >= 0; i--) {
      const hasNext = items[i].timesDisplay.some((t) => {
        if (t.status !== "upcoming") return false;
        const mins = parseLabelToMin(t.label);
        if (mins === null) return false;
        const delta = ((mins - currentMin) % 1440 + 1440) % 1440;
        return delta > 0 && delta === nextDelta;
      });
      if (hasNext) {
        lastRowWithNext = i;
        break;
      }
    }
  }

  return (
    <div className="card-border rounded-lg overflow-hidden bg-card">
      <div className={cn(
        "px-4 py-2.5 border-b border-border flex items-center gap-3",
        status === "ongoing" && "bg-ongoing/10",
        status === "upcoming" && "bg-upcoming/10",
        status === "finished" && "bg-secondary",
      )}>
        <h2 className="font-display font-bold text-gold tracking-wider text-lg">{label}</h2>
        <StatusBadge status={status} />
        <span className="text-xs text-muted-foreground ml-auto font-body">{items.length} entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-display text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2 w-[14%]">Name</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell w-[14%]">Location</th>
              <th className="text-left px-4 py-2 hidden md:table-cell whitespace-nowrap w-[12%]">Map</th>
              <th className="text-left px-4 py-2 w-[30%]">Your Time</th>
              <th className="text-left px-4 py-2 hidden lg:table-cell w-[30%]">Server Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => {
              // sort Your Time starting from 6:00 AM (wraps around)
              const startBase = 6 * 60;
              const yourTimes = row.timesDisplay.slice().sort((a, b) => {
                const aa = ((parseLabelToMin(a.label) ?? 0) - startBase + 1440) % 1440;
                const bb = ((parseLabelToMin(b.label) ?? 0) - startBase + 1440) % 1440;
                return aa - bb;
              });

              return (
                <tr key={i} className={cn(
                  "border-b border-border/50 transition-colors",
                  row.rowStatus === "ongoing" && "bg-ongoing/5",
                  status === "upcoming" && i === lastRowWithNext && "border-b-2 border-b-upcoming/60",
                )}>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {row.name}
                  <span className="block sm:hidden text-xs text-muted-foreground font-normal">{row.subName}</span>
                  {row.world && <span className="block sm:hidden text-xs text-muted-foreground font-normal">{row.world}</span>}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                  {row.subName}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                  {row.world ? (
                    <span className="font-display text-s font-semibold text-gold-dark">{row.world}</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-2.5 w-[30%]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                    {yourTimes.map((t, j) => {
                      const mins = parseLabelToMin(t.label);
                      const delta = mins === null ? Infinity : ((mins - currentMin) % 1440 + 1440) % 1440;
                      const highlightFuture = status === "upcoming" && delta > 0;
                      const isGlobalNext = status === "upcoming"
                        && t.status === "upcoming"
                        && hasGlobalNext
                        && delta > 0
                        && delta === nextDelta;

                      return (
                        <span key={j} className={cn(
                          "inline-block px-1.5 py-0.5 rounded text-xs text-center",
                          t.status === "ongoing" && "bg-ongoing/20 text-ongoing-foreground font-bold",
                          status === "upcoming" && isGlobalNext && "bg-upcoming/30 font-bold ring-1 ring-upcoming/50",
                          (!isGlobalNext && t.status === "upcoming") && (status === "upcoming" ? "bg-upcoming/30 text-upcoming-foreground font-semibold" : "bg-upcoming/15 text-upcoming-foreground font-semibold"),
                          t.status === "finished" && (highlightFuture ? "bg-upcoming/15 text-upcoming-foreground font-semibold" : "bg-upcoming/15 font-semibold"),
                        )}>
                          {isGlobalNext && <span className="mr-0.5">▶</span>}
                          {t.label}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell w-[30%]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                    {yourTimes.map((t, j) => {
                      const mins = parseLabelToMin(t.label);
                      const delta = mins === null ? Infinity : ((mins - currentMin) % 1440 + 1440) % 1440;
                      const isGlobalNext = status === "upcoming"
                        && t.status === "upcoming"
                        && hasGlobalNext
                        && delta > 0
                        && delta === nextDelta;

                      return (
                        <span key={j} className={cn(
                          "inline-block px-1.5 py-0.5 rounded text-xs text-center",
                          t.status === "ongoing" && "bg-ongoing/20 text-ongoing-foreground font-bold",
                          status === "upcoming" && isGlobalNext && "bg-upcoming/30 font-bold ring-1 ring-upcoming/50",
                          !isGlobalNext && t.status === "upcoming" && (status === "upcoming" ? "bg-upcoming/30 text-upcoming-foreground font-semibold" : "text-upcoming-foreground font-semibold opacity-30"),
                          t.status === "finished" && "text-upcoming-foreground opacity-30 font-semibold",
                        )}>
                          {t.serverLabel}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
