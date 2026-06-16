import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MenusTab from "@/components/admin/locations/MenusTab";
import { Card } from "@/components/ui/card";
import { Check, Circle, ArrowRight, ChefHat, ListChecks, CalendarClock, Sparkles } from "lucide-react";

interface Loc { id: string; slug: string; name: string; }

interface MenuProgress {
  id: string;
  name: string;
  price: number;
  courses: number;
  items: number;
  hasAvailability: boolean;
}

const STEPS = [
  { key: "menu", label: "Create a menu", icon: ChefHat, hint: "Name, price per person" },
  { key: "courses", label: "Add courses", icon: ListChecks, hint: "e.g. Antipasti, Entrée, Dessert" },
  { key: "items", label: "Add dishes to each course", icon: Sparkles, hint: "Items guests can choose" },
  { key: "availability", label: "Set availability rules", icon: CalendarClock, hint: "Season, meal, days — optional but recommended" },
];

export default function CrmMenus() {
  const [locations, setLocations] = useState<Loc[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [progress, setProgress] = useState<MenuProgress[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    supabase.from("locations").select("id, slug, name").order("name").then(({ data }) => {
      const list = (data as Loc[]) || [];
      setLocations(list);
      if (list.length && !selected) setSelected(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data: menus } = await supabase
        .from("location_menu_tiers")
        .select("id, name, price_per_person, season_ids, meal_periods, days_of_week")
        .eq("location_id", selected);
      const menuList = (menus as any[]) || [];
      const rows: MenuProgress[] = await Promise.all(menuList.map(async (m) => {
        const { data: courses } = await supabase
          .from("location_menu_courses").select("id").eq("tier_id", m.id);
        const courseIds = (courses || []).map((c: any) => c.id);
        let itemCount = 0;
        if (courseIds.length) {
          const { count } = await supabase
            .from("location_menu_items")
            .select("id", { count: "exact", head: true })
            .in("course_id", courseIds);
          itemCount = count || 0;
        }
        return {
          id: m.id,
          name: m.name || "Untitled menu",
          price: m.price_per_person,
          courses: courseIds.length,
          items: itemCount,
          hasAvailability: (m.season_ids?.length || 0) + (m.meal_periods?.length || 0) + (m.days_of_week?.length || 0) > 0,
        };
      }));
      setProgress(rows);
    })();
    // Re-poll briefly to reflect changes made inside MenusTab
    const t = setInterval(() => setTick((x) => x + 1), 2500);
    return () => clearInterval(t);
  }, [selected, tick]);

  const current = locations.find((l) => l.id === selected);

  // Global checklist (location-level)
  const totalMenus = progress.length;
  const totalCourses = progress.reduce((s, m) => s + m.courses, 0);
  const totalItems = progress.reduce((s, m) => s + m.items, 0);
  const anyAvail = progress.some((m) => m.hasAvailability);
  const stepDone = {
    menu: totalMenus > 0,
    courses: totalCourses > 0,
    items: totalItems > 0,
    availability: anyAvail,
  };
  const doneCount = Object.values(stepDone).filter(Boolean).length;
  const nextStep = STEPS.find((s) => !stepDone[s.key as keyof typeof stepDone]);

  // Per-menu next step hint
  const menuNext = (m: MenuProgress): { label: string; tone: "todo" | "done" } => {
    if (m.courses === 0) return { label: "Next: add courses", tone: "todo" };
    if (m.items === 0) return { label: "Next: add dishes to courses", tone: "todo" };
    if (!m.hasAvailability) return { label: "Next: set availability (optional)", tone: "todo" };
    return { label: "Ready to use in quotes", tone: "done" };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Menus</h1>
          <p className="text-sm text-muted-foreground">
            Build menus per location. Set availability by season, meal, or day of the week.
          </p>
        </div>
        {locations.length > 0 && (
          <select
            value={selected ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        )}
      </div>

      {current && (
        <Card className="p-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Setup progress · {current.name}</p>
              <h2 className="text-base font-semibold">
                {doneCount === 4 ? "All set — your menus are ready" : `${doneCount} of 4 steps complete`}
              </h2>
              {nextStep && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5" /> Next: <span className="font-medium text-foreground">{nextStep.label}</span> — {nextStep.hint}
                </p>
              )}
            </div>
            <div className="flex-1 min-w-[280px] max-w-[520px]">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(doneCount / 4) * 100}%` }} />
              </div>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
            {STEPS.map((s, i) => {
              const done = stepDone[s.key as keyof typeof stepDone];
              const isNext = nextStep?.key === s.key;
              const Icon = s.icon;
              return (
                <li
                  key={s.key}
                  className={`relative rounded-lg border p-3 transition-colors ${
                    done ? "border-primary/30 bg-primary/5" : isNext ? "border-foreground/40 bg-background" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-medium ${
                      done ? "bg-primary text-primary-foreground" : isNext ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <Icon className={`h-4 w-4 ${done ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <p className="text-sm font-medium mt-2">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.hint}</p>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      {current && progress.length > 0 && (
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Per-menu status</p>
          <div className="space-y-2">
            {progress.map((m) => {
              const n = menuNext(m);
              return (
                <div key={m.id} className="flex items-center justify-between gap-4 text-sm border border-border rounded-md px-3 py-2">
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="font-medium truncate">{m.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">${m.price}/pp · {m.courses} courses · {m.items} items</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full shrink-0 ${
                    n.tone === "done" ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                  }`}>
                    {n.tone === "done" ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                    {n.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {current ? (
        <MenusTab locationId={current.id} />
      ) : (
        <div className="text-sm text-muted-foreground border rounded-md p-8 text-center">
          {locations.length === 0 ? "No locations found. Create a location in /admin/locations first." : "Select a location."}
        </div>
      )}
    </div>
  );
}
