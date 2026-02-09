export type ServerRegion = "ASIA" | "INMENA" | "EU" | "SA" | "NA";

export interface ServerInfo {
  label: string;
  utcOffset: number; // hours from UTC
}

export const servers: Record<ServerRegion, ServerInfo> = {
  ASIA: { label: "[ASIA] UTC+8", utcOffset: 8 },
  INMENA: { label: "[INMENA] UTC+6", utcOffset: 6 },
  EU: { label: "[EU] UTC+2", utcOffset: 2 },
  SA: { label: "[SA] UTC-3", utcOffset: -3 },
  NA: { label: "[NA] UTC-4", utcOffset: -4 },
};

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
 */
export function convertTime(time: string, fromOffset: number, toOffset: number): string {
  const [h, m] = time.split(":").map(Number);
  let newH = h + (toOffset - fromOffset);
  // Wrap around 24h
  newH = ((newH % 24) + 24) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
  for (let i = 0; i < times.length; i++) {
    const spawn = toMinutes(times[i]);
    if (spawn > currentMinutes) return i;
  }
  return -1;
}

/**
 * Get status for each time in a list
 */
export function getTimesStatuses(
  times: string[],
  currentMinutes: number
): ScheduleStatus[] {
  const nextIdx = getNextUpcomingIndex(times, currentMinutes);

  return times.map((t, i) => {
    const spawn = toMinutes(t);
    const diff = currentMinutes - spawn;
    if (diff >= 0 && diff < 30) return "ongoing";
    if (i === nextIdx) return "upcoming";
    if (spawn > currentMinutes) return "upcoming";
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
