import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MenusTab from "@/components/admin/locations/MenusTab";

interface Loc { id: string; slug: string; name: string; }

export default function CrmMenus() {
  const [locations, setLocations] = useState<Loc[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, slug, name")
      .order("name")
      .then(({ data }) => {
        const list = (data as Loc[]) || [];
        setLocations(list);
        if (list.length && !selected) setSelected(list[0].id);
      });
  }, []);

  const current = locations.find((l) => l.id === selected);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Menus</h1>
          <p className="text-sm text-muted-foreground">
            Manage menus per location. Set availability by season, meal, or day of the week.
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
