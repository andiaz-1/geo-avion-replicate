import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const statusColor: Record<string, string> = {
  new_lead: "bg-amber-200 text-amber-900",
  quote_sent: "bg-amber-200 text-amber-900",
  contract_sent: "bg-amber-300 text-amber-900",
  confirmed: "bg-green-200 text-green-900",
  completed: "bg-green-300 text-green-900",
  cancelled: "bg-gray-300 text-gray-700 line-through",
};

export default function CalendarView({ events, onSelect }: { events: any[]; onSelect: (e: any) => void }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const e of events) {
      if (!e.event_date) continue;
      const d = new Date(e.event_date + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        const k = String(d.getDate());
        (map[k] ||= []).push(e);
      }
    }
    return map;
  }, [events, year, month]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">{monthLabel}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-sm overflow-hidden text-xs">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="bg-muted px-2 py-2 font-medium text-muted-foreground">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className="bg-card min-h-[110px] p-2 align-top">
            {d && <div className="text-foreground font-medium mb-1">{d}</div>}
            {d && (eventsByDay[String(d)] || []).map(e => (
              <button key={e.id} onClick={() => onSelect(e)} className={`block w-full text-left rounded-sm px-2 py-1 mb-1 truncate ${statusColor[e.status] || "bg-muted"}`}>
                {e.full_name} · {e.guest_count}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <span><span className="inline-block w-3 h-3 bg-amber-200 mr-1 align-middle" />Pending</span>
        <span><span className="inline-block w-3 h-3 bg-green-200 mr-1 align-middle" />Confirmed</span>
        <span><span className="inline-block w-3 h-3 bg-gray-300 mr-1 align-middle" />Cancelled</span>
      </div>
    </div>
  );
}
