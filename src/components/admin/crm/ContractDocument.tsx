import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MENU_TIERS, BEVERAGE_PACKAGES, ADDONS, displayName } from "@/lib/crm-data";

interface Event {
  id?: string;
  client_first_name?: string | null;
  client_last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  company_name?: string | null;
  event_name?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  location?: string | null;
  venue?: string | null;
  area?: string | null;
  guest_count?: number | null;
  event_type?: string | null;
  menu_tier?: string | null;
  antipasti_selections?: string[] | null;
  entree_selections?: string[] | null;
  dessert_selections?: string[] | null;
  beverage_package?: string | null;
  addons?: unknown;
  fnb_minimum?: number | null;
  notes?: string | null;
  special_requests?: string | null;
  signature_name?: string | null;
  contract_signed_at?: string | null;
  contract_signed_date?: string | null;
}

const FONT = "'Montserrat', system-ui, sans-serif";
const SERVICE_RATE = 0.23;
const TAX_RATE = 0.08;

const fmt = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-semibold text-sm tracking-wide uppercase mt-6 mb-2 pb-1 border-b border-foreground/30"
      style={{ fontFamily: FONT }}
    >
      {children}
    </h3>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="text-xs">
      <strong className="uppercase tracking-wide">{label}:</strong>{" "}
      <span>{value || "—"}</span>
    </p>
  );
}

export default function ContractDocument({ event }: { event: Event }) {
  const tier = event.menu_tier ? MENU_TIERS[event.menu_tier] : undefined;
  const bev = BEVERAGE_PACKAGES.find((b) => b.value === event.beverage_package);

  // Normalize addons (DB may store array or object map)
  const raw = event.addons;
  const addonValues: string[] = Array.isArray(raw)
    ? (raw as string[])
    : raw && typeof raw === "object"
    ? Object.keys(raw as Record<string, unknown>).filter((k) => (raw as Record<string, unknown>)[k])
    : [];
  const addonItems = addonValues
    .map((v) => ADDONS.find((x) => x.value === v))
    .filter((x): x is (typeof ADDONS)[number] => !!x);

  const guests = Number(event.guest_count) || 0;
  const foodPP = tier?.price || 0;
  const foodTotal = foodPP * guests;
  const bevPP = bev?.price || 0;
  const bevTotal = bevPP * guests;
  const addonsTotal = addonItems.reduce((s, a) => s + (a.price || 0), 0);

  const subtotal = foodTotal + bevTotal + addonsTotal;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const service = Math.round(subtotal * SERVICE_RATE * 100) / 100;
  const grand = Math.round((subtotal + tax + service) * 100) / 100;

  const fnbMin = Number(event.fnb_minimum) || 0;
  const fnbDelta = subtotal - fnbMin;

  const dateStr = event.event_date
    ? format(new Date(event.event_date + "T12:00:00"), "M/d/yyyy")
    : "—";
  const dayStr = event.event_date
    ? format(new Date(event.event_date + "T12:00:00"), "EEEE")
    : "—";
  const venue = event.location || event.venue || "—";
  const signedAt = event.contract_signed_at || event.contract_signed_date;

  return (
    <div
      className="max-w-3xl mx-auto p-8 bg-card text-foreground text-sm leading-relaxed print:p-4"
      style={{ fontFamily: FONT }}
    >
      {/* HEADER */}
      <div className="text-right text-[10px] text-muted-foreground mb-2">
        Updated: {format(new Date(), "M/d/yyyy")}
      </div>
      <div className="border-b-2 border-foreground pb-4 mb-4">
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: FONT }}>
          Salumeria 104
        </h1>
        <p className="text-base mt-1">{event.event_name || "Private Event"}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
          Event Contract
        </p>
      </div>

      {/* ACCOUNT / SALES MANAGER */}
      <ContactsBlock event={event} />


      {/* EVENT SUMMARY */}
      <SectionTitle>Event Summary</SectionTitle>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-muted/60">
            <th className="border border-border p-2 text-left">Date</th>
            <th className="border border-border p-2 text-left">Day</th>
            <th className="border border-border p-2 text-left">Time</th>
            <th className="border border-border p-2 text-left">Location</th>
            <th className="border border-border p-2 text-left">Area</th>
            <th className="border border-border p-2 text-right">Guests</th>
            <th className="border border-border p-2 text-right">F&amp;B Min</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-border p-2">{dateStr}</td>
            <td className="border border-border p-2">{dayStr}</td>
            <td className="border border-border p-2">{event.event_time || "—"}</td>
            <td className="border border-border p-2">{venue}</td>
            <td className="border border-border p-2">{event.area || "—"}</td>
            <td className="border border-border p-2 text-right">{guests}</td>
            <td className="border border-border p-2 text-right">{fmt(fnbMin)}</td>
          </tr>
        </tbody>
      </table>

      {/* SPECIAL INSTRUCTIONS */}
      {(event.special_requests || event.notes) && (
        <>
          <SectionTitle>Special Instructions</SectionTitle>
          <div className="text-xs whitespace-pre-wrap">
            {event.special_requests || event.notes}
          </div>
        </>
      )}

      {/* FOOD */}
      <SectionTitle>Food</SectionTitle>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-muted/60">
            <th className="border border-border p-2 text-left w-16">Qty</th>
            <th className="border border-border p-2 text-left">Item</th>
            <th className="border border-border p-2 text-right w-24">Price</th>
            <th className="border border-border p-2 text-right w-28">Total</th>
          </tr>
        </thead>
        <tbody>
          {tier ? (
            <tr>
              <td className="border border-border p-2 align-top">{guests}</td>
              <td className="border border-border p-2 align-top">
                <div className="font-semibold uppercase">{tier.label} — Per Person</div>
                {!!event.antipasti_selections?.length && (
                  <div className="mt-1"><em>Antipasti:</em> {event.antipasti_selections.join(", ")}</div>
                )}
                {!!event.entree_selections?.length && (
                  <div><em>Entrées:</em> {event.entree_selections.join(", ")}</div>
                )}
                {!!event.dessert_selections?.length && (
                  <div><em>Desserts:</em> {event.dessert_selections.join(", ")}</div>
                )}
              </td>
              <td className="border border-border p-2 text-right align-top">{fmt(foodPP)}</td>
              <td className="border border-border p-2 text-right align-top">{fmt(foodTotal)}</td>
            </tr>
          ) : (
            <tr>
              <td colSpan={4} className="border border-border p-2 text-muted-foreground italic">
                Menu not selected yet
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={3} className="border border-border p-2 text-right font-semibold">Food Subtotal</td>
            <td className="border border-border p-2 text-right font-semibold">{fmt(foodTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* BEVERAGE */}
      <SectionTitle>Beverage</SectionTitle>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-muted/60">
            <th className="border border-border p-2 text-left w-16">Qty</th>
            <th className="border border-border p-2 text-left">Package</th>
            <th className="border border-border p-2 text-right w-24">Price</th>
            <th className="border border-border p-2 text-right w-28">Total</th>
          </tr>
        </thead>
        <tbody>
          {bev ? (
            <tr>
              <td className="border border-border p-2">{bevPP > 0 ? guests : "—"}</td>
              <td className="border border-border p-2 uppercase font-semibold">{bev.label}</td>
              <td className="border border-border p-2 text-right">{bevPP > 0 ? fmt(bevPP) : "—"}</td>
              <td className="border border-border p-2 text-right">{bevPP > 0 ? fmt(bevTotal) : "On consumption"}</td>
            </tr>
          ) : (
            <tr>
              <td colSpan={4} className="border border-border p-2 text-muted-foreground italic">
                Beverage package not selected
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={3} className="border border-border p-2 text-right font-semibold">Beverage Subtotal</td>
            <td className="border border-border p-2 text-right font-semibold">{fmt(bevTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ADD-ONS / OTHERS */}
      {addonItems.length > 0 && (
        <>
          <SectionTitle>Add-ons &amp; Other Services</SectionTitle>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/60">
                <th className="border border-border p-2 text-left">Item</th>
                <th className="border border-border p-2 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {addonItems.map((a) => (
                <tr key={a.value}>
                  <td className="border border-border p-2 uppercase">{a.label}</td>
                  <td className="border border-border p-2 text-right">
                    {a.price > 0 ? fmt(a.price) : "No charge"}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-border p-2 text-right font-semibold">Add-ons Subtotal</td>
                <td className="border border-border p-2 text-right font-semibold">{fmt(addonsTotal)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* TOTALS */}
      <SectionTitle>Pricing Summary</SectionTitle>
      <table className="w-full text-xs border-collapse">
        <tbody>
          <tr>
            <td className="border border-border p-2">Food</td>
            <td className="border border-border p-2 text-right w-32">{fmt(foodTotal)}</td>
          </tr>
          <tr>
            <td className="border border-border p-2">Beverage</td>
            <td className="border border-border p-2 text-right">{fmt(bevTotal)}</td>
          </tr>
          {addonsTotal > 0 && (
            <tr>
              <td className="border border-border p-2">Add-ons</td>
              <td className="border border-border p-2 text-right">{fmt(addonsTotal)}</td>
            </tr>
          )}
          <tr className="font-semibold">
            <td className="border border-border p-2">Subtotal</td>
            <td className="border border-border p-2 text-right">{fmt(subtotal)}</td>
          </tr>
          <tr>
            <td className="border border-border p-2">Sales Tax (8%)</td>
            <td className="border border-border p-2 text-right">{fmt(tax)}</td>
          </tr>
          <tr>
            <td className="border border-border p-2">Service Charge (23%)</td>
            <td className="border border-border p-2 text-right">{fmt(service)}</td>
          </tr>
          <tr className="bg-muted/60 font-bold">
            <td className="border border-border p-2">Grand Total</td>
            <td className="border border-border p-2 text-right">{fmt(grand)}</td>
          </tr>
        </tbody>
      </table>

      {fnbMin > 0 && (
        <div className="text-xs mt-2 flex justify-between">
          <span>F&amp;B Minimum: {fmt(fnbMin)}</span>
          <span className={fnbDelta >= 0 ? "text-primary font-semibold" : "text-destructive font-semibold"}>
            {fnbDelta >= 0 ? "Met" : `Short ${fmt(Math.abs(fnbDelta))}`}
          </span>
        </div>
      )}

      {/* TERMS */}
      <SectionTitle>Terms and Conditions</SectionTitle>
      <div className="text-xs space-y-3 leading-relaxed">
        <p>
          Thank you for choosing Salumeria 104 for your event. By signing this document, you agree to comply with the
          terms and conditions set forth below:
        </p>
        <div>
          <p className="font-semibold">1. Event Confirmation</p>
          <p>Sign the agreement and complete the credit card authorization. Your event is not secured until both are completed; dates may be released if not confirmed.</p>
        </div>
        <div>
          <p className="font-semibold">2. Event Start Time</p>
          <p>We will wait up to 15 minutes past the scheduled start time to begin service. Late starts may shorten your event or result in additional charges.</p>
        </div>
        <div>
          <p className="font-semibold">3. Payment</p>
          <p>Full payment is due at the end of the event by credit card or cash. The card on file is used to secure the reservation and cannot be charged for the final balance — payment must be completed by tapping or inserting the card on the day of the event.</p>
        </div>
        <div>
          <p className="font-semibold">4. Cancellation Policy</p>
          <p>Cancel 7 or more days in advance: no charge. Cancel less than 7 days before: 50% charge. Cancel less than 48 hours before: full charge applied to the card on file.</p>
        </div>
        <div>
          <p className="font-semibold">5. Guest Count</p>
          <p>The final guest count must be confirmed at least 2 business days before the event. The number cannot be lowered after that and you will be charged for all confirmed guests, including no-shows.</p>
        </div>
        <div>
          <p className="font-semibold">6. Bar Policies</p>
          <p>Consumption bars run on a single master tab — individual checks are not permitted. Open Bar packages must include all adult guests; drinks ordered past the package time are billed on consumption.</p>
        </div>
        <div>
          <p className="font-semibold">7. Children Pricing</p>
          <p>Children under 3 are not charged. Children 3–12 are offered a children's menu at $45 per child. Guests over 12 are charged the standard adult rate.</p>
        </div>
        <div>
          <p className="font-semibold">8. Decorations</p>
          <p>Most décor is welcome. Open fire, taper candles and unshielded flames are not allowed — LED candles and traditional votives are fine.</p>
        </div>
        <div>
          <p className="font-semibold">9. Custom Menus</p>
          <p>Send your logo or custom heading at least one week before the event. Otherwise a standard menu will be printed.</p>
        </div>
        <div>
          <p className="font-semibold">10. Allergen Notice</p>
          <p>The client agrees to inform the restaurant of any food allergies or dietary restrictions in advance.</p>
        </div>
      </div>

      {/* SIGNATURE */}
      <SectionTitle>Client Signature</SectionTitle>
      <div className="grid grid-cols-2 gap-8 mt-2">
        <div>
          <div className="border-b border-foreground/40 pb-1 mb-1 min-h-[40px] flex items-end">
            {event.signature_name && (
              <span className="text-lg italic" style={{ fontFamily: FONT }}>
                {event.signature_name}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Signature</p>
        </div>
        <div>
          <div className="border-b border-foreground/40 pb-1 mb-1 min-h-[40px] flex items-end">
            {signedAt && format(new Date(signedAt), "MMMM d, yyyy")}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Date</p>
        </div>
      </div>
    </div>
  );
}
