import { BossEntry } from "@/data/scheduleData";
import { formatTime, getTimesStatuses, getRowStatus, getPHHourMin, toMinutes } from "@/lib/timeUtils";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface Props {
  world: string;
  bosses: BossEntry[];
}

export function WorldBossSection({ world, bosses }: Props) {
  const { hour, min } = getPHHourMin();
  const currentMin = hour * 60 + min;

  return (
    <div className="card-border rounded-lg overflow-hidden bg-card">
      <div className="bg-secondary px-4 py-2 border-b border-border">
        <h2 className="font-display font-bold text-gold tracking-wider text-lg">{world}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-display text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2">Boss</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Map</th>
              <th className="text-left px-4 py-2">Spawn Times</th>
              <th className="text-center px-4 py-2 w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {bosses.map((boss, i) => {
              const statuses = getTimesStatuses(boss.times, currentMin);
              const rowStatus = getRowStatus(statuses);

              return (
                <tr
                  key={`${boss.boss}-${i}`}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    rowStatus === "ongoing" && "bg-ongoing/5",
                    rowStatus === "upcoming" && i === 0 ? "" : ""
                  )}
                >
                  <td className="px-4 py-2.5 font-semibold text-foreground">
                    {boss.boss}
                    <span className="block sm:hidden text-xs text-muted-foreground font-normal">{boss.map}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{boss.map}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {boss.times.map((t, j) => {
                        const s = statuses[j];
                        return (
                          <span
                            key={j}
                            className={cn(
                              "inline-block px-1.5 py-0.5 rounded text-xs",
                              s === "ongoing" && "bg-ongoing/20 text-ongoing-foreground font-bold",
                              s === "upcoming" && j === statuses.indexOf("upcoming") && "bg-upcoming/15 text-upcoming-foreground font-semibold",
                              s === "finished" && "text-finished-foreground line-through opacity-60"
                            )}
                          >
                            {formatTime(t)}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <StatusBadge status={rowStatus} />
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
