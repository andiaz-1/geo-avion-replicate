import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, Mail, Phone, FileText, ChevronDown,
  Lock, Unlock, Copy, ExternalLink, Check, X, MessageSquare, Eye, StickyNote,
  Plus, MoreHorizontal,
} from "lucide-react";
import { useCrm } from "@/data/crmStore";
import { STATUS_PILL, EventStatus, StepKey, MOCK_NOW, addBusinessDays } from "@/data/crmMock";
import { Avatar } from "@/components/crm/CrmPrimitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";

const MARKER = { fontFamily: '"Permanent Marker", "Caveat", cursive', letterSpacing: "0.02em" };

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e6dfd2] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#2a241c]" style={MARKER}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const STEP_LABEL: Record<StepKey, string> = {
  quote: "Quote sent", contract: "Contract", cc: "CC submitted", menu: "Menu selected",
};

function StepPill({ label, state, onClick }: { label: string; state: "done" | "todo" | "manual"; onClick?: () => void }) {
  const cls =
    state === "done" ? "border-green-500 text-green-700 bg-green-50"
    : state === "manual" ? "border-gray-400 text-gray-600 bg-gray-50"
    : "border-gray-300 text-gray-500 bg-white";
  const prefix = state === "done" ? "✓ " : state === "manual" ? "● manual · " : "";
  return (
    <button onClick={onClick} className={`text-xs px-3 py-1.5 rounded-full border ${cls} hover:opacity-80 transition-opacity`}>
      {prefix}{label}
    </button>
  );
}

function NotSet({ value }: { value?: string }) {
  if (!value || value === "Not set") return <span className="text-red-600 font-medium">Not set ⚠</span>;
  return <>{value}</>;
}

export default function EventDetailCrm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, venueDefaults, updateEvent, setStep, deleteEvent, setEventStatus, addNote, notes } = useCrm();
  const event = events.find((e) => e.id === id) || events[0];
  const vd = venueDefaults[event.venue];
  const [tab, setTab] = useState<"client" | "staff" | "notes">("client");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [overrideStep, setOverrideStep] = useState<StepKey | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [editingDetails, setEditingDetails] = useState(false);
  const [nextAction, setNextAction] = useState(event.nextAction || "");
  const [followUpDue, setFollowUpDue] = useState(event.followUpDue || "");

  const eventNotes = notes.filter((n) => n.eventId === event.id);

  // Financial computed
  const subtotal = event.financial.subtotal;
  const service = Math.round(subtotal * (vd.servicePct / 100));
  const tax = Math.round(subtotal * (vd.taxPct / 100));
  const total = subtotal + service + tax;

  const handleStepClick = (step: StepKey) => {
    const current = event.steps[step];
    if (current === "done" || current === "manual") {
      setStep(event.id, step, "todo");
      return;
    }
    // Validate before advancing
    const reasons: Record<StepKey, () => string | null> = {
      quote: () => (event.documents.length > 0 || total > 0 ? null : "at least one document in DOCUMENTS or a nonzero Total in FINANCIAL SUMMARY"),
      contract: () => (event.documents.some((d) => d.type === "Contract") ? null : "a document of type Contract"),
      cc: () => (event.cards.length > 0 ? null : "a saved card in EVENT CARDS"),
      menu: () => null,
    };
    const missing = reasons[step]();
    if (missing) { setOverrideStep(step); return; }
    setStep(event.id, step, "done");
    if (step === "quote" && !event.followUpDue) {
      const due = addBusinessDays(MOCK_NOW, 3).toISOString().slice(0, 10);
      updateEvent(event.id, { followUpDue: due, nextAction: event.nextAction || "Follow up on quote" });
      setFollowUpDue(due);
      setNextAction(event.nextAction || "Follow up on quote");
    }
  };

  const handleOverride = () => {
    if (!overrideStep || !overrideReason.trim()) return;
    setStep(event.id, overrideStep, "manual");
    addNote(event.id, `[Override · ${STEP_LABEL[overrideStep]}] ${overrideReason}`);
    setOverrideReason(""); setOverrideStep(null);
  };

  const handleDelete = () => {
    if (deleteCode !== event.id) return;
    deleteEvent(event.id);
    navigate("/crm/events");
  };

  const saveDetails = () => {
    updateEvent(event.id, { nextAction, followUpDue });
    setEditingDetails(false);
  };

  return (
    <div className="-m-6 min-h-[calc(100vh-3.5rem)] bg-[#f5f1ea] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/crm/events" className="inline-flex items-center gap-1.5 text-sm text-[#2a241c] hover:opacity-70">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h2 className="text-lg font-semibold text-[#2a241c]">Event Details</h2>
          <button className="inline-flex items-center gap-1.5 text-sm border border-[#2a241c]/20 px-3 py-1.5 rounded-md bg-white">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded uppercase ${STATUS_PILL[event.status]}`}>{event.status}</span>
              <h1 className="text-4xl text-[#2a241c]" style={MARKER}>{event.name.toUpperCase()}</h1>
            </div>
            <p className="text-sm text-[#5a4f42]">{event.contact.name} · <span className="font-mono">#{event.id}</span></p>
          </div>
          <div className="flex gap-2 items-start relative">
            <button className="inline-flex items-center gap-1.5 text-sm border border-[#2a241c]/20 px-3 py-2 rounded-md bg-white"><Pencil className="h-3.5 w-3.5" /> Edit</button>
            <button
              onClick={() => setActionsOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 text-sm border border-[#2a241c]/20 px-3 py-2 rounded-md bg-white"
            >
              <MoreHorizontal className="h-3.5 w-3.5" /> Actions
              <ChevronDown className="h-3 w-3" />
            </button>
            {actionsOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white border border-border rounded-lg shadow-lg z-50">
                <button onClick={() => { setEventStatus(event.id, "Lost"); setActionsOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/30">Mark as Lost</button>
                <button onClick={() => { setDeleteOpen(true); setActionsOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-border">Delete</button>
              </div>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {(["quote", "contract", "cc", "menu"] as StepKey[]).map((k, i) => (
            <div key={k} className="flex items-center gap-2">
              <StepPill label={STEP_LABEL[k]} state={event.steps[k]} onClick={() => handleStepClick(k)} />
              {i < 3 && <span className="text-gray-300">— — —</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">
            <Section title="CONTACTS">
              <div className="flex items-start gap-3 pb-4 border-b border-[#e6dfd2]">
                <Avatar name={event.contact.name} />
                <div className="text-sm flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.contact.name}</span>
                    <span className="text-[10px] uppercase tracking-wider bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">MAIN</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Mail className="h-3 w-3" /> {event.contact.email}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {event.contact.phone}</div>
                </div>
              </div>
              <div className="mt-4">
                {!addContactOpen ? (
                  <button onClick={() => setAddContactOpen(true)} className="inline-flex items-center gap-1.5 text-sm border border-[#e6dfd2] bg-white px-3 py-2 rounded-md hover:bg-[#faf6ee]">
                    <Plus className="h-3.5 w-3.5" /> Add contact
                  </button>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Add new contact</p>
                      <button onClick={() => setAddContactOpen(false)} className="text-xs text-[#9b7fc7] hover:underline">Cancel</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs">First Name*</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                      <div><label className="text-xs">Last Name</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                      <div><label className="text-xs">Email</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                      <div><label className="text-xs">Phone</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                    </div>
                    <button disabled className="w-full mt-3 py-2 rounded-md bg-[#aab89d] text-white text-sm cursor-not-allowed opacity-70">Save Contact</button>
                  </>
                )}
              </div>
            </Section>

            <Section title="EVENT DETAILS" action={
              <button onClick={() => setEditingDetails((v) => !v)} className="inline-flex items-center gap-1 text-xs text-[#5a4f42] hover:text-[#2a241c]">
                <Pencil className="h-3 w-3" /> {editingDetails ? "Done" : "Edit"}
              </button>
            }>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Pair k="DATE" v={format(parseISO(event.date), "MMMM d, yyyy")} />
                <Pair k="TIME" v={event.startTime} />
                <Pair k="LOCATION" v={event.venue} />
                <Pair k="EXPECTED GUESTS" v={String(event.guests)} />
                <Pair k="TYPE" v={event.details?.type ?? "Not set"} highlight />
                <Pair k="CHILDREN ATTENDING" v={event.details?.children ? "Yes" : "No"} />
                <Pair k="OWNER" v={event.details?.owner ?? "Not set"} highlight />
                <Pair k="LEAD SOURCE" v={event.details?.leadSource ?? "Not set"} highlight />
                <Pair k="CREATED" v={event.details?.createdAt ?? "—"} />
                <Pair k="UPDATED" v={event.details?.updatedAt ?? "—"} />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">NEXT ACTION</div>
                  {editingDetails ? (
                    <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="e.g. Send wine package pricing"
                      className="w-full mt-1 px-2 py-1 text-sm border border-[#e6dfd2] rounded bg-white" />
                  ) : (
                    <div className="text-[#2a241c]">{nextAction || <span className="text-muted-foreground italic">—</span>}</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">FOLLOW-UP DUE</div>
                  {editingDetails ? (
                    <input type="date" value={followUpDue} onChange={(e) => setFollowUpDue(e.target.value)}
                      className="w-full mt-1 px-2 py-1 text-sm border border-[#e6dfd2] rounded bg-white" />
                  ) : (
                    <div className="text-[#2a241c]">{followUpDue || <span className="text-muted-foreground italic">—</span>}</div>
                  )}
                </div>
              </div>
              {editingDetails && (
                <button onClick={saveDetails} className="mt-4 text-sm bg-[#2a241c] text-white px-3 py-1.5 rounded">Save</button>
              )}
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Budget Description</div>
                <div className="bg-[#faf6ee] border border-[#e6dfd2] rounded p-3 text-sm">{event.details?.budgetDescription ?? "—"}</div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Additional Information</div>
                <div className="bg-[#faf6ee] border border-[#e6dfd2] rounded p-3 text-sm">{event.details?.additional ?? "—"}</div>
              </div>
            </Section>

            <Section title="MENU & BEVERAGES" action={
              <button className="inline-flex items-center gap-1 text-xs text-[#5a4f42] hover:text-[#2a241c]"><Pencil className="h-3 w-3" /> Edit</button>
            }>
              <p className="text-sm text-muted-foreground">Tier: —</p>
            </Section>

            <Section title={`DOCUMENTS (${event.documents.length})`} action={
              <button className="inline-flex items-center gap-1 text-xs border border-[#e6dfd2] bg-white px-2 py-1 rounded">+ Add document <ChevronDown className="h-3 w-3" /></button>
            }>
              {event.documents.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No documents are associated with this event.
                </div>
              ) : (
                <div className="space-y-2">
                  {event.documents.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 text-sm border border-[#e6dfd2] rounded p-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="CLIENT DISCUSSION">
              <div className="flex gap-1 mb-4 bg-[#faf6ee] p-1 rounded-md w-fit">
                {[
                  { k: "client", label: "Client Discussion", icon: MessageSquare },
                  { k: "staff", label: "Staff Discussion", icon: Eye },
                  { k: "notes", label: `Notes${eventNotes.length ? ` (${eventNotes.length})` : ""}`, icon: StickyNote },
                ].map(({ k, label, icon: I }) => (
                  <button
                    key={k}
                    onClick={() => setTab(k as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded ${tab === k ? "bg-white shadow-sm font-medium" : "text-muted-foreground"}`}
                  >
                    <I className="h-3 w-3" /> {label}
                  </button>
                ))}
              </div>
              {tab === "client" && (
                <>
                  <p className="text-xs text-muted-foreground mb-3">Conversations visible to the client through the portal.</p>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <button className="inline-flex items-center gap-1 bg-[#2a241c] text-white text-xs px-3 py-1.5 rounded-md">
                      <Plus className="h-3 w-3" /> New Discussion
                    </button>
                    <input placeholder="Search discussions" className="flex-1 max-w-xs px-2 py-1.5 text-xs border border-[#e6dfd2] rounded bg-white" />
                  </div>
                  {event.discussions > 0 ? (
                    <div className="border border-[#e6dfd2] rounded-md p-3 text-sm">
                      <div className="font-medium">Your reservation at {event.venue} {event.name} {format(parseISO(event.date), "EEEE, MMMM d, yyyy")}</div>
                      <div className="text-xs text-muted-foreground mt-1">👤 {event.contact.name} · 🕐 Jun 11, 2026 · 1 message</div>
                    </div>
                  ) : <p className="text-xs italic text-muted-foreground">No discussions yet.</p>}
                </>
              )}
              {tab === "staff" && <p className="text-sm text-muted-foreground py-4">No staff messages yet.</p>}
              {tab === "notes" && (
                eventNotes.length === 0 ? <p className="text-sm text-muted-foreground py-4">No notes yet.</p>
                : <div className="space-y-2">{eventNotes.map((n, i) => (
                    <div key={i} className="border border-[#e6dfd2] rounded p-3 text-sm bg-[#faf6ee]">
                      <div>{n.text}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}</div>
              )}
            </Section>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <Section title="FINANCIAL SUMMARY">
              <div className="space-y-2 text-sm pb-4 border-b border-[#e6dfd2]">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service ({vd.servicePct}%)</span><span>${service}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax ({vd.taxPct}%)</span><span>${tax}</span></div>
                <div className="flex justify-between font-semibold pt-1"><span>Total</span><span>${total}</span></div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["F&B Minimum", event.financial.fbMinimum],
                  ["Deposit Amount", event.financial.deposit],
                  ["Venue Fee", event.financial.venueFee],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <label className="text-xs text-muted-foreground">{l}</label>
                    <input defaultValue={`$${(v as number).toFixed(2)}`} className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" />
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground italic">Pre-filled from {event.venue} defaults — editable per event.</p>
              </div>
            </Section>

            <Section title="EVENT CARDS">
              {event.cards.length === 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3">No saved cards — Add a card to enable easy payments and deposits for this event.</p>
                  <button className="inline-flex items-center gap-1 border border-[#e6dfd2] bg-white text-sm px-3 py-1.5 rounded-md">
                    <Plus className="h-3 w-3" /> Add Card
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  {event.cards.map((c) => (
                    <div key={c.id} className="text-sm border border-[#e6dfd2] rounded p-2">•••• {c.last4}</div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="CLIENT PORTAL">
              <div className="flex items-center justify-between text-sm pb-3 border-b border-[#e6dfd2]">
                <span className="inline-flex items-center gap-1.5"><Unlock className="h-3.5 w-3.5 text-green-600" /> Portal unlocked — Client sees full stepper</span>
                <button className="inline-flex items-center gap-1 text-xs border border-[#e6dfd2] bg-white px-2 py-1 rounded"><Lock className="h-3 w-3" /> Lock</button>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="inline-flex items-center gap-1.5 flex-1 justify-center text-xs border border-[#e6dfd2] bg-white px-3 py-2 rounded">
                  <Copy className="h-3 w-3" /> Copy New Portal Link
                </button>
                <button className="border border-[#e6dfd2] bg-white px-2 py-2 rounded"><ExternalLink className="h-3 w-3" /></button>
              </div>
              <p className="text-xs italic text-muted-foreground mt-3">No documents yet.</p>
              <div className="mt-3 flex gap-2">
                <input readOnly value={event.id} className="flex-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-[#faf6ee]" />
                <button className="inline-flex items-center gap-1 text-xs border border-[#e6dfd2] bg-white px-3 py-1.5 rounded"><Copy className="h-3 w-3" /> Copy Link</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="inline-flex items-center justify-center gap-1.5 text-sm bg-green-600 text-white px-3 py-2 rounded"><Check className="h-3.5 w-3.5" /> Complete</button>
                <button className="inline-flex items-center justify-center gap-1.5 text-sm border border-red-300 text-red-600 px-3 py-2 rounded"><X className="h-3.5 w-3.5" /> Cancel</button>
              </div>
            </Section>

            <Section title="ATTACHED FILES">
              <p className="text-sm text-muted-foreground">No files attached yet.</p>
            </Section>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete event?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This permanently removes <span className="font-mono font-semibold">#{event.id}</span>. To confirm, type the event code below.
          </p>
          <input
            value={deleteCode} onChange={(e) => setDeleteCode(e.target.value)}
            placeholder={event.id}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white font-mono"
          />
          <DialogFooter>
            <button onClick={() => { setDeleteOpen(false); setDeleteCode(""); }} className="px-3 py-2 text-sm border border-border rounded-md">Cancel</button>
            <button
              disabled={deleteCode !== event.id}
              onClick={handleDelete}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Delete event
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step override */}
      <Dialog open={!!overrideStep} onOpenChange={(o) => !o && setOverrideStep(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{overrideStep ? STEP_LABEL[overrideStep] : ""}</DialogTitle></DialogHeader>
          <p className="text-sm">
            This step needs{" "}
            <strong>
              {overrideStep === "quote" && "at least one document in DOCUMENTS or a nonzero Total in FINANCIAL SUMMARY"}
              {overrideStep === "contract" && "a document of type Contract"}
              {overrideStep === "cc" && "a saved card in EVENT CARDS"}
            </strong>
            . Add it now, or override with a note.
          </p>
          <textarea
            value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)}
            rows={3} placeholder="Reason for manual override..."
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white"
          />
          <DialogFooter>
            <button onClick={() => { setOverrideStep(null); setOverrideReason(""); }} className="px-3 py-2 text-sm border border-border rounded-md">Cancel</button>
            <button
              onClick={handleOverride}
              disabled={!overrideReason.trim()}
              className="px-3 py-2 text-sm bg-gray-700 text-white rounded-md disabled:opacity-40"
            >
              Override with note
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Pair({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-[#2a241c]">
        {highlight && (v === "Not set" || !v)
          ? <span className="text-red-600 font-medium">Not set ⚠</span>
          : v}
      </div>
    </div>
  );
}
