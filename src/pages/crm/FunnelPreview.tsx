import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Check, Info, Minus, Phone, Plus } from "lucide-react";
import { loadFunnelData } from "@/data/funnelStore";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const STEP_DOTS = ["Your Date", "Your Space", "Your Menu", "Your Proposal"];

export default function FunnelPreview() {
  const config = useMemo(() => loadFunnelData(), []);
  const [currentStep, setCurrentStep] = useState(1);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [expandedLayouts, setExpandedLayouts] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: undefined as Date | undefined,
    time: "",
    guests: Math.max(16, config.guests.min),
    spaceId: "",
    layout: "",
    menuId: "",
    barId: "",
    addonIds: [] as string[],
    name: "",
    email: "",
    phone: "",
  });

  const activeSpace = config.venues.find((space) => space.id === form.spaceId);
  const activeMenu = config.menus.find((menu) => menu.id === form.menuId);
  const activeBar = config.bar.packages.find((bar) => bar.id === form.barId);
  const selectedAddons = config.addons.filter((addon) => form.addonIds.includes(addon.id));

  const timeSlots = useMemo(() => {
    const [startHour, startMinute] = config.timeslots.start.split(":").map(Number);
    const [endHour, endMinute] = config.timeslots.end.split(":").map(Number);
    const slots: string[] = [];
    let cursor = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    while (cursor <= end) {
      slots.push(`${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`);
      cursor += config.timeslots.interval;
    }
    return slots;
  }, [config.timeslots]);

  const isLunch = form.time && config.timeslots.lunchDinnerPricing && form.time < config.timeslots.cutoff;
  const adultCount = form.guests;
  const menuPerPerson = activeMenu ? (isLunch && activeMenu.hasLunchPrice ? activeMenu.lunchPrice : activeMenu.price) : 0;
  const menuTotal = menuPerPerson * adultCount;
  const barTotal = activeBar?.mode === "open" ? activeBar.price2hr * adultCount : 0;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (addon.unit === "per-person" ? addon.price * adultCount : addon.price * addon.qty), 0);
  const subtotal = menuTotal + barTotal + addonsTotal;
  const serviceCharge = subtotal * (config.pricing.serviceCharge / 100);
  const salesTax = (subtotal + serviceCharge) * (config.pricing.salesTax / 100);
  const grandTotal = subtotal + serviceCharge + salesTax;
  const activeDot = currentStep >= 4 ? 4 : currentStep;

  const dateStatus = (date: Date) => {
    const minDate = new Date();
    minDate.setHours(0, 0, 0, 0);
    minDate.setDate(minDate.getDate() + config.guests.minAdvanceDays);
    const iso = format(date, "yyyy-MM-dd");
    const holiday = config.availability.holidays.find((item) => item.date === iso);
    const blockedRange = config.availability.blocked.find((range) => iso >= range.from && iso <= range.to);
    const recurring = config.availability.recurring.find((rule) => date.getDay() === rule.weekday);
    return {
      disabled: date < minDate || holiday?.state === "blocked" || !!blockedRange || !!recurring,
      special: holiday?.state === "special",
    };
  };

  const canContinue = () => {
    if (currentStep === 1) return !!form.date && !!form.time && form.guests >= config.guests.min;
    if (currentStep === 2) return !!form.spaceId;
    if (currentStep === 3) return !!form.menuId && (!!form.barId || !config.bar.active);
    if (currentStep === 4) return true;
    return !!form.name && !!form.email && !!form.phone;
  };

  const next = () => setCurrentStep((step) => Math.min(5, step + 1));
  const back = () => setCurrentStep((step) => Math.max(1, step - 1));

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <div className="w-full px-4 pt-10 pb-4">
        <div className="max-w-lg mx-auto flex items-start justify-between relative">
          {STEP_DOTS.map((label, index) => {
            const filled = index + 1 <= activeDot;
            return (
              <div key={label} className="flex-1 flex flex-col items-center relative min-w-0">
                {index < STEP_DOTS.length - 1 && <div className="absolute top-[9px] left-[calc(50%+10px)] right-[calc(-50%+10px)] h-px bg-border" />}
                <button
                  type="button"
                  onClick={() => index + 1 <= activeDot && setCurrentStep(index + 1)}
                  className={cn("relative z-10 w-5 h-5 rounded-full border-2 transition-colors", filled ? "bg-foreground border-foreground" : "bg-background border-border")}
                  aria-label={label}
                />
                <span className={cn("mt-3 text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-center whitespace-nowrap transition-colors", filled ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <main className="px-4 py-12 md:py-20">
        {currentStep === 1 && (
          <section className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">Begin Your Italian Celebration</h1>
              <p className="mt-3 text-xs tracking-[0.25em] uppercase text-muted-foreground">{config.core.name.replace(/—.*/, "").trim()} · {config.core.location.replace(/[()]/g, "")}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Date of Your Event</label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <button className={cn("w-full flex items-center justify-between border border-border bg-card px-4 py-3 text-sm rounded-sm transition-colors hover:border-foreground/50", !form.date && "text-muted-foreground")}>
                      <span>{form.date ? format(form.date, "MMMM d, yyyy") : "Select a date"}</span>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(date) => { setForm({ ...form, date: date || undefined }); if (date) setDateOpen(false); }}
                      disabled={(date) => dateStatus(date).disabled}
                      modifiers={{ special: (date) => dateStatus(date).special }}
                      modifiersClassNames={{ special: "text-accent font-semibold" }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Time of Reservation</label>
                <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                  <PopoverTrigger asChild>
                    <button className={cn("w-full flex items-center justify-between border border-border bg-card px-4 py-3 text-sm rounded-sm transition-colors hover:border-foreground/50", !form.time && "text-muted-foreground")}>
                      <span>{form.time ? `${form.time} — ${isLunch ? "Lunch" : "Dinner"}` : "Select a time"}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-y-auto" align="start">
                    {timeSlots.map((slot) => (
                      <button key={slot} onClick={() => { setForm({ ...form, time: slot }); setTimeOpen(false); }} className={cn("w-full px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors", form.time === slot && "bg-primary/10 text-primary font-medium")}>
                        {slot}<span className="ml-2 text-muted-foreground text-xs">({config.timeslots.lunchDinnerPricing && slot < config.timeslots.cutoff ? "Lunch" : "Dinner"})</span>
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Total Number of Guests</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })} disabled={form.guests <= 1} className="w-10 h-10 flex items-center justify-center border rounded-sm transition-all border-border text-foreground hover:border-primary hover:text-primary disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                  <span className="font-heading text-3xl text-foreground min-w-[3ch] text-center tabular-nums">{form.guests}</span>
                  <button onClick={() => setForm({ ...form, guests: Math.min(config.guests.max, form.guests + 1) })} disabled={form.guests >= config.guests.max} className="w-10 h-10 flex items-center justify-center border rounded-sm transition-all border-border text-foreground hover:border-primary hover:text-primary disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <ActionFooter onBack={back} onNext={next} canContinue={canContinue()} first nextLabel="Continue" missing="Please select a date and a time to continue." />
          </section>
        )}

        {currentStep === 2 && (
          <section className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">Select Your Setting</h1>
              <p className="mt-3 text-sm text-muted-foreground">Based on your party of {form.guests}, choose the space that fits best.</p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {config.venues.map((space) => {
                const available = form.guests <= space.seatedMax;
                const selected = form.spaceId === space.id;
                return (
                  <div key={space.id} className={cn("border rounded-sm bg-card transition-all duration-300", selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border", !available && "opacity-40")}>
                    <button disabled={!available} onClick={() => setForm({ ...form, spaceId: space.id, layout: "" })} className="w-full p-6 text-left">
                      <h2 className="font-heading text-lg font-medium text-foreground">{space.name}</h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{space.seatedMin}–{space.seatedMax} seated · {space.cocktailMin}–{space.cocktailMax} cocktail</p>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed capitalize">{space.privacy === "semi" ? "Semi-private" : space.privacy} space for private events.</p>
                      {!available && <p className="mt-3 text-xs text-destructive italic">Exceeds capacity for your party</p>}
                    </button>
                    {space.showLayouts && space.layouts.length > 0 && selected && (
                      <div className="px-6 pb-5">
                        <button onClick={() => setExpandedLayouts(expandedLayouts === space.id ? null : space.id)} className="w-full flex items-center justify-center gap-2 border border-border rounded-sm py-3 px-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                          <span>{expandedLayouts === space.id ? "Hide layout options" : "Choose your table layout"}</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", expandedLayouts === space.id && "rotate-180")} />
                        </button>
                        {expandedLayouts === space.id && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {space.layouts.map((layout) => (
                              <button key={layout} onClick={() => setForm({ ...form, layout })} className={cn("border rounded-sm px-4 py-3 text-sm text-left transition-all", form.layout === layout ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30")}>{layout}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <ActionFooter onBack={back} onNext={next} canContinue={canContinue()} nextLabel="Continue" missing="Please select a setting above to continue." />
          </section>
        )}

        {currentStep === 3 && (
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">Culinary &amp; Beverage Selection</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.menus.map((menu) => {
                const selected = form.menuId === menu.id;
                const expanded = expandedMenuId === menu.id;
                const dishCount = menu.courses.reduce((sum, course) => sum + course.items.length, 0);
                const displayPrice = isLunch && menu.hasLunchPrice ? `$${menu.lunchPrice}/pp Lunch` : `$${menu.price}/pp`;
                return (
                  <div key={menu.id} className={cn("border bg-card rounded-sm overflow-hidden transition-all duration-300", selected ? "border-primary shadow-lg" : "border-border hover:border-foreground/30")}>
                    {menu.showPhoto !== false && <img src={menu.image} alt="" className="w-full h-40 object-cover" />}
                    <div className="p-5">
                      <h2 className="font-heading text-xl font-medium text-foreground">{menu.name}</h2>
                      <p className="text-xs tracking-[0.15em] uppercase text-accent mt-1">{menu.courses.length} courses · {dishCount} dishes</p>
                      <p className="text-sm font-semibold text-foreground mt-2">{displayPrice}</p>
                      <button onClick={() => setExpandedMenuId(expanded ? null : menu.id)} className="mt-4 inline-flex items-center gap-1 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground">
                        {expanded ? "Hide details" : "View details"}<ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
                      </button>
                      {expanded && (
                        <div className="mt-4 space-y-4">
                          {menu.courses.map((course) => (
                            <div key={course.id}>
                              <p className="text-xs tracking-[0.15em] uppercase text-accent font-medium">{course.name}</p>
                              <p className="text-[10px] text-muted-foreground italic mb-1">Includes {course.items.length} option{course.items.length === 1 ? "" : "s"}{course.picks > 1 ? ` · select ${course.picks}` : ""}</p>
                              {menu.showDishes && (
                                <ul className="space-y-1 mt-1">
                                  {course.items.map((item) => (
                                    <li key={item.id} className="text-xs text-foreground/80 flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" /><span>{item.name}{item.supplement ? <span className="ml-1 inline-flex px-1.5 py-0.5 rounded-sm bg-accent/20 text-accent text-[10px] font-semibold">+${item.supplement}</span> : null}</span></li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setForm({ ...form, menuId: menu.id })} className={cn("mt-5 text-xs px-3 py-2 transition-all duration-300 rounded-sm tracking-widest uppercase font-medium", selected ? "bg-primary text-primary-foreground" : "ghost-button-primary")}>{selected ? "Selected" : "Select"}</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {config.bar.active && (
              <div className="mt-12">
                <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 text-center">Beverages</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.bar.packages.filter((pkg) => pkg.active).map((pkg) => (
                    <button key={pkg.id} onClick={() => setForm({ ...form, barId: pkg.id })} className={cn("border rounded-sm p-5 text-left transition-all duration-300", form.barId === pkg.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/30")}>
                      <h3 className="font-heading text-lg font-medium text-foreground">{pkg.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-accent">{pkg.mode === "open" ? `$${pkg.price2hr}/pp · 2 hr` : "On consumption"}</p>
                      {pkg.priceExtraHour > 0 && <p className="mt-1 text-xs text-muted-foreground">Extra hour: ${pkg.priceExtraHour}/pp</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <ActionFooter onBack={back} onNext={next} canContinue={canContinue()} nextLabel="Continue" missing="Please select a menu and beverage option to continue." />
          </section>
        )}

        {currentStep === 4 && (
          <section className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">Event Enhancements</h1>
              <p className="mt-3 text-sm text-muted-foreground">Select any add-ons to elevate your event.</p>
            </div>
            <div className="space-y-4">
              {config.addons.filter((addon) => addon.active).map((addon) => {
                const selected = form.addonIds.includes(addon.id);
                return (
                  <button key={addon.id} onClick={() => setForm({ ...form, addonIds: selected ? form.addonIds.filter((id) => id !== addon.id) : [...form.addonIds, addon.id] })} className={cn("w-full border rounded-sm p-5 text-left transition-all duration-300 flex items-center justify-between", selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/30")}>
                    <div className="flex items-center gap-4">
                      <span className={cn("w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors", selected ? "border-primary bg-primary" : "border-muted-foreground/40")}>{selected && <Check className="h-3 w-3 text-primary-foreground" />}</span>
                      <span className="text-sm font-medium text-foreground">{addon.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{addon.unit === "per-person" ? `$${addon.price}/pp` : `$${addon.price}${addon.qty > 1 ? ` × ${addon.qty}` : ""}`}</span>
                  </button>
                );
              })}
            </div>
            {config.faq.show && config.faq.items.length > 0 && (
              <div className="mt-12 border-t border-border pt-8">
                <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Frequently Asked</p>
                <Accordion type="single" collapsible className="w-full">
                  {config.faq.items.map((faq) => <AccordionItem key={faq.id} value={faq.id} className="border-border"><AccordionTrigger className="text-sm text-foreground hover:no-underline">{faq.q}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent></AccordionItem>)}
                </Accordion>
              </div>
            )}
            <ActionFooter onBack={back} onNext={next} canContinue nextLabel="Continue" />
          </section>
        )}

        {currentStep === 5 && (
          <section className="max-w-xl mx-auto">
            <div className="text-center mb-10"><h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">Quote Summary &amp; Contact</h1></div>
            <div className="border border-border rounded-sm p-6 bg-muted/30 mb-8 space-y-3">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Your Estimated Quote</p>
              <QuoteRow label="Venue" value={activeSpace?.name || "—"} />
              <QuoteRow label="Date & Time" value={`${form.date ? format(form.date, "MMM d, yyyy") : "—"} at ${form.time || "—"}`} />
              <QuoteRow label="Guests" value={`${form.guests} total`} />
              <div className="border-t border-border my-3" />
              <QuoteRow label={`${activeMenu?.name || "Menu"}${isLunch ? " (Lunch)" : ""}`} value={`$${menuPerPerson}pp × ${adultCount}`} />
              {activeBar?.mode === "open" && <QuoteRow label="Open Bar" value={`$${activeBar.price2hr}pp × ${adultCount}`} />}
              {addonsTotal > 0 && <QuoteRow label="Add-ons" value={`$${addonsTotal.toLocaleString()}`} />}
              <div className="border-t border-border my-3" />
              <QuoteRow label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
              <QuoteRow muted label={`Service Charge (${config.pricing.serviceCharge}%)`} value={`$${serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <QuoteRow muted label={`Sales Tax (${config.pricing.salesTax}%)`} value={`$${salesTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <div className="border-t border-border my-3" />
              <div className="flex justify-between text-base font-semibold"><span>Estimated Total</span><span>${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              {activeBar?.mode === "consumption" && <p className="text-xs text-accent italic">Plus Beverages on Consumption</p>}
            </div>
            <p className="text-center text-sm text-muted-foreground italic mb-8">This is an estimate to help you plan — once you submit, I'll check availability and prepare a personalized proposal for you.</p>
            <div className="space-y-5">
              <LabeledInput label="Full Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
              <LabeledInput label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
              <LabeledInput label="Phone" type="tel" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            </div>
            <ActionFooter onBack={back} onNext={() => {}} canContinue={canContinue()} nextLabel="See Availability" missing="Please complete your contact information." />
          </section>
        )}
      </main>
    </div>
  );
}

function ActionFooter({ onBack, onNext, canContinue, first, nextLabel, missing }: { onBack: () => void; onNext: () => void; canContinue: boolean; first?: boolean; nextLabel: string; missing?: string }) {
  return (
    <div className={cn("mt-10", first ? "text-center" : "flex justify-center gap-4")}> 
      {!first && <button onClick={onBack} className="ghost-button">Back</button>}
      <button onClick={onNext} disabled={!canContinue} className={cn("ghost-button-primary", !canContinue && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-primary")}>{nextLabel}</button>
      {!canContinue && missing && <p className="mt-3 text-center text-xs text-muted-foreground italic">{missing}</p>}
    </div>
  );
}

function QuoteRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className={cn("flex justify-between text-sm", muted ? "text-muted-foreground" : "text-foreground")}><span>{label}</span><span className="font-medium text-right max-w-[55%]">{value}</span></div>;
}

function LabeledInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">{label}</label>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-border bg-card px-4 py-3 text-sm rounded-sm transition-colors focus:outline-none focus:border-primary" />
    </div>
  );
}