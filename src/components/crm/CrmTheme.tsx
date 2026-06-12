import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Mode = "light" | "dark";
const Ctx = createContext<{ mode: Mode; toggle: () => void }>({ mode: "light", toggle: () => {} });

export function CrmThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() =>
    (typeof window !== "undefined" && localStorage.getItem("crm-theme") as Mode) || "light"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("crm-dark", mode === "dark");
    localStorage.setItem("crm-theme", mode);
    return () => document.documentElement.classList.remove("crm-dark");
  }, [mode]);
  return (
    <Ctx.Provider value={{ mode, toggle: () => setMode((m) => (m === "light" ? "dark" : "light")) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCrmTheme = () => useContext(Ctx);
