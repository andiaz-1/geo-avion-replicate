import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_DOT_COLORS, STATUS_LABELS, displayName, lastName } from "@/lib/crm-data";

interface Event {
  id: string;
  event_date?: string | null;
  status: string;
  [k: string]: unknown;
}

export default function CalendarBoard({ events }: { events: Event[] }) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(month) });
  const startPad = getDay(monthStart);

  const eventsForDay = (day: Date) =>
    events.filter((e) => e.event_date && isSameDay(new Date(e.event_date + "T12:00:00"), day));
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(subMonths(month, 1))} className="p-2 hover:bg-muted rounded-sm">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-display text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
        <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 hover:bg-muted rounded-sm">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-sm overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-muted text-xs font-medium uppercase text-muted-foreground p-2 text-center">
            {d}
          </div>
        ))}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-card p-2 min-h-[80px]" />
        ))}
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`bg-card p-2 min-h-[80px] cursor-pointer hover:bg-muted/50 transition-colors ${
                isSelected ? "ring-2 ring-primary ring-inset" : ""
              }`}
            >
              <div className={`text-sm ${isToday ? "font-bold text-primary" : "text-foreground"}`}>
                {format(day, "d")}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="text-[10px] truncate px-1 py-0.5 rounded bg-primary/10 text-primary"
                  >
                    {lastName(e as never) || displayName(e as never)}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && selectedEvents.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Events on {format(selectedDay, "MMMM d, yyyy")}</h3>
          <div className="space-y-2">
            {selectedEvents.map((e) => (
              <Link
                key={e.id}
                to={`/admin/events/${e.id}`}
                className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted rounded-sm transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">{displayName(e as never)}</div>
                  <div className="text-xs text-muted-foreground">
                    {(e as { event_type?: string }).event_type || "—"} ·{" "}
                    {(e as { location?: string; venue?: string }).location ||
                      (e as { venue?: string }).venue ||
                      "—"}{" "}
                    · {(e as { guest_count?: number }).guest_count ?? 0} guests
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[e.status] || "bg-muted"}`} />
                  <span className="text-xs text-muted-foreground">{STATUS_LABELS[e.status] || e.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
