import { motion } from "framer-motion";
import { LOCATION } from "@/lib/location";

interface SuccessStateProps {
  portalUrl?: string | null;
  firstName?: string;
  eventDate?: string;
}

const SuccessState = ({ firstName, eventDate }: SuccessStateProps) => {
  const name = (firstName || "").trim();
  const serif = 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto text-center py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2
          className="text-5xl md:text-6xl font-medium text-foreground italic"
          style={{ fontFamily: '"Eleventh", "Market Deco", Georgia, serif' }}
        >
          GRAZIE{name ? `, ${name}` : ""}!
        </h2>
        <div className="w-16 h-[1px] bg-primary mx-auto mt-6 mb-6" />
        <p
          className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto"
          style={{ fontFamily: serif }}
        >
          I'm {LOCATION.coordinator.name.split(" ")[0]}, your {LOCATION.coordinator.title.toLowerCase()} at {LOCATION.brand} {LOCATION.city}. I've received your request{eventDate ? ` for ${eventDate}` : ""} and I'm personally reviewing availability for you. I'll confirm and unlock your booking portal within 2 hours.
        </p>

        <div className="w-16 h-[1px] bg-border mx-auto mt-8 mb-6" />

        <div className="space-y-4 max-w-md mx-auto">
          <p
            className="text-base md:text-lg text-foreground leading-relaxed"
            style={{ fontFamily: serif }}
          >
            In the meantime — did you know we create <span className="italic">customized printed menus with your logo</span> at no extra cost?
          </p>
          <a
            href={LOCATION.menuCustomizationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm tracking-[0.2em] uppercase text-primary hover:underline"
            style={{ fontFamily: serif }}
          >
            See Customization Examples →
          </a>

          <p
            className="text-base md:text-lg text-foreground leading-relaxed pt-4"
            style={{ fontFamily: serif }}
          >
            Loved by our guests — <span className="italic">4.8 ★ on Google</span>
          </p>
          <a
            href={LOCATION.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm tracking-[0.2em] uppercase text-primary hover:underline"
            style={{ fontFamily: serif }}
          >
            Read Our Reviews →
          </a>
        </div>

        <div className="w-16 h-[1px] bg-border mx-auto mt-8 mb-6" />

        <div
          className="space-y-1 text-sm text-muted-foreground"
          style={{ fontFamily: serif }}
        >
          <p className="text-foreground font-medium">{LOCATION.brand} · {LOCATION.city}</p>
          <p>{LOCATION.addressLine}</p>
          <p>
            <a href={`mailto:${LOCATION.coordinator.email}`} className="hover:underline">
              {LOCATION.coordinator.email}
            </a>
            {" · "}
            <a href={`tel:${LOCATION.coordinator.phoneTel}`} className="hover:underline">
              {LOCATION.coordinator.phone}
            </a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessState;
