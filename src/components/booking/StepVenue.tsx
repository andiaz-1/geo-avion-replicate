import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, getAvailableVenues, venues as allVenues } from "@/lib/booking-data";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import venueMainRoom from "@/assets/venue-main-room.jpg";
import venueVipRoom from "@/assets/venue-vip-room.jpg";

interface StepVenueProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const venueImages: Record<string, string> = {
  "Main Room": venueMainRoom,
  "VIP Room Front": venueVipRoom,
  "VIP Room Back": venueVipRoom,
};

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
      <div className="text-center mb-10">
        <p className="text-sm font-body tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Step 2
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Select Your Setting
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-body">
          Based on your party of {data.guestCount}, the following spaces are available:
        </p>
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

      <p className="mt-6 text-center text-xs text-muted-foreground font-body italic">
        Note: The VIP Room is located at the back of the restaurant, with the Back section featuring a TV for presentations.
      </p>

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
