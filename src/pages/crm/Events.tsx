import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Users, MessageSquare, Clock, MapPin, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { CrmCard, CrmPageTitle, CrmButton, CrmTH, CrmTD, Avatar } from "@/components/crm/CrmPrimitives";
import { STATUS_PILL, EventStatus, MOCK_NOW, Venue } from "@/data/crmMock";
import { useCrm, usePersistedState } from "@/data/crmStore";
import { format, parseISO } from "date-fns";

const STATUSES: (EventStatus | "All")[] = ["All", "Prospect", "Tentative", "Definite", "Closed", "Lost"];
const VENUES: ("All venues" | Venue)[] = ["All venues", "Osteria", "The Leinster", "Kaona Room"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
}

type SortKey = "NAME" | "WHEN" | "WHERE";
type SortDir = "asc" | "desc";

interface Filters {
  status: EventStatus | "All";
  venue: "All venues" | Venue;
  from: string;
  to: string;
  sortKey: SortKey;
  sortDir: SortDir;
}

const DEFAULTS: Filters = {
  status: "All", venue: "All venues", from: "", to: "",
  sortKey: "WHEN", sortDir: "asc",
};

export default function Events() {
  const { events } = useCrm();
  const [filters, setFilters] = usePersistedState<Filters>("crm-events-filters", DEFAULTS);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const todayStr = MOCK_NOW.toISOString().slice(0, 10);
  const urlFilter = params.get("filter"); // "overdue" or "next7"

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "All" ? events.length : events.filter((e) => e.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  let rows = events.slice();
  if (filters.status !== "All") rows = rows.filter((e) => e.status === filters.status);
  if (filters.venue !== "All venues") rows = rows.filter((e) => e.venue === filters.venue);
  if (filters.from) rows = rows.filter((e) => e.date >= filters.from);
  if (filters.to) rows = rows.filter((e) => e.date <= filters.to);
  if (urlFilter === "overdue") rows = rows.filter((e) => e.followUpDue && e.followUpDue < todayStr);
  if (urlFilter === "next7") {
    const in7 = new Date(MOCK_NOW); in7.setDate(in7.getDate() + 7);
    const in7Str = in7.toISOString().slice(0, 10);
    rows = rows.filter((e) => e.date >= todayStr && e.date <= in7Str);
  }

  rows.sort((a, b) => {
    const dir = filters.sortDir === "asc" ? 1 : -1;
    if (filters.sortKey === "NAME") return a.name.localeCompare(b.name) * dir;
    if (filters.sortKey === "WHEN") return a.date.localeCompare(b.date) * dir;
    return a.venue.localeCompare(b.venue) * dir;
  });

  const toggleSort = (key: SortKey) => {
    if (filters.sortKey === key) setFilters({ ...filters, sortDir: filters.sortDir === "asc" ? "desc" : "asc" });
    else setFilters({ ...filters, sortKey: key, sortDir: "asc" });
  };

  const sortArrow = (key: SortKey) =>
    filters.sortKey === key ? (filters.sortDir === "asc" ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />) : null;

  const followUpBadge = (date?: string) => {
    if (!date) return null;
    if (date < todayStr) return <span className="text-[10px] uppercase font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded ml-2">Overdue</span>;
    if (date === todayStr) return <span className="text-[10px] uppercase font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-2">Due today</span>;
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <CrmPageTitle>Events</CrmPageTitle>
        {urlFilter && (
          <button onClick={() => navigate("/crm/events")} className="text-xs text-muted-foreground hover:text-foreground">
            Clear URL filter: <strong>{urlFilter}</strong> ×
          </button>
        )}
      </div>

      <CrmCard>
        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {STATUSES.map((s) => {
            const on = filters.status === s;
            return (
              <button key={s} onClick={() => setFilters({ ...filters, status: s })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  on ? "bg-[#161e2b] text-white border-[#161e2b]" : "bg-white border-border hover:bg-muted/30 crm-dark:bg-[#11161f] crm-dark:border-white/10"
                }`}>
                {s} ({counts[s] || 0})
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filters.venue} onChange={(e) => setFilters({ ...filters, venue: e.target.value as any })}
              className="text-sm px-3 py-2 rounded-md border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white">
              {VENUES.map((v) => <option key={v}>{v}</option>)}
            </select>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>From</span>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="px-2 py-1.5 rounded border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white" />
              <span>To</span>
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="px-2 py-1.5 rounded border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white" />
            </div>
            {(filters.from || filters.to || filters.venue !== "All venues") && (
              <button onClick={() => setFilters({ ...filters, from: "", to: "", venue: "All venues" })} className="text-xs text-[#9b7fc7] hover:underline">
                Clear
              </button>
            )}
          </div>
          <CrmButton variant="primary">Create Event</CrmButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <CrmTH><input type="checkbox" /></CrmTH>
                <CrmTH>Status</CrmTH>
                <CrmTH>
                  <button onClick={() => toggleSort("NAME")} className="uppercase tracking-wider">Name {sortArrow("NAME")}</button>
                </CrmTH>
                <CrmTH>Who</CrmTH>
                <CrmTH>
                  <button onClick={() => toggleSort("WHEN")} className="uppercase tracking-wider">When {sortArrow("WHEN")}</button>
                </CrmTH>
                <CrmTH>
                  <button onClick={() => toggleSort("WHERE")} className="uppercase tracking-wider">Where {sortArrow("WHERE")}</button>
                </CrmTH>
                <CrmTH>Actions</CrmTH>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-12 text-sm">No events match the current filters.</td></tr>
              )}
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-border crm-dark:border-white/10 hover:bg-muted/30 crm-dark:hover:bg-white/5">
                  <CrmTD><input type="checkbox" /></CrmTD>
                  <CrmTD>
                    <div className="flex flex-col items-start gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_PILL[e.status]}`}>
                        {e.status}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">#{e.id}</span>
                    </div>
                  </CrmTD>
                  <CrmTD>
                    <div className="flex items-center flex-wrap">
                      <Link to={`/crm/events/${e.id}`} className="font-semibold hover:text-[#9b7fc7]">{e.name}</Link>
                      {followUpBadge(e.followUpDue)}
                    </div>
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
