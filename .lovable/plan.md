# Port the Base44 CRM

Goal: bring your Base44 CRM (Dashboard, EventDetail, EventForm, Contacts, Discussions, Contract printout) into this project, wired to Lovable Cloud. Booking funnel and client portal are left alone.

## 1. Database changes (one migration)

**Extend `events` table** with the Base44 fields it doesn't have yet:
- `event_name`, `event_type`, `event_time` (already exists), `location` (already exists)
- `children_attending` (boolean)
- `antipasti_selections`, `entree_selections`, `dessert_selections` (text[])
- `beverage_package`, `addons` (already as jsonb — keep), `menu_header_type`, `menu_header_text`, `menu_header_file`
- `subtotal`, `service_charge`, `tax_amount`, `estimated_total`, `fnb_minimum`, `deposit_amount` (numeric)
- `contract_status`, `cc_auth_status`, `cc_last_four`, `cc_auth_date`, `signature_name`
- `notes`
- Map existing `status` → `booking_status` semantics; keep `status` enum but add `cancelled` if missing.

**New tables:**
- `event_contacts` (event_id, first_name, last_name, phone, email_1, email_2, company_name, position, is_main)
- `discussions` (event_id, title, author_name, message_count)
- `discussion_messages` (discussion_id, event_id, body, author_name)

All admin-only RLS (using existing `has_role(auth.uid(), 'admin')`). Proper GRANTs for `authenticated` + `service_role`.

## 2. New CRM screens (under `/admin`)

Replace the current `/admin` page with a full CRM:

```text
/admin                       → Dashboard (4 tabs: Pipeline | Calendar | List | Reminders)
/admin/events/new            → EventForm (create)
/admin/events/:id            → EventDetail (cards + contacts + discussions + contract)
/admin/events/:id/edit       → EventForm (edit)
/admin/login                 → existing (kept)
```

Components added under `src/components/admin/crm/`:
- `StatsBar`, `PipelineBoard`, `CalendarBoard`, `ListBoard`, `RemindersBoard`
- `EventCard` (used by Pipeline)
- `EventForm` (create/edit, with live quote preview)
- `ContactsCard`, `Discussions`, `ContractDocument`
- `EventDetailHeader`, `EventDetailCards`

All using existing shadcn components + design tokens — no raw colors.

## 3. Data layer

- All `base44.entities.X.{list,filter,get,create,update,delete}` calls → typed Supabase queries.
- `Event.create` auto-generates `portal_token` (DB default already does this — keep).
- Pipeline drag-drop updates `status` directly via Supabase mutation.
- Reminders panel "Send Nudge" reuses your existing `send-reminder` edge function.
- Reuse existing `MENU_TIERS`/addons from `src/lib/booking-data.ts` — no duplication. Add a small `src/lib/crm-data.ts` with `STATUS_COLORS`, `STATUS_LABELS`, `EVENT_TYPES`, `LOCATIONS`, and a `calculateAdminQuote()` helper (Base44's pricing for admin-created events).

## 4. What I'm NOT doing

- Not touching `/`, `/book/*`, `/spaces`, `/portal/:token`
- Not porting `ClientPortal` (already covered by existing portal)
- Not porting `QuoteBuilder`/`MenuHeader`/`ContractSign`/`PaymentAuth` portal components
- Not porting Base44 login/auth — keeping existing admin auth

## 5. Open question

The Base44 `Event` model uses **separate fields** (`antipasti_selections`, etc.) while your booking funnel uses a `menu_selections` JSONB blob. I'll **store both** for now: the new admin form writes both, and the booking funnel keeps writing its blob. We can converge later. Sound good?

## Order of execution

1. Run the migration (you'll approve it)
2. Add `src/lib/crm-data.ts` + helpers
3. Build CRM components
4. Replace `src/pages/Admin.tsx` with the new dashboard
5. Add `EventDetail` + `EventForm` pages and routes
6. Smoke-test in preview, confirm RLS works for the admin
