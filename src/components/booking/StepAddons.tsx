import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, addonPrices } from "@/lib/booking-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

interface StepAddonsProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FaqItem {
  q: string;
  a: string;
  checkKey?: "bringingCake" | "bringingDecor";
  checkLabel?: string;
}

const baseFaqs: FaqItem[] = [
  {
    q: "Can I bring a cake?",
    a: "Absolutely! You're welcome to bring your own cake at no extra charge.",
    checkKey: "bringingCake",
    checkLabel: "I will bring my own cake",
  },
  {
    q: "Can I bring my own decorations?",
    a: "Yes — you may bring any décor you'd like, as long as there are no open-flame candles. LED candles are perfectly fine.",
    checkKey: "bringingDecor",
    checkLabel: "I will bring my own decorations",
  },
  {
    q: "Can I arrive early to set up?",
    a: "Guests may arrive up to 1.5 hours before the event to set up décor. If you think you'll need more time, just let us know and we'll do our best to accommodate.",
  },
  {
    q: "Do you accommodate pharma and corporate compliance requirements?",
    a: "Yes — our team is familiar with pharma and corporate venue compliance. Please ask us about specific requirements when requesting your quote.",
  },
];

const kidsFaq: FaqItem = {
  q: "Can I offer my children a simpler pasta option?",
  a: "Yes! Our children's menu includes kid-friendly pasta options that are perfect for younger guests.",
};

const allergyFaq: FaqItem = {
  q: "How do you handle allergies and dietary restrictions?",
  a: "Once at the restaurant, our team will present you with the available choices that accommodate your dietary needs. We always do our best to offer alternatives based on what's available at the time.",
};

const StepAddons = ({ data, onChange, onNext, onBack }: StepAddonsProps) => {
  const faqs = [
    ...baseFaqs,
    ...(data.hasKids && data.kidsCount > 0 ? [kidsFaq] : []),
    ...(data.allergens?.trim() ? [allergyFaq] : []),
  ];

  const toggleAddon = (key: keyof BookingData["addons"]) => {
    const newAddons = { ...data.addons, [key]: !data.addons[key] };
    if (key === "liveMusic" && newAddons.liveMusic) newAddons.ownMusician = false;
    if (key === "ownMusician" && newAddons.ownMusician) newAddons.liveMusic = false;
    onChange({ addons: newAddons });
  };

  const addonEntries: { key: keyof BookingData["addons"]; info: typeof addonPrices.tablecloths }[] = [
    { key: "tablecloths", info: addonPrices.tablecloths },
    { key: "avSpeaker", info: addonPrices.avSpeaker },
    { key: "liveMusic", info: addonPrices.liveMusic },
    { key: "ownMusician", info: addonPrices.ownMusician },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Event Enhancements
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-body">
          Select any add-ons to elevate your event.
        </p>
      </div>

      <div className="space-y-4">
        {addonEntries.map(({ key, info }) => (
          <button
            key={key}
            onClick={() => toggleAddon(key)}
            className={cn(
              "w-full border rounded-sm p-5 text-left transition-all duration-300 flex items-center justify-between",
              data.addons[key]
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-foreground/30"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors",
                  data.addons[key]
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                )}
              >
                {data.addons[key] && (
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-body text-sm font-medium text-foreground">{info.label}</span>
            </div>
            <span className="font-body text-xs text-muted-foreground">{info.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <p className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Frequently Asked
        </p>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="font-body text-sm text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground">
                <p>{faq.a}</p>
                {"checkKey" in faq && faq.checkKey && (
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <Checkbox
                      checked={data[faq.checkKey]}
                      onCheckedChange={(checked) =>
                        onChange({ [faq.checkKey]: !!checked })
                      }
                    />
                    <span className="text-sm font-body text-foreground font-medium">
                      {faq.checkLabel}
                    </span>
                  </label>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button onClick={onBack} className="ghost-button">Back</button>
        <button onClick={onNext} className="ghost-button-primary">
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default StepAddons;
