// Mock seed data for Smart Event 360 CRM (visual replica).

export type EventBadge = "P" | "D";
export type Venue = "Osteria" | "The Leinster" | "Kaona Room";

export interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  primary?: boolean;
}

export interface CrmEvent {
  id: string;          // code like "WO14T"
  badge: EventBadge;
  name: string;
  guests: number;
  discussions: number;
  contact: CrmContact;
  date: string;        // ISO date
  startTime: string;   // "13:00"
  endTime: string;     // "16:00"
  venue: Venue;
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
}

export const events: CrmEvent[] = [
  {
    id: "WO14T", badge: "P", name: "Baptism Lunch", guests: 12, discussions: 1,
    contact: { id: "c1", name: "Jacklyn Cabrera", email: "jdelcabrera@gmail.com", phone: "954-234-5512", primary: true },
    date: "2026-09-19", startTime: "13:00", endTime: "16:00", venue: "Osteria",
    details: {
      type: "Not set", children: false, owner: "Not set", leadSource: "Not set",
      createdAt: "Thu, Jun 11, 2026 12:12 PM", updatedAt: "Thu, Jun 11, 2026 12:12 PM",
      budgetDescription: "Unknown",
      additional: "Looking for pricing for lunch, as well as different pricing for wine/sangria or wine and beer packages, or drinks by the glass, thank you!",
    },
  },
  { id: "QHDPQ", badge: "P", name: "Birthday party", guests: 40, discussions: 1,
    contact: { id: "c2", name: "Corinne Navarro", email: "corinne.n@gmail.com", phone: "305-441-9087", primary: true },
    date: "2026-07-11", startTime: "18:00", endTime: "21:00", venue: "The Leinster" },
  { id: "0VESM", badge: "P", name: "Birthday party", guests: 50, discussions: 1,
    contact: { id: "c3", name: "Ronnie Bauer", email: "ronnieb@outlook.com", phone: "786-220-4413", primary: true },
    date: "2026-07-24", startTime: "18:00", endTime: "22:00", venue: "The Leinster" },
  { id: "U0AVY", badge: "P", name: "40th birthday party", guests: 40, discussions: 0,
    contact: { id: "c4", name: "Monica Espinoza", email: "monica.e@yahoo.com", phone: "954-668-1023", primary: true },
    date: "2027-01-30", startTime: "19:00", endTime: "22:00", venue: "The Leinster" },
  { id: "NH1PD", badge: "P", name: "55th birthday celebration", guests: 100, discussions: 0,
    contact: { id: "c5", name: "Karelys Hernandez", email: "karelysh@gmail.com", phone: "305-887-2240", primary: true },
    date: "2026-08-08", startTime: "19:00", endTime: "23:00", venue: "The Leinster" },
  { id: "ZFJ3A", badge: "D", name: "Parker Tannehill", guests: 20, discussions: 5,
    contact: { id: "c6", name: "Parker Tannehill", email: "parker.t@gmail.com", phone: "954-901-3344", primary: true },
    date: "2026-06-05", startTime: "20:00", endTime: "23:30", venue: "The Leinster" },
  { id: "KJT7A", badge: "P", name: "birthday!", guests: 40, discussions: 0,
    contact: { id: "c7", name: "Jennifer Gomez", email: "jenng@gmail.com", phone: "786-334-2299", primary: true },
    date: "2026-08-14", startTime: "18:00", endTime: "21:00", venue: "The Leinster" },
  { id: "DOZ0A", badge: "P", name: "Birthday celebration", guests: 25, discussions: 1,
    contact: { id: "c8", name: "Lisa Diaz", email: "lisa.diaz@gmail.com", phone: "305-554-7720", primary: true },
    date: "2026-06-13", startTime: "18:00", endTime: "21:00", venue: "The Leinster" },
  { id: "NZYHT", badge: "P", name: "33rd Birthday Party", guests: 20, discussions: 1,
    contact: { id: "c9", name: "Candice Johnson", email: "candicej@gmail.com", phone: "954-220-8845", primary: true },
    date: "2026-05-30", startTime: "16:00", endTime: "18:00", venue: "The Leinster" },
  { id: "WQFQC", badge: "D", name: "Large family dinner to celebrate elopement", guests: 55, discussions: 1,
    contact: { id: "c10", name: "Emily Sanchez", email: "emily.s@gmail.com", phone: "305-998-1142", primary: true },
    date: "2026-05-29", startTime: "19:00", endTime: "22:00", venue: "Osteria" },
  { id: "TXR2P", badge: "P", name: "Anniversary dinner", guests: 18, discussions: 0,
    contact: { id: "c11", name: "Daniel Perez", email: "danperez@gmail.com", phone: "786-441-2299", primary: true },
    date: "2026-10-03", startTime: "19:00", endTime: "22:00", venue: "Osteria" },
];

export interface Discussion {
  id: string;          // "MXGU07BHA"
  messages: number;
  subject: string;
  createdAt: string;
  lastMessageAt: string;
}

export const discussions: Discussion[] = [
  { id: "MXGU07BHA", messages: 1, subject: "Your reservation at Osteria Baptism Lunch Saturday, September 19, 2026", createdAt: "Jun 11, 2026 12:12 PM", lastMessageAt: "Jun 11, 2026 12:12 PM" },
  { id: "PRT44KZB1", messages: 1, subject: "Let's Make Your Event Official! at The Leinster ,Saturday, December 12, 2026", createdAt: "Jun 9, 2026 09:32 AM", lastMessageAt: "Jun 9, 2026 09:32 AM" },
  { id: "QQ09LMNAA", messages: 2, subject: "Your birthday party at Kaona Room Sat dec, 2026 , 8:30pm", createdAt: "Jun 7, 2026 02:14 PM", lastMessageAt: "Jun 10, 2026 11:05 AM" },
  { id: "HVB23WERT", messages: 1, subject: "Hi Corinne, Celebrate at The leinster Saturday, July 11, 2026", createdAt: "Jun 5, 2026 04:45 PM", lastMessageAt: "Jun 5, 2026 04:45 PM" },
  { id: "KKL98ZZQP", messages: 1, subject: "Your Event at Kaona Room Ronnie, Hidden Gem Found !", createdAt: "Jun 2, 2026 10:21 AM", lastMessageAt: "Jun 2, 2026 10:21 AM" },
  { id: "WSX21BNMA", messages: 1, subject: "Your reservation at Osteria for Sunday brunch", createdAt: "May 30, 2026 08:00 AM", lastMessageAt: "May 30, 2026 08:00 AM" },
  { id: "FGH88PLOK", messages: 1, subject: "Re: 40th Birthday at The Leinster", createdAt: "May 27, 2026 03:11 PM", lastMessageAt: "May 27, 2026 03:11 PM" },
  { id: "YTR55MNBV", messages: 1, subject: "Engagement dinner at Osteria", createdAt: "May 25, 2026 09:30 AM", lastMessageAt: "May 25, 2026 09:30 AM" },
  { id: "UIO22QWER", messages: 1, subject: "Your private room at Kaona Room — quick question", createdAt: "May 22, 2026 06:42 PM", lastMessageAt: "May 22, 2026 06:42 PM" },
  { id: "ZXC11ASDF", messages: 1, subject: "Holiday party inquiry at The Leinster", createdAt: "May 20, 2026 12:00 PM", lastMessageAt: "May 20, 2026 12:00 PM" },
];

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

export const eventStatusDistribution = [
  { status: "Prospect", value: 0 },
  { status: "Tentative", value: 0 },
  { status: "Definite", value: 0 },
  { status: "Closed", value: 0 },
  { status: "Lost", value: 0 },
];

export interface CalendarEvent {
  date: string;
  time: string;
  title: string;
  venueGroup: string;
  venueDetail: string;
  guests: number;
  contact: string;
  color: "green" | "gray" | "teal";
}

export const calendarEvents: CalendarEvent[] = [
  { date: "2026-06-05", time: "8 pm", title: "Parker Tannehill", venueGroup: "The Leinster – Seated indoors", venueDetail: "Seated indoors", guests: 20, contact: "Parker T.", color: "green" },
  { date: "2026-06-06", time: "8 pm", title: "birthday party", venueGroup: "The Leinster – Seated indoors", venueDetail: "Seated indoors", guests: 39, contact: "Maria L.", color: "gray" },
  { date: "2026-06-13", time: "6 pm", title: "Birthday celebration", venueGroup: "The Leinster – Seated indoors", venueDetail: "Seated indoors", guests: 25, contact: "Lisa D.", color: "teal" },
  { date: "2026-06-18", time: "6 pm", title: "Good morning, My team is wondering if you'll be showing the World Cup on either June…", venueGroup: "The Leinster – Seated indoors", venueDetail: "Seated indoors", guests: 19, contact: "Christina G.", color: "gray" },
  { date: "2026-06-27", time: "7 pm", title: "Watch Party. My name is Midori and I work with Voters of Tomorrow…", venueGroup: "The Leinster – Seated indoors", venueDetail: "Seated indoors", guests: 100, contact: "Midori K.", color: "gray" },
  { date: "2026-07-03", time: "6 pm", title: "Post wedding celebration", venueGroup: "The Leinster – KAONA ROOM", venueDetail: "Kaona Room", guests: 30, contact: "Sara V.", color: "green" },
];

export const venues: Venue[] = ["Osteria", "The Leinster", "Kaona Room"];
