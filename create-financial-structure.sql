-- Financial Structure for FlyInGuate
-- Properly separating client funds from business revenue and tracking operational costs

-- 1. Create operational costs table for tracking expenses
CREATE TABLE IF NOT EXISTS operational_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Cost details
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  pilot_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Cost type and category
  cost_type VARCHAR(50) NOT NULL CHECK (cost_type IN (
    'fuel', 'gas', 'maintenance', 'landing_fees', 
    'pilot_expense', 'insurance', 'other'
  )),
  
  -- Financial details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Documentation
  description TEXT,
  receipt_url TEXT,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'reimbursed'
  )),
  
  -- Approval workflow
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  admin_notes TEXT
);

-- 2. Create business revenue tracking table
CREATE TABLE IF NOT EXISTS business_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Revenue source
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Revenue type
  revenue_type VARCHAR(50) NOT NULL CHECK (revenue_type IN (
    'service_fee', 'cancellation_fee', 'change_fee', 
    'platform_fee', 'other'
  )),
  
  -- Financial details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'earned', 'refunded'
  )),
  
  -- Description
  description TEXT
);

-- 3. Add service fee configuration table
CREATE TABLE IF NOT EXISTS service_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Fee configuration
  fee_type VARCHAR(50) NOT NULL CHECK (fee_type IN (
    'transport_percentage', 'experience_percentage', 
    'cancellation_flat', 'change_flat', 'platform_flat'
  )),
  
  -- Fee structure
  percentage DECIMAL(5, 2), -- For percentage-based fees
  flat_amount DECIMAL(10, 2), -- For flat fees
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Conditions
  min_amount DECIMAL(10, 2),
  max_amount DECIMAL(10, 2),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Description
  description TEXT
);

-- 4. Insert default service fee structure
INSERT INTO service_fees (fee_type, percentage, description, is_active) VALUES
('transport_percentage', 10.00, 'Service fee for transport bookings', true),
('experience_percentage', 15.00, 'Service fee for experience bookings', true),
('cancellation_flat', 25.00, 'Cancellation fee', true),
('change_flat', 15.00, 'Booking change fee', true)
ON CONFLICT DO NOTHING;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_operational_costs_booking_id ON operational_costs(booking_id);
CREATE INDEX IF NOT EXISTS idx_operational_costs_pilot_id ON operational_costs(pilot_id);
CREATE INDEX IF NOT EXISTS idx_operational_costs_status ON operational_costs(status);
CREATE INDEX IF NOT EXISTS idx_operational_costs_cost_type ON operational_costs(cost_type);

CREATE INDEX IF NOT EXISTS idx_business_revenue_booking_id ON business_revenue(booking_id);
CREATE INDEX IF NOT EXISTS idx_business_revenue_status ON business_revenue(status);
CREATE INDEX IF NOT EXISTS idx_business_revenue_revenue_type ON business_revenue(revenue_type);

-- 6. Create RLS policies
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fees ENABLE ROW LEVEL SECURITY;

-- Pilots can insert their own costs and view their own
CREATE POLICY "Pilots can manage their costs" ON operational_costs
FOR ALL USING (
  pilot_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can view all financial data
CREATE POLICY "Admins can view all revenue" ON business_revenue
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage service fees" ON service_fees
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. Create functions to automatically generate revenue records
CREATE OR REPLACE FUNCTION generate_revenue_on_booking_completion()
RETURNS TRIGGER AS $$
DECLARE
  service_fee_percentage DECIMAL(5,2);
  service_amount DECIMAL(10,2);
BEGIN
  -- Only generate revenue when booking is completed and paid
  IF NEW.status = 'completed' AND NEW.payment_status = 'paid' 
     AND (OLD.status != 'completed' OR OLD.payment_status != 'paid') THEN
    
    -- Get the appropriate service fee percentage
    SELECT percentage INTO service_fee_percentage
    FROM service_fees 
    WHERE fee_type = CASE 
      WHEN NEW.booking_type = 'transport' THEN 'transport_percentage'
      WHEN NEW.booking_type = 'experience' THEN 'experience_percentage'
      ELSE 'transport_percentage'
    END
    AND is_active = true
    LIMIT 1;
    
    -- Calculate service amount
    service_amount := NEW.total_price * (COALESCE(service_fee_percentage, 10.00) / 100);
    
    -- Insert revenue record
    INSERT INTO business_revenue (
      booking_id, 
      revenue_type, 
      amount, 
      status, 
      description
    ) VALUES (
      NEW.id,
      'service_fee',
      service_amount,
      'earned',
      'Service fee from completed booking'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_revenue ON bookings;
CREATE TRIGGER trigger_generate_revenue
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_revenue_on_booking_completion();

-- 8. Create view for financial summary
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
  -- Client trust funds (account balances)
  (SELECT COALESCE(SUM(account_balance), 0) FROM profiles WHERE account_balance > 0) as client_trust_funds,
  
  -- Business revenue
  (SELECT COALESCE(SUM(amount), 0) FROM business_revenue WHERE status = 'earned') as total_business_revenue,
  
  -- Pending revenue
  (SELECT COALESCE(SUM(br.amount), 0) 
   FROM business_revenue br 
   JOIN bookings b ON br.booking_id = b.id 
   WHERE br.status = 'pending' AND b.status IN ('approved', 'assigned')
  ) as pending_revenue,
  
  -- Operational costs
  (SELECT COALESCE(SUM(amount), 0) FROM operational_costs WHERE status IN ('approved', 'reimbursed')) as total_operational_costs,
  
  -- Net revenue
  (SELECT COALESCE(SUM(amount), 0) FROM business_revenue WHERE status = 'earned') - 
  (SELECT COALESCE(SUM(amount), 0) FROM operational_costs WHERE status IN ('approved', 'reimbursed')) as net_revenue;

COMMENT ON TABLE operational_costs IS 'Tracks all operational expenses including fuel, pilot costs, maintenance, etc.';
COMMENT ON TABLE business_revenue IS 'Tracks actual business revenue from service fees, separate from client account balances';
COMMENT ON TABLE service_fees IS 'Configuration for different types of service fees';
COMMENT ON VIEW financial_summary IS 'Provides a clear separation of client trust funds vs business financials';