import { Search, Plus, Bell, Moon, Sun, X } from "lucide-react";
import { useCrmTheme } from "./CrmTheme";
import { useCrm } from "@/data/crmStore";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CrmTopbar() {
  const { mode, toggle } = useCrmTheme();
  const { notifications } = useCrm();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = notifications.length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 crm-dark:bg-[#1a2230] crm-dark:border-white/10 relative">
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

        <div className="relative" ref={ref}>
          <button onClick={() => setOpen((o) => !o)} className="relative p-2 rounded-md hover:bg-muted/60 crm-dark:hover:bg-white/10">
            <Bell className="h-5 w-5 text-foreground crm-dark:text-white" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-border rounded-lg shadow-lg z-50 crm-dark:bg-[#1a2230] crm-dark:border-white/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border crm-dark:border-white/10">
                <span className="font-semibold text-sm">Notifications</span>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted/50 rounded"><X className="h-3.5 w-3.5" /></button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-sm text-muted-foreground text-center">All caught up ✓</p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { navigate(n.href); setOpen(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-muted/30 crm-dark:hover:bg-white/5 border-b border-border crm-dark:border-white/10 last:border-0"
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        n.kind === "lead" ? "bg-red-500" : n.kind === "followup" ? "bg-amber-500" : "bg-[#9b7fc7]"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{n.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{n.detail}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={toggle} className="p-2 rounded-md hover:bg-muted/60 crm-dark:hover:bg-white/10">
          {mode === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-white" />}
        </button>
        <div className="h-8 w-8 rounded-full bg-[#9b7fc7] text-white flex items-center justify-center text-xs font-semibold">JD</div>
      </div>
    </header>
  );
}
