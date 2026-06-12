import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { LocationRecord } from "@/pages/admin/LocationSettings";
import SeasonsManager from "./SeasonsManager";

interface Props {
  loc: LocationRecord;
  save: (patch: Partial<LocationRecord>) => Promise<{ error: any } | undefined>;
}

export default function PricingTab({ loc, save }: Props) {
  const [form, setForm] = useState({
    service_charge_pct: loc.service_charge_pct,
    tax_pct: loc.tax_pct,
    deposit_pct: loc.deposit_pct,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const res = await save({
      service_charge_pct: Number(form.service_charge_pct),
      tax_pct: Number(form.tax_pct),
      deposit_pct: Number(form.deposit_pct),
    });
    setSaving(false);
    if (res?.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  const num = (k: keyof typeof form, label: string, suffix: string) => (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input type="number" value={form[k] as any} onChange={(e) => setForm({ ...form, [k]: e.target.value as any })} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold">Rates</h3>
          <p className="text-xs text-muted-foreground">Applied to every quote at this location.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {num("service_charge_pct", "Service Charge", "%")}
          {num("tax_pct", "Tax", "%")}
          {num("deposit_pct", "Deposit", "%")}
        </div>
        <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save rates"}</Button>
      </Card>

      <SeasonsManager locationId={loc.id} />
    </div>
  );
}
