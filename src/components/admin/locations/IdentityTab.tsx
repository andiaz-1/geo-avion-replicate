import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { LocationRecord } from "@/pages/admin/LocationSettings";
import ImageUploadField from "./ImageUploadField";

interface Props {
  loc: LocationRecord;
  save: (patch: Partial<LocationRecord>) => Promise<{ error: any } | undefined>;
}

export default function IdentityTab({ loc, save }: Props) {
  const [form, setForm] = useState({
    name: loc.name,
    address: loc.address || "",
    phone: loc.phone || "",
    email: loc.email || "",
    timezone: loc.timezone,
    tagline: loc.tagline || "",
    about_text: loc.about_text || "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const res = await save(form);
    setSaving(false);
    if (res?.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold mb-2">Brand Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUploadField
            label="Logo"
            locationId={loc.id}
            path="logo"
            value={loc.logo_url}
            onChange={async (url) => { await save({ logo_url: url }); }}
          />
          <ImageUploadField
            label="Favicon"
            locationId={loc.id}
            path="favicon"
            value={loc.favicon_url}
            onChange={async (url) => { await save({ favicon_url: url }); }}
          />
        </div>
        <ImageUploadField
          label="Hero Image"
          locationId={loc.id}
          path="hero"
          value={loc.hero_image_url}
          onChange={async (url) => { await save({ hero_image_url: url }); }}
        />
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold mb-2">Contact & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Timezone</Label><Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="America/New_York" /></div>
          <div className="md:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Italian private dining & events" /></div>
          <div className="md:col-span-2"><Label>About</Label><Textarea rows={4} value={form.about_text} onChange={(e) => setForm({ ...form, about_text: e.target.value })} /></div>
        </div>
        <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </Card>
    </div>
  );
}
