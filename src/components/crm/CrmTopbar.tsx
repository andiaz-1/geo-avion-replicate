import { Search, Plus, Bell, Moon, Sun } from "lucide-react";
import { useCrmTheme } from "./CrmTheme";

export default function CrmTopbar() {
  const { mode, toggle } = useCrmTheme();
  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 crm-dark:bg-[#1a2230] crm-dark:border-white/10">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#9b7fc7] crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white"
          placeholder="Search leads, events, contacts..."
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 bg-[#161e2b] text-white text-sm px-3 py-2 rounded-md hover:bg-[#222c3d]">
          <Plus className="h-4 w-4" /> New Event
        </button>
        <button className="relative p-2 rounded-md hover:bg-muted/60 crm-dark:hover:bg-white/10">
          <Bell className="h-5 w-5 text-foreground crm-dark:text-white" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button onClick={toggle} className="p-2 rounded-md hover:bg-muted/60 crm-dark:hover:bg-white/10">
          {mode === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-white" />}
        </button>
        <div className="h-8 w-8 rounded-full bg-[#9b7fc7] text-white flex items-center justify-center text-xs font-semibold">JD</div>
      </div>
    </header>
  );
}
