import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, FileText, ChevronDown,
  Lock, Unlock, Copy, ExternalLink, Check, X, MessageSquare, Eye, StickyNote,
  Plus,
} from "lucide-react";
import { events } from "@/data/crmMock";
import { Avatar } from "@/components/crm/CrmPrimitives";
import { format, parseISO } from "date-fns";
import { useState } from "react";

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

function StepperPill({ label, state }: { label: string; state: "done" | "active" | "todo" }) {
  const cls =
    state === "done" ? "border-green-500 text-green-700 bg-green-50"
    : state === "active" ? "border-[#9b7fc7] text-[#5b3e8f] bg-[#f1ecf9]"
    : "border-gray-300 text-gray-500 bg-white";
  return <span className={`text-xs px-3 py-1.5 rounded-full border ${cls}`}>{label}</span>;
}

export default function EventDetailCrm() {
  const { id } = useParams();
  const event = events.find((e) => e.id === id) || events[0];
  const [tab, setTab] = useState<"client" | "staff" | "notes">("client");

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
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#2a241c] text-white text-[10px] font-bold tracking-widest px-2 py-0.5 rounded">MAIN</span>
              <h1 className="text-4xl text-[#2a241c]" style={MARKER}>{event.name.toUpperCase()}</h1>
            </div>
            <p className="text-sm text-[#5a4f42]">{event.contact.name}</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 text-sm border border-[#2a241c]/20 px-3 py-2 rounded-md bg-white"><Pencil className="h-3.5 w-3.5" /> Edit</button>
            <button className="text-sm border border-[#2a241c]/20 px-3 py-2 rounded-md bg-white">Mark as Lost</button>
            <button className="inline-flex items-center gap-1.5 text-sm border border-red-300 text-red-600 px-3 py-2 rounded-md bg-white"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <StepperPill label="✓ Quote sent" state="active" />
          <span className="text-gray-300">— — —</span>
          <StepperPill label="Contract: not sent" state="todo" />
          <span className="text-gray-300">— — —</span>
          <StepperPill label="CC: not submitted" state="todo" />
          <span className="text-gray-300">— — —</span>
          <StepperPill label="Menu: not selected" state="todo" />
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
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Add new contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs">First Name*</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                  <div><label className="text-xs">Last Name</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                  <div><label className="text-xs">Email</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                  <div><label className="text-xs">Phone</label><input className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" /></div>
                </div>
                <button disabled className="w-full mt-3 py-2 rounded-md bg-[#aab89d] text-white text-sm cursor-not-allowed opacity-70">Save Contact</button>
              </div>
            </Section>

            <Section title="EVENT DETAILS" action={
              <button className="inline-flex items-center gap-1 text-xs text-[#5a4f42] hover:text-[#2a241c]"><Pencil className="h-3 w-3" /> Edit</button>
            }>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["DATE", format(parseISO(event.date), "MMMM d, yyyy")],
                  ["TIME", event.startTime],
                  ["LOCATION", event.venue],
                  ["EXPECTED GUESTS", String(event.guests)],
                  ["TYPE", event.details?.type ?? "Not set"],
                  ["CHILDREN ATTENDING", event.details?.children ? "Yes" : "No"],
                  ["OWNER", event.details?.owner ?? "Not set"],
                  ["LEAD SOURCE", event.details?.leadSource ?? "Not set"],
                  ["CREATED", event.details?.createdAt ?? "—"],
                  ["UPDATED", event.details?.updatedAt ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="text-[#2a241c]">{v}</div>
                  </div>
                ))}
              </div>
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

            <Section title="DOCUMENTS (0)" action={
              <button className="inline-flex items-center gap-1 text-xs border border-[#e6dfd2] bg-white px-2 py-1 rounded">+ Add document <ChevronDown className="h-3 w-3" /></button>
            }>
              <div className="text-center py-8 text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No documents are associated with this event.
              </div>
            </Section>

            <Section title="CLIENT DISCUSSION">
              <div className="flex gap-1 mb-4 bg-[#faf6ee] p-1 rounded-md w-fit">
                {[
                  { k: "client", label: "Client Discussion", icon: MessageSquare },
                  { k: "staff", label: "Staff Discussion", icon: Eye },
                  { k: "notes", label: "Notes", icon: StickyNote },
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
                  <div className="border border-[#e6dfd2] rounded-md p-3 text-sm">
                    <div className="font-medium">Your reservation at Osteria Baptism Lunch Saturday, September 19, 2026</div>
                    <div className="text-xs text-muted-foreground mt-1">👤 {event.contact.name} · 🕐 Jun 11, 2026 · 1 message</div>
                  </div>
                </>
              )}
              {tab === "staff" && <p className="text-sm text-muted-foreground py-4">No staff messages yet.</p>}
              {tab === "notes" && <p className="text-sm text-muted-foreground py-4">No notes yet.</p>}
            </Section>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <Section title="FINANCIAL SUMMARY">
              <div className="space-y-2 text-sm pb-4 border-b border-[#e6dfd2]">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>$0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service (23%)</span><span>$0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>$0</span></div>
                <div className="flex justify-between font-semibold pt-1"><span>Total</span><span>$0</span></div>
              </div>
              <div className="mt-4 space-y-3">
                {["F&B Minimum", "Deposit Amount", "Venue Fee"].map((l) => (
                  <div key={l}>
                    <label className="text-xs text-muted-foreground">{l}</label>
                    <input defaultValue="$0.00" className="w-full mt-1 px-2 py-1.5 text-sm border border-[#e6dfd2] rounded bg-white" />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="EVENT CARDS">
              <p className="text-sm text-muted-foreground mb-3">No saved cards — Add a card to enable easy payments and deposits for this event.</p>
              <button className="inline-flex items-center gap-1 border border-[#e6dfd2] bg-white text-sm px-3 py-1.5 rounded-md">
                <Plus className="h-3 w-3" /> Add Card
              </button>
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
    </div>
  );
}
