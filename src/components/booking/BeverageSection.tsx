import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, barPackages, openBarSelections } from "@/lib/booking-data";
import { ChevronDown } from "lucide-react";

interface BeverageSectionProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
}

const isPrivateOrBuyout = (data: BookingData) =>
  data.wantsPrivateRoom || (data.venue === "Main Room" && data.guestCount >= 45);

const BeverageSection = ({ data, onChange }: BeverageSectionProps) => {
  const [showDrinkMenu, setShowDrinkMenu] = useState(false);

  const handleBeverageStrategy = (strategy: "open-bar" | "consumption") => {
    if (strategy === "consumption") {
      onChange({ beverageStrategy: strategy, barType: "", barDuration: "" });
    } else {
      onChange({ beverageStrategy: strategy });
    }
  };

  return (
    <div className="mt-10 max-w-xl mx-auto">
      <h3 className="font-heading text-2xl font-medium text-foreground text-center mb-6">
        Beverage Strategy
      </h3>
      <p className="text-xs text-center text-muted-foreground font-body mb-6 tracking-[0.15em] uppercase">
        Selection Required
      </p>

      <div className="space-y-4">
        {/* Option A: Open Bar */}
        <button
          onClick={() => handleBeverageStrategy("open-bar")}
          className={cn(
            "w-full border rounded-sm p-5 text-left transition-all duration-300",
            data.beverageStrategy === "open-bar"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-foreground/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
              data.beverageStrategy === "open-bar" ? "border-primary" : "border-muted-foreground/40"
            )}>
              {data.beverageStrategy === "open-bar" && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="font-body text-sm font-medium text-foreground">Open Bar Package</span>
          </div>
          {data.beverageStrategy === "open-bar" && (
            <p className="mt-2 ml-7 text-xs text-muted-foreground font-body italic">
              All guests in the party must participate — includes non-alcoholic options.
            </p>
          )}
        </button>

        <AnimatePresence>
          {data.beverageStrategy === "open-bar" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border border-border rounded-sm p-5 bg-card ml-4 space-y-5">
                <div>
                  <p className="text-xs font-body tracking-[0.15em] uppercase text-muted-foreground mb-3">
                    Bar Type
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {(["beer-wine", "full-bar"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => onChange({ barType: type })}
                        className={cn(
                          "border rounded-sm p-3 text-center text-xs font-body transition-all duration-300",
                          data.barType === type
                            ? "border-primary bg-primary/5 text-foreground font-medium"
                            : "border-border text-muted-foreground hover:border-foreground/30"
                        )}
                      >
                        {barPackages[type].label}
                      </button>
                    ))}
                  </div>
                </div>

                {data.barType && (
                  <div>
                    <p className="text-xs font-body tracking-[0.15em] uppercase text-muted-foreground mb-3">
                      Duration
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["2hr", "3hr"] as const).map((dur) => (
                        <button
                          key={dur}
                          onClick={() => onChange({ barDuration: dur })}
                          className={cn(
                            "border rounded-sm p-3 text-center text-xs font-body transition-all duration-300",
                            data.barDuration === dur
                              ? "border-primary bg-primary/5 text-foreground font-medium"
                              : "border-border text-muted-foreground hover:border-foreground/30"
                          )}
                        >
                          {dur} — ${barPackages[data.barType][dur]}pp
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {data.barDuration === "2hr" && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-body text-muted-foreground italic mt-3"
                        >
                          After the 2-hour open bar period, any additional beverages will be added to a master tab billed to the host.
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {data.barDuration === "3hr" && isPrivateOrBuyout(data) && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-body text-accent italic mt-3"
                        >
                          ✦ 3-hour Open Bar + Private Room / Buyout — complimentary coffee included.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <p className="text-xs font-body text-muted-foreground border-t border-border pt-3">
                  Coffee & bottled water are not included in the open bar and will be billed separately.
                </p>

                <div>
                  <button
                    onClick={() => setShowDrinkMenu(!showDrinkMenu)}
                    className="flex items-center gap-2 text-xs font-body text-accent hover:text-primary transition-colors"
                  >
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showDrinkMenu && "rotate-180")} />
                    {showDrinkMenu ? "Hide" : "View"} Open Bar Selections
                  </button>

                  <AnimatePresence>
                    {showDrinkMenu && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-4 text-xs font-body">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="tracking-[0.15em] uppercase text-accent font-medium mb-1.5">Rosso</p>
                              {openBarSelections.rosso.map((w) => (
                                <p key={w.name} className="text-foreground/80">
                                  {w.name} <span className="text-muted-foreground">({w.region})</span>
                                </p>
                              ))}
                            </div>
                            <div>
                              <p className="tracking-[0.15em] uppercase text-accent font-medium mb-1.5">Bianchi</p>
                              {openBarSelections.bianchi.map((w) => (
                                <p key={w.name} className="text-foreground/80">
                                  {w.name} <span className="text-muted-foreground">({w.region})</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="tracking-[0.15em] uppercase text-accent font-medium mb-1.5">Sparkling</p>
                              {openBarSelections.sparkling.map((w) => (
                                <p key={w.name} className="text-foreground/80">
                                  {w.name} <span className="text-muted-foreground">({w.region})</span>
                                </p>
                              ))}
                            </div>
                            <div>
                              <p className="tracking-[0.15em] uppercase text-accent font-medium mb-1.5">Beer</p>
                              {openBarSelections.beer.map((b) => (
                                <p key={b.name} className="text-foreground/80">
                                  {b.name}
                                  {b.detail && <span className="text-muted-foreground block">{b.detail}</span>}
                                </p>
                              ))}
                            </div>
                          </div>

                          {data.barType === "full-bar" && (
                            <div>
                              <p className="tracking-[0.15em] uppercase text-accent font-medium mb-1.5">Cocktails</p>
                              <div className="space-y-1.5">
                                {openBarSelections.cocktails.map((c) => (
                                  <p key={c.name} className="text-foreground/80">
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-muted-foreground block ml-2">{c.ingredients}</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="tracking-[0.15em] uppercase text-accent font-medium mb-1.5">Soft Drinks</p>
                              <p className="text-foreground/80">{openBarSelections.softDrinks.join(", ")}</p>
                            </div>
                            <div>
                              <p className="tracking-[0.15em] uppercase text-accent font-medium mb-1.5">Non-Alcoholic</p>
                              <p className="text-foreground/80">{openBarSelections.nonAlcoholic.join(", ")}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => handleBeverageStrategy("consumption")}
          className={cn(
            "w-full border rounded-sm p-5 text-left transition-all duration-300",
            data.beverageStrategy === "consumption"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-foreground/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
              data.beverageStrategy === "consumption" ? "border-primary" : "border-muted-foreground/40"
            )}>
              {data.beverageStrategy === "consumption" && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="font-body text-sm font-medium text-foreground">Drinks on Consumption</span>
          </div>
        </button>

        <AnimatePresence>
          {data.beverageStrategy === "consumption" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border border-border rounded-sm p-4 bg-muted/50 ml-4">
                <p className="text-sm font-body text-foreground/80 italic">
                  Beverages will be charged per drink to the final tab. A credit card authorization is required for this option.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BeverageSection;
