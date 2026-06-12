import { Outlet } from "react-router-dom";
import CrmSidebar from "./CrmSidebar";
import CrmTopbar from "./CrmTopbar";
import { CrmThemeProvider } from "./CrmTheme";

export default function CrmLayout() {
  return (
    <CrmThemeProvider>
      <div className="flex min-h-screen w-full bg-[#f7f7f9] crm-dark:bg-[#0f1420] text-foreground crm-dark:text-white">
        <CrmSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CrmTopbar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </CrmThemeProvider>
  );
}
