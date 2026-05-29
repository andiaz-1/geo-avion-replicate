import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  MENU_TIERS,
  ANTIPASTI,
  ENTREES,
  DESSERTS,
  BEVERAGE_PACKAGES,
  ADDONS,
  LOCATIONS,
  EVENT_TYPES,
  areasFor,
  calculateAdminQuote,
} from "@/lib/crm-data";

export interface EventFormValues {
  client_first_name: string;
  client_last_name: string;
  email: string;
  phone: string;
  company_name: string;
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  area: string;
  guest_count: number;
  event_type: string;
  menu_tier: string;
  antipasti_selections: string[];
  entree_selections: string[];
  dessert_selections: string[];
  beverage_package: string;
  addons: string[];
  children_attending: boolean;
  notes: string;
  subtotal: number;
  service_charge: number;
  tax_amount: number;
  estimated_total: number;
}

interface Props {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => void;
  isSubmitting?: boolean;
}

const EMPTY: EventFormValues = {
  client_first_name: "",
  client_last_name: "",
  email: "",
  phone: "",
  company_name: "",
  event_name: "",
  event_date: "",
  event_time: "",
  location: "",
  guest_count: 0,
  event_type: "",
  menu_tier: "",
  antipasti_selections: [],
  entree_selections: [],
  dessert_selections: [],
  beverage_package: "",
  addons: [],
  children_attending: false,
  notes: "",
  subtotal: 0,
  service_charge: 0,
  tax_amount: 0,
  estimated_total: 0,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-display font-medium text-lg mb-4 pb-2 border-b border-border">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
    </div>
  );
}

function CheckboxGroup({
  label,
  items,
  selected,
  max,
  onToggle,
}: {
  label: string;
  items: string[];
  selected: string[];
  max: number;
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block text-sm">
        {label} <span className="text-muted-foreground font-normal">(up to {max})</span>
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {items.map((item) => (
          <label
            key={item}
            className="flex items-center gap-2 p-2 rounded-sm hover:bg-muted cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(item)}
              onCheckedChange={() => onToggle(item)}
              disabled={!selected.includes(item) && selected.length >= max}
            />
            <span className="text-sm">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>${Number(value).toLocaleString()}</span>
    </div>
  );
}

export default function EventForm({ defaultValues = {}, onSubmit, isSubmitting }: Props) {
  const [form, setForm] = useState<EventFormValues>({
    ...EMPTY,
    ...defaultValues,
    guest_count: Number(defaultValues.guest_count) || 0,
    antipasti_selections: defaultValues.antipasti_selections || [],
    entree_selections: defaultValues.entree_selections || [],
    dessert_selections: defaultValues.dessert_selections || [],
    addons: (() => {
      const a = defaultValues.addons as unknown;
      if (Array.isArray(a)) return a as string[];
      if (a && typeof a === "object")
        return Object.keys(a as Record<string, unknown>).filter(
          (k) => (a as Record<string, unknown>)[k]
        );
      return [];
    })(),
  });

  const set = <K extends keyof EventFormValues>(k: K, v: EventFormValues[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const toggle = (field: "antipasti_selections" | "entree_selections" | "dessert_selections" | "addons", item: string) => {
    const arr = form[field];
    set(field, (arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]) as never);
  };

  const tier = form.menu_tier ? MENU_TIERS[form.menu_tier] : undefined;
  const quote = calculateAdminQuote(form);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      guest_count: Number(form.guest_count),
      subtotal: quote.subtotal,
      service_charge: quote.service_charge,
      tax_amount: quote.tax_amount,
      estimated_total: quote.estimated_total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Client">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="First Name">
            <Input value={form.client_first_name} onChange={(e) => set("client_first_name", e.target.value)} required />
          </Field>
          <Field label="Last Name">
            <Input value={form.client_last_name} onChange={(e) => set("client_last_name", e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Company" className="md:col-span-2">
            <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Event">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Event Name (optional)" className="md:col-span-2">
            <Input value={form.event_name} onChange={(e) => set("event_name", e.target.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} required />
          </Field>
          <Field label="Time">
            <Input value={form.event_time} onChange={(e) => set("event_time", e.target.value)} placeholder="e.g. 7:00 PM" />
          </Field>
          <Field label="Location">
            <Select value={form.location} onValueChange={(v) => set("location", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Guest Count">
            <Input
              type="number"
              value={form.guest_count || ""}
              onChange={(e) => set("guest_count", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Event Type">
            <Select value={form.event_type} onValueChange={(v) => set("event_type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.children_attending}
              onCheckedChange={(v) => set("children_attending", v)}
              id="children"
            />
            <Label htmlFor="children">Children Attending</Label>
          </div>
        </div>
      </Section>

      <Section title="Menu">
        <Field label="Menu Tier">
          <Select value={form.menu_tier} onValueChange={(v) => set("menu_tier", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MENU_TIERS).map(([k, t]) => (
                <SelectItem key={k} value={k}>
                  {t.label} — ${t.price}/person
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {tier && (
          <div className="mt-4 space-y-6">
            <CheckboxGroup
              label="Antipasti"
              items={ANTIPASTI}
              selected={form.antipasti_selections}
              max={5}
              onToggle={(i) => toggle("antipasti_selections", i)}
            />
            <CheckboxGroup
              label="Entrées"
              items={ENTREES}
              selected={form.entree_selections}
              max={6}
              onToggle={(i) => toggle("entree_selections", i)}
            />
            <CheckboxGroup
              label="Desserts"
              items={DESSERTS}
              selected={form.dessert_selections}
              max={3}
              onToggle={(i) => toggle("dessert_selections", i)}
            />
          </div>
        )}
      </Section>

      <Section title="Beverage & Add-ons">
        <Field label="Beverage Package">
          <Select value={form.beverage_package} onValueChange={(v) => set("beverage_package", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select package" />
            </SelectTrigger>
            <SelectContent>
              {BEVERAGE_PACKAGES.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                  {b.price > 0 ? ` — $${b.price}/pp` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="mt-4">
          <Label className="mb-2 block text-sm">Add-ons</Label>
          <div className="space-y-1">
            {ADDONS.map((a) => (
              <label key={a.value} className="flex items-center gap-2 p-2 rounded-sm hover:bg-muted cursor-pointer">
                <Checkbox
                  checked={form.addons.includes(a.value)}
                  onCheckedChange={() => toggle("addons", a.value)}
                />
                <span className="text-sm">
                  {a.label}
                  {a.price > 0 ? ` — $${a.price}` : " — No charge"}
                </span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      {form.menu_tier && form.guest_count > 0 && (
        <Section title="Estimated Quote">
          <div className="bg-muted/40 rounded-sm p-4 space-y-1">
            <Row label={`Menu × ${form.guest_count}`} value={quote.menu_cost} />
            {quote.bev_cost > 0 && <Row label={`Beverage × ${form.guest_count}`} value={quote.bev_cost} />}
            {quote.addon_cost > 0 && <Row label="Add-ons" value={quote.addon_cost} />}
            <div className="border-t border-border pt-1">
              <Row label="Subtotal" value={quote.subtotal} />
            </div>
            <Row label="Service (23%)" value={quote.service_charge} />
            <Row label="Tax (8%)" value={quote.tax_amount} />
            <div className="border-t border-border pt-1 font-semibold">
              <Row label="Estimated Total" value={quote.estimated_total} />
            </div>
          </div>
        </Section>
      )}

      <Section title="Notes">
        <Textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Internal notes..."
          rows={4}
        />
      </Section>

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Saving..." : "Save Event"}
      </Button>
    </form>
  );
}
