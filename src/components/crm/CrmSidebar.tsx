import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, MessageSquare, CalendarCheck, Users, UtensilsCrossed, Settings as Cog, Settings, Languages } from "lucide-react";

const nav = [
  { to: "/crm", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/crm/calendar", label: "Calendar", icon: Calendar, end: false },
  { to: "/crm/discussions", label: "Discussions", icon: MessageSquare, end: false },
  { to: "/crm/events", label: "Events", icon: CalendarCheck, end: false },
  { to: "/crm/contacts", label: "Contacts", icon: Users, end: false },
  { to: "/crm/menus", label: "Menus", icon: UtensilsCrossed, end: false },
  { to: "/crm/settings", label: "Settings", icon: Cog, end: false },
];

export default function CrmSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-[145px] shrink-0 bg-[#161e2b] text-white flex flex-col min-h-screen">
      <div className="px-4 pt-5 pb-6">
        <div className="font-bold leading-tight text-[15px]">Smart Event<br />360</div>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {nav.map((item) => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-[13px] transition-colors ${
                active ? "bg-[#9b7fc7] text-white" : "text-white/80 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-4 flex items-center gap-3 text-white/60">
        <Settings className="h-4 w-4" />
        <Languages className="h-4 w-4" />
      </div>
    </aside>
  );
}
