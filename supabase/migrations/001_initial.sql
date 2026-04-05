-- DairyCFO Newsletter Platform
-- Initial schema

-- Enable pgcrypto for gen_random_bytes
create extension if not exists pgcrypto;

-- Subscribers
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz,
  unsubscribe_token text unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  created_at timestamptz default now()
);

-- Newsletters
create table if not exists newsletters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  issue_number integer,
  mdx_content text not null default '',
  published_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Market data snapshots
create table if not exists market_data (
  id uuid primary key default gen_random_uuid(),
  data_date date not null unique,
  -- Announced prices (from USDA AMS)
  class_iii_price numeric(8,4),
  class_iv_price numeric(8,4),
  butter_price numeric(8,4),
  cheese_blocks_price numeric(8,4),
  cheese_barrels_price numeric(8,4),
  nfdm_price numeric(8,4),
  -- Futures (from Barchart Excel upload)
  class_iii_futures jsonb,  -- [{month: "2026-05", price: 18.50}, ...]
  class_iv_futures jsonb,
  corn_futures jsonb,
  -- Metadata
  source text default 'usda_ams',
  notes text,
  created_at timestamptz default now()
);

-- Sponsors
create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text,
  contact_email text not null,
  website text,
  artwork_url text,
  artwork_filename text,
  desired_newsletter text,  -- free text: "next issue", "April 2026", etc.
  message text,
  status text not null default 'pending',  -- pending, approved, rejected, paid
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  paid_amount_cents integer,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Sponsor placements (which sponsor goes in which newsletter)
create table if not exists sponsor_placements (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references newsletters(id) on delete cascade,
  sponsor_id uuid not null references sponsors(id) on delete cascade,
  position text not null default 'body',  -- header, body, footer
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Admin users (simple: just check email against this table)
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_newsletters_published_at on newsletters(published_at desc);
create index if not exists idx_newsletters_slug on newsletters(slug);
create index if not exists idx_market_data_date on market_data(data_date desc);
create index if not exists idx_sponsors_status on sponsors(status);
create index if not exists idx_sponsor_placements_newsletter on sponsor_placements(newsletter_id);

-- RLS (Row Level Security)
alter table subscribers enable row level security;
alter table newsletters enable row level security;
alter table market_data enable row level security;
alter table sponsors enable row level security;
alter table sponsor_placements enable row level security;
alter table admins enable row level security;

-- Public can read published newsletters (access controlled at app layer via cookie)
create policy "Published newsletters are readable" on newsletters
  for select using (published_at is not null and published_at <= now());

-- Public can read market data
create policy "Market data is public" on market_data
  for select using (true);

-- Service role has full access (used for server-side operations)
-- No additional policies needed — service role bypasses RLS

-- Function to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger newsletters_updated_at
  before update on newsletters
  for each row execute function update_updated_at();
