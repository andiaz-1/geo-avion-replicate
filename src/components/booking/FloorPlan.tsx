import { useState } from "react";
import { motion } from "framer-motion";
import floorplan from "@/assets/weston-floorplan.png";

interface FloorPlanProps {
  highlightVenue?: string | null;
  onSelect?: (venue: string) => void;
}

// Polygon coordinates as percentages of the 1202x1098 source image.
// Approximate hit areas for each room.
type Area = {
  id: string;
  label: string;
  capacity: string;
  // SVG polygon points "x,y x,y" in viewBox (0-100 x, 0-100 y)
  points: string;
  // Label position
  labelX: number;
  labelY: number;
};

const AREAS: Area[] = [
  {
    id: "VIP Room Back",
    label: "VIP Room — Back",
    capacity: "Up to 42 · TV for presentations",
    points: "10,15 38,15 38,42 10,42",
    labelX: 24,
    labelY: 28,
  },
  {
    id: "VIP Room Front",
    label: "VIP Room — Front",
    capacity: "Up to 24 · intimate setting",
    points: "10,46 33,46 33,68 10,68",
    labelX: 21,
    labelY: 57,
  },
  {
    id: "Entire VIP Room",
    label: "Entire VIP Room (Front + Back)",
    capacity: "Up to 66 · private · F&B minimum",
    // Wraps both VIP sections — drawn UNDER individual rooms so individual rooms still take priority on hover
    points: "8,13 40,13 40,70 8,70",
    labelX: 24,
    labelY: 41,
  },
  {
    id: "Main Room",
    label: "Main Dining Room",
    capacity: "Up to 75 · semi-private or buyout",
    points: "50,15 95,15 95,85 50,85",
    labelX: 72,
    labelY: 50,
  },
];

const FloorPlan = ({ highlightVenue, onSelect }: FloorPlanProps) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? highlightVenue ?? null;
  const activeArea = AREAS.find((a) => a.id === active);

  return (
    <div className="border border-border rounded-sm overflow-hidden bg-card">
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-heading text-sm font-medium tracking-wide">Floor Plan</h4>
        <p className="text-[10px] font-body tracking-[0.25em] uppercase text-muted-foreground">
          Hover a room to highlight
        </p>
      </div>
      <div className="relative bg-card">
        <img
          src={floorplan}
          alt="Salumeria 104 Weston floor plan"
          className="block w-full h-auto select-none"
          draggable={false}
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <filter id="room-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Render "Entire VIP Room" first so individual VIP areas overlay on top for hover priority */}
          {[...AREAS]
            .sort((a, b) => (a.id === "Entire VIP Room" ? -1 : b.id === "Entire VIP Room" ? 1 : 0))
            .map((area) => {
              const isActive = active === area.id;
              const isWrapper = area.id === "Entire VIP Room";
              return (
                <polygon
                  key={area.id}
                  points={area.points}
                  onMouseEnter={() => setHovered(area.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelect?.(area.id)}
                  filter={isActive ? "url(#room-glow)" : undefined}
                  className={`cursor-pointer transition-all duration-300 ease-out ${
                    isActive
                      ? isWrapper
                        ? "fill-primary/20 stroke-primary"
                        : "fill-primary/35 stroke-primary"
                      : "fill-transparent stroke-transparent hover:fill-primary/20 hover:stroke-primary/70"
                  }`}
                  strokeWidth={isWrapper ? 0.7 : 0.5}
                  strokeDasharray={isWrapper ? "1.5 1" : undefined}
                  vectorEffect="non-scaling-stroke"
                  style={{ transformOrigin: "center", transformBox: "fill-box" }}
                />
              );
            })}
        </svg>

        {/* Floating label */}
        {activeArea && (
          <motion.div
            key={activeArea.id}
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-none absolute bg-foreground text-background px-3.5 py-2 rounded-sm shadow-xl ring-1 ring-primary/40 text-center"
            style={{
              left: `${activeArea.labelX}%`,
              top: `${activeArea.labelY}%`,
              transform: "translate(-50%, -50%)",
              minWidth: "150px",
            }}
          >
            <p className="font-heading text-xs font-medium leading-tight tracking-wide">{activeArea.label}</p>
            <p className="text-[10px] font-body opacity-80 mt-0.5">{activeArea.capacity}</p>
          </motion.div>
        )}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border text-center text-[10px] font-body">
        {AREAS.map((area) => {
          const isActive = active === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onMouseEnter={() => setHovered(area.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect?.(area.id)}
              className={`px-2 py-3 transition-colors ${
                isActive ? "bg-primary/10 text-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <p className="tracking-[0.15em] uppercase">{area.label}</p>
            </button>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <p className="text-[11px] font-body text-muted-foreground italic leading-relaxed text-center">
          The <span className="text-foreground font-medium not-italic">VIP Room</span> is one continuous space — we divide the <span className="text-foreground font-medium not-italic">Front</span> and <span className="text-foreground font-medium not-italic">Back</span> sections with a curtain for privacy, or open it fully for groups up to 66.
        </p>
      </div>
    </div>
  );
};

export default FloorPlan;
