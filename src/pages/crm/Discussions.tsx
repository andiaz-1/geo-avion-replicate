import { useState } from "react";
import { Link } from "react-router-dom";
import { CrmCard, CrmPageTitle, CrmButton, CrmTH, CrmTD } from "@/components/crm/CrmPrimitives";
import { useCrm } from "@/data/crmStore";
import { Eye, Search } from "lucide-react";

export default function Discussions() {
  const { discussions, replyDiscussion } = useCrm();
  const [filter, setFilter] = useState<"all" | "needs">("all");

  const rows = filter === "needs" ? discussions.filter((d) => d.status === "needs_reply") : discussions;

  return (
    <div className="space-y-5">
      <CrmPageTitle>Discussions</CrmPageTitle>
      <CrmCard>
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 max-w-md">
            <input
              placeholder="Search contact..."
              className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white"
            />
            <CrmButton variant="primary"><Search className="h-4 w-4" /> Search</CrmButton>
          </div>
          <div className="flex bg-muted/40 p-1 rounded-md text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded ${filter === "all" ? "bg-white shadow-sm font-medium" : "text-muted-foreground"}`}>
              All ({discussions.length})
            </button>
            <button
              onClick={() => setFilter("needs")}
              className={`px-3 py-1.5 rounded ${filter === "needs" ? "bg-white shadow-sm font-medium" : "text-muted-foreground"}`}>
              Needs reply ({discussions.filter((d) => d.status === "needs_reply").length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <CrmTH><input type="checkbox" /></CrmTH>
                <CrmTH>Contact</CrmTH>
                <CrmTH>Status</CrmTH>
                <CrmTH>Messages Count</CrmTH>
                <CrmTH>Last Message Subject</CrmTH>
                <CrmTH>Created At</CrmTH>
                <CrmTH>Last Message At</CrmTH>
                <CrmTH>Actions</CrmTH>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-t border-border crm-dark:border-white/10 hover:bg-muted/30 crm-dark:hover:bg-white/5">
                  <CrmTD><input type="checkbox" /></CrmTD>
                  <CrmTD>
                    <div className="font-medium">{d.contactName}</div>
                    {d.eventId && (
                      <Link to={`/crm/events/${d.eventId}`} className="text-xs text-[#9b7fc7] hover:underline block">
                        {d.eventName}
                      </Link>
                    )}
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">#{d.id}</div>
                  </CrmTD>
                  <CrmTD>
                    {d.status === "needs_reply" ? (
                      <span className="text-[10px] uppercase font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Needs reply</span>
                    ) : (
                      <span className="text-[10px] uppercase font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Replied</span>
                    )}
                  </CrmTD>
                  <CrmTD>{d.messages}</CrmTD>
                  <CrmTD className="max-w-md">{d.subject}</CrmTD>
                  <CrmTD className="whitespace-nowrap text-muted-foreground">{d.createdAt}</CrmTD>
                  <CrmTD className="whitespace-nowrap text-muted-foreground">{d.lastMessageAt}</CrmTD>
                  <CrmTD>
                    <div className="flex gap-1">
                      <CrmButton variant="outline"><Eye className="h-3.5 w-3.5" /> See details</CrmButton>
                      {d.status === "needs_reply" && (
                        <CrmButton variant="primary" onClick={() => replyDiscussion(d.id)}>Reply</CrmButton>
                      )}
                    </div>
                  </CrmTD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-5 text-xs text-muted-foreground">
          <span>Showing 1 to {rows.length} of {rows.length} results</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
              <button key={p} className={`h-8 w-8 rounded-md border border-border ${p === 1 ? "bg-[#9b7fc7] text-white border-[#9b7fc7]" : "bg-white hover:bg-muted/30"}`}>{p}</button>
            ))}
          </div>
        </div>
      </CrmCard>
    </div>
  );
}
