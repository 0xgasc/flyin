-- Add missing metadata columns to destinations table
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS highlights TEXT[],
ADD COLUMN IF NOT EXISTS requirements TEXT[],
ADD COLUMN IF NOT EXISTS meeting_point TEXT,
ADD COLUMN IF NOT EXISTS best_time TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT;