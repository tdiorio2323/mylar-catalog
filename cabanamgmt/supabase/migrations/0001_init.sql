-- =============================
-- Cabana Management Group DB
-- =============================

-- Drop existing tables if re-running migration
drop table if exists bookings cascade;
drop table if exists users cascade;

-- Enum for statuses
create type verification_status as enum ('pending', 'verified', 'failed');
create type screening_status as enum ('pending', 'clear', 'flagged');
create type deposit_status as enum ('pending', 'paid', 'failed', 'refunded');
create type interview_status as enum ('pending', 'scheduled', 'completed', 'failed');

-- =============================
-- Users Table
-- =============================
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  dob date,
  license_id text,
  selfie_url text,
  verification_status verification_status default 'pending',
  screening_status screening_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_users_email on users(email);
create index idx_users_verification on users(verification_status);
create index idx_users_screening on users(screening_status);

-- =============================
-- Bookings Table
-- =============================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  slot timestamptz,
  deposit_status deposit_status default 'pending',
  interview_status interview_status default 'pending',
  nda_signed boolean default false,
  payment_intent_id text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_bookings_user on bookings(user_id);
create index idx_bookings_slot on bookings(slot);
create index idx_bookings_deposit on bookings(deposit_status);

-- =============================
-- Triggers
-- =============================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_users_updated_at
before update on users
for each row
execute function update_updated_at_column();

create trigger set_bookings_updated_at
before update on bookings
for each row
execute function update_updated_at_column();

-- =============================
-- Sample seed (optional, dev only)
-- =============================
-- insert into users (full_name, email, phone)
-- values ('Test User', 'test@example.com', '+15555550123');

-- insert into bookings (user_id, slot)
-- values ((select id from users limit 1), now() + interval '1 day');
