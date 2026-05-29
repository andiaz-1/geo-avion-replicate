import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { BookingData, initialBookingData, calculateQuote, addonPrices, barPackages, KIDS_MENU_PRICE } from "@/lib/booking-data";
import { supabase } from "@/integrations/supabase/client";
import ProgressBar from "./ProgressBar";
import StepBasics from "./StepBasics";
import StepVenue from "./StepVenue";
import StepMenu from "./StepMenu";
import StepAddons from "./StepAddons";
import StepContact from "./StepContact";
import SuccessState from "./SuccessState";

function buildAdditionalInfo(data: BookingData): string {
  const quote = calculateQuote(data);
  const lines: string[] = [];

  lines.push(`Venue: ${data.venue || "TBD"}${data.wantsPrivateRoom ? " (Private/Buyout)" : ""}`);
  lines.push(`Guests: ${data.guestCount} total${data.hasKids && data.kidsCount > 0 ? ` (${quote.adultCount} adults, ${quote.kidsCount} children)` : ""}`);
  lines.push(`Menu: ${data.menu}${quote.isLunch ? " (Lunch)" : ""} — $${quote.menuPerPerson}/pp`);

  if (data.menu === "Classico" && data.courseChoice) {
    lines.push(`Course choice: ${data.courseChoice === "insalate" ? "Insalate (Salad/Soup)" : "Dolci (Dessert)"}`);
  }

  const selections = data.menuSelections || {};
  const selectionEntries = Object.entries(selections).filter(([, items]) => items.length > 0);
  if (selectionEntries.length > 0 && !data.decideLater) {
    for (const [course, items] of selectionEntries) {
      lines.push(`  ${course}: ${items.join(", ")}`);
    }
  } else if (data.decideLater) {
    lines.push("  Menu selections: To be finalized later");
  }

  if (quote.steakSupplement > 0) {
    lines.push(`NY Steak Supplement: +$${quote.steakSupplement}/pp`);
  }

  if (data.beverageStrategy === "open-bar" && data.barType && data.barDuration) {
    const label = barPackages[data.barType].label;
    lines.push(`Beverages: Open Bar — ${label} (${data.barDuration}) $${quote.barPerPerson}/pp`);
  } else if (data.beverageStrategy === "consumption") {
    lines.push("Beverages: On Consumption");
  }

  const activeAddons = Object.entries(data.addons)
    .filter(([, v]) => v)
    .map(([k]) => addonPrices[k as keyof typeof addonPrices].label);
  if (activeAddons.length > 0) {
    lines.push(`Add-ons: ${activeAddons.join(", ")}`);
  }

  const bringItems: string[] = [];
  if (data.bringingCake) bringItems.push("Bringing own cake");
  if (data.bringingDecor) bringItems.push("Bringing own decorations");
  if (bringItems.length > 0) {
    lines.push(bringItems.join(", "));
  }

  if (data.allergens) {
    lines.push(`Allergies/Dietary: ${data.allergens}`);
  }

  if (data.eventName) {
    lines.push(`Event Name/Nature: ${data.eventName}`);
  }

  if (data.specialRequests) {
    lines.push(`Special Requests: ${data.specialRequests}`);
  }

  lines.push("");
  lines.push(`Estimated Total: $${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (incl. 23% service + 7% tax)`);

  return lines.join("\n");
}

const BookingFunnel = () => {
  const [data, setData] = useState<BookingData>(initialBookingData);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  const totalSteps = 5;

  const update = (partial: Partial<BookingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const stepName = useMemo(() => {
    switch (currentStep) {
      case 1: return "basics";
      case 2: return "venue";
      case 3: return "menu";
      case 4: return "addons";
      case 5: return "contact";
      default: return "basics";
    }
  }, [currentStep]);

  // Track each funnel step as a virtual pageview so we can see drop-off in analytics.
  useEffect(() => {
    const path = submitted ? "/book/success" : `/book/step-${currentStep}-${stepName}`;
    try {
      window.history.replaceState({ ...(window.history.state ?? {}), virtualStep: path }, "", path);
    } catch {}
  }, [currentStep, stepName, submitted]);

  const handleNext = () => setCurrentStep((s) => s + 1);
  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const nameParts = data.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const quote = calculateQuote(data);

      const tripleseatPayload = {
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        company: data.company || undefined,
        eventDate: data.date ? format(data.date, "yyyy-MM-dd") : undefined,
        eventTime: data.time || undefined,
        guestCount: data.guestCount,
        additionalInfo: buildAdditionalInfo(data),
        venue: data.venue,
        wantsPrivateRoom: data.wantsPrivateRoom,
      };

      const emailPayload = {
        venue: data.venue,
        wantsPrivateRoom: data.wantsPrivateRoom,
        date: data.date ? format(data.date, "MMM d, yyyy") : "—",
        time: data.time,
        timeTag: quote.isLunch ? "Lunch" : "Dinner",
        guestCount: data.guestCount,
        hasKids: data.hasKids,
        kidsCount: data.kidsCount,
        menu: data.menu,
        courseChoice: data.courseChoice,
        menuSelections: data.menuSelections,
        decideLater: data.decideLater,
        allergens: data.allergens,
        beverageStrategy: data.beverageStrategy,
        barType: data.barType,
        barDuration: data.barDuration,
        addons: data.addons,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        specialRequests: data.specialRequests,
        quote: {
          subtotal: quote.subtotal,
          serviceCharge: quote.serviceCharge,
          salesTax: quote.salesTax,
          grandTotal: quote.grandTotal,
          isConsumption: quote.isConsumption,
        },
      };
      const adultCount = data.guestCount - (data.hasKids ? data.kidsCount : 0);
      const eventPayload = {
        fullName: data.fullName, email: data.email, phone: data.phone, company: data.company,
        eventDate: data.date ? format(data.date, "yyyy-MM-dd") : null,
        time: data.time, isLunch: quote.isLunch,
        guestCount: data.guestCount, adultCount, kidsCount: data.hasKids ? data.kidsCount : 0,
        wantsPrivateRoom: data.wantsPrivateRoom,
        menu: data.menu, courseChoice: data.courseChoice,
        menuSelections: data.menuSelections, decideLater: data.decideLater,
        beverageStrategy: data.beverageStrategy, barType: data.barType, barDuration: data.barDuration,
        addons: data.addons, allergens: data.allergens, specialRequests: [data.eventName ? `Event Name/Nature: ${data.eventName}` : null, data.specialRequests].filter(Boolean).join("\n\n"),
        bringingCake: data.bringingCake, bringingDecor: data.bringingDecor,
        quote: { subtotal: quote.subtotal, serviceCharge: quote.serviceCharge, salesTax: quote.salesTax, grandTotal: quote.grandTotal, isConsumption: quote.isConsumption, menuPerPerson: quote.menuPerPerson, barPerPerson: quote.barPerPerson },
      };

      // We are the CRM now — create-event is the source of truth (also auto-generates the contract).
      // send-booking-email is best-effort notification only; tripleseat is no longer wired up here.
      const [eventResult, emailResult] = await Promise.allSettled([
        supabase.functions.invoke("create-event", { body: eventPayload }),
        supabase.functions.invoke("send-booking-email", { body: emailPayload }),
      ]);

      if (eventResult.status === "rejected") throw eventResult.reason;
      const { data: eventData, error: eventError } = eventResult.value;
      if (eventError) throw eventError;
      if (eventData && eventData.success === false) throw new Error(eventData.error || "Could not save your booking");

      if (eventData?.portalUrl) setPortalUrl(eventData.portalUrl);
      else if (eventData?.portalToken) setPortalUrl(`${window.location.origin}/portal/${eventData.portalToken}`);

      if (emailResult.status === "rejected") {
        console.warn("Email notification failed:", emailResult.reason);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-12 md:py-20">
          <SuccessState
            portalUrl={portalUrl}
            firstName={data.fullName.trim().split(/\s+/)[0]}
            eventDate={data.date ? format(data.date, "MMMM d, yyyy") : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <div className="px-4 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {stepName === "basics" && (
            <StepBasics key="basics" data={data} onChange={update} onNext={handleNext} />
          )}
          {stepName === "venue" && (
            <StepVenue key="venue" data={data} onChange={update} onNext={handleNext} onBack={handleBack} />
          )}
          {stepName === "menu" && (
            <StepMenu key="menu" data={data} onChange={update} onNext={handleNext} onBack={handleBack} />
          )}
          {stepName === "addons" && (
            <StepAddons key="addons" data={data} onChange={update} onNext={handleNext} onBack={handleBack} />
          )}
          {stepName === "contact" && (
            <StepContact key="contact" data={data} onChange={update} onSubmit={handleSubmit} onBack={handleBack} submitting={submitting} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingFunnel;
