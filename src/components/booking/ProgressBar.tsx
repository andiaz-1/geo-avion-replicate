import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const DOTS = [
  { label: "Your Date", step: 1 },
  { label: "Your Space", step: 2 },
  { label: "Your Menu", step: 3 },
  { label: "Your Proposal", step: 4 }, // covers funnel steps 4 and 5
];

const ProgressBar = ({ currentStep }: ProgressBarProps) => {
  // Map funnel step (1-5) to dot index (1-4): steps 4 and 5 both map to dot 4.
  const activeDot = currentStep >= 4 ? 4 : currentStep;

  return (
    <div className="w-full px-4 pt-10 pb-4">
      <div className="max-w-lg mx-auto flex items-start justify-between relative">
        {DOTS.map((d, i) => {
          const filled = d.step <= activeDot;
          const isLast = i === DOTS.length - 1;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center relative min-w-0">
              {/* connector line to next dot */}
              {!isLast && (
                <div className="absolute top-[9px] left-[calc(50%+10px)] right-[calc(-50%+10px)] h-px bg-border -z-0" />
              )}
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: filled ? "hsl(var(--foreground))" : "hsl(var(--background))",
                  borderColor: filled ? "hsl(var(--foreground))" : "hsl(var(--border))",
                }}
                transition={{ duration: 0.3 }}
                className="relative z-10 w-5 h-5 rounded-full border-2"
              />
              <span
                className={cn(
                  "mt-3 text-[10px] md:text-[11px] font-body tracking-[0.18em] uppercase text-center whitespace-nowrap transition-colors",
                  filled ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
