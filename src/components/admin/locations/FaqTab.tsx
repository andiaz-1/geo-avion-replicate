import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CrudList from "./CrudList";

interface Faq { id: string; location_id: string; question: string; answer: string; category: string | null; sort_order: number; }

export default function FaqTab({ locationId }: { locationId: string }) {
  return (
    <CrudList<Faq>
      table="location_faqs"
      locationId={locationId}
      title="FAQ"
      description="Shown on the booking page and client portal."
      emptyText="No FAQ entries yet."
      defaults={{ question: "", answer: "", category: "" } as any}
      renderRow={(f) => (
        <div>
          <div className="font-medium">{f.question}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{f.answer}</div>
        </div>
      )}
      renderForm={(form, setForm) => (
        <div className="space-y-4">
          <div><Label>Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
          <div><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
          <div><Label>Category (optional)</Label><Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Pricing / Logistics / Menu / …" /></div>
        </div>
      )}
    />
  );
}
