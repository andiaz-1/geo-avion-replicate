import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import IdentityTab from "@/components/admin/locations/IdentityTab";
import BrandingTab from "@/components/admin/locations/BrandingTab";
import PricingTab from "@/components/admin/locations/PricingTab";
import CapacityTab from "@/components/admin/locations/CapacityTab";
import AreasTab from "@/components/admin/locations/AreasTab";
import MenusTab from "@/components/admin/locations/MenusTab";
import BeveragesTab from "@/components/admin/locations/BeveragesTab";
import AddonsTab from "@/components/admin/locations/AddonsTab";
import FaqTab from "@/components/admin/locations/FaqTab";
import ComingSoonTab from "@/components/admin/locations/ComingSoonTab";

export interface LocationRecord {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  logo_url: string | null;
  favicon_url: string | null;
  hero_image_url: string | null;
  gallery: any;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_bg: string;
  color_text: string;
  font_title: string;
  font_subtitle: string;
  font_body: string;
  tagline: string | null;
  about_text: string | null;
  service_charge_pct: number;
  tax_pct: number;
  deposit_pct: number;
  min_guests: number;
  max_guests: number;
  buyout_threshold: number | null;
  is_active: boolean;
  published: boolean;
}

export default function LocationSettings() {
  const { slug } = useParams<{ slug: string }>();
  const { session, isAdmin, loading } = useAdminAuth();
  const [loc, setLoc] = useState<LocationRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const nav = useNavigate();

  const load = async () => {
    if (!slug) return;
    const { data, error } = await supabase.from("locations").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) setNotFound(true);
    else setLoc(data as LocationRecord);
  };

  useEffect(() => { if (isAdmin && slug) load(); }, [isAdmin, slug]);

  const save = async (patch: Partial<LocationRecord>) => {
    if (!loc) return;
    const { data, error } = await supabase
      .from("locations")
      .update(patch)
      .eq("id", loc.id)
      .select()
      .single();
    if (!error && data) setLoc(data as LocationRecord);
    return { error };
  };

  const togglePublish = async () => {
    if (!loc) return;
    await save({ published: !loc.published });
  };

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  if (notFound) return <Navigate to="/admin/locations" replace />;
  if (!loc) return <div className="p-10 text-muted-foreground">Loading location…</div>;

  return (
    <div className="crm-theme min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => nav("/admin/locations")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Locations
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{loc.name}</h1>
              <Badge variant={loc.published ? "default" : "secondary"}>
                {loc.published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">/book/{loc.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/book/${loc.slug}`, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-1" /> Preview site
          </Button>
          <Button size="sm" onClick={togglePublish}>
            {loc.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      <main className="p-6">
        <Tabs defaultValue="identity">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="areas">Areas</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="beverages">Beverages</TabsTrigger>
            <TabsTrigger value="addons">Enhancements</TabsTrigger>
            <TabsTrigger value="form">Form Builder</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="mt-6"><IdentityTab loc={loc} save={save} /></TabsContent>
          <TabsContent value="branding" className="mt-6"><BrandingTab loc={loc} save={save} /></TabsContent>
          <TabsContent value="pricing" className="mt-6"><PricingTab loc={loc} save={save} /></TabsContent>
          <TabsContent value="areas" className="mt-6"><ComingSoonTab name="Areas" /></TabsContent>
          <TabsContent value="menus" className="mt-6"><ComingSoonTab name="Menu builder" /></TabsContent>
          <TabsContent value="beverages" className="mt-6"><ComingSoonTab name="Beverage packages" /></TabsContent>
          <TabsContent value="addons" className="mt-6"><ComingSoonTab name="Enhancements" /></TabsContent>
          <TabsContent value="form" className="mt-6"><ComingSoonTab name="Form builder" /></TabsContent>
          <TabsContent value="faq" className="mt-6"><ComingSoonTab name="FAQ" /></TabsContent>
          <TabsContent value="contracts" className="mt-6"><ComingSoonTab name="Contract templates" /></TabsContent>
          <TabsContent value="team" className="mt-6"><ComingSoonTab name="Team" /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
