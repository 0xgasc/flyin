-- Check if helicopters exist in the database
SELECT * FROM helicopters;

-- If empty, check if the table exists
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'helicopters'
ORDER BY ordinal_position;

-- Count helicopters
SELECT COUNT(*) as helicopter_count FROM helicopters;