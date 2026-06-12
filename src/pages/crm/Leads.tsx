import { CrmCard, CrmPageTitle, CrmButton, CrmTH, CrmTD } from "@/components/crm/CrmPrimitives";
import { Search } from "lucide-react";

export default function Leads() {
  return (
    <div className="space-y-5">
      <CrmPageTitle>Leads</CrmPageTitle>
      <CrmCard>
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              placeholder="Search lead..."
              className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white"
            />
            <CrmButton variant="primary"><Search className="h-4 w-4" /> Search</CrmButton>
          </div>
          <CrmButton variant="primary">Create Lead</CrmButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <CrmTH><input type="checkbox" /></CrmTH>
                <CrmTH>ID</CrmTH>
                <CrmTH>Personal Information</CrmTH>
                <CrmTH>Event Details</CrmTH>
                <CrmTH>Description</CrmTH>
                <CrmTH>Submitted At</CrmTH>
                <CrmTH>Actions</CrmTH>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="text-center text-muted-foreground py-12 text-sm">No leads found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CrmCard>
    </div>
  );
}
