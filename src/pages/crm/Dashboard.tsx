import { Link } from "react-router-dom";
import { CrmCard, CrmPageTitle, CrmSelect } from "@/components/crm/CrmPrimitives";
import {
  BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { leadsConversionData, STATUS_HEX, EventStatus, MOCK_NOW } from "@/data/crmMock";
import { useCrm } from "@/data/crmStore";
import { Inbox, AlertTriangle, CalendarCheck, CheckCircle2, InboxIcon } from "lucide-react";

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
  const { events, unrespondedLeads, overdueFollowUps } = useCrm();

  const todayStr = MOCK_NOW.toISOString().slice(0, 10);
  const in7 = new Date(MOCK_NOW); in7.setDate(in7.getDate() + 7);
  const in7Str = in7.toISOString().slice(0, 10);
  const eventsNext7 = events.filter((e) => e.date >= todayStr && e.date <= in7Str).length;

  const monthKey = MOCK_NOW.toISOString().slice(0, 7);
  const bookedThisMonth = events.filter((e) => e.date.startsWith(monthKey) && (e.status === "Definite" || e.status === "Closed")).length;

  // Stacked-bar status distribution for Osteria · June 2026 (selected filters)
  const venueFilter = "Osteria";
  const filtered = events.filter((e) => e.venue === venueFilter && e.date.startsWith(monthKey));
  const counts: Record<EventStatus, number> = { Prospect: 0, Tentative: 0, Definite: 0, Closed: 0, Lost: 0 };
  filtered.forEach((e) => { counts[e.status]++; });
  const stackedData = [{ name: `${venueFilter} · June 2026`, ...counts }];
  const hasStackedData = filtered.length > 0;

  return (
    <div className="space-y-6">
      <CrmPageTitle>Dashboard</CrmPageTitle>

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard count={unrespondedLeads} label="New leads awaiting reply" accent="#ef4444" href="/crm/leads" />
        <StatCard count={overdueFollowUps} label="Overdue follow-ups" accent="#f59e0b" href="/crm/events?filter=overdue" />
        <StatCard count={eventsNext7} label="Events next 7 days" accent="#5fa468" href="/crm/events?filter=next7" />
        <StatCard count={bookedThisMonth} label="Booked this month" accent="#9b7fc7" href="/crm/events" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CrmCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Leads Conversion Over Time</h3>
            <div className="flex gap-2">
              <CrmSelect value="All Locations" options={["All Locations", "Osteria", "The Leinster", "Kaona Room"]} />
              <CrmSelect value="All Time" options={["All Time", "This Year", "Last 6 Months"]} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={leadsConversionData}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="converted" name="Converted" stackId="a" fill="#9b7fc7" />
                <Bar yAxisId="left" dataKey="notConverted" name="Not Converted" stackId="a" fill="#d6c7ec" />
                <Line yAxisId="right" type="monotone" dataKey="rate" name="Conversion Rate (%)" stroke="#5b3e8f" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CrmCard>

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
    </div>
  );
}
