import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";
import ContractDocument from "@/components/admin/crm/ContractDocument";

const COORDINATOR_EMAIL = "[INSERT EMAIL]";
const STAGES = ["Quote", "Contract", "Payment Auth", "Menu Header", "Confirmed"];

function call(action: string, token: string, extra: any = {}) {
  return supabase.functions.invoke("portal", { body: { action, token, ...extra } });
}

function computeStage(event: any, contract: any, paymentAuth: any, header: any) {
  if (event.contract_signed_at && paymentAuth && header && event.menu_header_at) return 4;
  if (paymentAuth && header) return 4;
  if (paymentAuth) return 3;
  if (event.contract_signed_at) return 2;
  if (contract) return 1;
  return 0;
}

export default function Portal() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0);

  const isValidToken = !!token && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);

  const refresh = async () => {
    if (!isValidToken) { setLoading(false); return; }
    const { data: res, error } = await call("get", token!);
    if (error || !res?.event) { setLoading(false); return; }
    setData(res);
    const s = computeStage(res.event, res.contract, res.paymentAuth, res.menuHeader);
    setStage(s);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [token]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!data) return <div className="min-h-screen bg-background flex items-center justify-center text-secondary">Invalid or expired link.</div>;

  const { event, contract, paymentAuth, menuHeader } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-['Market_Deco'] text-2xl text-foreground">Salumeria 104 Weston</h1>
          <p className="text-xs text-muted-foreground">Your private event portal</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10">
          {STAGES.map((label, i) => (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${i < stage ? "bg-primary border-primary text-primary-foreground" : i === stage ? "border-secondary text-secondary" : "border-border text-muted-foreground"}`}>
                  {i < stage ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
                </div>
                <span className={`text-xs mt-2 text-center ${i <= stage ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < STAGES.length - 1 && <div className={`h-px flex-1 ${i < stage ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {stage === 0 && <QuoteStage event={event} onAdvance={() => setStage(1)} />}
        {stage === 1 && <ContractStage event={event} contract={contract} token={token!} onDone={refresh} />}
        {stage === 2 && <PaymentStage token={token!} onDone={refresh} />}
        {stage === 3 && <MenuHeaderStage token={token!} onDone={refresh} />}
        {stage === 4 && <ConfirmedStage event={event} />}
      </div>
    </div>
  );
}

function Card({ children }: { children: any }) {
  return <div className="bg-card border border-border rounded-sm p-6">{children}</div>;
}

function QuoteStage({ event, onAdvance }: any) {
  const q = event.quote || {};
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Your quote</h2>
      <dl className="text-sm space-y-1.5">
        <Row k="Event date" v={`${event.event_date || "—"} ${event.event_time ? `· ${event.event_time}` : ""}`} />
        <Row k="Guests" v={String(event.guest_count)} />
        <Row k="Menu" v={`${event.menu_tier || "—"}`} />
        <Row k="Per person" v={q.menuPerPerson ? `$${q.menuPerPerson}` : "—"} />
        <Row k="Beverage" v={event.beverage_strategy === "open-bar" ? `Open bar — ${event.bar_type} (${event.bar_duration})` : event.beverage_strategy === "consumption" ? "On consumption" : "—"} />
        <div className="pt-3 border-t border-border mt-3" />
        <Row k="Subtotal" v={`$${(q.subtotal || 0).toFixed(2)}`} />
        <Row k="Service charge (23%)" v={`$${(q.serviceCharge || 0).toFixed(2)}`} />
        <Row k="Sales tax (8%)" v={`$${(q.salesTax || 0).toFixed(2)}`} />
        <Row k="Estimated total" v={`$${(q.grandTotal || 0).toFixed(2)}`} bold />
      </dl>
      <Button className="mt-6 w-full" onClick={onAdvance}>This looks right — proceed to contract</Button>
    </Card>
  );
}

function Row({ k, v, bold }: any) {
  return <div className={`flex justify-between ${bold ? "font-semibold text-foreground text-base pt-2" : "text-muted-foreground"}`}><dt>{k}</dt><dd className="text-foreground">{v}</dd></div>;
}

function ContractStage({ event, contract, token, onDone }: any) {
  const [mode, setMode] = useState<"typed" | "drawn">("typed");
  const [name, setName] = useState(event.full_name);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const isSigned = !!event.contract_signed_at;

  if (!contract) return <Card><p className="text-muted-foreground">Your contract is being prepared. Please check back shortly.</p></Card>;

  const c = contract.content || {};

  const startDraw = (e: any) => {
    const cv = canvasRef.current!; const r = cv.getBoundingClientRect();
    drawing.current = true;
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - r.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - r.top;
    const ctx = cv.getContext("2d")!; ctx.beginPath(); ctx.moveTo(x, y);
  };
  const moveDraw = (e: any) => {
    if (!drawing.current) return; e.preventDefault();
    const cv = canvasRef.current!; const r = cv.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - r.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - r.top;
    const ctx = cv.getContext("2d")!; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#2c2c2c"; ctx.lineTo(x, y); ctx.stroke();
  };
  const endDraw = () => { drawing.current = false; };
  const clearDraw = () => { const cv = canvasRef.current!; cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height); };

  const submit = async () => {
    if (!name) return toast.error("Please type your full name");
    let signatureValue: string;
    if (mode === "typed") {
      if (!typed.trim()) return toast.error("Type your signature");
      signatureValue = typed;
    } else {
      signatureValue = canvasRef.current!.toDataURL("image/png");
      if (signatureValue.length < 1000) return toast.error("Please draw your signature");
    }
    setBusy(true);
    const { error } = await call("sign-contract", token, { signatureType: mode, signatureValue, signerName: name });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Contract signed!"); onDone();
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Event contract</h2>
      <div className="bg-muted/30 border border-border rounded-sm p-5 text-sm space-y-2 max-h-96 overflow-auto">
        <p><strong>Client:</strong> {c.client}</p>
        <p><strong>Date / Time:</strong> {c.eventDate} {c.eventTime}</p>
        <p><strong>Location:</strong> {c.location}</p>
        <p><strong>Guests:</strong> {c.guestCount}</p>
        <p><strong>Menu:</strong> {c.menuTier} {c.courseChoice && `(${c.courseChoice})`}</p>
        {c.selections && Object.keys(c.selections).length > 0 && (
          <div><strong>Selections:</strong>
            <ul className="list-disc ml-5">{Object.entries(c.selections).map(([k, items]: any) => items?.length ? <li key={k}>{k}: {items.join(", ")}</li> : null)}</ul>
          </div>
        )}
        <p><strong>Beverage:</strong> {c.beverage}</p>
        {c.addons?.length > 0 && <p><strong>Add-ons:</strong> {c.addons.join(", ")}</p>}
        <div className="pt-2 border-t border-border">
          <p>Subtotal: ${c.pricing?.subtotal?.toFixed(2)}</p>
          <p>Service charge (23%): ${c.pricing?.serviceCharge?.toFixed(2)}</p>
          <p>Sales tax (8%): ${c.pricing?.salesTax?.toFixed(2)}</p>
          <p className="font-semibold">Estimated total: ${c.pricing?.grandTotal?.toFixed(2)}</p>
        </div>
        <p className="pt-2 italic">{c.paymentTerms}</p>
        <p className="text-muted-foreground">Cancellation policy: {c.cancellationPolicy}</p>
      </div>

      {isSigned ? (
        <p className="mt-4 text-primary font-medium">✓ Signed by {contract.signer_name} on {new Date(contract.signed_at).toLocaleDateString()}.</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Your full name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant={mode === "typed" ? "default" : "outline"} size="sm" onClick={() => setMode("typed")}>Type signature</Button>
            <Button variant={mode === "drawn" ? "default" : "outline"} size="sm" onClick={() => setMode("drawn")}>Draw signature</Button>
          </div>
          {mode === "typed" ? (
            <Input placeholder="Type your signature" value={typed} onChange={e => setTyped(e.target.value)} style={{ fontFamily: "cursive", fontSize: 22 }} />
          ) : (
            <div>
              <canvas ref={canvasRef} width={500} height={140} className="border border-border bg-card w-full touch-none"
                onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw} />
              <Button variant="ghost" size="sm" onClick={clearDraw} className="mt-1">Clear</Button>
            </div>
          )}
          <Button className="w-full" onClick={submit} disabled={busy}>{busy ? "Signing…" : "Sign and continue"}</Button>
        </div>
      )}
    </Card>
  );
}

function PaymentStage({ token, onDone }: any) {
  const [cardholderName, setName] = useState("");
  const [cardNumber, setNum] = useState("");
  const [expMonth, setMonth] = useState("");
  const [expYear, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await call("payment-auth", token, { cardholderName, cardNumber, expMonth, expYear });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Card authorized — nothing has been charged."); onDone();
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">Payment authorization</h2>
      <div className="bg-secondary/10 border border-secondary/40 rounded-sm p-4 text-sm text-foreground mb-5">
        <strong>Your card is not charged now.</strong> Payment is due at the end of your event after you and your guests have enjoyed the full experience.
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label>Cardholder name</Label><Input required value={cardholderName} onChange={e => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label>Card number</Label><Input required inputMode="numeric" maxLength={19} value={cardNumber} onChange={e => setNum(e.target.value)} placeholder="1234 5678 9012 3456" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>MM</Label><Input required maxLength={2} value={expMonth} onChange={e => setMonth(e.target.value)} /></div>
          <div className="space-y-2"><Label>YYYY</Label><Input required maxLength={4} value={expYear} onChange={e => setYear(e.target.value)} /></div>
          <div className="space-y-2"><Label>CVV</Label><Input required maxLength={4} value={cvv} onChange={e => setCvv(e.target.value)} /></div>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Authorizing…" : "Authorize card"}</Button>
      </form>
    </Card>
  );
}

function MenuHeaderStage({ token, onDone }: any) {
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (headerType: string, extra: any = {}) => {
    setBusy(true);
    const { error } = await call("menu-header", token, { headerType, ...extra });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Menu header submitted!"); onDone();
  };

  const onFile = (file: File) => {
    if (!/\.(png|jpe?g)$/i.test(file.name)) return toast.error("PNG or JPG only");
    const reader = new FileReader();
    reader.onload = () => submit("logo", { fileBase64: reader.result, fileName: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Menu header</h2>
      <p className="text-sm text-muted-foreground mb-5">Choose how to personalize your printed menus.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-border rounded-sm p-5">
          <h3 className="font-medium mb-2">Upload your logo</h3>
          <p className="text-xs text-muted-foreground mb-3">PNG or JPG</p>
          <input type="file" accept="image/png,image/jpeg" onChange={e => e.target.files && onFile(e.target.files[0])} disabled={busy} />
        </div>
        <div className="border border-border rounded-sm p-5">
          <h3 className="font-medium mb-2">Type a custom phrase</h3>
          <Input placeholder="e.g. Team Dinner 2026 · Acme Corp" value={phrase} onChange={e => setPhrase(e.target.value)} />
          <Button className="mt-3 w-full" size="sm" onClick={() => phrase.trim() ? submit("phrase", { value: phrase }) : toast.error("Type a phrase")} disabled={busy}>Submit phrase</Button>
        </div>
      </div>
      <div className="border-t border-border mt-5 pt-5">
        <Button variant="outline" className="w-full" onClick={() => submit("standard")} disabled={busy}>
          Use Salumeria 104 standard header — no personalization needed
        </Button>
      </div>
    </Card>
  );
}

function ConfirmedStage({ event }: any) {
  const q = event.quote || {};
  return (
    <Card>
      <h2 className="text-3xl font-['Market_Deco'] text-primary text-center my-4">You're all set!</h2>
      <p className="text-center text-muted-foreground mb-6">We can't wait to host you at Salumeria 104 Weston.</p>
      <div className="bg-muted/30 border border-border rounded-sm p-5 text-sm space-y-1.5">
        <Row k="Date / Time" v={`${event.event_date || "—"} ${event.event_time || ""}`} />
        <Row k="Location" v="Weston · 1370 Weston Rd" />
        <Row k="Guests" v={String(event.guest_count)} />
        <Row k="Menu" v={event.menu_tier || "—"} />
        <Row k="Estimated total" v={`$${(q.grandTotal || 0).toFixed(2)}`} bold />
      </div>
      <p className="text-sm text-muted-foreground mt-6 text-center">
        Your dedicated event coordinator is <strong className="text-foreground">Julie</strong>.<br />
        Contact her at <strong className="text-foreground">{COORDINATOR_EMAIL}</strong> for any questions.
      </p>
    </Card>
  );
}
