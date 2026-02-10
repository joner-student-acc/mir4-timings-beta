import { StatusBadge } from "@/components/StatusBadge";
import { ScheduleStatus } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { UnifiedRow } from "@/pages/Index";

interface Props {
  items: UnifiedRow[];
  label: string;
  status: ScheduleStatus;
}

export function ScheduleTable({ items, label, status }: Props) {
  if (items.length === 0) return null;

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
              <th className="text-left px-4 py-2 hidden sm:table-cell">Location / Info</th>
              <th className="text-left px-4 py-2 hidden md:table-cell w-16">World</th>
              <th className="text-left px-4 py-2">Your Time</th>
              <th className="text-left px-4 py-2 hidden lg:table-cell">Server Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i} className={cn(
                "border-b border-border/50 transition-colors",
                row.rowStatus === "ongoing" && "bg-ongoing/5",
              )}>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {row.name}
                  <span className="block sm:hidden text-xs text-muted-foreground font-normal">{row.subName}</span>
                  {row.world && <span className="block sm:hidden text-xs text-muted-foreground font-normal">{row.world}</span>}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{row.subName}</td>
                <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                  {row.world ? (
                    <span className="font-display text-xs font-semibold text-gold-dark">{row.world}</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {row.timesDisplay.map((t, j) => (
                      <span key={j} className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-xs",
                        t.status === "ongoing" && "bg-ongoing/20 text-ongoing-foreground font-bold",
                        t.status === "upcoming" && "bg-upcoming/15 text-upcoming-foreground font-semibold",
                        t.status === "finished" && "text-finished-foreground opacity-60",
                      )}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {row.timesDisplay.map((t, j) => (
                      <span key={j} className="inline-block px-1.5 py-0.5 rounded text-xs text-muted-foreground opacity-70">
                        {t.serverLabel}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
