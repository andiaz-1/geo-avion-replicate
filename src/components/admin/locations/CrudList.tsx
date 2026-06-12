import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface CrudListProps<T extends { id: string; sort_order?: number }> {
  table: string;
  locationId: string;
  title: string;
  description?: string;
  emptyText?: string;
  defaults: Partial<T>;
  renderRow: (row: T) => ReactNode;
  renderForm: (form: T, setForm: (f: T) => void) => ReactNode;
  orderBy?: string;
}

export default function CrudList<T extends { id: string; sort_order?: number }>(
  { table, locationId, title, description, emptyText, defaults, renderRow, renderForm, orderBy = "sort_order" }: CrudListProps<T>
) {
  const [rows, setRows] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);

  const load = async () => {
    const { data } = await (supabase as any).from(table).select("*").eq("location_id", locationId).order(orderBy);
    setRows((data as T[]) || []);
  };

  useEffect(() => { load(); }, [locationId, table]);

  const openNew = () => setEditing({ ...defaults, location_id: locationId, sort_order: rows.length } as unknown as T);

  const save = async () => {
    if (!editing) return;
    const row: any = { ...editing };
    if ((row.id ?? "").startsWith("new")) delete row.id;
    if (!row.id) {
      delete row.id;
      const { error } = await (supabase as any).from(table).insert({ ...row, location_id: locationId });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { id, ...patch } = row;
      const { error } = await (supabase as any).from(table).update(patch).eq("id", id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setEditing(null); load(); toast({ title: "Saved" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">{emptyText || "Nothing yet."}</p>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/30">
            <div className="flex-1 min-w-0">{renderRow(r)}</div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing && (editing as any).id ? "Edit" : "New"} — {title}</DialogTitle></DialogHeader>
          {editing && renderForm(editing, setEditing)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
