import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { LocationRecord } from "@/pages/admin/LocationSettings";

interface Props {
  loc: LocationRecord;
  save: (patch: Partial<LocationRecord>) => Promise<{ error: any } | undefined>;
}

export default function CapacityTab({ loc, save }: Props) {
  const [form, setForm] = useState({
    min_guests: loc.min_guests,
    max_guests: loc.max_guests,
    buyout_threshold: loc.buyout_threshold ?? "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const res = await save({
      min_guests: Number(form.min_guests),
      max_guests: Number(form.max_guests),
      buyout_threshold: form.buyout_threshold === "" ? null : Number(form.buyout_threshold),
    });
    setSaving(false);
    if (res?.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  return (
    <Card className="p-6 max-w-3xl space-y-4">
      <div>
        <h3 className="font-semibold">Capacity</h3>
        <p className="text-xs text-muted-foreground">Used by the booking funnel to validate guest counts.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>Minimum guests</Label><Input type="number" value={form.min_guests} onChange={(e) => setForm({ ...form, min_guests: e.target.value as any })} /></div>
        <div><Label>Maximum guests</Label><Input type="number" value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: e.target.value as any })} /></div>
        <div><Label>Full buyout above</Label>
          <div className="relative">
            <Input type="number" value={form.buyout_threshold as any} onChange={(e) => setForm({ ...form, buyout_threshold: e.target.value as any })} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">guests</span>
          </div>
        </div>
      </div>
      <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
    </Card>
  );
}
