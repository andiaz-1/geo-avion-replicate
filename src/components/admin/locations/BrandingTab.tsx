import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { LocationRecord } from "@/pages/admin/LocationSettings";

interface Props {
  loc: LocationRecord;
  save: (patch: Partial<LocationRecord>) => Promise<{ error: any } | undefined>;
}

const FONTS = [
  "Inter", "Playfair Display", "Cormorant Garamond", "Cardo", "Lora",
  "Poppins", "Montserrat", "DM Sans", "Space Grotesk", "Bodoni Moda",
  "Libre Bodoni", "Crimson Pro", "EB Garamond", "Manrope", "Outfit",
];

function loadFont(family: string) {
  const id = `font-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// Convert "12 76% 61%" (HSL) to a hex color for the <input type=color>
function hslToHex(hslStr: string): string {
  const m = hslStr.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!m) return "#000000";
  const h = parseFloat(m[1]) / 360, s = parseFloat(m[2]) / 100, l = parseFloat(m[3]) / 100;
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function BrandingTab({ loc, save }: Props) {
  const [colors, setColors] = useState({
    color_primary: loc.color_primary,
    color_secondary: loc.color_secondary,
    color_accent: loc.color_accent,
    color_bg: loc.color_bg,
    color_text: loc.color_text,
  });
  const [fonts, setFonts] = useState({
    font_title: loc.font_title,
    font_subtitle: loc.font_subtitle,
    font_body: loc.font_body,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    [fonts.font_title, fonts.font_subtitle, fonts.font_body].forEach(loadFont);
  }, [fonts]);

  const submit = async () => {
    setSaving(true);
    const res = await save({ ...colors, ...fonts });
    setSaving(false);
    if (res?.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  const colorField = (key: keyof typeof colors, label: string) => (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={hslToHex(colors[key])}
          onChange={(e) => setColors({ ...colors, [key]: hexToHsl(e.target.value) })}
          className="h-10 w-14 rounded border border-border cursor-pointer"
        />
        <Input value={colors[key]} onChange={(e) => setColors({ ...colors, [key]: e.target.value })} placeholder="0 0% 9%" />
      </div>
    </div>
  );

  const fontField = (key: keyof typeof fonts, label: string) => (
    <div>
      <Label>{label}</Label>
      <Select value={fonts[key]} onValueChange={(v) => setFonts({ ...fonts, [key]: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {FONTS.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const previewStyle = {
    background: `hsl(${colors.color_bg})`,
    color: `hsl(${colors.color_text})`,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Colors</h3>
          <p className="text-xs text-muted-foreground">HSL format, e.g. <code>12 76% 61%</code></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {colorField("color_primary", "Primary")}
            {colorField("color_secondary", "Secondary")}
            {colorField("color_accent", "Accent")}
            {colorField("color_bg", "Background")}
            {colorField("color_text", "Text")}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Typography</h3>
          {fontField("font_title", "Title font")}
          {fontField("font_subtitle", "Subtitle font")}
          {fontField("font_body", "Body font")}
        </Card>

        <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save branding"}</Button>
      </div>

      <Card className="p-8 sticky top-6 h-fit" style={previewStyle}>
        <p className="text-xs uppercase tracking-wider opacity-60 mb-6" style={{ fontFamily: fonts.font_body }}>
          Live preview
        </p>
        <h1 className="text-4xl mb-2" style={{ fontFamily: fonts.font_title }}>
          {loc.name}
        </h1>
        <p className="text-lg mb-6" style={{ fontFamily: fonts.font_subtitle, color: `hsl(${colors.color_secondary})` }}>
          {loc.tagline || "Your tagline goes here"}
        </p>
        <p className="mb-6 leading-relaxed" style={{ fontFamily: fonts.font_body }}>
          Book a private event in our intimate dining rooms. Curated Italian menus, attentive service, unforgettable evenings.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            className="px-5 py-2 rounded font-medium"
            style={{ background: `hsl(${colors.color_primary})`, color: `hsl(${colors.color_bg})`, fontFamily: fonts.font_body }}
          >
            Start booking
          </button>
          <button
            className="px-5 py-2 rounded font-medium border"
            style={{ borderColor: `hsl(${colors.color_accent})`, color: `hsl(${colors.color_accent})`, fontFamily: fonts.font_body }}
          >
            View spaces
          </button>
        </div>
      </Card>
    </div>
  );
}
