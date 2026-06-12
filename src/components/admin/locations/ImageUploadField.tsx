import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface Props {
  label: string;
  locationId: string;
  path: string;            // subfolder under {locationId}/, e.g. "logo"
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUploadField({ label, locationId, path, value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const key = `${locationId}/${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("location-assets").upload(key, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false); return;
    }
    const { data } = supabase.storage.from("location-assets").getPublicUrl(key);
    onChange(data.publicUrl);
    setUploading(false);
    toast({ title: "Uploaded" });
  };

  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="border border-dashed border-border rounded-md p-3 flex items-center gap-3">
        {value ? (
          <img src={value} alt={label} className="h-16 w-16 object-cover rounded bg-muted" />
        ) : (
          <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
            None
          </div>
        )}
        <div className="flex-1">
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => ref.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
