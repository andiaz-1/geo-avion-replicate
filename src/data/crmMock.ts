// Mock seed data for Smart Event 360 CRM (visual replica).
// All "now" references use MOCK_NOW so the demo is deterministic.

export const MOCK_NOW = new Date(2026, 5, 12, 10, 0, 0); // Fri Jun 12 2026 10:00

export type Venue = "Osteria" | "The Leinster" | "Kaona Room";
export type EventStatus = "Prospect" | "Tentative" | "Definite" | "Closed" | "Lost";
export type LeadSource = "Website form" | "Instagram" | "Phone" | "Walk-in" | "Referral" | "Other";

export const STATUS_PILL: Record<EventStatus, string> = {
  Prospect: "bg-[#9b7fc7] text-white",
  Tentative: "bg-[#e08c7a] text-white",
  Definite: "bg-[#5fa468] text-white",
  Closed: "bg-[#c9a44a] text-white",
  Lost: "bg-[#9aa0aa] text-white",
};

export const STATUS_HEX: Record<EventStatus, string> = {
  Prospect: "#9b7fc7",
  Tentative: "#e08c7a",
  Definite: "#5fa468",
  Closed: "#c9a44a",
  Lost: "#9aa0aa",
};

export interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  primary?: boolean;
}

export type StepKey = "quote" | "contract" | "cc" | "menu";
export type StepState = "done" | "todo" | "manual";

export interface CrmDocument { id: string; name: string; type: "Quote" | "Contract" | "Other" }
export interface CrmCard { id: string; last4: string }

export interface CrmEvent {
  id: string;
  status: EventStatus;
  name: string;
  guests: number;
  discussions: number;
  contact: CrmContact;
  extraContacts?: CrmContact[];
  date: string;          // YYYY-MM-DD
  startTime: string;
  endTime: string;
  venue: Venue;
  steps: Record<StepKey, StepState>;
  followUpDue?: string;  // YYYY-MM-DD
  nextAction?: string;
  documents: CrmDocument[];
  cards: CrmCard[];
  financial: { fbMinimum: number; deposit: number; venueFee: number; subtotal: number };
  details?: {
    type?: string;
    children?: boolean;
    owner?: string;
    leadSource?: string;
    createdAt?: string;
    updatedAt?: string;
    budgetDescription?: string;
    additional?: string;
  };
  isInquiry?: boolean; // generated from website inquiry — affects calendar title format
}

// Deterministic date math (no real "today")
const Y = (offset: number) => {
  const d = new Date(MOCK_NOW); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const seedEvents: CrmEvent[] = [
  {
    id: "WO14T", status: "Prospect", name: "Baptism Lunch", guests: 12, discussions: 1,
    contact: { id: "c1", name: "Jacklyn Cabrera", email: "jdelcabrera@gmail.com", phone: "954-234-5512", primary: true },
    date: "2026-09-19", startTime: "13:00", endTime: "16:00", venue: "Osteria",
    steps: { quote: "done", contract: "todo", cc: "todo", menu: "todo" },
    followUpDue: Y(-1), nextAction: "Follow up on quote",
    documents: [{ id: "d1", name: "Quote-WO14T.pdf", type: "Quote" }],
    cards: [],
    financial: { fbMinimum: 1500, deposit: 0, venueFee: 0, subtotal: 0 },
    details: {
      type: "Not set", children: false, owner: "Not set", leadSource: "Not set",
      createdAt: "Thu, Jun 11, 2026 12:12 PM", updatedAt: "Thu, Jun 11, 2026 12:12 PM",
      budgetDescription: "Unknown",
      additional: "Looking for pricing for lunch, as well as different pricing for wine/sangria or wine and beer packages, or drinks by the glass, thank you!",
    },
  },
  { id: "QHDPQ", status: "Prospect", name: "Birthday party", guests: 40, discussions: 1,
    contact: { id: "c2", name: "Corinne Navarro", email: "corinne.n@gmail.com", phone: "305-441-9087", primary: true },
    date: "2026-07-11", startTime: "18:00", endTime: "21:00", venue: "The Leinster",
    steps: { quote: "todo", contract: "todo", cc: "todo", menu: "todo" },
    documents: [], cards: [], financial: { fbMinimum: 2500, deposit: 0, venueFee: 0, subtotal: 0 },
    details: { owner: "Julie Diaz", leadSource: "Website form" } },
  { id: "0VESM", status: "Prospect", name: "Birthday party", guests: 50, discussions: 1,
    contact: { id: "c3", name: "Ronnie Bauer", email: "ronnieb@outlook.com", phone: "786-220-4413", primary: true },
    date: "2026-07-24", startTime: "18:00", endTime: "22:00", venue: "The Leinster",
    steps: { quote: "todo", contract: "todo", cc: "todo", menu: "todo" },
    documents: [], cards: [], financial: { fbMinimum: 2500, deposit: 0, venueFee: 0, subtotal: 0 } },
  { id: "U0AVY", status: "Prospect", name: "40th birthday party", guests: 40, discussions: 0,
    contact: { id: "c4", name: "Monica Espinoza", email: "monica.e@yahoo.com", phone: "954-668-1023", primary: true },
    date: "2027-01-30", startTime: "19:00", endTime: "22:00", venue: "The Leinster",
    steps: { quote: "done", contract: "todo", cc: "todo", menu: "todo" },
    followUpDue: Y(7), nextAction: "Send updated quote",
    documents: [{ id: "d2", name: "Quote-U0AVY.pdf", type: "Quote" }], cards: [],
    financial: { fbMinimum: 2500, deposit: 0, venueFee: 0, subtotal: 0 } },
  { id: "NH1PD", status: "Prospect", name: "55th birthday celebration", guests: 100, discussions: 0,
    contact: { id: "c5", name: "Karelys Hernandez", email: "karelysh@gmail.com", phone: "305-887-2240", primary: true },
    date: "2026-08-08", startTime: "19:00", endTime: "23:00", venue: "The Leinster",
    steps: { quote: "todo", contract: "todo", cc: "todo", menu: "todo" },
    documents: [], cards: [], financial: { fbMinimum: 2500, deposit: 0, venueFee: 0, subtotal: 0 } },
  { id: "ZFJ3A", status: "Definite", name: "Parker Tannehill", guests: 20, discussions: 5,
    contact: { id: "c6", name: "Parker Tannehill", email: "parker.t@gmail.com", phone: "954-901-3344", primary: true },
    date: "2026-06-05", startTime: "20:00", endTime: "23:30", venue: "The Leinster",
    steps: { quote: "done", contract: "done", cc: "done", menu: "done" },
    documents: [{ id: "d3", name: "Contract-ZFJ3A.pdf", type: "Contract" }],
    cards: [{ id: "card1", last4: "4242" }],
    financial: { fbMinimum: 2500, deposit: 500, venueFee: 0, subtotal: 2800 } },
  { id: "KJT7A", status: "Prospect", name: "birthday!", guests: 40, discussions: 0,
    contact: { id: "c7", name: "Jennifer Gomez", email: "jenng@gmail.com", phone: "786-334-2299", primary: true },
    date: "2026-08-14", startTime: "18:00", endTime: "21:00", venue: "The Leinster",
    steps: { quote: "todo", contract: "todo", cc: "todo", menu: "todo" },
    documents: [], cards: [], financial: { fbMinimum: 2500, deposit: 0, venueFee: 0, subtotal: 0 } },
  { id: "DOZ0A", status: "Prospect", name: "Birthday celebration", guests: 25, discussions: 1,
    contact: { id: "c8", name: "Lisa Diaz", email: "lisa.diaz@gmail.com", phone: "305-554-7720", primary: true },
    date: "2026-06-13", startTime: "18:00", endTime: "21:00", venue: "The Leinster",
    steps: { quote: "done", contract: "todo", cc: "todo", menu: "todo" },
    followUpDue: Y(0), nextAction: "Confirm menu selection",
    documents: [{ id: "d4", name: "Quote-DOZ0A.pdf", type: "Quote" }], cards: [],
    financial: { fbMinimum: 2500, deposit: 0, venueFee: 0, subtotal: 0 } },
  { id: "NZYHT", status: "Closed", name: "33rd Birthday Party", guests: 20, discussions: 1,
    contact: { id: "c9", name: "Candice Johnson", email: "candicej@gmail.com", phone: "954-220-8845", primary: true },
    date: "2026-05-30", startTime: "16:00", endTime: "18:00", venue: "The Leinster",
    steps: { quote: "done", contract: "done", cc: "done", menu: "done" },
    documents: [{ id: "d5", name: "Contract-NZYHT.pdf", type: "Contract" }],
    cards: [{ id: "card2", last4: "1881" }],
    financial: { fbMinimum: 2500, deposit: 300, venueFee: 0, subtotal: 1900 } },
  { id: "WQFQC", status: "Closed", name: "Large family dinner to celebrate elopement", guests: 55, discussions: 1,
    contact: { id: "c10", name: "Emily Sanchez", email: "emily.s@gmail.com", phone: "305-998-1142", primary: true },
    date: "2026-05-29", startTime: "19:00", endTime: "22:00", venue: "Osteria",
    steps: { quote: "done", contract: "done", cc: "done", menu: "done" },
    documents: [{ id: "d6", name: "Contract-WQFQC.pdf", type: "Contract" }],
    cards: [{ id: "card3", last4: "9921" }],
    financial: { fbMinimum: 1500, deposit: 500, venueFee: 0, subtotal: 3400 } },
  { id: "TXR2P", status: "Prospect", name: "Anniversary dinner", guests: 18, discussions: 0,
    contact: { id: "c11", name: "Daniel Perez", email: "danperez@gmail.com", phone: "786-441-2299", primary: true },
    date: "2026-10-03", startTime: "19:00", endTime: "22:00", venue: "Osteria",
    steps: { quote: "todo", contract: "todo", cc: "todo", menu: "todo" },
    documents: [], cards: [], financial: { fbMinimum: 1500, deposit: 0, venueFee: 0, subtotal: 0 } },
  // New seeded events per SE-05
  { id: "LST01", status: "Lost", name: "Corporate mixer", guests: 30, discussions: 0,
    contact: { id: "c12", name: "David Rivera", email: "david.r@gmail.com", phone: "954-110-3344", primary: true },
    date: "2026-05-15", startTime: "18:00", endTime: "21:00", venue: "Osteria",
    steps: { quote: "done", contract: "todo", cc: "todo", menu: "todo" },
    documents: [], cards: [], financial: { fbMinimum: 1500, deposit: 0, venueFee: 0, subtotal: 0 } },
  { id: "TNT02", status: "Tentative", name: "Rehearsal dinner", guests: 35, discussions: 0,
    contact: { id: "c13", name: "Amanda Park", email: "amanda.p@gmail.com", phone: "786-554-2299", primary: true },
    date: "2026-09-26", startTime: "19:00", endTime: "22:00", venue: "Kaona Room",
    steps: { quote: "done", contract: "todo", cc: "todo", menu: "todo" },
    documents: [{ id: "d7", name: "Quote-TNT02.pdf", type: "Quote" }], cards: [],
    financial: { fbMinimum: 2000, deposit: 0, venueFee: 0, subtotal: 0 } },
];

// ---------- Leads ----------
export interface Lead {
  id: string;
  contact: { name: string; email: string; phone: string };
  summary: string;
  guests?: number;
  venue?: Venue;
  submittedAt: string;     // ISO datetime
  responded: boolean;
  dismissedReason?: string;
}

const T = (minutesAgo: number) => new Date(MOCK_NOW.getTime() - minutesAgo * 60000).toISOString();

export const seedLeads: Lead[] = [
  { id: "L001", contact: { name: "Sofia Mendoza", email: "sofia.m@gmail.com", phone: "954-220-7711" },
    summary: "Bridal shower, ~30 guests, The Leinster, asking about patio availability Oct 2026",
    guests: 30, venue: "The Leinster", submittedAt: T(4), responded: false },
  { id: "L002", contact: { name: "Mark Tanaka", email: "mark.t@outlook.com", phone: "786-334-9920" },
    summary: "Corporate dinner, 18 guests, Osteria, needs AV for presentation",
    guests: 18, venue: "Osteria", submittedAt: T(120), responded: false },
  { id: "L003", contact: { name: "Dana Williams", email: "dana.w@gmail.com", phone: "305-887-4412" },
    summary: "Sweet 16, 45 guests, asking pricing",
    guests: 45, venue: "The Leinster", submittedAt: T(60 * 26), responded: false },
];

// ---------- Discussions ----------
export type DiscussionStatus = "needs_reply" | "replied";

export interface Discussion {
  id: string;
  messages: number;
  subject: string;
  contactName: string;
  eventId?: string;
  eventName?: string;
  status: DiscussionStatus;
  createdAt: string;
  lastMessageAt: string;
}

export const seedDiscussions: Discussion[] = [
  { id: "MXGU07BHA", messages: 1, subject: "Your reservation at Osteria Baptism Lunch Saturday, September 19, 2026", contactName: "Jacklyn Cabrera", eventId: "WO14T", eventName: "Baptism Lunch", status: "needs_reply", createdAt: "Jun 11, 2026 12:12 PM", lastMessageAt: "Jun 11, 2026 12:12 PM" },
  { id: "PRT44KZB1", messages: 1, subject: "Let's Make Your Event Official! at The Leinster ,Saturday, December 12, 2026", contactName: "Karelys Hernandez", eventId: "NH1PD", eventName: "55th birthday celebration", status: "needs_reply", createdAt: "Jun 9, 2026 09:32 AM", lastMessageAt: "Jun 9, 2026 09:32 AM" },
  { id: "QQ09LMNAA", messages: 2, subject: "Your birthday party at Kaona Room Sat dec, 2026 , 8:30pm", contactName: "Amanda Park", eventId: "TNT02", eventName: "Rehearsal dinner", status: "needs_reply", createdAt: "Jun 7, 2026 02:14 PM", lastMessageAt: "Jun 10, 2026 11:05 AM" },
  { id: "HVB23WERT", messages: 1, subject: "Hi Corinne, Celebrate at The leinster Saturday, July 11, 2026", contactName: "Corinne Navarro", eventId: "QHDPQ", eventName: "Birthday party", status: "needs_reply", createdAt: "Jun 5, 2026 04:45 PM", lastMessageAt: "Jun 5, 2026 04:45 PM" },
  { id: "KKL98ZZQP", messages: 1, subject: "Your Event at Kaona Room Ronnie, Hidden Gem Found !", contactName: "Ronnie Bauer", eventId: "0VESM", eventName: "Birthday party", status: "needs_reply", createdAt: "Jun 2, 2026 10:21 AM", lastMessageAt: "Jun 2, 2026 10:21 AM" },
  { id: "WSX21BNMA", messages: 1, subject: "Your reservation at Osteria for Sunday brunch", contactName: "Daniel Perez", eventId: "TXR2P", eventName: "Anniversary dinner", status: "replied", createdAt: "May 30, 2026 08:00 AM", lastMessageAt: "May 30, 2026 08:00 AM" },
  { id: "FGH88PLOK", messages: 1, subject: "Re: 40th Birthday at The Leinster", contactName: "Monica Espinoza", eventId: "U0AVY", eventName: "40th birthday party", status: "needs_reply", createdAt: "May 27, 2026 03:11 PM", lastMessageAt: "May 27, 2026 03:11 PM" },
  { id: "YTR55MNBV", messages: 1, subject: "Engagement dinner at Osteria", contactName: "Emily Sanchez", eventId: "WQFQC", eventName: "Large family dinner", status: "replied", createdAt: "May 25, 2026 09:30 AM", lastMessageAt: "May 25, 2026 09:30 AM" },
  { id: "UIO22QWER", messages: 1, subject: "Your private room at Kaona Room — quick question", contactName: "Amanda Park", eventId: "TNT02", eventName: "Rehearsal dinner", status: "needs_reply", createdAt: "May 22, 2026 06:42 PM", lastMessageAt: "May 22, 2026 06:42 PM" },
  { id: "ZXC11ASDF", messages: 1, subject: "Holiday party inquiry at The Leinster", contactName: "Jennifer Gomez", eventId: "KJT7A", eventName: "birthday!", status: "needs_reply", createdAt: "May 20, 2026 12:00 PM", lastMessageAt: "May 20, 2026 12:00 PM" },
];

// ---------- Charts ----------
export const leadsConversionData = [
  { month: "2025-10", converted: 1, notConverted: 1, rate: 100 },
  { month: "2025-11", converted: 3, notConverted: 2, rate: 100 },
  { month: "2025-12", converted: 2, notConverted: 1, rate: 100 },
  { month: "2026-01", converted: 1, notConverted: 0, rate: 100 },
  { month: "2026-02", converted: 0, notConverted: 0, rate: 0 },
  { month: "2026-03", converted: 2, notConverted: 1, rate: 100 },
  { month: "2026-04", converted: 7, notConverted: 4, rate: 100 },
  { month: "2026-05", converted: 6, notConverted: 3, rate: 100 },
  { month: "2026-06", converted: 5, notConverted: 2, rate: 100 },
];

// ---------- Calendar tiles ----------
export interface CalendarTile {
  date: string; time: string; title: string;
  venueDetail: string; guests: number; contact: string;
  color: "green" | "gray" | "teal";
}

// Long-message inquiry titles get renamed per SE-01.
const formatInquiryTitle = (firstName: string, guests: number) =>
  `Inquiry — ${firstName} (${guests})`;

export const calendarEvents: CalendarTile[] = [
  { date: "2026-06-05", time: "8 pm", title: "Parker Tannehill", venueDetail: "Seated indoors", guests: 20, contact: "Parker T.", color: "green" },
  { date: "2026-06-06", time: "8 pm", title: "birthday party", venueDetail: "Seated indoors", guests: 39, contact: "Maria L.", color: "gray" },
  { date: "2026-06-13", time: "6 pm", title: "Birthday celebration", venueDetail: "Seated indoors", guests: 25, contact: "Lisa D.", color: "teal" },
  { date: "2026-06-18", time: "6 pm", title: formatInquiryTitle("Christina", 19), venueDetail: "Seated indoors", guests: 19, contact: "Christina G.", color: "gray" },
  { date: "2026-06-27", time: "7 pm", title: formatInquiryTitle("Midori", 100), venueDetail: "Seated indoors", guests: 100, contact: "Midori K.", color: "gray" },
  { date: "2026-07-03", time: "6 pm", title: "Post wedding celebration", venueDetail: "Kaona Room", guests: 30, contact: "Sara V.", color: "green" },
];

// ---------- Venue defaults ----------
export interface VenueDefaults {
  fbMinimum: number; servicePct: number; taxPct: number; venueFee: number;
}
export const seedVenueDefaults: Record<Venue, VenueDefaults> = {
  "Osteria":      { fbMinimum: 1500, servicePct: 23, taxPct: 8, venueFee: 0 },
  "The Leinster": { fbMinimum: 2500, servicePct: 23, taxPct: 8, venueFee: 0 },
  "Kaona Room":   { fbMinimum: 2000, servicePct: 23, taxPct: 8, venueFee: 0 },
};

export const venues: Venue[] = ["Osteria", "The Leinster", "Kaona Room"];

// ---------- Helpers ----------
export function addBusinessDays(from: Date, n: number) {
  const d = new Date(from);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

export function firstName(full: string) {
  return full.split(" ")[0];
}

export function inquiryTitle(contactName: string, guests: number) {
  return `Inquiry — ${firstName(contactName)} (${guests})`;
}

export function minutesSince(iso: string, now = MOCK_NOW) {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
}
