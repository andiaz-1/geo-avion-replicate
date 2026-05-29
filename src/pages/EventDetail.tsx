import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ContactsCard from "@/components/admin/crm/ContactsCard";
import Discussions from "@/components/admin/crm/Discussions";
import ContractDocument from "@/components/admin/crm/ContractDocument";
import { MENU_TIERS, BEVERAGE_PACKAGES, ADDONS, STATUS_COLORS, STATUS_LABELS, displayName } from "@/lib/crm-data";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}:</span> <span className="text-foreground">{value}</span>
    </p>
  );
}

function Card({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function EventDetail() {
  const { session, isAdmin, loading } = useAdminAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = eventData as any;

  const updateEvent = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("events").update(data as any).eq("id", eventId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEvent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").delete().eq("id", eventId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/admin");
    },
  });

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  if (isLoading || !event) return <div className="p-10 text-muted-foreground">Loading event…</div>;

  const tier = event.menu_tier ? MENU_TIERS[event.menu_tier] : undefined;
  const bev = BEVERAGE_PACKAGES.find((b) => b.value === event.beverage_package);
  const portalUrl = event.portal_token ? `${window.location.origin}/portal/${event.portal_token}` : null;

  const copyPortalLink = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    toast.success("Portal link copied");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard</Link>
        </Button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {event.event_name || `${event.event_type || "Event"} — ${event.location || event.venue || ""}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {displayName(event as never)}
              {event.company_name ? ` · ${event.company_name}` : ""}
            </p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-sm border text-xs ${STATUS_COLORS[event.status] || ""}`}>
              {STATUS_LABELS[event.status] || event.status}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/events/${eventId}/edit`}>
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteEvent.mutate()} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Event Details" onEdit={() => navigate(`/admin/events/${eventId}/edit`)}>
              <div className="grid grid-cols-2 gap-2">
                <Detail label="Date" value={event.event_date ? format(new Date(event.event_date + "T12:00:00"), "MMM d, yyyy") : "TBD"} />
                <Detail label="Time" value={event.event_time || "—"} />
                <Detail label="Location" value={event.location || event.venue || "—"} />
                <Detail label="Type" value={event.event_type || "—"} />
                <Detail label="Guests" value={event.guest_count ?? 0} />
                <Detail label="Email" value={event.email} />
                <Detail label="Phone" value={event.phone || "—"} />
              </div>
            </Card>

            <Card title="Menu & Beverage" onEdit={() => navigate(`/admin/events/${eventId}/edit`)}>
              <div className="space-y-1 text-sm">
                <p><strong>Tier:</strong> {tier?.label || event.menu_tier || "—"} {tier ? `($${tier.price}/person)` : ""}</p>
                {event.antipasti_selections?.length > 0 && <p><strong>Antipasti:</strong> {event.antipasti_selections.join(", ")}</p>}
                {event.entree_selections?.length > 0 && <p><strong>Entrées:</strong> {event.entree_selections.join(", ")}</p>}
                {event.dessert_selections?.length > 0 && <p><strong>Desserts:</strong> {event.dessert_selections.join(", ")}</p>}
                {bev && <p><strong>Beverage:</strong> {bev.label}</p>}
                {event.addons?.length > 0 && (
                  <p><strong>Add-ons:</strong> {event.addons.map((a: string) => ADDONS.find((x) => x.value === a)?.label || a).join(", ")}</p>
                )}
              </div>
            </Card>

            {event.notes && (
              <Card title="Notes" onEdit={() => navigate(`/admin/events/${eventId}/edit`)}>
                <p className="text-sm whitespace-pre-wrap">{event.notes}</p>
              </Card>
            )}

            <Discussions eventId={eventId!} />
          </div>

          <div className="space-y-6">
            <ContactsCard eventId={eventId!} />

            <Card title="Financials">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${Number(event.subtotal || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Service (23%)</span><span>${Number(event.service_charge || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Tax (8%)</span><span>${Number(event.tax_amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t border-border pt-1">
                  <span>Estimated Total</span>
                  <span>${Number(event.estimated_total || event.quote?.grandTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card title="Contract & Portal">
              <div className="space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="w-4 h-4 mr-1" /> View Contract
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Event Contract</DialogTitle>
                    </DialogHeader>
                    <ContractDocument event={event} />
                    <div className="flex gap-2 justify-end mt-4">
                      <Button onClick={() => window.print()} variant="outline">Print</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {portalUrl && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground truncate" title={portalUrl}>{portalUrl}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyPortalLink} className="flex-1">
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={portalUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {event.status !== "completed" && event.status !== "cancelled" && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => updateEvent.mutate({ status: "completed" })}>
                      Complete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateEvent.mutate({ status: "cancelled" })}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
