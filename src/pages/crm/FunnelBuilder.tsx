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

        <GuestTiersCard />
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

// ─────────────────────────────────────────────
// Venues
// ─────────────────────────────────────────────
function VenuesTab() {
  const { data, update } = useFunnel();
  const patch = (id: string, p: any) => update("venues", (prev) => prev.map((v) => v.id === id ? { ...v, ...p } : v));
  return (
    <div>
      <SectionHead title="Venues" hint="Rooms and spaces available for booking"/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.venues.map((v) => (
          <Card key={v.id} className="overflow-hidden border-stone-200">
            <div className="relative h-36">
              <img src={v.photo} className="w-full h-full object-cover" alt=""/>
              <Badge className="absolute top-2 left-2 bg-white/90 text-stone-800 border-0">{v.min}–{v.max} guests</Badge>
              {v.private && <Badge className="absolute top-2 right-2 bg-stone-900 text-white border-0">Private</Badge>}
            </div>
            <div className="p-4 space-y-3">
              <Input value={v.name} className="text-base font-medium border-none px-0 h-auto focus-visible:ring-0" style={{ fontFamily: "'Playfair Display', serif" }} onChange={(e) => patch(v.id, { name: e.target.value })}/>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Min"><Input type="number" value={v.min} onChange={(e) => patch(v.id, { min: +e.target.value })} className="h-8"/></Field>
                <Field label="Max"><Input type="number" value={v.max} onChange={(e) => patch(v.id, { max: +e.target.value })} className="h-8"/></Field>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Private / buyout</span><Switch checked={v.private} onCheckedChange={(x) => patch(v.id, { private: x })}/>
              </div>
              <Field label="Layouts"><Input value={v.layouts.join(", ")} onChange={(e) => patch(v.id, { layouts: e.target.value.split(",").map(s => s.trim()) })}/></Field>
              <Button variant="ghost" size="sm" className="w-full text-red-500" onClick={() => update("venues", (prev) => prev.filter((x) => x.id !== v.id))}><Trash2 className="h-4 w-4 mr-1"/>Remove</Button>
            </div>
          </Card>
        ))}
      </div>
      <Button variant="outline" className="mt-4 gap-2" onClick={() => update("venues", (prev) => [...prev, { id: newId(), name: "New venue", photo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=70", min: 8, max: 30, private: false, layouts: [] }])}><Plus className="h-4 w-4"/>Add venue</Button>
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

  // Mini calendar preview (next 35 days)
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });
  const dayState = (d: Date): "available" | "blocked" | "special" => {
    const iso = d.toISOString().slice(0, 10);
    const h = a.holidays.find((x) => x.date === iso);
    if (h) return h.state;
    if (a.blocked.some((b) => iso >= b.from && iso <= b.to)) return "blocked";
    if (a.recurring.some((r) => d.getDay() === r.weekday)) return "blocked";
    return "available";
  };

  return (
    <div>
      <SectionHead title="Availability" hint="Block dates, set holiday behavior, and recurring closures"/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holidays */}
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">US holidays</p>
          <div className="space-y-2">
            {a.holidays.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3 border border-stone-200 rounded-md bg-white">
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.label}</p>
                  <p className="text-xs text-stone-500">{h.date}</p>
                </div>
                <div className="flex gap-1">
                  {(["available","blocked","special"] as const).map((s) => (
                    <button key={s} onClick={() => update("availability", { holidays: a.holidays.map((x) => x.id === h.id ? { ...x, state: s } : x) })}
                      className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors capitalize ${h.state===s ? stateColor(s) : "border-stone-200 text-stone-400 bg-white"}`}>
                      {s === "special" ? "Special +$" : s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar preview */}
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Calendar preview (next 5 weeks)</p>
          <div className="border border-stone-200 rounded-lg p-4 bg-white">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-stone-500 mb-1">
              {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d, i) => {
                const s = dayState(d);
                const color = s === "blocked" ? "bg-red-500" : s === "special" ? "bg-amber-400" : "bg-emerald-400";
                return <div key={i} className="aspect-square rounded flex items-center justify-center text-[11px] text-white font-medium" style={{ background: "" }}>
                  <div className={`w-full h-full rounded flex items-center justify-center ${color}`}>{d.getDate()}</div>
                </div>;
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-400"/>Available</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400"/>Special</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500"/>Blocked</span>
            </div>
          </div>
        </div>

        {/* Blocked ranges */}
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Block specific days / ranges</p>
          <div className="space-y-2">
            {a.blocked.map((r) => (
              <div key={r.id} className="flex items-center gap-2 p-3 border border-stone-200 rounded-md bg-white">
                <Input type="date" value={r.from} className="h-8" onChange={(e) => update("availability", { blocked: a.blocked.map((x) => x.id===r.id ? {...x, from: e.target.value} : x) })}/>
                <span className="text-stone-400">→</span>
                <Input type="date" value={r.to} className="h-8" onChange={(e) => update("availability", { blocked: a.blocked.map((x) => x.id===r.id ? {...x, to: e.target.value} : x) })}/>
                <Input placeholder="Note" value={r.note} className="h-8 flex-1" onChange={(e) => update("availability", { blocked: a.blocked.map((x) => x.id===r.id ? {...x, note: e.target.value} : x) })}/>
                <Button variant="ghost" size="sm" onClick={() => update("availability", { blocked: a.blocked.filter((x) => x.id !== r.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update("availability", { blocked: [...a.blocked, { id: newId(), from: "", to: "", note: "" }] })}><Plus className="h-3.5 w-3.5 mr-1"/>Add block</Button>
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
                <Button variant="ghost" size="sm" onClick={() => update("availability", { recurring: a.recurring.filter((x) => x.id !== r.id) })}><Trash2 className="h-4 w-4 text-red-500"/></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update("availability", { recurring: [...a.recurring, { id: newId(), label: "Closed every…", weekday: 1 }] })}><Plus className="h-3.5 w-3.5 mr-1"/>Add rule</Button>
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
  // Generate slot chips
  const slots: { time: string; isLunch: boolean }[] = [];
  const [sh, sm] = t.start.split(":").map(Number);
  const [eh, em] = t.end.split(":").map(Number);
  const [ch, cm] = t.cutoff.split(":").map(Number);
  let cur = sh * 60 + sm; const end = eh * 60 + em; const cutoff = ch * 60 + cm;
  while (cur <= end && slots.length < 60) {
    const h = Math.floor(cur / 60), m = cur % 60;
    slots.push({ time: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`, isLunch: cur < cutoff });
    cur += t.interval;
  }
  return (
    <div>
      <SectionHead title="Time slots" hint="When guests can book, and how slots are generated"/>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Start"><Input type="time" value={t.start} onChange={(e) => update("timeslots", { start: e.target.value })}/></Field>
        <Field label="End"><Input type="time" value={t.end} onChange={(e) => update("timeslots", { end: e.target.value })}/></Field>
        <Field label="Interval">
          <Select value={String(t.interval)} onValueChange={(v) => update("timeslots", { interval: +v as any })}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="60">60 min</SelectItem></SelectContent>
          </Select>
        </Field>
        <div>
          <Label className="text-xs uppercase tracking-wider text-stone-500 font-medium">Lunch / Dinner pricing</Label>
          <div className="flex items-center gap-2 mt-1.5 h-10">
            <Switch checked={t.lunchDinnerPricing} onCheckedChange={(v) => update("timeslots", { lunchDinnerPricing: v })}/>
            {t.lunchDinnerPricing && <Input type="time" value={t.cutoff} onChange={(e) => update("timeslots", { cutoff: e.target.value })} className="h-9 w-32"/>}
          </div>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mt-6 mb-3">Generated slots ({slots.length})</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <span key={s.time} className={`px-3 py-1.5 rounded-full text-xs border ${t.lunchDinnerPricing && s.isLunch ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-stone-100 border-stone-200 text-stone-700"}`}>
            {s.time} {t.lunchDinnerPricing && (s.isLunch ? "· Lunch" : "· Dinner")}
          </span>
        ))}
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
      <SectionHead title="Addons" hint="Optional extras guests can add à la carte"/>
      <div className="space-y-2">
        {data.addons.map((a) => (
          <div key={a.id} className="grid grid-cols-12 gap-2 items-center border border-stone-200 rounded-md p-3 bg-white">
            <Input value={a.name} className="col-span-4 h-9" onChange={(e) => patch(a.id, { name: e.target.value })}/>
            <Input type="number" value={a.price} className="col-span-2 h-9" onChange={(e) => patch(a.id, { price: +e.target.value })}/>
            <Select value={a.unit} onValueChange={(v) => patch(a.id, { unit: v as any })}>
              <SelectTrigger className="col-span-2 h-9"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="per-person">Per person</SelectItem></SelectContent>
            </Select>
            <Input type="number" value={a.qty} className="col-span-2 h-9" placeholder="Qty" onChange={(e) => patch(a.id, { qty: +e.target.value })}/>
            <div className="col-span-1 flex justify-center"><Switch checked={a.active} onCheckedChange={(v) => patch(a.id, { active: v })}/></div>
            <Button variant="ghost" size="sm" className="col-span-1" onClick={() => update("addons", (prev) => prev.filter((x) => x.id !== a.id))}><Trash2 className="h-4 w-4 text-red-500"/></Button>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-4 gap-2" onClick={() => update("addons", (prev) => [...prev, { id: newId(), name: "New addon", price: 0, unit: "fixed", qty: 1, active: true }])}><Plus className="h-4 w-4"/>Add addon</Button>
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
// Pricing
// ─────────────────────────────────────────────
function PricingTab() {
  const { data, update } = useFunnel();
  const p = data.pricing;
  const [sim, setSim] = useState({ guests: 20, menuId: data.menus[0]?.id, barId: data.bar.packages[0]?.id, duration: 2 });
  const menu = data.menus.find((m) => m.id === sim.menuId);
  const bar = data.bar.packages.find((b) => b.id === sim.barId);
  const menuTotal = (menu?.price ?? 0) * sim.guests;
  const barTotal = bar ? (sim.duration === 2 ? bar.price2hr : bar.price3hr) * sim.guests : 0;
  const subtotal = menuTotal + barTotal;
  const service = subtotal * (p.serviceCharge / 100);
  const tax = (subtotal + service) * (p.salesTax / 100);
  const total = subtotal + service + tax;
  return (
    <div>
      <SectionHead title="Pricing" hint="Fixed rates applied at checkout"/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Price / person"><Input type="number" value={p.pricePerPerson} onChange={(e) => update("pricing", { pricePerPerson: +e.target.value })}/></Field>
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
        <Field label="Buyout upcharge"><Input type="number" value={p.buyoutUpcharge} onChange={(e) => update("pricing", { buyoutUpcharge: +e.target.value })}/></Field>
        <Field label="Service charge %"><Input type="number" value={p.serviceCharge} onChange={(e) => update("pricing", { serviceCharge: +e.target.value })}/></Field>
        <Field label="Sales tax %"><Input type="number" value={p.salesTax} onChange={(e) => update("pricing", { salesTax: +e.target.value })}/></Field>
      </div>

      <div className="mt-8 border border-stone-200 rounded-lg p-5 bg-stone-50">
        <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Live quote simulator</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <Field label="Guests"><Input type="number" value={sim.guests} onChange={(e) => setSim({ ...sim, guests: +e.target.value })}/></Field>
          <Field label="Menu">
            <Select value={sim.menuId} onValueChange={(v) => setSim({ ...sim, menuId: v })}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{data.menus.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} — ${m.price}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Bar">
            <Select value={sim.barId} onValueChange={(v) => setSim({ ...sim, barId: v })}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{data.bar.packages.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Duration">
            <Select value={String(sim.duration)} onValueChange={(v) => setSim({ ...sim, duration: +v })}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="2">2 hr</SelectItem><SelectItem value="3">3 hr</SelectItem></SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-white rounded p-4 border border-stone-200">
          <div><p className="text-xs text-stone-500">Subtotal</p><p className="font-medium text-lg">${subtotal.toFixed(0)}</p></div>
          <div><p className="text-xs text-stone-500">Service ({p.serviceCharge}%)</p><p className="font-medium text-lg">${service.toFixed(0)}</p></div>
          <div><p className="text-xs text-stone-500">Tax ({p.salesTax}%)</p><p className="font-medium text-lg">${tax.toFixed(0)}</p></div>
          <div><p className="text-xs text-stone-500">Grand total</p><p className="font-semibold text-xl" style={{ color: data.branding.accent }}>${total.toFixed(0)}</p></div>
        </div>
      </div>
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Advanced
// ─────────────────────────────────────────────
function AdvancedTab() {
  const { data, update } = useFunnel();
  const [sim, setSim] = useState({ date: "2026-12-24", time: "19:00", guests: 30 });
  const basePrice = data.pricing.pricePerPerson * sim.guests;
  return (
    <div>
      <SectionHead title="Advanced — Dynamic pricing" hint="Apply surcharges, discounts, or minimums based on conditions"/>
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

      <div className="mt-8 border border-stone-200 rounded-lg p-5 bg-stone-50">
        <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">Dynamic pricing simulator</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Field label="Date"><Input type="date" value={sim.date} onChange={(e) => setSim({ ...sim, date: e.target.value })}/></Field>
          <Field label="Time"><Input type="time" value={sim.time} onChange={(e) => setSim({ ...sim, time: e.target.value })}/></Field>
          <Field label="Guests"><Input type="number" value={sim.guests} onChange={(e) => setSim({ ...sim, guests: +e.target.value })}/></Field>
        </div>
        <div className="bg-white rounded p-4 border border-stone-200 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-stone-500">Base</span><span>${basePrice}</span></div>
          {data.advanced.rules.map((r) => (
            <div key={r.id} className="flex justify-between text-stone-600"><span>{r.label} — <span className="text-stone-400">{r.condition}</span></span><span className="font-medium">{r.effect}</span></div>
          ))}
          <div className="flex justify-between pt-2 border-t border-stone-200 font-semibold text-base"><span>Estimated total</span><span style={{ color: data.branding.accent }}>${(basePrice * 1.15).toFixed(0)}</span></div>
        </div>
      </div>
      <SaveBar/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Guest tiers & constraints
// ─────────────────────────────────────────────
function GuestTiersCard() {
  const { data, update } = useFunnel();
  const g = data.guests;
  return (
    <Card className="p-6 border-stone-200 bg-white/70 rounded-xl shadow-sm">
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
