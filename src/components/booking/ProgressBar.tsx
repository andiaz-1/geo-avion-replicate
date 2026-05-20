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
    <div className="w-full px-4 pt-8 pb-2">
      <div className="max-w-md mx-auto flex items-start justify-between">
        {DOTS.map((d, i) => {
          const filled = d.step <= activeDot;
          const isLast = i === DOTS.length - 1;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center relative">
              {/* connector line to next dot */}
              {!isLast && (
                <div className="absolute top-[7px] left-1/2 w-full h-px bg-border -z-0" />
              )}
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: filled ? "hsl(var(--foreground))" : "hsl(var(--background))",
                  borderColor: filled ? "hsl(var(--foreground))" : "hsl(var(--border))",
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "relative z-10 w-3.5 h-3.5 rounded-full border"
                )}
              />
              <span
                className={cn(
                  "mt-2 text-[10px] md:text-xs font-body tracking-[0.15em] uppercase text-center transition-colors",
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
