import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, getAvailableVenues, venues as allVenues } from "@/lib/booking-data";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import vipBackOneLine from "@/assets/weston-vip-back-one-line.jpg";
import vipBackTwoLines from "@/assets/weston-vip-back-two-lines.jpg";
import FloorPlan from "./FloorPlan";

interface StepVenueProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Venue photos intentionally omitted here — Weston-specific imagery lives on the /spaces gallery.
const venueImages: Record<string, string> = {};

const StepVenue = ({ data, onChange, onNext, onBack }: StepVenueProps) => {
  const isMobile = useIsMobile();
  const available = getAvailableVenues(data.guestCount);
  const availableIds = available.map((v) => v.id);
  const adultCount = data.guestCount - (data.hasKids ? data.kidsCount : 0);
  const showPrivateOption = adultCount > 25;

  // Reset venue if no longer available
  if (data.venue && !availableIds.includes(data.venue)) {
    onChange({ venue: "" });
  }

  const selectedVenueHasImage = data.venue && venueImages[data.venue];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      {(() => {
        const guests = data.guestCount;
        let recommendedId: BookingData["venue"] | "Entire VIP Room" | null = null;
        let recommendationLabel = "";
        if (guests >= 16 && guests <= 20) {
          recommendedId = "VIP Room Front";
          recommendationLabel = "VIP Room — Front";
        } else if (guests > 20 && guests <= 42) {
          recommendedId = "VIP Room Back";
          recommendationLabel = "VIP Room — Back";
        } else if (guests > 42) {
          recommendedId = "Entire VIP Room";
          recommendationLabel = "Entire VIP Room";
        }
        return (
          <>
            <div className="text-center mb-6">
              <p className="text-sm font-body tracking-[0.3em] uppercase text-muted-foreground mb-3">
                Step 2
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
                Select Your Setting
              </h2>
              <p className="mt-3 text-sm text-muted-foreground font-body">
                Based on your party of {guests}, the following spaces are available:
              </p>
            </div>
            {recommendedId && (
              <div className="mb-8 mx-auto max-w-xl border border-primary/40 bg-primary/5 rounded-sm p-5 text-center">
                <p className="text-[11px] font-body tracking-[0.25em] uppercase text-primary/80">
                  Our Recommendation
                </p>
                <p className="mt-2 font-heading text-lg text-foreground">
                  {recommendationLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground font-body">
                  {guests >= 16 && guests <= 20 && "Best for groups of 16–20 guests."}
                  {guests > 20 && guests <= 42 && "Best for groups of more than 20 guests."}
                  {guests > 42 && "Recommended for full privacy or larger parties."}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground/80 font-body italic">
                  If you'd like full privacy at any group size, choose the Entire VIP Room.
                </p>
              </div>
            )}
          </>
        );
      })()}

      {/* Interactive floor plan */}
      <div className="mb-8">
        <FloorPlan
          highlightVenue={
            data.wantsPrivateRoom && data.venue === "Main Room" ? null
            : data.wantsPrivateRoom ? "Entire VIP Room"
            : data.venue
          }
          onSelect={(venueId) => {
            // Entire VIP Room → toggles the private room buyout option
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {allVenues.map((venue) => {
          const isAvailable = availableIds.includes(venue.id);
          const isSelected = isAvailable && data.venue === venue.id && !data.wantsPrivateRoom;
          return (
            <Fragment key={venue.id}>
              <motion.button
                whileHover={isAvailable ? { y: -2 } : undefined}
                onClick={() => isAvailable && onChange({ venue: venue.id, wantsPrivateRoom: false })}
                disabled={!isAvailable}
                className={cn(
                  "border rounded-sm p-8 text-center transition-all duration-300 relative",
                  !isAvailable && "opacity-40 cursor-not-allowed",
                  isSelected
                    ? "border-primary bg-primary/5"
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
                <h3 className="font-heading text-lg font-medium text-foreground">{venue.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground font-body">{venue.capacity}</p>
                <p className="mt-2 text-xs text-muted-foreground/70 font-body">{venue.description}</p>
                {!isAvailable && (
                  <p className="mt-2 text-xs text-destructive font-body italic">
                    Too many guests
                  </p>
                )}
              </motion.button>
              {/* Mobile: show venue image right below selected card */}
              {isMobile && isSelected && venueImages[venue.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden rounded-sm"
                >
                  <img
                    src={venueImages[venue.id]}
                    alt={`${venue.name} dining area`}
                    className="w-full h-48 object-cover rounded-sm"
                  />
                </motion.div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Desktop: Venue Photo after grid */}
      {!isMobile && (
        <AnimatePresence>
          {selectedVenueHasImage && !data.wantsPrivateRoom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 overflow-hidden rounded-sm"
            >
              <img
                src={venueImages[data.venue as string]}
                alt={`${data.venue} dining area`}
                className="w-full h-48 object-cover rounded-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Private Room Option */}
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
              data.wantsPrivateRoom
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-foreground/30"
            )}
          >
            <h3 className="font-heading text-lg font-medium text-foreground">
              Private Event / Full Buyout
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-2">
              Exclusive use of the restaurant for your event (up to 141 guests)
            </p>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground/80 font-body">
              <p className="font-medium text-foreground/70">F&B minimums required (low season):</p>
              <p>Lunch starting at $2,500 · Dinner starting at $3,500</p>
            </div>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground/70 font-body italic">
              <p>Buyout options available:</p>
              <p>Entire VIP Room (66) · Main Dining (75) · Full Buyout (141)</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <p className="mt-3 text-center text-[11px] text-muted-foreground font-body italic">
            U-shape is also available — mention it in special requests if preferred.
          </p>
        </motion.div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground font-body italic">
        Note: The VIP Room is at the back of the restaurant; the Back section features a TV for presentations.
      </p>

      {/* VIP requirements notice */}
      {(data.wantsPrivateRoom || data.venue === "VIP Room Front" || data.venue === "VIP Room Back") && (
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
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>A <span className="font-medium text-foreground">$1,500 food &amp; beverage minimum</span> applies.</span>
            </li>
          </ul>
        </motion.div>
      )}

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
