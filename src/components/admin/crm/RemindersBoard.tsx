import { useMemo } from "react";
import { Link } from "react-router-dom";
import { differenceInDays, differenceInHours } from "date-fns";
import { AlertTriangle, Clock, FileText, CreditCard, Image as ImageIcon, LucideIcon } from "lucide-react";
import { displayName, firstName } from "@/lib/crm-data";

interface Event {
  id: string;
  event_date?: string | null;
  status: string;
  contract_status?: string | null;
  contract_sent_at?: string | null;
  contract_sent_date?: string | null;
  cc_auth_status?: string | null;
  antipasti_selections?: string[] | null;
  entree_selections?: string[] | null;
  menu_header_type?: string | null;
  email?: string | null;
  [k: string]: unknown;
}

interface Reminder {
  event: Event;
  icon: LucideIcon;
  msg: string;
  urgent: boolean;
}

export default function RemindersBoard({ events }: { events: Event[] }) {
  const reminders = useMemo<Reminder[]>(() => {
    const now = new Date();
    const items: Reminder[] = [];

    events.forEach((e) => {
      if (e.status === "completed" || e.status === "cancelled") return;
      const daysUntil = e.event_date
        ? differenceInDays(new Date(e.event_date + "T12:00:00"), now)
        : null;

      const contractSentRaw = e.contract_sent_at || e.contract_sent_date;
      if (e.contract_status === "sent" && contractSentRaw) {
        const hrs = differenceInHours(now, new Date(contractSentRaw));
        if (hrs > 120) {
          items.push({
            event: e,
            icon: AlertTriangle,
            msg: `Contract unsigned — sent ${Math.floor(hrs / 24)} days ago`,
            urgent: true,
          });
        } else if (hrs > 48) {
          items.push({
            event: e,
            icon: FileText,
            msg: `Contract awaiting signature — sent ${Math.floor(hrs / 24)} days ago`,
            urgent: false,
          });
        }
      }

      if (
        daysUntil !== null &&
        daysUntil <= 21 &&
        daysUntil > 0 &&
        (!e.antipasti_selections?.length || !e.entree_selections?.length)
      ) {
        items.push({
          event: e,
          icon: Clock,
          msg: `Menu selections incomplete — event in ${daysUntil} days`,
          urgent: false,
        });
      }

      if (daysUntil !== null && daysUntil <= 14 && daysUntil > 0 && e.cc_auth_status !== "submitted") {
        items.push({
          event: e,
          icon: CreditCard,
          msg: `CC authorization missing — event in ${daysUntil} days`,
          urgent: false,
        });
      }

      if (daysUntil !== null && daysUntil <= 10 && daysUntil > 0 && !e.menu_header_type) {
        items.push({
          event: e,
          icon: ImageIcon,
          msg: `Menu header not received — event in ${daysUntil} days`,
          urgent: false,
        });
      }
    });

    return items.sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1));
  }, [events]);

  if (!reminders.length) {
    return (
      <div className="bg-card border border-border rounded-sm p-12 text-center">
        <p className="text-muted-foreground">All caught up — nothing needs attention right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reminders.map((r, i) => {
        const Icon = r.icon;
        return (
          <Link
            key={i}
            to={`/admin/events/${r.event.id}`}
            className={`flex items-center gap-4 p-4 rounded-sm border transition-colors ${
              r.urgent
                ? "bg-destructive/5 border-destructive/30 hover:bg-destructive/10"
                : "bg-card border-border hover:bg-muted/40"
            }`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${r.urgent ? "text-destructive" : "text-secondary"}`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">{displayName(r.event)}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {r.msg}
                {firstName(r.event) ? ` · ${firstName(r.event)}` : ""}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
