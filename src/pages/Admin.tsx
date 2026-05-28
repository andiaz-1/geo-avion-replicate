import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/admin/CalendarView";
import PipelineView from "@/components/admin/PipelineView";
import RemindersView from "@/components/admin/RemindersView";
import EventDrawer from "@/components/admin/EventDrawer";
import { Bell } from "lucide-react";

export type AdminEvent = any;

export default function Admin() {
  const { session, isAdmin, loading } = useAdminAuth();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [selected, setSelected] = useState<AdminEvent | null>(null);
  const nav = useNavigate();

  const refresh = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents(data || []);
    const { data: ns } = await supabase.from("admin_notifications").select("*").eq("read", false).order("created_at", { ascending: false }).limit(20);
    setNotifs(ns || []);
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;

  const markAllRead = async () => {
    await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Coordinator Dashboard</h1>
          <p className="text-xs text-muted-foreground">Salumeria 104 Weston</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <Bell className="h-4 w-4 mr-2" />
              {notifs.length} new
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); nav("/admin/login"); }}>Sign out</Button>
        </div>
      </header>

      {notifs.length > 0 && (
        <div className="bg-secondary/10 border-b border-border px-6 py-2 text-sm text-foreground">
          {notifs.slice(0, 3).map(n => <div key={n.id}>• {n.message}</div>)}
        </div>
      )}

      <main className="p-6">
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="mt-6">
            <CalendarView events={events} onSelect={setSelected} />
          </TabsContent>
          <TabsContent value="pipeline" className="mt-6">
            <PipelineView events={events} onSelect={setSelected} onChange={refresh} />
          </TabsContent>
          <TabsContent value="reminders" className="mt-6">
            <RemindersView events={events} onSelect={setSelected} />
          </TabsContent>
        </Tabs>
      </main>

      {selected && <EventDrawer event={selected} onClose={() => setSelected(null)} onChange={() => { refresh(); }} />}
    </div>
  );
}
