-- Inventory Adjustments Table for tracking stock changes, losses, and damages
-- Run this in your Supabase SQL Editor

-- Create inventory adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('restock', 'loss', 'damage', 'return', 'correction', 'expired')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_user_id ON inventory_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON inventory_adjustments(adjustment_type);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC);

-- Row Level Security
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view inventory adjustments
CREATE POLICY "Authenticated users can view inventory adjustments" ON inventory_adjustments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can create inventory adjustments
CREATE POLICY "Authenticated users can create inventory adjustments" ON inventory_adjustments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to automatically create inventory adjustment when stock changes
CREATE OR REPLACE FUNCTION log_inventory_adjustment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if stock changed
  IF NEW.stock != OLD.stock THEN
    INSERT INTO inventory_adjustments (
      product_id,
      user_id,
      adjustment_type,
      quantity,
      previous_stock,
      new_stock,
      reason
    ) VALUES (
      NEW.id,
      auth.uid(),
      CASE 
        WHEN NEW.stock > OLD.stock THEN 'restock'
        WHEN NEW.stock < OLD.stock THEN 'correction'
      END,
      NEW.stock - OLD.stock,
      OLD.stock,
      NEW.stock,
      'Automatic adjustment'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log stock changes (optional - comment out if you don't want automatic logging)
-- DROP TRIGGER IF EXISTS on_product_stock_change ON products;
-- CREATE TRIGGER on_product_stock_change
--   AFTER UPDATE ON products
--   FOR EACH ROW
--   WHEN (OLD.stock IS DISTINCT FROM NEW.stock)
--   EXECUTE FUNCTION log_inventory_adjustment();

-- Grant permissions
GRANT ALL ON inventory_adjustments TO authenticated;

-- Insert sample adjustment data (optional for testing)
-- Note: This will only work after you have products and users in the database

