import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData } from "@/lib/booking-data";
import { AlertCircle, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import vipBackOneLine from "@/assets/weston-vip-back-one-line.jpg";
import vipBackTwoLines from "@/assets/weston-vip-back-two-lines.jpg";
import vipUShape from "@/assets/weston-vip-u-shape.jpg";
import FloorPlan from "./FloorPlan";

interface StepVenueProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type SpaceCard = {
  id: "vip-front" | "vip-back" | "entire-vip" | "main" | "full-buyout";
  name: string;
  capacity: string;
  description: string;
  minGuests: number;
  maxGuests: number;
  venue: BookingData["venue"];
  wantsPrivateRoom: boolean;
  extra?: string;
};

const SMALL_GROUP_CARDS: SpaceCard[] = [
  {
    id: "vip-front",
    name: "VIP Room — Front",
    capacity: "Up to 24 seated",
    description: "Intimate private section of the VIP Room.",
    minGuests: 5,
    maxGuests: 24,
    venue: "VIP Room Front",
    wantsPrivateRoom: false,
  },
  {
    id: "vip-back",
    name: "VIP Room — Back",
    capacity: "Up to 42 seated",
    description: "Larger private section with a TV for presentations.",
    minGuests: 5,
    maxGuests: 42,
    venue: "VIP Room Back",
    wantsPrivateRoom: false,
  },
  {
    id: "entire-vip",
    name: "Entire VIP Room",
    capacity: "Up to 66 seated · private buyout",
    description: "Full buyout of both VIP sections (Front + Back).",
    minGuests: 5,
    maxGuests: 66,
    venue: "VIP Room Back",
    wantsPrivateRoom: true,
    extra: "F&B minimum from $1,500.",
  },
];

const LARGE_GROUP_CARDS: SpaceCard[] = [
  {
    id: "main",
    name: "Main Dining (Semi-Private)",
    capacity: "Up to 75 seated",
    description: "Semi-private use of our main dining room.",
    minGuests: 71,
    maxGuests: 75,
    venue: "Main Room",
    wantsPrivateRoom: false,
  },
  {
    id: "full-buyout",
    name: "Full Restaurant Buyout",
    capacity: "Up to 141 seated",
    description: "Exclusive use of the entire restaurant for your event.",
    minGuests: 71,
    maxGuests: 141,
    venue: "Main Room",
    wantsPrivateRoom: true,
    extra: "F&B minimums (low season): Lunch from $2,500 · Dinner from $3,500.",
  },
];

const StepVenue = ({ data, onChange, onNext, onBack }: StepVenueProps) => {
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);
  const adultCount = data.guestCount - (data.hasKids ? data.kidsCount : 0);

  const cards: SpaceCard[] = data.isPharmaEvent
    ? [SMALL_GROUP_CARDS[1]]
    : data.guestCount <= 70
    ? SMALL_GROUP_CARDS
    : LARGE_GROUP_CARDS;

  const isCardAvailable = (card: SpaceCard) => data.guestCount <= card.maxGuests;

  const isCardSelected = (card: SpaceCard) => {
    if (card.wantsPrivateRoom) {
      return data.wantsPrivateRoom && data.venue === card.venue;
    }
    return !data.wantsPrivateRoom && data.venue === card.venue;
  };

  const selectCard = (card: SpaceCard) => {
    onChange({ venue: card.venue, wantsPrivateRoom: card.wantsPrivateRoom });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Select Your Setting
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-body">
          Based on your party of {data.guestCount}, choose the space that fits best.
        </p>
      </div>

      {data.guestCount > 141 && (
        <div className="mb-6 mx-auto max-w-xl border border-destructive/40 bg-destructive/5 rounded-sm p-4 text-center">
          <p className="text-xs font-body text-destructive">
            Parties over 141 guests exceed our seated capacity. Please contact us directly for a custom event.
          </p>
        </div>
      )}

      <div className={cn("grid gap-4 grid-cols-1", cards.length > 1 && "sm:grid-cols-2")}>
        {cards.map((card) => {
          const isAvailable = isCardAvailable(card);
          const isSelected = isAvailable && isCardSelected(card);
          return (
            <motion.button
              key={card.id}
              whileHover={isAvailable ? { y: -2 } : undefined}
              onClick={() => isAvailable && selectCard(card)}
              disabled={!isAvailable}
              className={cn(
                "border rounded-sm p-6 text-left transition-all duration-300 relative",
                !isAvailable && "opacity-40 cursor-not-allowed",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : isAvailable
                  ? "border-border bg-card hover:border-foreground/30"
                  : "border-border bg-card"
              )}
            >
              {!isAvailable && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <h3 className="font-heading text-lg font-medium text-foreground">{card.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground font-body">
                {card.capacity}
              </p>
              <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
                {card.description}
              </p>
              {card.extra && (
                <p className="mt-2 text-xs text-foreground/60 font-body italic">{card.extra}</p>
              )}
              {!isAvailable && (
                <p className="mt-3 text-xs text-destructive font-body italic">
                  Exceeds capacity for your party
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Collapsible Floor Plan */}
      <div className="mt-6">
        <Collapsible open={floorPlanOpen} onOpenChange={setFloorPlanOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 border border-border rounded-sm py-3 px-4 text-sm font-body text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
            <span>{floorPlanOpen ? "Hide the full floor plan" : "See the full floor plan"}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", floorPlanOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <FloorPlan
              highlightVenue={
                data.wantsPrivateRoom && data.venue === "Main Room" ? null
                : data.wantsPrivateRoom ? "Entire VIP Room"
                : data.venue
              }
              onSelect={() => { /* informational */ }}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* VIP Back layout chooser */}
      {data.venue === "VIP Room Back" && !data.wantsPrivateRoom && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10"
        >
          <div className="text-center mb-6">
            <p className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Choose your table layout
            </p>
            <h3 className="font-heading text-xl font-medium text-foreground">
              How would you like the VIP Back arranged?
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: "one-line" as const,
                label: "One Long Table",
                description: "A single banquet line — best for conversation across the whole party.",
                image: vipBackOneLine,
              },
              {
                id: "two-lines" as const,
                label: "Two Parallel Tables",
                description: "Two long tables side by side — ideal for larger groups or split seating.",
                image: vipBackTwoLines,
              },
              {
                id: "u-shape" as const,
                label: "U-Shape",
                description: "Open U-shape arrangement — great for presentations and group discussion.",
                image: vipUShape,
              },
            ].map((layout) => {
              const isSelected = data.vipBackLayout === layout.id;
              return (
                <motion.button
                  key={layout.id}
                  whileHover={{ y: -2 }}
                  onClick={() => onChange({ vipBackLayout: layout.id })}
                  className={cn(
                    "border rounded-sm overflow-hidden text-left transition-all duration-300",
                    isSelected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-foreground/30"
                  )}
                >
                  <img
                    src={layout.image}
                    alt={layout.label}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 bg-card">
                    <h4 className="font-heading text-base font-medium text-foreground">
                      {layout.label}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground font-body leading-relaxed">
                      {layout.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* VIP requirements notice */}
      {(() => {
        const isEntireVip =
          data.wantsPrivateRoom &&
          (data.venue === "VIP Room Back" || data.venue === "VIP Room Front");
        const isVipSection =
          !data.wantsPrivateRoom &&
          (data.venue === "VIP Room Front" || data.venue === "VIP Room Back");
        if (!isEntireVip && !isVipSection) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 mx-auto max-w-xl border border-border bg-card rounded-sm p-5"
          >
            <p className="text-[11px] font-body tracking-[0.25em] uppercase text-muted-foreground mb-3 text-center">
              VIP Room Requirements
            </p>
            <ul className="space-y-2 text-xs text-foreground/80 font-body">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>One of our <span className="font-medium text-foreground">set menus</span> must be selected to confirm the booking.</span>
              </li>
              {isEntireVip && (
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Food &amp; beverage <span className="font-medium text-foreground">starts at $1,500</span> for the entire VIP Room.</span>
                </li>
              )}
            </ul>
          </motion.div>
        );
      })()}

      <div className="mt-10 flex justify-center gap-4">
        <button onClick={onBack} className="ghost-button">Back</button>
        <button
          onClick={onNext}
          disabled={!data.venue}
          className={cn(
            "ghost-button-primary",
            !data.venue && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-primary"
          )}
        >
          Continue
        </button>
      </div>
      {!data.venue && (
        <p className="mt-3 text-center text-xs text-muted-foreground font-body italic">
          Please select a setting above to continue.
        </p>
      )}
    </motion.div>
  );
};

export default StepVenue;
