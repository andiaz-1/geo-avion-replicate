import { ReactNode } from "react";

export function CrmCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-border p-5 crm-dark:bg-[#1a2230] crm-dark:border-white/10 ${className}`}>
      {children}
    </div>
  );
}

export function CrmPageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-bold text-foreground crm-dark:text-white mb-5">{children}</h1>;
}

export function CrmSelect({ value, options }: { value: string; options?: string[] }) {
  return (
    <select
      defaultValue={value}
      className="text-xs px-3 py-1.5 rounded-md border border-border bg-white crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white"
    >
      {(options || [value]).map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

export function CrmButton({
  children, variant = "primary", className = "", onClick,
}: {
  children: ReactNode;
  variant?: "primary" | "dark" | "outline" | "danger" | "ghost";
  className?: string;
  onClick?: () => void;
}) {
  const variants = {
    primary: "bg-[#9b7fc7] hover:bg-[#8a6db7] text-white",
    dark: "bg-[#161e2b] hover:bg-[#222c3d] text-white",
    outline: "border border-border bg-white hover:bg-muted/50 text-foreground crm-dark:bg-[#11161f] crm-dark:border-white/10 crm-dark:text-white",
    danger: "border border-red-300 text-red-600 hover:bg-red-50",
    ghost: "hover:bg-muted/60 text-foreground crm-dark:text-white crm-dark:hover:bg-white/10",
  };
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md transition-colors ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function CrmTH({ children }: { children: ReactNode }) {
  return (
    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-muted/30 crm-dark:bg-white/5 crm-dark:text-white/60">
      {children}
    </th>
  );
}

export function CrmTD({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm align-top ${className}`}>{children}</td>;
}

export function Avatar({ name, color = "#9b7fc7" }: { name: string; color?: string }) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ background: color }}>
      {initials}
    </div>
  );
}
