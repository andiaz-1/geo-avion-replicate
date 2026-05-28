import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLUMNS: { id: string; label: string }[] = [
  { id: "new_lead", label: "New Lead" },
  { id: "quote_sent", label: "Quote Sent" },
  { id: "contract_sent", label: "Contract Sent" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
];

function daysUntil(date: string | null) {
  if (!date) return null;
  const d = new Date(date + "T00:00:00").getTime();
  return Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function PipelineView({ events, onSelect, onChange }: { events: any[]; onSelect: (e: any) => void; onChange: () => void }) {
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const c of COLUMNS) g[c.id] = [];
    for (const e of events) if (g[e.status]) g[e.status].push(e);
    return g;
  }, [events]);

  const move = async (id: string, status: string) => {
    const { error } = await supabase.from("events").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    onChange();
  };

  return (
    <div className="grid grid-cols-5 gap-3 overflow-x-auto">
      {COLUMNS.map(col => (
        <div
          key={col.id}
          className="bg-muted/40 border border-border rounded-sm p-3 min-h-[400px]"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { const id = e.dataTransfer.getData("text/plain"); if (id) move(id, col.id); }}
        >
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex justify-between">
            <span>{col.label}</span><span>{grouped[col.id].length}</span>
          </div>
          <div className="space-y-2">
            {grouped[col.id].map(e => {
              const du = daysUntil(e.event_date);
              return (
                <div
                  key={e.id}
                  draggable
                  onDragStart={ev => ev.dataTransfer.setData("text/plain", e.id)}
                  onClick={() => onSelect(e)}
                  className="bg-card border border-border rounded-sm p-3 text-sm cursor-pointer hover:border-primary"
                >
                  <div className="font-medium text-foreground">{e.full_name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{e.event_date || "TBD"} · {e.guest_count} guests</div>
                  <div className="text-xs text-muted-foreground">Est. ${(e.quote?.grandTotal || 0).toFixed(0)}</div>
                  {du !== null && <div className={`text-xs mt-1 ${du < 14 ? "text-secondary font-medium" : "text-muted-foreground"}`}>{du >= 0 ? `${du} days away` : `${Math.abs(du)} days ago`}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
