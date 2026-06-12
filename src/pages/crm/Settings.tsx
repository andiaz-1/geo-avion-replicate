import { CrmCard, CrmPageTitle, Avatar } from "@/components/crm/CrmPrimitives";
import { venues } from "@/data/crmMock";
import { MapPin } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-5">
      <CrmPageTitle>Settings</CrmPageTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CrmCard>
          <h3 className="font-semibold text-sm mb-4">Profile</h3>
          <div className="flex items-center gap-3 mb-5">
            <Avatar name="John Doe" />
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-xs text-muted-foreground">john.doe@smartevent360.app</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-muted-foreground">Full name</label>
              <input defaultValue="John Doe" className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input defaultValue="john.doe@smartevent360.app" className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white" />
            </div>
          </div>
        </CrmCard>

        <CrmCard>
          <h3 className="font-semibold text-sm mb-4">Venues</h3>
          <div className="space-y-2">
            {venues.map((v) => (
              <div key={v} className="flex items-center justify-between p-3 border border-border rounded-lg crm-dark:border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{v}</span>
                </div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            ))}
          </div>
        </CrmCard>
      </div>
    </div>
  );
}
