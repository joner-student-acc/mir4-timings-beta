export interface BossEntry {
  world: string;
  map: string;
  boss: string;
  times: string[]; // "HH:MM" in 24h PH time
}

export interface SpecialArea {
  name: string;
  times: string[]; // "HH:MM"
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
  { world: "W1", map: "Demon Bull Temple 1F", boss: "Boltox", times: ["7:00 AM","9:00 AM","11:00 AM","1:00 PM","3:00 PM","5:00 PM"].map(p) },
  { world: "W1", map: "Bullface Forest", boss: "Mata", times: ["8:00 AM","10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM"].map(p) },
  { world: "W1", map: "Bullface Fiend King's Sanctuary", boss: "Bullface Fiend King", times: ["12:00 PM","3:00 PM","6:00 PM"].map(p) },
  { world: "W1", map: "Whitemaur Sealing Circle", boss: "Yeo Wihuang", times: ["7:00 AM","11:00 AM","3:00 PM","5:00 PM"].map(p) },
  // W7
  { world: "W7", map: "Redmoon Gorge 2F", boss: "Taehyul", times: ["7:00 AM","11:00 AM","3:00 PM","5:00 PM"].map(p) },
  { world: "W7", map: "Demonic Cult Main Hall", boss: "Yiun", times: ["8:00 AM","11:00 AM","2:00 PM","5:00 PM"].map(p) },
  // W4
  { world: "W4", map: "Phantasia Desert", boss: "Nefarior Obdurate Zenith", times: ["8:00 AM","10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM"].map(p) },
  { world: "W4", map: "Overlord Sealing Circle", boss: "Kurilaica", times: ["9:00 AM","12:00 PM","3:00 PM","6:00 PM"].map(p) },
  // W2
  { world: "W2", map: "Redmoon Mountain", boss: "Juhui", times: ["8:30 AM","11:30 AM","2:30 PM","5:30 PM"].map(p) },
  // W5
  { world: "W5", map: "Great Sabuk Wall Camp", boss: "Faluk", times: ["9:30 AM","12:30 PM","3:30 PM","6:00 PM"].map(p) },
  { world: "W5", map: "Illusion Temple", boss: "Tale Warper Fiend", times: ["7:30 AM","10:30 AM","1:30 PM","4:30 PM"].map(p) },
  // W3
  { world: "W3", map: "Viperbeast Plain", boss: "Dusk Armado Emperor", times: ["7:30 AM","9:30 AM","11:30 AM","1:30 PM","3:30 PM","5:30 PM"].map(p) },
  { world: "W3", map: "Rockcut Tomb", boss: "Mara", times: ["8:30 AM","11:30 AM","2:30 PM","5:30 PM"].map(p) },
  { world: "W3", map: "Nefarior Necropolis", boss: "Tombbeast Gyo", times: ["8:30 AM","2:30 PM"].map(p) },
  { world: "W3", map: "Rockcut Tomb", boss: "Boodo", times: ["9:30 AM","3:30 PM"].map(p) },
  // W6
  { world: "W6", map: "Bicheon Town", boss: "Cheol Mokgang", times: ["8:30 AM","10:30 AM","12:30 PM","2:30 PM","4:30 PM","6:30 PM"].map(p) },
  { world: "W6", map: "Demoniac Mine", boss: "Hong Yeo", times: ["7:30 AM","9:30 AM","11:30 AM","1:30 PM","3:30 PM","5:30 PM"].map(p) },
  { world: "W6", map: "Bicheon Town", boss: "Bicheon Sura", times: ["10:30 AM","4:30 PM"].map(p) },
  { world: "W6", map: "Phantom Woods", boss: "Wuihan", times: ["11:30 AM","5:30 PM"].map(p) },
  { world: "W6", map: "Bicheon Labyrinth", boss: "Obscene Yeticlops", times: ["12:30 PM","6:30 PM"].map(p) },
];

export const specialAreas: SpecialArea[] = [
  { name: "Labyrinth (WB)", times: ["16:00", "02:00"] },
  { name: "Valley (WB)", times: ["18:00", "04:00"] },
  { name: "Worlds (WB)", times: ["06:00"] },
];

export const events: EventEntry[] = [
  { name: "Purgatory", times: "6:00 AM / 12:00 PM", startHour: 6, startMin: 0, endHour: 6, endMin: 30 },
  { name: "Domination", period: "1st Period", times: "3 PM – 7 PM", startHour: 15, startMin: 0, endHour: 19, endMin: 0 },
  { name: "Domination", period: "2nd Period", times: "9 PM – 1 AM", startHour: 21, startMin: 0, endHour: 1, endMin: 0 },
  { name: "Domination", period: "3rd Period", times: "3 AM – 7 AM", startHour: 3, startMin: 0, endHour: 7, endMin: 0 },
  { name: "Server Expedition", times: "3 AM – 7 AM", startHour: 3, startMin: 0, endHour: 7, endMin: 0 },
  { name: "Valley War", times: "4:00 AM", startHour: 4, startMin: 0, endHour: 4, endMin: 30 },
];

export const allWorlds = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"] as const;
