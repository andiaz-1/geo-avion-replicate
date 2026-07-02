import { createContext, useContext, useState, ReactNode } from "react";

// -----------------------------
// Types
// -----------------------------
export type Course = { id: string; name: string; picks: number; items: { id: string; name: string; supplement: number }[] };
export type Menu = { id: string; name: string; price: number; hasLunchPrice: boolean; lunchPrice: number; image: string; courses: Course[] };
export type BarPkg = { id: string; name: string; mode: "open" | "consumption"; price2hr: number; price3hr: number; priceExtraHour: number; drinks: string[]; active: boolean };
export type Space = { id: string; name: string; photo: string; seatedMin: number; seatedMax: number; cocktailMin: number; cocktailMax: number; privacy: "private" | "semi" | "public"; showLayouts: boolean; layouts: string[] };
export type Venue = Space;
export type Buyout = { id: string; label: string; kind: "full" | "partial"; spaceIds: string[]; price: number };
export type Holiday = { id: string; label: string; date: string; state: "available" | "blocked" | "special"; surcharge: number };
export type BlockedRange = { id: string; from: string; to: string; note: string; surcharge: number };
export type RecurringRule = { id: string; label: string; weekday: number; surcharge: number };
export type Addon = { id: string; name: string; price: number; unit: "fixed" | "per-person"; qty: number; active: boolean; taxable: boolean; serviceable: boolean; otherFeePct: number };
export type Faq = { id: string; q: string; a: string };
export type DynRule = { id: string; label: string; condition: string; effect: string };
export type GuestTier = { min: number; max: number; mode: "contact" | "exception" | "info"; contactPoints: string; minAdvanceDays: number };

export type FunnelData = {
  core: {
    name: string;
    slug: string;
    location: string;
    owner: string;
    template: string;
    status: "Active" | "Inactive";
  };
  branding: {
    hero: string;
    logo: string;
    accent: string;
    background: string;
    text: string;
    button: string;
    titleFont: string;
    bodyFont: string;
  };
  menus: Menu[];
  bar: { active: boolean; packages: BarPkg[] };
  venues: Venue[];
  buyouts: Buyout[];
  availability: {
    holidays: Holiday[];
    blocked: BlockedRange[];
    recurring: RecurringRule[];
  };
  timeslots: {
    start: string; end: string; interval: 15 | 30 | 60;
    lunchDinnerPricing: boolean; cutoff: string;
    happyHour: { enabled: boolean; start: string; end: string; note: string };
  };
  addons: Addon[];
  faq: { show: boolean; items: Faq[] };
  pricing: {
    kidsMode: "same" | "flat" | "notCounted";
    kidsFlat: number;
    serviceCharge: number;
    salesTax: number;
    buyoutUpcharge: number;
  };
  advanced: { rules: DynRule[]; buyoutEnabled: boolean };
  guests: GuestTier;
};

// -----------------------------
// Defaults (dummy data)
// -----------------------------
const uid = () => Math.random().toString(36).slice(2, 9);

export const defaultFunnelData: FunnelData = {
  core: {
    name: "Osteria — Private Events",
    slug: "osteria",
    location: "Osteria (Weston)",
    owner: "Julie Marchetti",
    template: "Contract & Event Order",
    status: "Active",
  },
  branding: {
    hero: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop&q=70",
    logo: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=200&auto=format&fit=crop&q=70",
    accent: "#7b3f2f",
    background: "#f6f1e7",
    text: "#2b241d",
    button: "#7b3f2f",
    titleFont: "Playfair Display",
    bodyFont: "Montserrat",
  },
  menus: [
    { id: uid(), name: "Classico", price: 60, hasLunchPrice: true, lunchPrice: 48, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=70",
      courses: [
        { id: uid(), name: "Antipasti", picks: 2, items: [{ id: uid(), name: "Bruschetta", supplement: 0 }, { id: uid(), name: "Caprese", supplement: 0 }] },
        { id: uid(), name: "Primi", picks: 1, items: [{ id: uid(), name: "Rigatoni Bolognese", supplement: 0 }, { id: uid(), name: "Cacio e Pepe", supplement: 0 }] },
        { id: uid(), name: "Dolci", picks: 1, items: [{ id: uid(), name: "Tiramisù", supplement: 0 }] },
      ] },
    { id: uid(), name: "Gustoso", price: 70, hasLunchPrice: false, lunchPrice: 0, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=70",
      courses: [
        { id: uid(), name: "Antipasti", picks: 2, items: [{ id: uid(), name: "Burrata", supplement: 0 }] },
        { id: uid(), name: "Secondi", picks: 1, items: [{ id: uid(), name: "Branzino", supplement: 0 }, { id: uid(), name: "NY Steak", supplement: 12 }] },
      ] },
    { id: uid(), name: "Magnifico", price: 88, hasLunchPrice: false, lunchPrice: 0, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=70",
      courses: [
        { id: uid(), name: "Chef's Tasting", picks: 5, items: [{ id: uid(), name: "Chef's selection", supplement: 0 }] },
      ] },
  ],
  bar: {
    active: true,
    packages: [
      { id: uid(), name: "Beer & Wine", mode: "open", price2hr: 28, price3hr: 38, priceExtraHour: 12, drinks: ["House reds", "House whites", "Draft beer"], active: true },
      { id: uid(), name: "Full Bar", mode: "open", price2hr: 42, price3hr: 55, priceExtraHour: 18, drinks: ["Premium spirits", "Cocktails", "Wine", "Beer"], active: true },
      { id: uid(), name: "On Consumption", mode: "consumption", price2hr: 0, price3hr: 0, priceExtraHour: 0, drinks: ["Charged as ordered"], active: true },
    ],
  },
  venues: [
    { id: uid(), name: "VIP Front", photo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=70", seatedMin: 8, seatedMax: 24, cocktailMin: 12, cocktailMax: 35, privacy: "private", showLayouts: true, layouts: ["Rounds", "Long table"] },
    { id: uid(), name: "VIP Back", photo: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&auto=format&fit=crop&q=70", seatedMin: 12, seatedMax: 42, cocktailMin: 18, cocktailMax: 60, privacy: "private", showLayouts: true, layouts: ["Rounds", "U-shape"] },
    { id: uid(), name: "Main Room", photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=70", seatedMin: 30, seatedMax: 75, cocktailMin: 40, cocktailMax: 110, privacy: "semi", showLayouts: false, layouts: ["Mixed seating"] },
  ],
  buyouts: [],
  availability: {
    holidays: [
      { id: uid(), label: "Mother's Day", date: "2026-05-10", state: "special", surcharge: 15 },
      { id: uid(), label: "Valentine's Day", date: "2026-02-14", state: "special", surcharge: 20 },
      { id: uid(), label: "Thanksgiving", date: "2026-11-26", state: "blocked", surcharge: 0 },
      { id: uid(), label: "Christmas Day", date: "2026-12-25", state: "blocked", surcharge: 0 },
      { id: uid(), label: "July 4th", date: "2026-07-04", state: "available", surcharge: 0 },
      { id: uid(), label: "Halloween", date: "2026-10-31", state: "available", surcharge: 0 },
      { id: uid(), label: "Super Bowl Sunday", date: "2027-02-07", state: "special", surcharge: 25 },
    ],
    blocked: [{ id: uid(), from: "2026-08-01", to: "2026-08-14", note: "Summer maintenance", surcharge: 0 }],
    recurring: [{ id: uid(), label: "Closed Mondays", weekday: 1, surcharge: 0 }],
  },
  timeslots: {
    start: "11:30", end: "22:00", interval: 30, lunchDinnerPricing: true, cutoff: "16:00",
    happyHour: { enabled: false, start: "16:00", end: "18:00", note: "$2 off draft & wine" },
  },
  addons: [
    { id: uid(), name: "White Tablecloths", price: 8, unit: "fixed", qty: 1, active: true, taxable: true, serviceable: false, otherFeePct: 0 },
    { id: uid(), name: "JBL Speaker", price: 150, unit: "fixed", qty: 1, active: true, taxable: true, serviceable: true, otherFeePct: 0 },
    { id: uid(), name: "Live Music (Duo)", price: 300, unit: "fixed", qty: 1, active: true, taxable: false, serviceable: true, otherFeePct: 0 },
    { id: uid(), name: "Floral Centerpieces", price: 25, unit: "fixed", qty: 4, active: false, taxable: true, serviceable: false, otherFeePct: 0 },
  ],
  faq: {
    show: true,
    items: [
      { id: uid(), q: "Can I bring my own cake?", a: "Yes — a $2/pp cutting fee applies." },
      { id: uid(), q: "Is there parking?", a: "Complimentary valet on Fridays and Saturdays." },
    ],
  },
  pricing: { kidsMode: "flat", kidsFlat: 25, serviceCharge: 23, salesTax: 7, buyoutUpcharge: 500 },
  advanced: {
    buyoutEnabled: false,
    rules: [
      { id: uid(), label: "Saturday premium", condition: "Day of week = Saturday", effect: "+15%" },
      { id: uid(), label: "High season", condition: "Month in [Dec, Feb]", effect: "Min spend $2,500" },
    ],
  },
  guests: { min: 8, max: 120, mode: "contact", contactPoints: "julie@osteria.com · (954) 555-0123", minAdvanceDays: 3 },
};

// -----------------------------
// Context
// -----------------------------
type Ctx = {
  data: FunnelData;
  update: <K extends keyof FunnelData>(section: K, value: Partial<FunnelData[K]> | ((prev: FunnelData[K]) => FunnelData[K])) => void;
  set: (data: FunnelData) => void;
};
const FunnelCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "funnelBuilder:data";
export function loadFunnelData(): FunnelData {
  if (typeof window === "undefined") return defaultFunnelData;
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch {}
  return defaultFunnelData;
}

export function FunnelStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FunnelData>(loadFunnelData);
  const persist = (d: FunnelData) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} return d; };
  const update: Ctx["update"] = (section, value) => {
    setData((prev) => {
      const current = prev[section];
      const next = typeof value === "function" ? (value as any)(current) : { ...(current as any), ...(value as any) };
      return persist({ ...prev, [section]: next });
    });
  };
  return <FunnelCtx.Provider value={{ data, update, set: (d) => setData(persist(d)) }}>{children}</FunnelCtx.Provider>;
}

export const useFunnel = () => {
  const ctx = useContext(FunnelCtx);
  if (!ctx) throw new Error("useFunnel outside provider");
  return ctx;
};

export const newId = uid;

