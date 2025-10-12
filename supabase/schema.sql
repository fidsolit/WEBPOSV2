-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10, 2) DEFAULT 0 CHECK (cost >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  customer_name TEXT,
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10, 2) DEFAULT 0 CHECK (tax >= 0),
  discount DECIMAL(10, 2) DEFAULT 0 CHECK (discount >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital_wallet')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup (inactive by default for approval)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_active)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate sale number
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  sale_count INTEGER;
  sale_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO sale_count FROM sales WHERE DATE(created_at) = CURRENT_DATE;
  sale_number := 'SALE-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(sale_count::TEXT, 4, '0');
  RETURN sale_number;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Sales policies
CREATE POLICY "Users can view their own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create sales" ON sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

-- Sale items policies
CREATE POLICY "Users can view sale items for their sales" ON sale_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (sales.user_id = auth.uid() OR auth.role() = 'authenticated')
    )
  );

CREATE POLICY "Users can insert sale items" ON sale_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Grains & Rice', 'Rice and grain products'),
  ('Cooking Essentials', 'Basic cooking ingredients'),
  ('Condiments', 'Sauces and seasonings'),
  ('Instant Food', 'Ready-to-cook food items'),
  ('Canned Goods', 'Canned food products'),
  ('Dairy & Eggs', 'Dairy products and eggs'),
  ('Bakery', 'Bread and baked goods'),
  ('Beverages', 'Drinks and beverages'),
  ('Household', 'Cleaning and household items'),
  ('Personal Care', 'Personal hygiene products')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample data (optional) - Grocery items with Prices in Philippine Peso
INSERT INTO products (name, description, price, cost, stock, sku, barcode, category_id) 
SELECT 
  p.name, p.description, p.price, p.cost, p.stock, p.sku, p.barcode, c.id
FROM (VALUES
  ('Rice 1kg', 'Premium white rice', 55.00, 40.00, 200, 'GROC-RICE-001', '4800016123456', 'Grains & Rice'),
  ('Cooking Oil 1L', 'Vegetable cooking oil', 85.00, 65.00, 150, 'GROC-OIL-001', '4800016234567', 'Cooking Essentials'),
  ('Sugar 1kg', 'Refined white sugar', 65.00, 50.00, 180, 'GROC-SUGAR-001', '4800016345678', 'Cooking Essentials'),
  ('Salt 1kg', 'Iodized table salt', 25.00, 18.00, 200, 'GROC-SALT-001', '4800016456789', 'Cooking Essentials'),
  ('Soy Sauce 385ml', 'All-purpose soy sauce', 35.00, 25.00, 120, 'GROC-SOY-001', '4800016567890', 'Condiments'),
  ('Vinegar 385ml', 'White vinegar', 28.00, 20.00, 130, 'GROC-VIN-001', '4800016678901', 'Condiments'),
  ('Instant Noodles', 'Chicken flavor instant noodles', 15.00, 10.00, 300, 'GROC-NOOD-001', '4800016644689', 'Instant Food'),
  ('Canned Sardines', 'Sardines in tomato sauce', 45.00, 35.00, 150, 'GROC-SARD-001', '4800016789012', 'Canned Goods'),
  ('Canned Corned Beef', 'Premium corned beef', 85.00, 65.00, 100, 'GROC-CORN-001', '4800016890123', 'Canned Goods'),
  ('Eggs 12pcs', 'Large fresh eggs', 95.00, 75.00, 80, 'GROC-EGG-001', '4800016901234', 'Dairy & Eggs'),
  ('Fresh Milk 1L', 'Full cream fresh milk', 120.00, 95.00, 60, 'GROC-MILK-001', '4800016012345', 'Dairy & Eggs'),
  ('Bread Loaf', 'Sliced white bread', 55.00, 40.00, 100, 'GROC-BREAD-001', '4800017123456', 'Bakery'),
  ('Coffee 3-in-1 10pcs', 'Instant coffee mix', 65.00, 48.00, 150, 'GROC-COFFEE-001', '4800017234567', 'Beverages'),
  ('Bottled Water 1L', 'Purified drinking water', 20.00, 12.00, 200, 'GROC-WATER-001', '4800017345678', 'Beverages'),
  ('Soft Drink 1.5L', 'Carbonated soft drink', 65.00, 48.00, 120, 'GROC-SODA-001', '4800017456789', 'Beverages'),
  ('Detergent Powder 1kg', 'Laundry detergent powder', 145.00, 110.00, 90, 'GROC-DET-001', '4800017567890', 'Household'),
  ('Dish Soap 250ml', 'Dishwashing liquid', 45.00, 32.00, 120, 'GROC-SOAP-001', '4800017678901', 'Household'),
  ('Toilet Paper 12 rolls', 'Soft toilet tissue', 125.00, 95.00, 70, 'GROC-TP-001', '4800017789012', 'Household'),
  ('Shampoo Sachet', 'Hair shampoo 10ml', 8.00, 5.00, 500, 'GROC-SHAM-001', '4800017890123', 'Personal Care'),
  ('Bar Soap', 'Antibacterial bar soap', 35.00, 25.00, 150, 'GROC-BSOAP-001', '4800017901234', 'Personal Care')
) AS p(name, description, price, cost, stock, sku, barcode, category_name)
LEFT JOIN categories c ON c.name = p.category_name
ON CONFLICT (sku) DO NOTHING;

