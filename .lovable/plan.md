# Multi-Location White-Label CRM

Turn the current single-tenant Weston build into a platform where each Salumeria location (and future venues) has its own fully configurable booking site and CRM. Weston becomes the first seeded location; nothing existing breaks.

## Phase 1 — Data model & roles

### New tables

- **`locations`** — identity, branding, pricing rules
  - `slug`, `name`, `address`, `phone`, `email`, `timezone`
  - `logo_url`, `favicon_url`, `hero_image_url`, `gallery[]`
  - `color_primary`, `color_secondary`, `color_accent`, `color_bg`, `color_text` (HSL strings)
  - `font_title`, `font_subtitle`, `font_body` (Google Fonts names)
  - `tagline`, `about_text`
  - `service_charge_pct`, `tax_pct`, `deposit_pct`, `min_guests`, `max_guests`, `buyout_threshold`
  - `is_active`, `published`

- **`location_areas`** — rooms/spaces (name, min/max guests, base_fee, photo, description, fnb_minimum)

- **`location_menu_tiers`** — name, price_per_person, description, photo, order
- **`location_menu_courses`** — tier_id, name, max_selections, order
- **`location_menu_items`** — course_id, name, description, allergens[], photo, upcharge, order

- **`location_beverage_packages`** — name, type, price_per_person, duration_hours, inclusions[], min_spend

- **`location_addons`** — name, description, photo, price, price_type (`flat`/`per_person`/`per_hour`), category, max_qty

- **`location_form_config`** — JSONB: ordered steps + custom fields (label, type, required, options, step)
- **`location_faqs`** — question, answer, category, order

- **`location_contract_templates`** — name, body (rich text w/ merge tags), terms, signature_required, deposit_required, is_default, source (`system`/`custom`)
  - Seeded with 3 system templates: **Casual**, **Corporate**, **Formal** (copyable per location)

### Roles

Extend `app_role` enum: add `super_admin` and `location_admin`.

- `user_roles` already exists; add nullable `location_id` column.
- `super_admin` → all locations.
- `location_admin` → only rows scoped to their `location_id`.

New helper: `public.has_location_access(_user_id, _location_id)` SECURITY DEFINER, used by all RLS policies.

### Existing tables

- Add `location_id uuid` (FK → locations) to `events`, `event_contacts`, `discussions`, `contracts`, `payment_authorizations`.
- Backfill all existing rows to the seeded Weston location.
- Update RLS so location_admins only see their location's data; super_admin sees all.

### Storage

New public bucket `location-assets/{location_id}/...` for logos, hero, menu photos, addon photos.

## Phase 2 — Super-admin: Locations Management

New route `/admin/locations`:
- List of locations with status, event count, quick edit
- "+ New Location" wizard (slug, name, copy settings from existing)
- Click → `/admin/locations/:slug/settings` with tabs:
  1. **Identity** (logo, address, contact)
  2. **Branding** (colors, font pickers w/ live preview, hero image)
  3. **Areas** (CRUD rooms)
  4. **Menus** (tier/course/item builder; bulk paste, CSV import, PDF attach)
  5. **Beverages** (package CRUD)
  6. **Enhancements** (addon CRUD)
  7. **Form Builder** (drag step order, add/remove custom fields, toggle allergies/dietary/special-requests)
  8. **FAQ** (CRUD)
  9. **Contracts** (pick 3 system templates + create custom; merge-tag editor)
  10. **Pricing & Policies** (service %, tax %, deposit, min/max guests)
  11. **Team** (invite location admins)

## Phase 3 — Dynamic booking funnel

- New route `/book/:locationSlug/...` (current `/book/*` becomes `/book/weston/*` via redirect)
- All booking steps read from `locations` + child tables instead of hardcoded `booking-data.ts`
- Branding applied at runtime: CSS vars set from location colors, Google Fonts loaded dynamically
- Form steps render from `location_form_config`
- Custom fields stored in `events.custom_field_responses` JSONB
- Pricing math uses location's `service_charge_pct` / `tax_pct`

## Phase 4 — Dynamic admin CRM

- `/admin` dashboard scoped by role:
  - `super_admin`: location switcher in header, sees all events
  - `location_admin`: locked to their location
- Event detail uses the location's contract templates (dropdown to pick which template to send)
- Quote calculator pulls per-location pricing rules
- Reminders/notifications use per-location email templates

## Phase 5 — Seed Weston + cleanup

- Migrate all hardcoded Weston data (current `booking-data.ts` + `crm-data.ts`) into the Weston location row + child tables
- Keep `booking-data.ts` only as the seed payload for new locations
- Delete dead code paths

## Technical notes

```text
src/
  pages/
    admin/
      Locations.tsx                  (list)
      LocationSettings.tsx           (tabbed settings shell)
      LocationDashboard.tsx          (per-location CRM)
    book/
      [locationSlug]/...             (dynamic funnel)
  components/admin/locations/
    IdentityTab, BrandingTab, AreasTab, MenuBuilder,
    BeverageBuilder, AddonBuilder, FormBuilder,
    FaqEditor, ContractTemplateEditor, PricingTab, TeamTab
  lib/
    location-context.tsx             (React context: current location config)
    contract-templates/              (3 system templates as TS modules)
    merge-tags.ts                    (render {client_name} etc.)
  hooks/
    useLocation(slug)                (load + cache location config)
    useLocationRole()                (super_admin vs location_admin)
```

Migrations run in order: enum + helpers → tables + GRANTs + RLS → backfill Weston → storage bucket.

## Rollout order

1. Migration: roles, locations + all child tables, location_id on existing tables, RLS, storage bucket, seed Weston
2. Super-admin Locations list + Identity/Branding/Pricing tabs
3. Menus + Beverages + Addons + Areas builders
4. Form Builder + FAQ + Contract Templates
5. Refactor booking funnel to read location config (Weston still works identically)
6. Scope CRM dashboard by role, add location switcher
7. Cleanup hardcoded data

This is multi-turn — I'll ship phase 1 (migration) first for approval, then build the UI in batches so you can review each piece. Sound good?
