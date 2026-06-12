import { CrmCard, CrmPageTitle, CrmButton, CrmTH, CrmTD, Avatar } from "@/components/crm/CrmPrimitives";
import { useCrm } from "@/data/crmStore";
import { ChevronDown } from "lucide-react";

export default function Contacts() {
  const { events } = useCrm();
  return (
    <div className="space-y-5">
      <CrmPageTitle>Contacts</CrmPageTitle>
      <CrmCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <CrmTH><input type="checkbox" /></CrmTH>
                <CrmTH>ID</CrmTH>
                <CrmTH>Name</CrmTH>
                <CrmTH>Email</CrmTH>
                <CrmTH>Phone</CrmTH>
                <CrmTH>Actions</CrmTH>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.contact.id} className="border-t border-border crm-dark:border-white/10 hover:bg-muted/30 crm-dark:hover:bg-white/5">
                  <CrmTD><input type="checkbox" /></CrmTD>
                  <CrmTD className="font-mono text-xs">#{e.contact.id.toUpperCase()}</CrmTD>
                  <CrmTD>
                    <div className="flex items-center gap-2">
                      <Avatar name={e.contact.name} />
                      <span className="font-medium">{e.contact.name}</span>
                    </div>
                  </CrmTD>
                  <CrmTD className="text-muted-foreground">{e.contact.email}</CrmTD>
                  <CrmTD className="text-muted-foreground">{e.contact.phone}</CrmTD>
                  <CrmTD><CrmButton variant="outline">Actions <ChevronDown className="h-3 w-3" /></CrmButton></CrmTD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CrmCard>
    </div>
  );
}
