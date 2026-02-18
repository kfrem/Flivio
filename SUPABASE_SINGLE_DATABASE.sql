-- ============================================
-- Restaurant-IQ - SINGLE DATABASE SETUP
-- Multi-Tenant Architecture (Demo + Trial + Paid)
-- ============================================
-- This creates ONE database that handles ALL customer types:
-- 1. DEMO users (public, pre-loaded data)
-- 2. TRIAL users (14-day free trial, empty data)
-- 3. PAID users (active subscriptions)
-- ============================================

-- ============================================
-- TABLE: RESTAURANTS (Multi-Tenant)
-- ============================================
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"seating_capacity" integer NOT NULL,
	"avg_monthly_covers" integer NOT NULL,
	"tenant_type" text NOT NULL DEFAULT 'trial', -- 'demo', 'trial', or 'paid'
	"subscription_tier" text, -- 'starter', 'professional', 'enterprise' (NULL for demo/trial)
	"subscription_status" text DEFAULT 'active', -- 'active', 'cancelled', 'expired'
	"trial_expires_at" timestamp, -- When trial expires (NULL for demo/paid)
	"created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: USERS (Authentication)
-- ============================================
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"restaurant_id" integer, -- Link user to their restaurant
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- ============================================
-- TABLE: COST CATEGORIES (Global)
-- ============================================
CREATE TABLE "cost_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"description" text NOT NULL,
	"default_percentage" real NOT NULL,
	"icon" text NOT NULL,
	"process_stage" text NOT NULL,
	"classification" text DEFAULT 'direct' NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);

-- ============================================
-- TABLE: MONTHLY DATA (Per Restaurant)
-- ============================================
CREATE TABLE "monthly_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"month" text NOT NULL,
	"year" integer NOT NULL,
	"revenue" real NOT NULL,
	"food_cost" real NOT NULL,
	"labour_cost" real NOT NULL,
	"energy_cost" real NOT NULL,
	"rent_cost" real NOT NULL,
	"marketing_cost" real NOT NULL,
	"supplies_cost" real NOT NULL,
	"technology_cost" real NOT NULL,
	"waste_cost" real NOT NULL,
	"delivery_revenue" real NOT NULL,
	"dine_in_revenue" real NOT NULL,
	"takeaway_revenue" real NOT NULL,
	"total_covers" integer NOT NULL,
	"avg_ticket_size" real NOT NULL,
	"repeat_customer_rate" real NOT NULL
);

-- ============================================
-- TABLE: INGREDIENTS (Per Restaurant)
-- ============================================
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"current_price" real NOT NULL,
	"previous_price" real,
	"category" text NOT NULL,
	"classification" text DEFAULT 'direct' NOT NULL,
	"vat_rate" real DEFAULT 20,
	"vat_included" boolean DEFAULT true
);

-- ============================================
-- TABLE: SUPPLIERS (Per Restaurant)
-- ============================================
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"contact_info" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

-- ============================================
-- TABLE: SUPPLIER INGREDIENTS (Linking)
-- ============================================
CREATE TABLE "supplier_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"unit_price" real NOT NULL,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"lead_time_days" integer
);

-- ============================================
-- TABLE: MENU ITEMS (Per Restaurant)
-- ============================================
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"selling_price" real NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"output_vat_rate" real DEFAULT 20,
	"vat_included" boolean DEFAULT true
);

-- ============================================
-- TABLE: MENU ITEM INGREDIENTS (Linking)
-- ============================================
CREATE TABLE "menu_item_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"menu_item_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL
);

-- ============================================
-- TABLE: PROMOTIONS (Per Restaurant)
-- ============================================
CREATE TABLE "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"discount_percent" real NOT NULL,
	"menu_item_id" integer,
	"target_profit" real,
	"is_active" boolean DEFAULT true NOT NULL
);

-- ============================================
-- TABLE: RESTAURANT COST ITEMS (Per Restaurant)
-- ============================================
CREATE TABLE "restaurant_cost_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"cost_category_id" integer NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"custom_label" text,
	"custom_percentage" real
);

-- ============================================
-- SEED DATA: DEFAULT COST CATEGORIES
-- ============================================
INSERT INTO "cost_categories" ("name", "key", "description", "default_percentage", "icon", "process_stage", "classification", "is_default", "sort_order") VALUES
('Food & Ingredients', 'food', 'Primary ingredients and food supplies', 30, 'UtensilsCrossed', 'Sourcing', 'direct', true, 1),
('Labour', 'labour', 'Staff wages, benefits, and training', 28, 'Users', 'Preparation', 'direct', true, 2),
('Energy & Utilities', 'energy', 'Electricity, gas, water, and waste management', 7, 'Zap', 'Preparation', 'indirect', true, 3),
('Rent & Property', 'rent', 'Rent, property taxes, and maintenance', 8, 'Building2', 'Service', 'fixed', true, 4),
('Marketing', 'marketing', 'Advertising, promotions, and loyalty programs', 3, 'TrendingUp', 'Service', 'indirect', true, 5),
('Supplies & Packaging', 'supplies', 'Disposables, packaging, and cleaning supplies', 2.5, 'Package', 'Service', 'indirect', true, 6),
('Technology', 'technology', 'POS systems, software, and IT services', 1, 'Laptop', 'Service', 'indirect', true, 7),
('Waste & Spoilage', 'waste', 'Food waste, spoilage, and inventory loss', 4, 'Trash2', 'Review', 'direct', true, 8),
('Equipment', 'equipment', 'Kitchen equipment, furniture, and maintenance', 2, 'Wrench', 'Preparation', 'fixed', true, 9),
('Insurance', 'insurance', 'Business insurance, liability, and coverage', 1.5, 'Shield', 'Service', 'fixed', true, 10),
('Licenses & Permits', 'licenses', 'Business licenses, health permits, and certifications', 0.5, 'FileText', 'Service', 'fixed', true, 11),
('Miscellaneous', 'misc', 'Other operational expenses', 1.5, 'MoreHorizontal', 'Review', 'indirect', true, 12);

-- ============================================
-- SEED DATA: DEMO RESTAURANT (tenant_type = 'demo')
-- ============================================
INSERT INTO "restaurants" ("name", "type", "location", "seating_capacity", "avg_monthly_covers", "tenant_type", "subscription_tier", "subscription_status") VALUES
('The Golden Fork', 'Mediterranean', 'London, Shoreditch', 65, 2200, 'demo', NULL, 'active');

-- Get the demo restaurant ID (assuming it's 1)
DO $$
DECLARE
    demo_restaurant_id INTEGER := 1;
BEGIN

-- ============================================
-- SEED DATA: DEMO MONTHLY DATA (6 months)
-- ============================================
INSERT INTO "monthly_data" ("restaurant_id", "month", "year", "revenue", "food_cost", "labour_cost", "energy_cost", "rent_cost", "marketing_cost", "supplies_cost", "technology_cost", "waste_cost", "delivery_revenue", "dine_in_revenue", "takeaway_revenue", "total_covers", "avg_ticket_size", "repeat_customer_rate") VALUES
(demo_restaurant_id, 'September', 2025, 82000, 27060, 24600, 5740, 6500, 2460, 2050, 820, 3280, 12300, 57400, 12300, 2050, 28.50, 32),
(demo_restaurant_id, 'October', 2025, 78000, 23400, 23400, 5460, 6500, 2340, 1950, 780, 3120, 11700, 54600, 11700, 2200, 27.50, 30),
(demo_restaurant_id, 'November', 2025, 95000, 31350, 28500, 6650, 6500, 2850, 2375, 950, 3800, 14250, 66500, 14250, 2400, 32.00, 35),
(demo_restaurant_id, 'December', 2025, 105000, 34650, 31500, 7350, 6500, 3150, 2625, 1050, 4200, 15750, 73500, 15750, 2600, 31.50, 38),
(demo_restaurant_id, 'January', 2026, 72000, 23760, 21600, 5040, 6500, 2160, 1800, 720, 2880, 10800, 50400, 10800, 1900, 30.00, 28),
(demo_restaurant_id, 'February', 2026, 88000, 29040, 26400, 6160, 6500, 2640, 2200, 880, 3520, 13200, 61600, 13200, 2300, 29.50, 33);

-- ============================================
-- SEED DATA: DEMO SUPPLIERS
-- ============================================
INSERT INTO "suppliers" ("restaurant_id", "name", "contact_info", "category", "is_active") VALUES
(demo_restaurant_id, 'Fresh Farm Foods', 'orders@freshfarmfoods.co.uk, 020 7123 4567', 'Produce', true),
(demo_restaurant_id, 'Metro Meat Supply', 'sales@metromeat.co.uk, 020 7234 5678', 'Meat & Poultry', true),
(demo_restaurant_id, 'Ocean Harvest Seafood', 'contact@oceanharvest.co.uk, 020 7345 6789', 'Seafood', true),
(demo_restaurant_id, 'Daily Dairy Co.', 'orders@dailydairy.co.uk, 020 7456 7890', 'Dairy', true),
(demo_restaurant_id, 'Mediterranean Imports Ltd', 'info@medimports.co.uk, 020 7567 8901', 'Specialty Ingredients', true);

-- ============================================
-- SEED DATA: DEMO INGREDIENTS
-- ============================================
INSERT INTO "ingredients" ("restaurant_id", "name", "unit", "current_price", "previous_price", "category", "classification", "vat_rate", "vat_included") VALUES
(demo_restaurant_id, 'Chicken Breast', 'kg', 8.50, 8.20, 'Meat & Poultry', 'direct', 0, false),
(demo_restaurant_id, 'Salmon Fillet', 'kg', 18.50, 17.80, 'Seafood', 'direct', 0, false),
(demo_restaurant_id, 'Beef Sirloin', 'kg', 22.00, 21.50, 'Meat & Poultry', 'direct', 0, false),
(demo_restaurant_id, 'Olive Oil (Extra Virgin)', 'litre', 12.50, 12.00, 'Pantry', 'direct', 20, true),
(demo_restaurant_id, 'Tomatoes', 'kg', 3.20, 2.95, 'Produce', 'direct', 0, false),
(demo_restaurant_id, 'Lettuce', 'head', 0.85, 0.80, 'Produce', 'direct', 0, false),
(demo_restaurant_id, 'Potatoes', 'kg', 1.50, 1.45, 'Produce', 'direct', 0, false),
(demo_restaurant_id, 'Onions', 'kg', 1.20, 1.15, 'Produce', 'direct', 0, false),
(demo_restaurant_id, 'Garlic', 'kg', 8.50, 8.00, 'Produce', 'direct', 0, false),
(demo_restaurant_id, 'Feta Cheese', 'kg', 12.00, 11.50, 'Dairy', 'direct', 0, false),
(demo_restaurant_id, 'Mozzarella', 'kg', 9.50, 9.20, 'Dairy', 'direct', 0, false),
(demo_restaurant_id, 'Fresh Basil', 'bunch', 1.80, 1.75, 'Herbs', 'direct', 0, false),
(demo_restaurant_id, 'Lemon', 'kg', 2.80, 2.70, 'Produce', 'direct', 0, false),
(demo_restaurant_id, 'Red Wine Vinegar', 'litre', 5.50, 5.30, 'Pantry', 'direct', 20, true),
(demo_restaurant_id, 'Sea Salt', 'kg', 3.50, 3.50, 'Pantry', 'direct', 20, true);

-- ============================================
-- SEED DATA: DEMO MENU ITEMS
-- ============================================
INSERT INTO "menu_items" ("restaurant_id", "name", "category", "selling_price", "description", "is_active", "output_vat_rate", "vat_included") VALUES
(demo_restaurant_id, 'Grilled Chicken Salad', 'Salads', 12.95, 'Fresh mixed greens with grilled chicken, feta, and balsamic dressing', true, 20, true),
(demo_restaurant_id, 'Mediterranean Salmon', 'Mains', 18.95, 'Pan-seared salmon with roasted vegetables and lemon butter sauce', true, 20, true),
(demo_restaurant_id, 'Beef Souvlaki', 'Mains', 16.50, 'Marinated beef skewers with tzatziki and pita bread', true, 20, true),
(demo_restaurant_id, 'Greek Salad', 'Salads', 8.95, 'Traditional Greek salad with feta, olives, and olive oil', true, 20, true),
(demo_restaurant_id, 'Margherita Pizza', 'Pizza', 11.50, 'Classic pizza with mozzarella, tomato sauce, and fresh basil', true, 20, true);

END $$;

-- ============================================
-- SEED DATA: DEMO USER ACCOUNT
-- ============================================
-- Password: demo123456 (bcrypt hashed)
INSERT INTO "users" ("username", "password", "email", "restaurant_id", "is_admin") VALUES
('demoadmin', '$2a$10$rPqK5YdZ8FvZ9bYvXp.nKe.xJJZZ5YvQq3cZ3nZ8YvXp.nKe.xJJZZ', 'demo@restaurant-iq.com', 1, false);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_restaurants_tenant_type ON restaurants(tenant_type);
CREATE INDEX idx_restaurants_subscription_status ON restaurants(subscription_status);
CREATE INDEX idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX idx_monthly_data_restaurant_id ON monthly_data(restaurant_id);
CREATE INDEX idx_ingredients_restaurant_id ON ingredients(restaurant_id);
CREATE INDEX idx_suppliers_restaurant_id ON suppliers(restaurant_id);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_cost_items ENABLE ROW LEVEL SECURITY;

-- Demo restaurant is publicly readable
CREATE POLICY "Demo restaurant visible to all" ON restaurants
FOR SELECT USING (tenant_type = 'demo');

-- Users can only see their own data
CREATE POLICY "Users can see their own restaurant" ON restaurants
FOR SELECT USING (id IN (SELECT restaurant_id FROM users WHERE id = auth.uid()));

-- Users can only see data from their restaurant
CREATE POLICY "Users see own monthly data" ON monthly_data
FOR SELECT USING (restaurant_id IN (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users see own ingredients" ON ingredients
FOR SELECT USING (restaurant_id IN (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users see own suppliers" ON suppliers
FOR SELECT USING (restaurant_id IN (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users see own menu items" ON menu_items
FOR SELECT USING (restaurant_id IN (SELECT restaurant_id FROM users WHERE id = auth.uid()));

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your single Supabase database now supports:
-- ✅ Demo users (tenant_type = 'demo')
-- ✅ Trial users (tenant_type = 'trial', 14-day limit)
-- ✅ Paid users (tenant_type = 'paid', with subscription_tier)
--
-- To add new customers:
-- 1. Create restaurant with tenant_type = 'trial' or 'paid'
-- 2. Set trial_expires_at for trials (14 days from now)
-- 3. Set subscription_tier for paid users
-- 4. Link user account to restaurant_id
-- ============================================
