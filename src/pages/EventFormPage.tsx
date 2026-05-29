import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import EventForm, { EventFormValues } from "@/components/admin/crm/EventForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EventFormPage() {
  const { session, isAdmin, loading } = useAdminAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!eventId;

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId!).single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const mutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const { company_name, location, ...rest } = data;
      const payload = {
        ...rest,
        company: company_name,
        venue: location,
        full_name: `${data.client_first_name} ${data.client_last_name}`.trim(),
      };
      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from("events").update(payload as any).eq("id", eventId!);
        if (error) throw error;
        return { id: eventId! };
      }
      const { data: created, error } = await supabase
        .from("events")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ ...payload, status: "new_lead" } as any)
        .select("id")
        .single();
      if (error) throw error;
      return created;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success(isEdit ? "Event updated" : "Event created");
      navigate(`/admin/events/${result.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  if (isEdit && isLoading) return <div className="p-10 text-muted-foreground">Loading event…</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to={isEdit ? `/admin/events/${eventId}` : "/admin"}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold mb-6">{isEdit ? "Edit Event" : "New Event"}</h1>
        <EventForm
          defaultValues={(event || {}) as Partial<EventFormValues>}
          onSubmit={(d) => mutation.mutate(d)}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}
