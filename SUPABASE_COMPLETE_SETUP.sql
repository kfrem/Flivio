-- ================================================================
-- FLIVIO - SUPABASE DATABASE SETUP
-- ================================================================
-- This file contains the complete database schema for Restaurant-IQ
-- Run this in Supabase SQL Editor after creating your project
-- ================================================================

-- Create all tables
-- ================================================================

-- 1. RESTAURANTS TABLE
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"seating_capacity" integer NOT NULL,
	"avg_monthly_covers" integer NOT NULL
);

-- 2. USERS TABLE (for authentication)
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- 3. MONTHLY DATA TABLE (financial data)
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

-- 4. COST CATEGORIES TABLE (templates)
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

-- 5. RESTAURANT COST ITEMS TABLE (per-restaurant configuration)
CREATE TABLE "restaurant_cost_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"cost_category_id" integer NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"custom_label" text,
	"custom_percentage" real
);

-- 6. SUPPLIERS TABLE
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"contact_info" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

-- 7. INGREDIENTS TABLE
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

-- 8. SUPPLIER INGREDIENTS TABLE (links suppliers to ingredients)
CREATE TABLE "supplier_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"unit_price" real NOT NULL,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"lead_time_days" integer
);

-- 9. MENU ITEMS TABLE
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

-- 10. MENU ITEM INGREDIENTS TABLE (recipes)
CREATE TABLE "menu_item_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"menu_item_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL
);

-- 11. PROMOTIONS TABLE
CREATE TABLE "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"discount_percent" real NOT NULL,
	"menu_item_id" integer,
	"target_profit" real,
	"is_active" boolean DEFAULT true NOT NULL
);

-- ================================================================
-- ADD INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX idx_monthly_data_restaurant ON monthly_data(restaurant_id);
CREATE INDEX idx_monthly_data_year ON monthly_data(year);
CREATE INDEX idx_ingredients_restaurant ON ingredients(restaurant_id);
CREATE INDEX idx_suppliers_restaurant ON suppliers(restaurant_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_supplier_ingredients_supplier ON supplier_ingredients(supplier_id);
CREATE INDEX idx_supplier_ingredients_ingredient ON supplier_ingredients(ingredient_id);
CREATE INDEX idx_menu_item_ingredients_menu ON menu_item_ingredients(menu_item_id);
CREATE INDEX idx_menu_item_ingredients_ingredient ON menu_item_ingredients(ingredient_id);
CREATE INDEX idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX idx_restaurant_cost_items_restaurant ON restaurant_cost_items(restaurant_id);

-- ================================================================
-- ADD FOREIGN KEY CONSTRAINTS (Optional but recommended)
-- ================================================================

-- Monthly data -> restaurants
ALTER TABLE monthly_data 
ADD CONSTRAINT fk_monthly_data_restaurant 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- Ingredients -> restaurants
ALTER TABLE ingredients 
ADD CONSTRAINT fk_ingredients_restaurant 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- Suppliers -> restaurants
ALTER TABLE suppliers 
ADD CONSTRAINT fk_suppliers_restaurant 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- Menu items -> restaurants
ALTER TABLE menu_items 
ADD CONSTRAINT fk_menu_items_restaurant 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- Promotions -> restaurants
ALTER TABLE promotions 
ADD CONSTRAINT fk_promotions_restaurant 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- Restaurant cost items -> restaurants
ALTER TABLE restaurant_cost_items 
ADD CONSTRAINT fk_cost_items_restaurant 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- Restaurant cost items -> cost categories
ALTER TABLE restaurant_cost_items 
ADD CONSTRAINT fk_cost_items_category 
FOREIGN KEY (cost_category_id) REFERENCES cost_categories(id) ON DELETE CASCADE;

-- Supplier ingredients -> suppliers
ALTER TABLE supplier_ingredients 
ADD CONSTRAINT fk_supplier_ingredients_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;

-- Supplier ingredients -> ingredients
ALTER TABLE supplier_ingredients 
ADD CONSTRAINT fk_supplier_ingredients_ingredient 
FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

-- Menu item ingredients -> menu items
ALTER TABLE menu_item_ingredients 
ADD CONSTRAINT fk_menu_ingredients_menu 
FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE;

-- Menu item ingredients -> ingredients
ALTER TABLE menu_item_ingredients 
ADD CONSTRAINT fk_menu_ingredients_ingredient 
FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

-- ================================================================
-- SEED DEFAULT COST CATEGORIES
-- ================================================================

INSERT INTO cost_categories (name, key, description, default_percentage, icon, process_stage, classification, is_default, sort_order)
VALUES
('Food & Ingredients', 'foodCost', 'Raw ingredients, beverages, and consumables', 30, 'ShoppingCart', 'procurement', 'direct', true, 1),
('Labour', 'labourCost', 'Staff wages, benefits, and payroll taxes', 28, 'Users', 'preparation', 'direct', true, 2),
('Energy & Utilities', 'energyCost', 'Gas, electric, water, and waste disposal', 7, 'Zap', 'cooking', 'indirect', true, 3),
('Rent & Rates', 'rentCost', 'Property lease, business rates, insurance', 8, 'Building2', 'fixed', 'overhead', true, 4),
('Marketing', 'marketingCost', 'Advertising, social media, promotions', 4, 'Megaphone', 'aftersales', 'overhead', true, 5),
('Supplies & Equipment', 'suppliesCost', 'Cleaning, tableware, disposables, small equipment', 3, 'Package', 'storage', 'indirect', true, 6),
('Technology', 'technologyCost', 'POS system, booking software, WiFi', 1, 'Monitor', 'service', 'overhead', true, 7),
('Food Waste', 'wasteCost', 'Spoilage, over-production, plate waste', 3, 'Trash2', 'waste', 'indirect', true, 8),
('Packaging & Delivery', 'deliveryCost', 'Takeaway containers, delivery platform fees', 2, 'Truck', 'service', 'direct', true, 9),
('Training & Development', 'trainingCost', 'Staff training, certification, development', 1, 'GraduationCap', 'preparation', 'overhead', true, 10),
('Maintenance & Repairs', 'maintenanceCost', 'Equipment servicing, building maintenance', 2, 'Wrench', 'fixed', 'indirect', true, 11),
('Licenses & Compliance', 'licenseCost', 'Alcohol license, food hygiene, permits', 1, 'Shield', 'fixed', 'overhead', true, 12);

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Run these after executing the script to verify setup:

-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check cost categories were seeded
SELECT COUNT(*) as cost_category_count FROM cost_categories;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- ================================================================
-- SETUP COMPLETE!
-- ================================================================
-- Next steps:
-- 1. Update your .env file with the Supabase connection string
-- 2. Test the connection: npm run check
-- 3. Start your app: npm run dev
-- ================================================================
