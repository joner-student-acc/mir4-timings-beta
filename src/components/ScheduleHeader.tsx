import { allWorlds } from "@/data/scheduleData";
import { getServerDate, ServerRegion, servers } from "@/lib/timeUtils";
import { useEffect, useState } from "react";

interface Props {
  worldFilter: string;
  setWorldFilter: (w: string) => void;
  search: string;
  setSearch: (s: string) => void;
  server: ServerRegion;
  setServer: (s: ServerRegion) => void;
}

export function ScheduleHeader({ worldFilter, setWorldFilter, search, setSearch, server, setServer }: Props) {
  const utcOffset = servers[server].utcOffset;
  const [clock, setClock] = useState(getServerDate(utcOffset));

  useEffect(() => {
    const interval = setInterval(() => setClock(getServerDate(utcOffset)), 1000);
    return () => clearInterval(interval);
  }, [utcOffset]);

  const timeStr = clock.toLocaleTimeString("en-US", {
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
              MIR4 Timing Guide
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              {servers[server].label} · Server Time:{" "}
              <span className="text-gold-light font-semibold">{timeStr}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={server}
              onChange={(e) => setServer(e.target.value as ServerRegion)}
              className="bg-secondary text-secondary-foreground border border-border rounded px-3 py-1.5 text-sm font-display focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {(Object.keys(servers) as ServerRegion[]).map((s) => (
                <option key={s} value={s}>{servers[s].label}</option>
              ))}
            </select>

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
