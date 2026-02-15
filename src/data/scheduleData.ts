export interface BossEntry {
  world: string;
  map: string;
  boss: string;
  times: string[]; // "HH:MM" in 24h server-local time (spawns at same time across all servers)
  baseServerOffset?: number; // optional: if present, times are stored as Manila viewing times authored for this base server (UTC offset)
}

export interface EventEntry {
  name: string;
  period?: string;
  times: string; // descriptive
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  world?: string; // optional world/location for filtering
  daysOfWeek?: number[]; // 0=Sun .. 6=Sat, based on server day
  baseServerOffset?: number; // optional: the UTC offset where these event times were authored (default: 2 / EU)
}

// Helper to parse "7:00 AM" -> "07:00"
function p(t: string): string {
  // Accept variants like "12:00 MN" (midnight) and "12:00 NN" (noon)
  const parts = t.trim().split(/\s+/);
  const time = parts[0];
  let meridiem = (parts[1] || "").toUpperCase().replace(/\./g, "");

  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Rotate a sorted array of "HH:MM" strings so it starts at or after 06:00
function rotateTimes(times24: string[]): string[] {
  const s = [...times24].sort();
  const idx = s.findIndex(t => t >= "06:00");
  if (idx === -1) return s;
  return s.slice(idx).concat(s.slice(0, idx));
}

// Ensure every boss times array starts from 06:00 (or next available after 06:00)
function applyRotationToAll(bosses: BossEntry[]) {
  bosses.forEach(b => {
    b.times = rotateTimes(b.times);
  });
}

export const worldBosses: BossEntry[] = [
  // W1
  { world: "L3-W1", map: "Demon Bull Temple 1F", boss: "Boltox", times: ["7:00 AM", "9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM", "9:00 PM", "11:00 PM", "1:00 AM", "3:00 AM", "5:00 AM"].map(p) },
  { world: "L3-W1", map: "Bullface Forest", boss: "Mata", times: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", "10:00 PM", "12:00 AM", "2:00 AM", "4:00 AM", "6:00 AM"].map(p) },
  { world: "L3-W1", map: "Bullface Fiend King's Sanctuary", boss: "Bullface Fiend King", times: ["12:00 PM", "3:00 PM", "6:00 PM", "12:00 AM", "3:00 AM", "6:00 AM"].map(p) },
  { world: "L3-W1", map: "Whitemaur Sealing Circle", boss: "Yeo Wihuang", times: ["7:00 AM", "11:00 AM", "3:00 PM", "5:00 PM", "7:00 PM", "11:00 PM", "3:00 AM", "5:00 AM"].map(p) },
  // W7
  { world: "L3-W7", map: "Redmoon Gorge 2F", boss: "Taehyul", times: ["7:00 AM", "11:00 AM", "3:00 PM", "7:00 PM", "11:00 PM", "3:00 AM"].map(p) },
  { world: "L3-W7", map: "Demonic Cult Main Hall", boss: "Yiun", times: ["8:00 AM", "11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM", "11:00 PM", "2:00 AM", "5:00 AM"].map(p) },
  // W4
  { world: "L3-W4", map: "Phantasia Desert", boss: "Nefarior Obdurate Zenith", times: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", "10:00 PM", "12:00 AM", "2:00 AM", "4:00 AM", "6:00 AM"].map(p) },
  { world: "L3-W4", map: "Overlord Sealing Circle", boss: "Kurilaica", times: ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM", "12:00 AM", "3:00 AM", "6:00 AM"].map(p) },
  // W2
  { world: "L3-W2", map: "Redmoon Mountain", boss: "Juhui", times: ["8:30 AM", "11:30 AM", "2:30 PM", "5:30 PM", "8:30 PM", "11:30 PM", "2:30 AM", "5:30 AM"].map(p) },
  // W5
  { world: "L3-W5", map: "Great Sabuk Wall Camp", boss: "Faluk", times: ["9:30 AM", "12:30 PM", "3:30 PM", "6:00 PM", "9:30 PM", "12:30 AM", "3:30 AM", "6:00 AM"].map(p) },
  { world: "L3-W5", map: "Illusion Temple", boss: "Tale Warper Fiend", times: ["7:30 AM", "10:30 AM", "1:30 PM", "4:30 PM", "7:30 PM", "10:30 PM", "1:30 AM", "4:30 AM"].map(p) },
  // W3
  { world: "L3-W3", map: "Viperbeast Plain", boss: "Dusk Armado Emperor", times: ["7:30 AM", "9:30 AM", "11:30 AM", "1:30 PM", "3:30 PM", "5:30 PM", "7:30 PM", "9:30 PM", "11:30 PM", "1:30 AM", "3:30 AM", "5:30 AM"].map(p) },
  { world: "L3-W3", map: "Rockcut Tomb", boss: "Mara", times: ["8:30 AM", "11:30 AM", "2:30 PM", "5:30 PM", "8:30 PM", "11:30 PM", "2:30 AM", "5:30 AM"].map(p) },
  { world: "L3-W3", map: "Nefarior Necropolis", boss: "Tombbeast Gyo", times: ["8:30 AM", "2:30 PM", "8:30 PM", "2:30 AM"].map(p) },
  { world: "L3-W3", map: "Rockcut Tomb", boss: "Boodo", times: ["9:30 AM", "3:30 PM", "9:30 PM", "3:30 AM"].map(p) },
  // W6
  { world: "L3-W6", map: "Bicheon Town", boss: "Cheol Mokgang", times: ["8:30 AM", "10:30 AM", "12:30 PM", "2:30 PM", "4:30 PM", "6:30 PM", "8:30 PM", "10:30 PM", "12:30 AM", "2:30 AM", "4:30 AM", "6:30 AM"].map(p) },
  { world: "L3-W6", map: "Demoniac Mine Depths", boss: "Hong Yeo", times: ["7:30 AM", "9:30 AM", "11:30 AM", "1:30 PM", "3:30 PM", "5:30 PM", "7:30 PM", "9:30 PM", "11:30 PM", "1:30 AM", "3:30 AM", "5:30 AM"].map(p) },
  { world: "L3-W6", map: "Bicheon Town", boss: "Bicheon Sura", times: ["10:30 AM", "4:30 PM", "10:30 PM", "4:30 AM"].map(p) },
  { world: "L3-W6", map: "Phantom Woods", boss: "Wuihan", times: ["11:30 AM", "5:30 PM", "11:30 PM", "5:30 AM"].map(p) },
  { world: "L3-W6", map: "Bicheon Labyrinth", boss: "Obscene Yeticlops", times: ["12:30 PM", "6:30 PM", "12:30 AM", "6:30 AM"].map(p) },
  // Special Areas
  { world: "Purg", map: "Purgatory", boss: "Purgatory", times: ["6:00 AM", "12:00 PM", "6:00 PM", "12:00 AM"].map(p) },
  { world: "Lab", map: "Labyrinth", boss: "Labyrinth WB", times: ["4:00 PM", "2:00 AM"].map(p), baseServerOffset: 2 },
  { world: "Valley", map: "Valley", boss: "Valley WB", times: ["6:00 PM", "4:00 AM"].map(p), baseServerOffset: 2 },
  { world: "W1/w7/W2/W3", map: "Mirage", boss: "Mirage WB", times: ["4:00 AM"].map(p), baseServerOffset: 2 },
  { world: "W8/W4/W5/w6", map: "Mirage", boss: "Mirage WB", times: ["6:00 AM"].map(p), baseServerOffset: 2 },
  { world: "MS", map: "Leaders III", boss: "Leaders III Boss", times: ["5:00 AM", "8:00 AM", "11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM", "11:00 PM", "2:00 AM"].map(p) },
  { world: "SP", map: "South", boss: "SP Red Boss", times: ["6:00 AM", "12:00 PM", "6:00 PM", "12:00 AM"].map(p) },
  { world: "SP", map: "North", boss: "SP Red Boss", times: ["9:00 AM", "3:00 PM", "9:00 PM", "3:00 AM"].map(p) },
];

// Apply rotation after worldBosses is defined
applyRotationToAll(worldBosses);

// Default base server offset when the source data was authored in PH (Manila, UTC+8)
export const DEFAULT_BASE_SERVER_OFFSET = 8;

// Ensure entries without an explicit baseServerOffset use the PH default
worldBosses.forEach(b => {
  if (b.baseServerOffset === undefined) b.baseServerOffset = DEFAULT_BASE_SERVER_OFFSET;
});

export const events: EventEntry[] = [
  { name: "1st Domi Entry", period: "Domi Server", times: "3:00 PM – 7:00 PM", startHour: 15, startMin: 0, endHour: 19, endMin: 0, world: "DOMI" },
  { name: "1st Domi Entry | 1st LW", period: "Domi Tower", times: "4:00 PM – 4:30 PM", startHour: 16, startMin: 0, endHour: 16, endMin: 30, world: "LW1-1" },
  { name: "1st Domi Entry | Juja", period: "Domi Tower", times: "5:00 PM", startHour: 17, startMin: 0, endHour: 17, endMin: 0, world: "JUJA" },
  { name: "1st Domi Entry | 2nd LW", period: "Domi Tower", times: "6:00 PM – 6:30 PM", startHour: 18, startMin: 0, endHour: 18, endMin: 30, world: "LW1-2" },

  { name: "2nd Domi Entry", period: "Domi Server", times: "9:00 PM – 1:00 AM", startHour: 21, startMin: 0, endHour: 1, endMin: 0, world: "DOMI" },
  { name: "2nd Domi Entry | 1st LW", period: "Domi Tower", times: "10:00 PM – 10:30 PM", startHour: 22, startMin: 0, endHour: 22, endMin: 30, world: "LW2-1" },
  { name: "2nd Domi Entry | Juja", period: "Domi Tower", times: "11:00 PM", startHour: 23, startMin: 0, endHour: 23, endMin: 0, world: "JUJA" },
  { name: "2nd Domi Entry | 2nd LW", period: "Domi Tower", times: "12:00 AM – 12:30 AM", startHour: 0, startMin: 0, endHour: 0, endMin: 30, world: "LW2-2", },

  { name: "3rd Domi Entry", period: "Domi Server", times: "3:00 AM – 7:00 AM", startHour: 3, startMin: 0, endHour: 7, endMin: 0, world: "DOMI" },
  { name: "3rd Domi Entry | 1st LW", period: "Domi Tower", times: "4:00 AM – 4:30 AM", startHour: 4, startMin: 0, endHour: 4, endMin: 30, world: "LW3-1" },
  { name: "3rd Domi Entry | Juja", period: "Domi Tower", times: "5:00 AM", startHour: 5, startMin: 0, endHour: 5, endMin: 0, world: "JUJA" },
  { name: "3rd Domi Entry | 2nd LW", period: "Domi Tower", times: "6:00 AM – 6:30 AM", startHour: 6, startMin: 0, endHour: 6, endMin: 30, world: "LW3-2" },

  { name: "Server Expedition", times: "3:00 AM – 7:00 AM", startHour: 3, startMin: 0, endHour: 7, endMin: 0, world: "Server" },
  { name: "Valley War", times: "4:00 AM – 5:00 AM", startHour: 4, startMin: 0, endHour: 5, endMin: 0, world: "Valley", daysOfWeek: [3] },
  // { name: "Mirage Living Wraith", times: ":00 PM – 10:00 PM", startHour: 21, startMin: 0, endHour: 22, endMin: 0, world: "Mirage", daysOfWeek: [4] },
];

// Ensure events also default to PH authored times unless explicitly set
events.forEach(e => {
  if (e.baseServerOffset === undefined) e.baseServerOffset = DEFAULT_BASE_SERVER_OFFSET;
});

// Unified schedule combining boss spawns and events. Consumers can iterate
// this array and handle entries dynamically based on the presence of
// `startHour`/`endHour` (events) vs `times` (boss spawns).
export const schedule = [
  ...worldBosses,
  ...events,
];

// export const allWorlds = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"] as const;
