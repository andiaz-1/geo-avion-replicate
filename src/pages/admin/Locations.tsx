import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, MapPin } from "lucide-react";

interface Location {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  is_active: boolean;
  published: boolean;
}

export default function LocationsPage() {
  const { session, isAdmin, loading } = useAdminAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [creating, setCreating] = useState(false);
  const nav = useNavigate();

  const load = async () => {
    const { data } = await supabase.from("locations").select("*").order("created_at");
    setLocations((data as Location[]) || []);
    const { data: events } = await supabase.from("events").select("location_id");
    const c: Record<string, number> = {};
    (events || []).forEach((e: any) => { if (e.location_id) c[e.location_id] = (c[e.location_id] || 0) + 1; });
    setCounts(c);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="crm-theme min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => nav("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Locations</h1>
            <p className="text-xs text-muted-foreground">Manage every venue's branding, menus, pricing, and team.</p>
          </div>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Location
        </Button>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((l) => (
          <Link key={l.id} to={`/admin/locations/${l.slug}`}>
            <Card className="p-5 hover:border-primary transition-colors h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">{l.name}</h2>
                </div>
                <Badge variant={l.published ? "default" : "secondary"}>
                  {l.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{l.address || "No address set"}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>/book/{l.slug}</span>
                <span>{counts[l.id] || 0} events</span>
              </div>
            </Card>
          </Link>
        ))}
        {locations.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-10">
            No locations yet. Click "New Location" to add one.
          </p>
        )}
      </main>

      <CreateLocationDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(slug) => { setCreating(false); load(); nav(`/admin/locations/${slug}`); }}
      />
    </div>
  );
}

function CreateLocationDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (slug: string) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const { error } = await supabase.from("locations").insert({ name: name.trim(), slug: cleanSlug });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Location created" });
    setName(""); setSlug("");
    onCreated(cleanSlug);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Location</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-")); }} placeholder="Salumeria 104 — Coral Gables" />
          </div>
          <div>
            <Label>URL Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="coral-gables" />
            <p className="text-xs text-muted-foreground mt-1">Booking URL will be <code>/book/{slug || "your-slug"}</code></p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !name || !slug}>{saving ? "Creating…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
