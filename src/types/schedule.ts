import { ScheduleStatus } from "@/lib/timeUtils";

export type UnifiedRow = {
  type: "boss" | "event";
  name: string;
  subName: string;
  world?: string;
  timesDisplay: { label: string; serverLabel?: string; status: ScheduleStatus; isNext?: boolean }[];
  rowStatus: ScheduleStatus;
};

export default UnifiedRow;
