# 0-0-2 Desk

A lightweight, aesthetic court scheduler for Pasay City Pickleball Club
(Pasay 0-0-2). No login, no accounts — it loads straight into the
schedule so a receptionist can book courts and post clean screenshots to
social media in seconds.

## Features

- **Hourly scheduler** for Courts 1–3, strictly 1-hour slots from 6:00 AM
  to 10:00 PM, with Day / Week / Month views and a court filter.
- **Block Schedule** — close off a recurring range of slots (tournaments,
  maintenance, private events) across many dates/courts in one action.
  A one-click **tournament preset** matches the club's recurring hold —
  6–9pm weekdays, 5–9pm weekends — and stays fully editable before you
  apply it. Individual slots can also be blocked/unblocked one at a time
  from the grid.
- **Screenshot Mode** — one click hides admin navigation and controls,
  showing a clean, mobile-first card with the club's own branding,
  VACANT / BOOKED / BLOCKED badges (no customer names), and a payment
  info footer (GCash, QRPh, Bank Transfer) — ready to post as-is.
- **Add / edit / cancel** bookings through a single modal, with a live
  double-booking check before saving.
- **Supabase-backed**, with an automatic LocalStorage fallback so the app
  is fully usable before (or without) a database being connected.

## Getting started

```bash
npm install
npm run dev
```

The app runs immediately with no configuration, storing bookings in the
browser's LocalStorage.

## Connecting Supabase (optional)

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql` to create the
   `bookings` table.
3. Copy `.env.example` to `.env` and fill in your project's URL and anon
   key (Project Settings -> API):

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

4. Restart the dev server. `src/supabaseClient.js` detects the env vars
   automatically — no code changes needed. Every read/write in
   `src/lib/dataService.js` transparently targets Supabase instead of
   LocalStorage from that point on.

There is no login flow, so the anon key effectively grants full read/write
access to the `bookings` table (see the RLS policy comment in
`supabase/schema.sql`). That matches the single-admin brief; add real auth
first if this ever needs to be exposed beyond a trusted device.

## Deploying to Netlify

1. Push this project to GitHub and connect the repo in Netlify.
2. Build command: `npm run build` — Publish directory: `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under
   **Site settings -> Environment variables** (skip this to keep running
   on LocalStorage).
4. `public/_redirects` is already included so page refreshes on any route
   don't 404.

## Project structure

```
src/
  supabaseClient.js      Supabase client + env var detection
  assets/                 Club logos (paddle mark, full lockup, PCPC badge)
  lib/
    constants.js           Courts, time slots, view modes, block presets
    dateUtils.js            Local-time-safe date helpers
    storage.js               LocalStorage read/write helpers
    dataService.js            bookingService — Supabase or LocalStorage,
                               including bulk-create for Block Schedule
  hooks/
    useBookings.js           Data + CRUD/bulk-block actions for a date range
  components/
    layout/Header.jsx        Logo, wordmark, Screenshot Mode toggle
    scheduler/
      SchedulerTab.jsx        Owns view/date/court state, wires up modals
      DayView / WeekView / MonthView
      ScreenshotDayCard.jsx   Dedicated mobile-first Screenshot Mode card
      BookingModal.jsx        Add/edit — toggles between booking & block
      BlockScheduleModal.jsx  Bulk-block tool with the tournament preset
      SlotCell.jsx            Vacant / Booked / Unavailable states
    common/                   Modal, ConfirmDialog, Toast
```

## Design notes

Palette and type are built directly from the club's own logos (the jade
green from the "Pickleball Court" wordmark, the mint from the ball) rather
than a generic UI kit — see `src/index.css` for the Tailwind v4 `@theme`
tokens. A blocked/unavailable slot is always rendered in neutral slate,
never green, so "closed" reads distinctly from "open for business" at a
glance.
