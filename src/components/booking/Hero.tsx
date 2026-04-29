import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-antipasto.jpg";
import { LOCATION } from "@/lib/location";

interface HeroProps {
  onStart: () => void;
}

const Hero = ({ onStart }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Italian antipasto spread"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-xs font-subtitle tracking-[0.4em] uppercase text-card/70 mb-4">
            Private Events & Celebrations
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-medium text-card leading-tight">
            {LOCATION.brand}
          </h1>
          <p className="mt-3 text-xs font-subtitle tracking-[0.35em] uppercase text-card/70">
            {LOCATION.city}
          </p>
          <div className="w-20 h-[1px] bg-card/40 mx-auto mt-6 mb-6" />
          <p className="font-subtitle text-sm sm:text-base text-card/80 leading-relaxed max-w-md mx-auto italic">
            Host your next celebration in the heart of Weston's most authentic Italian dining experience.
          </p>
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-10 border border-card/50 bg-transparent text-card px-8 py-4 text-sm font-body font-medium tracking-[0.25em] uppercase rounded-sm hover:bg-card hover:text-foreground transition-all duration-300"
          >
            Plan Your Event
          </motion.button>

          <Link
            to="/spaces"
            className="block mt-5 text-[11px] tracking-[0.3em] uppercase text-card/70 hover:text-card font-body underline-offset-4 hover:underline transition-colors"
          >
            View Spaces & Floor Plan
          </Link>

          <p className="mt-10 text-[11px] tracking-[0.25em] uppercase text-card/60 font-body">
            {LOCATION.addressShort}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
