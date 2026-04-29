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
    id: "Main Room",
    label: "Main Dining Room",
    capacity: "Up to 75 · semi-private or buyout",
    points: "50,42 95,12 95,80 78,90 50,90",
    labelX: 75,
    labelY: 65,
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
          {AREAS.map((area) => {
            const isActive = active === area.id;
            return (
              <polygon
                key={area.id}
                points={area.points}
                onMouseEnter={() => setHovered(area.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(area.id)}
                className={`cursor-pointer transition-all duration-200 ${
                  isActive ? "fill-primary/40 stroke-primary" : "fill-transparent stroke-transparent hover:fill-primary/20"
                }`}
                strokeWidth={0.4}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* Floating label */}
        {activeArea && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute bg-foreground text-background px-3 py-2 rounded-sm shadow-lg text-center"
            style={{
              left: `${activeArea.labelX}%`,
              top: `${activeArea.labelY}%`,
              transform: "translate(-50%, -50%)",
              minWidth: "140px",
            }}
          >
            <p className="font-heading text-xs font-medium leading-tight">{activeArea.label}</p>
            <p className="text-[10px] font-body opacity-80 mt-0.5">{activeArea.capacity}</p>
          </motion.div>
        )}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-3 gap-px bg-border text-center text-[10px] font-body">
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
    </div>
  );
};

export default FloorPlan;
