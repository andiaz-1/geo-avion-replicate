import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, calculateQuote, addonPrices, KIDS_MENU_PRICE } from "@/lib/booking-data";

interface StepContactProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting?: boolean;
}

const StepContact = ({ data, onChange, onSubmit, onBack, submitting }: StepContactProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const quote = calculateQuote(data);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!data.fullName.trim()) errs.fullName = "Name is required";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Valid email required";
    if (!data.phone.trim()) errs.phone = "Phone is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit();
  };

  const activeAddons = Object.entries(data.addons)
    .filter(([, v]) => v)
    .map(([k]) => addonPrices[k as keyof typeof addonPrices].label);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Quote Summary & Contact
        </h2>
      </div>

      <div className="border border-border rounded-sm p-6 bg-muted/30 mb-8 space-y-3">
        <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Your Estimated Quote
        </p>

        <div className="space-y-2 text-sm font-body text-foreground">
          <div className="flex justify-between">
            <span>Venue</span>
            <span className="font-medium">{data.venue}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time</span>
            <span className="font-medium">
              {data.date ? format(data.date, "MMM d, yyyy") : "—"} at {data.time || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Guests</span>
            <span className="font-medium">
              {data.guestCount} total
              {data.hasKids && data.kidsCount > 0 && (
                <span className="text-muted-foreground font-normal"> ({quote.adultCount} adults, {quote.kidsCount} children)</span>
              )}
            </span>
          </div>
          {data.wantsPrivateRoom && (
            <div className="flex justify-between">
              <span>Room</span>
              <span className="font-medium">Private / Buyout</span>
            </div>
          )}

          <div className="border-t border-border my-3" />

          <div className="flex justify-between">
            <span>{data.menu} Menu{quote.isLunch ? " (Lunch)" : ""} (adults)</span>
            <span className="font-medium">${quote.menuPerPerson}pp × {quote.adultCount}</span>
          </div>

          {quote.steakSupplement > 0 && (
            <div className="flex justify-between text-accent">
              <span>NY Steak Supplement</span>
              <span className="font-medium">+${quote.steakSupplement}pp × {data.guestCount}</span>
            </div>
          )}

          {quote.kidsCount > 0 && (
            <div className="flex justify-between">
              <span>Children's Menu{quote.steakSupplement > 0 ? " (incl. steak supplement)" : ""}</span>
              <span className="font-medium">${KIDS_MENU_PRICE + quote.steakSupplement}pp × {quote.kidsCount}</span>
            </div>
          )}

          {data.beverageStrategy === "open-bar" && quote.barPerPerson > 0 && (
            <div className="flex justify-between">
              <span>Open Bar (adults)</span>
              <span className="font-medium">${quote.barPerPerson}pp × {quote.adultCount}</span>
            </div>
          )}

          {quote.addonsTotal > 0 && (
            <div className="flex justify-between">
              <span>Add-ons</span>
              <span className="font-medium">${quote.addonsTotal}</span>
            </div>
          )}

          {activeAddons.length > 0 && (
            <p className="text-xs text-muted-foreground">{activeAddons.join(", ")}</p>
          )}

          {data.allergens && (
            <>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between">
                <span>Allergies/Dietary</span>
                <span className="font-medium text-right max-w-[60%]">{data.allergens}</span>
              </div>
            </>
          )}

          <div className="border-t border-border my-3" />

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">${quote.subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Service Charge (23%)</span>
            <span className="font-medium">${quote.serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Sales Tax (8%)</span>
            <span className="font-medium">${quote.salesTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="border-t border-border my-3" />

          <div className="flex justify-between text-base font-semibold">
            <span>Estimated Total</span>
            <span>${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {quote.isConsumption && (
            <p className="text-xs text-accent italic font-body">
              Plus Beverages on Consumption
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-sm font-body text-muted-foreground italic mb-8">
        This is an estimate to help you plan — once you submit, I'll check availability and prepare a personalized proposal for you.
      </p>

      <div className="space-y-5">
        {[
          { key: "fullName", label: "Full Name", type: "text" },
          { key: "email", label: "Email", type: "email" },
          { key: "phone", label: "Phone", type: "tel" },
          { key: "company", label: "Company Name (Optional)", type: "text" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
              {field.label}
            </label>
            <input
              type={field.type}
              value={(data as any)[field.key]}
              onChange={(e) => onChange({ [field.key]: e.target.value })}
              className={cn(
                "w-full border bg-card px-4 py-3 text-sm font-body rounded-sm transition-colors focus:outline-none focus:border-primary",
                errors[field.key] ? "border-destructive" : "border-border hover:border-foreground/50"
              )}
            />
            {errors[field.key] && (
              <p className="text-xs text-destructive mt-1 font-body">{errors[field.key]}</p>
            )}
          </div>
        ))}

        <div>
          <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Special Requests
          </label>
          <textarea
            value={data.specialRequests}
            onChange={(e) => onChange({ specialRequests: e.target.value })}
            rows={3}
            className="w-full border border-border bg-card px-4 py-3 text-sm font-body rounded-sm transition-colors hover:border-foreground/50 focus:outline-none focus:border-primary resize-none"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button onClick={onBack} className="ghost-button" disabled={submitting}>Back</button>
        <button onClick={handleSubmit} className="filled-button-primary" disabled={submitting}>
          {submitting ? "Submitting…" : "Request Booking"}
        </button>
      </div>
    </motion.div>
  );
};

export default StepContact;
