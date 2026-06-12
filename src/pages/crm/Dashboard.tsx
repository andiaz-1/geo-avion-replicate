import { Link } from "react-router-dom";
import { CrmCard, CrmPageTitle, CrmSelect } from "@/components/crm/CrmPrimitives";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { STATUS_HEX, EventStatus, MOCK_NOW } from "@/data/crmMock";
import { useCrm } from "@/data/crmStore";
import { InboxIcon } from "lucide-react";

const STATUSES: EventStatus[] = ["Prospect", "Tentative", "Definite", "Closed", "Lost"];

function StatCard({ count, label, accent, href }: { count: number; label: string; accent: string; href: string }) {
  return (
    <Link to={href} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow crm-dark:bg-[#1a2230] crm-dark:border-white/10 block">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold" style={{ color: accent }}>{count}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
        <div className="h-10 w-10 rounded-full" style={{ background: `${accent}22` }} />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { events, overdueFollowUps } = useCrm();

  const todayStr = MOCK_NOW.toISOString().slice(0, 10);
  const in7 = new Date(MOCK_NOW); in7.setDate(in7.getDate() + 7);
  const in7Str = in7.toISOString().slice(0, 10);
  const eventsNext7 = events.filter((e) => e.date >= todayStr && e.date <= in7Str).length;

  const monthKey = MOCK_NOW.toISOString().slice(0, 7);
  const bookedThisMonth = events.filter((e) => e.date.startsWith(monthKey) && (e.status === "Definite" || e.status === "Closed")).length;

  const venueFilter = "Osteria";
  const filtered = events.filter((e) => e.venue === venueFilter && e.date.startsWith(monthKey));
  const counts: Record<EventStatus, number> = { Prospect: 0, Tentative: 0, Definite: 0, Closed: 0, Lost: 0 };
  filtered.forEach((e) => { counts[e.status]++; });
  const stackedData = [{ name: `${venueFilter} · June 2026`, ...counts }];
  const hasStackedData = filtered.length > 0;

  return (
    <div className="space-y-6">
      <CrmPageTitle>Dashboard</CrmPageTitle>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard count={overdueFollowUps} label="Overdue follow-ups" accent="#f59e0b" href="/crm/events?filter=overdue" />
        <StatCard count={eventsNext7} label="Events next 7 days" accent="#5fa468" href="/crm/events?filter=next7" />
        <StatCard count={bookedThisMonth} label="Booked this month" accent="#9b7fc7" href="/crm/events" />
      </div>

      <CrmCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-sm">Event Status Distribution</h3>
          <div className="flex gap-2 flex-wrap">
            <CrmSelect value="Osteria" options={["Osteria", "The Leinster", "Kaona Room"]} />
            <CrmSelect value="June" />
            <CrmSelect value="2026" />
          </div>
        </div>
        <div className="h-72">
          {hasStackedData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stackedData} margin={{ left: 10, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid stroke="#eee" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {STATUSES.map((s) => (
                  <Bar key={s} dataKey={s} stackId="a" fill={STATUS_HEX[s]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <InboxIcon className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">No events match this filter</p>
            </div>
          )}
        </div>
      </CrmCard>
    </div>
  );
}
