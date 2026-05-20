import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, getAvailableVenues } from "@/lib/booking-data";
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
  id: "vip-front" | "vip-back" | "main" | "entire-vip";
  name: string;
  capacity: string;
  description: string;
  maxGuests: number;
  venue: BookingData["venue"];
  wantsPrivateRoom: boolean;
};

const SPACE_CARDS: SpaceCard[] = [
  {
    id: "vip-front",
    name: "VIP Room — Front",
    capacity: "Up to 24 seated",
    description: "Intimate private section of the VIP Room.",
    maxGuests: 24,
    venue: "VIP Room Front",
    wantsPrivateRoom: false,
  },
  {
    id: "vip-back",
    name: "VIP Room — Back",
    capacity: "Up to 42 seated",
    description: "Larger private section with a TV for presentations.",
    maxGuests: 42,
    venue: "VIP Room Back",
    wantsPrivateRoom: false,
  },
  {
    id: "main",
    name: "Main Dining",
    capacity: "Up to 75 seated",
    description: "Semi-private main dining area in the heart of the restaurant.",
    maxGuests: 75,
    venue: "Main Room",
    wantsPrivateRoom: false,
  },
  {
    id: "entire-vip",
    name: "Entire VIP Room",
    capacity: "Up to 66 seated · private buyout",
    description: "Full buyout of both VIP sections (Front + Back). F&B minimum from $1,500.",
    maxGuests: 66,
    venue: "VIP Room Back",
    wantsPrivateRoom: true,
  },
];

const StepVenue = ({ data, onChange, onNext, onBack }: StepVenueProps) => {
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);
  const available = getAvailableVenues(data.guestCount);
  const availableIds = (data.isPharmaEvent
    ? available.filter((v) => v.id === "VIP Room Back")
    : available
  ).map((v) => v.id);
  const adultCount = data.guestCount - (data.hasKids ? data.kidsCount : 0);
  const showPrivateOption = !data.isPharmaEvent && adultCount > 25;

  const isCardAvailable = (card: SpaceCard) => {
    if (data.guestCount > card.maxGuests) return false;
    if (card.id === "entire-vip") {
      // Entire VIP buyout available for everyone within capacity (covers pharma + small-party + general buyout)
      return adultCount <= 66;
    }
    if (data.isPharmaEvent) return card.venue === "VIP Room Back";
    return (availableIds as string[]).includes(card.venue as string);
  };

  const isCardSelected = (card: SpaceCard) => {
    if (card.id === "entire-vip") {
      return data.wantsPrivateRoom && data.venue === "VIP Room Back" && !showPrivateOption
        ? true
        : data.wantsPrivateRoom && data.venue === "VIP Room Back";
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

      {/* 4 space cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SPACE_CARDS.map((card) => {
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
              {!isAvailable && (
                <p className="mt-3 text-xs text-destructive font-body italic">
                  {data.isPharmaEvent && card.venue !== "VIP Room Back"
                    ? "Requires VIP Back (TV)"
                    : "Exceeds capacity for your party"}
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
              onSelect={(venueId) => {
                if (venueId === "Entire VIP Room") {
                  if (adultCount <= 66) {
                    onChange({ venue: "VIP Room Back", wantsPrivateRoom: true });
                  }
                  return;
                }
                const v = venueId as Exclude<BookingData["venue"], "">;
                if ((availableIds as string[]).includes(v)) {
                  onChange({ venue: v, wantsPrivateRoom: false });
                }
              }}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Full restaurant buyout (non-pharma, larger parties) */}
      {showPrivateOption && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6"
        >
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => onChange({ venue: "Main Room", wantsPrivateRoom: true })}
            className={cn(
              "w-full border rounded-sm p-8 text-center transition-all duration-300",
              data.wantsPrivateRoom && data.venue === "Main Room"
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-foreground/30"
            )}
          >
            <h3 className="font-heading text-lg font-medium text-foreground">
              Private Event / Full Restaurant Buyout
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-2">
              Exclusive use of the restaurant for your event (up to 141 guests)
            </p>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground/80 font-body">
              <p className="font-medium text-foreground/70">F&B minimums required (low season):</p>
              <p>Lunch starting at $2,500 · Dinner starting at $3,500</p>
            </div>
          </motion.button>
        </motion.div>
      )}

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
