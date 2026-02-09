import { useState, useEffect, useMemo } from "react";
import { worldBosses, specialAreas, events, allWorlds, BossEntry, SpecialArea, EventEntry } from "@/data/scheduleData";
import { ScheduleHeader } from "@/components/ScheduleHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTime, getTimesStatuses, getRowStatus, getPHHourMin, ScheduleStatus } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";

type UnifiedRow = {
  type: "boss" | "special" | "event";
  name: string;
  subName: string; // map, period, or area label
  world?: string;
  timesDisplay: { label: string; status: ScheduleStatus }[];
  rowStatus: ScheduleStatus;
};

function getEventStatus(event: EventEntry, currentMin: number): ScheduleStatus {
  const start = event.startHour * 60 + event.startMin;
  const end = event.endHour * 60 + event.endMin;
  if (end <= start) {
    if (currentMin >= start || currentMin < end) return "ongoing";
    if (currentMin < start) return "upcoming";
    return "finished";
  }
  if (currentMin >= start && currentMin < end) return "ongoing";
  if (currentMin < start) return "upcoming";
  return "finished";
}

const statusOrder: Record<ScheduleStatus, number> = { ongoing: 0, upcoming: 1, finished: 2 };

const Index = () => {
  const [worldFilter, setWorldFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const searchLower = search.toLowerCase();
  const { hour, min } = getPHHourMin();
  const currentMin = hour * 60 + min;

  const rows = useMemo(() => {
    const result: UnifiedRow[] = [];

    // World bosses
    worldBosses.forEach((b) => {
      if (worldFilter !== "ALL" && b.world !== worldFilter) return;
      if (searchLower && !b.boss.toLowerCase().includes(searchLower) && !b.map.toLowerCase().includes(searchLower)) return;
      const statuses = getTimesStatuses(b.times, currentMin);
      result.push({
        type: "boss",
        name: b.boss,
        subName: b.map,
        world: b.world,
        timesDisplay: b.times.map((t, i) => ({ label: formatTime(t), status: statuses[i] })),
        rowStatus: getRowStatus(statuses),
      });
    });

    // Special areas
    if (worldFilter === "ALL") {
      specialAreas.forEach((a) => {
        if (searchLower && !a.name.toLowerCase().includes(searchLower)) return;
        const statuses = getTimesStatuses(a.times, currentMin);
        result.push({
          type: "special",
          name: a.name,
          subName: "Special Area",
          timesDisplay: a.times.map((t, i) => ({ label: formatTime(t), status: statuses[i] })),
          rowStatus: getRowStatus(statuses),
        });
      });

      // Events
      events.forEach((e) => {
        if (searchLower && !e.name.toLowerCase().includes(searchLower)) return;
        const status = getEventStatus(e, currentMin);
        result.push({
          type: "event",
          name: e.name,
          subName: e.period || "Event",
          timesDisplay: [{ label: e.times, status }],
          rowStatus: status,
        });
      });
    }

    // Sort by status: ongoing → upcoming → finished
    result.sort((a, b) => statusOrder[a.rowStatus] - statusOrder[b.rowStatus]);
    return result;
  }, [worldFilter, searchLower, currentMin]);

  const grouped = useMemo(() => {
    const ongoing = rows.filter((r) => r.rowStatus === "ongoing");
    const upcoming = rows.filter((r) => r.rowStatus === "upcoming");
    const finished = rows.filter((r) => r.rowStatus === "finished");
    return { ongoing, upcoming, finished };
  }, [rows]);

  const renderTable = (items: UnifiedRow[], label: string, status: ScheduleStatus) => {
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
                <th className="text-left px-4 py-2">Schedule</th>
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
                          t.status === "finished" && "text-finished-foreground line-through opacity-60",
                        )}>
                          {t.label}
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
  };

  return (
    <div className="min-h-screen bg-background">
      <ScheduleHeader
        worldFilter={worldFilter}
        setWorldFilter={setWorldFilter}
        search={search}
        setSearch={setSearch}
      />
      <main className="container py-6 space-y-6">
        {renderTable(grouped.ongoing, "Ongoing Now", "ongoing")}
        {renderTable(grouped.upcoming, "Upcoming", "upcoming")}
        {renderTable(grouped.finished, "Finished", "finished")}

        {rows.length === 0 && (
          <p className="text-center text-muted-foreground py-8 font-body text-lg">No entries match your filter.</p>
        )}

        <footer className="text-center py-8 text-muted-foreground text-xs font-body">
          <div className="ornament-line mx-auto w-32 mb-3" />
          MIR4 Schedule Guide · EU Server · All times in PH Time (UTC+8)
        </footer>
      </main>
    </div>
  );
};

export default Index;
