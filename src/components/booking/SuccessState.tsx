import { motion } from "framer-motion";
import { LOCATION } from "@/lib/location";

const SuccessState = () => {
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
          GRAZIE!
        </h2>
        <div className="w-16 h-[1px] bg-primary mx-auto mt-6 mb-6" />
        <p
          className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto"
          style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
        >
          I'm {LOCATION.coordinator.name.split(" ")[0]}, {LOCATION.coordinator.title} at {LOCATION.brand} {LOCATION.city}. I just sent you an email — <strong className="font-semibold text-foreground">please check your spam folder</strong>.
        </p>

        <div className="w-16 h-[1px] bg-border mx-auto mt-8 mb-6" />

        <div className="space-y-4 max-w-md mx-auto">
          <p
            className="text-base md:text-lg text-foreground leading-relaxed"
            style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
          >
            Did you know we also create <span className="italic">customized menus</span> at no extra cost?
          </p>
          <a
            href={LOCATION.menuCustomizationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm tracking-[0.2em] uppercase text-primary hover:underline"
            style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
          >
            See Customization Examples →
          </a>

          <p
            className="text-base md:text-lg text-foreground leading-relaxed pt-4"
            style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
          >
            Loved by our guests — leave us a review on Google.
          </p>
          <a
            href={LOCATION.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm tracking-[0.2em] uppercase text-primary hover:underline"
            style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
          >
            Read Our Reviews →
          </a>
        </div>

        <div className="w-16 h-[1px] bg-border mx-auto mt-8 mb-6" />

        <div
          className="space-y-1 text-sm text-muted-foreground"
          style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
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

        <p
          className="text-sm text-muted-foreground mt-8 tracking-[0.15em] uppercase"
          style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
        >
          We look forward to hosting you
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SuccessState;
