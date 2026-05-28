import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Copy, FileText, ExternalLink } from "lucide-react";

const ADDON_LABELS: Record<string, string> = {
  tablecloths: "White Tablecloths ($60)",
  avSpeaker: "JBL Speaker + 2 Mics ($150)",
  liveMusic: "Live Music (from $300)",
  ownMusician: "Bringing own musician",
};

export function buildContractContent(event: any) {
  const q = event.quote || {};
  const selections = event.menu_selections || {};
  const addons = Object.entries(event.addons || {}).filter(([, v]) => v).map(([k]) => ADDON_LABELS[k] || k);
  return {
    client: event.full_name,
    email: event.email,
    eventDate: event.event_date,
    eventTime: event.event_time,
    location: "Salumeria 104 Weston — 1370 Weston Rd, Weston, FL 33326",
    guestCount: event.guest_count,
    menuTier: event.menu_tier,
    courseChoice: event.course_choice,
    selections,
    beverage: event.beverage_strategy === "open-bar"
      ? `Open Bar — ${event.bar_type} (${event.bar_duration})`
      : event.beverage_strategy === "consumption" ? "Beverages on consumption" : "—",
    addons,
    pricing: {
      subtotal: q.subtotal || 0,
      serviceCharge: q.serviceCharge || 0,
      salesTax: q.salesTax || 0,
      grandTotal: q.grandTotal || 0,
    },
    paymentTerms: "Payment is due at the end of your event. Your credit card on file is not charged until the day of the event.",
    cancellationPolicy: "[INSERT CANCELLATION POLICY HERE]",
  };
}

export default function EventDrawer({ event, onClose, onChange }: { event: any; onClose: () => void; onChange: () => void }) {
  const [notes, setNotes] = useState(event.internal_notes || "");
  const [contract, setContract] = useState<any>(null);
  const [paymentAuth, setPaymentAuth] = useState<any>(null);
  const [header, setHeader] = useState<any>(null);
  const [working, setWorking] = useState(false);
  const portalUrl = `${window.location.origin}/portal/${event.portal_token}`;

  useEffect(() => {
    Promise.all([
      supabase.from("contracts").select("*").eq("event_id", event.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("payment_authorizations").select("*").eq("event_id", event.id).maybeSingle(),
      supabase.from("menu_headers").select("*").eq("event_id", event.id).maybeSingle(),
    ]).then(([c, p, h]) => { setContract(c.data); setPaymentAuth(p.data); setHeader(h.data); });
  }, [event.id]);

  const saveNotes = async () => {
    const { error } = await supabase.from("events").update({ internal_notes: notes }).eq("id", event.id);
    if (error) return toast.error(error.message);
    toast.success("Notes saved"); onChange();
  };

  const generateContract = async () => {
    setWorking(true);
    const content = buildContractContent(event);
    const { error } = await supabase.from("contracts").insert({ event_id: event.id, content });
    if (!error) await supabase.from("events").update({ contract_sent_at: new Date().toISOString(), status: "contract_sent" as any }).eq("id", event.id);
    setWorking(false);
    if (error) return toast.error(error.message);
    toast.success("Contract generated — share the portal link with the client.");
    onChange();
    const { data } = await supabase.from("contracts").select("*").eq("event_id", event.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setContract(data);
  };

  const copyLink = () => { navigator.clipboard.writeText(portalUrl); toast.success("Portal link copied"); };

  const StatusRow = ({ label, done }: { label: string; done: boolean }) => (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span>{label}</span>
      <span className={done ? "text-primary font-medium" : "text-muted-foreground"}>{done ? "✓ Done" : "Pending"}</span>
    </div>
  );

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{event.full_name} — {event.event_date || "TBD"}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="font-semibold mb-2">Client</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div>{event.email} · {event.phone}</div>
              {event.company && <div>{event.company}</div>}
              <div>{event.guest_count} guests · {event.event_time || "—"}</div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Selections</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div>Menu: <span className="text-foreground">{event.menu_tier || "—"}</span> {event.course_choice && `(${event.course_choice})`}</div>
              <div>Beverage: <span className="text-foreground">{event.beverage_strategy || "—"}{event.bar_type ? ` · ${event.bar_type} ${event.bar_duration}` : ""}</span></div>
              <div>Add-ons: {Object.entries(event.addons || {}).filter(([,v]) => v).map(([k]) => ADDON_LABELS[k] || k).join(", ") || "—"}</div>
              {event.allergens && <div>Allergens: {event.allergens}</div>}
              {event.special_requests && <div>Notes: {event.special_requests}</div>}
              <div className="pt-2 font-medium text-foreground">Est. total: ${(event.quote?.grandTotal || 0).toFixed(2)}</div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Step Status</h3>
            <StatusRow label="Contract sent" done={!!event.contract_sent_at} />
            <StatusRow label="Contract signed" done={!!event.contract_signed_at} />
            <StatusRow label="CC authorization" done={!!event.payment_auth_at} />
            <StatusRow label="Menu header" done={!!event.menu_header_at} />
            {paymentAuth && <div className="text-xs text-muted-foreground mt-1">Card on file: •••• {paymentAuth.card_last4} · {paymentAuth.cardholder_name}</div>}
            {header && <div className="text-xs text-muted-foreground">Header: {header.header_type}{header.value ? ` — ${header.value.length > 60 ? header.value.slice(0, 60) + "…" : header.value}` : ""}</div>}
          </section>

          <section className="flex flex-wrap gap-2">
            <Button onClick={generateContract} disabled={working}>
              <FileText className="h-4 w-4 mr-2" />{contract ? "Regenerate contract" : "Generate contract"}
            </Button>
            <Button variant="outline" onClick={copyLink}><Copy className="h-4 w-4 mr-2" />Copy portal link</Button>
            <Button variant="outline" asChild><a href={portalUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Open portal</a></Button>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Internal notes</h3>
            <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
            <Button size="sm" className="mt-2" onClick={saveNotes}>Save notes</Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
