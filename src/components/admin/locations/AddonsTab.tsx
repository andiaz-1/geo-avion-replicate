import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CrudList from "./CrudList";

interface Addon { id: string; location_id: string; name: string; description: string | null; category: string | null; price: number; price_type: string; max_qty: number | null; sort_order: number; }

const PRICE_TYPES = [
  { value: "flat", label: "Flat fee" },
  { value: "per_person", label: "Per person" },
  { value: "per_hour", label: "Per hour" },
];
const CATEGORIES = ["AV", "Décor", "Entertainment", "Service", "Other"];

export default function AddonsTab({ locationId }: { locationId: string }) {
  return (
    <CrudList<Addon>
      table="location_addons"
      locationId={locationId}
      title="Event Enhancements"
      description="Optional add-ons: AV, décor, entertainment, service upgrades."
      emptyText="No enhancements yet."
      defaults={{ name: "", description: "", category: "Other", price: 0, price_type: "flat", max_qty: null } as any}
      renderRow={(a) => (
        <div>
          <div className="font-medium">{a.name} {a.category && <span className="text-xs text-muted-foreground">· {a.category}</span>}</div>
          <div className="text-xs text-muted-foreground">
            {a.price > 0 ? `$${a.price} ${PRICE_TYPES.find((p) => p.value === a.price_type)?.label.toLowerCase()}` : "No charge"}
          </div>
        </div>
      )}
      renderForm={(form, setForm) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Category</Label>
              <Select value={form.category || "Other"} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Price ($)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div><Label>Pricing</Label>
              <Select value={form.price_type} onValueChange={(v) => setForm({ ...form, price_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRICE_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Max quantity</Label><Input type="number" value={form.max_qty ?? ""} onChange={(e) => setForm({ ...form, max_qty: e.target.value ? Number(e.target.value) : null })} /></div>
          </div>
        </div>
      )}
    />
  );
}
