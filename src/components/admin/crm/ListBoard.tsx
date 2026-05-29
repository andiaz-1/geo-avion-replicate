import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STATUS_COLORS, STATUS_LABELS, displayName } from "@/lib/crm-data";

interface Event {
  id: string;
  event_date?: string | null;
  location?: string | null;
  venue?: string | null;
  event_type?: string | null;
  guest_count?: number | null;
  status: string;
  estimated_total?: number | null;
  quote?: { grandTotal?: number } | null;
  [k: string]: unknown;
}

export default function ListBoard({ events }: { events: Event[] }) {
  const [sortField, setSortField] = useState<string>("event_date");
  const [sortDir, setSortDir] = useState(1);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(-sortDir);
    else {
      setSortField(field);
      setSortDir(1);
    }
  };

  const sorted = [...events].sort((a, b) => {
    const va = (a as Record<string, unknown>)[sortField] ?? "";
    const vb = (b as Record<string, unknown>)[sortField] ?? "";
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * sortDir;
    return String(va).localeCompare(String(vb)) * sortDir;
  });

  const SortHead = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      </span>
    </TableHead>
  );

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead field="client_last_name">Client</SortHead>
            <SortHead field="event_date">Date</SortHead>
            <SortHead field="location">Location</SortHead>
            <SortHead field="event_type">Type</SortHead>
            <SortHead field="guest_count">Guests</SortHead>
            <SortHead field="status">Status</SortHead>
            <SortHead field="estimated_total">Total</SortHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((e) => {
            const total = e.estimated_total ?? e.quote?.grandTotal ?? 0;
            return (
              <TableRow key={e.id}>
                <TableCell>
                  <Link to={`/admin/events/${e.id}`} className="font-medium text-primary hover:underline">
                    {displayName(e as never)}
                  </Link>
                </TableCell>
                <TableCell>
                  {e.event_date ? format(new Date(e.event_date + "T12:00:00"), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell>{e.location || e.venue || "—"}</TableCell>
                <TableCell>{e.event_type || "—"}</TableCell>
                <TableCell>{e.guest_count ?? 0}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-0.5 rounded-sm border text-xs ${STATUS_COLORS[e.status] || ""}`}>
                    {STATUS_LABELS[e.status] || e.status}
                  </span>
                </TableCell>
                <TableCell>{total ? `$${Number(total).toLocaleString()}` : "—"}</TableCell>
              </TableRow>
            );
          })}
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No events yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
