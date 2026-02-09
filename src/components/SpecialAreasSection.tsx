import { SpecialArea } from "@/data/scheduleData";
import { formatTime, getTimesStatuses, getRowStatus, getPHHourMin } from "@/lib/timeUtils";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

export function SpecialAreasSection({ areas }: { areas: SpecialArea[] }) {
  const { hour, min } = getPHHourMin();
  const currentMin = hour * 60 + min;

  return (
    <div className="card-border rounded-lg overflow-hidden bg-card">
      <div className="bg-secondary px-4 py-2 border-b border-border">
        <h2 className="font-display font-bold text-gold tracking-wider text-lg">Special WB Areas</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground font-display text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-2">Area</th>
            <th className="text-left px-4 py-2">Times</th>
            <th className="text-center px-4 py-2 w-24">Status</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => {
            const statuses = getTimesStatuses(area.times, currentMin);
            const rowStatus = getRowStatus(statuses);
            return (
              <tr key={area.name} className={cn("border-b border-border/50", rowStatus === "ongoing" && "bg-ongoing/5")}>
                <td className="px-4 py-2.5 font-semibold text-foreground">{area.name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {area.times.map((t, j) => {
                      const s = statuses[j];
                      return (
                        <span key={j} className={cn(
                          "inline-block px-1.5 py-0.5 rounded text-xs",
                          s === "ongoing" && "bg-ongoing/20 text-ongoing-foreground font-bold",
                          s === "upcoming" && "bg-upcoming/15 text-upcoming-foreground font-semibold",
                          s === "finished" && "text-finished-foreground line-through opacity-60"
                        )}>
                          {formatTime(t)}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center"><StatusBadge status={rowStatus} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
