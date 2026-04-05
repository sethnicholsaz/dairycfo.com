-- Time series futures closes for all tracked commodities
-- One row per date per commodity, contracts stored as jsonb array
-- [{symbol: "LEM26", close: 246.325, position: 0}, ...]

CREATE TABLE IF NOT EXISTS commodity_closes (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  price_date   date    NOT NULL,
  commodity    text    NOT NULL,  -- class_iii, class_iv, corn, live_cattle, feeder_cattle, etc.
  contracts    jsonb   NOT NULL,  -- [{symbol, close, position}]
  created_at   timestamptz DEFAULT now(),
  UNIQUE (price_date, commodity)
);

CREATE INDEX IF NOT EXISTS commodity_closes_lookup
  ON commodity_closes (commodity, price_date DESC);
