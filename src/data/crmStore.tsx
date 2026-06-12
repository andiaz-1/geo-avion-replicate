import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from "react";
import {
  CrmEvent, Lead, Discussion, EventStatus, Venue, VenueDefaults, StepKey,
  seedEvents, seedLeads, seedDiscussions, seedVenueDefaults,
  MOCK_NOW, addBusinessDays, minutesSince,
} from "./crmMock";

interface Notification {
  id: string;
  kind: "lead" | "discussion" | "followup";
  title: string;
  detail: string;
  href: string;
}

interface CrmStore {
  events: CrmEvent[];
  leads: Lead[];
  discussions: Discussion[];
  venueDefaults: Record<Venue, VenueDefaults>;
  notes: { eventId: string; text: string; createdAt: string }[];

  // event mutations
  setEventStatus: (id: string, status: EventStatus) => void;
  updateEvent: (id: string, patch: Partial<CrmEvent>) => void;
  deleteEvent: (id: string) => void;
  setStep: (id: string, step: StepKey, state: "done" | "todo" | "manual") => void;
  addEvent: (e: CrmEvent) => void;
  addNote: (eventId: string, text: string) => void;

  // lead mutations
  replyLead: (id: string) => void;
  dismissLead: (id: string, reason: string) => void;
  convertLead: (id: string) => CrmEvent | null;

  // discussion mutations
  replyDiscussion: (id: string) => void;

  // venue defaults
  setVenueDefaults: (v: Venue, d: VenueDefaults) => void;

  // derived
  unrespondedLeads: number;
  needsReplyDiscussions: number;
  overdueFollowUps: number;
  notifications: Notification[];
}

const Ctx = createContext<CrmStore | null>(null);

export function CrmStoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CrmEvent[]>(seedEvents);
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [discussions, setDiscussions] = useState<Discussion[]>(seedDiscussions);
  const [venueDefaults, setVD] = useState<Record<Venue, VenueDefaults>>(seedVenueDefaults);
  const [notes, setNotes] = useState<{ eventId: string; text: string; createdAt: string }[]>([]);

  const setEventStatus = (id: string, status: EventStatus) =>
    setEvents((all) => all.map((e) => (e.id === id ? { ...e, status } : e)));

  const updateEvent = (id: string, patch: Partial<CrmEvent>) =>
    setEvents((all) => all.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const deleteEvent = (id: string) => setEvents((all) => all.filter((e) => e.id !== id));

  const addEvent = (e: CrmEvent) => setEvents((all) => [e, ...all]);

  const setStep = (id: string, step: StepKey, state: "done" | "todo" | "manual") =>
    setEvents((all) => all.map((e) => {
      if (e.id !== id) return e;
      const next: CrmEvent = { ...e, steps: { ...e.steps, [step]: state } };
      // Auto-fill follow-up when quote becomes done
      if (step === "quote" && state === "done" && !e.followUpDue) {
        next.followUpDue = addBusinessDays(MOCK_NOW, 3).toISOString().slice(0, 10);
        next.nextAction = e.nextAction || "Follow up on quote";
      }
      return next;
    }));

  const addNote = (eventId: string, text: string) =>
    setNotes((n) => [{ eventId, text, createdAt: new Date(MOCK_NOW).toISOString() }, ...n]);

  const replyLead = (id: string) =>
    setLeads((all) => all.map((l) => (l.id === id ? { ...l, responded: true } : l)));

  const dismissLead = (id: string, reason: string) =>
    setLeads((all) => all.map((l) => (l.id === id ? { ...l, dismissedReason: reason, responded: true } : l)).filter((l) => !l.dismissedReason));

  const convertLead = (id: string): CrmEvent | null => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return null;
    const newId = "EV" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const venue = lead.venue || "Osteria";
    const vd = venueDefaults[venue];
    const newEvent: CrmEvent = {
      id: newId, status: "Prospect", name: lead.summary.split(",")[0] || "New event",
      guests: lead.guests || 0, discussions: 0,
      contact: { id: "c-" + newId, name: lead.contact.name, email: lead.contact.email, phone: lead.contact.phone, primary: true },
      date: addBusinessDays(MOCK_NOW, 30).toISOString().slice(0, 10),
      startTime: "19:00", endTime: "22:00", venue,
      steps: { quote: "todo", contract: "todo", cc: "todo", menu: "todo" },
      documents: [], cards: [],
      financial: { fbMinimum: vd.fbMinimum, deposit: 0, venueFee: vd.venueFee, subtotal: 0 },
      details: { owner: "Julie Diaz", leadSource: "Website form", additional: lead.summary,
        createdAt: "Today", updatedAt: "Today" },
    };
    setEvents((all) => [newEvent, ...all]);
    setLeads((all) => all.filter((l) => l.id !== id));
    return newEvent;
  };

  const replyDiscussion = (id: string) =>
    setDiscussions((all) => all.map((d) => (d.id === id ? { ...d, status: "replied" as const } : d)));

  const setVenueDefaults = (v: Venue, d: VenueDefaults) =>
    setVD((all) => ({ ...all, [v]: d }));

  // Derived counts + notifications
  const unrespondedLeads = leads.filter((l) => !l.responded).length;
  const needsReplyDiscussions = discussions.filter((d) => d.status === "needs_reply").length;
  const overdueFollowUps = events.filter((e) =>
    e.followUpDue && e.followUpDue < MOCK_NOW.toISOString().slice(0, 10)
  ).length;

  const notifications: Notification[] = useMemo(() => {
    const items: Notification[] = [];
    leads.filter((l) => !l.responded).forEach((l) => {
      const m = minutesSince(l.submittedAt);
      const ago = m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
      items.push({ id: `lead-${l.id}`, kind: "lead", title: `New lead: ${l.contact.name}`, detail: ago, href: "/crm/leads" });
    });
    events.filter((e) => e.followUpDue && e.followUpDue < MOCK_NOW.toISOString().slice(0, 10)).forEach((e) => {
      items.push({ id: `fu-${e.id}`, kind: "followup", title: `Overdue follow-up: ${e.name}`, detail: e.contact.name, href: `/crm/events/${e.id}` });
    });
    discussions.filter((d) => d.status === "needs_reply").slice(0, 6).forEach((d) => {
      items.push({ id: `dz-${d.id}`, kind: "discussion", title: `Needs reply: ${d.contactName}`, detail: d.subject.slice(0, 60), href: "/crm/discussions" });
    });
    return items;
  }, [leads, events, discussions]);

  const value: CrmStore = {
    events, leads, discussions, venueDefaults, notes,
    setEventStatus, updateEvent, deleteEvent, setStep, addEvent, addNote,
    replyLead, dismissLead, convertLead, replyDiscussion, setVenueDefaults,
    unrespondedLeads, needsReplyDiscussions, overdueFollowUps, notifications,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCrm = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCrm must be used inside CrmStoreProvider");
  return v;
};

// Used by Events page for persisted filters
export function usePersistedState<T>(key: string, initial: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}
