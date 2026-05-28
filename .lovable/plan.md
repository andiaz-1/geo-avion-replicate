
# Weston Coordinator Suite — Build Plan

The existing booking flow at `/book/*` will not be touched. Everything below is additive.

## 1. Backend (Lovable Cloud)

New tables:
- `events` — created automatically when a booking submission completes. Holds client info, event date/time, guest count, menu tier, dish selections (JSON), beverage package, add-ons, pricing snapshot, status (`new_lead | quote_sent | contract_sent | confirmed | completed | cancelled`), pipeline column, internal notes, portal token (uuid), coordinator notification flags.
- `contracts` — one per event, stores generated contract data, signed status, signature (typed string or drawn PNG dataURL), signed_at, signer name, signer IP/user-agent.
- `payment_authorizations` — cardholder name, last4, expiry, status. **Card number/CVV are NOT stored** — only last4 + a placeholder "authorized" flag (real tokenization would require Stripe; flagged as TODO with clear note).
- `menu_headers` — type (`logo | phrase | standard`), value (text or storage path), submitted_at.
- `admin_notifications` — in-app notifications for Julie (type, message, event_id, read).
- `admin_users` — single coordinator account (email + hashed password handled by Lovable Auth).

Plus storage bucket `menu-headers` for logo uploads.

All client-portal reads/writes go through Edge Functions that validate the portal token — the portal is **not** authenticated, so RLS for portal-facing tables is locked down and access is mediated server-side.

## 2. Admin Dashboard (`/admin`)

- `/admin/login` — email + password (Lovable Auth, single admin role).
- `/admin` — protected layout with three tabs:
  - **Calendar** — month grid, color-coded blocks (amber/green/grey), click → event drawer.
  - **Pipeline** — Kanban (5 columns), drag-and-drop via `@dnd-kit/core`, cards show name, date, guests, est. total, days-until.
  - **Reminders** — list of automated flags (contract unsigned >48h, menu incomplete & ≤21d, CC auth missing & ≤14d, header missing & ≤10d) with "Send Nudge" button → triggers reminder email.
- **Event drawer/page** — full client details, booking selections, step status (contract / CC auth / menu header), "Generate Contract" button, internal notes, "Copy portal link" button, in-app notification feed.

## 3. Contract Generator

Edge function `generate-contract` builds a contract record from the event, including:
- Client, date, time, Weston address, guest count
- Selected menu tier + all dishes
- Beverage package, add-ons
- Itemized pricing: subtotal + 23% service charge + 8% sales tax + estimated total
- Payment terms: "Payment is due at the end of your event. Your credit card on file is not charged until the day of the event."
- `[INSERT CANCELLATION POLICY HERE]` placeholder
- Sends contract link to client via email; client portal `/portal/:token` exposes the contract for review + e-signature.

## 4. Client Guest Portal (`/portal/:token`)

Branded to match booking tool (cream bg, green/terracotta accents, same fonts).
Horizontal stepper at top: **Quote → Contract → Payment Auth → Menu Header → Confirmed**.

- **Quote** — itemized quote + "This looks right — proceed to contract."
- **Contract** — render contract, e-signature pad (typed OR drawn via `react-signature-canvas`), submit → marks signed in admin.
- **Payment Auth** — secure-looking form (cardholder/number/expiry/CVV). Shows non-charge message. **Note:** without Stripe this only records last4 + cardholder name; full PCI tokenization will need Stripe later — I'll flag this clearly in the UI as "secure pre-auth (Stripe integration recommended for production)".
- **Menu Header** — three cards: upload logo (PNG/JPG → storage), type phrase, or use standard.
- **Confirmed** — "You're all set!" + summary + Julie's contact (`[INSERT EMAIL]` placeholder).

## 5. Automated Reminder Emails

- Edge function `send-reminder` invoked from "Send Nudge" buttons (manual) AND from `cron-reminders` running daily that scans events and sends due reminders.
- Templates: contract-48h, menu-header-10d, cc-auth-14d, with the exact copy you provided.
- Uses Lovable Email infrastructure (requires email domain — I'll prompt setup if not already configured).

## 6. Booking Flow Integration

A tiny hook at the existing booking-completion step:
- On final submit, also call `create-event` edge function which inserts an `events` row pre-populated from the booking payload, generates a portal token, sends portal link email to client, and creates an `admin_notifications` row.

The booking flow's existing behavior, UI, copy, and validation stay 100% unchanged.

## Open items / placeholders

- **Card processing**: real card tokenization requires Stripe. I'll build the UI + record last4 only, with a clear "Connect Stripe for production" note.
- **Julie's email address**: `[INSERT EMAIL]` placeholder in portal + contract until you give it.
- **Cancellation policy text**: `[INSERT CANCELLATION POLICY HERE]` placeholder in contract.
- **Admin password**: I'll create the admin user via Lovable Auth — you'll set the password on first login.
- **Email domain**: if not yet configured, I'll prompt you through the one-time setup before reminders can send.

## Build order

1. Database migrations + storage bucket
2. Hook booking completion → create event + send portal link
3. Admin auth + protected `/admin` layout
4. Calendar / Pipeline / Reminders tabs + event drawer
5. Contract generator + e-signature
6. Guest portal `/portal/:token` (all 5 stages)
7. Reminder email templates + nudge function + daily cron
8. In-app notifications for Julie

Confirm and I'll start with the migration.
