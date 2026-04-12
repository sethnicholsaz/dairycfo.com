-- Add broadcast_id to newsletters for linking Resend webhook events
alter table newsletters add column if not exists broadcast_id text;
create index if not exists idx_newsletters_broadcast_id on newsletters(broadcast_id);

-- Newsletter analytics: open and click events from Resend webhooks
create table if not exists newsletter_analytics (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references newsletters(id) on delete cascade,
  event_type text not null check (event_type in ('email.opened', 'email.clicked')),
  email text not null,
  timestamp timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_newsletter_analytics_newsletter_id on newsletter_analytics(newsletter_id);
create index if not exists idx_newsletter_analytics_event_type on newsletter_analytics(newsletter_id, event_type);

-- Deduplicate: one open/click event per email per newsletter
-- (Resend may fire multiple times; we upsert on conflict)
create unique index if not exists idx_newsletter_analytics_dedup
  on newsletter_analytics(newsletter_id, event_type, email);

alter table newsletter_analytics enable row level security;
-- Service role has full access via RLS bypass
