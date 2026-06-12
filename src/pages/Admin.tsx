import { useEffect, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell, Plus, MapPin } from "lucide-react";
import StatsBar from "@/components/admin/crm/StatsBar";
import PipelineBoard from "@/components/admin/crm/PipelineBoard";
import CalendarBoard from "@/components/admin/crm/CalendarBoard";
import ListBoard from "@/components/admin/crm/ListBoard";
import RemindersBoard from "@/components/admin/crm/RemindersBoard";

export default function Admin() {
  const { session, isAdmin, loading } = useAdminAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const nav = useNavigate();

  const refresh = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    console.log({ data });
    setEvents(data || []);
    const { data: ns } = await supabase.from("admin_notifications").select("*").eq("read", false).limit(20);
    setNotifs(ns || []);
  };

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin || false) return <Navigate to="/admin/login" replace />;

  const markAllRead = async () => {
    await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
    refresh();
  };

  return (
    <div className="crm-theme min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Coordinator Dashboard</h1>
          <p className="text-xs text-muted-foreground">Salumeria 104 Weston</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <Bell className="h-4 w-4 mr-2" />
            {notifs.length} new
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/locations">
              <MapPin className="h-4 w-4 mr-1" />
              Locations
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/events/new">
              <Plus className="h-4 w-4 mr-1" />
              New Event
            </Link>
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <StatsBar events={events} />

        <Tabs defaultValue="pipeline">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          <TabsContent value="pipeline" className="mt-6">
            <PipelineBoard events={events} onChange={refresh} />
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <CalendarBoard events={events} />
          </TabsContent>
          <TabsContent value="list" className="mt-6">
            <ListBoard events={events} />
          </TabsContent>
          <TabsContent value="reminders" className="mt-6">
            <RemindersBoard events={events} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
