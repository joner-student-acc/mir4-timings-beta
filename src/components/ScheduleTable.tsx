import { StatusBadge } from "@/components/StatusBadge";
import { ScheduleStatus } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { UnifiedRow } from "@/types/schedule";

interface Props {
  items: UnifiedRow[];
  label: string;
  status: ScheduleStatus;
}

export function ScheduleTable({ items, label, status }: Props) {
  if (items.length === 0) return null;

  // For upcoming table, find the single globally-next time across all rows
  let nextRowIdx = -1;
  let nextTimeIdx = -1;
  let earliestMin = Infinity;
  if (status === "upcoming") {
    items.forEach((row, ri) => {
      row.timesDisplay.forEach((t, ti) => {
        if (t.status === "upcoming") {
          // Parse the label to get approximate minutes for comparison
          const match = t.label.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (match) {
            let h = parseInt(match[1]);
            const m = parseInt(match[2]);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && h !== 12) h += 12;
            if (ampm === "AM" && h === 12) h = 0;
            const mins = h * 60 + m;
            if (mins < earliestMin) {
              earliestMin = mins;
              nextRowIdx = ri;
              nextTimeIdx = ti;
            }
          }
        }
      });
    });
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
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Location</th>
              <th className="text-left px-4 py-2 hidden md:table-cell whitespace-nowrap">Map</th>
              <th className="text-left px-4 py-2 w-[40%]">Your Time</th>
              <th className="text-left px-4 py-2 hidden lg:table-cell lg:w-[30%]">Server Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => {
              const parseLabelToMin = (label: string) => {
                const m = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (!m) return 0;
                let hh = parseInt(m[1], 10);
                const mm = parseInt(m[2], 10);
                const ampm = m[3].toUpperCase();
                if (ampm === "PM" && hh !== 12) hh += 12;
                if (ampm === "AM" && hh === 12) hh = 0;
                return hh * 60 + mm;
              };

              // sort Your Time starting from 6:00 AM (wraps around)
              const startBase = 6 * 60;
              const yourTimes = row.timesDisplay.slice().sort((a, b) => {
                const aa = (parseLabelToMin(a.label) - startBase + 1440) % 1440;
                const bb = (parseLabelToMin(b.label) - startBase + 1440) % 1440;
                return aa - bb;
              });

              return (
                <tr key={i} className={cn(
                  "border-b border-border/50 transition-colors",
                  row.rowStatus === "ongoing" && "bg-ongoing/5",
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
                <td className="px-4 py-2.5 w-[40%]">
                  <div className="flex flex-wrap gap-1">
                    {yourTimes.map((t, j) => (
                      <span key={j} className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-xs",
                        t.status === "ongoing" && "bg-ongoing/20 text-ongoing-foreground font-bold",
                        // for the upcoming table, highlight the per-row next upcoming time
                        status === "upcoming" && t.status === "upcoming" && t.isNext && "bg-upcoming/30 font-bold ring-1 ring-upcoming/50",
                        !t.isNext && t.status === "upcoming" && "bg-upcoming/15 text-upcoming-foreground font-semibold",
                        t.status === "finished" && "bg-upcoming/15 font-semibold",
                      )}>
                        {(status === "upcoming" && t.status === "upcoming" && t.isNext) && <span className="mr-0.5">▶</span>}
                        {t.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell lg:w-[30%]">
                  <div className="flex flex-wrap gap-1">
                    {row.timesDisplay.map((t, j) => (
                      <span key={j} className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-xs",
                        t.status === "ongoing" && "bg-ongoing/20 text-ongoing-foreground font-bold",
                        status === "upcoming" && t.status === "upcoming" && t.isNext && "bg-upcoming/30 font-bold ring-1 ring-upcoming/50",
                        !t.isNext && t.status === "upcoming" && "text-upcoming-foreground font-semibold opacity-30",
                        t.status === "finished" && "text-upcoming-foreground opacity-30 font-semibold",
                      )}>
                        {t.serverLabel}
                      </span>
                    ))}
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
