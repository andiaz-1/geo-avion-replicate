import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ChevronRight, Clock, Calendar, Sun } from "lucide-react";

interface Season { id: string; name: string; }
interface Menu {
  id: string; location_id: string; name: string; description: string | null;
  price_per_person: number; sort_order: number;
  season_ids: string[]; meal_periods: string[]; days_of_week: number[];
}
interface Course { id: string; tier_id: string; location_id: string; name: string; max_selections: number; sort_order: number; }
interface Item { id: string; course_id: string; location_id: string; name: string; description: string | null; allergens: string[]; upcharge: number; sort_order: number; }

const MEAL_PERIODS = ["Brunch", "Lunch", "Dinner", "Late Night"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MenusTab({ locationId }: { locationId: string }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [editing, setEditing] = useState<Menu | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const [m, s] = await Promise.all([
      supabase.from("location_menu_tiers").select("*").eq("location_id", locationId).order("sort_order"),
      supabase.from("location_seasons").select("id, name").eq("location_id", locationId).order("name"),
    ]);
    setMenus((m.data as Menu[]) || []);
    setSeasons((s.data as Season[]) || []);
  };

  useEffect(() => { load(); }, [locationId]);

  const save = async () => {
    if (!editing) return;
    const row: any = { ...editing };
    if (row.id) {
      const { id, ...patch } = row;
      const { error } = await supabase.from("location_menu_tiers").update(patch).eq("id", id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      delete row.id;
      const { error } = await supabase.from("location_menu_tiers").insert({ ...row, location_id: locationId, sort_order: menus.length });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setEditing(null); load(); toast({ title: "Saved" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this menu and all its courses/items?")) return;
    const { error } = await supabase.from("location_menu_tiers").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    load();
  };

  const newMenu = (): Menu => ({
    id: "", location_id: locationId, name: "", description: "", price_per_person: 0,
    sort_order: menus.length, season_ids: [], meal_periods: [], days_of_week: [],
  });

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Menus</h3>
            <p className="text-xs text-muted-foreground">
              Create a menu for each price point or scenario. Set availability rules so the right menu appears in the quote tool based on date, meal, or day.
            </p>
          </div>
          <Button size="sm" onClick={() => setEditing(newMenu())}>
            <Plus className="h-4 w-4 mr-1" /> Add menu
          </Button>
        </div>

        {menus.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">No menus yet.</p>
            <Button variant="outline" size="sm" onClick={() => setEditing(newMenu())}>
              <Plus className="h-4 w-4 mr-1" /> Create your first menu
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {menus.map((m) => (
              <div key={m.id} className="border border-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${expanded === m.id ? "rotate-90" : ""}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{m.name || "Untitled menu"}</span>
                        <span className="text-sm text-muted-foreground">${m.price_per_person}/person</span>
                      </div>
                      <AvailabilitySummary menu={m} seasons={seasons} />
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                {expanded === m.id && (
                  <div className="border-t border-border p-4 bg-muted/20">
                    <CoursesPanel tierId={m.id} locationId={locationId} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <MenuDialog
        editing={editing}
        seasons={seasons}
        onChange={setEditing}
        onSave={save}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function AvailabilitySummary({ menu, seasons }: { menu: Menu; seasons: Season[] }) {
  const parts: { icon: any; label: string }[] = [];
  if (menu.season_ids?.length) {
    const names = seasons.filter((s) => menu.season_ids.includes(s.id)).map((s) => s.name);
    if (names.length) parts.push({ icon: Sun, label: names.join(" · ") });
  }
  if (menu.meal_periods?.length) parts.push({ icon: Clock, label: menu.meal_periods.join(" · ") });
  if (menu.days_of_week?.length) {
    const dayLabels = menu.days_of_week.map((d) => DAYS[d]).join(" · ");
    parts.push({ icon: Calendar, label: dayLabels });
  }
  if (parts.length === 0) {
    return <p className="text-xs text-muted-foreground mt-1">Always available</p>;
  }
  return (
    <div className="flex items-center gap-3 mt-1 flex-wrap">
      {parts.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <p.icon className="h-3 w-3" /> {p.label}
        </span>
      ))}
    </div>
  );
}

function MenuDialog({
  editing, seasons, onChange, onSave, onClose,
}: {
  editing: Menu | null; seasons: Season[];
  onChange: (m: Menu) => void; onSave: () => void; onClose: () => void;
}) {
  if (!editing) return null;
  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing.id ? "Edit menu" : "New menu"}</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div>
              <Label>Menu name</Label>
              <Input value={editing.name} onChange={(e) => onChange({ ...editing, name: e.target.value })} placeholder="e.g. Classico Dinner" />
            </div>
            <div>
              <Label>Price / person</Label>
              <Input type="number" value={editing.price_per_person} onChange={(e) => onChange({ ...editing, price_per_person: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea rows={2} value={editing.description || ""} onChange={(e) => onChange({ ...editing, description: e.target.value })} />
          </div>

          <div className="pt-2 border-t border-border">
            <h4 className="font-medium text-sm mb-1">Availability</h4>
            <p className="text-xs text-muted-foreground mb-4">Leave a section empty to mean "any". The menu shows in the quote tool when all selected rules match the event.</p>

            <div className="space-y-4">
              {seasons.length > 0 && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Seasons</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {seasons.map((s) => {
                      const on = editing.season_ids.includes(s.id);
                      return (
                        <Badge key={s.id} variant={on ? "default" : "outline"} className="cursor-pointer"
                          onClick={() => onChange({ ...editing, season_ids: toggle(editing.season_ids, s.id) })}>
                          {s.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Meal period</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {MEAL_PERIODS.map((p) => {
                    const on = editing.meal_periods.includes(p);
                    return (
                      <Badge key={p} variant={on ? "default" : "outline"} className="cursor-pointer"
                        onClick={() => onChange({ ...editing, meal_periods: toggle(editing.meal_periods, p) })}>
                        {p}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Days of week</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DAYS.map((d, i) => {
                    const on = editing.days_of_week.includes(i);
                    return (
                      <Badge key={d} variant={on ? "default" : "outline"} className="cursor-pointer min-w-[44px] justify-center"
                        onClick={() => onChange({ ...editing, days_of_week: toggle(editing.days_of_week, i).sort((a, b) => a - b) })}>
                        {d}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        <div key={c.id} className="border border-border rounded-md bg-background">
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
