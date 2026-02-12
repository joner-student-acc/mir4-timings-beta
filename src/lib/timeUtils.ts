export type ServerRegion = "ASIA" | "INMENA" | "MENA" | "EU" | "SA" | "NA";

export interface ServerInfo {
  label: string;
  utcOffset: number;
}

export const servers: Record<ServerRegion, ServerInfo> = {
  ASIA: { label: "ASIA (UTC+8)", utcOffset: 8 },
  INMENA: { label: "INDIA / INMENA (UTC+6)", utcOffset: 6 },
  MENA: { label: "MENA (UTC+3)", utcOffset: 3 },
  EU: { label: "EU / Europe (UTC+2)", utcOffset: 2 },
  SA: { label: "SA / South America (UTC-3)", utcOffset: -3 },
  NA: { label: "NA / North America (UTC-4)", utcOffset: -4 },
};

export interface TimezoneOption {
  label: string;
  utcOffset: number;
}

/**
 * Detect the user's local UTC offset in hours (supports fractional like 5.5 for UTC+5:30)
 */
export function detectLocalUtcOffset(): number {
  const offsetMin = -(new Date().getTimezoneOffset());
  return offsetMin / 60;
}

export const AUTO_DETECT_VALUE = "AUTO";

export const viewingTimezones: TimezoneOption[] = [
  { label: "UTC-12 (Baker Island)", utcOffset: -12 },
  { label: "UTC-11 (Pago Pago)", utcOffset: -11 },
  { label: "UTC-10 (Honolulu)", utcOffset: -10 },
  { label: "UTC-9:30 (Marquesas)", utcOffset: -9.5 },
  { label: "UTC-9 (Anchorage)", utcOffset: -9 },
  { label: "UTC-8 (Los Angeles)", utcOffset: -8 },
  { label: "UTC-7 (Denver)", utcOffset: -7 },
  { label: "UTC-6 (Chicago)", utcOffset: -6 },
  { label: "UTC-5 (New York)", utcOffset: -5 },
  { label: "UTC-4 (Santiago)", utcOffset: -4 },
  { label: "UTC-3:30 (St. John's)", utcOffset: -3.5 },
  { label: "UTC-3 (São Paulo)", utcOffset: -3 },
  { label: "UTC-2 (South Georgia)", utcOffset: -2 },
  { label: "UTC-1 (Azores)", utcOffset: -1 },
  { label: "UTC+0 (London / GMT)", utcOffset: 0 },
  { label: "UTC+1 (Paris / Berlin)", utcOffset: 1 },
  { label: "UTC+2 (Cairo / Athens)", utcOffset: 2 },
  { label: "UTC+3 (Moscow / Riyadh)", utcOffset: 3 },
  { label: "UTC+3:30 (Tehran)", utcOffset: 3.5 },
  { label: "UTC+4 (Dubai)", utcOffset: 4 },
  { label: "UTC+4:30 (Kabul)", utcOffset: 4.5 },
  { label: "UTC+5 (Karachi)", utcOffset: 5 },
  { label: "UTC+5:30 (Mumbai / Delhi)", utcOffset: 5.5 },
  { label: "UTC+5:45 (Kathmandu)", utcOffset: 5.75 },
  { label: "UTC+6 (Dhaka)", utcOffset: 6 },
  { label: "UTC+6:30 (Yangon)", utcOffset: 6.5 },
  { label: "UTC+7 (Bangkok / Jakarta)", utcOffset: 7 },
  { label: "UTC+8 (Singapore / Manila)", utcOffset: 8 },
  { label: "UTC+8:45 (Eucla)", utcOffset: 8.75 },
  { label: "UTC+9 (Tokyo / Seoul)", utcOffset: 9 },
  { label: "UTC+9:30 (Adelaide)", utcOffset: 9.5 },
  { label: "UTC+10 (Sydney / Melbourne)", utcOffset: 10 },
  { label: "UTC+10:30 (Lord Howe)", utcOffset: 10.5 },
  { label: "UTC+11 (Solomon Islands)", utcOffset: 11 },
  { label: "UTC+12 (Auckland)", utcOffset: 12 },
  { label: "UTC+12:45 (Chatham Islands)", utcOffset: 12.75 },
  { label: "UTC+13 (Tonga)", utcOffset: 13 },
  { label: "UTC+14 (Line Islands)", utcOffset: 14 },
];

/**
 * Get current time in a given UTC offset as hours & minutes
 */
export function getServerTime(utcOffset: number): { hour: number; min: number } {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const serverDate = new Date(utc + utcOffset * 3600000);
  return { hour: serverDate.getHours(), min: serverDate.getMinutes() };
}

export function getServerDate(utcOffset: number): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + utcOffset * 3600000);
}

/**
 * Convert "HH:MM" to minutes since midnight
 */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convert a time "HH:MM" from one UTC offset to another, returning new "HH:MM"
 * Supports fractional offsets (e.g. UTC+5:30 = 5.5)
 */
export function convertTime(time: string, fromOffset: number, toOffset: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + (toOffset - fromOffset) * 60;
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const newH = Math.floor(wrapped / 60);
  const newM = Math.round(wrapped % 60);
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/**
 * Format "HH:MM" 24h to "h:MM AM/PM"
 */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export type ScheduleStatus = "ongoing" | "upcoming" | "finished";

/**
 * Find the next upcoming time index from a list of "HH:MM" times
 */
export function getNextUpcomingIndex(times: string[], currentMinutes: number): number {
  // Find the index with smallest forward delta from currentMinutes,
  // treating times as repeating every 24h (wrap-around).
  let bestIdx = -1;
  let bestDelta = 1441;
  for (let i = 0; i < times.length; i++) {
    const spawn = toMinutes(times[i]);
    const delta = ((spawn - currentMinutes) % 1440 + 1440) % 1440; // 0..1439
    if (delta > 0 && delta < bestDelta) {
      bestDelta = delta;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Get status for each time in a list
 */
export function getTimesStatuses(
  times: string[],
  currentMinutes: number
): ScheduleStatus[] {
  // Compute normalized deltas and determine the nearest upcoming spawn
  const deltas = times.map((t) => {
    const spawn = toMinutes(t);
    const forward = ((spawn - currentMinutes) % 1440 + 1440) % 1440; // minutes until spawn
    const since = ((currentMinutes - spawn) % 1440 + 1440) % 1440; // minutes since spawn
    return { spawn, forward, since };
  });

  // find smallest positive forward (next upcoming)
  let minForward = 1441;
  let nextIdx = -1;
  deltas.forEach((d, i) => {
    if (d.forward > 0 && d.forward < minForward) {
      minForward = d.forward;
      nextIdx = i;
    }
  });

  return deltas.map((d, i) => {
    if (d.since >= 0 && d.since < 30) return "ongoing";
    if (i === nextIdx) return "upcoming";
    return "finished";
  });
}

/**
 * Get the overall row status (prioritize ongoing > upcoming > finished)
 */
export function getRowStatus(statuses: ScheduleStatus[]): ScheduleStatus {
  if (statuses.includes("ongoing")) return "ongoing";
  if (statuses.includes("upcoming")) return "upcoming";
  return "finished";
}

/**
 * Format a UTC offset number to a display string like "UTC+5:30"
 */
export function formatUtcOffset(offset: number): string {
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  if (m === 0) return `UTC${sign}${h}`;
  return `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
}
