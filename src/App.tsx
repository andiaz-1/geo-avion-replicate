import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Spaces from "./pages/Spaces.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import Portal from "./pages/Portal.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import EventFormPage from "./pages/EventFormPage.tsx";
import LocationsPage from "./pages/admin/Locations.tsx";
import LocationSettings from "./pages/admin/LocationSettings.tsx";
import CrmLayout from "./components/crm/CrmLayout.tsx";
import CrmDashboard from "./pages/crm/Dashboard.tsx";
import CrmLeads from "./pages/crm/Leads.tsx";
import CrmEvents from "./pages/crm/Events.tsx";
import CrmEventDetail from "./pages/crm/EventDetailCrm.tsx";
import CrmCalendar from "./pages/crm/CalendarPage.tsx";
import CrmDiscussions from "./pages/crm/Discussions.tsx";
import CrmContacts from "./pages/crm/Contacts.tsx";
import CrmSettings from "./pages/crm/Settings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/book/*" element={<Index />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/events/new" element={<EventFormPage />} />
          <Route path="/admin/events/:eventId" element={<EventDetail />} />
          <Route path="/admin/events/:eventId/edit" element={<EventFormPage />} />
          <Route path="/admin/locations" element={<LocationsPage />} />
          <Route path="/admin/locations/:slug" element={<LocationSettings />} />
          <Route path="/portal/:token" element={<Portal />} />
          <Route path="/crm" element={<CrmLayout />}>
            <Route index element={<CrmDashboard />} />
            <Route path="leads" element={<CrmLeads />} />
            <Route path="events" element={<CrmEvents />} />
            <Route path="events/:id" element={<CrmEventDetail />} />
            <Route path="calendar" element={<CrmCalendar />} />
            <Route path="discussions" element={<CrmDiscussions />} />
            <Route path="contacts" element={<CrmContacts />} />
            <Route path="settings" element={<CrmSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
