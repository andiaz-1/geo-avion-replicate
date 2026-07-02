import { useMemo, useState } from "react";
import { loadFunnelData, FunnelData } from "@/data/funnelStore";
import { Check, Minus, Plus, ChevronDown } from "lucide-react";

export default function FunnelPreview() {
  const data = useMemo(() => loadFunnelData(), []);
  const b = data.branding;
  const steps = useMemo(() => {
    const s = [{ id: "date", label: "Your date" }];
    if (data.venues.length) s.push({ id: "venue", label: "Your space" });
    if (data.menus.length) s.push({ id: "menu", label: "Your menu" });
    if (data.bar.active && data.bar.packages.some(p => p.active)) s.push({ id: "bar", label: "Beverages" });
    if (data.addons.some(a => a.active)) s.push({ id: "addons", label: "Add-ons" });
    s.push({ id: "proposal", label: "Your proposal" });
    return s;
  }, [data]);

  const [stepIdx, setStepIdx] = useState(0);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const step = steps[stepIdx];
  const [form, setForm] = useState({
    date: "", time: "", guests: 12,
    venueId: data.venues[0]?.id ?? "",
    menuId: data.menus[0]?.id ?? "",
    barId: data.bar.packages.find(p => p.active)?.id ?? "",
    addonIds: [] as string[],
    name: "", email: "", phone: "",
  });

  // Availability: which dates are blocked
  const dateBlocked = (iso: string) => {
    const h = data.availability.holidays.find(x => x.date === iso);
    if (h?.state === "blocked") return { blocked: true, note: `${h.label} — closed` };
    if (data.availability.blocked.some(r => iso >= r.from && iso <= r.to)) {
      const r = data.availability.blocked.find(r => iso >= r.from && iso <= r.to)!;
      return { blocked: true, note: r.note || "Unavailable" };
    }
    const d = new Date(iso);
    const rr = data.availability.recurring.find(r => d.getDay() === r.weekday);
    if (rr) return { blocked: true, note: rr.label };
    if (h?.state === "special") return { blocked: false, special: true, note: `${h.label} — special pricing applies` };
    return { blocked: false };
  };

  // Generate 21 day options starting from today
  const dateOptions = useMemo(() => {
    const arr: { iso: string; label: string; blocked: boolean; special?: boolean; note?: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const st = dateBlocked(iso);
      arr.push({ iso, label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }), blocked: st.blocked, special: (st as any).special, note: st.note });
    }
    return arr;
  }, [data]);

  // Time slots
  const timeSlots = useMemo(() => {
    const t = data.timeslots;
    const [sh, sm] = t.start.split(":").map(Number);
    const [eh, em] = t.end.split(":").map(Number);
    const out: string[] = [];
    let cur = sh * 60 + sm; const end = eh * 60 + em;
    while (cur <= end) { const h = Math.floor(cur / 60), m = cur % 60; out.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`); cur += t.interval; }
    return out;
  }, [data]);

  // Quote
  const menu = data.menus.find(m => m.id === form.menuId);
  const bar = data.bar.packages.find(p => p.id === form.barId);
  const menuTotal = (menu?.price ?? 0) * form.guests;
  const barTotal = bar ? bar.price2hr * form.guests : 0;
  const addonsTotal = data.addons.filter(a => form.addonIds.includes(a.id)).reduce((s, a) => s + (a.unit === "per-person" ? a.price * form.guests : a.price * a.qty), 0);
  const subtotal = menuTotal + barTotal + addonsTotal;
  const service = subtotal * (data.pricing.serviceCharge / 100);
  const tax = (subtotal + service) * (data.pricing.salesTax / 100);
  const total = subtotal + service + tax;

  const canContinue = () => {
    if (step.id === "date") return form.date && form.time;
    if (step.id === "venue") return !!form.venueId;
    if (step.id === "menu") return !!form.menuId;
    if (step.id === "bar") return !!form.barId;
    if (step.id === "proposal") return form.name && form.email && form.phone;
    return true;
  };

  const btnStyle = { background: b.button, color: "#fff" };
  const accentStyle = { color: b.accent };

  return (
    <div className="min-h-screen" style={{ background: b.background, color: b.text, fontFamily: `'${b.bodyFont}', system-ui, sans-serif` }}>
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={b.hero} className="w-full h-full object-cover" alt=""/>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))" }}/>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <img src={b.logo} className="h-16 w-16 rounded-full object-cover mb-3 border-2 border-white/70"/>
          <h1 className="text-4xl md:text-5xl" style={{ fontFamily: `'${b.titleFont}', serif`, letterSpacing: "-0.01em" }}>{data.core.name}</h1>
          <p className="text-sm md:text-base opacity-90 mt-2 max-w-lg">Private events, celebrations, and unforgettable dinners</p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-start justify-between mb-12 gap-1">
          {steps.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={s.id} className="flex items-start flex-1 last:flex-none min-w-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <button onClick={() => i <= stepIdx && setStepIdx(i)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-medium border transition-colors"
                    style={{
                      background: active ? b.accent : "transparent",
                      borderColor: active ? b.accent : done ? b.accent : "rgba(0,0,0,0.25)",
                      color: active ? "#fff" : done ? b.accent : "rgba(0,0,0,0.5)",
                    }}>
                    {i + 1}
                  </button>
                  <span className="text-[10px] mt-2 uppercase tracking-[0.15em] whitespace-nowrap"
                    style={{ color: active ? b.text : "rgba(0,0,0,0.5)" }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="flex-1 h-px mt-[13px] mx-2" style={{ background: "rgba(0,0,0,0.15)", minWidth: 12 }}/>}
              </div>
            );
          })}
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-10 shadow-sm border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {step.id === "date" && (
            <div>
              <h2 className="text-3xl mb-1" style={{ fontFamily: `'${b.titleFont}', serif` }}>When?</h2>
              <p className="text-sm opacity-70 mb-6">Pick a date, time, and party size.</p>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
                {dateOptions.map((d) => (
                  <button key={d.iso} disabled={d.blocked} title={d.note}
                    onClick={() => setForm({ ...form, date: d.iso })}
                    className="p-2 rounded-lg text-xs text-center border transition-all disabled:opacity-40 disabled:cursor-not-allowed relative group"
                    style={{
                      background: form.date === d.iso ? b.accent : d.special ? "#fef3c7" : "transparent",
                      color: form.date === d.iso ? "#fff" : "inherit",
                      borderColor: form.date === d.iso ? b.accent : "rgba(0,0,0,0.1)",
                    }}>
                    <div className="opacity-70">{d.label.split(",")[0]}</div>
                    <div className="text-base font-medium">{new Date(d.iso).getDate()}</div>
                    {d.blocked && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="h-px w-3/4 rotate-[-20deg]" style={{ background: "rgba(0,0,0,0.3)" }}/></div>}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                <div>
                  <label className="text-xs uppercase tracking-wider opacity-60">Time</label>
                  <div className="relative mt-1">
                    <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full appearance-none bg-transparent border-b-2 py-2 pr-8 focus:outline-none" style={{ borderColor: "rgba(0,0,0,0.15)", fontFamily: "inherit" }}>
                      <option value="">Select a time</option>
                      {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-3 h-4 w-4 opacity-40 pointer-events-none"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider opacity-60">Guests</label>
                  <div className="flex items-center gap-4 mt-2">
                    <button onClick={() => setForm({ ...form, guests: Math.max(data.guests.min, form.guests - 1) })}
                      className="h-11 w-11 rounded-full border-2 flex items-center justify-center hover:bg-black/5" style={{ borderColor: b.accent, color: b.accent }}>
                      <Minus className="h-4 w-4"/>
                    </button>
                    <div className="text-4xl font-medium tabular-nums" style={{ fontFamily: `'${b.titleFont}', serif`, color: b.accent }}>{form.guests}</div>
                    <button onClick={() => setForm({ ...form, guests: Math.min(data.guests.max, form.guests + 1) })}
                      className="h-11 w-11 rounded-full border-2 flex items-center justify-center hover:bg-black/5" style={{ borderColor: b.accent, color: b.accent }}>
                      <Plus className="h-4 w-4"/>
                    </button>
                    <span className="text-xs opacity-60 ml-2">Min {data.guests.min} · Max {data.guests.max}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step.id === "venue" && (
            <div>
              <h2 className="text-3xl mb-1" style={{ fontFamily: `'${b.titleFont}', serif` }}>Choose your space</h2>
              <p className="text-sm opacity-70 mb-6">Every room tells a different story.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.venues.filter(v => form.guests >= v.seatedMin && form.guests <= v.seatedMax).map((v) => (
                  <button key={v.id} onClick={() => setForm({ ...form, venueId: v.id })}
                    className="text-left rounded-xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: form.venueId === v.id ? b.accent : "rgba(0,0,0,0.08)", background: form.venueId === v.id ? "rgba(0,0,0,0.02)" : "white" }}>
                    <img src={v.photo} className="w-full h-36 object-cover" alt=""/>
                    <div className="p-4">
                      <p className="font-medium" style={{ fontFamily: `'${b.titleFont}', serif`, fontSize: 18 }}>{v.name}</p>
                      <p className="text-xs opacity-60 mt-1">{v.seatedMin}–{v.seatedMax} seated {v.privacy !== "public" && `· ${v.privacy === "private" ? "Private" : "Semi-private"}`}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step.id === "menu" && (
            <div>
              <h2 className="text-3xl mb-1" style={{ fontFamily: `'${b.titleFont}', serif` }}>Choose a menu</h2>
              <p className="text-sm opacity-70 mb-6">All menus are prix-fixe, served family-style unless noted.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.menus.map((m) => {
                  const selected = form.menuId === m.id;
                  const expanded = expandedMenuId === m.id;
                  const dishCount = m.courses.reduce((s, c) => s + c.items.length, 0);
                  return (
                    <div key={m.id} className="rounded-xl overflow-hidden border-2 transition-all bg-white"
                      style={{ borderColor: selected ? b.accent : "rgba(0,0,0,0.08)", background: selected ? "rgba(0,0,0,0.02)" : "white" }}>
                      <button onClick={() => setForm({ ...form, menuId: m.id })} className="w-full text-left">
                        {m.showPhoto !== false && <img src={m.image} className="w-full h-36 object-cover" alt=""/>}
                        <div className="p-4 pb-2">
                          <div className="flex items-baseline justify-between">
                            <p className="font-medium" style={{ fontFamily: `'${b.titleFont}', serif`, fontSize: 18 }}>{m.name}</p>
                            <p className="text-sm" style={accentStyle}>${m.price}/pp</p>
                          </div>
                          <p className="text-xs opacity-60 mt-1">{m.courses.length} courses · {dishCount} dishes</p>
                        </div>
                      </button>
                      <button onClick={() => setExpandedMenuId(expanded ? null : m.id)}
                        className="w-full px-4 pb-3 pt-1 text-[11px] uppercase tracking-wider flex items-center gap-1 opacity-70 hover:opacity-100"
                        style={{ color: b.accent }}>
                        {expanded ? "Hide details" : "View details"} <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}/>
                      </button>
                      {expanded && (
                        <div className="px-4 pb-4 border-t pt-3 space-y-2" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                          {m.courses.map((c) => (
                            <div key={c.id}>
                              <p className="text-xs font-medium uppercase tracking-wider opacity-70">{c.name}{c.picks > 1 && <span className="opacity-50 normal-case ml-1">· pick {c.picks}</span>}</p>
                              {m.showDishes && c.items.length > 0 && (
                                <ul className="text-xs opacity-80 mt-1 space-y-0.5">
                                  {c.items.map((it) => <li key={it.id}>· {it.name}{it.supplement ? <span className="opacity-60"> (+${it.supplement})</span> : null}</li>)}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step.id === "bar" && (
            <div>
              <h2 className="text-3xl mb-1" style={{ fontFamily: `'${b.titleFont}', serif` }}>Beverages</h2>
              <p className="text-sm opacity-70 mb-6">Pick a package or offer on consumption.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.bar.packages.filter(p => p.active).map((p) => (
                  <button key={p.id} onClick={() => setForm({ ...form, barId: p.id })}
                    className="text-left rounded-xl p-5 border-2 transition-all"
                    style={{ borderColor: form.barId === p.id ? b.accent : "rgba(0,0,0,0.08)", background: form.barId === p.id ? "rgba(0,0,0,0.02)" : "white" }}>
                    <p className="font-medium" style={{ fontFamily: `'${b.titleFont}', serif`, fontSize: 18 }}>{p.name}</p>
                    {p.mode === "open" ? <p className="text-sm mt-1" style={accentStyle}>${p.price2hr}/pp · 2hr</p> : <p className="text-sm mt-1 opacity-60">Charged as ordered</p>}
                    <ul className="text-xs opacity-70 mt-3 space-y-1">
                      {p.drinks.map((d, i) => <li key={i}>· {d}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step.id === "addons" && (
            <div>
              <h2 className="text-3xl mb-1" style={{ fontFamily: `'${b.titleFont}', serif` }}>Add-ons</h2>
              <p className="text-sm opacity-70 mb-6">Optional extras to elevate your event.</p>
              <div className="space-y-2">
                {data.addons.filter(a => a.active).map((a) => {
                  const sel = form.addonIds.includes(a.id);
                  return (
                    <button key={a.id} onClick={() => setForm({ ...form, addonIds: sel ? form.addonIds.filter(x => x !== a.id) : [...form.addonIds, a.id] })}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all"
                      style={{ borderColor: sel ? b.accent : "rgba(0,0,0,0.08)", background: sel ? "rgba(0,0,0,0.02)" : "white" }}>
                      <div className="h-5 w-5 rounded flex items-center justify-center border-2" style={{ borderColor: sel ? b.accent : "rgba(0,0,0,0.2)", background: sel ? b.accent : "transparent" }}>
                        {sel && <Check className="h-3 w-3 text-white"/>}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{a.name}</p>
                        <p className="text-xs opacity-60">{a.unit === "per-person" ? `$${a.price}/pp` : `$${a.price}${a.qty > 1 ? ` × ${a.qty}` : ""}`}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step.id === "proposal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl mb-1" style={{ fontFamily: `'${b.titleFont}', serif` }}>Your proposal</h2>
                <p className="text-sm opacity-70 mb-6">Share your details and we'll be in touch.</p>
                <div className="space-y-4">
                  <div><label className="text-xs uppercase tracking-wider opacity-60">Full name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent border-b-2 py-2 focus:outline-none" style={{ borderColor: "rgba(0,0,0,0.15)" }}/></div>
                  <div><label className="text-xs uppercase tracking-wider opacity-60">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-transparent border-b-2 py-2 focus:outline-none" style={{ borderColor: "rgba(0,0,0,0.15)" }}/></div>
                  <div><label className="text-xs uppercase tracking-wider opacity-60">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-transparent border-b-2 py-2 focus:outline-none" style={{ borderColor: "rgba(0,0,0,0.15)" }}/></div>
                </div>
              </div>
              <div className="rounded-xl p-6" style={{ background: "rgba(0,0,0,0.03)" }}>
                <p className="text-xs uppercase tracking-wider opacity-60 mb-3">Quote summary</p>
                <div className="space-y-2 text-sm">
                  <Row label={`${menu?.name ?? "—"} × ${form.guests}`} value={`$${menuTotal.toFixed(0)}`}/>
                  {bar && <Row label={`${bar.name} × ${form.guests}`} value={`$${barTotal.toFixed(0)}`}/>}
                  {form.addonIds.length > 0 && <Row label={`Add-ons (${form.addonIds.length})`} value={`$${addonsTotal.toFixed(0)}`}/>}
                  <div className="h-px my-2" style={{ background: "rgba(0,0,0,0.1)" }}/>
                  <Row label="Subtotal" value={`$${subtotal.toFixed(0)}`}/>
                  <Row label={`Service ${data.pricing.serviceCharge}%`} value={`$${service.toFixed(0)}`}/>
                  <Row label={`Tax ${data.pricing.salesTax}%`} value={`$${tax.toFixed(0)}`}/>
                  <div className="h-px my-2" style={{ background: "rgba(0,0,0,0.1)" }}/>
                  <div className="flex justify-between text-lg pt-1"><span style={{ fontFamily: `'${b.titleFont}', serif` }}>Total</span><span className="font-medium" style={accentStyle}>${total.toFixed(0)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}
            className="text-sm opacity-70 hover:opacity-100 disabled:opacity-30">← Back</button>
          <div className="flex flex-col items-end gap-1">
            <button onClick={() => stepIdx < steps.length - 1 && setStepIdx(stepIdx + 1)}
              disabled={!canContinue()}
              className="px-8 py-3 rounded-full text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={btnStyle}>
              {stepIdx === steps.length - 1 ? "Send request" : "Continue"}
            </button>
            {!canContinue() && <p className="text-xs opacity-60">Please complete required fields</p>}
          </div>
        </div>

        {/* FAQ */}
        {data.faq.show && data.faq.items.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl mb-4" style={{ fontFamily: `'${b.titleFont}', serif` }}>Frequently asked</h3>
            <div className="space-y-2">
              {data.faq.items.map((q) => <FaqRow key={q.id} q={q.q} a={q.a}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between"><span className="opacity-70">{label}</span><span className="tabular-nums">{value}</span></div>
);

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}/>
      </button>
      {open && <p className="pb-4 text-sm opacity-70">{a}</p>}
    </div>
  );
}
