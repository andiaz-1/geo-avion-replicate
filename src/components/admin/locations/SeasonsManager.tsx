import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Season {
  id: string;
  location_id: string;
  name: string;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  fnb_minimum: number;
  color: string | null;
  sort_order: number;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DEFAULT_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function SeasonsManager({ locationId }: { locationId: string }) {
  const [seasons, setSeasons] = useState<Season[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("location_seasons")
      .select("*")
      .eq("location_id", locationId)
      .order("sort_order");
    setSeasons((data as Season[]) || []);
  };

  useEffect(() => { load(); }, [locationId]);

  const add = async () => {
    const idx = seasons.length;
    const { error } = await supabase.from("location_seasons").insert({
      location_id: locationId,
      name: "New season",
      start_month: 1, start_day: 1,
      end_month: 12, end_day: 31,
      fnb_minimum: 0,
      color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      sort_order: idx,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  const update = async (id: string, patch: Partial<Season>) => {
    const { error } = await supabase.from("location_seasons").update(patch).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setSeasons((s) => s.map((x) => x.id === id ? { ...x, ...patch } : x));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this season?")) return;
    const { error } = await supabase.from("location_seasons").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Seasons & F&B Minimums</h3>
          <p className="text-xs text-muted-foreground">
            Define date ranges. The quote tool picks the season matching the event date and applies its F&B minimum.
          </p>
        </div>
        <Button size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add season</Button>
      </div>

      {seasons.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No seasons yet. A single rate applies year-round unless you add seasonal pricing.
        </p>
      )}

      <div className="space-y-3">
        {seasons.map((s) => (
          <div key={s.id} className="flex flex-wrap items-end gap-3 p-3 border border-border rounded-md">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <input
                type="color"
                value={s.color || "#888888"}
                onChange={(e) => update(s.id, { color: e.target.value })}
                className="h-9 w-9 rounded cursor-pointer border border-border"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Label className="text-xs">Name</Label>
              <Input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Start</Label>
              <div className="flex gap-1">
                <Select value={String(s.start_month)} onValueChange={(v) => update(s.id, { start_month: Number(v) })}>
                  <SelectTrigger className="w-[88px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" min={1} max={31} className="w-16" value={s.start_day} onChange={(e) => update(s.id, { start_day: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <div className="flex gap-1">
                <Select value={String(s.end_month)} onValueChange={(v) => update(s.id, { end_month: Number(v) })}>
                  <SelectTrigger className="w-[88px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" min={1} max={31} className="w-16" value={s.end_day} onChange={(e) => update(s.id, { end_day: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">F&B Minimum</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input type="number" className="pl-7 w-32" value={s.fnb_minimum} onChange={(e) => update(s.id, { fnb_minimum: Number(e.target.value) })} />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Date ranges may wrap year-end (e.g. <strong>Nov 15 → Jan 5</strong>). If multiple seasons cover the same date, the first one in this list wins.
      </p>
    </Card>
  );
}
