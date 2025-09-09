-- Add order_index column to experiences table for drag and drop ordering
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Set initial order_index values based on existing order
WITH numbered_experiences AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 as row_num
  FROM experiences
)
UPDATE experiences 
SET order_index = numbered_experiences.row_num
FROM numbered_experiences
WHERE experiences.id = numbered_experiences.id;

-- Add order_index column to destinations table as well
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Set initial order_index values for destinations
WITH numbered_destinations AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 as row_num
  FROM destinations
)
UPDATE destinations 
SET order_index = numbered_destinations.row_num
FROM numbered_destinations
WHERE destinations.id = numbered_destinations.id;