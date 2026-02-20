import { useState, useEffect, useMemo } from "react";
import { schedule, EventEntry } from "@/data/scheduleData";
import { ScheduleHeader } from "@/components/ScheduleHeader";
import { ScheduleTable } from "@/components/ScheduleTable";
import {
  convertTime, formatTime, getTimesStatuses, getRowStatus,
  getServerDate, getServerTime, ScheduleStatus, ServerRegion, servers, formatUtcOffset,
  AUTO_DETECT_VALUE, detectLocalUtcOffset, convertBaseToServerToView,
} from "@/lib/timeUtils";
import type { UnifiedRow } from "@/types/schedule";

function parseHM(time: string): { h: number; m: number } {
  const [h, m] = time.split(":").map(Number);
  return { h, m };
}

function getEventStatus(event: EventEntry, currentMin: number, viewOffset: number, srvOffset: number): ScheduleStatus {
  // Event times are stored in a base server timezone (default UTC+8 / Manila).
  // Conversion rules:
  // 1) Treat event start/end as in `baseOffset` (default 8).
  // 2) Convert baseOffset -> selected server (`srvOffset`) to get server-local time.
  // 3) Convert server-local -> viewing (`viewOffset`) to get displayed viewing time.
  const pad = (n: number) => String(n).padStart(2, "0");
  // Stored event times are the viewing times as seen in Manila (UTC+8)
  // and were authored for a base server (default EU UTC+2).
  const baseServer = event.baseServerOffset ?? 2; // default EU
  const storedViewStart = `${pad(event.startHour)}:${pad(event.startMin)}`; // viewing time in Manila
  const storedViewEnd = `${pad(event.endHour)}:${pad(event.endMin)}`;

  // Convert stored viewing (Manila) -> server-local time on the base server
  const serverTimeOnBaseStart = convertTime(storedViewStart, 8, baseServer);
  const serverTimeOnBaseEnd = convertTime(storedViewEnd, 8, baseServer);

  // The spawn local time is the same across servers (same wallclock),
  // so server-local time for the selected server is the same numeric time.
  const serverStart = serverTimeOnBaseStart;
  const serverEnd = serverTimeOnBaseEnd;

  // Finally convert selected server -> viewing
  const serverStartParts = parseHM(serverStart);
  const serverEndParts = parseHM(serverEnd);
  const { viewTime: viewStartStr } = convertBaseToServerToView(
    serverStartParts.h,
    serverStartParts.m,
    srvOffset,
    srvOffset,
    viewOffset
  );
  const { viewTime: viewEndStr } = convertBaseToServerToView(
    serverEndParts.h,
    serverEndParts.m,
    srvOffset,
    srvOffset,
    viewOffset
  );

  const start = ((parseInt(viewStartStr.split(":")[0], 10) * 60) + parseInt(viewStartStr.split(":")[1], 10)) % 1440;
  const end = ((parseInt(viewEndStr.split(":")[0], 10) * 60) + parseInt(viewEndStr.split(":")[1], 10)) % 1440;

  const isPoint = (storedViewStart === storedViewEnd);
  if (isPoint) {
    if (currentMin === start) return "ongoing";
    if (currentMin < start) return "upcoming";
    return "finished";
  }

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
  // Stored event times are the viewing times as seen in Manila (UTC+8)
  // and were authored for a base server (default EU UTC+2).
  const baseServer = event.baseServerOffset ?? 2;
  const storedViewStart = `${pad(event.startHour)}:${pad(event.startMin)}`;
  const storedViewEnd = `${pad(event.endHour)}:${pad(event.endMin)}`;

  // Convert stored viewing -> server-local on base server
  const serverTimeOnBaseStart = convertTime(storedViewStart, 8, baseServer);
  const serverTimeOnBaseEnd = convertTime(storedViewEnd, 8, baseServer);

  const serverStart = serverTimeOnBaseStart;
  const serverEnd = serverTimeOnBaseEnd;

  // Convert selected server -> viewing
  const serverStartParts = parseHM(serverStart);
  const serverEndParts = parseHM(serverEnd);
  const { viewTime: viewStart } = convertBaseToServerToView(
    serverStartParts.h,
    serverStartParts.m,
    srvOffset,
    srvOffset,
    viewOffset
  );
  const { viewTime: viewEnd } = convertBaseToServerToView(
    serverEndParts.h,
    serverEndParts.m,
    srvOffset,
    srvOffset,
    viewOffset
  );

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
const [use24h, setUse24h] = useState<boolean>(() => loadFromStorage("mir4-use24h", false));
  const [, setTick] = useState(0);
  useEffect(() => {
    localStorage.setItem("mir4-server", JSON.stringify(server));
  }, [server]);

  useEffect(() => {
    localStorage.setItem("mir4-viewing-offset", JSON.stringify(viewingOffset));
  }, [viewingOffset, viewingMode]);

  useEffect(() => {
    localStorage.setItem("mir4-use24h", JSON.stringify(use24h));
  }, [use24h]);

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
    const serverDay = getServerDate(serverOffset).getDay();

    // Iterate unified schedule entries; entries with `startHour` are events,
    // others are boss spawn rows (with `times` array).
    schedule.forEach((entry) => {
      // EventEntry detection
      if ((entry as EventEntry).startHour !== undefined) {
        const e = entry as EventEntry;
        if (worldFilter !== "ALL") return; // events only shown in the global list
        if (searchLower && !e.name.toLowerCase().includes(searchLower)) return;
        if (e.daysOfWeek && !e.daysOfWeek.includes(serverDay)) return;

        const status = getEventStatus(e, currentMin, viewingOffset, serverOffset);
        const { label, serverLabel } = formatEventTimes(e, viewingOffset, serverOffset);
        result.push({
          type: "event",
          name: e.name,
          subName: e.period || "Event",
          world: e.world,
          timesDisplay: [{ label, serverLabel, status, isNext: status === "upcoming" }],
          rowStatus: status,
        });
        return;
      }

      // BossEntry handling
      const b: any = entry;
      if (worldFilter !== "ALL" && b.world !== worldFilter) return;
      if (searchLower && !b.boss.toLowerCase().includes(searchLower) && !b.map.toLowerCase().includes(searchLower)) return;

      // Boss times may either be:
      // - server-local times (default): t is server-local and should be converted from selected server -> viewing
      // - stored as Manila viewing times authored for a base server (when `b.baseServerOffset` is present):
      //   treat t as viewing time in Manila (UTC+8), convert Manila -> baseServer to get server-local clock,
      //   then treat that clock as the server-local time for all servers and convert selected server -> viewing.
      const baseServer = b.baseServerOffset as number | undefined;
      let convertedView: string[];
      let convertedServer: string[];
      if (typeof baseServer === "number") {
        // times are stored as Manila viewing times authored for baseServer
        const serverTimesOnBase = b.times.map((t: string) => convertTime(t, 8, baseServer)); // Manila(8) -> base server
        // serverTimesOnBase is the server-local clock; selected server uses same wallclock
        convertedServer = serverTimesOnBase.map((t: string) => t);
        convertedView = serverTimesOnBase.map((t: string) => {
          const { h, m } = parseHM(t);
          return convertBaseToServerToView(h, m, serverOffset, serverOffset, viewingOffset).viewTime;
        });
      } else {
        // default behavior: times are server-local
        convertedView = b.times.map((t: string) => {
          const { h, m } = parseHM(t);
          return convertBaseToServerToView(h, m, serverOffset, serverOffset, viewingOffset).viewTime;
        });
        convertedServer = b.times;
      }
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
      const parseLabelToMin = (label: string) => {
        const match = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return Infinity;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };

      const getSoonestDelta = (row: UnifiedRow) => {
        let minDelta = Infinity;
        for (const t of row.timesDisplay) {
          if (t.status === "upcoming") {
            const mins = parseLabelToMin(t.label);
            if (mins === Infinity) continue;
            const delta = ((mins - currentMin) % 1440 + 1440) % 1440;
            if (delta > 0 && delta < minDelta) minDelta = delta;
          }
        }
        return minDelta;
      };

      return getSoonestDelta(a) - getSoonestDelta(b);
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
        <ScheduleTable items={grouped.ongoing} label="Ongoing Now" status="ongoing" currentMin={currentMin} use24h={use24h} setUse24h={setUse24h} />
        <ScheduleTable items={grouped.upcoming} label="Upcoming" status="upcoming" currentMin={currentMin} use24h={use24h} setUse24h={setUse24h} />
        <ScheduleTable items={grouped.finished} label="Finished" status="finished" currentMin={currentMin} use24h={use24h} setUse24h={setUse24h} />

        {rows.length === 0 && (
          <p className="text-center text-muted-foreground py-8 font-body text-lg">No entries match your filter.</p>
        )}

        <footer className="text-center py-8 text-muted-foreground text-md font-body">
          <div className="ornament-line mx-auto w-32 mb-3" />
          <p>MIR4 Timing Guide by <a className="underline text-upcoming-foreground" href="https://discord.com/users/1311568159966494800" target="_blank" rel="noreferrer">Striker丶</a> · © 2026 All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
