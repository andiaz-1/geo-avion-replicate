import { CalendarDays, CheckCircle, Clock, DollarSign, LucideIcon } from "lucide-react";

interface Event {
  booking_status?: string | null;
  status?: string | null;
  estimated_total?: number | null;
  quote?: { grandTotal?: number } | null;
}

function statusOf(e: Event): string {
  return (e.booking_status || e.status || "") as string;
}

function totalOf(e: Event): number {
  return Number(e.estimated_total ?? e.quote?.grandTotal ?? 0);
}

export default function StatsBar({ events }: { events: Event[] }) {
  const confirmed = events.filter((e) => statusOf(e) === "confirmed").length;
  const pending = events.filter((e) =>
    ["new_lead", "quote_sent", "contract_sent"].includes(statusOf(e)),
  ).length;
  const revenue = events
    .filter((e) => statusOf(e) !== "cancelled")
    .reduce((sum, e) => sum + totalOf(e), 0);

  const stats: { label: string; value: string | number; icon: LucideIcon; tone: string }[] = [
    { label: "Total Events", value: events.length, icon: CalendarDays, tone: "text-primary" },
    { label: "Confirmed", value: confirmed, icon: CheckCircle, tone: "text-primary" },
    { label: "Pending", value: pending, icon: Clock, tone: "text-secondary" },
    { label: "Est. Revenue", value: `$${revenue.toLocaleString()}`, icon: DollarSign, tone: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-card rounded-sm border border-border p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-sm bg-muted ${s.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
