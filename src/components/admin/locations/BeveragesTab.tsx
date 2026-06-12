import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CrudList from "./CrudList";

interface Bev { id: string; location_id: string; name: string; package_type: string; description: string | null; price_per_person: number; duration_hours: number | null; inclusions: string[]; min_spend: number | null; sort_order: number; }

const TYPES = [
  { value: "beer_wine", label: "Beer & Wine" },
  { value: "full_bar", label: "Full Bar" },
  { value: "consumption", label: "On Consumption" },
  { value: "custom", label: "Custom" },
];

export default function BeveragesTab({ locationId }: { locationId: string }) {
  return (
    <CrudList<Bev>
      table="location_beverage_packages"
      locationId={locationId}
      title="Beverage Packages"
      description="Open-bar selections clients can pick from."
      emptyText="No packages yet."
      defaults={{ name: "", package_type: "full_bar", description: "", price_per_person: 0, duration_hours: 2, inclusions: [], min_spend: null } as any}
      renderRow={(b) => (
        <div>
          <div className="font-medium">{b.name}</div>
          <div className="text-xs text-muted-foreground">
            {TYPES.find((t) => t.value === b.package_type)?.label || b.package_type}
            {b.price_per_person > 0 && ` · $${b.price_per_person}/person`}
            {b.duration_hours && ` · ${b.duration_hours}h`}
            {b.min_spend && ` · min $${b.min_spend}`}
          </div>
        </div>
      )}
      renderForm={(form, setForm) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={form.package_type} onValueChange={(v) => setForm({ ...form, package_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Price / person ($)</Label><Input type="number" value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: Number(e.target.value) })} /></div>
            <div><Label>Duration (hours)</Label><Input type="number" step="0.5" value={form.duration_hours ?? ""} onChange={(e) => setForm({ ...form, duration_hours: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Min spend ($)</Label><Input type="number" value={form.min_spend ?? ""} onChange={(e) => setForm({ ...form, min_spend: e.target.value ? Number(e.target.value) : null })} /></div>
          </div>
          <div>
            <Label>Inclusions (one per line)</Label>
            <Textarea rows={4} value={(form.inclusions || []).join("\n")} onChange={(e) => setForm({ ...form, inclusions: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} placeholder="House wines\nDomestic beers\nProsecco toast" />
          </div>
        </div>
      )}
    />
  );
}
