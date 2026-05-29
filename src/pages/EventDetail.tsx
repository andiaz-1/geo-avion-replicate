import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ContactsCard from "@/components/admin/crm/ContactsCard";
import Discussions from "@/components/admin/crm/Discussions";
import ContractDocument from "@/components/admin/crm/ContractDocument";
import {
  MENU_TIERS,
  BEVERAGE_PACKAGES,
  ADDONS,
  STATUS_LABELS,
} from "@/lib/crm-data";

function Card({
  title,
  children,
  action,
  onEdit,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-md p-5 shadow-sm">
      {(title || action || onEdit) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold text-foreground">{title}</h3>}
          <div className="flex items-center gap-2">
            {action}
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function StatusStep({
  label,
  done,
}: {
  label: string;
  done?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border whitespace-nowrap ${
        done
          ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
          : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {done ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 opacity-50" />}
      {label}
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
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = eventData as any;

  const updateEvent = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase
        .from("events")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(data as any)
        .eq("id", eventId!);
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

  // Local state for financial extras (auto-save on blur)
  const [fnbMin, setFnbMin] = useState("");
  const [deposit, setDeposit] = useState("");
  useEffect(() => {
    if (event) {
      setFnbMin(event.fnb_minimum ? String(event.fnb_minimum) : "");
      setDeposit(event.deposit_amount ? String(event.deposit_amount) : "");
    }
  }, [event]);

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  if (isLoading || !event)
    return <div className="p-10 text-muted-foreground">Loading event…</div>;

  const tier = event.menu_tier ? MENU_TIERS[event.menu_tier] : undefined;
  const bev = BEVERAGE_PACKAGES.find((b) => b.value === event.beverage_package);
  const portalUrl = event.portal_token
    ? `${window.location.origin}/portal/${event.portal_token}`
    : null;
  const portalToken = event.portal_token
    ? String(event.portal_token).slice(0, 8)
    : "";

  const copyPortalLink = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    toast.success("Portal link copied");
  };

  // Derived status flags for progress row
  const quoteSent = ["quote_sent", "contract_sent", "confirmed", "completed"].includes(
    event.status
  );
  const contractSent = !!event.contract_sent_at;
  const ccSubmitted = event.cc_auth_status === "authorized";
  const menuMade =
    (event.antipasti_selections?.length || 0) > 0 ||
    (event.entree_selections?.length || 0) > 0 ||
    (event.dessert_selections?.length || 0) > 0;

  const clientName =
    `${event.client_first_name || ""} ${event.client_last_name || ""}`.trim() ||
    event.full_name;
  const companyName = event.company || "";

  const subtotal = Number(event.subtotal || 0);
  const service = Number(event.service_charge || subtotal * 0.23 || 0);
  const tax = Number(event.tax_amount || subtotal * 0.08 || 0);
  const total = Number(event.estimated_total || subtotal + service + tax || 0);

  return (
    <div className="crm-theme min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-primary text-primary-foreground font-medium">
                main
              </span>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                {event.event_name ||
                  `${event.event_type || "Event"} — ${event.venue || "—"}`}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {clientName}
              {companyName ? ` - ${companyName}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/events/${eventId}/edit`}>
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteEvent.mutate()}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Status progress */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusStep label={quoteSent ? "Quote sent" : "Quote: not sent"} done={quoteSent} />
          <div className="h-px w-6 bg-border" />
          <StatusStep
            label={contractSent ? "Contract sent" : "Contract: not sent"}
            done={contractSent}
          />
          <div className="h-px w-6 bg-border" />
          <StatusStep
            label={ccSubmitted ? "CC authorized" : "CC: not submitted"}
            done={ccSubmitted}
          />
          <div className="h-px w-6 bg-border" />
          <StatusStep
            label={menuMade ? "Menu selected" : "Menu: not selected"}
            done={menuMade}
          />
        </div>

        {/* Reminder when client has completed contract + CC */}
        {contractSent && ccSubmitted && (
          <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4">
            <div className="text-amber-600 dark:text-amber-400 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Reminder: Enter this booking in your preferred system
              </p>
              <p className="text-amber-800 dark:text-amber-300/90 mt-0.5">
                The client has signed the contract and submitted their credit card authorization.
                Don't forget to log this booking in your POS / reservation system (e.g. Toast,
                OpenTable, Tripleseat) to keep everything in sync.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <ContactsCard eventId={eventId!} />

            <Card
              title="Event Details"
              onEdit={() => navigate(`/admin/events/${eventId}/edit`)}
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="font-medium">
                    {event.event_date
                      ? format(new Date(event.event_date + "T12:00:00"), "MMMM d, yyyy")
                      : "TBD"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time: </span>
                  <span className="font-medium">{event.event_time || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span className="font-medium">{event.venue || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Guests: </span>
                  <span className="font-medium">{event.guest_count ?? 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-medium">{event.event_type || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Children: </span>
                  <span className="font-medium">
                    {event.children_attending ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Area: </span>
                  <span className="font-medium">{event.venue || "—"}</span>
                </div>
              </div>
            </Card>

            <Card
              title="Menu & Beverages"
              onEdit={() => navigate(`/admin/events/${eventId}/edit`)}
            >
              <div className="space-y-1.5 text-sm">
                <p>
                  <strong>Tier:</strong>{" "}
                  {tier ? `${tier.label} ($${tier.price}/person)` : event.menu_tier || "—"}
                </p>
                {event.antipasti_selections?.length > 0 && (
                  <p>
                    <strong>Antipasti:</strong>{" "}
                    {event.antipasti_selections.join(", ")}
                  </p>
                )}
                {event.entree_selections?.length > 0 && (
                  <p>
                    <strong>Entrées:</strong> {event.entree_selections.join(", ")}
                  </p>
                )}
                {event.dessert_selections?.length > 0 && (
                  <p>
                    <strong>Desserts:</strong> {event.dessert_selections.join(", ")}
                  </p>
                )}
                {bev && (
                  <p>
                    <strong>Beverage:</strong> {bev.label}
                  </p>
                )}
                {(() => {
                  const raw = event.addons;
                  const list: string[] = Array.isArray(raw)
                    ? raw
                    : raw && typeof raw === "object"
                    ? Object.keys(raw).filter((k) => (raw as Record<string, unknown>)[k])
                    : [];
                  if (list.length === 0) return null;
                  return (
                    <p>
                      <strong>Add-ons:</strong>{" "}
                      {list
                        .map((a) => ADDONS.find((x) => x.value === a)?.label || a)
                        .join(", ")}
                    </p>
                  );
                })()}
              </div>
            </Card>

            <Card
              title="Notes"
              onEdit={() => navigate(`/admin/events/${eventId}/edit`)}
            >
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {event.notes || "No notes yet."}
              </p>
            </Card>

            <Discussions
              eventId={eventId!}
              audience="client"
              title="Client Discussion"
              description="Conversations visible to the client through the portal."
            />

            <Discussions
              eventId={eventId!}
              audience="staff"
              title="Staff Discussion"
              description="Internal notes between staff — never shown to the client."
            />
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card title="Financial Summary">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service (23%)</span>
                  <span>${service.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-border pt-2">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm text-muted-foreground">F&B Minimum</label>
                    <Input
                      value={fnbMin}
                      onChange={(e) => setFnbMin(e.target.value)}
                      onBlur={() =>
                        updateEvent.mutate({ fnb_minimum: Number(fnbMin) || 0 })
                      }
                      placeholder="$0.00"
                      className="w-28 text-right"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm text-muted-foreground">
                      Deposit Amount
                    </label>
                    <Input
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      onBlur={() =>
                        updateEvent.mutate({ deposit_amount: Number(deposit) || 0 })
                      }
                      placeholder="$0.00"
                      className="w-28 text-right"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Event Cards">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-muted">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">No saved cards</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add a card to enable easy payments and deposits for this event.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Add / Manage Cards
              </Button>
            </Card>

            <Card title="Client Portal">
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
                      <Button onClick={() => window.print()} variant="outline">
                        Print
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {portalUrl && (
                  <>
                    <div
                      className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded truncate"
                      title={portalUrl}
                    >
                      {portalToken}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyPortalLink}
                        className="flex-1"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={portalUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  </>
                )}

                {event.status !== "completed" && event.status !== "cancelled" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateEvent.mutate({ status: "completed" })}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => updateEvent.mutate({ status: "cancelled" })}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
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
