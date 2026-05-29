// CRM-specific reference data and helpers.
// The booking funnel's pricing lives in booking-data.ts; this file is for the
// admin-side CRM (Base44 port) and intentionally separate so we can iterate
// without touching the public booking flow.

export const LOCATIONS = [
  { value: "Weston", label: "Weston" },
  { value: "Midtown Miami", label: "Midtown Miami" },
  { value: "Coral Gables", label: "Coral Gables" },
  { value: "Atlantic Beach", label: "Atlantic Beach" },
] as const;

export const EVENT_TYPES = [
  "Corporate Dinner",
  "Pharmaceutical Event",
  "Birthday Celebration",
  "Holiday Party",
  "Baby/Bridal Shower",
  "Graduation",
  "Other",
] as const;

export const MENU_TIERS: Record<string, { label: string; price: number }> = {
  classico: { label: "Classico", price: 60 },
  gustoso: { label: "Gustoso", price: 70 },
  magnifico: { label: "Magnifico", price: 88 },
};

export const BEVERAGE_PACKAGES = [
  { value: "beer_wine_2hr", label: "Beer & Wine — 2 hr", price: 45 },
  { value: "beer_wine_3hr", label: "Beer & Wine — 3 hr", price: 55 },
  { value: "full_bar_2hr", label: "Full Bar — 2 hr", price: 55 },
  { value: "full_bar_3hr", label: "Full Bar — 3 hr", price: 65 },
  { value: "consumption", label: "On Consumption", price: 0 },
] as const;

export const ADDONS = [
  { value: "tablecloths", label: "White Tablecloths", price: 0 },
  { value: "av_speaker", label: "JBL Speaker + 2 Mics", price: 150 },
  { value: "live_music", label: "Live Music", price: 300 },
  { value: "own_musician", label: "Bringing own musician", price: 0 },
] as const;

export const ANTIPASTI = [
  "Selezione di Salumi & Formaggi",
  "Salumeria's Meatballs",
  "Calamari e Gamberi",
  "Margherita Pizza",
  "Carpaccio di Carne",
];

export const ENTREES = [
  "Rigatoni Bolognese",
  "Chicken Parmigiana",
  "Porchetta",
  "Branzino alla Livornese",
  "Salmon",
  "Risotto ai Porcini",
  "Fettuccine Nere",
  "Braised Short Ribs",
  "NY Steak",
];

export const DESSERTS = ["Tiramisu", "Cannoli", "Nutellino"];

// Booking pipeline status — matches the `event_status` enum in DB.
export const STATUS_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  quote_sent: "Quote Sent",
  contract_sent: "Contract Sent",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Use semantic tokens — these classes resolve via tailwind config.
export const STATUS_COLORS: Record<string, string> = {
  new_lead: "bg-primary/10 text-primary border-primary/20",
  quote_sent: "bg-secondary/15 text-secondary border-secondary/30",
  contract_sent: "bg-accent/15 text-accent border-accent/30",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export const STATUS_DOT_COLORS: Record<string, string> = {
  new_lead: "bg-primary",
  quote_sent: "bg-secondary",
  contract_sent: "bg-accent",
  confirmed: "bg-primary",
  completed: "bg-muted-foreground",
  cancelled: "bg-destructive",
};

export interface QuoteFields {
  menu_tier?: string | null;
  guest_count?: number | null;
  beverage_package?: string | null;
  addons?: string[] | null;
}

export interface AdminQuote {
  menu_cost: number;
  bev_cost: number;
  addon_cost: number;
  subtotal: number;
  service_charge: number;
  tax_amount: number;
  estimated_total: number;
}

// Admin quote: per-person menu + per-person bar + flat addons + 23% svc + 8% tax.
export function calculateAdminQuote(data: QuoteFields): AdminQuote {
  const tier = data.menu_tier ? MENU_TIERS[data.menu_tier] : undefined;
  const guests = Number(data.guest_count) || 0;
  const menu_cost = tier ? tier.price * guests : 0;

  const bev = BEVERAGE_PACKAGES.find((b) => b.value === data.beverage_package);
  const bev_cost = bev ? bev.price * guests : 0;

  const addon_cost = (data.addons || []).reduce((sum, a) => {
    const addon = ADDONS.find((x) => x.value === a);
    return sum + (addon?.price || 0);
  }, 0);

  const subtotal = menu_cost + bev_cost + addon_cost;
  const service_charge = Math.round(subtotal * 0.23 * 100) / 100;
  const tax_amount = Math.round(subtotal * 0.08 * 100) / 100;
  const estimated_total = Math.round((subtotal + service_charge + tax_amount) * 100) / 100;

  return { menu_cost, bev_cost, addon_cost, subtotal, service_charge, tax_amount, estimated_total };
}

// Build a display name from any combination of name fields the DB may have.
export function displayName(e: { client_first_name?: string | null; client_last_name?: string | null; full_name?: string | null }): string {
  const composed = [e.client_first_name, e.client_last_name].filter(Boolean).join(" ").trim();
  return composed || e.full_name || "Unnamed client";
}

export function firstName(e: { client_first_name?: string | null; full_name?: string | null }): string {
  if (e.client_first_name) return e.client_first_name;
  if (e.full_name) return e.full_name.trim().split(/\s+/)[0] || "";
  return "";
}

export function lastName(e: { client_last_name?: string | null; full_name?: string | null }): string {
  if (e.client_last_name) return e.client_last_name;
  if (e.full_name) return e.full_name.trim().split(/\s+/).slice(1).join(" ");
  return "";
}
