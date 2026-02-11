import { useState, useEffect, useMemo } from "react";
import { schedule, EventEntry } from "@/data/scheduleData";
import { ScheduleHeader } from "@/components/ScheduleHeader";
import { ScheduleTable } from "@/components/ScheduleTable";
import {
  convertTime, formatTime, getTimesStatuses, getRowStatus,
  getServerTime, ScheduleStatus, ServerRegion, servers, formatUtcOffset,
  AUTO_DETECT_VALUE, detectLocalUtcOffset,
} from "@/lib/timeUtils";
import type { UnifiedRow } from "@/types/schedule";

function getEventStatus(event: EventEntry, currentMin: number, viewOffset: number, srvOffset: number): ScheduleStatus {
  // Event times are stored as server-local hours. Convert them to viewing
  // timezone and then decide status based on viewing current minutes.
  const pad = (n: number) => String(n).padStart(2, "0");
  const serverStart = `${pad(event.startHour)}:${pad(event.startMin)}`;
  const serverEnd = `${pad(event.endHour)}:${pad(event.endMin)}`;

  const viewStartStr = convertTime(serverStart, srvOffset, viewOffset);
  const viewEndStr = convertTime(serverEnd, srvOffset, viewOffset);
  const start = ((parseInt(viewStartStr.split(":")[0], 10) * 60) + parseInt(viewStartStr.split(":")[1], 10)) % 1440;
  const end = ((parseInt(viewEndStr.split(":")[0], 10) * 60) + parseInt(viewEndStr.split(":")[1], 10)) % 1440;

  if (end <= start) {
    if (currentMin >= start || currentMin < end) return "ongoing";
    if (currentMin < start) return "upcoming";
    return "finished";
  }
  if (currentMin >= start && currentMin < end) return "ongoing";
  if (currentMin < start) return "upcoming";
  return "finished";
}

function formatEventTimes(event: EventEntry, viewOffset: number, srvOffset: number): { label: string; serverLabel: string } {
  const fmtFromHM = (hm: string) => {
    const [h, m] = hm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const serverStart = `${pad(event.startHour)}:${pad(event.startMin)}`;
  const serverEnd = `${pad(event.endHour)}:${pad(event.endMin)}`;

  const viewStart = convertTime(serverStart, srvOffset, viewOffset);
  const viewEnd = convertTime(serverEnd, srvOffset, viewOffset);

  const isPoint = event.startHour === event.endHour && event.startMin === event.endMin;

  const label = isPoint ? fmtFromHM(viewStart) : `${fmtFromHM(viewStart)} – ${fmtFromHM(viewEnd)}`;
  const serverLabel = isPoint ? fmtFromHM(serverStart) : `${fmtFromHM(serverStart)} – ${fmtFromHM(serverEnd)}`;

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
  }, [viewingOffset, viewingMode]);

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

    // Iterate unified schedule entries; entries with `startHour` are events,
    // others are boss spawn rows (with `times` array).
    schedule.forEach((entry) => {
      // EventEntry detection
      if ((entry as EventEntry).startHour !== undefined) {
        const e = entry as EventEntry;
        if (worldFilter !== "ALL") return; // events only shown in the global list
        if (searchLower && !e.name.toLowerCase().includes(searchLower)) return;

        const status = getEventStatus(e, currentMin, viewingOffset, serverOffset);
        const { label, serverLabel } = formatEventTimes(e, viewingOffset, serverOffset);
        result.push({
          type: "event",
          name: e.name,
          subName: e.period || "Event",
          timesDisplay: [{ label, serverLabel, status, isNext: status === "upcoming" }],
          rowStatus: status,
        });
        return;
      }

      // BossEntry handling
      const b: any = entry;
      if (worldFilter !== "ALL" && b.world !== worldFilter) return;
      if (searchLower && !b.boss.toLowerCase().includes(searchLower) && !b.map.toLowerCase().includes(searchLower)) return;

      // Boss times are stored in PH time (UTC+8). Convert from PH -> viewing and PH -> selected server
      const PH_OFFSET = 8;
      const convertedView = b.times.map((t: string) => convertTime(t, PH_OFFSET, viewingOffset));
      const convertedServer = b.times.map((t: string) => convertTime(t, PH_OFFSET, serverOffset));
      const statuses = getTimesStatuses(convertedView, currentMin);

      // Build timesDisplay and mark the earliest upcoming time as `isNext`
      const rawTimes = convertedView.map((t: string, i: number) => ({
        label: formatTime(t),
        serverLabel: formatTime(convertedServer[i]),
        status: statuses[i],
        isNext: false,
      }));

      const toMinutes = (label: string) => {
        const match = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return Infinity;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };

      // find earliest upcoming time index
      let bestIdx = -1;
      let bestMin = Infinity;
      rawTimes.forEach((rt, idx) => {
        if (rt.status === "upcoming") {
          const mins = toMinutes(rt.label);
          if (mins < bestMin) {
            bestMin = mins;
            bestIdx = idx;
          }
        }
      });

      const rowStatus = getRowStatus(statuses);
      // only mark `isNext` when the entire row is classified as upcoming
      if (rowStatus === "upcoming" && bestIdx >= 0) rawTimes[bestIdx].isNext = true;

      result.push({
        type: "boss",
        name: b.boss,
        subName: b.map,
        world: b.world,
        timesDisplay: rawTimes,
        rowStatus,
      });
    });

    result.sort((a, b) => statusOrder[a.rowStatus] - statusOrder[b.rowStatus]);
    return result;
  }, [worldFilter, searchLower, currentMin, viewingOffset, serverOffset]);

  const grouped = useMemo(() => {
    const ongoing = rows.filter((r) => r.rowStatus === "ongoing");
    const upcoming = rows.filter((r) => r.rowStatus === "upcoming");
    const finished = rows.filter((r) => r.rowStatus === "finished");

    // Sort upcoming by their earliest upcoming time
    upcoming.sort((a, b) => {
      const getEarliest = (row: UnifiedRow) => {
        let min = Infinity;
        for (const t of row.timesDisplay) {
          if (t.status === "upcoming") {
            const match = t.label.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (match) {
              let h = parseInt(match[1]);
              const m = parseInt(match[2]);
              if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
              if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
              min = Math.min(min, h * 60 + m);
            }
          }
        }
        return min;
      };
      return getEarliest(a) - getEarliest(b);
    });

    return { ongoing, upcoming, finished };
  }, [rows]);

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

        <footer className="text-center py-8 text-muted-foreground text-sm font-body">
          <div className="ornament-line mx-auto w-32 mb-3" />
          MIR4 Timing Guide by Striker` · © 2026 All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default Index;
