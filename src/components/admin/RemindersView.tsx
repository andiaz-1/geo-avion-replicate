import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Flag = { eventId: string; kind: string; label: string; event: any };

function daysUntil(date: string | null) {
  if (!date) return Infinity;
  return Math.ceil((new Date(date + "T00:00:00").getTime() - Date.now()) / 86400000);
}

function hoursSince(ts: string | null) {
  if (!ts) return -1;
  return (Date.now() - new Date(ts).getTime()) / 3600000;
}

export default function RemindersView({ events, onSelect }: { events: any[]; onSelect: (e: any) => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  const flags = useMemo<Flag[]>(() => {
    const out: Flag[] = [];
    for (const e of events) {
      const du = daysUntil(e.event_date);
      if (e.contract_sent_at && !e.contract_signed_at && hoursSince(e.contract_sent_at) > 48) {
        out.push({ eventId: e.id, kind: "contract_48h", label: "Contract unsigned >48h", event: e });
      }
      if (du <= 21 && du > 0 && (e.decide_later || !e.menu_selections || Object.keys(e.menu_selections).length === 0)) {
        out.push({ eventId: e.id, kind: "menu_selections", label: `Menu selections incomplete · ${du}d out`, event: e });
      }
      if (du <= 14 && du > 0 && !e.payment_auth_at) {
        out.push({ eventId: e.id, kind: "cc_auth_14d", label: `CC authorization missing · ${du}d out`, event: e });
      }
      if (du <= 10 && du > 0 && !e.menu_header_at) {
        out.push({ eventId: e.id, kind: "menu_header_10d", label: `Menu header not received · ${du}d out`, event: e });
      }
    }
    return out;
  }, [events]);

  const nudge = async (f: Flag) => {
    setBusy(f.eventId + f.kind);
    const { error } = await supabase.functions.invoke("send-reminder", { body: { eventId: f.eventId, kind: f.kind } });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Nudge sent");
  };

  if (flags.length === 0) return <div className="text-muted-foreground">All clear — no reminders.</div>;

  return (
    <div className="space-y-2">
      {flags.map((f, i) => (
        <div key={i} className="bg-card border border-border rounded-sm p-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => onSelect(f.event)}>
            <div className="font-medium text-foreground">{f.event.full_name} — {f.event.event_date || "TBD"}</div>
            <div className="text-sm text-secondary">{f.label}</div>
          </div>
          <Button size="sm" onClick={() => nudge(f)} disabled={busy === f.eventId + f.kind || f.kind === "menu_selections"}>
            {f.kind === "menu_selections" ? "Contact client" : busy === f.eventId + f.kind ? "Sending…" : "Send Nudge"}
          </Button>
        </div>
      ))}
    </div>
  );
}
