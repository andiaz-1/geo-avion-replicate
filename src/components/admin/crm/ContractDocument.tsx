import { format } from "date-fns";
import { MENU_TIERS, BEVERAGE_PACKAGES, ADDONS, displayName } from "@/lib/crm-data";

interface Event {
  client_first_name?: string | null;
  client_last_name?: string | null;
  full_name?: string | null;
  company?: string | null;
  company_name?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  location?: string | null;
  venue?: string | null;
  guest_count?: number | null;
  event_type?: string | null;
  menu_tier?: string | null;
  antipasti_selections?: string[] | null;
  entree_selections?: string[] | null;
  dessert_selections?: string[] | null;
  beverage_package?: string | null;
  addons?: unknown;
  subtotal?: number | null;
  service_charge?: number | null;
  tax_amount?: number | null;
  estimated_total?: number | null;
  signature_name?: string | null;
  contract_signed_at?: string | null;
  contract_signed_date?: string | null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-semibold text-base mb-2" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{title}</h3>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
}

function Row({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>${Number(value || 0).toLocaleString()}</span>
    </div>
  );
}

function SigLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-foreground/30 pb-1 mb-1 min-h-[40px] flex items-end">{value}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function ContractDocument({ event }: { event: Event }) {
  const tier = event.menu_tier ? MENU_TIERS[event.menu_tier] : undefined;
  const bev = BEVERAGE_PACKAGES.find((b) => b.value === event.beverage_package);
  const rawAddons = event.addons;
  const addonsArr: string[] = Array.isArray(rawAddons)
    ? (rawAddons as string[])
    : rawAddons && typeof rawAddons === "object"
    ? Object.keys(rawAddons as Record<string, unknown>).filter(
        (k) => (rawAddons as Record<string, unknown>)[k],
      )
    : [];
  const addonLabels = addonsArr.map((a) => ADDONS.find((x) => x.value === a)?.label || a);
  const signedAt = event.contract_signed_at || event.contract_signed_date;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-card text-foreground text-sm leading-relaxed print:p-4">
      <div className="text-center mb-8 border-b border-border pb-6">
        <h1 className="font-display text-2xl font-semibold text-primary">Salumeria 104</h1>
        <p className="text-muted-foreground mt-1">Private Event Agreement</p>
      </div>

      <div className="space-y-6">
        <Section title="Event Details">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <Detail label="Client" value={displayName(event as never)} />
            {(event.company || event.company_name) && (
              <Detail label="Company" value={event.company || event.company_name} />
            )}
            <Detail
              label="Date"
              value={event.event_date ? format(new Date(event.event_date + "T12:00:00"), "MMMM d, yyyy") : "TBD"}
            />
            <Detail label="Time" value={event.event_time || "TBD"} />
            <Detail label="Location" value={event.location || event.venue || "—"} />
            <Detail label="Guests" value={event.guest_count ?? 0} />
            {event.event_type && <Detail label="Event Type" value={event.event_type} />}
          </div>
        </Section>

        <Section title={`Menu — ${tier?.label || event.menu_tier || "—"}`}>
          {event.antipasti_selections && event.antipasti_selections.length > 0 && (
            <p>
              <strong>Antipasti:</strong> {event.antipasti_selections.join(", ")}
            </p>
          )}
          {event.entree_selections && event.entree_selections.length > 0 && (
            <p className="mt-1">
              <strong>Entrées:</strong> {event.entree_selections.join(", ")}
            </p>
          )}
          {event.dessert_selections && event.dessert_selections.length > 0 && (
            <p className="mt-1">
              <strong>Desserts:</strong> {event.dessert_selections.join(", ")}
            </p>
          )}
          {bev && (
            <p className="mt-1">
              <strong>Beverage:</strong> {bev.label}
            </p>
          )}
          {addonLabels.length > 0 && (
            <p className="mt-1">
              <strong>Add-ons:</strong> {addonLabels.join(", ")}
            </p>
          )}
        </Section>

        <Section title="Financial Summary">
          <div className="bg-muted/40 rounded-sm p-4 space-y-1">
            <Row label="Subtotal" value={event.subtotal} />
            <Row label="Service Charge (23%)" value={event.service_charge} />
            <Row label="Tax (8%)" value={event.tax_amount} />
            <div className="border-t border-border pt-1 font-semibold">
              <Row label="Estimated Total" value={event.estimated_total} />
            </div>
          </div>
        </Section>

        <Section title="Payment Terms">
          <p>Payment is due at the end of your event. Card on file is not charged until the day of the event.</p>
        </Section>

        <Section title="Cancellation Policy">
          <p>
            Cancellations made more than 14 days prior to the event receive a full refund. Cancellations within 14 days are
            subject to a 50% cancellation fee. No-shows will be charged the full estimated amount.
          </p>
        </Section>

        <div className="border-t border-border pt-6 mt-8">
          <h3 className="font-display font-semibold mb-4">Agreement</h3>
          <p className="mb-6">
            By signing below, I agree to the terms outlined in this contract and authorize Salumeria 104 to charge the card
            on file for the final event total.
          </p>
          <div className="grid grid-cols-2 gap-8">
            <SigLine
              label="Client Signature"
              value={
                event.signature_name ? (
                  <span className="font-display text-lg italic">{event.signature_name}</span>
                ) : null
              }
            />
            <SigLine
              label="Date"
              value={signedAt ? format(new Date(signedAt), "MMMM d, yyyy") : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
