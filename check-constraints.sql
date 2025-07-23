-- Check what constraints exist on the transactions table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'transactions' 
    AND tc.table_schema = 'public';

-- Check existing payment methods in the database
SELECT DISTINCT payment_method 
FROM transactions 
WHERE payment_method IS NOT NULL;

-- Try to see what payment methods are allowed by testing a simple insert
-- (This will fail but show us the constraint error)
-- INSERT INTO transactions (user_id, type, amount, payment_method, status, reference)
-- VALUES ('c9f85b91-c5ad-4dba-aeaa-6e9b80d2133b', 'deposit', 100, 'test_invalid', 'pending', 'test');