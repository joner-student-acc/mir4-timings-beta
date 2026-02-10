import { useState, useEffect, useMemo } from "react";
import { worldBosses, specialAreas, events, EventEntry } from "@/data/scheduleData";
import { ScheduleHeader } from "@/components/ScheduleHeader";
import { ScheduleTable } from "@/components/ScheduleTable";
import {
  convertTime, formatTime, getTimesStatuses, getRowStatus,
  getServerTime, ScheduleStatus, ServerRegion, servers, formatUtcOffset,
  AUTO_DETECT_VALUE, detectLocalUtcOffset,
} from "@/lib/timeUtils";

/** Schedule data is stored in ASIA (UTC+8) times. */
const DATA_OFFSET = 8;

export type UnifiedRow = {
  type: "boss" | "special" | "event";
  name: string;
  subName: string;
  world?: string;
  timesDisplay: { label: string; serverLabel?: string; status: ScheduleStatus }[];
  rowStatus: ScheduleStatus;
};

function getEventStatus(event: EventEntry, currentMin: number, viewOffset: number): ScheduleStatus {
  const diff = viewOffset - DATA_OFFSET;
  const startH = ((event.startHour + diff) * 60 + event.startMin);
  const endH = ((event.endHour + diff) * 60 + event.endMin);
  const start = ((startH % 1440) + 1440) % 1440;
  const end = ((endH % 1440) + 1440) % 1440;

  if (end <= start) {
    if (currentMin >= start || currentMin < end) return "ongoing";
    if (currentMin < start) return "upcoming";
    return "finished";
  }
  if (currentMin >= start && currentMin < end) return "ongoing";
  if (currentMin < start) return "upcoming";
  return "finished";
}

function formatEventTimes(event: EventEntry, viewOffset: number, serverOffset: number): { label: string; serverLabel: string } {
  const fmt = (h: number, m: number) => {
    const hh = ((h % 24) + 24) % 24;
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const viewDiff = viewOffset - DATA_OFFSET;
  const serverDiff = serverOffset - DATA_OFFSET;

  const vStartH = event.startHour + viewDiff;
  const vEndH = event.endHour + viewDiff;
  const sStartH = event.startHour + serverDiff;
  const sEndH = event.endHour + serverDiff;

  const isPoint = event.startHour === event.endHour && event.startMin === event.endMin;

  const label = isPoint
    ? fmt(vStartH, event.startMin)
    : `${fmt(vStartH, event.startMin)} – ${fmt(vEndH, event.endMin)}`;

  const serverLabel = isPoint
    ? fmt(sStartH, event.startMin)
    : `${fmt(sStartH, event.startMin)} – ${fmt(sEndH, event.endMin)}`;

  return { label, serverLabel };
}

const statusOrder: Record<ScheduleStatus, number> = { ongoing: 0, upcoming: 1, finished: 2 };

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

const Index = () => {
  const [worldFilter, setWorldFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [server, setServer] = useState<ServerRegion>(() => loadFromStorage("mir4-server", "ASIA"));
  const [viewingMode, setViewingMode] = useState<string>(() => loadFromStorage("mir4-viewing-mode", AUTO_DETECT_VALUE));
  const [viewingOffset, setViewingOffset] = useState<number>(() => {
    const mode = loadFromStorage("mir4-viewing-mode", AUTO_DETECT_VALUE);
    if (mode === AUTO_DETECT_VALUE) return detectLocalUtcOffset();
    return loadFromStorage("mir4-viewing-offset", 8);
  });
  const [, setTick] = useState(0);
  useEffect(() => {
    localStorage.setItem("mir4-server", JSON.stringify(server));
  }, [server]);

  useEffect(() => {
    localStorage.setItem("mir4-viewing-offset", JSON.stringify(viewingOffset));
    localStorage.setItem("mir4-viewing-mode", JSON.stringify(viewingMode));
  }, [viewingOffset, viewingMode]);
  }, [viewingOffset]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const serverOffset = servers[server].utcOffset;
  const searchLower = search.toLowerCase();
  const { hour, min } = getServerTime(viewingOffset);
  const currentMin = hour * 60 + min;

  const rows = useMemo(() => {
    const result: UnifiedRow[] = [];

    worldBosses.forEach((b) => {
      if (worldFilter !== "ALL" && b.world !== worldFilter) return;
      if (searchLower && !b.boss.toLowerCase().includes(searchLower) && !b.map.toLowerCase().includes(searchLower)) return;

      // Convert from DATA_OFFSET to viewing offset for display & status
      const convertedView = b.times.map((t) => convertTime(t, DATA_OFFSET, viewingOffset));
      const convertedServer = b.times.map((t) => convertTime(t, DATA_OFFSET, serverOffset));
      const statuses = getTimesStatuses(convertedView, currentMin);

      result.push({
        type: "boss",
        name: b.boss,
        subName: b.map,
        world: b.world,
        timesDisplay: convertedView.map((t, i) => ({
          label: formatTime(t),
          serverLabel: formatTime(convertedServer[i]),
          status: statuses[i],
        })),
        rowStatus: getRowStatus(statuses),
      });
    });

    if (worldFilter === "ALL") {
      specialAreas.forEach((a) => {
        if (searchLower && !a.name.toLowerCase().includes(searchLower)) return;
        const convertedView = a.times.map((t) => convertTime(t, DATA_OFFSET, viewingOffset));
        const convertedServer = a.times.map((t) => convertTime(t, DATA_OFFSET, serverOffset));
        const statuses = getTimesStatuses(convertedView, currentMin);
        result.push({
          type: "special",
          name: a.name,
          subName: "Special Area",
          timesDisplay: convertedView.map((t, i) => ({
            label: formatTime(t),
            serverLabel: formatTime(convertedServer[i]),
            status: statuses[i],
          })),
          rowStatus: getRowStatus(statuses),
        });
      });

      events.forEach((e) => {
        if (searchLower && !e.name.toLowerCase().includes(searchLower)) return;
        const status = getEventStatus(e, currentMin, viewingOffset);
        const { label, serverLabel } = formatEventTimes(e, viewingOffset, serverOffset);
        result.push({
          type: "event",
          name: e.name,
          subName: e.period || "Event",
          timesDisplay: [{ label, serverLabel, status }],
          rowStatus: status,
        });
      });
    }

    result.sort((a, b) => statusOrder[a.rowStatus] - statusOrder[b.rowStatus]);
    return result;
  }, [worldFilter, searchLower, currentMin, viewingOffset, serverOffset]);

  const grouped = useMemo(() => ({
    ongoing: rows.filter((r) => r.rowStatus === "ongoing"),
    upcoming: rows.filter((r) => r.rowStatus === "upcoming"),
    finished: rows.filter((r) => r.rowStatus === "finished"),
  }), [rows]);

  return (
    <div className="min-h-screen bg-background">
      <ScheduleHeader
        worldFilter={worldFilter}
        setWorldFilter={setWorldFilter}
        search={search}
        setSearch={setSearch}
        server={server}
        setServer={setServer}
        viewingOffset={viewingOffset}
        setViewingOffset={setViewingOffset}
        viewingMode={viewingMode}
        setViewingMode={setViewingMode}
      />
      <main className="container py-6 space-y-6">
        <ScheduleTable items={grouped.ongoing} label="Ongoing Now" status="ongoing" />
        <ScheduleTable items={grouped.upcoming} label="Upcoming" status="upcoming" />
        <ScheduleTable items={grouped.finished} label="Finished" status="finished" />

        {rows.length === 0 && (
          <p className="text-center text-muted-foreground py-8 font-body text-lg">No entries match your filter.</p>
        )}

        <footer className="text-center py-8 text-muted-foreground text-xs font-body">
          <div className="ornament-line mx-auto w-32 mb-3" />
          MIR4 Timing Guide · {servers[server].label} → {formatUtcOffset(viewingOffset)} · All times converted
        </footer>
      </main>
    </div>
  );
};

export default Index;
