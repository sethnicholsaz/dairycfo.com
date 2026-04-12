-- Remove paid subscription model — newsletter is sponsorship-only going forward

DROP TABLE IF EXISTS subscriptions;

ALTER TABLE subscribers
  DROP COLUMN IF EXISTS stripe_customer_id;
