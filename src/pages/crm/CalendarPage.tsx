import { useState } from "react";
import { CrmCard, CrmPageTitle, CrmButton } from "@/components/crm/CrmPrimitives";
import { calendarEvents } from "@/data/crmMock";
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";

const TODAY = new Date(2026, 5, 12); // Jun 12 2026

const colorMap = {
  green: "bg-[#2f6b3a] text-white",
  gray: "bg-[#4a4a4a] text-white",
  teal: "bg-[#3aa6a0] text-white",
} as const;

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date(2026, 5, 1)); // June 2026
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = new Date(d.getTime() + 86400000)) days.push(new Date(d));

  return (
    <div className="space-y-5">
      <CrmPageTitle>Calendar</CrmPageTitle>

      <CrmCard>
        <h3 className="font-semibold text-sm mb-1">Sync with Google Calendar</h3>
        <p className="text-xs text-muted-foreground mb-3">Subscribe to this iCal URL in Google Calendar, Apple Calendar, or Outlook to see all events.</p>
        <div className="flex gap-2">
          <input readOnly value="https://smart-event-360.app/ical/feed/abc123xyz.ics" className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-muted/30" />
          <CrmButton variant="outline"><Copy className="h-3.5 w-3.5" /> Copy</CrmButton>
        </div>
      </CrmCard>

      <CrmCard>
        <div className="flex items-center justify-between mb-4">
          <CrmButton variant="outline" onClick={() => setCursor(new Date(2026, 5, 1))}>Today</CrmButton>
          <div className="flex items-center gap-3">
            <button onClick={() => setCursor((c) => addMonths(c, -1))} className="p-1 hover:bg-muted/50 rounded"><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-semibold text-base min-w-[140px] text-center">{format(cursor, "MMMM yyyy")}</span>
            <button onClick={() => setCursor((c) => addMonths(c, 1))} className="p-1 hover:bg-muted/50 rounded"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-7 gap-px bg-border crm-dark:bg-white/10 border border-border crm-dark:border-white/10 rounded-md overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="bg-muted/30 crm-dark:bg-white/5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-2 text-center">{d}</div>
          ))}
          {days.map((day) => {
            const inMonth = isSameMonth(day, cursor);
            const isToday = isSameDay(day, TODAY);
            const dayEvents = calendarEvents.filter((e) => isSameDay(parseISO(e.date), day));
            return (
              <div key={day.toISOString()} className={`bg-white crm-dark:bg-[#1a2230] min-h-[110px] p-1.5 ${!inMonth ? "opacity-40" : ""}`}>
                <div className="flex justify-end mb-1">
                  <span className={`text-xs h-6 w-6 inline-flex items-center justify-center rounded-full ${isToday ? "bg-[#9b7fc7] text-white font-semibold" : "text-muted-foreground"}`}>
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayEvents.map((e, i) => (
                    <div key={i} className={`text-[10px] leading-tight rounded px-1.5 py-1 ${colorMap[e.color]}`}>
                      <div className="font-semibold">{e.time} {e.title}</div>
                      <div className="opacity-90 truncate">• {e.venueDetail} ({e.guests}) • {e.contact}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CrmCard>
    </div>
  );
}
