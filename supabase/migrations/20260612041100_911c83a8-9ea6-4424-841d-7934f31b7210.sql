
CREATE TABLE public.location_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_month int NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  start_day int NOT NULL CHECK (start_day BETWEEN 1 AND 31),
  end_month int NOT NULL CHECK (end_month BETWEEN 1 AND 12),
  end_day int NOT NULL CHECK (end_day BETWEEN 1 AND 31),
  fnb_minimum numeric NOT NULL DEFAULT 0,
  color text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_seasons TO anon, authenticated;
GRANT ALL ON public.location_seasons TO service_role;
ALTER TABLE public.location_seasons ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_ls_updated_at BEFORE UPDATE ON public.location_seasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Pre-launch open access" ON public.location_seasons FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
