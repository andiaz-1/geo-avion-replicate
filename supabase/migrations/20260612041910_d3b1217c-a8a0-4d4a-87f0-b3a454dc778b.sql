
ALTER TABLE public.location_menu_tiers
  ADD COLUMN IF NOT EXISTS season_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meal_periods text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS days_of_week int[] NOT NULL DEFAULT '{}';
