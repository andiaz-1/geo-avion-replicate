import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Minus, Plus, ExternalLink, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, timeSlots, getTimeTag } from "@/lib/booking-data";
import { LOCATION } from "@/lib/location";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StepBasicsProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

const StepBasics = ({ data, onChange, onNext }: StepBasicsProps) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const handleTimeSelect = (time: string) => {
    onChange({ time, timeTag: getTimeTag(time) });
    setTimeOpen(false);
  };

  const handleKidsToggle = (hasKids: boolean) => {
    onChange({ hasKids, kidsCount: hasKids ? data.kidsCount || 1 : 0 });
  };

  const maxKids = Math.max(0, data.guestCount - 1);
  const isSmallGroup = data.guestCount >= 8 && data.guestCount <= 15;
  const canPharmaBook = isSmallGroup && data.isPharmaEvent;
  const isValid = !!(data.date && data.time && (data.guestCount >= 16 || canPharmaBook));

  const missingBasics: string[] = [];
  if (!data.date) missingBasics.push("a date");
  if (!data.time) missingBasics.push("a time");
  if (data.guestCount < 8) missingBasics.push("a party of at least 8 guests");
  else if (isSmallGroup && !data.isPharmaEvent) missingBasics.push("the pharma / medical event confirmation");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-10">
        <p className="text-sm font-body tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Step 1
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Begin Your Italian Celebration
        </h2>
        <p className="mt-3 text-xs tracking-[0.25em] uppercase text-muted-foreground font-body">
          {LOCATION.brand} · {LOCATION.city}
        </p>
      </div>

      <div className="space-y-6">
        {/* Date Picker */}
        <div>
          <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Date of Your Event
          </label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-between border border-border bg-card px-4 py-3 text-sm font-body rounded-sm transition-colors hover:border-foreground/50",
                  !data.date && "text-muted-foreground"
                )}
              >
                <span>{data.date ? format(data.date, "MMMM d, yyyy") : "Select a date"}</span>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.date}
                onSelect={(date) => {
                  onChange({ date: date || undefined });
                  if (date) setDateOpen(false);
                }}
                disabled={(date) => {
                  const minDate = new Date();
                  minDate.setHours(0, 0, 0, 0);
                  minDate.setDate(minDate.getDate() + 3);
                  return date < minDate;
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Dropdown */}
        <div>
          <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Time of Reservation
          </label>
          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-between border border-border bg-card px-4 py-3 text-sm font-body rounded-sm transition-colors hover:border-foreground/50",
                  !data.time && "text-muted-foreground"
                )}
              >
                <span>
                  {data.time ? `${data.time} — ${data.timeTag}` : "Select a time"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-y-auto" align="start">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleTimeSelect(slot)}
                  className={cn(
                    "w-full px-4 py-2.5 text-sm font-body text-left hover:bg-muted transition-colors",
                    data.time === slot && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  {slot}
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({getTimeTag(slot)})
                  </span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Guest Count - Stepper */}
        <div>
          <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Total Number of Guests
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const count = Math.max(1, data.guestCount - 1);
                const updates: Partial<BookingData> = { guestCount: count };
                if (data.hasKids && data.kidsCount >= count) {
                  updates.kidsCount = Math.max(0, count - 1);
                }
                onChange(updates);
              }}
              disabled={data.guestCount <= 1}
              className={cn(
                "w-10 h-10 flex items-center justify-center border rounded-sm transition-all duration-200",
                data.guestCount <= 1
                  ? "border-border/50 text-muted-foreground/30 cursor-not-allowed"
                  : "border-border text-foreground hover:border-primary hover:text-primary"
              )}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-heading text-3xl text-foreground min-w-[3ch] text-center tabular-nums">
              {data.guestCount}
            </span>
            <button
              onClick={() => {
                const count = Math.min(200, data.guestCount + 1);
                onChange({ guestCount: count });
              }}
              disabled={data.guestCount >= 200}
              className={cn(
                "w-10 h-10 flex items-center justify-center border rounded-sm transition-all duration-200",
                data.guestCount >= 200
                  ? "border-border/50 text-muted-foreground/30 cursor-not-allowed"
                  : "border-border text-foreground hover:border-primary hover:text-primary"
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Note for fewer than 8 guests */}
          <AnimatePresence>
            {data.guestCount < 8 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border border-primary/20 bg-primary/5 rounded-sm p-4 mt-2">
                  <p className="text-sm font-body text-foreground">
                    For parties of fewer than 8, please make a reservation directly on our website:
                  </p>
                  <a
                    href={LOCATION.smallPartyReservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-body font-medium text-primary hover:underline mt-2"
                  >
                    Reserve a Table <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pharma / medical event check for 8-15 */}
          <AnimatePresence>
            {isSmallGroup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border border-accent/30 bg-accent/5 rounded-sm p-4 mt-2 space-y-3">
                  <p className="text-xs font-body text-foreground/80">
                    Groups of 8–15 can book through this tool when it's a pharma or medical event.
                  </p>
                  <button
                    onClick={() => onChange({ isPharmaEvent: !data.isPharmaEvent })}
                    className="flex items-start gap-3 w-full text-left"
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-5 h-5 flex items-center justify-center border rounded-sm transition-colors flex-shrink-0",
                        data.isPharmaEvent
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-card"
                      )}
                    >
                      {data.isPharmaEvent && (
                        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-body text-foreground">
                      This is a pharma or medical event
                    </span>
                  </button>
                  {!data.isPharmaEvent && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs font-body text-muted-foreground">
                        Otherwise, for à la carte dining for your group, please contact the restaurant directly:
                      </p>
                      <a
                        href={`tel:${LOCATION.restaurantPhoneTel}`}
                        className="inline-flex items-center gap-1.5 text-sm font-body font-medium text-primary hover:underline mt-2"
                      >
                        <Phone className="h-3.5 w-3.5" /> {LOCATION.restaurantPhone}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kids Question — hidden for pharma/medical events */}
        {!data.isPharmaEvent && (
          <div>
            <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Will there be children? <span className="normal-case tracking-normal">(Ages 3–12)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  onClick={() => handleKidsToggle(val)}
                  className={cn(
                    "border rounded-sm px-4 py-3 text-sm font-body transition-all duration-300",
                    data.hasKids === val
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Kids Count */}
        <AnimatePresence>
          {data.hasKids && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
                How many children?
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const count = Math.max(1, data.kidsCount - 1);
                    onChange({ kidsCount: count });
                  }}
                  disabled={data.kidsCount <= 1}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center border rounded-sm transition-all duration-200",
                    data.kidsCount <= 1
                      ? "border-border/50 text-muted-foreground/30 cursor-not-allowed"
                      : "border-border text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-heading text-3xl text-foreground min-w-[3ch] text-center tabular-nums">
                  {data.kidsCount}
                </span>
                <button
                  onClick={() => {
                    const count = Math.min(maxKids, data.kidsCount + 1);
                    onChange({ kidsCount: count });
                  }}
                  disabled={data.kidsCount >= maxKids}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center border rounded-sm transition-all duration-200",
                    data.kidsCount >= maxKids
                      ? "border-border/50 text-muted-foreground/30 cursor-not-allowed"
                      : "border-border text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-2 italic">
                Children's menu is a flat $45 per child, regardless of menu selection.
              </p>
              {data.kidsCount > 0 && (
                <p className="text-xs text-foreground/70 font-body mt-1">
                  {data.guestCount - data.kidsCount} adults · {data.kidsCount} children
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "ghost-button-primary",
            !isValid && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-primary"
          )}
        >
          {isSmallGroup ? "Book With a Set Menu" : "Continue"}
        </button>
        {!isValid && missingBasics.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground font-body italic">
            Please select {missingBasics.join(" and ")} to continue.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StepBasics;
