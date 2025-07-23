-- Create a function to safely add to user balance
CREATE OR REPLACE FUNCTION add_to_balance(user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET account_balance = COALESCE(account_balance, 0) + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION add_to_balance(UUID, DECIMAL) TO authenticated;