import { EventEntry } from "@/data/scheduleData";
import { getPHHourMin, ScheduleStatus } from "@/lib/timeUtils";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

function getEventStatus(event: EventEntry, currentMin: number): ScheduleStatus {
  const start = event.startHour * 60 + event.startMin;
  let end = event.endHour * 60 + event.endMin;
  
  // Handle overnight events (e.g., 9 PM - 1 AM)
  if (end <= start) {
    // Overnight: check if we're after start OR before end
    if (currentMin >= start || currentMin < end) return "ongoing";
    if (currentMin < start) return "upcoming";
    return "finished";
  }

  if (currentMin >= start && currentMin < end) return "ongoing";
  if (currentMin < start) return "upcoming";
  return "finished";
}

export function EventsSection({ events }: { events: EventEntry[] }) {
  const { hour, min } = getPHHourMin();
  const currentMin = hour * 60 + min;

  return (
    <div className="card-border rounded-lg overflow-hidden bg-card">
      <div className="bg-secondary px-4 py-2 border-b border-border">
        <h2 className="font-display font-bold text-gold tracking-wider text-lg">Events & Wars</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground font-display text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-2">Event</th>
            <th className="text-left px-4 py-2 hidden sm:table-cell">Period</th>
            <th className="text-left px-4 py-2">Schedule</th>
            <th className="text-center px-4 py-2 w-24">Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, i) => {
            const status = getEventStatus(event, currentMin);
            return (
              <tr key={i} className={cn("border-b border-border/50", status === "ongoing" && "bg-ongoing/5")}>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {event.name}
                  {event.period && <span className="block sm:hidden text-xs text-muted-foreground font-normal">{event.period}</span>}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{event.period || "—"}</td>
                <td className="px-4 py-2.5 text-secondary-foreground">{event.times}</td>
                <td className="px-4 py-2.5 text-center"><StatusBadge status={status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
