import { useState } from "react";
import { CrmCard, CrmPageTitle, CrmButton, Avatar } from "@/components/crm/CrmPrimitives";
import { useCrm } from "@/data/crmStore";
import { Lead, MOCK_NOW, minutesSince } from "@/data/crmMock";
import { Search, MessageCircle, ArrowRight, X, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

function TimerChip({ submittedAt, responded }: { submittedAt: string; responded: boolean }) {
  const m = minutesSince(submittedAt);
  if (responded) return <span className="text-[10px] uppercase font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">✓ Replied</span>;
  let cls = "bg-green-100 text-green-700";
  let label = `${m}m`;
  if (m >= 1440) { cls = "bg-red-100 text-red-700"; label = `${Math.floor(m / 1440)}d+ — overdue`; }
  else if (m >= 5) { cls = "bg-amber-100 text-amber-700"; label = m >= 60 ? `${Math.floor(m / 60)}h` : `${m}m`; }
  return <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${cls}`}><Clock className="h-3 w-3" /> {label}</span>;
}

export default function Leads() {
  const { leads, replyLead, dismissLead, convertLead } = useCrm();
  const navigate = useNavigate();
  const [replyOpen, setReplyOpen] = useState<Lead | null>(null);
  const [dismissOpen, setDismissOpen] = useState<Lead | null>(null);
  const [replyText, setReplyText] = useState("");
  const [dismissReason, setDismissReason] = useState("");

  const handleReply = () => {
    if (replyOpen) replyLead(replyOpen.id);
    setReplyText(""); setReplyOpen(null);
  };
  const handleDismiss = () => {
    if (dismissOpen && dismissReason.trim()) dismissLead(dismissOpen.id, dismissReason);
    setDismissReason(""); setDismissOpen(null);
  };
  const handleConvert = (lead: Lead) => {
    const ev = convertLead(lead.id);
    if (ev) navigate(`/crm/events/${ev.id}`);
  };

  return (
    <div className="space-y-5">
      <CrmPageTitle>Leads</CrmPageTitle>
      <CrmCard>
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input placeholder="Search lead..." className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white" />
            <CrmButton variant="primary"><Search className="h-4 w-4" /> Search</CrmButton>
          </div>
          <CrmButton variant="primary">Create Lead</CrmButton>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-14 w-14 rounded-full bg-green-100 items-center justify-center mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-medium">Inbox zero — every inquiry has been answered ✓</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-muted/30 crm-dark:bg-white/5">Personal Information</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-muted/30 crm-dark:bg-white/5">Event Details</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-muted/30 crm-dark:bg-white/5">Description</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-muted/30 crm-dark:bg-white/5">First Response</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-muted/30 crm-dark:bg-white/5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border crm-dark:border-white/10 align-top">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Avatar name={l.contact.name} />
                        <div>
                          <div className="font-medium">{l.contact.name}</div>
                          <div className="text-xs text-muted-foreground">{l.contact.email}</div>
                          <div className="text-xs text-muted-foreground">{l.contact.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{l.guests ?? "?"} guests</div>
                      <div className="text-xs text-muted-foreground">{l.venue ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-sm">{l.summary}</td>
                    <td className="px-4 py-3 text-sm"><TimerChip submittedAt={l.submittedAt} responded={l.responded} /></td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <CrmButton variant="primary" onClick={() => setReplyOpen(l)}><MessageCircle className="h-3 w-3" /> Reply</CrmButton>
                        <CrmButton variant="outline" onClick={() => handleConvert(l)}><ArrowRight className="h-3 w-3" /> Convert</CrmButton>
                        <CrmButton variant="ghost" onClick={() => setDismissOpen(l)}><X className="h-3 w-3" /> Dismiss</CrmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CrmCard>

      <Dialog open={!!replyOpen} onOpenChange={(o) => !o && setReplyOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reply to {replyOpen?.contact.name}</DialogTitle></DialogHeader>
          <textarea
            value={replyText} onChange={(e) => setReplyText(e.target.value)}
            rows={6} placeholder="Type your reply..."
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white"
          />
          <DialogFooter>
            <CrmButton variant="outline" onClick={() => setReplyOpen(null)}>Cancel</CrmButton>
            <CrmButton variant="primary" onClick={handleReply}>Send & mark replied</CrmButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!dismissOpen} onOpenChange={(o) => !o && setDismissOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dismiss lead</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Reason is required and stored for reporting.</p>
          <input
            value={dismissReason} onChange={(e) => setDismissReason(e.target.value)}
            placeholder="e.g. Spam / Not a fit / Duplicate"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white"
          />
          <DialogFooter>
            <CrmButton variant="outline" onClick={() => setDismissOpen(null)}>Cancel</CrmButton>
            <CrmButton variant="danger" onClick={handleDismiss}>Dismiss</CrmButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
