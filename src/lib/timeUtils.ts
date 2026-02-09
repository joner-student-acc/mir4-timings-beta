/**
 * Get current PH time (UTC+8)
 */
export function getPHTime(): Date {
  const now = new Date();
  // Convert to UTC then add 8 hours
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

/**
 * Get current PH hour and minute
 */
export function getPHHourMin(): { hour: number; min: number } {
  const ph = getPHTime();
  return { hour: ph.getHours(), min: ph.getMinutes() };
}

/**
 * Convert "HH:MM" to minutes since midnight
 */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
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
 * Determine the status of a boss spawn time.
 * "ongoing" = within 30 min window of spawn
 * "upcoming" = the next spawn in the list
 * "finished" = past spawns
 */
export function getBossTimeStatus(
  spawnTime: string,
  currentMinutes: number
): ScheduleStatus {
  const spawn = toMinutes(spawnTime);
  const diff = spawn - currentMinutes;
  // Ongoing: within 0-29 min after spawn
  if (diff <= 0 && diff > -30) return "ongoing";
  if (diff >= -30 && diff < 0) return "ongoing";
  if (diff > 0) return "upcoming";
  return "finished";
}

/**
 * Find the next upcoming time index from a list of "HH:MM" times
 */
export function getNextUpcomingIndex(times: string[], currentMinutes: number): number {
  for (let i = 0; i < times.length; i++) {
    const spawn = toMinutes(times[i]);
    if (spawn > currentMinutes) return i;
  }
  return -1; // all finished for today
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
    // Ongoing: currently within 30 min of spawn
    if (diff >= 0 && diff < 30) return "ongoing";
    // If this is the next upcoming
    if (i === nextIdx) return "upcoming";
    // If spawn is in the future
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
