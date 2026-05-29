import { Link } from "react-router-dom";
import { MapPin, Users, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { displayName } from "@/lib/crm-data";

interface EventLike {
  id: string;
  company_name?: string | null;
  company?: string | null;
  event_date?: string | null;
  location?: string | null;
  venue?: string | null;
  guest_count?: number | null;
  event_type?: string | null;
  estimated_total?: number | null;
  quote?: { grandTotal?: number } | null;
  [k: string]: unknown;
}

export default function EventCard({ event }: { event: EventLike }) {
  const total = event.estimated_total ?? event.quote?.grandTotal ?? 0;
  const totalLabel = total ? `$${Number(total).toLocaleString()}` : "—";
  const company = event.company_name || event.company;
  const loc = event.location || event.venue || "—";

  return (
    <Link
      to={`/admin/events/${event.id}`}
      className="block bg-card border border-border rounded-sm p-4 hover:border-primary transition-colors"
    >
      <div className="font-medium text-foreground">{displayName(event)}</div>
      {company && <div className="text-xs text-muted-foreground mt-0.5">{company}</div>}
      <div className="space-y-1 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5" />
          {event.event_date ? format(new Date(event.event_date + "T12:00:00"), "MMM d, yyyy") : "TBD"}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          {loc}
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          {event.guest_count ?? 0} guests
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
        <span className="font-medium text-foreground">{totalLabel}</span>
        <span className="text-muted-foreground">{event.event_type || "—"}</span>
      </div>
    </Link>
  );
}
