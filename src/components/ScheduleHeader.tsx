import { allWorlds } from "@/data/scheduleData";
import { getPHTime } from "@/lib/timeUtils";
import { useEffect, useState } from "react";

interface Props {
  worldFilter: string;
  setWorldFilter: (w: string) => void;
  search: string;
  setSearch: (s: string) => void;
}

export function ScheduleHeader({ worldFilter, setWorldFilter, search, setSearch }: Props) {
  const [clock, setClock] = useState(getPHTime());

  useEffect(() => {
    const interval = setInterval(() => setClock(getPHTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = clock.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-gold gold-glow tracking-wide">
              MIR4 Schedule Guide
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              EU Server · PH Time:{" "}
              <span className="text-gold-light font-semibold">{timeStr}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={worldFilter}
              onChange={(e) => setWorldFilter(e.target.value)}
              className="bg-secondary text-secondary-foreground border border-border rounded px-3 py-1.5 text-sm font-display focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Worlds</option>
              {allWorlds.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search boss or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-secondary text-secondary-foreground border border-border rounded px-3 py-1.5 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-48"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
