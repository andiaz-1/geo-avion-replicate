import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";

interface Tier { id: string; location_id: string; name: string; description: string | null; price_per_person: number; sort_order: number; }
interface Course { id: string; tier_id: string; location_id: string; name: string; max_selections: number; sort_order: number; }
interface Item { id: string; course_id: string; location_id: string; name: string; description: string | null; allergens: string[]; upcharge: number; sort_order: number; }

export default function MenusTab({ locationId }: { locationId: string }) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);

  const loadTiers = async () => {
    const { data } = await supabase.from("location_menu_tiers").select("*").eq("location_id", locationId).order("sort_order");
    setTiers((data as Tier[]) || []);
    if (data && data.length && !activeTier) setActiveTier(data[0].id);
  };

  useEffect(() => { loadTiers(); }, [locationId]);

  const saveTier = async () => {
    if (!editingTier) return;
    const row: any = { ...editingTier };
    if (row.id) {
      const { id, ...patch } = row;
      const { error } = await supabase.from("location_menu_tiers").update(patch).eq("id", id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      delete row.id;
      const { error } = await supabase.from("location_menu_tiers").insert({ ...row, location_id: locationId, sort_order: tiers.length });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setEditingTier(null); loadTiers(); toast({ title: "Saved" });
  };

  const removeTier = async (id: string) => {
    if (!confirm("Delete this tier and all its courses/items?")) return;
    const { error } = await supabase.from("location_menu_tiers").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    if (activeTier === id) setActiveTier(null);
    loadTiers();
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Menu Tiers</h3>
            <p className="text-xs text-muted-foreground">Per-person price tiers (e.g. Classico / Gustoso / Magnifico).</p>
          </div>
          <Button size="sm" onClick={() => setEditingTier({ id: "", location_id: locationId, name: "", description: "", price_per_person: 0, sort_order: tiers.length } as Tier)}>
            <Plus className="h-4 w-4 mr-1" /> Add tier
          </Button>
        </div>

        {tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No menu tiers yet.</p>
        ) : (
          <Tabs value={activeTier ?? undefined} onValueChange={setActiveTier}>
            <TabsList className="flex-wrap h-auto">
              {tiers.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.name} · ${t.price_per_person}
                </TabsTrigger>
              ))}
            </TabsList>
            {tiers.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h4 className="font-medium">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">${t.price_per_person} per person {t.description && `· ${t.description}`}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingTier(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeTier(t.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <CoursesPanel tierId={t.id} locationId={locationId} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </Card>

      <Dialog open={!!editingTier} onOpenChange={(o) => !o && setEditingTier(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTier?.id ? "Edit tier" : "New tier"}</DialogTitle></DialogHeader>
          {editingTier && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editingTier.name} onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })} /></div>
              <div><Label>Price per person ($)</Label><Input type="number" value={editingTier.price_per_person} onChange={(e) => setEditingTier({ ...editingTier, price_per_person: Number(e.target.value) })} /></div>
              <div><Label>Description</Label><Textarea rows={2} value={editingTier.description || ""} onChange={(e) => setEditingTier({ ...editingTier, description: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTier(null)}>Cancel</Button>
            <Button onClick={saveTier}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CoursesPanel({ tierId, locationId }: { tierId: string; locationId: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("location_menu_courses").select("*").eq("tier_id", tierId).order("sort_order");
    let rows = (data as Course[]) || [];
    if (rows.length === 0) {
      const defaults = ["Appetizer", "Salad", "Entrée", "Dessert"].map((name, i) => ({
        tier_id: tierId, location_id: locationId, name, max_selections: 1, sort_order: i,
      }));
      const { data: seeded } = await supabase.from("location_menu_courses").insert(defaults).select();
      rows = (seeded as Course[]) || [];
    }
    setCourses(rows);
  };

  useEffect(() => { load(); }, [tierId]);

  const save = async () => {
    if (!editing) return;
    const row: any = { ...editing };
    if (row.id) {
      const { id, ...patch } = row;
      const { error } = await supabase.from("location_menu_courses").update(patch).eq("id", id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      delete row.id;
      const { error } = await supabase.from("location_menu_courses").insert({ ...row, tier_id: tierId, location_id: locationId, sort_order: courses.length });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this course and all its items?")) return;
    await supabase.from("location_menu_courses").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Courses</p>
        <Button variant="outline" size="sm" onClick={() => setEditing({ id: "", tier_id: tierId, location_id: locationId, name: "", max_selections: 1, sort_order: courses.length } as Course)}>
          <Plus className="h-3 w-3 mr-1" /> Add course
        </Button>
      </div>

      {courses.map((c) => (
        <div key={c.id} className="border border-border rounded-md">
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
            <div className="flex items-center gap-2">
              <ChevronRight className={`h-4 w-4 transition-transform ${expanded === c.id ? "rotate-90" : ""}`} />
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-muted-foreground">(pick up to {c.max_selections})</span>
            </div>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          {expanded === c.id && (
            <div className="border-t border-border p-3 bg-muted/20">
              <ItemsPanel courseId={c.id} locationId={locationId} />
            </div>
          )}
        </div>
      ))}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit course" : "New course"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div><Label>Course name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Antipasti / Entrées / Desserts" /></div>
              <div><Label>Max selections</Label><Input type="number" value={editing.max_selections} onChange={(e) => setEditing({ ...editing, max_selections: Number(e.target.value) })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemsPanel({ courseId, locationId }: { courseId: string; locationId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);

  const load = async () => {
    const { data } = await supabase.from("location_menu_items").select("*").eq("course_id", courseId).order("sort_order");
    setItems((data as Item[]) || []);
  };

  useEffect(() => { load(); }, [courseId]);

  const save = async () => {
    if (!editing) return;
    const row: any = { ...editing };
    if (row.id) {
      const { id, ...patch } = row;
      const { error } = await supabase.from("location_menu_items").update(patch).eq("id", id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      delete row.id;
      const { error } = await supabase.from("location_menu_items").insert({ ...row, course_id: courseId, location_id: locationId, sort_order: items.length });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("location_menu_items").delete().eq("id", id);
    load();
  };

  const bulkAdd = async () => {
    const text = prompt("Paste menu items (one per line):");
    if (!text) return;
    const lines = text.split("\n").map((x) => x.trim()).filter(Boolean);
    const rows = lines.map((name, i) => ({ name, course_id: courseId, location_id: locationId, sort_order: items.length + i, allergens: [], upcharge: 0 }));
    const { error } = await supabase.from("location_menu_items").insert(rows);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Items</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={bulkAdd}>Bulk paste</Button>
          <Button variant="outline" size="sm" onClick={() => setEditing({ id: "", course_id: courseId, location_id: locationId, name: "", description: "", allergens: [], upcharge: 0, sort_order: items.length } as Item)}>
            <Plus className="h-3 w-3 mr-1" /> Add item
          </Button>
        </div>
      </div>

      {items.length === 0 && <p className="text-xs text-muted-foreground italic">No items yet.</p>}

      {items.map((i) => (
        <div key={i.id} className="flex items-center justify-between text-sm p-2 hover:bg-background rounded">
          <div>
            <span className="font-medium">{i.name}</span>
            {i.upcharge > 0 && <span className="text-xs text-muted-foreground ml-2">+${i.upcharge}</span>}
            {i.allergens?.length > 0 && <span className="text-xs text-muted-foreground ml-2">[{i.allergens.join(", ")}]</span>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(i)}><Pencil className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit item" : "New item"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={2} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Upcharge ($)</Label><Input type="number" value={editing.upcharge} onChange={(e) => setEditing({ ...editing, upcharge: Number(e.target.value) })} /></div>
                <div><Label>Allergens (comma-separated)</Label><Input value={(editing.allergens || []).join(", ")} onChange={(e) => setEditing({ ...editing, allergens: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="gluten, dairy, nuts" /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
