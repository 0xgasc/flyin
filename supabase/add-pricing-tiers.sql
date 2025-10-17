-- Add pricing_tiers column to experiences table
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS pricing_tiers JSONB DEFAULT '[]'::jsonb;

-- Add pricing_tiers column to destinations table (for future use)
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS pricing_tiers JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN experiences.pricing_tiers IS 'Array of pricing tier objects with min_passengers, max_passengers, and price fields';
COMMENT ON COLUMN destinations.pricing_tiers IS 'Array of pricing tier objects with min_passengers, max_passengers, and price fields';
