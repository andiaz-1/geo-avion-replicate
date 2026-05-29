import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EventCard from "./EventCard";
import { STATUS_LABELS } from "@/lib/crm-data";

const COLUMNS = ["new_lead", "quote_sent", "contract_sent", "confirmed", "completed"] as const;

interface Event {
  id: string;
  status: string;
  [k: string]: unknown;
}

export default function PipelineBoard({
  events,
  onChange,
}: {
  events: Event[];
  onChange: () => void;
}) {
  const move = async (id: string, status: string) => {
    const { error } = await supabase.from("events").update({ status: status as never }).eq("id", id);
    if (error) return toast.error(error.message);
    onChange();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto">
      {COLUMNS.map((col) => {
        const colEvents = events.filter((e) => e.status === col);
        return (
          <div
            key={col}
            className="bg-muted/40 border border-border rounded-sm p-3 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              if (id) move(id, col);
            }}
          >
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex justify-between">
              <span>{STATUS_LABELS[col]}</span>
              <span>{colEvents.length}</span>
            </div>
            <div className="space-y-2">
              {colEvents.map((e) => (
                <div
                  key={e.id}
                  draggable
                  onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <EventCard event={e as never} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
