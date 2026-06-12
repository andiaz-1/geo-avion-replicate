import { CrmCard, CrmPageTitle, Avatar } from "@/components/crm/CrmPrimitives";
import { venues, Venue, VenueDefaults } from "@/data/crmMock";
import { useCrm } from "@/data/crmStore";
import { MapPin } from "lucide-react";

export default function Settings() {
  const { venueDefaults, setVenueDefaults } = useCrm();

  const update = (v: Venue, patch: Partial<VenueDefaults>) =>
    setVenueDefaults(v, { ...venueDefaults[v], ...patch });

  return (
    <div className="space-y-5">
      <CrmPageTitle>Settings</CrmPageTitle>

      <CrmCard>
        <h3 className="font-semibold text-sm mb-1">Profile</h3>
        <div className="flex items-center gap-3 mb-5">
          <Avatar name="John Doe" />
          <div>
            <div className="font-medium">John Doe</div>
            <div className="text-xs text-muted-foreground">john.doe@smartevent360.app</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-xl text-sm">
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
        <h3 className="font-semibold text-sm mb-1">Venue defaults</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Pre-fills FINANCIAL SUMMARY on every new event in this venue. Values stay editable per event.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/30 crm-dark:bg-white/5">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Venue</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">F&amp;B Minimum</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Service %</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Tax %</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Venue Fee</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v} className="border-t border-border crm-dark:border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> {v}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" value={venueDefaults[v].fbMinimum}
                      onChange={(e) => update(v, { fbMinimum: Number(e.target.value) })}
                      className="w-28 px-2 py-1 border border-border rounded crm-dark:bg-[#11161f] crm-dark:border-white/10" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" value={venueDefaults[v].servicePct}
                      onChange={(e) => update(v, { servicePct: Number(e.target.value) })}
                      className="w-20 px-2 py-1 border border-border rounded crm-dark:bg-[#11161f] crm-dark:border-white/10" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" value={venueDefaults[v].taxPct}
                      onChange={(e) => update(v, { taxPct: Number(e.target.value) })}
                      className="w-20 px-2 py-1 border border-border rounded crm-dark:bg-[#11161f] crm-dark:border-white/10" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" value={venueDefaults[v].venueFee}
                      onChange={(e) => update(v, { venueFee: Number(e.target.value) })}
                      className="w-28 px-2 py-1 border border-border rounded crm-dark:bg-[#11161f] crm-dark:border-white/10" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CrmCard>
    </div>
  );
}
