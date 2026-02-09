import { useState, useEffect, useMemo } from "react";
import { worldBosses, specialAreas, events, allWorlds } from "@/data/scheduleData";
import { ScheduleHeader } from "@/components/ScheduleHeader";
import { WorldBossSection } from "@/components/WorldBossSection";
import { SpecialAreasSection } from "@/components/SpecialAreasSection";
import { EventsSection } from "@/components/EventsSection";

const Index = () => {
  const [worldFilter, setWorldFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [, setTick] = useState(0);

  // Re-render every 30 seconds to update statuses
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const searchLower = search.toLowerCase();

  // Group bosses by world, filtered
  const groupedBosses = useMemo(() => {
    const filtered = worldBosses.filter((b) => {
      if (worldFilter !== "ALL" && b.world !== worldFilter) return false;
      if (searchLower && !b.boss.toLowerCase().includes(searchLower) && !b.map.toLowerCase().includes(searchLower)) return false;
      return true;
    });

    const groups: Record<string, typeof filtered> = {};
    for (const b of filtered) {
      if (!groups[b.world]) groups[b.world] = [];
      groups[b.world].push(b);
    }
    return groups;
  }, [worldFilter, searchLower]);

  const filteredSpecial = useMemo(() => {
    if (worldFilter !== "ALL") return [];
    if (searchLower) return specialAreas.filter((a) => a.name.toLowerCase().includes(searchLower));
    return specialAreas;
  }, [worldFilter, searchLower]);

  const filteredEvents = useMemo(() => {
    if (worldFilter !== "ALL") return [];
    if (searchLower) return events.filter((e) => e.name.toLowerCase().includes(searchLower));
    return events;
  }, [worldFilter, searchLower]);

  const worldOrder = allWorlds.filter((w) => groupedBosses[w]);

  return (
    <div className="min-h-screen bg-background">
      <ScheduleHeader
        worldFilter={worldFilter}
        setWorldFilter={setWorldFilter}
        search={search}
        setSearch={setSearch}
      />

      <main className="container py-6 space-y-6">
        {/* Ornamental divider */}
        <div className="text-center space-y-1">
          <div className="ornament-line mx-auto w-48" />
          <p className="text-xs text-muted-foreground font-display uppercase tracking-[0.3em]">
            World Boss Schedules
          </p>
          <div className="ornament-line mx-auto w-48" />
        </div>

        {worldOrder.map((world) => (
          <WorldBossSection key={world} world={world} bosses={groupedBosses[world]} />
        ))}

        {worldOrder.length === 0 && (
          <p className="text-center text-muted-foreground py-8 font-body text-lg">No bosses match your filter.</p>
        )}

        {filteredSpecial.length > 0 && (
          <>
            <div className="text-center space-y-1 pt-4">
              <div className="ornament-line mx-auto w-48" />
              <p className="text-xs text-muted-foreground font-display uppercase tracking-[0.3em]">
                Special Areas
              </p>
              <div className="ornament-line mx-auto w-48" />
            </div>
            <SpecialAreasSection areas={filteredSpecial} />
          </>
        )}

        {filteredEvents.length > 0 && (
          <>
            <div className="text-center space-y-1 pt-4">
              <div className="ornament-line mx-auto w-48" />
              <p className="text-xs text-muted-foreground font-display uppercase tracking-[0.3em]">
                Events & Wars
              </p>
              <div className="ornament-line mx-auto w-48" />
            </div>
            <EventsSection events={filteredEvents} />
          </>
        )}

        <footer className="text-center py-8 text-muted-foreground text-xs font-body">
          <div className="ornament-line mx-auto w-32 mb-3" />
          MIR4 Schedule Guide · EU Server · All times in PH Time (UTC+8)
        </footer>
      </main>
    </div>
  );
};

export default Index;
