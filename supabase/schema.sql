-- DinkDesk — Supabase schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- for a new project before connecting VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.

create extension if not exists "pgcrypto";

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  court_id integer not null check (court_id in (1, 2, 3)),
  booking_date date not null,
  time_slot text not null,                 -- 24h "HH:00" start of the 1-hour slot
  customer_name text not null,             -- customer name, or the block's reason label
                                            -- (e.g. "Tournament") when status = UNAVAILABLE
  notes text,
  status text not null default 'BOOKED' check (status in ('BOOKED', 'UNAVAILABLE', 'VACANT')),
  created_at timestamptz not null default now(),

  -- One reservation per court/date/time — the app also double-checks this
  -- at save time, but the constraint is the real source of truth.
  constraint bookings_unique_slot unique (court_id, booking_date, time_slot)
);

create index if not exists bookings_date_idx on public.bookings (booking_date);

alter table public.bookings enable row level security;

-- DinkDesk has no authentication (single admin using the anon key).
-- This policy keeps the API usable out of the box; tighten it if you
-- ever add auth or expose the anon key beyond a trusted receptionist.
create policy "Allow all access to bookings"
  on public.bookings
  for all
  using (true)
  with check (true);
