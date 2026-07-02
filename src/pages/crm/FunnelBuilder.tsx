import { useState } from "react";
import { Link } from "react-router-dom";
import { FunnelStoreProvider, useFunnel, newId } from "@/data/funnelStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Copy, Trash2, Image as ImageIcon, ExternalLink, ChevronDown, ChevronRight,
  Palette, UtensilsCrossed, Wine, Home, CalendarDays, Clock, Sparkles, HelpCircle,
  DollarSign, Wand2, Users, Save, Eye,
} from "lucide-react";

const TABS = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "menus", label: "Menus", icon: UtensilsCrossed },
  { id: "bar", label: "Bar", icon: Wine },
  { id: "venues", label: "Spaces", icon: Home },
  { id: "availability", label: "Availability", icon: CalendarDays },
  { id: "timeslots", label: "Time slots", icon: Clock },
  { id: "addons", label: "Addons", icon: Sparkles },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "pricing", label: "Buyout", icon: DollarSign },
  { id: "advanced", label: "Advanced", icon: Wand2 },
] as const;

type TabId = typeof TABS[number]["id"];

// ─────────────────────────────────────────────
// Shell
// ─────────────────────────────────────────────
export default function FunnelBuilder() {
  return (
    <FunnelStoreProvider>
      <Inner />
    </FunnelStoreProvider>
  );
}

function Inner() {
  const [tab, setTab] = useState<TabId>("branding");
  const { data } = useFunnel();

  return (
    <div className="min-h-screen -m-6 p-6" style={{ background: "#faf6ee", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Booking funnel</p>
            <h1 className="text-3xl font-semibold mt-1" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.01em" }}>
              Edit booking funnel
            </h1>
            <Link to="/crm/funnel/preview" target="_blank" className="text-sm inline-flex items-center gap-1 mt-2 hover:underline" style={{ color: data.branding.accent }}>
              Preview funnel <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <Link to="/crm" className="text-sm text-stone-600 hover:underline">← Back to funnels</Link>
        </header>

        <CoreFieldsCard />

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-stone-300/70">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm inline-flex items-center gap-2 border-b-2 -mb-px transition-colors ${
                  active ? "border-stone-900 text-stone-900 font-medium" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <Card className="p-6 md:p-8 border-stone-200 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
          {tab === "branding" && <BrandingTab />}
          {tab === "menus" && <MenusTab />}
          {tab === "bar" && <BarTab />}
          {tab === "venues" && <VenuesTab />}
          {tab === "availability" && <AvailabilityTab />}
          {tab === "timeslots" && <TimeSlotsTab />}
          {tab === "addons" && <AddonsTab />}
          {tab === "faq" && <FaqTab />}
          {tab === "pricing" && <PricingTab />}
          {tab === "advanced" && <AdvancedTab />}
        </Card>

        
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────
const SectionHead = ({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      {hint && <p className="text-sm text-stone-500 mt-0.5">{hint}</p>}
    </div>
    {right}
  </div>
);

const SaveBar = () => (
  <div className="flex justify-end mt-6 pt-5 border-t border-stone-200">
    <Button className="bg-stone-900 hover:bg-stone-800 text-white gap-2">
      <Save className="h-4 w-4" /> Save changes
    </Button>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider text-stone-500 font-medium">{label}</Label>
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Core Fields
// ─────────────────────────────────────────────
function CoreFieldsCard() {
  const { data, update } = useFunnel();
  const c = data.core;
  return (
    <Card className="p-6 border-stone-200 bg-white/70 rounded-xl shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-4">Core fields</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Name">
          <Input value={c.name} onChange={(e) => update("core", { name: e.target.value })} />
        </Field>
        <Field label="Slug">
          <Input value={c.slug} onChange={(e) => update("core", { slug: e.target.value })} />
          <p className="text-xs text-stone-500 pt-1">URL: /booking/<span className="font-mono">{c.slug}</span></p>
        </Field>
        <Field label="Location">
          <Select value={c.location} onValueChange={(v) => update("core", { location: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Osteria (Weston)">Osteria (Weston)</SelectItem>
              <SelectItem value="Casalina (Doral)">Casalina (Doral)</SelectItem>
              <SelectItem value="Salumeria 104">Salumeria 104</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Owner">
          <Select value={c.owner} onValueChange={(v) => update("core", { owner: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Julie Marchetti">Julie Marchetti</SelectItem>
              <SelectItem value="Marco Rossi">Marco Rossi</SelectItem>
              <SelectItem value="Sofia Bianchi">Sofia Bianchi</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Contract template">
          <Select value={c.template} onValueChange={(v) => update("core", { template: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Contract & Event Order">Contract & Event Order</SelectItem>
              <SelectItem value="Simple Confirmation">Simple Confirmation</SelectItem>
              <SelectItem value="Corporate Master">Corporate Master</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={c.status} onValueChange={(v) => update("core", { status: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active — public page is live</SelectItem>
              <SelectItem value="Inactive">Inactive — hidden</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Branding
// ─────────────────────────────────────────────
function BrandingTab() {
  const { data, update } = useFunnel();
  const b = data.branding;
  const themes = [
    { name: "Elegant", accent: "#7b3f2f", bg: "#f6f1e7", title: "Playfair Display", body: "Montserrat" },
    { name: "Modern", accent: "#111827", bg: "#f9fafb", title: "Space Grotesk", body: "Inter" },
    { name: "Warm", accent: "#c2410c", bg: "#fef3c7", title: "DM Serif Display", body: "Nunito" },
    { name: "Minimal", accent: "#525252", bg: "#ffffff", title: "Cormorant Garamond", body: "Karla" },
  ];
  const fonts = ["Playfair Display", "Cormorant Garamond", "DM Serif Display", "Space Grotesk", "Inter", "Montserrat", "Nunito", "Karla", "Lora", "Manrope"];

  return (
    <div>
      <SectionHead title="Branding" hint="How your booking page looks and feels" right={
        <Button variant="outline" className="gap-2" asChild>
          <Link to="/crm/funnel/preview" target="_blank"><Eye className="h-4 w-4" />Live preview</Link>
        </Button>
      }/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Hero image">
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-3 bg-stone-50">
            <img src={b.hero} className="w-full h-40 object-cover rounded" alt="hero"/>
            <Button variant="outline" size="sm" className="mt-3 w-full gap-2"><ImageIcon className="h-4 w-4"/>Replace image</Button>
          </div>
        </Field>
        <Field label="Logo">
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-3 bg-stone-50">
            <div className="h-40 flex items-center justify-center bg-white rounded">
              <img src={b.logo} className="max-h-32 object-contain" alt="logo"/>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full gap-2"><ImageIcon className="h-4 w-4"/>Replace logo</Button>
          </div>
        </Field>
      </div>

      <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mt-8 mb-3">Colors</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["accent","background","text","button"] as const).map((k) => (
          <div key={k} className="border border-stone-200 rounded-lg p-3 bg-white">
            <p className="text-xs uppercase tracking-wider text-stone-500 capitalize mb-2">{k}</p>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded border border-stone-200" style={{ background: b[k] }} />
              <Input type="color" value={b[k]} onChange={(e) => update("branding", { [k]: e.target.value } as any)} className="h-10 w-16 p-1"/>
              <Input value={b[k]} onChange={(e) => update("branding", { [k]: e.target.value } as any)} className="h-9 font-mono text-xs"/>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mt-8 mb-3">Typography</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Title font">
          <Select value={b.titleFont} onValueChange={(v) => update("branding", { titleFont: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{fonts.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <div className="mt-2 p-4 bg-stone-50 rounded border border-stone-200 text-3xl" style={{ fontFamily: b.titleFont }}>The quick brown fox</div>
        </Field>
        <Field label="Subtitle / body font">
          <Select value={b.bodyFont} onValueChange={(v) => update("branding", { bodyFont: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{fonts.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <div className="mt-2 p-4 bg-stone-50 rounded border border-stone-200" style={{ fontFamily: b.bodyFont }}>The quick brown fox jumps over the lazy dog. Elegant private dining in the heart of the city.</div>
        </Field>
      </div>

      <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mt-8 mb-3">Preset themes</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {themes.map((t) => (
          <button key={t.name} onClick={() => update("branding", { accent: t.accent, background: t.bg, titleFont: t.title, bodyFont: t.body, button: t.accent })}
            className="border border-stone-200 rounded-lg p-4 bg-white text-left hover:border-stone-400 transition-colors">
            <div className="flex gap-1 mb-3">
              <div className="h-6 w-6 rounded-full" style={{ background: t.accent }}/>
              <div className="h-6 w-6 rounded-full border" style={{ background: t.bg }}/>
            </div>
            <p className="font-medium" style={{ fontFamily: t.title }}>{t.name}</p>
            <p className="text-xs text-stone-500" style={{ fontFamily: t.body }}>{t.title} · {t.body}</p>
          </button>
        ))}
      </div>

      <SaveBar />
    </div>
  );
}

// ─────────────────────────────────────────────
// Menus
// ─────────────────────────────────────────────
function MenusTab() {
  const { data, update } = useFunnel();
  const [open, setOpen] = useState<string | null>(data.menus[0]?.id ?? null);

  const addMenu = () => update("menus", (prev) => [...prev, { id: newId(), name: "New menu", price: 55, hasLunchPrice: false, lunchPrice: 0, image: "", courses: [] }]);
  const dup = (id: string) => update("menus", (prev) => {
    const m = prev.find((x) => x.id === id); if (!m) return prev;
    return [...prev, { ...m, id: newId(), name: m.name + " (copy)" }];
  });
  const remove = (id: string) => update("menus", (prev) => prev.filter((m) => m.id !== id));
  const patch = (id: string, p: any) => update("menus", (prev) => prev.map((m) => m.id === id ? { ...m, ...p } : m));

  return (
    <div>
      <SectionHead title="Menus" hint="Prix-fixe menus your guests can choose from"/>
      <div className="space-y-3">
        {data.menus.map((m) => {
          const isOpen = open === m.id;
          return (
            <div key={m.id} className="border border-stone-200 rounded-lg overflow-hidden bg-white">
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => setOpen(isOpen ? null : m.id)} className="text-stone-500">
                  {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                </button>
                <img src={m.image} className="h-12 w-12 object-cover rounded" alt=""/>
                <div className="flex-1">
                  <p className="font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>{m.name}</p>
                  <p className="text-xs text-stone-500">${m.price}/pp{m.hasLunchPrice && ` · Lunch $${m.lunchPrice}`} · {m.courses.length} courses</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => dup(m.id)}><Copy className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
              </div>
              {isOpen && (
                <div className="border-t border-stone-200 p-5 bg-stone-50/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Name"><Input value={m.name} onChange={(e) => patch(m.id, { name: e.target.value })}/></Field>
                    <Field label="Dinner price / pp"><Input type="number" value={m.price} onChange={(e) => patch(m.id, { price: +e.target.value })}/></Field>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-stone-500 font-medium">Different lunch price?</Label>
                      <div className="flex items-center gap-3 h-10">
                        <Switch checked={m.hasLunchPrice} onCheckedChange={(v) => patch(m.id, { hasLunchPrice: v })}/>
                        {m.hasLunchPrice && <Input type="number" value={m.lunchPrice} onChange={(e) => patch(m.id, { lunchPrice: +e.target.value })} className="h-9 w-24" placeholder="Lunch $"/>}
                      </div>
                    </div>
                  </div>
                  <Field label="Image URL"><Input value={m.image} onChange={(e) => patch(m.id, { image: e.target.value })}/></Field>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-2">Courses</p>
                    <div className="space-y-2">
                      {m.courses.map((c) => (
                        <div key={c.id} className="border border-stone-200 rounded-md p-3 bg-white">
                          <div className="flex items-center gap-3">
                            <Input value={c.name} className="h-9 flex-1" onChange={(e) => patch(m.id, { courses: m.courses.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x) })}/>
                            <Input type="number" value={c.picks} className="h-9 w-24" placeholder="Picks" onChange={(e) => patch(m.id, { courses: m.courses.map((x) => x.id === c.id ? { ...x, picks: +e.target.value } : x) })}/>
                            <Button variant="ghost" size="sm" onClick={() => patch(m.id, { courses: m.courses.filter((x) => x.id !== c.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                          </div>
                          <div className="pl-3 mt-2 space-y-1.5 border-l-2 border-stone-200">
                            {c.items.map((it) => (
                              <div key={it.id} className="flex items-center gap-2">
                                <Input value={it.name} className="h-8 flex-1" onChange={(e) => patch(m.id, { courses: m.courses.map((x) => x.id === c.id ? { ...x, items: x.items.map((y) => y.id === it.id ? { ...y, name: e.target.value } : y) } : x) })}/>
                                <Input type="number" value={it.supplement} className="h-8 w-24" placeholder="+$" onChange={(e) => patch(m.id, { courses: m.courses.map((x) => x.id === c.id ? { ...x, items: x.items.map((y) => y.id === it.id ? { ...y, supplement: +e.target.value } : y) } : x) })}/>
                                <Button variant="ghost" size="sm" onClick={() => patch(m.id, { courses: m.courses.map((x) => x.id === c.id ? { ...x, items: x.items.filter((y) => y.id !== it.id) } : x) })}><Trash2 className="h-3.5 w-3.5 text-red-400"/></Button>
                              </div>
                            ))}
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => patch(m.id, { courses: m.courses.map((x) => x.id === c.id ? { ...x, items: [...x.items, { id: newId(), name: "New dish", supplement: 0 }] } : x) })}><Plus className="h-3 w-3 mr-1"/>Add dish</Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => patch(m.id, { courses: [...m.courses, { id: newId(), name: "New course", picks: 1, items: [] }] })}><Plus className="h-3.5 w-3.5 mr-1"/>Add course</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={addMenu} variant="outline" className="gap-2"><Plus className="h-4 w-4"/>Add menu</Button>
      </div>
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Bar
// ─────────────────────────────────────────────
function BarTab() {
  const { data, update } = useFunnel();
  const b = data.bar;
  const patch = (id: string, p: any) => update("bar", { packages: b.packages.map((x) => x.id === id ? { ...x, ...p } : x) });
  return (
    <div>
      <SectionHead title="Bar" hint="Beverage packages guests can add to their event" right={
        <div className="flex items-center gap-2"><span className="text-sm text-stone-500">Section active</span><Switch checked={b.active} onCheckedChange={(v) => update("bar", { active: v })}/></div>
      }/>
      {b.active ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {b.packages.map((p) => (
              <Card key={p.id} className="p-5 border-stone-200">
                <div className="flex items-start justify-between mb-3">
                  <Input value={p.name} className="text-lg font-medium border-none px-0 h-auto focus-visible:ring-0" style={{ fontFamily: "'Playfair Display', serif" }} onChange={(e) => patch(p.id, { name: e.target.value })}/>
                  <Button variant="ghost" size="sm" onClick={() => update("bar", { packages: b.packages.filter((x) => x.id !== p.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Field label="2 hr price"><Input type="number" value={p.price2hr} onChange={(e) => patch(p.id, { price2hr: +e.target.value })}/></Field>
                  <Field label="3 hr price"><Input type="number" value={p.price3hr} onChange={(e) => patch(p.id, { price3hr: +e.target.value })}/></Field>
                  <Field label="Extra hour / pp"><Input type="number" value={p.priceExtraHour} onChange={(e) => patch(p.id, { priceExtraHour: +e.target.value })}/></Field>
                </div>
                <Field label="Included drinks"><Textarea value={p.drinks.join("\n")} rows={3} onChange={(e) => patch(p.id, { drinks: e.target.value.split("\n") })}/></Field>
                <div className="flex items-center gap-3 mt-3 text-sm">
                  <button onClick={() => patch(p.id, { mode: "open" })} className={`px-3 py-1.5 rounded-full text-xs ${p.mode==="open"?"bg-stone-900 text-white":"bg-stone-100 text-stone-600"}`}>Open bar</button>
                  <button onClick={() => patch(p.id, { mode: "consumption" })} className={`px-3 py-1.5 rounded-full text-xs ${p.mode==="consumption"?"bg-stone-900 text-white":"bg-stone-100 text-stone-600"}`}>On consumption</button>
                  <div className="ml-auto flex items-center gap-2"><span className="text-xs text-stone-500">Active</span><Switch checked={p.active} onCheckedChange={(v) => patch(p.id, { active: v })}/></div>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => update("bar", { packages: [...b.packages, { id: newId(), name: "New package", mode: "open", price2hr: 30, price3hr: 40, priceExtraHour: 10, drinks: [], active: true }] })}><Plus className="h-4 w-4"/>Add package</Button>
        </>
      ) : <p className="text-stone-500 italic text-sm">Bar section is disabled — it will not appear in the guest funnel.</p>}
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Spaces (was Venues) + Buyout builder + Guest tiers
// ─────────────────────────────────────────────
function VenuesTab() {
  const { data, update } = useFunnel();
  const patch = (id: string, p: any) => update("venues", (prev) => prev.map((v) => v.id === id ? { ...v, ...p } : v));
  const privacyLabel = (p: string) => p === "private" ? "Private" : p === "semi" ? "Semi-private" : "Public";
  const privacyColor = (p: string) => p === "private" ? "bg-stone-900 text-white" : p === "semi" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";

  const buyouts = data.buyouts || [];
  const patchBuyout = (id: string, p: any) => update("buyouts", (prev) => prev.map((b) => b.id === id ? { ...b, ...p } : b));
  const toggleSpace = (id: string, sid: string) => {
    const b = buyouts.find((x) => x.id === id); if (!b) return;
    const has = b.spaceIds.includes(sid);
    patchBuyout(id, { spaceIds: has ? b.spaceIds.filter((x) => x !== sid) : [...b.spaceIds, sid] });
  };

  return (
    <div>
      <SectionHead title="Spaces" hint="Rooms and areas guests can book — with separate seated & cocktail capacities"/>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.venues.map((v) => (
          <Card key={v.id} className="overflow-hidden border-stone-200">
            <div className="relative h-40 group">
              <img src={v.photo} className="w-full h-full object-cover" alt=""/>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" variant="secondary" className="gap-1" onClick={() => {
                  const url = prompt("Paste image URL", v.photo); if (url) patch(v.id, { photo: url });
                }}><ImageIcon className="h-3.5 w-3.5"/>Change photo</Button>
              </div>
              <Badge className={`absolute top-2 right-2 border-0 ${privacyColor(v.privacy)}`}>{privacyLabel(v.privacy)}</Badge>
            </div>
            <div className="p-4 space-y-3">
              <Input value={v.name} className="text-base font-medium border-none px-0 h-auto focus-visible:ring-0" style={{ fontFamily: "'Playfair Display', serif" }} onChange={(e) => patch(v.id, { name: e.target.value })}/>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">Seated</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" value={v.seatedMin} onChange={(e) => patch(v.id, { seatedMin: +e.target.value })} className="h-8" placeholder="Min"/>
                  <Input type="number" value={v.seatedMax} onChange={(e) => patch(v.id, { seatedMax: +e.target.value })} className="h-8" placeholder="Max"/>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">Cocktail / standing</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" value={v.cocktailMin} onChange={(e) => patch(v.id, { cocktailMin: +e.target.value })} className="h-8" placeholder="Min"/>
                  <Input type="number" value={v.cocktailMax} onChange={(e) => patch(v.id, { cocktailMax: +e.target.value })} className="h-8" placeholder="Max"/>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">Privacy</p>
                <div className="flex gap-1">
                  {(["private","semi","public"] as const).map((k) => (
                    <button key={k} onClick={() => patch(v.id, { privacy: k })} className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${v.privacy===k ? privacyColor(k) + " border-transparent" : "border-stone-200 text-stone-500 bg-white"}`}>{privacyLabel(k)}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">Show layouts to guest</p>
                  <Switch checked={v.showLayouts} onCheckedChange={(x) => patch(v.id, { showLayouts: x })}/>
                </div>
                {v.showLayouts && (
                  <div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {v.layouts.map((l, i) => (
                        <Badge key={i} variant="secondary" className="gap-1 pr-1">
                          {l}
                          <button onClick={() => patch(v.id, { layouts: v.layouts.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3"/></button>
                        </Badge>
                      ))}
                    </div>
                    <Select value="" onValueChange={(val) => { if (val && !v.layouts.includes(val)) patch(v.id, { layouts: [...v.layouts, val] }); }}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="+ Add layout"/></SelectTrigger>
                      <SelectContent>
                        {["Rounds","Long table","U-shape","Theater","Classroom","Cocktail","Mixed seating","Boardroom"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" className="w-full text-red-500" onClick={() => update("venues", (prev) => prev.filter((x) => x.id !== v.id))}><Trash2 className="h-4 w-4 mr-1"/>Remove</Button>
            </div>
          </Card>
        ))}
      </div>
      <Button variant="outline" className="mt-4 gap-2" onClick={() => update("venues", (prev) => [...prev, { id: newId(), name: "New space", photo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=70", seatedMin: 8, seatedMax: 30, cocktailMin: 12, cocktailMax: 45, privacy: "semi", showLayouts: true, layouts: [] }])}><Plus className="h-4 w-4"/>Add space</Button>

      {/* Buyout options */}
      <div className="mt-10">
        <SectionHead title="Buyout options" hint="Bundle spaces into full or partial buyout packages guests can pick"/>
        <div className="space-y-3">
          {buyouts.map((b) => (
            <Card key={b.id} className="p-4 border-stone-200">
              <div className="flex items-center gap-3 mb-3">
                <Input value={b.label} className="font-medium border-none px-0 focus-visible:ring-0" style={{ fontFamily: "'Playfair Display', serif" }} onChange={(e) => patchBuyout(b.id, { label: e.target.value })}/>
                <div className="flex gap-1">
                  {(["full","partial"] as const).map((k) => (
                    <button key={k} onClick={() => patchBuyout(b.id, { kind: k })} className={`px-3 py-1 rounded-full text-xs ${b.kind===k?"bg-stone-900 text-white":"bg-stone-100 text-stone-600"}`}>{k === "full" ? "Full buyout" : "Partial buyout"}</button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Label className="text-xs text-stone-500">Price $</Label>
                  <Input type="number" value={b.price} className="h-8 w-28" onChange={(e) => patchBuyout(b.id, { price: +e.target.value })}/>
                  <Button variant="ghost" size="sm" onClick={() => update("buyouts", (prev) => prev.filter((x) => x.id !== b.id))}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-2">Includes spaces:</p>
              <div className="flex flex-wrap gap-2">
                {data.venues.map((v) => {
                  const active = b.spaceIds.includes(v.id);
                  return (
                    <button key={v.id} onClick={() => toggleSpace(b.id, v.id)} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${active ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 text-stone-600 bg-white"}`}>
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => update("buyouts", (prev) => [...prev, { id: newId(), label: "New buyout", kind: "partial", spaceIds: [], price: 1500 }])}><Plus className="h-3.5 w-3.5 mr-1"/>Add buyout option</Button>
        </div>
      </div>

      {/* Guest tiers & booking constraints (moved from bottom) */}
      <GuestTiersCard />

      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Availability
// ─────────────────────────────────────────────
function AvailabilityTab() {
  const { data, update } = useFunnel();
  const a = data.availability;
  const stateColor = (s: string) => s === "available" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : s === "blocked" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div>
      <SectionHead title="Availability" hint="Block dates, set holiday behavior, and add surcharges for special days"/>

      <div className="grid grid-cols-1 gap-6">
        {/* Holidays */}
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">US holidays</p>
          <div className="space-y-2">
            {a.holidays.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3 border border-stone-200 rounded-md bg-white flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <p className="text-sm font-medium">{h.label}</p>
                  <p className="text-xs text-stone-500">{h.date}</p>
                </div>
                <div className="flex gap-1">
                  {(["available","blocked","special"] as const).map((s) => (
                    <button key={s} onClick={() => update("availability", { holidays: a.holidays.map((x) => x.id === h.id ? { ...x, state: s } : x) })}
                      className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors capitalize ${h.state===s ? stateColor(s) : "border-stone-200 text-stone-400 bg-white"}`}>
                      {s}
                    </button>
                  ))}
                </div>
                {h.state !== "blocked" && (
                  <div className="flex items-center gap-1">
                    <Label className="text-[10px] uppercase text-stone-500">Surcharge</Label>
                    <span className="text-stone-500 text-sm">$</span>
                    <Input type="number" value={h.surcharge} className="h-8 w-24" placeholder="0"
                      onChange={(e) => update("availability", { holidays: a.holidays.map((x) => x.id === h.id ? { ...x, surcharge: +e.target.value } : x) })}/>
                    <span className="text-xs text-stone-500">/pp</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blocked ranges */}
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Block or upcharge specific ranges</p>
          <div className="space-y-2">
            {a.blocked.map((r) => (
              <div key={r.id} className="flex items-center gap-2 p-3 border border-stone-200 rounded-md bg-white flex-wrap">
                <Input type="date" value={r.from} className="h-8 w-40" onChange={(e) => update("availability", { blocked: a.blocked.map((x) => x.id===r.id ? {...x, from: e.target.value} : x) })}/>
                <span className="text-stone-400">→</span>
                <Input type="date" value={r.to} className="h-8 w-40" onChange={(e) => update("availability", { blocked: a.blocked.map((x) => x.id===r.id ? {...x, to: e.target.value} : x) })}/>
                <Input placeholder="Note (e.g. Restaurant Week +$)" value={r.note} className="h-8 flex-1 min-w-[160px]" onChange={(e) => update("availability", { blocked: a.blocked.map((x) => x.id===r.id ? {...x, note: e.target.value} : x) })}/>
                <div className="flex items-center gap-1">
                  <span className="text-stone-500 text-sm">$</span>
                  <Input type="number" value={r.surcharge} className="h-8 w-24" placeholder="0 = blocked"
                    onChange={(e) => update("availability", { blocked: a.blocked.map((x) => x.id===r.id ? {...x, surcharge: +e.target.value} : x) })}/>
                  <span className="text-xs text-stone-500">/pp</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => update("availability", { blocked: a.blocked.filter((x) => x.id !== r.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
              </div>
            ))}
            <p className="text-xs text-stone-500 italic">Leave surcharge at $0 to block the range entirely; enter a value to keep it bookable with an upcharge.</p>
            <Button variant="outline" size="sm" onClick={() => update("availability", { blocked: [...a.blocked, { id: newId(), from: "", to: "", note: "", surcharge: 0 }] })}><Plus className="h-3.5 w-3.5 mr-1"/>Add range</Button>
          </div>
        </div>

        {/* Recurring */}
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Recurring rules</p>
          <div className="space-y-2">
            {a.recurring.map((r) => (
              <div key={r.id} className="flex items-center gap-2 p-3 border border-stone-200 rounded-md bg-white">
                <Input value={r.label} className="h-8 flex-1" onChange={(e) => update("availability", { recurring: a.recurring.map((x) => x.id===r.id ? {...x, label: e.target.value} : x) })}/>
                <Select value={String(r.weekday)} onValueChange={(v) => update("availability", { recurring: a.recurring.map((x) => x.id===r.id ? {...x, weekday: +v} : x) })}>
                  <SelectTrigger className="h-8 w-32"><SelectValue/></SelectTrigger>
                  <SelectContent>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <span className="text-stone-500 text-sm">$</span>
                  <Input type="number" value={r.surcharge} className="h-8 w-20" placeholder="0"
                    onChange={(e) => update("availability", { recurring: a.recurring.map((x) => x.id===r.id ? {...x, surcharge: +e.target.value} : x) })}/>
                  <span className="text-xs text-stone-500">/pp</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => update("availability", { recurring: a.recurring.filter((x) => x.id !== r.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update("availability", { recurring: [...a.recurring, { id: newId(), label: "Closed every…", weekday: 1, surcharge: 0 }] })}><Plus className="h-3.5 w-3.5 mr-1"/>Add rule</Button>
          </div>
        </div>
      </div>
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Time slots
// ─────────────────────────────────────────────
function TimeSlotsTab() {
  const { data, update } = useFunnel();
  const t = data.timeslots;
  const hh = t.happyHour;
  return (
    <div>
      <SectionHead title="Time slots" hint="When guests can book"/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Start"><Input type="time" value={t.start} onChange={(e) => update("timeslots", { start: e.target.value })}/></Field>
        <Field label="End"><Input type="time" value={t.end} onChange={(e) => update("timeslots", { end: e.target.value })}/></Field>
        <Field label="Interval">
          <Select value={String(t.interval)} onValueChange={(v) => update("timeslots", { interval: +v as any })}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="60">60 min</SelectItem></SelectContent>
          </Select>
        </Field>
      </div>

      {/* Lunch / dinner */}
      <div className="mt-6 border border-stone-200 rounded-lg p-5 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Do you want to determine your lunch & dinner hours?</p>
            <p className="text-xs text-stone-500 mt-0.5">Applies different menu pricing before / after the cutoff.</p>
          </div>
          <Switch checked={t.lunchDinnerPricing} onCheckedChange={(v) => update("timeslots", { lunchDinnerPricing: v })}/>
        </div>
        {t.lunchDinnerPricing && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-stone-500">Lunch until</span>
            <Input type="time" value={t.cutoff} onChange={(e) => update("timeslots", { cutoff: e.target.value })} className="h-9 w-40"/>
            <span className="text-stone-500">then dinner begins</span>
          </div>
        )}
      </div>

      {/* Happy hour */}
      <div className="mt-4 border border-stone-200 rounded-lg p-5 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Add Happy Hour window?</p>
            <p className="text-xs text-stone-500 mt-0.5">Show a HH badge on eligible slots, with an optional note.</p>
          </div>
          <Switch checked={hh.enabled} onCheckedChange={(v) => update("timeslots", { happyHour: { ...hh, enabled: v } })}/>
        </div>
        {hh.enabled && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Start"><Input type="time" value={hh.start} onChange={(e) => update("timeslots", { happyHour: { ...hh, start: e.target.value } })}/></Field>
            <Field label="End"><Input type="time" value={hh.end} onChange={(e) => update("timeslots", { happyHour: { ...hh, end: e.target.value } })}/></Field>
            <Field label="Note (shown to guest)"><Input value={hh.note} onChange={(e) => update("timeslots", { happyHour: { ...hh, note: e.target.value } })}/></Field>
          </div>
        )}
      </div>

      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Addons
// ─────────────────────────────────────────────
function AddonsTab() {
  const { data, update } = useFunnel();
  const patch = (id: string, p: any) => update("addons", (prev) => prev.map((a) => a.id === id ? { ...a, ...p } : a));
  return (
    <div>
      <SectionHead title="Addons" hint="Optional extras — control which fees apply per item"/>
      <div className="grid grid-cols-12 gap-2 px-3 text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">
        <div className="col-span-3">Name</div>
        <div className="col-span-1">Price $</div>
        <div className="col-span-2">Unit</div>
        <div className="col-span-1">Qty</div>
        <div className="col-span-1 text-center">Tax</div>
        <div className="col-span-1 text-center">S.C.</div>
        <div className="col-span-1">Other %</div>
        <div className="col-span-1 text-center">Active</div>
        <div className="col-span-1"></div>
      </div>
      <div className="space-y-2">
        {data.addons.map((a) => (
          <div key={a.id} className="grid grid-cols-12 gap-2 items-center border border-stone-200 rounded-md p-3 bg-white">
            <Input value={a.name} className="col-span-3 h-9" onChange={(e) => patch(a.id, { name: e.target.value })}/>
            <Input type="number" value={a.price} className="col-span-1 h-9" onChange={(e) => patch(a.id, { price: +e.target.value })}/>
            <Select value={a.unit} onValueChange={(v) => patch(a.id, { unit: v as any })}>
              <SelectTrigger className="col-span-2 h-9"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="per-person">Per person</SelectItem></SelectContent>
            </Select>
            <Input type="number" value={a.qty} className="col-span-1 h-9" placeholder="Qty" onChange={(e) => patch(a.id, { qty: +e.target.value })}/>
            <div className="col-span-1 flex justify-center"><Switch checked={a.taxable} onCheckedChange={(v) => patch(a.id, { taxable: v })}/></div>
            <div className="col-span-1 flex justify-center"><Switch checked={a.serviceable} onCheckedChange={(v) => patch(a.id, { serviceable: v })}/></div>
            <Input type="number" value={a.otherFeePct} className="col-span-1 h-9" placeholder="0" onChange={(e) => patch(a.id, { otherFeePct: +e.target.value })}/>
            <div className="col-span-1 flex justify-center"><Switch checked={a.active} onCheckedChange={(v) => patch(a.id, { active: v })}/></div>
            <Button variant="ghost" size="sm" className="col-span-1" onClick={() => update("addons", (prev) => prev.filter((x) => x.id !== a.id))}><Trash2 className="h-4 w-4 text-red-500"/></Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-500 mt-3 italic">Toggle whether each addon should have sales tax, service charge, or an "other" fee (e.g. resort / venue fee %) applied on top.</p>
      <Button variant="outline" className="mt-4 gap-2" onClick={() => update("addons", (prev) => [...prev, { id: newId(), name: "New addon", price: 0, unit: "fixed", qty: 1, active: true, taxable: true, serviceable: false, otherFeePct: 0 }])}><Plus className="h-4 w-4"/>Add addon</Button>
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────
function FaqTab() {
  const { data, update } = useFunnel();
  const f = data.faq;
  const suggested = [
    "Can I bring my own cake?",
    "Is there parking?",
    "Can I decorate the room?",
    "Do you handle food allergies?",
    "What's the cancellation policy?",
    "Do you offer gluten-free options?",
  ];
  return (
    <div>
      <SectionHead title="FAQ" hint="Common questions guests ask before booking" right={
        <div className="flex items-center gap-2"><span className="text-sm text-stone-500">Show in funnel</span><Switch checked={f.show} onCheckedChange={(v) => update("faq", { show: v })}/></div>
      }/>
      {f.show ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {f.items.map((q) => (
              <div key={q.id} className="border border-stone-200 rounded-md p-4 bg-white">
                <Input value={q.q} className="font-medium mb-2" onChange={(e) => update("faq", { items: f.items.map((x) => x.id === q.id ? { ...x, q: e.target.value } : x) })}/>
                <Textarea value={q.a} rows={2} onChange={(e) => update("faq", { items: f.items.map((x) => x.id === q.id ? { ...x, a: e.target.value } : x) })}/>
                <div className="flex justify-end mt-2"><Button variant="ghost" size="sm" onClick={() => update("faq", { items: f.items.filter((x) => x.id !== q.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button></div>
              </div>
            ))}
            <Button variant="outline" onClick={() => update("faq", { items: [...f.items, { id: newId(), q: "New question", a: "" }] })}><Plus className="h-4 w-4 mr-1"/>Add Q&A</Button>
          </div>
          <div className="border border-stone-200 rounded-lg p-4 bg-stone-50 h-fit">
            <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Suggested</p>
            <div className="space-y-2">
              {suggested.map((s) => (
                <div key={s} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-stone-700 flex-1">{s}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => update("faq", { items: [...f.items, { id: newId(), q: s, a: "" }] })}><Plus className="h-3 w-3 mr-1"/>Add</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : <p className="text-sm text-stone-500 italic">FAQ section hidden from guest funnel.</p>}
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Buyout pricing (was Pricing)
// ─────────────────────────────────────────────
function PricingTab() {
  const { data, update } = useFunnel();
  const p = data.pricing;
  const enabled = data.advanced.buyoutEnabled;

  if (!enabled) {
    return (
      <div>
        <SectionHead title="Buyout pricing" hint="Full-venue buyouts and their upcharges"/>
        <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center bg-stone-50">
          <p className="text-sm text-stone-600">Buyout pricing is currently <strong>disabled</strong>.</p>
          <p className="text-xs text-stone-500 mt-1">Menu, bar, and add-on pricing are configured on their own tabs. To offer a full or partial venue buyout, enable the module in <strong>Advanced</strong>.</p>
        </div>
        <SaveBar/>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title="Buyout pricing" hint="Applied when a guest selects a full or partial buyout in Spaces"/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Base buyout upcharge $"><Input type="number" value={p.buyoutUpcharge} onChange={(e) => update("pricing", { buyoutUpcharge: +e.target.value })}/></Field>
        <Field label="Service charge %"><Input type="number" value={p.serviceCharge} onChange={(e) => update("pricing", { serviceCharge: +e.target.value })}/></Field>
        <Field label="Sales tax %"><Input type="number" value={p.salesTax} onChange={(e) => update("pricing", { salesTax: +e.target.value })}/></Field>
        <div>
          <Label className="text-xs uppercase tracking-wider text-stone-500 font-medium">Kids pricing</Label>
          <div className="flex gap-1 mt-1.5">
            {[["same","Same as adult"],["flat","Flat price"],["notCounted","Not counted"]].map(([v,l]) => (
              <button key={v} onClick={() => update("pricing", { kidsMode: v as any })}
                className={`px-3 py-1.5 text-xs rounded-full border ${p.kidsMode===v?"bg-stone-900 text-white border-stone-900":"border-stone-200 text-stone-600"}`}>{l}</button>
            ))}
          </div>
          {p.kidsMode === "flat" && <Input type="number" value={p.kidsFlat} className="mt-2 h-9" onChange={(e) => update("pricing", { kidsFlat: +e.target.value })}/>}
        </div>
      </div>
      <p className="text-xs text-stone-500 mt-4 italic">Per-person menu prices come from the Menus tab; bar packages from Bar; extras from Addons. This tab only controls the buyout upcharge and site-wide tax/service defaults.</p>
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Advanced
// ─────────────────────────────────────────────
function AdvancedTab() {
  const { data, update } = useFunnel();
  return (
    <div>
      <SectionHead title="Advanced" hint="Dynamic rules and optional modules"/>

      <Card className="p-4 border-stone-200 bg-stone-50 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable buyout module</p>
            <p className="text-xs text-stone-500 mt-0.5">Unlocks the Buyout tab and shows buyout options guests can select.</p>
          </div>
          <Switch checked={data.advanced.buyoutEnabled} onCheckedChange={(v) => update("advanced", { buyoutEnabled: v })}/>
        </div>
      </Card>

      <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Dynamic pricing rules</p>
      <div className="space-y-2">
        {data.advanced.rules.map((r) => (
          <Card key={r.id} className="p-4 border-stone-200">
            <div className="flex items-center gap-3">
              <Input value={r.label} className="font-medium border-none px-0 h-8 focus-visible:ring-0" onChange={(e) => update("advanced", { rules: data.advanced.rules.map((x) => x.id === r.id ? { ...x, label: e.target.value } : x) })}/>
              <Button variant="ghost" size="sm" onClick={() => update("advanced", { rules: data.advanced.rules.filter((x) => x.id !== r.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div><Label className="text-xs text-stone-500">When</Label><Input value={r.condition} onChange={(e) => update("advanced", { rules: data.advanced.rules.map((x) => x.id === r.id ? { ...x, condition: e.target.value } : x) })}/></div>
              <div><Label className="text-xs text-stone-500">Apply</Label><Input value={r.effect} onChange={(e) => update("advanced", { rules: data.advanced.rules.map((x) => x.id === r.id ? { ...x, effect: e.target.value } : x) })}/></div>
            </div>
          </Card>
        ))}
      </div>
      <Button variant="outline" className="mt-4 gap-2" onClick={() => update("advanced", { rules: [...data.advanced.rules, { id: newId(), label: "New rule", condition: "When …", effect: "+10%" }] })}><Plus className="h-4 w-4"/>Add rule</Button>
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Guest tiers & constraints (rendered inside Spaces tab)
// ─────────────────────────────────────────────
function GuestTiersCard() {
  const { data, update } = useFunnel();
  const g = data.guests;
  return (
    <Card className="p-5 border-stone-200 bg-stone-50 rounded-xl mt-10">
      <div className="flex items-center gap-2 mb-4"><Users className="h-4 w-4 text-stone-500"/><p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Guest tiers & booking constraints</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Min guests"><Input type="number" value={g.min} onChange={(e) => update("guests", { min: +e.target.value })}/></Field>
        <Field label="Max guests"><Input type="number" value={g.max} onChange={(e) => update("guests", { max: +e.target.value })}/></Field>
        <Field label="Mode">
          <Select value={g.mode} onValueChange={(v) => update("guests", { mode: v as any })}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="contact">Contact only</SelectItem><SelectItem value="exception">Exception</SelectItem><SelectItem value="info">Info only</SelectItem></SelectContent>
          </Select>
        </Field>
        <Field label="Min advance days"><Input type="number" value={g.minAdvanceDays} onChange={(e) => update("guests", { minAdvanceDays: +e.target.value })}/></Field>
        <div className="md:col-span-4"><Field label="Contact points"><Input value={g.contactPoints} onChange={(e) => update("guests", { contactPoints: e.target.value })}/></Field></div>
      </div>
    </Card>
  );
}

  const { data, update } = useFunnel();
  const b = data.bar;
  const patch = (id: string, p: any) => update("bar", { packages: b.packages.map((x) => x.id === id ? { ...x, ...p } : x) });
  return (
    <div>
      <SectionHead title="Bar" hint="Beverage packages guests can add to their event" right={
        <div className="flex items-center gap-2"><span className="text-sm text-stone-500">Section active</span><Switch checked={b.active} onCheckedChange={(v) => update("bar", { active: v })}/></div>
      }/>
      {b.active ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {b.packages.map((p) => (
              <Card key={p.id} className="p-5 border-stone-200">
                <div className="flex items-start justify-between mb-3">
                  <Input value={p.name} className="text-lg font-medium border-none px-0 h-auto focus-visible:ring-0" style={{ fontFamily: "'Playfair Display', serif" }} onChange={(e) => patch(p.id, { name: e.target.value })}/>
                  <Button variant="ghost" size="sm" onClick={() => update("bar", { packages: b.packages.filter((x) => x.id !== p.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Field label="2 hr price"><Input type="number" value={p.price2hr} onChange={(e) => patch(p.id, { price2hr: +e.target.value })}/></Field>
                  <Field label="3 hr price"><Input type="number" value={p.price3hr} onChange={(e) => patch(p.id, { price3hr: +e.target.value })}/></Field>
                </div>
                <Field label="Included drinks"><Textarea value={p.drinks.join("\n")} rows={3} onChange={(e) => patch(p.id, { drinks: e.target.value.split("\n") })}/></Field>
                <div className="flex items-center gap-3 mt-3 text-sm">
                  <button onClick={() => patch(p.id, { mode: "open" })} className={`px-3 py-1.5 rounded-full text-xs ${p.mode==="open"?"bg-stone-900 text-white":"bg-stone-100 text-stone-600"}`}>Open bar</button>
                  <button onClick={() => patch(p.id, { mode: "consumption" })} className={`px-3 py-1.5 rounded-full text-xs ${p.mode==="consumption"?"bg-stone-900 text-white":"bg-stone-100 text-stone-600"}`}>On consumption</button>
                  <div className="ml-auto flex items-center gap-2"><span className="text-xs text-stone-500">Active</span><Switch checked={p.active} onCheckedChange={(v) => patch(p.id, { active: v })}/></div>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => update("bar", { packages: [...b.packages, { id: newId(), name: "New package", mode: "open", price2hr: 30, price3hr: 40, drinks: [], active: true }] })}><Plus className="h-4 w-4"/>Add package</Button>
        </>
      ) : <p className="text-stone-500 italic text-sm">Bar section is disabled — it will not appear in the guest funnel.</p>}
      <SaveBar/>
    </div>
  );
}

