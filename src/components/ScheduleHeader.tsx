import { allWorlds } from "@/data/scheduleData";
import { getServerDate, ServerRegion, servers, viewingTimezones, formatUtcOffset, AUTO_DETECT_VALUE, detectLocalUtcOffset } from "@/lib/timeUtils";
import { useEffect, useState } from "react";

interface Props {
  worldFilter: string;
  setWorldFilter: (w: string) => void;
  search: string;
  setSearch: (s: string) => void;
  server: ServerRegion;
  setServer: (s: ServerRegion) => void;
  viewingOffset: number;
  setViewingOffset: (o: number) => void;
  viewingMode: string;
  setViewingMode: (m: string) => void;
}

export function ScheduleHeader({
  worldFilter, setWorldFilter, search, setSearch,
  server, setServer, viewingOffset, setViewingOffset,
  viewingMode, setViewingMode,
}: Props) {
  const viewingTzOffset = viewingOffset;
  const [clock, setClock] = useState(getServerDate(viewingTzOffset));

  useEffect(() => {
    const interval = setInterval(() => setClock(getServerDate(viewingTzOffset)), 1000);
    return () => clearInterval(interval);
  }, [viewingTzOffset]);

  const timeStr = clock.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const viewingLabel = viewingMode === AUTO_DETECT_VALUE
    ? `Auto (${formatUtcOffset(viewingOffset)})`
    : viewingTimezones.find(tz => tz.utcOffset === viewingOffset)?.label ?? formatUtcOffset(viewingOffset);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container py-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-gold gold-glow tracking-wide">
                MIR4 Timing Guide
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                Server Time: <span className="text-gold-light font-semibold">{servers[server].label}</span>
                {" · "}
                Your Time: <span className="text-gold-light font-semibold">{timeStr}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <label className="text-sm uppercase tracking-wider text-muted-foreground font-display">Select Server</label>
              <select
                value={server}
                onChange={(e) => setServer(e.target.value as ServerRegion)}
                className="bg-secondary text-secondary-foreground border border-border rounded px-3 py-1.5 text-sm font-display focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {(Object.keys(servers) as ServerRegion[]).map((s) => (
                  <option key={s} value={s}>{servers[s].label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-sm uppercase tracking-wider text-muted-foreground font-display">Select Viewing Region</label>
              <select
                value={viewingMode}
                onChange={(e) => {
                  const val = e.target.value;
                  setViewingMode(val);
                  if (val === AUTO_DETECT_VALUE) {
                    setViewingOffset(detectLocalUtcOffset());
                  } else {
                    setViewingOffset(parseFloat(val));
                  }
                }}
                className="bg-secondary text-secondary-foreground border border-border rounded px-3 py-1.5 text-sm font-display focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={AUTO_DETECT_VALUE}>Auto (Detect My Timezone)</option>
                {viewingTimezones.map((tz) => (
                  <option key={tz.utcOffset} value={tz.utcOffset}>{tz.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-sm uppercase tracking-wider text-muted-foreground font-display">World</label>
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
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-sm uppercase tracking-wider text-muted-foreground font-display">Search</label>
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
      </div>
    </header>
  );
}
