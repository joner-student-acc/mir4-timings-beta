export interface BossEntry {
  world: string;
  map: string;
  boss: string;
  times: string[]; // "HH:MM" in 24h PH time
}

export interface EventEntry {
  name: string;
  period?: string;
  times: string; // descriptive
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

// Helper to parse "7:00 AM" -> "07:00"
function p(t: string): string {
  const [time, meridiem] = t.trim().split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const worldBosses: BossEntry[] = [
  // W1
  { world: "L3-W1", map: "Demon Bull Temple 1F", boss: "Boltox", times: ["7:00 AM","9:00 AM","11:00 AM","1:00 PM","3:00 PM","5:00 PM", "7:00 PM", "9:00 PM", "11:00 PM", "1:00 AM", "3:00 AM", "5:00 AM"].map(p) },
  { world: "L3-W1", map: "Bullface Forest", boss: "Mata", times: ["8:00 AM","10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM","8:00 PM","10:00 PM","12:00 AM","2:00 AM","4:00 AM","6:00 AM"].map(p) },
  { world: "L3-W1", map: "Bullface Fiend King's Sanctuary", boss: "Bullface Fiend King", times: ["12:00 PM","3:00 PM","6:00 PM","12:00 AM","3:00 AM","6:00 AM"].map(p) },
  { world: "L3-W1", map: "Whitemaur Sealing Circle", boss: "Yeo Wihuang", times: ["7:00 AM","11:00 AM","3:00 PM","5:00 PM","7:00 PM","11:00 PM","3:00 AM","5:00 AM"].map(p) },
  // W7
  { world: "L3-W7", map: "Redmoon Gorge 2F", boss: "Taehyul", times: ["7:00 AM","11:00 AM","3:00 PM","7:00 PM","11:00 PM","3:00 AM"].map(p) },
  { world: "L3-W7", map: "Demonic Cult Main Hall", boss: "Yiun", times: ["8:00 AM","11:00 AM","2:00 PM","5:00 PM","8:00 PM","11:00 PM","2:00 AM","5:00 AM"].map(p) },
  // W4
  { world: "L3-W4", map: "Phantasia Desert", boss: "Nefarior Obdurate Zenith", times: ["8:00 AM","10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM","8:00 PM","10:00 PM","12:00 AM","2:00 AM","4:00 AM","6:00 AM"].map(p) },
  { world: "L3-W4", map: "Overlord Sealing Circle", boss: "Kurilaica", times: ["9:00 AM","12:00 PM","3:00 PM","6:00 PM","9:00 PM","12:00 AM","3:00 AM","6:00 AM"].map(p) },
  // W2
  { world: "L3-W2", map: "Redmoon Mountain", boss: "Juhui", times: ["8:30 AM","11:30 AM","2:30 PM","5:30 PM","8:30 PM","11:30 PM","2:30 AM","5:30 AM"].map(p) },
  // W5
  { world: "L3-W5", map: "Great Sabuk Wall Camp", boss: "Faluk", times: ["9:30 AM","12:30 PM","3:30 PM","6:00 PM","9:30 PM","12:30 AM","3:30 AM","6:00 AM"].map(p) },
  { world: "L3-W5", map: "Illusion Temple", boss: "Tale Warper Fiend", times: ["7:30 AM","10:30 AM","1:30 PM","4:30 PM","7:30 PM","10:30 PM","1:30 AM","4:30 AM"].map(p) },
  // W3
  { world: "L3-W3", map: "Viperbeast Plain", boss: "Dusk Armado Emperor", times: ["7:30 AM","9:30 AM","11:30 AM","1:30 PM","3:30 PM","5:30 PM","7:30 PM","9:30 PM","11:30 PM","1:30 AM","3:30 AM","5:30 AM"].map(p) },
  { world: "L3-W3", map: "Rockcut Tomb", boss: "Mara", times: ["8:30 AM","11:30 AM","2:30 PM","5:30 PM","8:30 PM","11:30 PM","2:30 AM","5:30 AM"].map(p) },
  { world: "L3-W3", map: "Nefarior Necropolis", boss: "Tombbeast Gyo", times: ["8:30 AM","2:30 PM","8:30 PM","2:30 AM"].map(p) },
  { world: "L3-W3", map: "Rockcut Tomb", boss: "Boodo", times: ["9:30 AM","3:30 PM","9:30 PM","3:30 AM"].map(p) },
  // W6
  { world: "L3-W6", map: "Bicheon Town", boss: "Cheol Mokgang", times: ["8:30 AM","10:30 AM","12:30 PM","2:30 PM","4:30 PM","6:30 PM","8:30 PM","10:30 PM","12:30 AM","2:30 AM","4:30 AM","6:30 AM"].map(p) },
  { world: "L3-W6", map: "Demoniac Mine", boss: "Hong Yeo", times: ["7:30 AM","9:30 AM","11:30 AM","1:30 PM","3:30 PM","5:30 PM","7:30 PM","9:30 PM","11:30 PM","1:30 AM","3:30 AM","5:30 AM"].map(p) },
  { world: "L3-W6", map: "Bicheon Town", boss: "Bicheon Sura", times: ["10:30 AM","4:30 PM","10:30 PM","4:30 AM"].map(p) },
  { world: "L3-W6", map: "Phantom Woods", boss: "Wuihan", times: ["11:30 AM","5:30 PM","11:30 PM","5:30 AM"].map(p) },
  { world: "L3-W6", map: "Bicheon Labyrinth", boss: "Obscene Yeticlops", times: ["12:30 PM","6:30 PM","12:30 AM","6:30 AM"].map(p) },
  // Special Areas
  { world: "Purgatory", map: "Purgatory", boss: "Purgatory", times: ["6:00 AM", "12:00 PM", "6:00 PM", "12:00 AM"].map(p) },
  { world: "Labyrinth", map: "Labyrinth", boss: "Labyrinth WB", times: ["4:00 PM", "2:00 AM"].map(p) },
  { world: "Valley", map: "Valley", boss: "Valley WB", times: ["6:00 PM", "4:00 AM"].map(p) },
  { world: "Worlds", map: "Worlds", boss: "Worlds WB", times: ["6:00 AM"].map(p) },
  { world: "Leaders III", map: "Magic Square", boss: "Leaders III Boss", times: ["5:00 AM", "8:00 AM", "11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM", "11:00 PM", "2:00 AM"].map(p) },
  { world: "SP", map: "South", boss: "SP Red Boss", times: ["6:00 AM", "12:00 PM", "6:00 PM", "12:00 AM"].map(p) },
  { world: "SP", map: "North", boss: "SP Red Boss", times: ["9:00 AM", "3:00 PM", "9:00 PM", "3:00 AM"].map(p) },
];

export const events: EventEntry[] = [
  { name: "Domination", period: "1st Period", times: "3 PM – 7 PM", startHour: 15, startMin: 0, endHour: 19, endMin: 0 },
  { name: "Domination", period: "2nd Period", times: "9 PM – 1 AM", startHour: 21, startMin: 0, endHour: 1, endMin: 0 },
  { name: "Domination", period: "3rd Period", times: "3 AM – 7 AM", startHour: 3, startMin: 0, endHour: 7, endMin: 0 },
  { name: "Server Expedition", times: "3 AM – 7 AM", startHour: 3, startMin: 0, endHour: 7, endMin: 0 },
  { name: "Valley War", times: "4:00 AM", startHour: 4, startMin: 0, endHour: 4, endMin: 30 },
];

export const allWorlds = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"] as const;
