import { CrmCard, CrmPageTitle, CrmButton, CrmTH, CrmTD } from "@/components/crm/CrmPrimitives";
import { discussions } from "@/data/crmMock";
import { Eye, Search } from "lucide-react";

export default function Discussions() {
  return (
    <div className="space-y-5">
      <CrmPageTitle>Discussions</CrmPageTitle>
      <CrmCard>
        <div className="flex items-center gap-2 mb-5 max-w-md">
          <input
            placeholder="Search contact..."
            className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white"
          />
          <CrmButton variant="primary"><Search className="h-4 w-4" /> Search</CrmButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <CrmTH><input type="checkbox" /></CrmTH>
                <CrmTH>ID</CrmTH>
                <CrmTH>Messages Count</CrmTH>
                <CrmTH>Last Message Subject</CrmTH>
                <CrmTH>Created At</CrmTH>
                <CrmTH>Last Message At</CrmTH>
                <CrmTH>Actions</CrmTH>
              </tr>
            </thead>
            <tbody>
              {discussions.map((d) => (
                <tr key={d.id} className="border-t border-border crm-dark:border-white/10 hover:bg-muted/30 crm-dark:hover:bg-white/5">
                  <CrmTD><input type="checkbox" /></CrmTD>
                  <CrmTD><span className="font-mono font-semibold">#{d.id}</span></CrmTD>
                  <CrmTD>{d.messages}</CrmTD>
                  <CrmTD className="max-w-md">{d.subject}</CrmTD>
                  <CrmTD className="whitespace-nowrap text-muted-foreground">{d.createdAt}</CrmTD>
                  <CrmTD className="whitespace-nowrap text-muted-foreground">{d.lastMessageAt}</CrmTD>
                  <CrmTD>
                    <CrmButton variant="outline"><Eye className="h-3.5 w-3.5" /> See details</CrmButton>
                  </CrmTD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-5 text-xs text-muted-foreground">
          <span>Showing 1 to 10 of 61 results</span>
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
