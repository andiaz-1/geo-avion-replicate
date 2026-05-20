import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingData, menus, MenuCourse, KIDS_MENU_PRICE, isLunchPricing } from "@/lib/booking-data";
import { Info, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BeverageSection from "./BeverageSection";

interface StepMenuProps {
  data: BookingData;
  onChange: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DishInfo = ({ name, info, description }: { name: string; info: string; description?: string }) => {
  const [open, setOpen] = useState(false);
  const popoverText = description || info;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="inline-flex text-accent hover:text-primary transition-colors"
          aria-label={`What is ${name}?`}
        >
          <Info className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-xs font-body p-3 whitespace-pre-line" side="top">
        {popoverText}
      </PopoverContent>
    </Popover>
  );
};

interface CourseSelectionProps {
  course: MenuCourse;
  selections: string[];
  onToggle: (courseName: string, itemName: string) => void;
  isSelected: boolean;
}

const CourseSelection = ({ course, selections, onToggle, isSelected }: CourseSelectionProps) => {
  const hasSelectCount = course.selectCount !== undefined && course.selectCount > 0;
  const isFull = hasSelectCount && selections.length >= course.selectCount!;

  return (
    <div>
      <p className="text-xs font-body tracking-[0.15em] uppercase text-accent font-medium">
        {course.name}
      </p>
      {course.note && (
        <p className="text-[10px] font-body text-muted-foreground italic mb-1">
          {course.note}
        </p>
      )}

      {hasSelectCount && isSelected ? (
        <div className="space-y-1.5 mt-1">
          {course.items.map((item) => {
            const isChosen = selections.includes(item.name);
            const isDisabled = !isChosen && isFull;

            return (
              <button
                key={item.name}
                onClick={(e) => { e.stopPropagation(); if (!isDisabled) onToggle(course.name, item.name); }}
                className={cn(
                  "w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-sm border text-xs font-body transition-all duration-200",
                  isChosen
                    ? "border-primary bg-primary/10 text-foreground"
                    : isDisabled
                      ? "border-border/50 text-muted-foreground/50 cursor-not-allowed"
                      : "border-border text-foreground/80 hover:border-foreground/30"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                  isChosen ? "bg-primary border-primary" : "border-muted-foreground/40"
                )}>
                  {isChosen && <Check className="h-3 w-3 text-primary-foreground" />}
                </span>
                <span className="flex-1 flex items-center gap-1">
                  {item.name}
                  {item.supplement && (
                    <span className="inline-flex px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-semibold tracking-wide">
                      {item.supplement}
                    </span>
                  )}
                  <DishInfo name={item.name} info={item.info} description={item.description} />
                </span>
              </button>
            );
          })}
          <p className="text-[10px] font-body text-muted-foreground mt-1">
            {selections.length} of {course.selectCount} selected
          </p>
        </div>
      ) : (
        <ul className="space-y-1 mt-1">
          {course.items.map((item) => (
            <li key={item.name} className="text-xs font-body text-foreground/80">
              <div className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                <span className="inline-flex items-center gap-1">
                  {item.name}
                  {item.supplement && (
                    <span className="inline-flex px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-semibold tracking-wide">
                      {item.supplement}
                    </span>
                  )}
                  <DishInfo name={item.name} info={item.info} description={item.description} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const StepMenu = ({ data, onChange, onNext, onBack }: StepMenuProps) => {
  const lunchActive = isLunchPricing(data.time);

  const handleToggleItem = useCallback((courseName: string, itemName: string) => {
    const selections = data.menuSelections || {};
    const current = selections[courseName] || [];
    const menu = menus.find((m) => m.id === data.menu);
    const course = menu?.courses?.find((c) => c.name === courseName);
    const maxCount = course?.selectCount || 999;

    let updated: string[];
    if (current.includes(itemName)) {
      updated = current.filter((n) => n !== itemName);
    } else if (current.length < maxCount) {
      updated = [...current, itemName];
    } else {
      return;
    }
    onChange({ menuSelections: { ...data.menuSelections, [courseName]: updated } });
  }, [data.menuSelections, data.menu, onChange]);

  const selectedMenu = menus.find((m) => m.id === data.menu);
  const needsCourseChoice = false; // Classico has all three courses on Weston menu
  const courseSelectionsComplete = (() => {
    if (data.decideLater) return true;
    if (!selectedMenu?.courses) return true;
    const selections = data.menuSelections || {};
    return selectedMenu.courses.every((course) => {
      if (!course.selectCount) return true;
      return (selections[course.name]?.length || 0) >= course.selectCount;
    });
  })();

  const isValid = data.menu && data.beverageStrategy && (
    data.beverageStrategy === "consumption" ||
    (data.barType && data.barDuration)
  ) && courseSelectionsComplete;

  const missingMenu: string[] = [];
  if (!data.menu) missingMenu.push("a menu");
  if (data.menu && !courseSelectionsComplete && selectedMenu?.courses) {
    const incomplete = selectedMenu.courses
      .filter((c) => c.selectCount && (data.menuSelections?.[c.name]?.length || 0) < c.selectCount)
      .map((c) => `${c.selectCount} ${c.name}`);
    if (incomplete.length) missingMenu.push(`your dish picks (${incomplete.join(", ")})`);
  }
  if (!data.beverageStrategy) missingMenu.push("a beverage option");
  if (data.beverageStrategy === "open-bar" && (!data.barType || !data.barDuration)) {
    missingMenu.push("your open bar type and duration");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-10">
        <p className="text-sm font-body tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Step 3
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Culinary & Beverage Selection
        </h2>
        {data.hasKids && data.kidsCount > 0 && (
          <p className="mt-2 text-sm text-accent font-body">
            Children's menu: ${KIDS_MENU_PRICE}/child (flat rate, all menus)
          </p>
        )}
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menus.filter((menu) => !menu.lunchOnly || lunchActive).map((menu) => {
          const showLunchPrice = lunchActive && menu.lunchPrice;
          const displayPrice = showLunchPrice ? menu.lunchPriceLabel : menu.priceLabel;
          const isMenuSelected = data.menu === menu.id;

          return (
            <motion.div
              key={menu.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "border bg-card rounded-sm overflow-hidden transition-all duration-300",
                isMenuSelected
                  ? "border-primary shadow-lg"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <div className="p-5">
                <h3 className="font-heading text-xl font-medium text-foreground">{menu.name}</h3>
                <p className="text-xs font-body tracking-[0.15em] uppercase text-accent mt-1">
                  {menu.tagline}
                </p>
                <p className="font-body text-sm font-semibold text-foreground mt-2">
                  {displayPrice}
                </p>

                {menu.courses ? (
                  <div className="mt-3 space-y-4">
                    {menu.courses.map((course) => (
                      <CourseSelection
                        key={course.name}
                        course={course}
                        selections={data.menuSelections[course.name] || []}
                        onToggle={handleToggleItem}
                        isSelected={false}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mt-3 font-body leading-relaxed">
                      {menu.description}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {menu.highlights.map((h) => (
                        <li key={h.name} className="text-xs font-body text-foreground/70 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                          <span className="inline-flex items-center gap-1">
                            {h.name}
                            <DishInfo name={h.name} info={h.info} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onChange({
                      menu: menu.id,
                      courseChoice: "",
                      menuSelections: {},
                      decideLater: true,
                    })}
                    className={cn(
                      "text-xs px-3 py-2 transition-all duration-300 rounded-sm tracking-widest uppercase font-body font-medium",
                      isMenuSelected
                        ? "bg-primary text-primary-foreground"
                        : "ghost-button-primary"
                    )}
                  >
                    {isMenuSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {data.menu && selectedMenu?.courses && data.decideLater && (
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground font-body italic">
            Our event coordinator will help you finalize your dish selections.
          </p>
        </div>
      )}

      {/* Allergen / Dietary */}
      <div className="mt-10 max-w-xl mx-auto">
        <label className="block text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Any Allergies or Dietary Restrictions?
        </label>
        <textarea
          value={data.allergens}
          onChange={(e) => onChange({ allergens: e.target.value })}
          rows={2}
          placeholder="e.g., nut allergy, gluten-free, vegetarian, shellfish allergy..."
          className="w-full border border-border bg-card px-4 py-3 text-sm font-body rounded-sm transition-colors hover:border-foreground/50 focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground/50"
        />
      </div>

      <BeverageSection data={data} onChange={onChange} />

      <div className="mt-10 pb-8 flex justify-center gap-4">
        <button onClick={onBack} className="ghost-button">Back</button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "ghost-button-primary",
            !isValid && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-primary"
          )}
        >
          Continue
        </button>
      </div>
      {!isValid && missingMenu.length > 0 && (
        <p className="mb-8 text-center text-xs text-muted-foreground font-body italic">
          Please select {missingMenu.join(" and ")} to continue.
        </p>
      )}
    </motion.div>
  );
};

export default StepMenu;
