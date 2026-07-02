# Salumeria 104 — Booking Tool Variable Reference

Complete inventory of every variable, form field, DB column, derived value, and external integration used by the public booking funnel and the create-event backend. Names below are the **exact identifiers used in code** — do not rename when porting.

> Scope: this document covers the **public booking funnel** (`/` → `src/components/booking/*` + `src/lib/booking-data.ts`) and the `create-event` edge function that persists the lead. CRM/admin variables are out of scope here.

---

## 1. Naming conventions

| Layer | Convention | Example |
|---|---|---|
| Frontend state / TS interfaces | `camelCase` | `guestCount`, `beverageStrategy` |
| Enum-like string literals | `kebab-case` | `"open-bar"`, `"beer-wine"`, `"2hr"` |
| Menu tier IDs | `PascalCase` proper noun | `"Classico"`, `"Gustoso"`, `"Magnifico"` |
| Database columns (Postgres) | `snake_case` | `guest_count`, `beverage_strategy`, `portal_token` |
| Edge-function request payload keys | `camelCase` (mapped to `snake_case` on insert) | `fullName` → `full_name` |
| Boolean flags | verb prefix `is…` / `has…` / `wants…` / `bringing…` | `isLunch`, `hasKids`, `wantsPrivateRoom`, `bringingCake` |
| Money constants | `SCREAMING_SNAKE_CASE` | `KIDS_MENU_PRICE` |

---

## 2. Booking funnel — steps & captured variables

Route: `/` (component `BookingFunnel.tsx`). Progress bar shows 5 steps; a virtual pageview `/book/step-N-{name}` is pushed on each step change for analytics drop-off tracking.

| # | Step key | Component | Variables captured / displayed |
|---|---|---|---|
| 1 | `basics` | `StepBasics` | `date`, `time`, `timeTag` (derived), `guestCount`, `hasKids`, `kidsCount` |
| 2 | `venue` | `StepVenue` | `venue`, `wantsPrivateRoom`, `vipBackLayout` |
| 3 | `menu` | `StepMenu` | `menu`, `courseChoice`, `menuSelections`, `decideLater`, `allergens` |
| 4 | `addons` | `StepAddons` | `beverageStrategy`, `barType`, `barDuration`, `addons.*`, `bringingCake`, `bringingDecor` |
| 5 | `contact` | `StepContact` | `fullName`, `email`, `phone`, `company`, `eventName`, `specialRequests`, `isPharmaEvent` |

Local funnel-only state (not persisted): `currentStep`, `submitting`, `submitted`, `portalUrl`.

---

## 3. `BookingData` — full field reference

Source: `src/lib/booking-data.ts` → `interface BookingData` + `initialBookingData`.

| Variable | Type | Default | Allowed values | Required | Captured in | Notes |
|---|---|---|---|---|---|---|
| `date` | `Date \| undefined` | `undefined` | Any future date | ✅ | Step 1 | Formatted `yyyy-MM-dd` on submit |
| `time` | `string` | `""` | One of `timeSlots` (`"12:00 PM"`…`"10:00 PM"`, 30-min increments) | ✅ | Step 1 | Drives `timeTag` and `isLunch` |
| `timeTag` | `"Lunch" \| "Dinner" \| ""` | `""` | Derived | — | Step 1 | Computed via `getTimeTag(time)` |
| `guestCount` | `number` | `16` | integer ≥ min venue capacity | ✅ | Step 1 | Adults + kids combined |
| `hasKids` | `boolean` | `false` | — | ✅ | Step 1 | Toggle |
| `kidsCount` | `number` | `0` | 0 – `guestCount` | if `hasKids` | Step 1 | Uses `KIDS_MENU_PRICE` (`$45`) |
| `venue` | `"Main Room" \| "VIP Room Front" \| "VIP Room Back" \| ""` | `""` | See `venues` | ✅ | Step 2 | Filtered by `getAvailableVenues(guestCount)` |
| `wantsPrivateRoom` | `boolean` | `false` | — | Optional | Step 2 | Buyout / private-room flag |
| `vipBackLayout` | `"one-line" \| "two-lines" \| "u-shape" \| ""` | `""` | — | if `venue==="VIP Room Back"` | Step 2 | Floor-plan choice |
| `menu` | `"Classico" \| "Gustoso" \| "Magnifico" \| ""` | `""` | See `menus` | ✅ | Step 3 | Drives per-person price |
| `courseChoice` | `"insalate" \| "dolci" \| ""` | `""` | — | Classico only | Step 3 | Which extra course guest picks |
| `menuSelections` | `Record<string, string[]>` | `{}` | Keys = course name, values = item names | if !`decideLater` | Step 3 | Enforces `course.selectCount` |
| `decideLater` | `boolean` | `false` | — | — | Step 3 | Skips selection validation |
| `allergens` | `string` | `""` | Free text | Optional | Step 3 | Allergies / dietary notes |
| `beverageStrategy` | `"open-bar" \| "consumption" \| ""` | `""` | — | ✅ | Step 4 | |
| `barType` | `"beer-wine" \| "full-bar" \| ""` | `""` | See `barPackages` | if `open-bar` | Step 4 | |
| `barDuration` | `"2hr" \| "3hr" \| ""` | `""` | — | if `open-bar` | Step 4 | Price lookup key |
| `addons.tablecloths` | `boolean` | `false` | — | Optional | Step 4 | $0 (subject to availability) |
| `addons.avSpeaker` | `boolean` | `false` | — | Optional | Step 4 | $150 flat |
| `addons.liveMusic` | `boolean` | `false` | — | Optional | Step 4 | starts $300 |
| `addons.ownMusician` | `boolean` | `false` | — | Optional | Step 4 | $0 |
| `bringingCake` | `boolean` | `false` | — | Optional | Step 4 | |
| `bringingDecor` | `boolean` | `false` | — | Optional | Step 4 | |
| `fullName` | `string` | `""` | Free text | ✅ | Step 5 | Split into first/last on submit |
| `email` | `string` | `""` | Valid email | ✅ | Step 5 | |
| `phone` | `string` | `""` | Free text | ✅ | Step 5 | |
| `company` | `string` | `""` | Free text | Optional | Step 5 | |
| `eventName` | `string` | `""` | Free text | Optional | Step 5 | Prepended into `special_requests` server-side |
| `specialRequests` | `string` | `""` | Free text | Optional | Step 5 | |
| `isPharmaEvent` | `boolean` | `false` | — | Optional | Step 5 | Flag only; no pricing effect |

---

## 4. Reference data & catalogs

All from `src/lib/booking-data.ts`.

### 4.1 `venues`
| id | name | capacity (max seated) |
|---|---|---|
| `VIP Room Front` | VIP Room (Front) | 24 |
| `VIP Room Back` | VIP Room (Back, with TV) | 42 |
| `Main Room` | Main Dining (Semi-Private) | 75 |

### 4.2 `menus` (tiers)
| id | price (dinner) | lunch price | courses |
|---|---|---|---|
| `Classico` | $60 | $50 | Antipasti (all 3) · Entrée (choice of 3) · Dolci (Tiramisu) |
| `Gustoso` | $70 | — | Antipasti (pick 3) · Caesar · Entrée (choice of 4) · Dolci (pick 2) |
| `Magnifico` | $88 (incl. soft drinks) | — | Antipasti (pick 3) · Salad (pick 1) · Entrée (pick 4) · Dolci (all 3) |

Course objects use: `name`, `note`, `selectCount?`, `items[{name, info, description?, supplement?}]`. Only `NY Steak` currently carries `supplement` (`+$5`).

### 4.3 `barPackages`
| key | 2hr | 3hr | label |
|---|---|---|---|
| `beer-wine` | $45 | $55 | Wine / Beer / Prosecco / Softs |
| `full-bar` | $55 | $65 | Full Bar (Well Liquor, Cocktails, Wine, Beer) |

`openBarSelections` groups: `rosso`, `bianchi`, `sparkling`, `beer`, `cocktails`, `softDrinks`, `nonAlcoholic` — display-only.

### 4.4 `addonPrices`
| key | price | label |
|---|---|---|
| `tablecloths` | $0 | White Tablecloths |
| `avSpeaker` | $150 | JBL Speaker + 2 Microphones |
| `liveMusic` | $300+ | Live Music |
| `ownMusician` | $0 | Bringing own musician |

### 4.5 Constants
| Name | Value | Purpose |
|---|---|---|
| `KIDS_MENU_PRICE` | `45` | Per-kid menu price |
| `SERVICE_CHARGE_PCT` (inline) | `0.23` | 23% service |
| `TAX_PCT` (inline) | `0.07` | 7% sales tax |
| `STEAK_SUPPLEMENT` (inline) | `5` | Per-person surcharge if NY Steak selected |
| `timeSlots` | 21 entries | Selectable event start times |

---

## 5. Derived / calculated values

All from `calculateQuote(data)` and helpers in `booking-data.ts`.

| Derived var | Formula |
|---|---|
| `timeTag` | `getTimeTag(time)` → hour 12–16 → `"Lunch"` else `"Dinner"` |
| `isLunch` | `isLunchPricing(time)` — same window as `timeTag` |
| `menuPerPerson` | `useLunchPrice ? menu.lunchPrice : menu.price` |
| `adultCount` | `guestCount − (hasKids ? kidsCount : 0)` |
| `kidsCount` (quote) | `hasKids ? kidsCount : 0` |
| `steakSupplement` | `5` if any course selection includes `"NY Steak"` else `0` |
| `barPerPerson` | `barPackages[barType][barDuration]` if `beverageStrategy==="open-bar"` else `0` |
| `perPersonTotal` | `menuPerPerson + barPerPerson + steakSupplement` |
| `adultSubtotal` | `perPersonTotal × adultCount` |
| `kidsSubtotal` | `kidsCount > 0 ? (KIDS_MENU_PRICE + steakSupplement) × kidsCount : 0` |
| `guestSubtotal` | `adultSubtotal + kidsSubtotal` |
| `addonsTotal` | sum of active `addonPrices[*].price` (tablecloths + avSpeaker + liveMusic) |
| `subtotal` | `guestSubtotal + addonsTotal` |
| `serviceCharge` | `round(subtotal × 0.23, 2)` |
| `salesTax` | `round(subtotal × 0.07, 2)` |
| `grandTotal` | `round(subtotal + serviceCharge + salesTax, 2)` |
| `isConsumption` | `beverageStrategy === "consumption"` |
| `getAvailableVenues(guestCount)` | Filters `venues` where `guestCount ≤ max capacity` |

Note: when `beverageStrategy === "consumption"`, `barPerPerson = 0` and bar spend is billed post-event outside this quote.

---

## 6. Data model (Postgres, `public` schema)

Foreign keys omitted for brevity; every child table references `events(id)` via `event_id`. All primary keys are `uuid default gen_random_uuid()`. All tables have RLS enabled.

### 6.1 `events` (one row per booking / lead)
Snapshot of the columns most relevant to the funnel. `location_id` links to multi-location config; `portal_token` is the client's magic-link key.

| Column | Type | Default | Source (payload key) |
|---|---|---|---|
| `id` | uuid | `gen_random_uuid()` | — |
| `portal_token` | uuid | `gen_random_uuid()` | — |
| `location_id` | uuid | — | (server) |
| `full_name` | text NOT NULL | — | `fullName` |
| `email` | text NOT NULL | — | `email` |
| `phone` | text | — | `phone` |
| `company` | text | — | `company` |
| `event_date` | date | — | `eventDate` |
| `event_time` | text | — | `time` |
| `is_lunch` | bool | `false` | `isLunch` |
| `guest_count` | int | `0` | `guestCount` |
| `adult_count` | int | `0` | `adultCount` |
| `kids_count` | int | `0` | `kidsCount` |
| `venue` | text | `'Weston'` | `venue` |
| `wants_private_room` | bool | `false` | `wantsPrivateRoom` |
| `menu_tier` | text | — | `menu` |
| `course_choice` | text | — | `courseChoice` |
| `menu_selections` | jsonb | `{}` | `menuSelections` |
| `decide_later` | bool | `false` | `decideLater` |
| `beverage_strategy` | text | — | `beverageStrategy` |
| `bar_type` | text | — | `barType` |
| `bar_duration` | text | — | `barDuration` |
| `addons` | jsonb | `{}` | `addons` |
| `allergens` | text | — | `allergens` |
| `special_requests` | text | — | `[eventName, specialRequests].join("\n\n")` |
| `bringing_cake` | bool | `false` | `bringingCake` |
| `bringing_decor` | bool | `false` | `bringingDecor` |
| `quote` | jsonb | `{}` | `quote` (see §5) |
| `portal_unlocked` | bool | `false` | (server — Julie flips to `true`) |
| `status` | text | — | Set to `contract_sent` after auto-contract |
| `contract_sent_at` | timestamptz | — | (server) |
| `fb_minimum`, `deposit_amount`, `venue_fee` | numeric | — | Admin-only |
| `created_at`, `updated_at` | timestamptz | `now()` | — |

Full `events` table has 63 columns; the rest are admin/CRM (`stage`, `follow_up_at`, custom-field JSON, etc.) not touched by the funnel.

### 6.2 Related tables

| Table | Purpose | Key columns |
|---|---|---|
| `event_contacts` | Additional contacts per event | `event_id`, `first_name`, `last_name`, `phone`, `email_1`, `email_2`, `company_name`, `position`, `is_main` |
| `contracts` | Auto-generated contract per event | `event_id`, `content` (jsonb — see `buildContractContent`), `signature_type`, `signature_value`, `signer_name`, `signed_at` |
| `payment_authorizations` | Stored CC auth records | `event_id` + payment fields |
| `discussions` | Threads (client-visible or staff-only) | `event_id`, `title`, `author_name`, `message_count`, `audience` (`'client'` \| `'staff'`) |
| `discussion_messages` | Thread messages | `discussion_id`, `event_id`, `body`, `author_name`, `audience` |
| `admin_notifications` | Coordinator inbox | `event_id`, `kind` (e.g. `'new_lead'`), `message`, `read` |

### 6.3 Relationships (funnel-relevant subset)

```text
locations 1───* events 1───* event_contacts
                     │
                     ├─1 contracts
                     ├─* payment_authorizations
                     ├─* discussions 1─* discussion_messages
                     └─* admin_notifications
```

---

## 7. External connections

Invoked from `BookingFunnel.handleSubmit`:

| Call | Direction | Payload keys sent | Response keys used |
|---|---|---|---|
| `supabase.functions.invoke("create-event")` | POST | `fullName, email, phone, company, eventDate, time, isLunch, guestCount, adultCount, kidsCount, wantsPrivateRoom, menu, courseChoice, menuSelections, decideLater, beverageStrategy, barType, barDuration, addons, allergens, specialRequests, bringingCake, bringingDecor, quote{subtotal,serviceCharge,salesTax,grandTotal,isConsumption,menuPerPerson,barPerPerson}` | `success, eventId, portalToken, portalUrl` |
| `supabase.functions.invoke("send-booking-email")` | POST (best-effort) | Full quote + booking snapshot (see `emailPayload` in `BookingFunnel.tsx`) | — |

Inside `create-event` edge function (`supabase/functions/create-event/index.ts`):

| Service | Env var | Purpose |
|---|---|---|
| Supabase (service role) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Insert `events`, `contracts`, `admin_notifications` |
| Resend | `RESEND_API_KEY` (optional) | Sends the client the portal link email from `onboarding@resend.dev` |

Legacy / unused in current flow (kept for reference): `submit-tripleseat-lead` edge function; the funnel no longer calls it.

Analytics: virtual pageviews `/book/step-1-basics` … `/book/step-5-contact` and `/book/success` are pushed to `window.history.replaceState` for drop-off tracking (no dedicated analytics SDK wired up).

---

## 8. Server-side transforms (payload → DB row)

Performed inside `create-event`:

| DB column | Transform |
|---|---|
| `full_name` | `String(fullName).slice(0, 200)` |
| `email` | `String(email).slice(0, 200)` |
| `special_requests` | Client concatenates `eventName` + `specialRequests` before send |
| `portal_unlocked` | Hard-coded `false` (all leads locked until Julie confirms availability) |
| `status` | Set to `'contract_sent'` after `contracts` row insert |
| `contract_sent_at` | `new Date().toISOString()` post-insert |
| `portalUrl` (response) | `` `${origin}/portal/${event.portal_token}` `` |

Auto-generated `contracts.content` payload (`buildContractContent`) fields: `client, email, eventDate, eventTime, location, guestCount, menuTier, courseChoice, selections, beverage, addons[], pricing{subtotal,serviceCharge,salesTax,grandTotal}, paymentTerms, cancellationPolicy`.

---

## 9. Quick-copy summary table (variable → DB → payload)

| UI variable | Payload key | DB column | Type |
|---|---|---|---|
| `fullName` | `fullName` | `full_name` | text |
| `email` | `email` | `email` | text |
| `phone` | `phone` | `phone` | text |
| `company` | `company` | `company` | text |
| `date` | `eventDate` (`yyyy-MM-dd`) | `event_date` | date |
| `time` | `time` | `event_time` | text |
| `timeTag`/derived | `isLunch` | `is_lunch` | bool |
| `guestCount` | `guestCount` | `guest_count` | int |
| derived | `adultCount` | `adult_count` | int |
| `kidsCount` | `kidsCount` | `kids_count` | int |
| `venue` | (not sent — server default `'Weston'`) | `venue` | text |
| `wantsPrivateRoom` | `wantsPrivateRoom` | `wants_private_room` | bool |
| `menu` | `menu` | `menu_tier` | text |
| `courseChoice` | `courseChoice` | `course_choice` | text |
| `menuSelections` | `menuSelections` | `menu_selections` | jsonb |
| `decideLater` | `decideLater` | `decide_later` | bool |
| `beverageStrategy` | `beverageStrategy` | `beverage_strategy` | text |
| `barType` | `barType` | `bar_type` | text |
| `barDuration` | `barDuration` | `bar_duration` | text |
| `addons.*` | `addons` (object) | `addons` | jsonb |
| `allergens` | `allergens` | `allergens` | text |
| `eventName` + `specialRequests` | `specialRequests` (concatenated) | `special_requests` | text |
| `bringingCake` | `bringingCake` | `bringing_cake` | bool |
| `bringingDecor` | `bringingDecor` | `bringing_decor` | bool |
| quote object | `quote` | `quote` | jsonb |

---

_Source files: `src/lib/booking-data.ts`, `src/components/booking/BookingFunnel.tsx`, `src/components/booking/Step*.tsx`, `supabase/functions/create-event/index.ts`, Postgres `public` schema._
