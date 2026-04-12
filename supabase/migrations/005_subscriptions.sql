-- Paid subscription tiers: Pro ($19/mo or $180/yr) and Team ($49/mo)

-- Add Stripe customer ID to subscribers
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id         uuid NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id    text,
  plan                  text NOT NULL DEFAULT 'free',   -- free | pro | team
  billing_interval      text,                           -- month | year
  status                text NOT NULL DEFAULT 'active', -- active | canceled | past_due | trialing | incomplete
  current_period_end    timestamptz,
  cancel_at_period_end  boolean DEFAULT false,
  canceled_at           timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_subscriber_active
  ON subscriptions(subscriber_id)
  WHERE status IN ('active', 'trialing');

CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer
  ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role has full access (bypasses RLS)

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
