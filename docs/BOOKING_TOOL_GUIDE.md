# Salumeria 104 Booking Tool — Plain-English Guide

A friendly walkthrough of how the online event booking works, what the guest sees, what we capture, how the price is calculated, and what happens behind the scenes when they hit "Submit."

Think of this as the "story" version of the technical `VARIABLE_REFERENCE.md`. Same facts — no code.

---

## 1. The big picture

A guest lands on our booking page and moves through **5 short steps**. At the end, three things happen automatically:

1. Their event is saved in our system as a **new lead**.
2. A **draft contract** is generated for them.
3. They get an **email with a private link** (their "portal") to review the quote, sign the contract, and add their card later.

The event stays **locked** until Julie confirms the date is available. Once she unlocks it, the guest can move forward on their own.

---

## 2. The 5 steps the guest sees

| Step | What we ask | Why |
|---|---|---|
| **1. Basics** | Date, time, how many guests, are any of them kids? | Drives room availability and pricing |
| **2. Venue** | Which room (Main, VIP Front, VIP Back), private buy-out?, VIP Back layout | Only shows rooms that fit their headcount |
| **3. Menu** | Menu tier (Classico / Gustoso / Magnifico), dish choices per course, allergies | Sets the per-person food price |
| **4. Add-ons** | Bar package (open bar or on consumption), tablecloths, speaker, live music, bringing a cake or décor | Adds beverage + extras to the quote |
| **5. Contact** | Name, email, phone, company, event name, special requests, is this a pharma event | So we can reach them and send the portal link |

Guests can go back and change answers at any time. The price at the top updates live.

---

## 3. What the guest can pick

### Rooms

| Room | Fits up to |
|---|---|
| VIP Room (Front) | 24 seated |
| VIP Room (Back, with TV) | 42 seated — long tables or U-shape |
| Main Dining (semi-private) | 75 seated |

*Rooms that are too small for their headcount are automatically hidden.*

### Menus

| Menu | Dinner price | Lunch price | What's included |
|---|---|---|---|
| **Classico** | $60 pp | $50 pp | 3 antipasti (family style) + choice of entrée + Tiramisu |
| **Gustoso** | $70 pp | — | Pick-3 antipasti + Caesar + choice of entrée (incl. Branzino, Salmon) + pick-2 desserts |
| **Magnifico** | $88 pp | — | Pick-3 antipasti + salad + pick-4 entrées (incl. Short Ribs, NY Steak) + all 3 desserts. Soft drinks included. |

- **NY Steak** adds **+$5 per person** if anyone in the party picks it.
- **Kids menu** is a flat **$45 per child**.
- Guests can tick **"Decide later"** and skip dish selection for now.

### Bar packages

| Package | 2 hours | 3 hours |
|---|---|---|
| Wine / Beer / Prosecco / Softs | $45 pp | $55 pp |
| Full Bar (liquor + cocktails + wine + beer) | $55 pp | $65 pp |

Or they can choose **"On consumption"** — no upfront bar charge, drinks billed after the event.

### Add-ons

| Add-on | Charge |
|---|---|
| White tablecloths | Free (subject to availability) |
| JBL speaker + 2 mics | $150 |
| Live music | Starts at $300 |
| Bringing their own musician | Free |
| Bringing their own cake | Free |
| Bringing their own décor | Free |

---

## 4. How the price is built

Every time the guest changes something, we recalculate:

```
Per-person total  = menu price + bar-package price + steak surcharge (if any)

Adults subtotal   = per-person total × number of adults
Kids subtotal     = ($45 + steak surcharge) × number of kids
Add-ons total     = tablecloths + speaker + live music (whichever are ticked)

Subtotal          = adults + kids + add-ons
Service charge    = Subtotal × 23%
Sales tax         = Subtotal × 7%
Grand total       = Subtotal + Service + Tax
```

**Rules of thumb**
- Lunch pricing (Classico only) kicks in between **12:00 PM and 4:59 PM**.
- "On consumption" bar sets the bar portion to $0 in the quote — actual bar spend is billed the day of.

---

## 5. What happens after they hit "Submit"

1. **We save the event** as a new lead in our database — locked, awaiting Julie.
2. **We auto-generate a draft contract** from their choices (menu, bar, add-ons, price breakdown, payment terms).
3. **We create a notification** in Julie's inbox: *"New lead + contract ready: [Name] — [X] guests on [date]"*.
4. **We email the guest** their private portal link. From that link they'll eventually be able to:
   - Review the quote
   - Sign the contract
   - Authorize a card on file
   - Submit their menu selections
5. **The portal stays locked** with a friendly "Julie is reviewing your date" message until Julie confirms availability and flips the switch.

---

## 6. What we store about each event

Every submission becomes one **event record** with, roughly:

- **Who**: name, email, phone, company
- **When**: date, time, whether it's lunch or dinner
- **How many**: total guests, adults, kids
- **Where**: room choice, private-room flag
- **What they'll eat**: menu tier, course choices, dish picks, allergies
- **What they'll drink**: bar strategy, package type, duration
- **Extras**: tablecloths, speaker, live music, own cake, own décor
- **The quote**: subtotal, service charge, tax, grand total
- **Status flags**: portal locked/unlocked, contract sent date, current stage
- **Notes**: event name, special requests, pharma-event flag

Attached to that event we also keep:
- **Extra contacts** (up to a second contact person)
- **The contract** (draft and signed versions)
- **Payment authorization** records
- **Discussion threads** — one visible to the client, one internal for staff
- **Admin notifications** for Julie

---

## 7. Systems talking to each other

| System | What it does for us |
|---|---|
| **Lovable Cloud (database + functions)** | Stores every event, generates contracts, powers the portal, runs the "create event" logic |
| **Resend (email)** | Sends the guest their portal-link email right after submission |
| **Cloud Storage** | Holds uploaded logos, hero images, and other location assets |

Not currently used: the old Tripleseat lead handoff (kept in the code but no longer called — we're our own CRM now).

---

## 8. Quick glossary

- **Lead** — a submitted booking request that hasn't been confirmed yet.
- **Portal** — the guest's private page (unique link) for signing / paying / picking dishes.
- **Portal token** — the secret key in that link; each event has its own.
- **Locked / unlocked portal** — before Julie confirms the date, the guest sees a "we're reviewing" holding page. After she unlocks it, the full workflow opens up.
- **F&B minimum** — a minimum food-and-beverage spend commitment (set per season, admin side).
- **Service charge** — 23% added on top of the subtotal.
- **Sales tax** — 7% on the booking side (8% in the CRM contract views; these should be reconciled).
- **Steak supplement** — extra $5 per person when NY Steak is picked.
- **Kids price** — flat $45 per child regardless of menu tier.
- **On consumption** — bar billed after the event based on actual drinks poured.
- **Open bar** — flat per-person bar price chosen in advance (beer/wine or full bar × 2 or 3 hours).
- **Pharma event** — flag we track for compliance reporting; doesn't change the price.

---

_For the technical version (exact variable names, database columns, API payloads, formulas) see `docs/VARIABLE_REFERENCE.md`._
