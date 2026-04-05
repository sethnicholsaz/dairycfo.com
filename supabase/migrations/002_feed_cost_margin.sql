-- Add DMC feed cost inputs and calculated margin to market_data
-- DMC formula: Feed Cost = 60 lbs corn + 27.4 lbs alfalfa + 14.7 lbs soybean meal per cwt milk

ALTER TABLE market_data
  ADD COLUMN IF NOT EXISTS corn_price numeric(8,4),          -- $/bushel (USDA AMS report 3618)
  ADD COLUMN IF NOT EXISTS alfalfa_price numeric(8,2),       -- $/ton    (USDA AMS report 2807, Iowa)
  ADD COLUMN IF NOT EXISTS soybean_meal_price numeric(8,2),  -- $/ton    (USDA AMS report 3618, Illinois)
  ADD COLUMN IF NOT EXISTS feed_cost_per_cwt numeric(8,4),   -- $/cwt milk (calculated)
  ADD COLUMN IF NOT EXISTS dairy_margin numeric(8,4);        -- $/cwt (class_iii_price - feed_cost_per_cwt)
