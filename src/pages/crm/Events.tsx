import { Link } from "react-router-dom";
import { Search, Users, MessageSquare, Clock, MapPin, ChevronDown } from "lucide-react";
import { CrmCard, CrmPageTitle, CrmButton, CrmTH, CrmTD, Avatar } from "@/components/crm/CrmPrimitives";
import { events } from "@/data/crmMock";
import { format, parseISO } from "date-fns";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function Events() {
  return (
    <div className="space-y-5">
      <CrmPageTitle>Events</CrmPageTitle>
      <CrmCard>
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              placeholder="Search event..."
              className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white"
            />
            <CrmButton variant="primary"><Search className="h-4 w-4" /> Search</CrmButton>
          </div>
          <CrmButton variant="primary">Create Event</CrmButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <CrmTH><input type="checkbox" /></CrmTH>
                <CrmTH>ID</CrmTH>
                <CrmTH>Name</CrmTH>
                <CrmTH>Who</CrmTH>
                <CrmTH>When</CrmTH>
                <CrmTH>Where</CrmTH>
                <CrmTH>Actions</CrmTH>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-border crm-dark:border-white/10 hover:bg-muted/30 crm-dark:hover:bg-white/5">
                  <CrmTD><input type="checkbox" /></CrmTD>
                  <CrmTD>
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                          e.badge === "P" ? "bg-[#9b7fc7]" : "bg-[#2f6b3a]"
                        }`}
                      >
                        {e.badge}
                      </span>
                      <span className="text-xs text-muted-foreground">#{e.id}</span>
                    </div>
                  </CrmTD>
                  <CrmTD>
                    <Link to={`/crm/events/${e.id}`} className="font-semibold hover:text-[#9b7fc7]">{e.name}</Link>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {e.guests} Guests</div>
                      <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {e.discussions} discussion(s)</div>
                    </div>
                  </CrmTD>
                  <CrmTD>
                    <div className="flex items-start gap-2">
                      <Avatar name={e.contact.name} />
                      <div className="text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{e.contact.name}</span>
                          <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Primary</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{e.contact.email}</div>
                        <div className="text-xs text-muted-foreground">{e.contact.phone}</div>
                      </div>
                    </div>
                  </CrmTD>
                  <CrmTD>
                    <div className="text-sm">{format(parseISO(e.date), "EEE, MMM d, yyyy")}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {formatTime(e.startTime)} — {formatTime(e.endTime)}
                    </div>
                  </CrmTD>
                  <CrmTD>
                    <span className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {e.venue}
                    </span>
                  </CrmTD>
                  <CrmTD>
                    <CrmButton variant="outline">Actions <ChevronDown className="h-3 w-3" /></CrmButton>
                  </CrmTD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CrmCard>
    </div>
  );
}
