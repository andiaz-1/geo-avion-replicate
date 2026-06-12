import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CrudList from "./CrudList";

interface Area { id: string; location_id: string; name: string; description: string | null; min_guests: number | null; max_guests: number | null; base_fee: number; fnb_minimum: number; sort_order: number; }

export default function AreasTab({ locationId }: { locationId: string }) {
  return (
    <CrudList<Area>
      table="location_areas"
      locationId={locationId}
      title="Areas"
      description="Rooms, patios, and spaces that can be booked."
      emptyText="No areas yet. Add the rooms your venue offers."
      defaults={{ name: "", description: "", min_guests: null, max_guests: null, base_fee: 0, fnb_minimum: 0 } as any}
      renderRow={(a) => (
        <div>
          <div className="font-medium">{a.name}</div>
          <div className="text-xs text-muted-foreground">
            {a.min_guests ?? "?"}–{a.max_guests ?? "?"} guests · base ${a.base_fee} · F&B min ${a.fnb_minimum}
          </div>
        </div>
      )}
      renderForm={(form, setForm) => (
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Min guests</Label><Input type="number" value={form.min_guests ?? ""} onChange={(e) => setForm({ ...form, min_guests: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Max guests</Label><Input type="number" value={form.max_guests ?? ""} onChange={(e) => setForm({ ...form, max_guests: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Base fee ($)</Label><Input type="number" value={form.base_fee} onChange={(e) => setForm({ ...form, base_fee: Number(e.target.value) })} /></div>
            <div><Label>F&B minimum ($)</Label><Input type="number" value={form.fnb_minimum} onChange={(e) => setForm({ ...form, fnb_minimum: Number(e.target.value) })} /></div>
          </div>
        </div>
      )}
    />
  );
}
